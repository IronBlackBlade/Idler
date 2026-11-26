-- Wcześniejsza, mniej bezpieczna wersja logowania nickiem (funkcja zwracała e-mail każdemu).
-- Teraz logowanie nickiem obsługuje Edge Function "idler-login" (supabase/functions/idler-login).
-- Ten plik tylko usuwa starą funkcję, jeśli została uruchomiona. Można go uruchamiać wielokrotnie.

drop function if exists public.idler_login_email(text);
