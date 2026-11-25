/*
 * Drugi etap wyboru środowiska: w trybie testowym podmienia klucze Supabase
 * (po wczytaniu onlineConfig.js, przed accounts.js). Patrz onlineEnvironment.js.
 *
 * Dodatkowo naprawia częsty błąd w adresie projektu: jeśli ktoś wkleił adres z końcówką
 * (np. https://xxxx.supabase.co/rest/v1/), zostaje tylko część główna https://xxxx.supabase.co.
 */
(function () {
  function normalizeUrl(value) {
    const text = String(value || "").trim();

    try {
      const parsed = new URL(text);
      return parsed.origin;
    } catch (error) {
      return text.replace(/\/+$/, "");
    }
  }

  const test = window.IDLER_TEST_CONFIG || {};

  if (window.IDLER_ONLINE_ENV === "test" && test.supabaseUrl && test.supabaseAnonKey) {
    window.IDLER_ONLINE_CONFIG = {
      supabaseUrl: test.supabaseUrl,
      supabaseAnonKey: test.supabaseAnonKey,
    };
  }

  const config = window.IDLER_ONLINE_CONFIG;

  if (config) {
    config.supabaseUrl = config.supabaseUrl ? normalizeUrl(config.supabaseUrl) : "";
    config.supabaseAnonKey = String(config.supabaseAnonKey || "").trim();
  }
})();
