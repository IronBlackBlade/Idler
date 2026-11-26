-- ============================================================
-- Idler: WSZYSTKIE skrypty SQL w jednym pliku (do nowego projektu Supabase).
-- Wygenerowane przez: node tools/buildAllSql.js (nie edytuj ręcznie).
-- Wklej całość w SQL Editor i kliknij Run. Można uruchomić ponownie.
-- Kolejność: schema, cloud_saves, anticheat_ranking, chat, avatars, bug_reports, forum, admin, dm, dm_reports, login_by_username.
-- ============================================================


-- >>>>>>>>>> schema.sql <<<<<<<<<<

-- ============================================================
-- Idler: konta graczy (Supabase)
-- Wklej całość w Supabase → SQL Editor → New query → Run.
-- Skrypt można uruchomić ponownie bez szkody.
-- ============================================================

-- Publiczny profil gracza (osobna tabela player_profiles, żeby nie kolidować z ewentualną
-- istniejącą tabelą "profiles" w projekcie). Hasła i e-maile trzyma Supabase Auth (tabela auth.users),
-- tutaj trafia tylko nazwa gracza.
create table if not exists public.player_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint player_profiles_username_format check (username ~ '^[A-Za-z0-9_-]{3,20}$')
);

-- Nazwa unikalna bez względu na wielkość liter ("Maciek" i "maciek" to ta sama nazwa).
create unique index if not exists player_profiles_username_lower_idx
  on public.player_profiles (lower(username));

-- Zabezpieczenia na poziomie wierszy: bez nich każdy mógłby edytować cudze profile.
alter table public.player_profiles enable row level security;

-- Profile są publiczne (przydadzą się w rankingu), ale tylko do odczytu.
drop policy if exists "Profile są publiczne do odczytu" on public.player_profiles;
create policy "Profile są publiczne do odczytu"
  on public.player_profiles for select
  using (true);

-- Celowo brak polityk insert / update / delete: gracz nie może sam wstawiać ani zmieniać
-- profilu. Profil tworzy wyłącznie wyzwalacz poniżej przy rejestracji.

-- Wyzwalacz: po utworzeniu konta powstaje profil z nazwą podaną w formularzu.
create or replace function public.idler_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.player_profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'gracz_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

revoke execute on function public.idler_handle_new_user() from public, anon, authenticated;

drop trigger if exists idler_on_auth_user_created on auth.users;
create trigger idler_on_auth_user_created
  after insert on auth.users
  for each row execute function public.idler_handle_new_user();

-- Sprawdzenie dostępności nazwy jeszcze przed rejestracją (wywoływane z gry).
-- Zwraca tylko prawda/fałsz, nie ujawnia żadnych danych.
create or replace function public.idler_username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.player_profiles where lower(username) = lower(candidate)
  );
$$;

grant execute on function public.idler_username_available(text) to anon, authenticated;


-- >>>>>>>>>> cloud_saves.sql <<<<<<<<<<

-- ============================================================
-- Idler: zapis postaci w chmurze (Supabase)
-- Uruchom PO schema.sql: SQL Editor → New query → wklej → Run.
-- Skrypt można uruchomić ponownie bez szkody.
-- ============================================================

-- Jeden zapis na konto. Zapis gry jest przechowywany jako tekst (skompresowany przez grę).
create table if not exists public.cloud_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  save_data text not null check (length(save_data) <= 6000000),
  level integer not null default 1,
  -- Czas zapisu po stronie gry (Date.now() z pola "time" zapisu).
  saved_time bigint not null default 0,
  -- Numer wersji zapisu: rośnie przy każdej wysyłce. Dzięki niemu gra wykrywa,
  -- że zapis w chmurze zmienił się na innym urządzeniu (konflikt).
  revision integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.cloud_saves enable row level security;

-- Każdy gracz widzi WYŁĄCZNIE własny zapis.
drop policy if exists "Własny zapis: odczyt" on public.cloud_saves;
create policy "Własny zapis: odczyt"
  on public.cloud_saves for select
  using (auth.uid() = user_id);

-- Zapisywanie idzie wyłącznie przez funkcję idler_submit_save
-- (supabase/anticheat_ranking.sql), która sprawdza zapis. Gracz może go tylko czytać.
drop policy if exists "Własny zapis: dodawanie" on public.cloud_saves;
drop policy if exists "Własny zapis: zmiana" on public.cloud_saves;
drop policy if exists "Własny zapis: usuwanie" on public.cloud_saves;

-- Czas ostatniej zmiany ustawia serwer (nie można go sfałszować z gry).
create or replace function public.idler_touch_cloud_save()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists idler_cloud_saves_touch on public.cloud_saves;
create trigger idler_cloud_saves_touch
  before insert or update on public.cloud_saves
  for each row execute function public.idler_touch_cloud_save();


-- >>>>>>>>>> anticheat_ranking.sql <<<<<<<<<<

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

  -- Administrator jest nieruszalny: nigdy nie dostaje flagi (tabela idler_admins pochodzi z admin.sql).
  if to_regclass('public.idler_admins') is not null then
    if exists (select 1 from public.idler_admins where user_id = v_uid) then
      v_flagged := false;
      v_reason := null;
    end if;
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


-- >>>>>>>>>> chat.sql <<<<<<<<<<

-- ============================================================
-- Idler: czat globalny (Supabase)
-- Uruchom w SQL Editor PO schema.sql i anticheat_ranking.sql. Można uruchamiać ponownie.
--
-- Zasady:
--  * wiadomości wysyła się wyłącznie funkcją idler_chat_send (limity, wyciszenia),
--  * czytać mogą wszyscy zalogowani, nikt nie może pisać do tabeli bezpośrednio,
--  * konta oznaczone flagą (podejrzany postęp) i wyciszone nie mogą pisać,
--  * gracze mogą zgłaszać wiadomości, zgłoszenia czyta administrator w SQL,
--  * wiadomości starsze niż 7 dni są usuwane.
-- ============================================================

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  username text not null,
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);

-- Poziom autora w chwili wysłania (uzupełniany po stronie serwera, patrz wyzwalacz niżej).
alter table public.chat_messages add column if not exists level integer;

create index if not exists chat_messages_created_idx on public.chat_messages (created_at desc);
create index if not exists chat_messages_user_idx on public.chat_messages (user_id, created_at desc);

create table if not exists public.chat_reports (
  id bigint generated always as identity primary key,
  message_id bigint not null,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reported_user_id uuid,
  reported_username text,
  reported_body text,
  reason text,
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id)
);

create table if not exists public.chat_mutes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  muted_until timestamptz not null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;
alter table public.chat_reports enable row level security;
alter table public.chat_mutes enable row level security;

drop policy if exists "Czat: odczyt dla zalogowanych" on public.chat_messages;
create policy "Czat: odczyt dla zalogowanych"
  on public.chat_messages for select to authenticated using (true);

-- Zgłoszenia i wyciszenia: brak polityk = tylko administrator (SQL Editor).

revoke insert, update, delete on public.chat_messages from anon, authenticated;
revoke all on public.chat_reports from anon, authenticated;
revoke all on public.chat_mutes from anon, authenticated;

-- Wiadomości na żywo (Realtime), jeśli publikacja istnieje.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
     ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;

-- Wiadomość dostaje poziom autora z ostatniego zweryfikowanego zapisu (player_stats).
create or replace function public.idler_chat_fill_level()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select level into new.level from public.player_stats where user_id = new.user_id;
  return new;
end;
$$;

revoke all on function public.idler_chat_fill_level() from public, anon, authenticated;

drop trigger if exists chat_messages_fill_level on public.chat_messages;
create trigger chat_messages_fill_level
  before insert on public.chat_messages
  for each row execute function public.idler_chat_fill_level();

-- ---------- Wysyłanie ----------
create or replace function public.idler_chat_send(p_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_body text;
  v_name text;
  v_recent integer;
  v_last timestamptz;
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select username into v_name from public.player_profiles where id = v_uid;

  if v_name is null then
    return jsonb_build_object('ok', false, 'error', 'no_profile', 'message', 'Brak profilu gracza.');
  end if;

  -- Usuń znaki sterujące, zbij białe znaki, przytnij.
  v_body := regexp_replace(coalesce(p_body, ''), '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g');
  v_body := btrim(regexp_replace(v_body, '\s+', ' ', 'g'));

  if char_length(v_body) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty', 'message', 'Wiadomość jest pusta.');
  end if;

  if char_length(v_body) > 300 then
    return jsonb_build_object('ok', false, 'error', 'too_long', 'message', 'Wiadomość jest za długa (maks. 300 znaków).');
  end if;

  if exists (select 1 from public.chat_mutes where user_id = v_uid and muted_until > now()) then
    return jsonb_build_object('ok', false, 'error', 'muted', 'message', 'Twoje konto jest wyciszone na czacie.');
  end if;

  if exists (select 1 from public.player_stats where user_id = v_uid and flagged) then
    return jsonb_build_object('ok', false, 'error', 'flagged', 'message', 'Twoje konto czeka na weryfikację, więc nie możesz pisać na czacie.');
  end if;

  select max(created_at), count(*) filter (where created_at > now() - interval '60 seconds')
    into v_last, v_recent
  from public.chat_messages
  where user_id = v_uid and created_at > now() - interval '60 seconds';

  if v_last is not null and v_last > now() - interval '1500 milliseconds' then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Pisz wolniej.');
  end if;

  if v_recent >= 12 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Za dużo wiadomości. Odczekaj chwilę.');
  end if;

  if exists (
    select 1 from public.chat_messages
    where user_id = v_uid and created_at > now() - interval '60 seconds' and lower(body) = lower(v_body)
  ) then
    return jsonb_build_object('ok', false, 'error', 'duplicate', 'message', 'Ta wiadomość już została wysłana.');
  end if;

  insert into public.chat_messages (user_id, username, body)
  values (v_uid, v_name, v_body)
  returning id into v_id;

  -- Sprzątanie starych wiadomości (tanie dzięki indeksowi).
  delete from public.chat_messages where created_at < now() - interval '7 days';

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

-- ---------- Zgłoszenia ----------
create or replace function public.idler_chat_report(p_message_id bigint, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_msg public.chat_messages%rowtype;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select * into v_msg from public.chat_messages where id = p_message_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie znaleziono wiadomości.');
  end if;

  if v_msg.user_id = v_uid then
    return jsonb_build_object('ok', false, 'error', 'own_message', 'message', 'Nie możesz zgłosić własnej wiadomości.');
  end if;

  if (select count(*) from public.chat_reports where reporter_id = v_uid and created_at > now() - interval '1 hour') >= 20 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Za dużo zgłoszeń. Spróbuj później.');
  end if;

  insert into public.chat_reports (message_id, reporter_id, reported_user_id, reported_username, reported_body, reason)
  values (v_msg.id, v_uid, v_msg.user_id, v_msg.username, v_msg.body, left(coalesce(p_reason, ''), 200))
  on conflict (message_id, reporter_id) do nothing;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.idler_chat_send(text) from public, anon;
revoke all on function public.idler_chat_report(bigint, text) from public, anon;
grant execute on function public.idler_chat_send(text) to authenticated;
grant execute on function public.idler_chat_report(bigint, text) to authenticated;


-- >>>>>>>>>> avatars.sql <<<<<<<<<<

-- =====================================================================
-- Avatary graczy: zapis wyboru, widoczność w rankingu, profilu i czacie.
-- Uruchom po schema.sql, anticheat_ranking.sql i chat.sql (można wielokrotnie).
-- Avatar to tylko kosmetyczny identyfikator (np. 'dragon'); gra pokazuje
-- nieznany identyfikator jako domyślnego żółwia.
-- =====================================================================

alter table public.player_profiles add column if not exists avatar_id text;

alter table public.player_profiles drop constraint if exists player_profiles_avatar_format;
alter table public.player_profiles
  add constraint player_profiles_avatar_format
  check (avatar_id is null or avatar_id ~ '^[a-z_]{1,24}$');

alter table public.chat_messages add column if not exists avatar_id text;

-- Gracz ustawia swój avatar (przez funkcję, bo bezpośredni zapis do profilu jest zamknięty).
create or replace function public.idler_set_avatar(p_avatar text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_avatar text := lower(btrim(coalesce(p_avatar, '')));
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  if v_avatar !~ '^[a-z_]{1,24}$' then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  update public.player_profiles set avatar_id = v_avatar where id = v_uid;

  return jsonb_build_object('ok', found, 'avatar_id', v_avatar);
end;
$$;

revoke all on function public.idler_set_avatar(text) from public, anon;
grant execute on function public.idler_set_avatar(text) to authenticated;

-- Wiadomość czatu dostaje avatar autora z jego profilu (po stronie serwera).
create or replace function public.idler_chat_fill_avatar()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select avatar_id into new.avatar_id from public.player_profiles where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists chat_messages_fill_avatar on public.chat_messages;
create trigger chat_messages_fill_avatar
  before insert on public.chat_messages
  for each row execute function public.idler_chat_fill_avatar();

-- Ranking: dodatkowa kolumna avatar_id (zmiana zwracanych kolumn wymaga drop).
drop function if exists public.idler_get_ranking(text, integer);

create or replace function public.idler_get_ranking(p_metric text, p_limit integer default 50)
returns table (rank bigint, username text, value numeric, level integer, is_me boolean, avatar_id text)
language sql
security definer
stable
set search_path = public
as $$
  select ranked.rank, ranked.username, ranked.value, ranked.level, ranked.is_me, ranked.avatar_id
  from (
    select
      row_number() over (order by m.v desc, s.total_exp desc, s.updated_at asc) as rank,
      coalesce(p.username, 'gracz') as username,
      m.v as value,
      s.level as level,
      (s.user_id = auth.uid()) as is_me,
      p.avatar_id as avatar_id
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

revoke all on function public.idler_get_ranking(text, integer) from public, anon;
grant execute on function public.idler_get_ranking(text, integer) to authenticated;

-- Profil gracza: dodatkowe pole avatar_id.
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
  v_avatar text;
begin
  if auth.uid() is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select p.id, p.username, p.avatar_id into v_uid, v_name, v_avatar
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
    'avatar_id', v_avatar,
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

revoke all on function public.idler_get_profile(text) from public, anon;
grant execute on function public.idler_get_profile(text) to authenticated;


-- >>>>>>>>>> bug_reports.sql <<<<<<<<<<

-- ============================================================
-- Idler: zgłaszanie błędów i pomysłów (Supabase)
-- Uruchom w SQL Editor PO schema.sql. Można uruchamiać ponownie.
--
-- Zasady:
--  * zgłoszenie wysyła się wyłącznie funkcją idler_submit_report (limity, czyszczenie tekstu),
--  * nikt nie czyta ani nie pisze do tabeli bezpośrednio; zgłoszenia czyta administrator
--    w Supabase: Table Editor -> bug_reports (albo SQL: select * from bug_reports order by id desc;),
--  * status zmieniasz ręcznie: new / seen / done / rejected.
-- ============================================================

create table if not exists public.bug_reports (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  username text,
  category text not null default 'bug' check (category in ('bug', 'idea', 'other')),
  body text not null check (char_length(body) between 10 and 1500),
  context jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'seen', 'done', 'rejected')),
  created_at timestamptz not null default now()
);

-- Zrzut ekranu: zmniejszony JPEG jako data URL (maks. ok. 400 KB), dołączany przez gracza.
alter table public.bug_reports add column if not exists screenshot text;

create index if not exists bug_reports_created_idx on public.bug_reports (created_at desc);
create index if not exists bug_reports_user_idx on public.bug_reports (user_id, created_at desc);

alter table public.bug_reports enable row level security;
revoke all on public.bug_reports from anon, authenticated;

drop function if exists public.idler_submit_report(text, text, jsonb);
create or replace function public.idler_submit_report(
  p_category text,
  p_body text,
  p_context jsonb default '{}'::jsonb,
  p_screenshot text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_body text;
  v_cat text := coalesce(p_category, 'bug');
  v_name text;
  v_ctx jsonb;
  v_shot text := nullif(p_screenshot, '');
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  if v_cat not in ('bug', 'idea', 'other') then
    v_cat := 'other';
  end if;

  -- Usuń znaki sterujące, przytnij (podziały linii zostają).
  v_body := regexp_replace(coalesce(p_body, ''), '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g');
  v_body := btrim(v_body);

  if char_length(v_body) < 10 then
    return jsonb_build_object('ok', false, 'error', 'too_short', 'message', 'Opisz problem trochę dokładniej (min. 10 znaków).');
  end if;

  if char_length(v_body) > 1500 then
    return jsonb_build_object('ok', false, 'error', 'too_long', 'message', 'Opis jest za długi (maks. 1500 znaków).');
  end if;

  if (select count(*) from public.bug_reports where user_id = v_uid and created_at > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Za dużo zgłoszeń. Spróbuj za godzinę.');
  end if;

  if (select count(*) from public.bug_reports where user_id = v_uid and created_at > now() - interval '24 hours') >= 15 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Dzienny limit zgłoszeń został wykorzystany.');
  end if;

  if exists (
    select 1 from public.bug_reports
    where user_id = v_uid and created_at > now() - interval '24 hours' and lower(body) = lower(v_body)
  ) then
    return jsonb_build_object('ok', false, 'error', 'duplicate', 'message', 'To zgłoszenie już zostało wysłane.');
  end if;

  if v_shot is not null then
    if char_length(v_shot) > 400000 then
      return jsonb_build_object('ok', false, 'error', 'shot_too_big', 'message', 'Zrzut ekranu jest za duży.');
    end if;

    if v_shot !~ '^data:image/jpeg;base64,[A-Za-z0-9+/=]+$' then
      return jsonb_build_object('ok', false, 'error', 'shot_invalid', 'message', 'Nieprawidłowy zrzut ekranu.');
    end if;

    if (select count(*) from public.bug_reports where user_id = v_uid and screenshot is not null and created_at > now() - interval '24 hours') >= 5 then
      return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Dzienny limit zrzutów ekranu został wykorzystany.');
    end if;
  end if;

  select username into v_name from public.player_profiles where id = v_uid;

  -- Kontekst techniczny: tylko niewielki obiekt (limit rozmiaru, bez treści spoza zakresu).
  v_ctx := case when jsonb_typeof(p_context) = 'object' then p_context else '{}'::jsonb end;
  if length(v_ctx::text) > 2000 then
    v_ctx := jsonb_build_object('truncated', true);
  end if;

  insert into public.bug_reports (user_id, username, category, body, context, screenshot)
  values (v_uid, v_name, v_cat, v_body, v_ctx, v_shot)
  returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

revoke all on function public.idler_submit_report(text, text, jsonb, text) from public, anon;
grant execute on function public.idler_submit_report(text, text, jsonb, text) to authenticated;


-- >>>>>>>>>> forum.sql <<<<<<<<<<

-- ============================================================
-- Idler: forum pomysłów (Supabase)
-- Uruchom w SQL Editor PO schema.sql, anticheat_ranking.sql i chat.sql. Można uruchamiać ponownie.
--
-- Zasady:
--  * wszystko przez funkcje idler_forum_* (limity, czyszczenie tekstu), tabele są zamknięte,
--  * czytać i głosować mogą wszyscy zalogowani, pisać konta niewyciszone i bez flagi,
--  * wyciszenia z czatu (chat_mutes) obowiązują też na forum,
--  * moderacja w Table Editor: forum_posts.status (open / planned / done / rejected),
--    forum_posts.admin_note (odpowiedź twórcy), forum_posts.hidden = true ukrywa wpis,
--    to samo hidden w forum_comments.
-- ============================================================

create table if not exists public.forum_posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  username text not null,
  title text not null check (char_length(title) between 4 and 80),
  body text not null check (char_length(body) between 10 and 1000),
  status text not null default 'open' check (status in ('open', 'planned', 'done', 'rejected')),
  admin_note text,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_votes (
  post_id bigint not null references public.forum_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Głos: 1 = kciuk w górę, -1 = kciuk w dół (kolumna dodawana też do istniejącej tabeli).
alter table public.forum_votes add column if not exists value smallint not null default 1;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'forum_votes_value_check') then
    alter table public.forum_votes add constraint forum_votes_value_check check (value in (1, -1));
  end if;
end $$;

create table if not exists public.forum_comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.forum_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  username text not null,
  body text not null check (char_length(body) between 1 and 400),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists forum_posts_created_idx on public.forum_posts (created_at desc);
create index if not exists forum_posts_user_idx on public.forum_posts (user_id, created_at desc);
create index if not exists forum_votes_user_idx on public.forum_votes (user_id, created_at desc);
create index if not exists forum_comments_post_idx on public.forum_comments (post_id, created_at);
create index if not exists forum_comments_user_idx on public.forum_comments (user_id, created_at desc);

alter table public.forum_posts enable row level security;
alter table public.forum_votes enable row level security;
alter table public.forum_comments enable row level security;
revoke all on public.forum_posts from anon, authenticated;
revoke all on public.forum_votes from anon, authenticated;
revoke all on public.forum_comments from anon, authenticated;

-- ---------- Lista ----------
drop function if exists public.idler_forum_list(text, text, integer, integer);
create or replace function public.idler_forum_list(
  p_sort text default 'top',
  p_status text default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_sort text := case when p_sort = 'new' then 'new' else 'top' end;
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_status text := nullif(p_status, '');
  v_rows jsonb;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  with base as (
    select p.*,
      (select count(*) from public.forum_votes v where v.post_id = p.id and v.value = 1)::integer as up,
      (select count(*) from public.forum_votes v where v.post_id = p.id and v.value = -1)::integer as down
    from public.forum_posts p
    where not p.hidden and (v_status is null or p.status = v_status)
  ),
  ranked as (
    select b.*,
      row_number() over (
        order by case when v_sort = 'top' then b.up - b.down end desc nulls last, b.created_at desc, b.id desc
      ) as rn
    from base b
  ),
  page as (
    select * from ranked order by rn limit v_limit offset v_offset
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', g.id,
    'username', g.username,
    'title', g.title,
    'body', g.body,
    'status', g.status,
    'admin_note', g.admin_note,
    'created_at', g.created_at,
    'up', g.up,
    'down', g.down,
    'comments', (select count(*) from public.forum_comments c where c.post_id = g.id and not c.hidden)::integer,
    'my_vote', coalesce((select v.value from public.forum_votes v where v.post_id = g.id and v.user_id = v_uid), 0),
    'mine', g.user_id = v_uid
  ) order by g.rn), '[]'::jsonb)
  into v_rows
  from page g;

  return jsonb_build_object('ok', true, 'posts', v_rows);
end;
$$;

-- ---------- Wpis z komentarzami ----------
create or replace function public.idler_forum_get(p_post_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_post jsonb;
  v_comments jsonb;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select jsonb_build_object(
    'id', p.id, 'username', p.username, 'title', p.title, 'body', p.body,
    'status', p.status, 'admin_note', p.admin_note, 'created_at', p.created_at,
    'up', (select count(*) from public.forum_votes v where v.post_id = p.id and v.value = 1)::integer,
    'down', (select count(*) from public.forum_votes v where v.post_id = p.id and v.value = -1)::integer,
    'my_vote', coalesce((select v.value from public.forum_votes v where v.post_id = p.id and v.user_id = v_uid), 0),
    'mine', p.user_id = v_uid
  )
  into v_post
  from public.forum_posts p
  where p.id = p_post_id and not p.hidden;

  if v_post is null then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie znaleziono wpisu.');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'username', c.username, 'body', c.body, 'created_at', c.created_at,
    'mine', c.user_id = v_uid
  ) order by c.created_at, c.id), '[]'::jsonb)
  into v_comments
  from (
    select * from public.forum_comments
    where post_id = p_post_id and not hidden
    order by created_at, id
    limit 200
  ) c;

  return jsonb_build_object('ok', true, 'post', v_post, 'comments', v_comments);
end;
$$;

-- ---------- Nowy wpis ----------
create or replace function public.idler_forum_create(p_title text, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
  v_title text;
  v_body text;
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select username into v_name from public.player_profiles where id = v_uid;
  if v_name is null then
    return jsonb_build_object('ok', false, 'error', 'no_profile', 'message', 'Brak profilu gracza.');
  end if;

  v_title := btrim(regexp_replace(regexp_replace(coalesce(p_title, ''), '[\x00-\x1F\x7F]', ' ', 'g'), '\s+', ' ', 'g'));
  v_body := btrim(regexp_replace(coalesce(p_body, ''), '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g'));

  if char_length(v_title) < 4 then
    return jsonb_build_object('ok', false, 'error', 'title_short', 'message', 'Tytuł jest za krótki (min. 4 znaki).');
  end if;
  if char_length(v_title) > 80 then
    return jsonb_build_object('ok', false, 'error', 'title_long', 'message', 'Tytuł jest za długi (maks. 80 znaków).');
  end if;
  if char_length(v_body) < 10 then
    return jsonb_build_object('ok', false, 'error', 'too_short', 'message', 'Opis jest za krótki (min. 10 znaków).');
  end if;
  if char_length(v_body) > 1000 then
    return jsonb_build_object('ok', false, 'error', 'too_long', 'message', 'Opis jest za długi (maks. 1000 znaków).');
  end if;

  if exists (select 1 from public.chat_mutes where user_id = v_uid and muted_until > now()) then
    return jsonb_build_object('ok', false, 'error', 'muted', 'message', 'Twoje konto jest wyciszone.');
  end if;
  if exists (select 1 from public.player_stats where user_id = v_uid and flagged) then
    return jsonb_build_object('ok', false, 'error', 'flagged', 'message', 'Twoje konto czeka na weryfikację, więc nie możesz pisać na forum.');
  end if;

  if (select count(*) from public.forum_posts where user_id = v_uid and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.forum_posts where user_id = v_uid and created_at > now() - interval '24 hours') >= 10 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Za dużo nowych wpisów. Spróbuj później.');
  end if;

  if exists (
    select 1 from public.forum_posts
    where user_id = v_uid and created_at > now() - interval '24 hours' and lower(title) = lower(v_title)
  ) then
    return jsonb_build_object('ok', false, 'error', 'duplicate', 'message', 'Taki wpis już dodałeś.');
  end if;

  insert into public.forum_posts (user_id, username, title, body)
  values (v_uid, v_name, v_title, v_body)
  returning id into v_id;

  -- Autor automatycznie popiera własny pomysł.
  insert into public.forum_votes (post_id, user_id, value) values (v_id, v_uid, 1);

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

-- ---------- Głos (kciuk w górę / w dół) ----------
-- Ten sam głos ponownie = cofnięcie, przeciwny głos = zmiana.
drop function if exists public.idler_forum_vote(bigint);
create or replace function public.idler_forum_vote(p_post_id bigint, p_value integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_old smallint;
  v_my integer;
  v_up integer;
  v_down integer;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  if p_value is null or p_value not in (1, -1) then
    return jsonb_build_object('ok', false, 'error', 'bad_value', 'message', 'Nieprawidłowy głos.');
  end if;

  if not exists (select 1 from public.forum_posts where id = p_post_id and not hidden) then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie znaleziono wpisu.');
  end if;

  if (select count(*) from public.forum_votes where user_id = v_uid and created_at > now() - interval '1 hour') >= 60 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Za dużo głosów. Spróbuj później.');
  end if;

  select value into v_old from public.forum_votes where post_id = p_post_id and user_id = v_uid;

  if v_old is not null and v_old = p_value then
    delete from public.forum_votes where post_id = p_post_id and user_id = v_uid;
    v_my := 0;
  else
    insert into public.forum_votes (post_id, user_id, value)
    values (p_post_id, v_uid, p_value)
    on conflict (post_id, user_id) do update set value = excluded.value, created_at = now();
    v_my := p_value;
  end if;

  select count(*) filter (where value = 1)::integer, count(*) filter (where value = -1)::integer
    into v_up, v_down
  from public.forum_votes where post_id = p_post_id;

  return jsonb_build_object('ok', true, 'my_vote', v_my, 'up', v_up, 'down', v_down);
end;
$$;

-- ---------- Komentarz ----------
create or replace function public.idler_forum_comment(p_post_id bigint, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
  v_body text;
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select username into v_name from public.player_profiles where id = v_uid;
  if v_name is null then
    return jsonb_build_object('ok', false, 'error', 'no_profile', 'message', 'Brak profilu gracza.');
  end if;

  if not exists (select 1 from public.forum_posts where id = p_post_id and not hidden) then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie znaleziono wpisu.');
  end if;

  v_body := btrim(regexp_replace(regexp_replace(coalesce(p_body, ''), '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g'), '\s+', ' ', 'g'));

  if char_length(v_body) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty', 'message', 'Komentarz jest pusty.');
  end if;
  if char_length(v_body) > 400 then
    return jsonb_build_object('ok', false, 'error', 'too_long', 'message', 'Komentarz jest za długi (maks. 400 znaków).');
  end if;

  if exists (select 1 from public.chat_mutes where user_id = v_uid and muted_until > now()) then
    return jsonb_build_object('ok', false, 'error', 'muted', 'message', 'Twoje konto jest wyciszone.');
  end if;
  if exists (select 1 from public.player_stats where user_id = v_uid and flagged) then
    return jsonb_build_object('ok', false, 'error', 'flagged', 'message', 'Twoje konto czeka na weryfikację, więc nie możesz pisać na forum.');
  end if;

  if (select count(*) from public.forum_comments where user_id = v_uid and created_at > now() - interval '1 hour') >= 15 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Za dużo komentarzy. Odczekaj chwilę.');
  end if;

  if exists (
    select 1 from public.forum_comments
    where user_id = v_uid and post_id = p_post_id and created_at > now() - interval '10 minutes' and lower(body) = lower(v_body)
  ) then
    return jsonb_build_object('ok', false, 'error', 'duplicate', 'message', 'Ten komentarz już został wysłany.');
  end if;

  insert into public.forum_comments (post_id, user_id, username, body)
  values (p_post_id, v_uid, v_name, v_body)
  returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

revoke all on function public.idler_forum_list(text, text, integer, integer) from public, anon;
revoke all on function public.idler_forum_get(bigint) from public, anon;
revoke all on function public.idler_forum_create(text, text) from public, anon;
revoke all on function public.idler_forum_vote(bigint, integer) from public, anon;
revoke all on function public.idler_forum_comment(bigint, text) from public, anon;
grant execute on function public.idler_forum_list(text, text, integer, integer) to authenticated;
grant execute on function public.idler_forum_get(bigint) to authenticated;
grant execute on function public.idler_forum_create(text, text) to authenticated;
grant execute on function public.idler_forum_vote(bigint, integer) to authenticated;
grant execute on function public.idler_forum_comment(bigint, text) to authenticated;


-- >>>>>>>>>> admin.sql <<<<<<<<<<

-- ============================================================
-- Idler: panel administratora (Supabase)
-- Uruchom w SQL Editor PO schema.sql, anticheat_ranking.sql, chat.sql, bug_reports.sql i forum.sql.
-- Można uruchamiać ponownie.
--
-- Zasady:
--  * administratorów dopisujesz WYŁĄCZNIE ręcznie w SQL (patrz na dole pliku), z gry nie da się
--    nikogo mianować,
--  * każda funkcja admina sprawdza uprawnienia po stronie serwera (przycisk w grze to tylko wygoda),
--  * każda akcja trafia do dziennika (admin_log),
--  * ban blokuje logowanie (auth.users.banned_until), wyklucza z rankingu, czatu i forum.
-- ============================================================

create table if not exists public.idler_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_bans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  reason text,
  banned_by uuid,
  banned_at timestamptz not null default now()
);

create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  admin_id uuid not null,
  admin_name text,
  action text not null,
  target_user_id uuid,
  target_name text,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists admin_log_created_idx on public.admin_log (created_at desc);

alter table public.idler_admins enable row level security;
alter table public.admin_bans enable row level security;
alter table public.admin_log enable row level security;
revoke all on public.idler_admins from anon, authenticated;
revoke all on public.admin_bans from anon, authenticated;
revoke all on public.admin_log from anon, authenticated;

-- ---------- Administrator jest nieruszalny ----------
-- Bez względu na to, skąd przychodzi zmiana (zapis gry, funkcje admina, SQL), administrator
-- nie może mieć flagi, wyciszenia ani bana.
create or replace function public.idler_admin_protect_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.idler_admins where user_id = new.user_id) then
    new.flagged := false;
    new.flag_reason := null;
    new.flagged_at := null;
  end if;
  return new;
end;
$$;

create or replace function public.idler_admin_protect_rows()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.idler_admins where user_id = new.user_id) then
    return null;  -- pomiń wstawienie/zmianę
  end if;
  return new;
end;
$$;

create or replace function public.idler_admin_cleanup_new_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.player_stats
     set flagged = false, flag_reason = null, flagged_at = null
   where user_id = new.user_id;
  delete from public.chat_mutes where user_id = new.user_id;
  delete from public.admin_bans where user_id = new.user_id;
  update auth.users set banned_until = null where id = new.user_id;
  return new;
end;
$$;

revoke all on function public.idler_admin_protect_stats() from public, anon, authenticated;
revoke all on function public.idler_admin_protect_rows() from public, anon, authenticated;
revoke all on function public.idler_admin_cleanup_new_admin() from public, anon, authenticated;

drop trigger if exists idler_protect_admin_stats on public.player_stats;
create trigger idler_protect_admin_stats
  before insert or update on public.player_stats
  for each row execute function public.idler_admin_protect_stats();

drop trigger if exists idler_protect_admin_mutes on public.chat_mutes;
create trigger idler_protect_admin_mutes
  before insert or update on public.chat_mutes
  for each row execute function public.idler_admin_protect_rows();

drop trigger if exists idler_protect_admin_bans on public.admin_bans;
create trigger idler_protect_admin_bans
  before insert or update on public.admin_bans
  for each row execute function public.idler_admin_protect_rows();

drop trigger if exists idler_cleanup_new_admin on public.idler_admins;
create trigger idler_cleanup_new_admin
  after insert on public.idler_admins
  for each row execute function public.idler_admin_cleanup_new_admin();

-- ---------- Pomocnicze (niedostępne z gry) ----------
create or replace function public.idler_check_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and exists (select 1 from public.idler_admins where user_id = auth.uid());
$$;

create or replace function public.idler_admin_write_log(p_action text, p_target uuid, p_details text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_log (admin_id, admin_name, action, target_user_id, target_name, details)
  values (
    auth.uid(),
    (select username from public.player_profiles where id = auth.uid()),
    p_action,
    p_target,
    (select username from public.player_profiles where id = p_target),
    left(coalesce(p_details, ''), 300)
  );
end;
$$;

revoke all on function public.idler_check_admin() from public, anon, authenticated;
revoke all on function public.idler_admin_write_log(text, uuid, text) from public, anon, authenticated;

create or replace function public.idler_forbidden()
returns jsonb
language sql
immutable
as $$ select jsonb_build_object('ok', false, 'error', 'forbidden', 'message', 'Brak uprawnień administratora.'); $$;

revoke all on function public.idler_forbidden() from public, anon, authenticated;

-- ---------- Czy jestem administratorem ----------
create or replace function public.idler_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select public.idler_check_admin(); $$;

-- ---------- Szukanie graczy ----------
create or replace function public.idler_admin_find(p_query text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_q text := btrim(coalesce(p_query, ''));
  v_rows jsonb;
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.username), '[]'::jsonb)
  into v_rows
  from (
    select
      p.id as user_id,
      p.username,
      p.created_at,
      s.level,
      coalesce(s.flagged, false) as flagged,
      s.flag_reason,
      (select m.muted_until from public.chat_mutes m where m.user_id = p.id and m.muted_until > now()) as muted_until,
      exists (select 1 from public.admin_bans b where b.user_id = p.id) as banned,
      (select b.reason from public.admin_bans b where b.user_id = p.id) as ban_reason,
      exists (select 1 from public.idler_admins a where a.user_id = p.id) as is_admin
    from public.player_profiles p
    left join public.player_stats s on s.user_id = p.id
    where v_q = ''
       or p.username ilike replace(replace(replace(v_q, '\', '\\'), '%', '\%'), '_', '\_') || '%'
    order by p.username
    limit 15
  ) t;

  return jsonb_build_object('ok', true, 'players', v_rows);
end;
$$;

-- ---------- Flaga ----------
create or replace function public.idler_admin_clear_flag(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  -- Zbanowany gracz zostaje oflagowany, dopóki ban trwa.
  if exists (select 1 from public.admin_bans where user_id = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'banned', 'message', 'Gracz jest zbanowany. Najpierw zdejmij bana.');
  end if;

  update public.player_stats
     set flagged = false, flag_reason = null, flagged_at = null
   where user_id = p_user_id;

  perform public.idler_admin_write_log('clear_flag', p_user_id, null);
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.idler_admin_set_flag(p_user_id uuid, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  if exists (select 1 from public.idler_admins where user_id = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'protected', 'message', 'Nie można oflagować administratora.');
  end if;

  if not exists (select 1 from public.player_profiles where id = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie znaleziono gracza.');
  end if;

  insert into public.player_stats (user_id, flagged, flag_reason, flagged_at)
  values (p_user_id, true, left(coalesce(nullif(btrim(p_reason), ''), 'ręcznie przez administratora'), 200), now())
  on conflict (user_id) do update
    set flagged = true, flag_reason = excluded.flag_reason, flagged_at = now();

  perform public.idler_admin_write_log('set_flag', p_user_id, p_reason);
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- Wyciszenie ----------
create or replace function public.idler_admin_mute(p_user_id uuid, p_minutes integer, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_min integer := least(greatest(coalesce(p_minutes, 60), 1), 525600);
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  if p_user_id = auth.uid() or exists (select 1 from public.idler_admins where user_id = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'protected', 'message', 'Nie można wyciszyć administratora.');
  end if;

  if not exists (select 1 from public.player_profiles where id = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie znaleziono gracza.');
  end if;

  insert into public.chat_mutes (user_id, muted_until, reason)
  values (p_user_id, now() + make_interval(mins => v_min), left(p_reason, 200))
  on conflict (user_id) do update
    set muted_until = excluded.muted_until, reason = excluded.reason;

  perform public.idler_admin_write_log('mute', p_user_id, v_min || ' min. ' || coalesce(p_reason, ''));
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.idler_admin_unmute(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  delete from public.chat_mutes where user_id = p_user_id;
  perform public.idler_admin_write_log('unmute', p_user_id, null);
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- Ban ----------
create or replace function public.idler_admin_ban(p_user_id uuid, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  if p_user_id = auth.uid() or exists (select 1 from public.idler_admins where user_id = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'protected', 'message', 'Nie można zbanować administratora.');
  end if;

  if not exists (select 1 from public.player_profiles where id = p_user_id) then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie znaleziono gracza.');
  end if;

  insert into public.admin_bans (user_id, reason, banned_by)
  values (p_user_id, left(p_reason, 200), auth.uid())
  on conflict (user_id) do update set reason = excluded.reason, banned_by = excluded.banned_by, banned_at = now();

  -- Wykluczenie z rankingu, czatu i forum od razu (także dla aktywnej sesji).
  insert into public.player_stats (user_id, flagged, flag_reason, flagged_at)
  values (p_user_id, true, 'ban', now())
  on conflict (user_id) do update set flagged = true, flag_reason = 'ban', flagged_at = now();

  -- Blokada logowania w Supabase Auth.
  update auth.users set banned_until = 'infinity' where id = p_user_id;

  perform public.idler_admin_write_log('ban', p_user_id, p_reason);
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.idler_admin_unban(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  delete from public.admin_bans where user_id = p_user_id;
  update auth.users set banned_until = null where id = p_user_id;
  update public.player_stats
     set flagged = false, flag_reason = null, flagged_at = null
   where user_id = p_user_id and flag_reason = 'ban';

  perform public.idler_admin_write_log('unban', p_user_id, null);
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- Zgłoszenia czatu ----------
create or replace function public.idler_admin_chat_reports()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb;
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select
      r.id, r.message_id, r.reported_user_id, r.reported_username, r.reported_body, r.reason, r.created_at,
      (select p.username from public.player_profiles p where p.id = r.reporter_id) as reporter,
      exists (select 1 from public.chat_messages m where m.id = r.message_id) as message_exists
    from public.chat_reports r
    order by r.created_at desc
    limit 50
  ) t;

  return jsonb_build_object('ok', true, 'reports', v_rows);
end;
$$;

create or replace function public.idler_admin_chat_delete(p_message_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  select user_id into v_user from public.chat_messages where id = p_message_id;
  delete from public.chat_messages where id = p_message_id;

  perform public.idler_admin_write_log('chat_delete', v_user, 'wiadomość #' || p_message_id);
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.idler_admin_chat_dismiss(p_report_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  delete from public.chat_reports where id = p_report_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- Zgłoszenia błędów ----------
create or replace function public.idler_admin_bug_reports(p_status text default 'new')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text := nullif(p_status, '');
  v_rows jsonb;
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.id desc), '[]'::jsonb)
  into v_rows
  from (
    select id, username, category, body, context, status, created_at, (screenshot is not null) as has_screenshot
    from public.bug_reports
    where v_status is null or status = v_status
    order by id desc
    limit 50
  ) t;

  return jsonb_build_object('ok', true, 'reports', v_rows);
end;
$$;

create or replace function public.idler_admin_bug_screenshot(p_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_shot text;
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  select screenshot into v_shot from public.bug_reports where id = p_id;

  if v_shot is null then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'To zgłoszenie nie ma zrzutu ekranu.');
  end if;

  return jsonb_build_object('ok', true, 'image', v_shot);
end;
$$;

create or replace function public.idler_admin_bug_status(p_id bigint, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  if p_status not in ('new', 'seen', 'done', 'rejected') then
    return jsonb_build_object('ok', false, 'error', 'bad_status', 'message', 'Nieprawidłowy status.');
  end if;

  update public.bug_reports set status = p_status where id = p_id;
  perform public.idler_admin_write_log('bug_status', null, '#' || p_id || ' -> ' || p_status);
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- Forum ----------
create or replace function public.idler_admin_forum_update(
  p_post_id bigint,
  p_status text,
  p_note text default null,
  p_hidden boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  if p_status not in ('open', 'planned', 'done', 'rejected') then
    return jsonb_build_object('ok', false, 'error', 'bad_status', 'message', 'Nieprawidłowy status.');
  end if;

  update public.forum_posts
     set status = p_status,
         admin_note = left(nullif(btrim(coalesce(p_note, '')), ''), 500),
         hidden = coalesce(p_hidden, false)
   where id = p_post_id;

  perform public.idler_admin_write_log('forum_update', (select user_id from public.forum_posts where id = p_post_id),
    '#' || p_post_id || ' ' || p_status || case when p_hidden then ' (ukryty)' else '' end);
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.idler_admin_forum_hide_comment(p_comment_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  update public.forum_comments set hidden = true where id = p_comment_id returning user_id into v_user;
  perform public.idler_admin_write_log('forum_hide_comment', v_user, 'komentarz #' || p_comment_id);
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------- Dziennik ----------
create or replace function public.idler_admin_log_list()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb;
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.id desc), '[]'::jsonb)
  into v_rows
  from (
    select id, admin_name, action, target_name, details, created_at
    from public.admin_log
    order by id desc
    limit 40
  ) t;

  return jsonb_build_object('ok', true, 'log', v_rows);
end;
$$;

do $$
declare
  f text;
begin
  foreach f in array array[
    'idler_is_admin()',
    'idler_admin_find(text)',
    'idler_admin_clear_flag(uuid)',
    'idler_admin_set_flag(uuid, text)',
    'idler_admin_mute(uuid, integer, text)',
    'idler_admin_unmute(uuid)',
    'idler_admin_ban(uuid, text)',
    'idler_admin_unban(uuid)',
    'idler_admin_chat_reports()',
    'idler_admin_chat_delete(bigint)',
    'idler_admin_chat_dismiss(bigint)',
    'idler_admin_bug_reports(text)',
    'idler_admin_bug_status(bigint, text)',
    'idler_admin_bug_screenshot(bigint)',
    'idler_admin_forum_update(bigint, text, text, boolean)',
    'idler_admin_forum_hide_comment(bigint)',
    'idler_admin_log_list()'
  ] loop
    execute 'revoke all on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
end $$;

-- ============================================================
-- JAK ZOSTAĆ ADMINISTRATOREM (jednorazowo, w SQL Editor).
-- Podmień TwojaNazwa na nazwę swojego konta w grze, odkomentuj i uruchom:
--
--   insert into public.idler_admins (user_id)
--   select id from public.player_profiles where lower(username) = lower('TwojaNazwa')
--   on conflict do nothing;
--
-- Odebranie uprawnień:
--   delete from public.idler_admins where user_id = (select id from public.player_profiles where lower(username) = lower('TwojaNazwa'));
-- ============================================================


-- >>>>>>>>>> dm.sql <<<<<<<<<<

-- ============================================================
-- Idler: wiadomości prywatne (Supabase)
-- Uruchom w SQL Editor PO schema.sql, anticheat_ranking.sql i chat.sql. Można uruchamiać ponownie.
--
-- Zasady:
--  * wysyłanie i blokowanie tylko przez funkcje idler_dm_* (limity, czyszczenie tekstu),
--  * każdy czyta wyłącznie rozmowy, w których sam uczestniczy (RLS), także na żywo (Realtime),
--  * wyciszenia z czatu (chat_mutes) i flaga anty-cheatowa blokują też wysyłanie prywatnych wiadomości,
--  * odbiorca może zablokować nadawcę; zablokowany nie dowiaduje się o tym nic poza komunikatem
--    „Ten gracz nie przyjmuje od Ciebie wiadomości”.
-- ============================================================

create table if not exists public.dm_messages (
  id bigint generated always as identity primary key,
  from_user uuid not null references auth.users (id) on delete cascade,
  to_user uuid not null references auth.users (id) on delete cascade,
  from_name text not null,
  to_name text not null,
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.dm_blocks (
  blocker uuid not null references auth.users (id) on delete cascade,
  blocked uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);

create index if not exists dm_messages_to_idx on public.dm_messages (to_user, created_at desc);
create index if not exists dm_messages_from_idx on public.dm_messages (from_user, created_at desc);
create index if not exists dm_messages_pair_idx on public.dm_messages (least(from_user, to_user), greatest(from_user, to_user), id);

alter table public.dm_messages enable row level security;
alter table public.dm_blocks enable row level security;

revoke all on public.dm_messages from anon, authenticated;
revoke all on public.dm_blocks from anon, authenticated;
grant select on public.dm_messages to authenticated;

drop policy if exists "DM: odczyt własnych rozmów" on public.dm_messages;
create policy "DM: odczyt własnych rozmów"
  on public.dm_messages for select to authenticated
  using (from_user = auth.uid() or to_user = auth.uid());

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'dm_messages'
     ) then
    alter publication supabase_realtime add table public.dm_messages;
  end if;
end $$;

-- ---------- Wysyłanie ----------
create or replace function public.idler_dm_send(p_to_username text, p_body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_from_name text;
  v_to uuid;
  v_to_name text;
  v_body text;
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select username into v_from_name from public.player_profiles where id = v_uid;
  if v_from_name is null then
    return jsonb_build_object('ok', false, 'error', 'no_profile', 'message', 'Brak profilu gracza.');
  end if;

  select id, username into v_to, v_to_name
  from public.player_profiles
  where lower(username) = lower(btrim(coalesce(p_to_username, '')));

  if v_to is null then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie ma takiego gracza.');
  end if;

  if v_to = v_uid then
    return jsonb_build_object('ok', false, 'error', 'self', 'message', 'Nie możesz napisać do siebie.');
  end if;

  v_body := btrim(regexp_replace(regexp_replace(coalesce(p_body, ''), '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g'), '\s+', ' ', 'g'));

  if char_length(v_body) = 0 then
    return jsonb_build_object('ok', false, 'error', 'empty', 'message', 'Wiadomość jest pusta.');
  end if;
  if char_length(v_body) > 300 then
    return jsonb_build_object('ok', false, 'error', 'too_long', 'message', 'Wiadomość jest za długa (maks. 300 znaków).');
  end if;

  if exists (select 1 from public.chat_mutes where user_id = v_uid and muted_until > now()) then
    return jsonb_build_object('ok', false, 'error', 'muted', 'message', 'Twoje konto jest wyciszone.');
  end if;
  if exists (select 1 from public.player_stats where user_id = v_uid and flagged) then
    return jsonb_build_object('ok', false, 'error', 'flagged', 'message', 'Twoje konto czeka na weryfikację, więc nie możesz pisać wiadomości.');
  end if;

  if exists (select 1 from public.dm_blocks where blocker = v_to and blocked = v_uid) then
    return jsonb_build_object('ok', false, 'error', 'blocked', 'message', 'Ten gracz nie przyjmuje od Ciebie wiadomości.');
  end if;

  -- Limity: 20 wiadomości na minutę, 150 na godzinę, 8 nowych rozmówców na godzinę.
  if (select count(*) from public.dm_messages where from_user = v_uid and created_at > now() - interval '1 minute') >= 20
     or (select count(*) from public.dm_messages where from_user = v_uid and created_at > now() - interval '1 hour') >= 150 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Za dużo wiadomości. Zwolnij na chwilę.');
  end if;

  if not exists (
       select 1 from public.dm_messages
       where from_user = v_uid and to_user = v_to
     )
     and (
       select count(distinct to_user) from public.dm_messages
       where from_user = v_uid and created_at > now() - interval '1 hour'
     ) >= 8 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Zbyt wielu nowych rozmówców w ciągu godziny. Spróbuj później.');
  end if;

  if exists (
    select 1 from public.dm_messages
    where from_user = v_uid and to_user = v_to and created_at > now() - interval '30 seconds' and lower(body) = lower(v_body)
  ) then
    return jsonb_build_object('ok', false, 'error', 'duplicate', 'message', 'Ta wiadomość już została wysłana.');
  end if;

  insert into public.dm_messages (from_user, to_user, from_name, to_name, body)
  values (v_uid, v_to, v_from_name, v_to_name, v_body)
  returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

-- ---------- Lista rozmów ----------
create or replace function public.idler_dm_conversations()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_rows jsonb;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'username', t.other_name,
    'last_body', t.body,
    'last_at', t.created_at,
    'from_me', t.from_user = v_uid,
    'unread', (select count(*) from public.dm_messages m where m.to_user = v_uid and m.from_user = t.other_id and m.read_at is null)::integer,
    'blocked', exists (select 1 from public.dm_blocks b where b.blocker = v_uid and b.blocked = t.other_id)
  ) order by t.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select distinct on (other_id) *
    from (
      select m.*,
        case when m.from_user = v_uid then m.to_user else m.from_user end as other_id,
        case when m.from_user = v_uid then m.to_name else m.from_name end as other_name
      from public.dm_messages m
      where m.from_user = v_uid or m.to_user = v_uid
    ) x
    order by other_id, created_at desc, id desc
  ) t;

  return jsonb_build_object('ok', true, 'conversations', v_rows);
end;
$$;

-- ---------- Rozmowa (oznacza odebrane jako przeczytane) ----------
create or replace function public.idler_dm_thread(p_username text, p_after_id bigint default 0)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_other uuid;
  v_other_name text;
  v_rows jsonb;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select id, username into v_other, v_other_name
  from public.player_profiles
  where lower(username) = lower(btrim(coalesce(p_username, '')));

  if v_other is null then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie ma takiego gracza.');
  end if;

  update public.dm_messages
     set read_at = now()
   where to_user = v_uid and from_user = v_other and read_at is null;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id, 'mine', t.from_user = v_uid, 'body', t.body, 'created_at', t.created_at
  ) order by t.id), '[]'::jsonb)
  into v_rows
  from (
    select id, from_user, body, created_at
    from public.dm_messages
    where ((from_user = v_uid and to_user = v_other) or (from_user = v_other and to_user = v_uid))
      and id > greatest(coalesce(p_after_id, 0), 0)
    order by id desc
    limit 100
  ) t;

  return jsonb_build_object(
    'ok', true,
    'username', v_other_name,
    'blocked', exists (select 1 from public.dm_blocks where blocker = v_uid and blocked = v_other),
    'messages', v_rows
  );
end;
$$;

-- ---------- Nieprzeczytane ----------
create or replace function public.idler_dm_unread_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from public.dm_messages where to_user = auth.uid() and read_at is null;
$$;

-- ---------- Blokowanie ----------
create or replace function public.idler_dm_block(p_username text, p_blocked boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_other uuid;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select id into v_other from public.player_profiles where lower(username) = lower(btrim(coalesce(p_username, '')));

  if v_other is null then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie ma takiego gracza.');
  end if;

  if v_other = v_uid then
    return jsonb_build_object('ok', false, 'error', 'self', 'message', 'Nie możesz zablokować siebie.');
  end if;

  if coalesce(p_blocked, true) then
    insert into public.dm_blocks (blocker, blocked) values (v_uid, v_other) on conflict do nothing;
  else
    delete from public.dm_blocks where blocker = v_uid and blocked = v_other;
  end if;

  return jsonb_build_object('ok', true, 'blocked', coalesce(p_blocked, true));
end;
$$;

revoke all on function public.idler_dm_send(text, text) from public, anon;
revoke all on function public.idler_dm_conversations() from public, anon;
revoke all on function public.idler_dm_thread(text, bigint) from public, anon;
revoke all on function public.idler_dm_unread_count() from public, anon;
revoke all on function public.idler_dm_block(text, boolean) from public, anon;
grant execute on function public.idler_dm_send(text, text) to authenticated;
grant execute on function public.idler_dm_conversations() to authenticated;
grant execute on function public.idler_dm_thread(text, bigint) to authenticated;
grant execute on function public.idler_dm_unread_count() to authenticated;
grant execute on function public.idler_dm_block(text, boolean) to authenticated;


-- >>>>>>>>>> dm_reports.sql <<<<<<<<<<

-- ============================================================
-- Idler: zgłaszanie wiadomości prywatnych do administratora (Supabase)
-- Uruchom w SQL Editor PO dm.sql i admin.sql. Można uruchamiać ponownie.
--
-- Zasady:
--  * zgłosić można tylko wiadomość, którą się ODEBRAŁO (nie własną),
--  * administrator NIE ma dostępu do prywatnych rozmów. Widzi tylko to, co gracz
--    zgłosił: zgłoszoną wiadomość oraz do 9 poprzednich z tej rozmowy (kopia z chwili zgłoszenia),
--  * zgłaszający i zgłoszony widzą w panelu admina nazwy, a zgłoszony nie dowiaduje się o zgłoszeniu,
--  * limit: 10 zgłoszeń na godzinę; tę samą wiadomość można zgłosić tylko raz.
-- ============================================================

create table if not exists public.dm_reports (
  id bigint generated always as identity primary key,
  message_id bigint,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reported_user_id uuid references auth.users (id) on delete set null,
  reported_username text,
  reported_body text,
  context jsonb not null default '[]'::jsonb,
  reason text,
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id)
);

create index if not exists dm_reports_created_idx on public.dm_reports (created_at desc);

alter table public.dm_reports enable row level security;
revoke all on public.dm_reports from anon, authenticated;

-- ---------- Zgłoszenie (gracz) ----------
create or replace function public.idler_dm_report(p_message_id bigint, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_msg public.dm_messages%rowtype;
  v_context jsonb;
  v_reason text;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '28000';
  end if;

  select * into v_msg from public.dm_messages where id = p_message_id;

  if v_msg.id is null or v_msg.to_user <> v_uid then
    return jsonb_build_object('ok', false, 'error', 'not_found', 'message', 'Nie można zgłosić tej wiadomości.');
  end if;

  if (select count(*) from public.dm_reports where reporter_id = v_uid and created_at > now() - interval '1 hour') >= 10 then
    return jsonb_build_object('ok', false, 'error', 'rate_limited', 'message', 'Za dużo zgłoszeń. Spróbuj za godzinę.');
  end if;

  if exists (select 1 from public.dm_reports where message_id = p_message_id and reporter_id = v_uid) then
    return jsonb_build_object('ok', false, 'error', 'duplicate', 'message', 'Ta wiadomość już została zgłoszona.');
  end if;

  v_reason := nullif(left(btrim(regexp_replace(coalesce(p_reason, ''), '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g')), 200), '');

  -- Kopia: zgłoszona wiadomość i do 9 poprzednich z tej rozmowy (najstarsza pierwsza).
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id,
    'from_reported', t.from_user = v_msg.from_user,
    'body', t.body,
    'created_at', t.created_at
  ) order by t.id), '[]'::jsonb)
  into v_context
  from (
    select id, from_user, body, created_at
    from public.dm_messages
    where ((from_user = v_msg.from_user and to_user = v_msg.to_user)
        or (from_user = v_msg.to_user and to_user = v_msg.from_user))
      and id <= v_msg.id
    order by id desc
    limit 10
  ) t;

  insert into public.dm_reports (message_id, reporter_id, reported_user_id, reported_username, reported_body, context, reason)
  values (v_msg.id, v_uid, v_msg.from_user, v_msg.from_name, v_msg.body, v_context, v_reason);

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.idler_dm_report(bigint, text) from public, anon;
grant execute on function public.idler_dm_report(bigint, text) to authenticated;

-- ---------- Panel admina ----------
create or replace function public.idler_admin_dm_reports()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb;
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.created_at desc), '[]'::jsonb)
  into v_rows
  from (
    select
      r.id, r.reported_user_id, r.reported_username, r.reported_body, r.context, r.reason, r.created_at,
      (select p.username from public.player_profiles p where p.id = r.reporter_id) as reporter
    from public.dm_reports r
    order by r.created_at desc
    limit 50
  ) t;

  return jsonb_build_object('ok', true, 'reports', v_rows);
end;
$$;

create or replace function public.idler_admin_dm_dismiss(p_report_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if not public.idler_check_admin() then return public.idler_forbidden(); end if;

  select reported_user_id into v_user from public.dm_reports where id = p_report_id;
  delete from public.dm_reports where id = p_report_id;

  perform public.idler_admin_write_log('dm_report_closed', v_user, 'zgłoszenie wiadomości prywatnej #' || p_report_id);
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.idler_admin_dm_reports() from public, anon;
revoke all on function public.idler_admin_dm_dismiss(bigint) from public, anon;
grant execute on function public.idler_admin_dm_reports() to authenticated;
grant execute on function public.idler_admin_dm_dismiss(bigint) to authenticated;


-- >>>>>>>>>> login_by_username.sql <<<<<<<<<<

-- Wcześniejsza, mniej bezpieczna wersja logowania nickiem (funkcja zwracała e-mail każdemu).
-- Teraz logowanie nickiem obsługuje Edge Function "idler-login" (supabase/functions/idler-login).
-- Ten plik tylko usuwa starą funkcję, jeśli została uruchomiona. Można go uruchamiać wielokrotnie.

drop function if exists public.idler_login_email(text);

