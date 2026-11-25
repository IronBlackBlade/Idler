/*
 * Drugi etap wyboru środowiska: w trybie testowym podmienia klucze Supabase
 * (po wczytaniu onlineConfig.js, przed accounts.js). Patrz onlineEnvironment.js.
 */
(function () {
  const test = window.IDLER_TEST_CONFIG || {};

  if (window.IDLER_ONLINE_ENV === "test" && test.supabaseUrl && test.supabaseAnonKey) {
    window.IDLER_ONLINE_CONFIG = {
      supabaseUrl: test.supabaseUrl,
      supabaseAnonKey: test.supabaseAnonKey,
    };
  }
})();
