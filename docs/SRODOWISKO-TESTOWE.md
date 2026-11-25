# Środowisko testowe (osobny projekt Supabase dla testerów)

Po co: testerzy zakładają konta, piszą na czacie, wysyłają zgłoszenia i trafiają do rankingu.
Wszystko to ma trafiać do **osobnej bazy**, a nie do Twojej prawdziwej. Dzięki temu możesz
swobodnie czyścić dane testowe, a Twoje konto i ranking zostają nietknięte.

## 1. Załóż drugi projekt Supabase

1. Wejdź na https://supabase.com/dashboard i kliknij **New project**.
2. Nazwa np. `idler-test`, region ten sam co w zwykłym projekcie, hasło do bazy zapisz w menedżerze haseł.
3. Poczekaj, aż projekt się utworzy (1–2 minuty).

## 2. Wgraj bazę jednym plikiem

1. W projekcie testowym otwórz **SQL Editor → New query**.
2. Wklej całą zawartość pliku `supabase/_wszystko.sql` i kliknij **Run**.
3. Powinno wyjść „Success”. Plik można uruchomić ponownie bez szkody.

Plik `_wszystko.sql` jest sklejony ze wszystkich skryptów w poprawnej kolejności. Gdy zmienią się
pliki w `supabase/`, wygeneruj go ponownie poleceniem `node tools/buildAllSql.js`.

## 3. Ustawienia logowania (ważne dla testerów)

W projekcie testowym, **Authentication → Providers → Email**:
- Wyłącz **Confirm email**. Dzięki temu testerzy nie utkną na potwierdzaniu e-maila (w testach to zbędne).

W **Authentication → URL Configuration** ustaw **Site URL** na adres, pod którym działa gra.

## 4. Wpisz klucze do gry

1. W projekcie testowym: **Project Settings → API**. Skopiuj **Project URL** i klucz **anon / publishable**.
   Klucza `service_role` nigdy nie używaj w grze.
2. Wklej je do pliku `js/online/testConfig.js` (`supabaseUrl`, `supabaseAnonKey`).
3. Plik `js/online/onlineConfig.js` zostaje bez zmian (to Twój zwykły projekt).

## 5. Jak testerzy wchodzą do środowiska testowego

Masz dwie opcje:

**A. Jedna kopia gry, link z parametrem.** Wyślij testerom adres z `?env=test`, np.
`https://twoja-gra.pl/?env=test`. Wybór zapamiętuje się w ich przeglądarce. Powrót do zwykłego projektu: `?env=prod`.
Zostaw w `testConfig.js` `useByDefault: false`.

**B. Osobna kopia gry dla testerów.** Wgraj grę drugi raz pod inny adres i w tej kopii ustaw w
`testConfig.js` `useByDefault: true`. Testerzy otwierają zwykły link i nic nie muszą dopisywać.
To bezpieczniejsze, bo nikt nie pomyli środowisk, a Twoja kopia zostaje czysta.

W środowisku testowym na górze ekranu widać fioletową etykietę **🧪 ŚRODOWISKO TESTOWE**.

## 6. Twoje konto administratora w bazie testowej

1. Zarejestruj się w grze na środowisku testowym (zwykłe konto).
2. W SQL Editor projektu testowego uruchom (podmień nazwę na swoją):

```sql
insert into public.idler_admins (user_id)
select id from public.player_profiles where lower(username) = lower('TwojaNazwa')
on conflict do nothing;
```

Po odświeżeniu gry w menu pojawi się **Panel admina** (zgłoszenia błędów, czatu i wiadomości prywatnych).

## 7. Czyszczenie danych po testach

W SQL Editor projektu testowego, np. żeby wyczyścić ranking, czat i zgłoszenia:

```sql
truncate public.chat_messages, public.chat_reports, public.dm_messages, public.dm_reports,
         public.bug_reports restart identity cascade;
```

Konta testerów możesz usuwać w **Authentication → Users**. Projekt testowy możesz też po prostu
skasować i założyć od nowa (krok 1–4).

## Uwagi

- Zapis gry w przeglądarce (`idler_save`) jest wspólny dla jednego adresu strony. Jeśli sam używasz tej samej
  kopii gry i raz wejdziesz z `?env=test`, zapis lokalny zostanie podłączony do konta testowego. Do własnej
  gry używaj więc zwykłego adresu, a testerom dawaj osobną kopię (opcja B).
- Darmowy plan Supabase usypia projekt po tygodniu bez ruchu. Wystarczy go wznowić w panelu.
