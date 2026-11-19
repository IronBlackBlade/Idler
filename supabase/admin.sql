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
