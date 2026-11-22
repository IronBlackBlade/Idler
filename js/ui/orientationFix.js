// Obejście błędu iOS/iPadOS: po obróceniu ekranu przeglądarka czasem zostawia
// stary (węższy) układ strony i reszta ekranu jest biała. Wymuszamy przeliczenie układu.
(function () {
  'use strict';
  var timer = null;
  function nudge() {
    var root = document.documentElement;
    var prev = root.style.display;
    root.style.display = 'none';
    void root.offsetHeight; // wymuszenie reflow
    root.style.display = prev;
    window.dispatchEvent(new Event('resize'));
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(nudge, 250);
  }
  window.addEventListener('orientationchange', schedule);
  if (window.screen && screen.orientation && screen.orientation.addEventListener) {
    screen.orientation.addEventListener('change', schedule);
  }
})();
