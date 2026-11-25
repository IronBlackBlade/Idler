/*
 * Panel administratora (Społeczność -> Panel admina). Widoczny tylko dla kont dopisanych
 * w tabeli idler_admins (supabase/admin.sql). Uprawnienia sprawdza serwer przy każdej akcji.
 */
(function () {
  const CONTAINER_ID = "admin-content";
  const TABS = [
    { id: "players", label: "👤 Gracze" },
    { id: "chat", label: "💬 Czat" },
    { id: "dm", label: "✉ Prywatne" },
    { id: "bugs", label: "🐞 Błędy" },
    { id: "log", label: "📜 Dziennik" },
  ];
  const MUTE_OPTIONS = [
    { minutes: 15, label: "15 min" },
    { minutes: 60, label: "1 godz." },
    { minutes: 1440, label: "24 godz." },
    { minutes: 10080, label: "7 dni" },
  ];
  const BUG_STATUSES = [
    { id: "new", label: "Nowe" },
    { id: "seen", label: "Widziane" },
    { id: "done", label: "Zrobione" },
    { id: "rejected", label: "Odrzucone" },
  ];
  const ACTION_LABELS = {
    clear_flag: "zdjął flagę",
    dm_report_closed: "zamknął zgłoszenie wiadomości prywatnej",
    set_flag: "oflagował",
    mute: "wyciszył",
    unmute: "zdjął wyciszenie",
    ban: "zbanował",
    unban: "odbanował",
    chat_delete: "usunął z czatu",
    bug_status: "zmienił status zgłoszenia",
    forum_update: "zmienił wpis na forum",
    forum_hide_comment: "ukrył komentarz na forum",
  };

  let isAdmin = false;
  let tab = "players";
  let query = "";
  let reason = "";
  let bugStatus = "new";
  let data = null;
  let loading = false;
  let message = null; // { text, ok }
  let requestId = 0;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(text, className, onClick) {
    const node = el("button", className, text);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  function getClient() {
    return window.IdlerAccounts?.getClient?.() || null;
  }

  function isSignedIn() {
    return window.IdlerAccounts?.getState?.().status === "signedIn";
  }

  function formatDateTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  async function call(name, args) {
    const client = getClient();
    if (!client) return { error: new Error("no client") };
    try {
      return await client.rpc(name, args || {});
    } catch (e) {
      return { error: e };
    }
  }

  function isOk(result) {
    return result && !result.error && result.data && result.data.ok === true;
  }

  function failText(result) {
    return result && result.data && result.data.message
      ? result.data.message
      : "Operacja nie powiodła się. Sprawdź, czy uruchomiono supabase/admin.sql.";
  }

  function confirmAction(text, title, confirmText) {
    if (typeof showGameConfirm === "function") {
      return showGameConfirm(text, { title, confirmText });
    }
    return Promise.resolve(window.confirm(text));
  }

  // ---------- Dostęp ----------

  function updateMenu() {
    const item = document.querySelector('#menu [data-menu-section="admin"]');
    if (item) item.hidden = !isAdmin;
  }

  async function checkAdmin() {
    if (!isSignedIn()) {
      const was = isAdmin;
      isAdmin = false;
      updateMenu();

      if (was) {
        window.dispatchEvent(new CustomEvent("idler-admin-change"));
      }

      return;
    }

    const before = isAdmin;
    const result = await call("idler_is_admin");
    isAdmin = !result.error && result.data === true;
    updateMenu();

    if (isAdmin !== before) {
      window.dispatchEvent(new CustomEvent("idler-admin-change"));
    }
  }

  // ---------- Dane zakładek ----------

  async function load() {
    const current = ++requestId;
    loading = true;
    data = null;
    render();

    let result;
    if (tab === "players") result = await call("idler_admin_find", { p_query: query });
    else if (tab === "chat") result = await call("idler_admin_chat_reports");
    else if (tab === "dm") result = await call("idler_admin_dm_reports");
    else if (tab === "bugs") result = await call("idler_admin_bug_reports", { p_status: bugStatus });
    else result = await call("idler_admin_log_list");

    if (current !== requestId) return;
    loading = false;

    if (isOk(result)) {
      data = result.data;
    } else {
      message = { ok: false, text: failText(result) };
    }
    render();
  }

  async function act(name, args, successText, needsConfirm) {
    if (needsConfirm) {
      const yes = await confirmAction(needsConfirm.text, needsConfirm.title, needsConfirm.confirmText);
      if (!yes) return;
    }

    const result = await call(name, args);
    message = isOk(result) ? { ok: true, text: successText } : { ok: false, text: failText(result) };
    await load();
  }

  // ---------- Widoki ----------

  function badge(text, className) {
    return el("span", "admin-badge " + (className || ""), text);
  }

  function renderPlayers(root) {
    const form = el("div", "admin-search");
    const input = el("input", "forum-input");
    input.type = "text";
    input.placeholder = "Nazwa gracza (początek nazwy)";
    input.maxLength = 20;
    input.value = query;
    input.addEventListener("input", () => (query = input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        message = null;
        load();
      }
    });
    form.appendChild(input);
    form.appendChild(
      button("Szukaj", "game-dialog-confirm", () => {
        message = null;
        load();
      }),
    );
    root.appendChild(form);

    const why = el("input", "forum-input");
    why.type = "text";
    why.maxLength = 150;
    why.placeholder = "Powód (opcjonalnie, dla wyciszenia/bana/flagi)";
    why.value = reason;
    why.addEventListener("input", () => (reason = why.value));
    root.appendChild(why);

    if (!data) return;

    if (data.players.length === 0) {
      root.appendChild(el("p", "ranking-message", "Nie znaleziono graczy."));
      return;
    }

    data.players.forEach((player) => {
      const card = el("div", "admin-card");
      const head = el("div", "forum-head");
      head.appendChild(el("strong", "", player.username));
      head.appendChild(el("span", "forum-meta", "poz. " + (player.level ?? "?")));
      if (player.is_admin) head.appendChild(badge("admin", "ok"));
      if (player.banned) head.appendChild(badge("ZBANOWANY", "bad"));
      if (player.flagged && !player.banned) head.appendChild(badge("flaga", "warn"));
      if (player.muted_until) head.appendChild(badge("wyciszony do " + formatDateTime(player.muted_until), "warn"));
      card.appendChild(head);

      if (player.flagged && player.flag_reason && !player.banned) {
        card.appendChild(el("div", "forum-meta", "Powód flagi: " + player.flag_reason));
      }
      if (player.banned && player.ban_reason) {
        card.appendChild(el("div", "forum-meta", "Powód bana: " + player.ban_reason));
      }

      if (!player.is_admin) {
        const actions = el("div", "admin-actions");

        if (player.flagged && !player.banned) {
          actions.appendChild(
            button("Zdejmij flagę", "admin-btn", () =>
              act("idler_admin_clear_flag", { p_user_id: player.user_id }, "Zdjęto flagę: " + player.username),
            ),
          );
        } else if (!player.flagged) {
          actions.appendChild(
            button("Oflaguj", "admin-btn", () =>
              act(
                "idler_admin_set_flag",
                { p_user_id: player.user_id, p_reason: reason || null },
                "Oflagowano: " + player.username,
              ),
            ),
          );
        }

        const select = el("select", "admin-select");
        MUTE_OPTIONS.forEach((option) => {
          const node = el("option", "", option.label);
          node.value = String(option.minutes);
          select.appendChild(node);
        });
        actions.appendChild(select);
        actions.appendChild(
          button("Wycisz", "admin-btn", () =>
            act(
              "idler_admin_mute",
              { p_user_id: player.user_id, p_minutes: Number(select.value), p_reason: reason || null },
              "Wyciszono: " + player.username,
            ),
          ),
        );

        if (player.muted_until) {
          actions.appendChild(
            button("Zdejmij wyciszenie", "admin-btn", () =>
              act("idler_admin_unmute", { p_user_id: player.user_id }, "Zdjęto wyciszenie: " + player.username),
            ),
          );
        }

        if (player.banned) {
          actions.appendChild(
            button("Odbanuj", "admin-btn", () =>
              act("idler_admin_unban", { p_user_id: player.user_id }, "Odbanowano: " + player.username),
            ),
          );
        } else {
          actions.appendChild(
            button("Zbanuj", "admin-btn danger", () =>
              act(
                "idler_admin_ban",
                { p_user_id: player.user_id, p_reason: reason || null },
                "Zbanowano: " + player.username,
                {
                  text: "Zbanować gracza " + player.username + "? Nie będzie mógł się zalogować i zniknie z rankingu, czatu i forum.",
                  title: "Ban",
                  confirmText: "Zbanuj",
                },
              ),
            ),
          );
        }

        card.appendChild(actions);
      }

      root.appendChild(card);
    });
  }

  function renderChat(root) {
    if (!data) return;

    if (data.reports.length === 0) {
      root.appendChild(el("p", "ranking-message", "Brak zgłoszeń czatu."));
      return;
    }

    data.reports.forEach((report) => {
      const card = el("div", "admin-card");
      const head = el("div", "forum-head");
      head.appendChild(el("strong", "", report.reported_username || "?"));
      head.appendChild(el("span", "forum-meta", "zgłosił: " + (report.reporter || "?") + " · " + formatDateTime(report.created_at)));
      if (!report.message_exists) head.appendChild(badge("usunięta", "warn"));
      card.appendChild(head);
      card.appendChild(el("div", "admin-quote", report.reported_body || ""));
      if (report.reason) card.appendChild(el("div", "forum-meta", "Powód: " + report.reason));

      const actions = el("div", "admin-actions");
      if (report.message_exists) {
        actions.appendChild(
          button("Usuń wiadomość", "admin-btn", () =>
            act("idler_admin_chat_delete", { p_message_id: report.message_id }, "Usunięto wiadomość."),
          ),
        );
      }
      if (report.reported_user_id) {
        const select = el("select", "admin-select");
        MUTE_OPTIONS.forEach((option) => {
          const node = el("option", "", option.label);
          node.value = String(option.minutes);
          select.appendChild(node);
        });
        actions.appendChild(select);
        actions.appendChild(
          button("Wycisz autora", "admin-btn", () =>
            act(
              "idler_admin_mute",
              { p_user_id: report.reported_user_id, p_minutes: Number(select.value), p_reason: "zgłoszenie czatu" },
              "Wyciszono: " + report.reported_username,
            ),
          ),
        );
      }
      actions.appendChild(
        button("Odrzuć zgłoszenie", "admin-btn", () =>
          act("idler_admin_chat_dismiss", { p_report_id: report.id }, "Zgłoszenie odrzucone."),
        ),
      );
      card.appendChild(actions);
      root.appendChild(card);
    });
  }

  function renderDmReports(root) {
    if (!data) return;

    root.appendChild(
      el(
        "p",
        "forum-meta",
        "Widzisz tylko wiadomości zgłoszone przez graczy (zgłoszona i do 9 poprzednich z rozmowy). Pozostałe rozmowy są prywatne.",
      ),
    );

    if (data.reports.length === 0) {
      root.appendChild(el("p", "ranking-message", "Brak zgłoszeń wiadomości prywatnych."));
      return;
    }

    data.reports.forEach((report) => {
      const card = el("div", "admin-card");
      const head = el("div", "forum-head");
      head.appendChild(el("strong", "", report.reported_username || "?"));
      head.appendChild(el("span", "forum-meta", "zgłosił: " + (report.reporter || "?") + " · " + formatDateTime(report.created_at)));
      card.appendChild(head);

      const context = Array.isArray(report.context) ? report.context : [];
      if (context.length > 0) {
        const thread = el("div", "admin-quote");
        context.forEach((item) => {
          const line = el("div", item.from_reported ? "admin-dm-reported" : "admin-dm-other");
          line.textContent =
            (item.from_reported ? (report.reported_username || "?") : (report.reporter || "?")) + ": " + (item.body || "");
          if (item.from_reported && item.body === report.reported_body) {
            line.style.fontWeight = "700";
          }
          thread.appendChild(line);
        });
        card.appendChild(thread);
      } else {
        card.appendChild(el("div", "admin-quote", report.reported_body || ""));
      }

      if (report.reason) card.appendChild(el("div", "forum-meta", "Powód: " + report.reason));

      const actions = el("div", "admin-actions");
      if (report.reported_user_id) {
        const select = el("select", "admin-select");
        MUTE_OPTIONS.forEach((option) => {
          const node = el("option", "", option.label);
          node.value = String(option.minutes);
          select.appendChild(node);
        });
        actions.appendChild(select);
        actions.appendChild(
          button("Wycisz autora", "admin-btn", () =>
            act(
              "idler_admin_mute",
              { p_user_id: report.reported_user_id, p_minutes: Number(select.value), p_reason: "zgłoszenie wiadomości prywatnej" },
              "Wyciszono: " + report.reported_username,
            ),
          ),
        );
      }
      actions.appendChild(
        button("Zamknij zgłoszenie", "admin-btn", () =>
          act("idler_admin_dm_dismiss", { p_report_id: report.id }, "Zgłoszenie zamknięte."),
        ),
      );
      card.appendChild(actions);
      root.appendChild(card);
    });
  }

  function renderBugs(root) {
    const filter = el("div", "forum-filter");
    BUG_STATUSES.forEach((item) => {
      filter.appendChild(
        button(item.label, "forum-chip" + (item.id === bugStatus ? " active" : ""), () => {
          bugStatus = item.id;
          message = null;
          load();
        }),
      );
    });
    root.appendChild(filter);

    if (!data) return;

    if (data.reports.length === 0) {
      root.appendChild(el("p", "ranking-message", "Brak zgłoszeń w tym statusie."));
      return;
    }

    data.reports.forEach((report) => {
      const card = el("div", "admin-card");
      const head = el("div", "forum-head");
      head.appendChild(el("strong", "", "#" + report.id + " " + (report.username || "?")));
      head.appendChild(badge(report.category === "bug" ? "błąd" : report.category === "idea" ? "pomysł" : "inne"));
      head.appendChild(el("span", "forum-meta", formatDateTime(report.created_at)));
      card.appendChild(head);
      card.appendChild(el("div", "admin-quote", report.body));

      const ctx = report.context || {};
      const info = [ctx.screen, ctx.level != null ? "poz. " + ctx.level : null, ctx.location, ctx.viewport, ctx.page]
        .filter(Boolean)
        .join(" · ");
      if (info) card.appendChild(el("div", "forum-meta", info));
      if (ctx.ua) card.appendChild(el("div", "forum-meta admin-ua", ctx.ua));

      if (report.has_screenshot) {
        const holder = el("div", "admin-shot");
        const show = el("button", "admin-btn", "📎 Pokaż zrzut ekranu");
        show.type = "button";
        show.addEventListener("click", async () => {
          if (holder.querySelector("img")) {
            holder.replaceChildren(show);
            return;
          }
          show.disabled = true;
          const result = await call("idler_admin_bug_screenshot", { p_id: report.id });
          show.disabled = false;
          if (isOk(result) && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(result.data.image || "")) {
            const img = el("img", "admin-shot-img");
            img.alt = "Zrzut ekranu ze zgłoszenia #" + report.id;
            img.src = result.data.image;
            img.title = "Kliknij, aby otworzyć w pełnym rozmiarze";
            img.addEventListener("click", () => {
              const win = window.open();
              if (win) {
                win.document.title = "Zgłoszenie #" + report.id;
                win.document.body.style.margin = "0";
                const big = win.document.createElement("img");
                big.src = result.data.image;
                big.style.maxWidth = "100%";
                win.document.body.appendChild(big);
              }
            });
            holder.appendChild(img);
          } else {
            message = { ok: false, text: failText(result) };
            render();
          }
        });
        holder.appendChild(show);
        card.appendChild(holder);
      }

      const actions = el("div", "admin-actions");
      BUG_STATUSES.filter((item) => item.id !== report.status).forEach((item) => {
        actions.appendChild(
          button("→ " + item.label, "admin-btn", () =>
            act("idler_admin_bug_status", { p_id: report.id, p_status: item.id }, "Zmieniono status zgłoszenia #" + report.id),
          ),
        );
      });
      card.appendChild(actions);
      root.appendChild(card);
    });
  }

  function renderLog(root) {
    if (!data) return;

    if (data.log.length === 0) {
      root.appendChild(el("p", "ranking-message", "Dziennik jest pusty."));
      return;
    }

    data.log.forEach((entry) => {
      const row = el("div", "admin-logrow");
      const text =
        (entry.admin_name || "?") +
        " " +
        (ACTION_LABELS[entry.action] || entry.action) +
        (entry.target_name ? ": " + entry.target_name : "") +
        (entry.details ? " (" + entry.details + ")" : "");
      row.appendChild(el("div", "", text));
      row.appendChild(el("div", "forum-meta", formatDateTime(entry.created_at)));
      root.appendChild(row);
    });
  }

  function render() {
    const root = document.getElementById(CONTAINER_ID);
    if (!root) return;

    root.replaceChildren();

    if (!isAdmin) {
      root.appendChild(el("p", "ranking-message", "Brak dostępu."));
      return;
    }

    const tabs = el("div", "ranking-tabs");
    TABS.forEach((item) => {
      const node = button(item.label, "ranking-tab", () => {
        tab = item.id;
        message = null;
        load();
      });
      node.setAttribute("aria-selected", item.id === tab ? "true" : "false");
      tabs.appendChild(node);
    });
    root.appendChild(tabs);

    if (message) {
      root.appendChild(el("p", message.ok ? "bugreport-ok" : "chat-error forum-error", message.text));
    }

    if (loading) {
      root.appendChild(el("p", "ranking-message", "Ładowanie…"));
      return;
    }

    if (tab === "players") renderPlayers(root);
    else if (tab === "chat") renderChat(root);
    else if (tab === "dm") renderDmReports(root);
    else if (tab === "bugs") renderBugs(root);
    else renderLog(root);
  }

  window.openAdminScreen = async function openAdminScreen() {
    if (!isAdmin) {
      await checkAdmin();
    }

    if (!isAdmin) {
      return;
    }

    if (typeof showScreen === "function") {
      showScreen("screen-admin");
    }

    message = null;
    load();
  };

  function onAccountState() {
    checkAdmin();
  }

  function start() {
    window.IdlerAccounts?.subscribe?.(onAccountState);
    checkAdmin();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.IdlerAdmin = {
    isAdmin: () => isAdmin,
    call,
    confirmAction,
  };
})();
