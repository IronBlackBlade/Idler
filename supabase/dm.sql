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
