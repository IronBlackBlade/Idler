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

## 9. Avatary graczy

- Avatar wybierasz klikając portret bohatera w lewym górnym rogu (na telefonie: portret w górnym pasku). Część avatarów jest od początku, reszta odblokowuje się osiągnięciami. Wybór zapisuje się razem z postacią.
- Żeby avatar był widoczny dla innych (ranking, profil gracza, czat), uruchom w SQL Editor plik `supabase/avatars.sql` (po `schema.sql`, `anticheat_ranking.sql` i `chat.sql`; można go uruchamiać wielokrotnie). Bez niego avatary działają tylko lokalnie, a inni gracze widzą domyślnego żółwia.
- Jeśli kiedyś ponownie uruchomisz `anticheat_ranking.sql`, uruchom po nim jeszcze raz `avatars.sql`.
- Avatar to wyłącznie kosmetyka: serwer zapisuje tylko krótki identyfikator (np. `dragon`), a gra nieznany identyfikator pokazuje jako żółwia.

## 10. Zgłaszanie błędów i pomysłów

1. W Supabase otwórz **SQL Editor**, wklej zawartość pliku `supabase/bug_reports.sql` i kliknij **Run** (można uruchomić ponownie bez szkody).
2. W grze: menu **Społeczność → 🐞 Zgłoś błąd** (kategorie: Błąd / Pomysł / Inne). Wymaga zalogowanego konta.
3. Zgłoszenia czytasz w Supabase: **Table Editor → bug_reports** (albo SQL: `select id, created_at, username, category, body, context, status from bug_reports order by id desc;`). Kolumna `context` zawiera ekran, poziom, lokację i typ przeglądarki gracza.
4. Status zmieniasz ręcznie w Table Editor: `new`, `seen`, `done`, `rejected`.
5. Limity: min. 10 i maks. 1500 znaków, 5 zgłoszeń na godzinę i 15 na dobę na gracza, bez powtórzeń tej samej treści.

## 11. Forum pomysłów

1. W Supabase otwórz **SQL Editor**, wklej zawartość `supabase/forum.sql` i kliknij **Run**. Wymaga wcześniej uruchomionych: `schema.sql`, `anticheat_ranking.sql` i `chat.sql` (korzysta z ich tabel). Można uruchomić ponownie.
2. W grze: menu **Społeczność → 💡 Forum pomysłów**. Gracze dodają pomysły, oceniają je kciukiem w górę 👍 lub w dół 👎 (ponowne kliknięcie cofa głos, przeciwny kciuk go zmienia) i komentują. „Popularne" sortuje po różnicy 👍 minus 👎. Listę można sortować (Popularne / Najnowsze) i filtrować po statusie.
3. Moderacja w **Table Editor**:
   - `forum_posts.status`: `open` (nowy), `planned` (planowany), `done` (zrobiony), `rejected` (odrzucony),
   - `forum_posts.admin_note`: Twoja odpowiedź, widoczna pod wpisem jako „Odpowiedź twórcy",
   - `forum_posts.hidden = true` ukrywa wpis, `forum_comments.hidden = true` ukrywa komentarz.
4. Wyciszenia z czatu (`chat_mutes`) i flaga anty-cheatowa blokują też pisanie na forum (głosować nadal można).
5. Limity: 3 wpisy na godzinę i 10 na dobę, 15 komentarzy na godzinę, 60 głosów na godzinę. Jeśli uruchomiłeś już starszą wersję `forum.sql`, uruchom nową ponownie: dodaje kolumnę z rodzajem głosu i podmienia funkcję głosowania.

## 12. Panel administratora

1. W Supabase, w **SQL Editor**, uruchom `supabase/admin.sql` (po `schema.sql`, `anticheat_ranking.sql`, `chat.sql`, `bug_reports.sql` i `forum.sql`). Można uruchomić ponownie.
2. Nadaj sobie uprawnienia jednorazowym zapytaniem (podmień `TwojaNazwa` na nazwę konta w grze):

```sql
insert into public.idler_admins (user_id)
select id from public.player_profiles where lower(username) = lower('TwojaNazwa')
on conflict do nothing;
```

3. Wyloguj się i zaloguj ponownie (albo odśwież grę). W menu **Społeczność** pojawi się **🛡️ Panel admina**. Inni gracze go nie widzą, a uprawnienia serwer sprawdza przy każdej akcji.
4. Zakładki panelu:
   - **Gracze:** wyszukiwanie po początku nazwy, zdjęcie flagi, ręczna flaga, wyciszenie (15 min, 1 godz., 24 godz., 7 dni) i jego zdjęcie, ban i odbanowanie. Pole „Powód" trafia do wyciszenia, flagi i bana.
   - **Czat:** zgłoszenia graczy z możliwością usunięcia wiadomości, wyciszenia autora albo odrzucenia zgłoszenia.
   - **Błędy:** zgłoszenia z kontekstem (ekran, poziom, przeglądarka) i zmianą statusu.
   - **Dziennik:** ostatnie 40 akcji administratorów.
5. Na forum administrator widzi dodatkowo pole „Moderacja" przy wpisie (status, odpowiedź twórcy, ukrycie wpisu) i przycisk ukrycia przy komentarzach.
6. Ban blokuje logowanie (Supabase Auth), wyklucza z rankingu, czatu i forum. Gracz z aktywną sesją może jeszcze do godziny korzystać z gry, ale nic nie zapisze do rankingu. Administrator jest nieruszalny: nie dostanie flagi (także z automatycznej kontroli zapisu), wyciszenia ani bana, nawet zapytaniem SQL, a nowo mianowany admin od razu zostaje oczyszczony z ewentualnej flagi, wyciszenia i bana. Dlatego po aktualizacji uruchom ponownie `anticheat_ranking.sql` (zapis gry pomija wtedy admina), a potem `admin.sql`.
7. Odebranie uprawnień:

```sql
delete from public.idler_admins
where user_id = (select id from public.player_profiles where lower(username) = lower('TwojaNazwa'));
```

## 13. Poziom na czacie

Wiadomości na czacie mają format `12:43 🐻 Nick[67]: treść`. Poziom jest zapisywany po stronie serwera w chwili wysłania (z ostatniego zweryfikowanego zapisu gracza). Żeby zadziałał, uruchom ponownie `supabase/chat.sql` (dodaje kolumnę `level` i wyzwalacz). Starsze wiadomości i konta bez zapisu w chmurze pokazują nick bez poziomu.

## 14. Menu na czacie i wiadomości prywatne

**Menu wiadomości.** Prawy przycisk myszy na wiadomości (albo przycisk **⋯** po prawej, który działa też na telefonie) otwiera menu: 👤 Profil, ✉ Napisz prywatnie, ⚑ Zgłoś wiadomość. Administrator (sekcja 12) widzi dodatkowo blok „Moderacja”: 🗑 usuń wiadomość (znika od razu u wszystkich z otwartym czatem), 🔇 wycisz na 15 min / 1 godz. / 24 godz. / 7 dni, 🔨 zbanuj. Akcje trafiają do dziennika w panelu admina i wymagają tylko uruchomionego `supabase/admin.sql`.

**Wiadomości prywatne.**
1. W Supabase, w **SQL Editor**, uruchom `supabase/dm.sql` (po `schema.sql`, `anticheat_ranking.sql` i `chat.sql`; wykorzystuje też `chat_mutes` i `player_stats`). Można uruchomić ponownie.
2. W grze: dwuklik na wiadomości gracza na czacie (albo menu → ✉) otwiera rozmowę. Zakładka **✉ Wiadomości** w dolnym pasku pokazuje listę rozmów i licznik nieprzeczytanych, a można też wpisać nazwę gracza. Nowe wiadomości przychodzą na żywo, z powiadomieniem, gdy okno jest zamknięte.
3. Przycisk **📌** w oknie rozmowy przypina ją jako osobną zakładkę w dolnym pasku (z licznikiem nieprzeczytanych, ✕ odpina). Można przypiąć do 5 rozmów, lista zapamiętuje się w przeglądarce. Na telefonie widać dwie pierwsze, reszta jest dostępna w ✉.
4. Odbiorca może **zablokować** nadawcę (przycisk w oknie rozmowy), a potem odblokować. Zablokowany gracz widzi tylko komunikat, że ten gracz nie przyjmuje od niego wiadomości.
5. Każdy czyta wyłącznie własne rozmowy (RLS), wysyłanie tylko przez funkcję serwera. Limity: 300 znaków, 20 wiadomości na minutę i 150 na godzinę, maks. 8 nowych rozmówców na godzinę, bez powtórzeń w 30 sekund. Wyciszenie z czatu i flaga anty-cheatowa blokują też prywatne wiadomości, a administrator jest wyjęty spod flag i wyciszeń.
6. Administrator nie czyta rozmów prywatnych (poza bezpośrednim dostępem do bazy w Supabase).

**Rozmiar okien (komputer).** Okno czatu i wiadomości prywatnych można rozciągać: złap górną krawędź (wysokość), prawą krawędź (szerokość) albo prawy górny róg (oba naraz). Rozmiar jest wspólny dla obu okien, zapamiętuje się w przeglądarce, a dwuklik na uchwycie przywraca rozmiar domyślny. Na telefonie okna mają stały rozmiar.

## 15. Zrzut ekranu w zgłoszeniu błędu

W oknie **Zgłoś błąd** gracz może dołączyć zrzut ekranu: przyciskiem **📎 Dodaj zrzut ekranu** (na telefonie wybiera zdjęcie z galerii) albo wklejając obraz (Ctrl+V) w pole opisu. Gra zmniejsza go do maks. 1280 px i zapisuje jako JPEG (zwykle 100 do 250 KB). Serwer przyjmuje tylko JPEG do ok. 400 KB i maks. 5 zrzutów na gracza na dobę.

1. Uruchom ponownie w **SQL Editor**: najpierw `supabase/bug_reports.sql` (dodaje kolumnę `screenshot` i nową wersję funkcji), potem `supabase/admin.sql`.
2. Administrator widzi w panelu (zakładka **Błędy**) przycisk **📎 Pokaż zrzut ekranu** przy zgłoszeniach, które go mają. Kliknięcie obrazu otwiera go w pełnym rozmiarze w nowej karcie. Lista zgłoszeń nie ładuje zdjęć, tylko pobiera je na żądanie.
3. Zrzuty zajmują miejsce w bazie. Żeby je czyścić po rozpatrzeniu zgłoszeń, uruchom w SQL Editor:
   `update public.bug_reports set screenshot = null where status in ('done', 'rejected');`
