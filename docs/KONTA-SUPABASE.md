# Konta graczy w Idlerze (Supabase)

Konto jest **opcjonalne**: gra działa bez niego tak jak dotąd, a zapis nadal leży w przeglądarce (`idler_save`). Konto da dostęp do funkcji online (na razie sam profil, później ranking).

Dopóki nie wypełnisz konfiguracji, karta „🌐 Konto” w Ustawieniach pokazuje, że konta nie są skonfigurowane.

## 1. Załóż projekt w Supabase

1. Wejdź na https://supabase.com i załóż darmowe konto.
2. **New project**: wpisz nazwę (np. `idler`), ustaw hasło do bazy (zapisz je) i wybierz region blisko siebie (np. Frankfurt).
3. Poczekaj, aż projekt się utworzy (ok. 1–2 minuty).

## 2. Utwórz tabelę profili

1. W panelu projektu: **SQL Editor → New query**.
2. Wklej całą zawartość pliku `supabase/schema.sql` i kliknij **Run**.
3. Powinno się wykonać bez błędów. Skrypt można uruchomić ponownie bez szkody.

To tworzy tabelę `player_profiles` (nazwa gracza; osobna nazwa, żeby nie kolidować z ewentualną inną tabelą `profiles` w projekcie), włącza zabezpieczenia (profile są publiczne tylko do odczytu), dodaje automatyczne tworzenie profilu przy rejestracji i funkcję sprawdzającą, czy nazwa jest wolna.

## 3. Wpisz klucze do gry

1. W panelu: **Project Settings → API** (lub **Connect**).
2. Skopiuj **Project URL** i klucz **anon** (nazywany też *publishable*).
3. Otwórz `js/online/onlineConfig.js` i wpisz:

```js
window.IDLER_ONLINE_CONFIG = {
  supabaseUrl: "https://TWOJ-PROJEKT.supabase.co",
  supabaseAnonKey: "TWOJ-KLUCZ-ANON",
};
```

> **Nigdy nie wklejaj klucza `service_role`.** Klucz `anon` jest publiczny z założenia (bezpieczeństwo zapewniają reguły z kroku 2). Klucz `service_role` daje pełny dostęp do bazy.

## 4. Ustawienia logowania (Authentication)

W panelu: **Authentication**.

- **Sign In / Providers → Email**: logowanie e-mailem i hasłem jest domyślnie włączone.
  - **Confirm email** (potwierdzanie adresu) zostaw włączone w publicznej grze: chroni przed fałszywymi kontami.
  - Na czas samych testów lokalnych możesz je tymczasowo wyłączyć, wtedy po rejestracji gracz jest od razu zalogowany.
- **Minimum password length**: ustaw 8 (gra i tak wymaga co najmniej 8 znaków).
- **URL Configuration**:
  - **Site URL**: adres, pod którym stoi gra (np. `https://twoja-nazwa.github.io/idler/`).
  - **Redirect URLs**: dodaj ten sam adres.
  
  Linki z e-maili (potwierdzenie konta, reset hasła) prowadzą na ten adres. **Jeśli gra jest uruchamiana tylko lokalnie z pliku (`file://`), linki z e-maili nie zadziałają.** Wtedy do testów wyłącz Confirm email, a reset hasła przetestujesz dopiero po wystawieniu gry w internecie.

## 5. Co sprawdzić po konfiguracji

1. Ustawienia → Konto → **Załóż konto**. Nazwa gracza: 3–20 znaków (litery bez polskich znaków, cyfry, `_`, `-`).
2. Jeśli potwierdzanie e-maila jest włączone: kliknij link w wiadomości, wróć do gry i zaloguj się.
3. Po zalogowaniu w panelu bohatera pojawi się linia „🌐 nazwa”, a w Supabase w **Table Editor → player_profiles** nowy wiersz.

## 6. Zapis postaci w chmurze

Po zalogowaniu gra wysyła zapis postaci do chmury i pozwala grać z kilku urządzeń.

**Jednorazowa konfiguracja:** w Supabase otwórz **SQL Editor → New query**, wklej całą zawartość pliku `supabase/cloud_saves.sql` i kliknij **Run**. Powinno wyjść „Success. No rows returned”.

**Jak to działa**
- Zapis jest wysyłany co 3 minuty, gdy coś się zmieniło, oraz po schowaniu karty przeglądarki i przy wylogowaniu. Przyciski „Wyślij teraz” i „Wczytaj z chmury” są w Ustawienia → Konto.
- Zapis leży w przeglądarce jak dotąd. Chmura jest jego kopią.
- Po zalogowaniu na nowym urządzeniu gra wczytuje zapis z chmury.
- Jeśli zapis w chmurze i na urządzeniu się różnią (grałeś na dwóch urządzeniach), gra pokazuje okno wyboru z poziomem i czasem obu zapisów. Nic nie jest nadpisywane po cichu.
- Przed każdą podmianą zapisu lokalnego jego kopia trafia do „Przywróć kopię” w Ustawieniach.
- Świeża postać (np. po resecie) nie nadpisze zaawansowanego zapisu w chmurze bez pytania.
- Zapis lokalny jest przypisany do konta. Inne konto na tym samym urządzeniu nie dostanie cudzej postaci.

## 7. Kontrola zapisu i ranking

**Jednorazowa konfiguracja:** w Supabase otwórz **SQL Editor → New query**, wklej całą zawartość pliku `supabase/anticheat_ranking.sql` i kliknij **Run** (po `schema.sql` i `cloud_saves.sql`). Skrypt można uruchamiać ponownie.

**Jak to działa**
- Od teraz zapis do chmury wysyła funkcja serwera `idler_submit_save`. Bezpośrednie zapisywanie do tabeli jest zablokowane.
- Serwer **zawsze zapisuje** zapis, ale sprawdza postęp: jeśli poziom, zabójstwa lub bossowie rosną nierealnie szybko (albo EXP nie ma pokrycia w zabójstwach), konto dostaje **flagę**. Flaga nic nie kasuje, tylko wyklucza z rankingu.
- Serwer pilnuje też **złota**: nierealny przyrost między zapisami (limit `max_gold_per_second` plus jednorazowy zapas `gold_burst`, np. na sprzedaż całego plecaka) oraz absurdalna ilość złota przy pierwszym zapisie konta dają flagę. Spadek złota (wydatki) jest zawsze w porządku.
- Zapisy w oczywiście błędnym formacie (np. ujemne EXP, poziom spoza zakresu) są odrzucane.
- Ranking (menu Miasto → 🏆 Ranking) ma zakładki Poziom, Bossowie, Zabite potwory. Pokazuje tylko graczy bez flagi.
- Kliknięcie nazwy gracza w rankingu otwiera jego profil (poziom, klasa, statystyki zabójstw, założony sprzęt). Serwer ujawnia tylko ten bezpieczny podzbiór zapisu, bez złota i ekwipunku.
- Limity są hojne i można je zmieniać bez zmiany gry (patrz niżej).

**Panel administratora (SQL Editor)**

Lista oznaczonych graczy:
```sql
select p.username, s.level, s.flag_reason, s.flagged_at
from player_stats s join player_profiles p on p.id = s.user_id
where s.flagged;
```

Zdjęcie flagi z gracza (flaga sama nie znika):
```sql
update player_stats set flagged = false, flag_reason = null, flagged_at = null
where user_id = (select id from player_profiles where lower(username) = lower('NAZWA'));
```

Podgląd i zmiana limitów:
```sql
select * from idler_limits;
update idler_limits set value = 300000 where key = 'max_exp_per_second';
-- limity złota: max_gold_per_second, gold_burst, first_submit_gold_max
```

**Uwaga:** przy pierwszym wysłaniu starego zapisu serwer sprawdza, czy EXP ma pokrycie w zabójstwach. Starsze zapisy mogą nie mieć liczników zabójstw i zostać oznaczone przez pomyłkę. Wtedy zdejmij flagę zapytaniem wyżej. Wzór krzywej EXP w SQL (`idler_exp_to_next`) musi pozostać zgodny z grą.

## 8. Czat globalny

**Jednorazowa konfiguracja:** w Supabase otwórz **SQL Editor → New query**, wklej całą zawartość `supabase/chat.sql` i kliknij **Run** (po `schema.sql` i `anticheat_ranking.sql`). Skrypt można uruchamiać ponownie.

**Jak to działa**
- Czat to zakładka na długim dolnym pasku (obok 📋 Log postaci); po kliknięciu rozwija się okno nad paskiem, licznik pokazuje nieprzeczytane. Widoczny tylko dla zalogowanych. Jeden wspólny pokój dla zalogowanych graczy, wiadomości pojawiają się na żywo (gdy Realtime nie działa, gra odświeża czat co kilka sekund).
- Wiadomość ma do 300 znaków. Limity: co najmniej 1,5 s między wiadomościami, do 12 na minutę, bez powtarzania tej samej wiadomości w ciągu minuty.
- Konta oznaczone flagą (patrz sekcja 7) i wyciszone nie mogą pisać.
- Kliknięcie nazwy gracza otwiera jego profil. Przycisk ⚑ zgłasza wiadomość.
- Wiadomości starsze niż 7 dni są usuwane automatycznie.

**Panel administratora (SQL Editor)**

Zgłoszone wiadomości:
```sql
select r.created_at, r.reported_username, r.reported_body, r.reason
from chat_reports r order by r.created_at desc;
```

Wyciszenie gracza na 24 godziny:
```sql
insert into chat_mutes (user_id, muted_until, reason)
select id, now() + interval '24 hours', 'spam'
from player_profiles where lower(username) = lower('NAZWA')
on conflict (user_id) do update set muted_until = excluded.muted_until, reason = excluded.reason;
```

Zdjęcie wyciszenia:
```sql
delete from chat_mutes
where user_id = (select id from player_profiles where lower(username) = lower('NAZWA'));
```

Usunięcie wiadomości:
```sql
delete from chat_messages where id = 123;
```

**Uwaga:** gra nie filtruje wulgaryzmów automatycznie. Moderacja polega na limitach, zgłoszeniach i Twoich wyciszeniach.

## Dobrze wiedzieć

- Hasła i adresy e-mail trzyma Supabase (Authentication → Users). Gra nigdy nie zapisuje hasła.
- Sesja logowania jest zapamiętywana w przeglądarce osobno od zapisu gry. Reset postaci ani import zapisu jej nie wylogowują.
- Biblioteka Supabase leży w `js/vendor/supabase-js-2.45.4.js` (licencja MIT, Supabase), więc gra nie ładuje nic z zewnętrznych serwerów poza Twoim projektem Supabase.
- Darmowy plan Supabase wystarcza na początek. Projekty bez aktywności mogą być po dłuższym czasie wstrzymywane, wtedy wystarczy je wznowić w panelu.
