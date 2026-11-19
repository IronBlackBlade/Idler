/*
 * Wiadomości prywatne: zakładka ✉ w dolnym pasku + okno nad paskiem.
 * Widoki: lista rozmów i rozmowa z jednym graczem. Dane przez RPC idler_dm_* (supabase/dm.sql),
 * nowe wiadomości na żywo przez Realtime (z awaryjnym odpytywaniem).
 */
(function () {
  const POLL_MS = 20000;
  const MAX_LENGTH = 300;
  const MAX_PINS = 5;
  const PINS_KEY = "idler_dm_pins_";

  let dock = null;
  let nodes = null;
  let open = false;
  let view = "list"; // list | thread
  let withName = "";
  let conversations = [];
  let threadMessages = [];
  let blockedByMe = false;
  let unread = 0;
  let sending = false;
  let error = "";
  let channel = null;
  let channelOwner = null;
  let channelStatus = "";
  let pollTimer = 0;
  let loadedFor = null;
  let newName = "";
  let draft = "";
  let forceFocus = false;
  let pins = [];
  let unreadByName = {};

  function accounts() {
    return window.IdlerAccounts || null;
  }

  function getClient() {
    return accounts()?.getClient?.() || null;
  }

  function currentUserId() {
    return accounts()?.getState?.().user?.id || null;
  }

  function isSignedIn() {
    return accounts()?.getState?.().status === "signedIn" && Boolean(getClient());
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function notify(text, type) {
    if (typeof showNotification === "function") {
      showNotification(text, type || "success");
    }
  }

  function formatTime(value) {
    try {
      return new Date(value).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  }

  function formatDay(value) {
    try {
      const date = new Date(value);
      const today = new Date();
      return date.toDateString() === today.toDateString()
        ? formatTime(value)
        : date.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
    } catch (e) {
      return "";
    }
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
      : "Nie udało się połączyć. Jeśli to się powtarza, uruchom w Supabase plik supabase/dm.sql.";
  }

  function sameName(a, b) {
    return String(a || "").toLowerCase() === String(b || "").toLowerCase();
  }

  // ---------- Przypięte rozmowy (zakładki w dolnym pasku) ----------

  function lower(name) {
    return String(name || "").toLowerCase();
  }

  function loadPins() {
    pins = [];
    const owner = currentUserId();

    if (!owner) return;

    try {
      const raw = JSON.parse(window.localStorage.getItem(PINS_KEY + owner) || "[]");
      if (Array.isArray(raw)) {
        pins = raw.filter((name) => typeof name === "string" && name).slice(0, MAX_PINS);
      }
    } catch (e) {
      pins = [];
    }
  }

  function savePins() {
    const owner = currentUserId();

    if (!owner) return;

    try {
      window.localStorage.setItem(PINS_KEY + owner, JSON.stringify(pins));
    } catch (e) {
      /* brak zapisu: przypięcia działają do odświeżenia strony */
    }
  }

  function isPinned(name) {
    return pins.some((item) => sameName(item, name));
  }

  function togglePin(name) {
    if (!name) return;

    if (isPinned(name)) {
      pins = pins.filter((item) => !sameName(item, name));
    } else {
      if (pins.length >= MAX_PINS) {
        notify("Możesz przypiąć maksymalnie " + MAX_PINS + " rozmów. Odepnij którąś.", "error");
        return;
      }
      pins.push(name);
    }

    savePins();
    renderPins();
    if (view === "thread") render();
  }

  function renderPins() {
    const bar = document.getElementById("bottom-bar");

    if (!bar) return;

    bar.querySelectorAll(".dm-pin").forEach((node) => node.remove());

    if (!isSignedIn()) return;

    pins.forEach((name, index) => {
      const count = unreadByName[lower(name)] || 0;
      const active = open && view === "thread" && sameName(name, withName);
      const wrap = el("div", "dm-pin bottom-tab" + (active ? " active" : "") + (count > 0 ? " has-unread" : "") + (index >= 2 ? " extra" : ""));
      wrap.dataset.name = name;

      const main = el("button", "dm-pin-main");
      main.type = "button";
      main.title = "Rozmowa z " + name;
      main.setAttribute("aria-label", "Rozmowa z " + name + (count > 0 ? ", nieprzeczytane: " + count : ""));
      main.appendChild(el("span", "dm-pin-name", name));
      if (count > 0) main.appendChild(el("span", "chat-badge", count > 99 ? "99+" : String(count)));
      main.addEventListener("click", () => {
        if (active) {
          setOpen(false);
        } else {
          openConversation(name);
        }
      });

      const close = el("button", "dm-pin-close", "×");
      close.type = "button";
      close.title = "Odepnij z paska";
      close.setAttribute("aria-label", "Odepnij rozmowę z " + name);
      close.addEventListener("click", () => togglePin(name));

      wrap.append(main, close);
      bar.appendChild(wrap);
    });
  }

  // ---------- Dane ----------

  async function refreshUnread() {
    const result = await call("idler_dm_unread_count");
    if (!result.error && typeof result.data === "number") {
      unread = result.data;
      renderTab();
    }
  }

  async function loadConversations() {
    const result = await call("idler_dm_conversations");
    if (isOk(result)) {
      conversations = Array.isArray(result.data.conversations) ? result.data.conversations : [];
      unreadByName = {};
      conversations.forEach((item) => {
        unreadByName[lower(item.username)] = item.unread || 0;
      });
      error = "";
    } else {
      error = failText(result);
    }
    render();
    refreshUnread();
  }

  async function loadUnreadMap() {
    const result = await call("idler_dm_conversations");

    if (isOk(result)) {
      unreadByName = {};
      (result.data.conversations || []).forEach((item) => {
        unreadByName[lower(item.username)] = item.unread || 0;
      });
      renderPins();
    }
  }

  async function loadThread(full) {
    const name = withName;
    const after = full || threadMessages.length === 0 ? 0 : threadMessages[threadMessages.length - 1].id;
    const result = await call("idler_dm_thread", { p_username: name, p_after_id: after });

    if (name !== withName || view !== "thread") return;

    if (!isOk(result)) {
      error = failText(result);
      render();
      return;
    }

    error = "";
    const canonical = result.data.username || withName;
    pins = pins.map((item) => (sameName(item, canonical) ? canonical : item));
    withName = canonical;
    blockedByMe = result.data.blocked === true;
    unreadByName[lower(canonical)] = 0;

    const incoming = Array.isArray(result.data.messages) ? result.data.messages : [];
    if (after === 0) {
      threadMessages = incoming;
    } else {
      incoming.forEach((message) => {
        if (!threadMessages.some((item) => item.id === message.id)) threadMessages.push(message);
      });
    }

    render(true);
    refreshUnread();
  }

  async function send(text) {
    const body = String(text || "").trim();
    if (!body || sending) return false;

    sending = true;
    error = "";
    renderForm();

    const result = await call("idler_dm_send", { p_to_username: withName, p_body: body });
    sending = false;

    forceFocus = true;

    if (isOk(result)) {
      draft = "";
      await loadThread(false);
      return true;
    }

    error = failText(result);
    render();
    return false;
  }

  async function toggleBlock() {
    const next = !blockedByMe;

    if (next && typeof showGameConfirm === "function") {
      const yes = await showGameConfirm(
        "Zablokować gracza " + withName + "? Nie będzie mógł już do Ciebie pisać.",
        { title: "Blokada", confirmText: "Zablokuj" },
      );
      if (!yes) return;
    }

    const result = await call("idler_dm_block", { p_username: withName, p_blocked: next });

    if (isOk(result)) {
      blockedByMe = result.data.blocked === true;
      notify(blockedByMe ? "🚫 Zablokowano: " + withName : "Odblokowano: " + withName, "success");
      render();
    } else {
      error = failText(result);
      render();
    }
  }

  // ---------- Realtime ----------

  function closeChannel() {
    const client = getClient();
    if (channel && client && typeof client.removeChannel === "function") {
      try {
        client.removeChannel(channel);
      } catch (e) {
        /* kanał już zamknięty */
      }
    }
    channel = null;
    channelOwner = null;
    channelStatus = "";
  }

  function onInsert(row) {
    const me = currentUserId();
    if (!row || !me) return;

    const incoming = row.to_user === me;
    const other = incoming ? row.from_name : row.to_name;

    if (open && view === "thread" && sameName(other, withName)) {
      loadThread(false);
      return;
    }

    if (incoming) {
      unread += 1;
      unreadByName[lower(row.from_name)] = (unreadByName[lower(row.from_name)] || 0) + 1;
      renderTab();
      notify("✉ " + row.from_name + ": " + String(row.body || "").slice(0, 60), "success");
    }

    if (open && view === "list") {
      loadConversations();
    }
  }

  function openChannel() {
    const client = getClient();
    const userId = currentUserId();

    if (!client || !userId || typeof client.channel !== "function") return;
    if (channel && channelOwner === userId) return;

    closeChannel();
    channelOwner = userId;

    try {
      channel = client
        .channel("idler-dm")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_messages" }, (payload) =>
          onInsert(payload.new),
        )
        .subscribe((status) => {
          channelStatus = String(status || "");
        });
    } catch (e) {
      channel = null;
      channelStatus = "error";
    }
  }

  function schedulePoll() {
    window.clearTimeout(pollTimer);
    pollTimer = window.setTimeout(() => {
      if (isSignedIn() && channelStatus !== "SUBSCRIBED") {
        refreshUnread();
        if (open && view === "thread") loadThread(false);
      }
      schedulePoll();
    }, POLL_MS);
  }

  // ---------- Widok ----------

  function renderTab() {
    if (!nodes) return;
    nodes.badge.textContent = unread > 99 ? "99+" : String(unread);
    nodes.badge.hidden = unread === 0;
    nodes.tab.classList.toggle("has-unread", unread > 0);
    nodes.tab.setAttribute("aria-label", "Wiadomości prywatne" + (unread > 0 ? ", nieprzeczytane: " + unread : ""));
    renderPins();
  }

  function renderForm() {
    if (!nodes || !nodes.form) return;
    nodes.form.send.disabled = sending;
    nodes.form.send.textContent = sending ? "..." : "Wyślij";
  }

  function render(scrollBottom) {
    if (!nodes) return;

    const body = nodes.body;
    const active = document.activeElement;
    const hadFocus = Boolean(nodes.form && active === nodes.form.input) || forceFocus;
    const selStart = nodes.form && active === nodes.form.input ? active.selectionStart : null;
    forceFocus = false;
    body.replaceChildren();
    nodes.form = null;
    nodes.title.textContent = view === "thread" ? "✉ " + withName : "✉ Wiadomości";
    nodes.back.hidden = view !== "thread";
    nodes.profile.hidden = view !== "thread";
    nodes.pin.hidden = view !== "thread";
    nodes.pin.classList.toggle("pinned", isPinned(withName));
    nodes.pin.title = isPinned(withName) ? "Odepnij z paska" : "Przypnij rozmowę do paska";
    nodes.pin.setAttribute("aria-pressed", isPinned(withName) ? "true" : "false");
    nodes.block.hidden = view !== "thread";
    nodes.block.textContent = blockedByMe ? "Odblokuj" : "🚫 Zablokuj";

    renderPins();

    if (view === "list") {
      renderListView(body);
    } else {
      renderThreadView(body, scrollBottom);

      // Odrysowanie okna tworzy nowe pole tekstowe: oddaj mu fokus, żeby można było pisać dalej.
      if (hadFocus && nodes.form) {
        nodes.form.input.focus({ preventScroll: true });
        if (selStart !== null) {
          try {
            nodes.form.input.setSelectionRange(selStart, selStart);
          } catch (e) {
            /* pole bez zaznaczenia */
          }
        }
      }
    }
  }

  function renderListView(body) {
    const row = el("form", "dm-new");
    row.autocomplete = "off";
    const input = el("input", "chat-input");
    input.type = "text";
    input.maxLength = 20;
    input.placeholder = "Nazwa gracza…";
    input.value = newName;
    input.setAttribute("aria-label", "Nazwa gracza, do którego chcesz napisać");
    input.addEventListener("input", () => (newName = input.value));
    const go = el("button", "chat-send", "Napisz");
    go.type = "submit";
    row.appendChild(input);
    row.appendChild(go);
    row.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = newName.trim();
      if (name) {
        newName = "";
        openConversation(name);
      }
    });
    body.appendChild(row);

    if (error) body.appendChild(el("p", "chat-error", error));

    const list = el("div", "chat-list dm-conversations");
    if (conversations.length === 0) {
      list.appendChild(
        el(
          "p",
          "chat-empty",
          "Brak rozmów. Kliknij dwukrotnie wiadomość gracza na czacie albo wpisz jego nazwę powyżej.",
        ),
      );
    }

    conversations.forEach((conversation) => {
      const item = el("button", "dm-conversation" + (conversation.unread > 0 ? " unread" : ""));
      item.type = "button";
      const head = el("span", "dm-conversation-head");
      head.appendChild(el("strong", "", conversation.username));
      if (conversation.blocked) head.appendChild(el("span", "dm-blocked", "zablokowany"));
      head.appendChild(el("span", "dm-time", formatDay(conversation.last_at)));
      item.appendChild(head);
      item.appendChild(
        el("span", "dm-preview", (conversation.from_me ? "Ty: " : "") + String(conversation.last_body || "")),
      );
      if (conversation.unread > 0) item.appendChild(el("span", "chat-badge dm-unread", String(conversation.unread)));
      item.addEventListener("click", () => openConversation(conversation.username));
      list.appendChild(item);
    });
    body.appendChild(list);
  }

  function renderThreadView(body, scrollBottom) {
    const list = el("div", "chat-list dm-thread");
    const wasNearBottom = true;

    if (threadMessages.length === 0) {
      list.appendChild(el("p", "chat-empty", "Brak wiadomości. Napisz pierwszą!"));
    }

    threadMessages.forEach((message) => {
      const row = el("div", "chat-message" + (message.mine ? " mine" : ""));
      row.appendChild(el("span", "chat-time", formatTime(message.created_at)));
      row.appendChild(el("span", message.mine ? "dm-me" : "dm-them", message.mine ? "Ja" : withName));
      row.appendChild(el("span", "chat-colon", ": "));
      row.appendChild(el("span", "chat-body", message.body));
      list.appendChild(row);
    });
    body.appendChild(list);

    if (blockedByMe) {
      body.appendChild(el("p", "chat-error", "Zablokowałeś tego gracza. Nie może do Ciebie pisać."));
    }

    const err = el("p", "chat-error", error);
    err.setAttribute("role", "alert");
    body.appendChild(err);

    const form = el("form", "chat-form");
    form.autocomplete = "off";
    const input = el("input", "chat-input");
    input.type = "text";
    input.maxLength = MAX_LENGTH;
    input.placeholder = "Napisz do " + withName + "…";
    input.value = draft;
    input.setAttribute("aria-label", "Wiadomość prywatna");
    input.addEventListener("input", () => (draft = input.value));
    const sendButton = el("button", "chat-send", sending ? "..." : "Wyślij");
    sendButton.type = "submit";
    form.appendChild(input);
    form.appendChild(sendButton);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await send(input.value);
    });
    body.appendChild(form);
    nodes.form = { input, send: sendButton };

    if (wasNearBottom || scrollBottom) list.scrollTop = list.scrollHeight;
  }

  // ---------- Okno ----------

  function buildDock() {
    dock = el("div", "chat-dock dm-dock");
    dock.id = "dm-dock";
    dock.hidden = true;

    const panel = el("section", "chat-panel");
    panel.hidden = true;
    panel.setAttribute("aria-label", "Wiadomości prywatne");
    window.IdlerPanelResize?.enable(panel);

    const header = el("div", "chat-panel-header");
    const back = el("button", "dm-header-btn", "←");
    back.type = "button";
    back.title = "Lista rozmów";
    back.setAttribute("aria-label", "Wróć do listy rozmów");
    back.addEventListener("click", () => {
      view = "list";
      error = "";
      render();
      loadConversations();
    });
    const title = el("strong", "dm-title", "✉ Wiadomości");
    const profile = el("button", "dm-header-btn", "👤");
    profile.type = "button";
    profile.title = "Profil gracza";
    profile.addEventListener("click", () => window.IdlerRankingUI?.openProfile?.(withName));
    const pin = el("button", "dm-header-btn dm-pin-btn", "📌");
    pin.type = "button";
    pin.addEventListener("click", () => togglePin(withName));
    const block = el("button", "dm-header-btn dm-block", "🚫 Zablokuj");
    block.type = "button";
    block.addEventListener("click", toggleBlock);
    const minimize = el("button", "chat-minimize", "–");
    minimize.type = "button";
    minimize.title = "Zwiń";
    minimize.setAttribute("aria-label", "Zwiń wiadomości");
    minimize.addEventListener("click", () => setOpen(false));
    header.append(back, title, profile, pin, block, minimize);
    panel.appendChild(header);

    const body = el("div", "chat-panel-body");
    panel.appendChild(body);

    const tab = el("button", "chat-tab dm-tab bottom-tab");
    tab.type = "button";
    tab.hidden = true;
    tab.setAttribute("aria-expanded", "false");
    tab.appendChild(el("span", "chat-tab-icon", "✉"));
    tab.appendChild(el("span", "chat-tab-label", "Wiadomości"));
    const badge = el("span", "chat-badge", "0");
    badge.hidden = true;
    tab.appendChild(badge);
    tab.addEventListener("click", () => {
      if (open) {
        setOpen(false);
      } else {
        view = "list";
        error = "";
        setOpen(true);
      }
    });

    dock.appendChild(panel);
    document.body.appendChild(dock);

    const bar = document.getElementById("bottom-bar");
    if (bar) bar.appendChild(tab);
    else dock.appendChild(tab);

    nodes = { panel, body, tab, badge, title, back, profile, pin, block, form: null };

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open && dock.contains(document.activeElement)) {
        setOpen(false);
        tab.focus();
      }
    });
  }

  function setOpen(value) {
    open = Boolean(value);
    if (!dock) return;

    if (open) {
      window.IdlerChatUI?.close?.();
    }

    dock.classList.toggle("open", open);
    nodes.tab.classList.toggle("active", open);
    nodes.tab.setAttribute("aria-expanded", open ? "true" : "false");
    nodes.panel.hidden = !open;
    renderPins();

    if (open) {
      render();
      if (view === "list") loadConversations();
      else loadThread(true);
      window.setTimeout(() => {
        const input = nodes.body.querySelector("input");
        if (input) input.focus();
      }, 0);
    }
  }

  function openConversation(username) {
    const name = String(username || "").trim();
    if (!name || !isSignedIn()) return;

    if (!dock) buildDock();

    if (!sameName(name, withName)) {
      threadMessages = [];
      draft = "";
    }

    withName = name;
    view = "thread";
    error = "";
    blockedByMe = false;
    dock.hidden = false;
    nodes.tab.hidden = false;
    setOpen(true);
  }

  function onAccountState() {
    const signedIn = isSignedIn();
    const owner = currentUserId();

    if (!signedIn) {
      closeChannel();
      window.clearTimeout(pollTimer);
      loadedFor = null;
      unread = 0;
      pins = [];
      unreadByName = {};
      renderPins();
      conversations = [];
      threadMessages = [];
      open = false;
      if (dock) {
        dock.hidden = true;
        dock.classList.remove("open");
        nodes.panel.hidden = true;
        nodes.tab.hidden = true;
        nodes.tab.classList.remove("active");
      }
      return;
    }

    if (!dock) buildDock();
    dock.hidden = false;
    nodes.tab.hidden = false;

    if (loadedFor !== owner) {
      loadedFor = owner;
      conversations = [];
      threadMessages = [];
      unread = 0;
      view = "list";
      loadPins();
      openChannel();
      refreshUnread();
      loadUnreadMap();
      schedulePoll();
    }

    renderTab();
  }

  function start() {
    accounts()?.subscribe?.(onAccountState);
    onAccountState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.IdlerDMUI = {
    openConversation,
    open: () => {
      if (!dock) return;
      view = "list";
      setOpen(true);
    },
    close: () => setOpen(false),
    getUnread: () => unread,
  };
})();
