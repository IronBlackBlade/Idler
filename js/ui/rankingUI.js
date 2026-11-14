/*
 * Ranking graczy (dane liczy serwer z zapisów sprawdzonych w idler_submit_save).
 * Zakładki: Poziom / Bossowie / Zabite potwory.
 */
(function () {
  const CONTAINER_ID = "ranking-content";
  const METRICS = [
    { id: "level", label: "Poziom", unit: "" },
    { id: "bosses", label: "Bossowie", unit: "" },
    { id: "kills", label: "Zabite potwory", unit: "" },
  ];

  let metric = "level";
  let loading = false;
  let requestId = 0;

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

  function formatNumber(value) {
    const number = Number(value);

    return Number.isFinite(number) ? number.toLocaleString("pl-PL") : String(value);
  }

  function getClient() {
    return window.IdlerAccounts?.getClient?.() || null;
  }

  function isSignedIn() {
    return window.IdlerAccounts?.getState?.().status === "signedIn";
  }

  function message(container, text) {
    container.appendChild(el("p", "ranking-message", text));
  }

  async function render() {
    const container = document.getElementById(CONTAINER_ID);

    if (!container) {
      return;
    }

    const current = ++requestId;
    container.replaceChildren();

    const tabs = el("div", "ranking-tabs");
    METRICS.forEach((item) => {
      const tab = el("button", "ranking-tab", item.label);
      tab.type = "button";
      tab.setAttribute("aria-selected", item.id === metric ? "true" : "false");
      tab.addEventListener("click", () => {
        metric = item.id;
        render();
      });
      tabs.appendChild(tab);
    });
    container.appendChild(tabs);

    if (!isSignedIn() || !getClient()) {
      message(container, "Zaloguj się na konto (Ustawienia → Konto), aby zobaczyć ranking.");
      return;
    }

    const status = el("p", "ranking-message", "Ładowanie rankingu...");
    container.appendChild(status);
    loading = true;

    let list;
    let mine;

    try {
      const client = getClient();
      const [listResult, mineResult] = await Promise.all([
        client.rpc("idler_get_ranking", { p_metric: metric, p_limit: 50 }),
        client.rpc("idler_my_rank", { p_metric: metric }),
      ]);

      if (listResult.error) {
        throw listResult.error;
      }

      list = listResult.data || [];
      mine = mineResult.error ? null : (mineResult.data || [])[0] || null;
    } catch (error) {
      if (current !== requestId) {
        return;
      }

      loading = false;
      const text = String(error?.message || "");
      status.textContent =
        error?.code === "42883" || error?.code === "PGRST202" || text.includes("idler_get_ranking")
          ? "Ranking nie jest jeszcze włączony na serwerze (uruchom supabase/anticheat_ranking.sql)."
          : "Nie udało się pobrać rankingu. Spróbuj ponownie.";
      const retry = el("button", "", "Spróbuj ponownie");
      retry.type = "button";
      retry.addEventListener("click", render);
      container.appendChild(retry);
      return;
    }

    if (current !== requestId) {
      return;
    }

    loading = false;
    status.remove();

    if (mine) {
      const box = el("div", "ranking-mine");

      if (mine.flagged) {
        box.classList.add("flagged");
        box.textContent =
          "Twój postęp czeka na weryfikację, więc na razie nie jesteś w rankingu.";
      } else if (mine.rank) {
        box.textContent =
          "Twoje miejsce: " +
          mine.rank +
          " z " +
          mine.total_players +
          " (" +
          formatNumber(mine.value) +
          ")";
      } else {
        box.textContent = "Twój wynik pojawi się w rankingu po pierwszej synchronizacji zapisu.";
      }

      container.appendChild(box);
    }

    if (list.length === 0) {
      message(container, "Ranking jest jeszcze pusty.");
    } else {
      const table = el("ol", "ranking-list");

      list.forEach((row) => {
        const item = el("li", "ranking-row" + (row.is_me ? " me" : ""));
        item.appendChild(el("span", "ranking-pos", "#" + row.rank));
        const name = el("button", "ranking-name", row.username);
        name.type = "button";
        name.title = "Pokaż profil";
        name.addEventListener("click", () => openProfile(row.username));
        item.appendChild(name);
        item.appendChild(el("span", "ranking-level", "poz. " + row.level));
        item.appendChild(el("span", "ranking-value", formatNumber(row.value)));
        table.appendChild(item);
      });

      container.appendChild(table);
    }

    const refresh = el("button", "ranking-refresh", "🔄 Odśwież");
    refresh.type = "button";
    refresh.addEventListener("click", render);
    container.appendChild(refresh);
    container.appendChild(
      el(
        "p",
        "ranking-hint",
        "Wyniki liczy serwer z wysłanych zapisów (synchronizacja co kilka minut).",
      ),
    );
  }

  const SLOT_LABELS = [
    ["weapon", "Broń"],
    ["shield", "Tarcza"],
    ["helmet", "Hełm"],
    ["armor", "Pancerz"],
    ["pants", "Spodnie"],
    ["boots", "Buty"],
    ["gloves", "Rękawice"],
    ["ring", "Pierścień"],
    ["amulet", "Amulet"],
    ["talisman", "Talizman"],
  ];

  function itemName(id) {
    try {
      if (typeof items !== "undefined" && items[id] && items[id].name) {
        return items[id].name;
      }
    } catch (error) {
      /* brak definicji */
    }

    return "Nieznany przedmiot";
  }

  function className(id) {
    try {
      if (id && typeof characterClasses !== "undefined" && characterClasses[id]) {
        return characterClasses[id].name || id;
      }
    } catch (error) {
      /* brak definicji */
    }

    return "brak klasy";
  }

  let profileOverlay = null;

  function closeProfile() {
    if (!profileOverlay) {
      return;
    }

    document.removeEventListener("keydown", onProfileKey, true);
    profileOverlay.remove();
    profileOverlay = null;
  }

  function onProfileKey(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeProfile();
    }
  }

  function buildProfile(data) {
    const dialog = el("section", "game-dialog account-dialog ranking-profile");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.appendChild(el("h2", "game-dialog-title", "🧙 " + data.username));

    const body = el("div", "game-dialog-message");
    const facts = el("div", "profile-facts");
    [
      ["Poziom", formatNumber(data.level)],
      ["Klasa", className(data.class_id)],
      ["Zabite potwory", formatNumber(data.total_kills)],
      ["Bossowie", formatNumber(data.boss_kills)],
      ["Elity", formatNumber(data.elite_kills)],
      ["Punkty osiągnięć", formatNumber(data.achievement_points)],
    ].forEach(([label, value]) => {
      const row = el("div", "profile-fact");
      row.appendChild(el("span", "profile-label", label));
      row.appendChild(el("span", "profile-value", value));
      facts.appendChild(row);
    });
    body.appendChild(facts);

    if (data.flagged) {
      body.appendChild(
        el("p", "ranking-hint", "Postęp tego gracza czeka na weryfikację (poza rankingiem)."),
      );
    }

    body.appendChild(el("h3", "profile-subtitle", "Założony sprzęt"));
    const gear = el("div", "profile-facts");
    const equipment = data.equipment || {};
    let any = false;

    SLOT_LABELS.forEach(([slot, label]) => {
      if (!equipment[slot]) {
        return;
      }

      any = true;
      const row = el("div", "profile-fact");
      row.appendChild(el("span", "profile-label", label));
      row.appendChild(el("span", "profile-value", itemName(equipment[slot])));
      gear.appendChild(row);
    });

    if (!any) {
      gear.appendChild(el("p", "ranking-hint", "Brak założonego sprzętu."));
    }

    body.appendChild(gear);
    dialog.appendChild(body);

    const actions = el("div", "game-dialog-actions");
    const close = el("button", "game-dialog-cancel", "Zamknij");
    close.type = "button";
    close.addEventListener("click", closeProfile);
    actions.appendChild(close);
    dialog.appendChild(actions);

    return dialog;
  }

  async function openProfile(username) {
    const client = getClient();

    if (!client) {
      return;
    }

    closeProfile();
    profileOverlay = el("div", "game-dialog-overlay");
    const loadingDialog = el("section", "game-dialog account-dialog ranking-profile");
    loadingDialog.appendChild(el("p", "ranking-message", "Ładowanie profilu..."));
    profileOverlay.appendChild(loadingDialog);
    document.body.appendChild(profileOverlay);
    document.addEventListener("keydown", onProfileKey, true);
    profileOverlay.addEventListener("click", (event) => {
      if (event.target === profileOverlay) {
        closeProfile();
      }
    });

    const overlayRef = profileOverlay;
    let result;

    try {
      result = await client.rpc("idler_get_profile", { p_username: username });
    } catch (error) {
      result = { error };
    }

    if (profileOverlay !== overlayRef) {
      return;
    }

    const data = result.data;

    if (result.error || !data || data.ok !== true) {
      const missing = data && (data.error === "not_found" || data.error === "no_data");
      loadingDialog.replaceChildren();
      loadingDialog.appendChild(
        el(
          "p",
          "ranking-message",
          missing
            ? "Nie znaleziono profilu tego gracza."
            : "Nie udało się pobrać profilu. Jeśli to się powtarza, uruchom ponownie supabase/anticheat_ranking.sql.",
        ),
      );
      const close = el("button", "game-dialog-cancel", "Zamknij");
      close.type = "button";
      close.addEventListener("click", closeProfile);
      loadingDialog.appendChild(close);
      return;
    }

    profileOverlay.replaceChildren(buildProfile(data));
  }

  window.openRankingScreen = function openRankingScreen() {
    if (typeof showScreen === "function") {
      showScreen("screen-ranking");
    }

    render();
  };

  window.IdlerRankingUI = { render, isLoading: () => loading };
})();
