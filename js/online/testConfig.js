/*
 * Środowisko TESTOWE (osobny projekt Supabase dla testerów).
 *
 * Wypełnij, gdy założysz drugi projekt Supabase (instrukcja: docs/SRODOWISKO-TESTOWE.md).
 * Wartości są takie same jak w onlineConfig.js (Project Settings → API):
 *   supabaseUrl     – "Project URL" projektu TESTOWEGO,
 *   supabaseAnonKey – klucz "anon" / "publishable" projektu TESTOWEGO.
 *
 * NIGDY nie wklejaj tu klucza "service_role".
 *
 * useByDefault:
 *   false – gra łączy się z projektem testowym tylko po wejściu na adres z ?env=test
 *           (wybór zapamiętuje się w przeglądarce; ?env=prod wraca do zwykłego projektu),
 *   true  – ta kopia gry ZAWSZE używa projektu testowego (użyj tego w osobnej kopii
 *           wgranej dla testerów, żeby nie musieli nic dopisywać do adresu).
 *
 * Dopóki pola są puste, nic się nie zmienia: gra działa na konfiguracji z onlineConfig.js.
 */
window.IDLER_TEST_CONFIG = {
  supabaseUrl: "https://vrsbfibklgwmfenlplji.supabase.co/rest/v1/",
  supabaseAnonKey: "sb_publishable_v-Q0l2mtCy19qTpR6UE_qQ_jfKhEqmE",
  useByDefault: false,
};
