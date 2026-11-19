/*
 * Zmiana rozmiaru okien czatu i wiadomości prywatnych (komputer).
 * Uchwyty: górna krawędź (wysokość), prawa krawędź (szerokość) i prawy górny róg (obie).
 * Okna stoją w lewym dolnym rogu, więc rosną w górę i w prawo. Rozmiar jest wspólny dla czatu
 * i wiadomości i zapamiętuje się w przeglądarce. Dwuklik na uchwycie przywraca rozmiar domyślny.
 * Na telefonie (≤520 px) okna mają stały rozmiar, uchwyty są ukryte.
 */
(function () {
  const KEY = "idler_panel_size";
  const MIN_W = 300;
  const MIN_H = 240;
  const MARGIN = 12;
  const ROOT = document.documentElement;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function maxW() {
    return Math.max(MIN_W, window.innerWidth - MARGIN * 2);
  }

  function maxH() {
    return Math.max(MIN_H, window.innerHeight - 110);
  }

  function apply(width, height) {
    if (width) ROOT.style.setProperty("--panel-w", clamp(Math.round(width), MIN_W, maxW()) + "px");
    if (height) ROOT.style.setProperty("--panel-h", clamp(Math.round(height), MIN_H, maxH()) + "px");
  }

  function save(panel) {
    const rect = panel.getBoundingClientRect();

    try {
      window.localStorage.setItem(KEY, JSON.stringify({ w: Math.round(rect.width), h: Math.round(rect.height) }));
    } catch (e) {
      /* brak zapisu: rozmiar działa do odświeżenia */
    }
  }

  function reset(panel) {
    ROOT.style.removeProperty("--panel-w");
    ROOT.style.removeProperty("--panel-h");

    try {
      window.localStorage.removeItem(KEY);
    } catch (e) {
      /* nic do usunięcia */
    }
  }

  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || "null");

    if (saved && Number(saved.w) > 0 && Number(saved.h) > 0) {
      apply(Number(saved.w), Number(saved.h));
    }
  } catch (e) {
    /* uszkodzony zapis: rozmiar domyślny */
  }

  function enable(panel) {
    if (!panel || panel.dataset.resizable === "1") return;

    panel.dataset.resizable = "1";

    ["top", "right", "corner"].forEach((kind) => {
      const handle = document.createElement("div");
      handle.className = "panel-resize panel-resize-" + kind;
      handle.setAttribute("aria-hidden", "true");
      handle.title = "Przeciągnij, aby zmienić rozmiar (dwuklik: domyślny)";
      panel.appendChild(handle);

      handle.addEventListener("dblclick", () => reset(panel));

      handle.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;

        event.preventDefault();
        handle.setPointerCapture(event.pointerId);

        const start = panel.getBoundingClientRect();
        const x0 = event.clientX;
        const y0 = event.clientY;
        document.body.classList.add("panel-resizing");

        const move = (e) => {
          const width = kind === "top" ? null : start.width + (e.clientX - x0);
          const height = kind === "right" ? null : start.height - (e.clientY - y0);
          apply(width, height);
        };

        const end = () => {
          handle.removeEventListener("pointermove", move);
          handle.removeEventListener("pointerup", end);
          handle.removeEventListener("pointercancel", end);
          document.body.classList.remove("panel-resizing");
          save(panel);
        };

        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", end);
        handle.addEventListener("pointercancel", end);
      });
    });
  }

  window.addEventListener("resize", () => {
    const style = ROOT.style;

    if (style.getPropertyValue("--panel-w") || style.getPropertyValue("--panel-h")) {
      const w = parseFloat(style.getPropertyValue("--panel-w"));
      const h = parseFloat(style.getPropertyValue("--panel-h"));
      apply(w || null, h || null);
    }
  });

  window.IdlerPanelResize = { enable, reset };
})();
