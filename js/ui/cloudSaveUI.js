/*
 * Interfejs zapisu w chmurze: blok w karcie "Konto" (status i przyciski)
 * oraz okno wyboru przy konflikcie zapisów.
 * Logika jest w js/online/cloudSave.js.
 */
const IdlerCloudSaveUI = (function () {
  let overlay = null;
  let shownConflictKey = null;
  let busy = false;

  function cloud() {
    return window.IdlerCloudSave || null;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);

    if (className) {
      node.className = className;
    }

    if (text !== undefined) {
      node.textContent = text;
    }

    return node;
  }

  function formatTime(value) {
    if (!value) {
      return "nieznany czas";
    }

    try {
      return new Date(value).toLocaleString("pl-PL");
    } catch (error) {
      return "nieznany czas";
    }
  }

  function notify(text) {
    if (typeof showNotification === "function") {
      showNotification(text, "success");
    }
  }

  // ---------- Blok w karcie Konto ----------

  function statusText(state) {
    switch (state.status) {
      case "checking":
        return "Sprawdzanie zapisu w chmurze...";
      case "uploading":
        return "Wysyłanie zapisu do chmury...";
      case "synced":
        return state.lastSyncedAt
          ? "Zsynchronizowano o " +
              new Date(state.lastSyncedAt).toLocaleTimeString("pl-PL")
          : "Zsynchronizowano.";
      case "offline":
        return "Brak połączenia z serwerem. Spróbuję ponownie.";
      case "error":
        return state.message || "Błąd zapisu w chmurze.";
      case "conflict":
        return "Zapis na tym urządzeniu i w chmurze się różnią. Wybierz, który zachować.";
      default:
        return "";
    }
  }

  function buildBlock() {
    const api = cloud();
    const block = el("div", "cloud-save-block");

    if (!api) {
      return block;
    }

    const state = api.getState();

    if (state.status === "off") {
      return block;
    }

    block.appendChild(el("p", "account-card-status", "☁️ Zapis w chmurze: " + statusText(state)));

    if (state.flagged) {
      block.appendChild(
        el(
          "p",
          "account-card-hint",
          "⚠️ Serwer oznaczył Twój postęp jako wymagający weryfikacji. Zapis jest bezpieczny, ale na razie nie jesteś w rankingu.",
        ),
      );
    }

    const actions = el("div", "account-card-actions");

    if (state.status === "conflict") {
      const resolve = el("button", "", "⚖️ Rozwiąż konflikt");
      resolve.type = "button";
      resolve.addEventListener("click", () => openConflictDialog(true));
      actions.appendChild(resolve);
    } else {
      const upload = el("button", "", "☁️ Wyślij teraz");
      upload.type = "button";
      upload.disabled = state.status === "checking" || state.status === "uploading";
      upload.addEventListener("click", async () => {
        const result = await api.manualUpload();

        if (result && result.ok) {
          notify("Zapis wysłany do chmury.");
        }
      });
      actions.appendChild(upload);

      const download = el("button", "", "⬇️ Wczytaj z chmury");
      download.type = "button";
      download.disabled = state.status === "checking" || state.status === "uploading";
      download.addEventListener("click", async () => {
        const confirmed =
          typeof showGameConfirm === "function"
            ? await showGameConfirm(
                "Wczytać zapis z chmury? Obecny zapis z tego urządzenia zostanie zastąpiony (kopia trafi do „Przywróć kopię” w Ustawieniach).",
                { title: "Wczytanie z chmury", confirmText: "Wczytaj" },
              )
            : window.confirm("Wczytać zapis z chmury?");

        if (confirmed) {
          const result = await api.manualDownload();

          if (result && result.ok === false && result.error) {
            notify(result.error);
          }
        }
      });
      actions.appendChild(download);
    }

    block.appendChild(actions);
    return block;
  }

  // ---------- Okno konfliktu ----------

  function closeDialog() {
    if (!overlay) {
      return;
    }

    document.removeEventListener("keydown", onKeyDown, true);
    overlay.remove();
    overlay = null;
    busy = false;
  }

  function onKeyDown(event) {
    if (event.key === "Escape" && !busy) {
      event.preventDefault();
      event.stopPropagation();
      closeDialog();
    }
  }

  function buildOption(config) {
    const option = el("div", "cloud-option");
    option.appendChild(el("div", "cloud-option-title", config.title));

    if (config.details) {
      option.appendChild(el("div", "cloud-option-details", config.details));
    }

    if (config.note) {
      option.appendChild(el("div", "cloud-option-note", config.note));
    }

    const button = el("button", config.primary ? "game-dialog-confirm" : "", config.button);
    button.type = "button";
    button.addEventListener("click", () => config.onClick(button));
    option.appendChild(button);

    return option;
  }

  async function choose(choice, message) {
    const api = cloud();

    if (!api || busy) {
      return;
    }

    busy = true;
    overlay?.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });

    const result = await api.resolveConflict(choice);

    busy = false;

    if (result && result.ok) {
      closeDialog();

      if (message) {
        notify(message);
      }

      return;
    }

    overlay?.querySelectorAll("button").forEach((button) => {
      button.disabled = false;
    });

    const status = overlay?.querySelector(".cloud-dialog-error");

    if (status) {
      status.textContent =
        (result && result.error) || "Nie udało się. Spróbuj ponownie.";
    }
  }

  function describeSave(save) {
    return "Poziom " + save.level + " · zapisano: " + formatTime(save.time);
  }

  function buildDialog(conflict) {
    const dialog = el("section", "game-dialog account-dialog cloud-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");

    const body = el("div", "game-dialog-message");
    const options = el("div", "cloud-options");
    const error = el("p", "account-message error cloud-dialog-error");
    error.setAttribute("role", "alert");

    let title = "Który zapis zachować?";

    const local = conflict.local;
    const remote = conflict.cloud;
    const cloudNewer = remote && remote.time > local.time;

    if (conflict.kind === "foreign-new") {
      title = "Zapis innego konta";
      body.appendChild(
        el(
          "p",
          "",
          "Na tym urządzeniu jest zapis postaci innego konta, a Twoje konto nie ma jeszcze zapisu w chmurze. Zacznij nową postać (poprzedni zapis zostanie zachowany jako kopia zapasowa) albo wyloguj się.",
        ),
      );
      options.appendChild(
        buildOption({
          title: "Nowa postać na tym koncie",
          details: "Zaczniesz od poziomu 1.",
          button: "Zacznij nową postać",
          primary: true,
          onClick: () => choose("new", "Rozpoczęto nową postać."),
        }),
      );
      options.appendChild(
        buildOption({
          title: "Zostaw ten zapis",
          details: "Wyloguj się i zaloguj na właściwe konto.",
          button: "Wyloguj się",
          onClick: async () => {
            const accounts = window.IdlerAccounts;

            closeDialog();

            if (accounts) {
              await accounts.signOut();
            }
          },
        }),
      );
    } else {
      if (conflict.kind === "pristine-guard") {
        title = "Czy zacząć od nowa?";
        body.appendChild(
          el(
            "p",
            "",
            "Ta postać jest na początku gry, a w chmurze masz zaawansowaną postać. Jeśli to nie był świadomy reset, wczytaj zapis z chmury.",
          ),
        );
      } else if (conflict.kind === "first-sync") {
        body.appendChild(
          el(
            "p",
            "",
            "Twoje konto ma już zapis w chmurze, a na tym urządzeniu jest inny. Wybierz, który zachować. Drugi zostanie utracony (zapis lokalny zachowamy jako kopię zapasową).",
          ),
        );
      } else {
        body.appendChild(
          el(
            "p",
            "",
            "Zapis w chmurze zmienił się na innym urządzeniu, a ten też został zmieniony. Wybierz, który zachować.",
          ),
        );
      }

      options.appendChild(
        buildOption({
          title: "☁️ Zapis z chmury",
          details: describeSave(remote),
          note: cloudNewer ? "nowszy" : "",
          button: "Użyj zapisu z chmury",
          primary: cloudNewer || conflict.kind === "pristine-guard",
          onClick: () => choose("cloud", "Wczytano zapis z chmury."),
        }),
      );
      options.appendChild(
        buildOption({
          title: "💻 Zapis z tego urządzenia",
          details: describeSave(local),
          note: !cloudNewer && conflict.kind !== "pristine-guard" ? "nowszy" : "",
          button:
            conflict.kind === "pristine-guard"
              ? "Zacznij od nowa i nadpisz chmurę"
              : "Użyj zapisu z tego urządzenia",
          primary: !cloudNewer && conflict.kind !== "pristine-guard",
          onClick: () => choose("local", "Zapis wysłany do chmury."),
        }),
      );
    }

    dialog.appendChild(el("h2", "game-dialog-title", title));
    body.appendChild(options);
    body.appendChild(error);
    dialog.appendChild(body);

    const actions = el("div", "game-dialog-actions");
    const later = el("button", "game-dialog-cancel", "Zdecyduję później");
    later.type = "button";
    later.addEventListener("click", () => {
      if (!busy) {
        closeDialog();
      }
    });
    actions.appendChild(later);
    dialog.appendChild(actions);

    return dialog;
  }

  function openConflictDialog(force) {
    const api = cloud();
    const conflict = api?.getConflict();

    if (!conflict) {
      return;
    }

    const key =
      conflict.kind +
      ":" +
      conflict.local.time +
      ":" +
      (conflict.cloud ? conflict.cloud.revision : "none");

    if (!force && key === shownConflictKey) {
      return;
    }

    shownConflictKey = key;
    closeDialog();

    overlay = el("div", "game-dialog-overlay");
    overlay.appendChild(buildDialog(conflict));
    document.body.appendChild(overlay);
    document.addEventListener("keydown", onKeyDown, true);

    const firstButton = overlay.querySelector(".cloud-option button");

    if (firstButton) {
      firstButton.focus();
    }
  }

  // ---------- Start ----------

  function onCloudState(state) {
    if (window.IdlerAccountUI && typeof window.IdlerAccountUI.renderCard === "function") {
      window.IdlerAccountUI.renderCard();
    }

    if (state.status === "conflict") {
      openConflictDialog(false);
    } else if (overlay && state.status !== "uploading") {
      closeDialog();
      shownConflictKey = null;
    }
  }

  function start() {
    const api = cloud();

    if (!api) {
      return;
    }

    api.subscribe(onCloudState);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  return { buildBlock };
})();

window.IdlerCloudSaveUI = IdlerCloudSaveUI;
