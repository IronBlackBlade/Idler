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
