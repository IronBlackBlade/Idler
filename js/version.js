/*
 * Numer wersji gry. Zmieniaj go przy każdej paczce wysyłanej testerom
 * (np. 0.1.1, 0.1.2…). Widać go w rogu ekranu i trafia do zgłoszeń błędów.
 */
window.IDLER_VERSION = "0.1.6";
window.IDLER_BUILD_DATE = "2026-11-26";

(function () {
  function addLabel() {
    if (document.getElementById("idler-version-label")) return;
    const label = document.createElement("div");
    label.id = "idler-version-label";
    label.textContent = "v" + window.IDLER_VERSION;
    label.style.cssText =
      "position:fixed;right:14px;bottom:calc(48px + env(safe-area-inset-bottom, 0px));z-index:8000;font:600 10px/1 sans-serif;" +
      "color:#fff;opacity:.35;pointer-events:none;text-shadow:0 0 2px #000";
    document.body.appendChild(label);
  }

  if (document.body) addLabel();
  else document.addEventListener("DOMContentLoaded", addLabel);
})();
