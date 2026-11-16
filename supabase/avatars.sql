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
