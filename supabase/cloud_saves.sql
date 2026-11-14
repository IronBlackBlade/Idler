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
