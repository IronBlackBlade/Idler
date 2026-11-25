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
