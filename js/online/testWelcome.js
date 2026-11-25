/*
 * Okno powitalne środowiska testowego (tylko przy ?env=test).
 * Pokazuje się po wejściu, dopóki tester nie kliknie „Rozumiem”. Później można je
 * otworzyć ponownie, klikając fioletową etykietę „ŚRODOWISKO TESTOWE” u góry ekranu.
 */
(function () {
  if (window.IDLER_ONLINE_ENV !== "test") return;

  const KEY = "idler_test_welcome_seen";

  function seen() {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function markSeen() {
    try {
      localStorage.setItem(KEY, "1");
    } catch (error) {
      /* bez zapisu okno pokaże się przy kolejnym wejściu */
    }
  }

  const MESSAGE = [
    "To wersja testowa gry (" + "v" + (window.IDLER_VERSION || "?") + "). Dziękujemy, że pomagasz ją testować!",
    "",
    "• Konto i postać na tej wersji są osobne od zwykłej gry.",
    "• Postacie i konta mogą zostać skasowane w dowolnym momencie – nie przywiązuj się do postępów.",
    "• Zbieramy tylko e-mail i nazwę gracza (nazwa jest widoczna dla innych graczy).",
    "• Balans (obrażenia, ceny, drop) nie jest jeszcze dopracowany – jeśli coś jest za mocne lub za słabe, napisz.",
    "• Wymiany między graczami jeszcze nie ma.",
    "",
    "Błędy zgłaszaj w menu: 🐞 Zgłoś błąd (wersja gry dołącza się automatycznie), a pomysły wpisuj w 💡 Forum pomysłów.",
    "",
    "To okno otworzysz ponownie, klikając fioletową etykietę „ŚRODOWISKO TESTOWE” u góry.",
  ].join("\n");

  function open() {
    if (typeof showGameConfirm !== "function") return;

    showGameConfirm(MESSAGE, {
      title: "🧪 Witaj w wersji testowej",
      confirmText: "Rozumiem",
      cancelText: "Zamknij",
    }).then((ok) => {
      if (ok) markSeen();
    });

    const overlays = document.querySelectorAll(".game-dialog-overlay");
    const mine = overlays[overlays.length - 1];
    if (mine) mine.style.zIndex = "2147483100";
  }

  window.openTestWelcome = open;

  function init() {
    const badge = document.getElementById("idler-test-env-badge");
    if (badge) {
      badge.style.pointerEvents = "auto";
      badge.style.cursor = "pointer";
      badge.title = "Informacje o wersji testowej";
      badge.addEventListener("click", open);
    }

    if (!seen()) setTimeout(open, 700);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
