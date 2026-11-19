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
