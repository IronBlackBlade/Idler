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
