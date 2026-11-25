/*
 * Wybór środowiska online: zwykłe (onlineConfig.js) albo testowe (testConfig.js).
 * Ładowany po obu plikach konfiguracji, a przed accounts.js.
 *
 *   ?env=test  – używaj projektu testowego (zapamiętane w tej przeglądarce),
 *   ?env=prod  – wróć do zwykłego projektu.
 *
 * W trybie testowym na ekranie widać etykietę „ŚRODOWISKO TESTOWE”, żeby nikt nie
 * pomylił konta testowego ze zwykłym.
 */
(function () {
  const STORAGE_KEY = "idler_online_env";
  const test = window.IDLER_TEST_CONFIG || {};
  const hasTestConfig = Boolean(test.supabaseUrl && test.supabaseAnonKey);

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeStored(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* przeglądarka blokuje zapis: wybór działa tylko do odświeżenia */
    }
  }

  let requested = null;

  try {
    requested = new URLSearchParams(window.location.search).get("env");
  } catch (error) {
    requested = null;
  }

  if (requested === "test" || requested === "prod") {
    writeStored(requested);
  }

  const chosen =
    requested === "test" || requested === "prod"
      ? requested
      : readStored() || (test.useByDefault === true ? "test" : "prod");

  // useByDefault wygrywa, jeśli ktoś nie wybrał inaczej w tej przeglądarce.
  const active = chosen === "test" && hasTestConfig ? "test" : "prod";

  if (active === "test") {
    window.IDLER_ONLINE_CONFIG = {
      supabaseUrl: test.supabaseUrl,
      supabaseAnonKey: test.supabaseAnonKey,
    };
  }

  window.IDLER_ONLINE_ENV = active;

  if (chosen === "test" && !hasTestConfig && typeof console !== "undefined") {
    console.warn("Idler: wybrano środowisko testowe, ale js/online/testConfig.js jest pusty.");
  }

  if (active === "test") {
    const addBadge = () => {
      if (document.getElementById("idler-test-env-badge")) return;
      const badge = document.createElement("div");
      badge.id = "idler-test-env-badge";
      badge.textContent = "🧪 ŚRODOWISKO TESTOWE";
      badge.style.cssText =
        "position:fixed;left:50%;transform:translateX(-50%);top:0;z-index:2147483000;" +
        "background:#8a2be2;color:#fff;font:700 11px/1 sans-serif;letter-spacing:.06em;" +
        "padding:3px 10px;border-radius:0 0 8px 8px;pointer-events:none;opacity:.92";
      document.body.appendChild(badge);
    };

    if (document.body) addBadge();
    else document.addEventListener("DOMContentLoaded", addBadge);
  }
})();
