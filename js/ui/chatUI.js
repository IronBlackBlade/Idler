/*
 * Czat globalny (Supabase) jako zwijany pasek na dole ekranu (jak komunikator):
 * wiadomości na żywo (Realtime) z awaryjnym odpytywaniem, licznik nowych wiadomości,
 * wysyłanie przez funkcję serwera idler_chat_send (limity, wyciszenia),
 * zgłaszanie wiadomości przez idler_chat_report.
 */
(function () {
  const LAST_READ_PREFIX = "idler_chat_last_read_";
  const OPEN_KEY = "idler_chat_open";
  const HISTORY_LIMIT = 80;
  const MAX_MESSAGES = 200;
  const MAX_LENGTH = 300;
  const POLL_OPEN_MS = 6000;
  const POLL_CLOSED_MS = 15000;

  let messages = [];
  let lastId = 0;
  let channel = null;
  let channelStatus = "closed";
  let channelOwner = null;
  let pollTimer = null;
  let sending = false;
  let loadState = "idle"; // idle | loading | ready | error
  let loadError = "";
  let loadedFor = null;
  let open = false;
  let lastRead = 0;
  let unread = 0;
  let dock = null;
  let ui = null; // węzły panelu (po zbudowaniu formularza)

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

    if (className) {
      node.className = className;
    }

    if (text !== undefined) {
      node.textContent = text;
    }

    return node;
  }

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* przeglądarka blokuje zapis: czat działa dalej */
    }
  }

  function notify(text, type) {
    if (typeof showNotification === "function") {
      showNotification(text, type || "success");
    }
  }

  function formatTime(value) {
    try {
      return new Date(value).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      return "";
    }
  }

  function formatFull(value) {
    try {
      return new Date(value).toLocaleString("pl-PL");
    } catch (error) {
      return "";
    }
  }

  // ---------- Dane ----------

  function addMessages(rows) {
    let added = false;

    (rows || []).forEach((row) => {
      const id = Number(row && row.id);

      if (!Number.isFinite(id) || id <= 0 || messages.some((item) => item.id === id)) {
        return;
      }

      messages.push({
        id,
        user_id: row.user_id,
        username: String(row.username || "?"),
        body: String(row.body || ""),
        created_at: row.created_at,
      });
      added = true;
    });

    if (!added) {
      return false;
    }

    messages.sort((a, b) => a.id - b.id);

    if (messages.length > MAX_MESSAGES) {
      messages = messages.slice(messages.length - MAX_MESSAGES);
    }

    lastId = messages.length ? messages[messages.length - 1].id : 0;

    return true;
  }

  function recountUnread() {
    const me = currentUserId();

    unread = open
      ? 0
      : messages.filter((message) => message.id > lastRead && message.user_id !== me).length;
  }

  function markRead() {
    lastRead = Math.max(lastRead, lastId);

    const userId = currentUserId();

    if (userId) {
      writeStorage(LAST_READ_PREFIX + userId, String(lastRead));
    }

    unread = 0;
  }

  async function fetchHistory() {
    const result = await getClient()
      .from("chat_messages")
      .select("id, user_id, username, body, created_at")
      .order("id", { ascending: false })
      .limit(HISTORY_LIMIT);

    if (result.error) {
      throw result.error;
    }

    return (result.data || []).slice().reverse();
  }

  function onNewMessages() {
    if (open) {
      markRead();
    } else {
      recountUnread();
    }

    renderMessages(true);
    renderTab();
  }

  async function fetchNewer() {
    const client = getClient();

    if (!client || !isSignedIn() || loadState !== "ready") {
      return;
    }

    try {
      const result = await client
        .from("chat_messages")
        .select("id, user_id, username, body, created_at")
        .gt("id", lastId)
        .order("id", { ascending: true })
        .limit(HISTORY_LIMIT);

      if (!result.error && addMessages(result.data)) {
        onNewMessages();
      }
    } catch (error) {
      /* spróbujemy przy następnym odpytaniu */
    }
  }

  function closeChannel() {
    const client = getClient();

    if (channel && client && typeof client.removeChannel === "function") {
      try {
        client.removeChannel(channel);
      } catch (error) {
        /* kanał mógł już zostać zamknięty */
      }
    }

    channel = null;
    channelStatus = "closed";
    channelOwner = null;
  }

  function openChannel() {
    const client = getClient();
    const userId = currentUserId();

    if (!client || !userId || typeof client.channel !== "function") {
      return;
    }

    if (channel && channelOwner === userId) {
      return;
    }

    closeChannel();
    channelOwner = userId;

    try {
      channel = client
        .channel("idler-chat")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages" },
          (payload) => {
            if (addMessages([payload.new])) {
              onNewMessages();
            }
          },
        )
        .subscribe((status) => {
          channelStatus = String(status || "");

          if (channelStatus === "SUBSCRIBED") {
            fetchNewer();
          }

          renderStatus();
        });
    } catch (error) {
      channel = null;
      channelStatus = "error";
    }
  }

  function schedulePoll() {
    window.clearTimeout(pollTimer);

    pollTimer = window.setTimeout(
      () => {
        if (isSignedIn() && loadState === "ready" && channelStatus !== "SUBSCRIBED") {
          fetchNewer();
        }

        schedulePoll();
      },
      open ? POLL_OPEN_MS : POLL_CLOSED_MS,
    );
  }

  async function load() {
    if (!isSignedIn()) {
      return;
    }

    const userId = currentUserId();

    loadState = "loading";
    renderPanel();

    try {
      const rows = await fetchHistory();

      messages = [];
      lastId = 0;
      addMessages(rows);

      const stored = Number(readStorage(LAST_READ_PREFIX + userId));

      // Pierwsze uruchomienie na tym urządzeniu: stara historia nie liczy się jako nowa.
      lastRead = Number.isFinite(stored) && stored > 0 ? stored : lastId;

      loadedFor = userId;
      loadState = "ready";
      loadError = "";

      if (open) {
        markRead();
      } else {
        recountUnread();
      }

      openChannel();
      schedulePoll();
    } catch (error) {
      const text = String(error?.message || "");

      loadState = "error";
      loadError =
        error?.code === "42P01" || text.includes("chat_messages")
          ? "Czat nie jest jeszcze włączony na serwerze (uruchom supabase/chat.sql)."
          : "Nie udało się pobrać czatu. Spróbuj ponownie.";
    }

    renderPanel();
    renderTab();
  }

  async function send(text) {
    const client = getClient();
    const body = String(text || "").trim();

    if (!client || !body || sending) {
      return { ok: false };
    }

    sending = true;
    renderStatus();

    try {
      const result = await client.rpc("idler_chat_send", { p_body: body });

      if (result.error) {
        throw result.error;
      }

      const data = result.data || {};

      if (data.ok === true) {
        fetchNewer();
        return { ok: true };
      }

      return { ok: false, message: data.message || "Nie udało się wysłać wiadomości." };
    } catch (error) {
      return { ok: false, message: "Brak połączenia z serwerem. Spróbuj ponownie." };
    } finally {
      sending = false;
      renderStatus();
    }
  }

  async function report(message) {
    const client = getClient();

    if (!client) {
      return;
    }

    const confirmed =
      typeof showGameConfirm === "function"
        ? await showGameConfirm(
            "Zgłosić wiadomość gracza " + message.username + " administratorowi?",
            { title: "Zgłoszenie wiadomości", confirmText: "Zgłoś" },
          )
        : window.confirm("Zgłosić tę wiadomość?");

    if (!confirmed) {
      return;
    }

    try {
      const result = await client.rpc("idler_chat_report", {
        p_message_id: message.id,
        p_reason: null,
      });

      if (result.error) {
        throw result.error;
      }

      if (result.data && result.data.ok) {
        notify("Dziękujemy, zgłoszenie zostało wysłane.");
      } else {
        notify((result.data && result.data.message) || "Nie udało się zgłosić.", "error");
      }
    } catch (error) {
      notify("Nie udało się wysłać zgłoszenia.", "error");
    }
  }

  // ---------- Pasek (dok) ----------

  function positionDock() {
    // Okno czatu jest przypięte przez CSS nad dolnym paskiem.
  }

  function renderTab() {
    if (!dockNodes) {
      return;
    }

    const badge = dockNodes.badge;

    badge.textContent = unread > 99 ? "99+" : String(unread);
    badge.hidden = unread === 0;
    dockNodes.tab.classList.toggle("has-unread", unread > 0);
    dockNodes.tab.setAttribute(
      "aria-label",
      "Czat" + (unread > 0 ? ", nowe wiadomości: " + unread : ""),
    );
  }

  function renderStatus() {
    if (!ui) {
      return;
    }

    ui.send.disabled = sending;
    ui.send.textContent = sending ? "..." : "Wyślij";
    ui.live.textContent =
      channelStatus === "SUBSCRIBED" ? "🟢 Na żywo" : "🟡 Odświeżanie co kilka sekund";
  }

  function renderMessages(stickToBottom) {
    if (!ui) {
      return;
    }

    const list = ui.list;
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;

    list.replaceChildren();

    if (messages.length === 0) {
      list.appendChild(el("p", "chat-empty", "Brak wiadomości. Napisz pierwszą!"));
      return;
    }

    const me = currentUserId();

    messages.forEach((message) => {
      const row = el("div", "chat-message" + (message.user_id === me ? " mine" : ""));
      const time = el("span", "chat-time", formatTime(message.created_at));
      time.title = formatFull(message.created_at);
      row.appendChild(time);

      const name = el("button", "chat-name", message.username);
      name.type = "button";
      name.title = "Pokaż profil";
      name.addEventListener("click", () => {
        window.IdlerRankingUI?.openProfile?.(message.username);
      });
      row.appendChild(name);

      row.appendChild(el("span", "chat-body", message.body));

      if (message.user_id !== me) {
        const flag = el("button", "chat-report", "⚑");
        flag.type = "button";
        flag.title = "Zgłoś wiadomość";
        flag.setAttribute("aria-label", "Zgłoś wiadomość gracza " + message.username);
        flag.addEventListener("click", () => report(message));
        row.appendChild(flag);
      }

      list.appendChild(row);
    });

    if (stickToBottom ? nearBottom : true) {
      list.scrollTop = list.scrollHeight;
    }
  }

  function buildForm() {
    const form = el("form", "chat-form");
    form.autocomplete = "off";

    const input = el("input", "chat-input");
    input.type = "text";
    input.maxLength = MAX_LENGTH;
    input.placeholder = "Napisz wiadomość...";
    input.setAttribute("aria-label", "Wiadomość na czacie");

    const sendButton = el("button", "chat-send", "Wyślij");
    sendButton.type = "submit";

    const error = el("p", "chat-error");
    error.setAttribute("role", "alert");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const text = input.value;

      if (!text.trim()) {
        return;
      }

      error.textContent = "";

      const result = await send(text);

      if (result.ok) {
        input.value = "";
      } else if (result.message) {
        error.textContent = result.message;
      }

      input.focus();
    });

    form.appendChild(input);
    form.appendChild(sendButton);

    return { form, input, error, send: sendButton };
  }

  function renderPanel() {
    if (!dockNodes) {
      return;
    }

    const body = dockNodes.body;

    body.replaceChildren();
    ui = null;

    if (loadState === "loading" || loadState === "idle") {
      body.appendChild(el("p", "chat-notice", "Ładowanie czatu..."));
      return;
    }

    if (loadState === "error") {
      body.appendChild(el("p", "chat-notice", loadError));
      const retry = el("button", "", "Spróbuj ponownie");
      retry.type = "button";
      retry.addEventListener("click", load);
      body.appendChild(retry);
      return;
    }

    const live = el("div", "chat-live");
    body.appendChild(live);

    const list = el("div", "chat-list");
    list.setAttribute("role", "log");
    list.setAttribute("aria-live", "polite");
    body.appendChild(list);

    const form = buildForm();
    body.appendChild(form.form);
    body.appendChild(form.error);
    body.appendChild(
      el("p", "chat-rules", "Bądź miły. Spam i wulgaryzmy kończą się wyciszeniem."),
    );

    ui = { list, live, send: form.send, input: form.input };
    renderStatus();
    renderMessages(false);
  }

  function setOpen(value) {
    open = Boolean(value);
    writeStorage(OPEN_KEY, open ? "1" : "0");

    if (!dock) {
      return;
    }

    dock.classList.toggle("open", open);
    dockNodes.tab.classList.toggle("active", open);
    dockNodes.tab.setAttribute("aria-expanded", open ? "true" : "false");
    dockNodes.panel.hidden = !open;

    if (open) {
      if (loadState === "ready") {
        markRead();
        fetchNewer();
        openChannel();
      } else if (loadState === "idle" || loadState === "error") {
        load();
      }

      renderTab();
      renderMessages(false);
      positionDock();

      if (ui) {
        window.setTimeout(() => ui?.input.focus(), 0);
      }
    }

    schedulePoll();
  }

  function buildDock() {
    dock = el("div", "chat-dock");
    dock.id = "chat-dock";
    dock.hidden = true;

    const panel = el("section", "chat-panel");
    panel.hidden = true;
    panel.setAttribute("aria-label", "Czat globalny");

    const header = el("div", "chat-panel-header");
    header.appendChild(el("strong", "", "💬 Czat globalny"));

    const minimize = el("button", "chat-minimize", "–");
    minimize.type = "button";
    minimize.title = "Zwiń czat";
    minimize.setAttribute("aria-label", "Zwiń czat");
    minimize.addEventListener("click", () => setOpen(false));
    header.appendChild(minimize);
    panel.appendChild(header);

    const body = el("div", "chat-panel-body");
    panel.appendChild(body);

    const tab = el("button", "chat-tab");
    tab.type = "button";
    tab.setAttribute("aria-expanded", "false");
    tab.appendChild(el("span", "chat-tab-icon", "💬"));
    tab.appendChild(el("span", "chat-tab-label", "Czat"));
    const badge = el("span", "chat-badge", "0");
    badge.hidden = true;
    tab.appendChild(badge);
    tab.addEventListener("click", () => setOpen(!open));

    tab.classList.add("bottom-tab");
    tab.hidden = true;
    dock.appendChild(panel);
    document.body.appendChild(dock);

    const bar = document.getElementById("bottom-bar");

    if (bar) {
      bar.appendChild(tab);
    } else {
      dock.appendChild(tab);
    }

    dockNodes = { panel, body, tab, badge };

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && open && dock.contains(document.activeElement)) {
        setOpen(false);
        tab.focus();
      }
    });

    window.addEventListener("resize", positionDock);

  }

  let dockNodes = null;

  function onAccountState() {
    const signedIn = isSignedIn();
    const owner = currentUserId();

    if (!signedIn) {
      closeChannel();
      window.clearTimeout(pollTimer);
      messages = [];
      lastId = 0;
      unread = 0;
      loadState = "idle";
      loadedFor = null;

      if (dock) {
        dock.hidden = true;
        dockNodes.tab.hidden = true;
      }

      return;
    }

    if (!dock) {
      buildDock();
    }

    dock.hidden = false;
    dockNodes.tab.hidden = false;

    if (loadedFor && loadedFor !== owner) {
      closeChannel();
      messages = [];
      lastId = 0;
      unread = 0;
      loadState = "idle";
      loadedFor = null;
    }

    const wantOpen = readStorage(OPEN_KEY) === "1";

    if (loadState === "idle") {
      open = wantOpen;
      dock.classList.toggle("open", open);
      dockNodes.tab.classList.toggle("active", open);
      dockNodes.panel.hidden = !open;
      dockNodes.tab.setAttribute("aria-expanded", open ? "true" : "false");
      load();
    }
  }

  function start() {
    const api = accounts();

    if (api && typeof api.subscribe === "function") {
      api.subscribe(onAccountState);
    }

    onAccountState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.IdlerChatUI = {
    load,
    send,
    open: () => setOpen(true),
    close: () => setOpen(false),
    isReady: () => loadState === "ready",
    getUnread: () => unread,
  };
})();
