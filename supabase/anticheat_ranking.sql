-- ============================================================
-- Idler: kontrola zapisu po stronie serwera + ranking
-- Uruchom PO schema.sql i cloud_saves.sql:
--   SQL Editor → New query → wklej całość → Run.
-- Skrypt można uruchomić ponownie bez szkody (nie nadpisuje Twoich zmian w limitach).
--
-- Jak to działa:
--  * Gra wysyła zapis przez funkcję idler_submit_save. Bezpośredni zapis do tabeli jest zamknięty.
--  * Funkcja odrzuca zapisy o błędnej strukturze, a przy podejrzanym postępie
--    (za dużo EXP, zabójstw lub bossów w krótkim czasie) ZAPISUJE dane, ale oznacza
--    gracza flagą. Oznaczeni gracze nie trafiają do rankingu. Nikt nie traci postępu.
--  * Ranking liczy wartości wyciągnięte przez serwer z zapisu, a nie zgłoszone przez grę.
-- ============================================================

-- ---------- Limity (możesz je zmieniać zwykłym UPDATE, patrz docs) ----------

create table if not exists public.idler_limits (
  key text primary key,
  value numeric not null,
  note text
);

alter table public.idler_limits enable row level security;
-- Brak polityk: tabelę czyta tylko funkcja serwera, gracze jej nie widzą.

insert into public.idler_limits (key, value, note) values
  ('max_exp_per_second', 150000, 'Najwięcej EXP na sekundę (zapas ponad realne maksimum w grze)'),
  ('exp_burst', 20000000, 'Jednorazowy zapas EXP (nagrody, zadania, lochy)'),
  ('max_kills_per_second', 1.5, 'Najwięcej zabitych potworów na sekundę'),
  ('kills_burst', 500, 'Jednorazowy zapas zabójstw'),
  ('max_boss_kills_per_second', 0.25, 'Najwięcej pokonanych bossów na sekundę'),
  ('boss_kills_burst', 20, 'Jednorazowy zapas bossów'),
  ('grace_seconds', 30, 'Dodatkowe sekundy doliczane do czasu między zapisami'),
  ('max_exp_per_kill', 150000, 'Największy EXP za jednego potwora (kontrola pierwszego zapisu)'),
  ('first_submit_exp_slack', 50000000, 'Zapas EXP przy pierwszym zapisie konta'),
  ('max_gold_per_second', 500000, 'Najwięcej przyrostu złota na sekundę (zabójstwa, sprzedaż, nagrody)'),
  ('gold_burst', 1000000000, 'Jednorazowy zapas złota (np. sprzedaż całego plecaka)'),
  ('first_submit_gold_max', 5000000000, 'Najwięcej złota przy pierwszym zapisie konta')
on conflict (key) do nothing;

-- ---------- Statystyki gracza wyciągnięte przez serwer z zapisu ----------

create table if not exists public.player_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  level integer not null default 1,
  exp numeric not null default 0,
  total_exp numeric not null default 0,
  total_kills bigint not null default 0,
  boss_kills bigint not null default 0,
  elite_kills bigint not null default 0,
  achievement_points integer not null default 0,
  gold numeric not null default 0,
  flagged boolean not null default false,
  flag_reason text,
  flagged_at timestamptz,
  checked_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.player_stats add column if not exists gold numeric not null default 0;
alter table public.player_stats enable row level security;

drop policy if exists "Własne statystyki: odczyt" on public.player_stats;
create policy "Własne statystyki: odczyt"
  on public.player_stats for select
  using (auth.uid() = user_id);

-- ---------- Zamknięcie bezpośredniego zapisu do cloud_saves ----------

drop policy if exists "Własny zapis: dodawanie" on public.cloud_saves;
drop policy if exists "Własny zapis: zmiana" on public.cloud_saves;
drop policy if exists "Własny zapis: usuwanie" on public.cloud_saves;

-- ---------- Pomocnicze ----------

create or replace function public.idler_num(j jsonb)
returns numeric
language sql
immutable
as $$
  select case when jsonb_typeof(j) = 'number' then (j #>> '{}')::numeric else null end;
$$;

-- Port krzywej EXP z gry (getExpToNextLevel w js/player.js). Jeśli zmienisz krzywą
-- w grze, zmień ją też tutaj.
create or replace function public.idler_exp_to_next(p_level integer)
returns numeric
language sql
immutable
as $$
  select floor(
    (
      120
      + idx * 80
      + power(idx, 1.55) * 35
      + power(greatest(0, idx - 20), 2) * 15
    )
    * (1 + greatest(0, lvl - 10) * 0.25)
    * (1 + 5.5 * power(least(1, idx / 99), 1.5))
  )::numeric
  from (
    select greatest(1, p_level)::double precision as lvl,
           (greatest(1, p_level) - 1)::double precision as idx
  ) q;
$$;

create or replace function public.idler_total_exp(p_level integer, p_exp numeric)
returns numeric
language plpgsql
immutable
as $$
declare
  total numeric := 0;
  i integer;
begin
  for i in 1 .. greatest(p_level, 1) - 1 loop
    total := total + public.idler_exp_to_next(i);
  end loop;

  return total + greatest(p_exp, 0);
end;
$$;

create or replace function public.idler_limit(p_key text)
returns numeric
language sql
stable
set search_path = public
as $$
  select value from public.idler_limits where key = p_key;
$$;

-- ---------- Wysyłka zapisu ----------

create or replace function public.idler_submit_save(
  p_save jsonb,
  p_expected_revision integer default null,
  p_force boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_player jsonb;
  v_level numeric;
  v_exp numeric;
  v_gold numeric;
  v_time numeric;
  v_total_kills numeric := 0;
  v_boss_kills numeric := 0;
  v_elite_kills numeric := 0;
  v_points numeric := 0;
  v_total_exp numeric;
  v_row public.cloud_saves%rowtype;
  v_save_exists boolean;
  v_prev public.player_stats%rowtype;
  v_has_prev boolean;
  v_elapsed numeric;
  v_window numeric;
  v_reasons text[] := '{}';
  v_flagged boolean;
  v_reason text;
  v_revision integer;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  -- 1. Struktura zapisu (błąd = odrzucenie, nic nie jest zapisywane).
  if p_save is null
     or jsonb_typeof(p_save) <> 'object'
     or jsonb_typeof(p_save -> 'player') <> 'object' then
    return jsonb_build_object('ok', false, 'error', 'invalid_save',
                              'message', 'Zapis nie zawiera danych postaci.');
  end if;

  if length(p_save::text) > 6000000 then
    return jsonb_build_object('ok', false, 'error', 'invalid_save',
                              'message', 'Zapis jest zbyt duży.');
  end if;

  v_player := p_save -> 'player';
  v_level := public.idler_num(v_player -> 'level');
  v_exp := public.idler_num(v_player -> 'exp');
  v_gold := public.idler_num(v_player -> 'gold');
  v_time := coalesce(public.idler_num(p_save -> 'time'), 0);

  if v_level is null or v_level < 1 or v_level > 5000 or v_level <> floor(v_level)
     or v_exp is null or v_exp < 0
     or v_gold is null or v_gold < 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_save',
                              'message', 'Zapis zawiera niepoprawne wartości (poziom, EXP lub złoto).');
  end if;

  if jsonb_typeof(v_player -> 'locationProgress') = 'object' then
    select
      coalesce(sum(greatest(coalesce(public.idler_num(t.v -> 'totalKills'), 0), 0)), 0),
      coalesce(sum(greatest(coalesce(public.idler_num(t.v -> 'bossKills'), 0), 0)), 0),
      coalesce(sum(greatest(coalesce(public.idler_num(t.v -> 'eliteKills'), 0), 0)), 0)
    into v_total_kills, v_boss_kills, v_elite_kills
    from jsonb_each(v_player -> 'locationProgress') as t(k, v)
    where jsonb_typeof(t.v) = 'object';
  end if;

  if jsonb_typeof(v_player -> 'journal') = 'object' then
    v_points := greatest(coalesce(
      public.idler_num(v_player -> 'journal' -> 'totalAchievementPoints'), 0), 0);
  end if;

  v_total_exp := public.idler_total_exp(v_level::integer, v_exp);

  -- 2. Wersja zapisu (konflikty między urządzeniami).
  select * into v_row from public.cloud_saves where user_id = v_uid for update;
  v_save_exists := found;

  if not v_save_exists then
    if p_expected_revision is not null and not p_force then
      return jsonb_build_object('ok', false, 'error', 'conflict', 'revision', null);
    end if;
  elsif not p_force
        and (p_expected_revision is null or p_expected_revision <> v_row.revision) then
    return jsonb_build_object('ok', false, 'error', 'conflict', 'revision', v_row.revision);
  end if;

  -- 3. Wiarygodność postępu (podejrzenie = flaga, zapis i tak zostaje zapisany).
  select * into v_prev from public.player_stats where user_id = v_uid;
  v_has_prev := found;

  if v_has_prev then
    v_elapsed := greatest(extract(epoch from (now() - v_prev.checked_at)), 0);
    v_window := v_elapsed + coalesce(public.idler_limit('grace_seconds'), 30);

    -- Spadek wartości oznacza reset postaci lub inny zapis: to nie jest oszustwo.
    if v_total_exp - v_prev.total_exp >
       coalesce(public.idler_limit('max_exp_per_second'), 150000) * v_window
       + coalesce(public.idler_limit('exp_burst'), 20000000) then
      v_reasons := array_append(v_reasons, 'exp_za_szybko'::text);
    end if;

    if v_total_kills - v_prev.total_kills >
       coalesce(public.idler_limit('max_kills_per_second'), 1.5) * v_window
       + coalesce(public.idler_limit('kills_burst'), 500) then
      v_reasons := array_append(v_reasons, 'zabojstwa_za_szybko'::text);
    end if;

    if v_boss_kills - v_prev.boss_kills >
       coalesce(public.idler_limit('max_boss_kills_per_second'), 0.25) * v_window
       + coalesce(public.idler_limit('boss_kills_burst'), 20) then
      v_reasons := array_append(v_reasons, 'bossowie_za_szybko'::text);
    end if;

    -- Złoto może spadać (wydatki, reset), liczy się tylko nierealny przyrost.
    if v_gold - v_prev.gold >
       coalesce(public.idler_limit('max_gold_per_second'), 500000) * v_window
       + coalesce(public.idler_limit('gold_burst'), 1000000000) then
      v_reasons := array_append(v_reasons, 'zloto_za_szybko'::text);
    end if;
  else
    -- Pierwszy zapis konta: EXP musi mieć pokrycie w zabójstwach.
    if v_total_exp >
       coalesce(public.idler_limit('max_exp_per_kill'), 150000) * (v_total_kills + v_boss_kills) * 3
       + coalesce(public.idler_limit('first_submit_exp_slack'), 50000000) then
      v_reasons := array_append(v_reasons, 'exp_bez_pokrycia_w_zabojstwach'::text);
    end if;

    if v_gold > coalesce(public.idler_limit('first_submit_gold_max'), 5000000000) then
      v_reasons := array_append(v_reasons, 'zloto_bez_pokrycia'::text);
    end if;
  end if;

  v_flagged := coalesce(v_prev.flagged, false) or array_length(v_reasons, 1) is not null;

  if array_length(v_reasons, 1) is not null then
    v_reason := array_to_string(v_reasons, ', ');
  else
    v_reason := v_prev.flag_reason;
  end if;

  -- 4. Zapis.
  if not v_save_exists then
    v_revision := 1;
    insert into public.cloud_saves (user_id, save_data, level, saved_time, revision)
    values (v_uid, p_save::text, v_level::integer, v_time::bigint, 1);
  else
    v_revision := v_row.revision + 1;
    update public.cloud_saves
       set save_data = p_save::text,
           level = v_level::integer,
           saved_time = v_time::bigint,
           revision = v_revision
     where user_id = v_uid;
  end if;

  insert into public.player_stats as s (
    user_id, level, exp, total_exp, total_kills, boss_kills, elite_kills,
    achievement_points, gold, flagged, flag_reason, flagged_at, checked_at, updated_at
  ) values (
    v_uid, v_level::integer, v_exp, v_total_exp, v_total_kills::bigint,
    v_boss_kills::bigint, v_elite_kills::bigint, v_points::integer,
    v_gold,
    v_flagged, v_reason,
    case when v_flagged then now() else null end,
    now(), now()
  )
  on conflict (user_id) do update set
    level = excluded.level,
    exp = excluded.exp,
    total_exp = excluded.total_exp,
    total_kills = excluded.total_kills,
    boss_kills = excluded.boss_kills,
    elite_kills = excluded.elite_kills,
    achievement_points = excluded.achievement_points,
    gold = excluded.gold,
    flagged = excluded.flagged,
    flag_reason = excluded.flag_reason,
    flagged_at = case
      when excluded.flagged and not s.flagged then now()
      when excluded.flagged then s.flagged_at
      else null end,
    checked_at = now(),
    updated_at = now();

  return jsonb_build_object(
    'ok', true,
    'revision', v_revision,
    'flagged', v_flagged,
    'flag_reason', v_reason
  );
end;
$$;

revoke all on function public.idler_submit_save(jsonb, integer, boolean) from public, anon;
grant execute on function public.idler_submit_save(jsonb, integer, boolean) to authenticated;

-- ---------- Ranking ----------
-- Dostępne wskaźniki: 'level' (poziom), 'bosses' (pokonani bossowie), 'kills' (zabite potwory).

-- drop: jeśli wcześniej uruchomiono avatars.sql, zmienia się lista zwracanych kolumn
-- (po ponownym uruchomieniu tego pliku uruchom avatars.sql jeszcze raz).
drop function if exists public.idler_get_ranking(text, integer);

create or replace function public.idler_get_ranking(p_metric text, p_limit integer default 50)
returns table (rank bigint, username text, value numeric, level integer, is_me boolean)
language sql
security definer
stable
set search_path = public
as $$
  select ranked.rank, ranked.username, ranked.value, ranked.level, ranked.is_me
  from (
    select
      row_number() over (order by m.v desc, s.total_exp desc, s.updated_at asc) as rank,
      coalesce(p.username, 'gracz') as username,
      m.v as value,
      s.level as level,
      (s.user_id = auth.uid()) as is_me
    from public.player_stats s
    left join public.player_profiles p on p.id = s.user_id
    cross join lateral (
      select case p_metric
        when 'level' then s.level::numeric
        when 'bosses' then s.boss_kills::numeric
        when 'kills' then s.total_kills::numeric
      end as v
    ) m
    where not s.flagged and m.v is not null and auth.uid() is not null
  ) ranked
  order by ranked.rank
  limit least(greatest(p_limit, 1), 100);
$$;

-- Pozycja i stan weryfikacji zalogowanego gracza.
create or replace function public.idler_my_rank(p_metric text)
returns table (rank bigint, value numeric, flagged boolean, flag_reason text, total_players bigint)
language sql
security definer
stable
set search_path = public
as $$
  with me as (
    select s.*,
      case p_metric
        when 'level' then s.level::numeric
        when 'bosses' then s.boss_kills::numeric
        when 'kills' then s.total_kills::numeric
      end as v
    from public.player_stats s
    where s.user_id = auth.uid()
  )
  select
    case when me.flagged then null else 1 + (
      select count(*) from public.player_stats o
      where not o.flagged and (
        case p_metric
          when 'level' then o.level::numeric
          when 'bosses' then o.boss_kills::numeric
          when 'kills' then o.total_kills::numeric
        end,
        o.total_exp
      ) > (me.v, me.total_exp)
    ) end,
    me.v,
    me.flagged,
    me.flag_reason,
    (select count(*) from public.player_stats o where not o.flagged)
  from me;
$$;

revoke all on function public.idler_get_ranking(text, integer) from public, anon;
revoke all on function public.idler_my_rank(text) from public, anon;
grant execute on function public.idler_get_ranking(text, integer) to authenticated;
grant execute on function public.idler_my_rank(text) to authenticated;

-- Publiczny profil gracza (tylko bezpieczny podzbiór zapisu: klasa i założony sprzęt).
create or replace function public.idler_get_profile(p_username text)
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_uid uuid;
  v_name text;
  v_stats public.player_stats%rowtype;
  v_save text;
  v_player jsonb;
  v_equipment jsonb := '{}'::jsonb;
  v_slot text;
  v_val jsonb;
  v_class text;
begin
  if auth.uid() is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select p.id, p.username into v_uid, v_name
  from public.player_profiles p
  where lower(p.username) = lower(trim(coalesce(p_username, '')));

  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select * into v_stats from public.player_stats where user_id = v_uid;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_data');
  end if;

  begin
    select save_data into v_save from public.cloud_saves where user_id = v_uid;
    v_player := case when v_save like '{%' then (v_save::jsonb) -> 'player' else null end;
  exception when others then
    v_player := null;
  end;

  if jsonb_typeof(v_player) = 'object' then
    if jsonb_typeof(v_player -> 'classId') = 'string' then
      v_class := left(v_player ->> 'classId', 30);
    end if;

    if jsonb_typeof(v_player -> 'equipment') = 'object' then
      foreach v_slot in array array['weapon','shield','helmet','armor','pants','boots','gloves','ring','amulet','talisman']
      loop
        v_val := v_player -> 'equipment' -> v_slot;

        if jsonb_typeof(v_val) = 'string' and length(v_val #>> '{}') <= 80 then
          v_equipment := v_equipment || jsonb_build_object(v_slot, v_val);
        end if;
      end loop;
    end if;
  end if;

  return jsonb_build_object(
    'ok', true,
    'username', v_name,
    'level', v_stats.level,
    'class_id', v_class,
    'equipment', v_equipment,
    'total_kills', v_stats.total_kills,
    'boss_kills', v_stats.boss_kills,
    'elite_kills', v_stats.elite_kills,
    'achievement_points', v_stats.achievement_points,
    'flagged', v_stats.flagged,
    'is_me', v_uid = auth.uid()
  );
end;
$$;

revoke all on function public.idler_get_profile(text) from public, anon;
grant execute on function public.idler_get_profile(text) to authenticated;
