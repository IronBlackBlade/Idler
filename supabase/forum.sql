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
