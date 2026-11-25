/*
 * Zgłaszanie błędów i pomysłów (Społeczność -> Zgłoś błąd).
 * Wysyła tekst + niewielki kontekst techniczny przez RPC idler_submit_report.
 */
(function () {
  const CONTAINER_ID = "bugreport-content";
  const MIN = 10;
  const MAX = 1500;
  const CATEGORIES = [
    { id: "bug", label: "🐞 Błąd" },
    { id: "idea", label: "💡 Pomysł" },
    { id: "other", label: "💬 Inne" },
  ];

  let category = "bug";
  let draft = "";
  let sending = false;
  let notice = null; // { text, ok }
  let screenshot = null; // data URL (JPEG) zmniejszonego zrzutu
  let screenshotBusy = false;

  const MAX_SIDE = 1280;
  const MAX_DATA_LENGTH = 380000;

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("bad image"));
      };
      img.src = url;
    });
  }

  // Zmniejsza obraz i zapisuje jako JPEG, aż zmieści się w limicie.
  async function compressImage(file) {
    const img = await loadImage(file);
    let side = MAX_SIDE;
    let quality = 0.75;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);

      if (dataUrl.length <= MAX_DATA_LENGTH) {
        return dataUrl;
      }

      side = Math.round(side * 0.8);
      quality = Math.max(0.4, quality - 0.08);
    }

    throw new Error("too big");
  }

  async function attachFile(file) {
    if (!file || !/^image\//.test(file.type)) {
      notice = { ok: false, text: "Wybierz plik graficzny (zrzut ekranu)." };
      render();
      return;
    }

    screenshotBusy = true;
    notice = null;
    render();

    try {
      screenshot = await compressImage(file);
    } catch (error) {
      screenshot = null;
      notice = { ok: false, text: "Nie udało się wczytać tego obrazu." };
    }

    screenshotBusy = false;
    render();
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function getClient() {
    return window.IdlerAccounts?.getClient?.() || null;
  }

  function isSignedIn() {
    return window.IdlerAccounts?.getState?.().status === "signedIn";
  }

  function collectContext() {
    const screen =
      [...document.querySelectorAll(".screen")].find(
        (node) => node.offsetParent !== null,
      )?.id || "";

    return {
      screen,
      level: typeof player !== "undefined" ? player.level : null,
      location: typeof player !== "undefined" ? player.location : null,
      viewport: window.innerWidth + "x" + window.innerHeight,
      ua: String(navigator.userAgent || "").slice(0, 160),
      page: String(location.host || "file").slice(0, 60),
      version: String(window.IDLER_VERSION || "").slice(0, 20),
      env: String(window.IDLER_ONLINE_ENV || "prod").slice(0, 10),
    };
  }

  function render() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    container.replaceChildren();

    if (!isSignedIn()) {
      container.appendChild(
        el(
          "p",
          "ranking-message",
          "Zgłaszanie błędów wymaga zalogowanego konta (i skonfigurowanego Supabase).",
        ),
      );
      return;
    }

    container.appendChild(
      el(
        "p",
        "bugreport-intro",
        "Znalazłeś błąd albo masz pomysł? Opisz to własnymi słowami. Do zgłoszenia dołączymy automatycznie ekran, poziom i typ przeglądarki.",
      ),
    );

    const tabs = el("div", "ranking-tabs");
    CATEGORIES.forEach((item) => {
      const tab = el("button", "ranking-tab", item.label);
      tab.type = "button";
      tab.setAttribute("aria-selected", item.id === category ? "true" : "false");
      tab.addEventListener("click", () => {
        draft = textarea.value;
        category = item.id;
        render();
      });
      tabs.appendChild(tab);
    });
    container.appendChild(tabs);

    const textarea = el("textarea", "bugreport-text");
    textarea.maxLength = MAX;
    textarea.rows = 7;
    textarea.value = draft;
    textarea.placeholder =
      category === "bug"
        ? "Co się stało? Co robiłeś tuż przed tym i co powinno się wydarzyć?"
        : category === "idea"
          ? "Opisz swój pomysł na grę."
          : "Napisz, co chcesz nam przekazać.";
    textarea.disabled = sending;
    container.appendChild(textarea);

    const counter = el("div", "bugreport-counter");
    const updateCounter = () => {
      counter.textContent = textarea.value.length + " / " + MAX;
    };
    updateCounter();
    textarea.addEventListener("input", () => {
      draft = textarea.value;
      updateCounter();
    });
    textarea.addEventListener("paste", (event) => {
      const items = event.clipboardData ? Array.from(event.clipboardData.files || []) : [];
      const image = items.find((item) => /^image\//.test(item.type));

      if (image) {
        event.preventDefault();
        draft = textarea.value;
        attachFile(image);
      }
    });
    container.appendChild(counter);

    const shotRow = el("div", "bugreport-shot");
    const file = el("input");
    file.type = "file";
    file.accept = "image/*";
    file.hidden = true;
    file.addEventListener("change", () => {
      draft = textarea.value;
      if (file.files && file.files[0]) attachFile(file.files[0]);
    });
    shotRow.appendChild(file);

    const pick = el(
      "button",
      "admin-btn bugreport-attach",
      screenshotBusy ? "Przetwarzanie…" : screenshot ? "📎 Zmień zrzut ekranu" : "📎 Dodaj zrzut ekranu",
    );
    pick.type = "button";
    pick.disabled = sending || screenshotBusy;
    pick.addEventListener("click", () => file.click());
    shotRow.appendChild(pick);
    shotRow.appendChild(el("span", "forum-meta", "albo wklej obraz (Ctrl+V) w pole opisu"));

    if (screenshot) {
      const preview = el("div", "bugreport-preview");
      const img = el("img");
      img.alt = "Podgląd zrzutu ekranu";
      img.src = screenshot;
      preview.appendChild(img);
      const remove = el("button", "admin-btn", "✕ Usuń zrzut");
      remove.type = "button";
      remove.addEventListener("click", () => {
        draft = textarea.value;
        screenshot = null;
        render();
      });
      preview.appendChild(remove);
      shotRow.appendChild(preview);
    }

    container.appendChild(shotRow);

    if (notice) {
      container.appendChild(
        el("p", notice.ok ? "bugreport-ok" : "chat-error bugreport-error", notice.text),
      );
    }

    const send = el("button", "game-dialog-confirm bugreport-send", sending ? "Wysyłanie…" : "Wyślij zgłoszenie");
    send.type = "button";
    send.disabled = sending;
    send.addEventListener("click", () => submit(textarea.value));
    container.appendChild(send);
  }

  async function submit(text) {
    const body = String(text || "").trim();
    draft = text;

    if (body.length < MIN) {
      notice = { ok: false, text: "Opisz to trochę dokładniej (min. " + MIN + " znaków)." };
      render();
      return;
    }

    const client = getClient();
    if (!client || sending) return;

    sending = true;
    notice = null;
    render();

    let result;
    try {
      result = await client.rpc("idler_submit_report", {
        p_category: category,
        p_body: body,
        p_context: collectContext(),
        p_screenshot: screenshot,
      });
    } catch (error) {
      result = { error };
    }

    sending = false;
    const data = result && result.data;

    if (result && !result.error && data && data.ok === true) {
      draft = "";
      screenshot = null;
      notice = { ok: true, text: "Dziękujemy! Zgłoszenie zostało wysłane." };
      if (typeof showNotification === "function") {
        showNotification("📨 Zgłoszenie wysłane. Dziękujemy!", "success");
      }
    } else {
      notice = {
        ok: false,
        text:
          data && data.message
            ? data.message
            : "Nie udało się wysłać zgłoszenia. Jeśli to się powtarza, uruchom w Supabase plik supabase/bug_reports.sql.",
      };
    }

    render();
  }

  window.openBugReportScreen = function openBugReportScreen() {
    if (typeof showScreen === "function") {
      showScreen("screen-bugreport");
    }
    notice = null;
    render();
  };

  function onAccountState() {
    const screen = document.getElementById("screen-bugreport");
    if (screen && screen.offsetParent !== null && !sending) {
      render();
    }
  }

  function start() {
    window.IdlerAccounts?.subscribe?.(onAccountState);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.IdlerBugReportUI = { render };
})();
