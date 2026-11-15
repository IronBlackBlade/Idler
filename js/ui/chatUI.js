/*
 * Czat globalny (Supabase): wiadomości na żywo (Realtime) z awaryjnym odpytywaniem,
 * wysyłanie przez funkcję serwera idler_chat_send (limity, wyciszenia),
 * zgłaszanie wiadomości przez idler_chat_report.
 */
(function () {
  const CONTAINER_ID = "chat-content";
  const HISTORY_LIMIT = 80;
  const MAX_MESSAGES = 200;
  const MAX_LENGTH = 300;
  const POLL_INTERVAL_MS = 6000;

  let messages = [];
  let lastId = 0;
  let channel = null;
  let channelStatus = "closed";
  let channelOwner = null;
  let pollTimer = null;
  let sending = false;
  let loadState = "idle"; // idle | loading | ready | error
  let loadError = "";
  let nodes = null;

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

  function isScreenVisible() {
    const screen = document.getElementById("screen-chat");

    return Boolean(screen && screen.style.display !== "none" && screen.offsetParent !== null);
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

  async function fetchHistory() {
    const client = getClient();

    const result = await client
      .from("chat_messages")
      .select("id, user_id, username, body, created_at")
      .order("id", { ascending: false })
      .limit(HISTORY_LIMIT);

    if (result.error) {
      throw result.error;
    }

    return (result.data || []).slice().reverse();
  }

  async function fetchNewer() {
    const client = getClient();

    if (!client || !isSignedIn()) {
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
        renderMessages(true);
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
              renderMessages(true);
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

  function startPolling() {
    if (pollTimer) {
      return;
    }

    pollTimer = window.setInterval(() => {
      if (!isScreenVisible() || !isSignedIn()) {
        return;
      }

      if (channelStatus !== "SUBSCRIBED") {
        fetchNewer();
      }
    }, POLL_INTERVAL_MS);
  }

  async function load() {
    if (!isSignedIn()) {
      messages = [];
      lastId = 0;
      loadState = "idle";
      return;
    }

    loadState = "loading";
    renderAll();

    try {
      const rows = await fetchHistory();

      messages = [];
      lastId = 0;
      addMessages(rows);
      loadState = "ready";
      loadError = "";
      openChannel();
      startPolling();
    } catch (error) {
      const text = String(error?.message || "");

      loadState = "error";
      loadError =
        error?.code === "42P01" || text.includes("chat_messages")
          ? "Czat nie jest jeszcze włączony na serwerze (uruchom supabase/chat.sql)."
          : "Nie udało się pobrać czatu. Spróbuj ponownie.";
    }

    renderAll();
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

  // ---------- Widok ----------

  function renderStatus() {
    if (!nodes) {
      return;
    }

    nodes.send.disabled = sending;
    nodes.send.textContent = sending ? "Wysyłanie..." : "Wyślij";

    const live = channelStatus === "SUBSCRIBED";
    nodes.live.textContent = live ? "🟢 Na żywo" : "🟡 Odświeżanie co kilka sekund";
  }

  function renderMessages(stickToBottom) {
    if (!nodes) {
      return;
    }

    const list = nodes.list;
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;

    list.replaceChildren();

    if (messages.length === 0) {
      list.appendChild(el("p", "chat-empty", "Brak wiadomości. Napisz pierwszą!"));
      return;
    }

    const me = currentUserId();

    messages.forEach((message) => {
      const row = el("div", "chat-message" + (message.user_id === me ? " mine" : ""));
      row.appendChild(el("span", "chat-time", formatTime(message.created_at)));
      row.lastChild.title = formatFull(message.created_at);

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

    const counter = el("span", "chat-counter", "0/" + MAX_LENGTH);
    const sendButton = el("button", "chat-send", "Wyślij");
    sendButton.type = "submit";

    const error = el("p", "chat-error");
    error.setAttribute("role", "alert");

    input.addEventListener("input", () => {
      counter.textContent = input.value.length + "/" + MAX_LENGTH;
    });

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
        counter.textContent = "0/" + MAX_LENGTH;
      } else if (result.message) {
        error.textContent = result.message;
      }

      input.focus();
    });

    form.appendChild(input);
    form.appendChild(counter);
    form.appendChild(sendButton);

    return { form, input, error, send: sendButton };
  }

  function renderAll() {
    const container = document.getElementById(CONTAINER_ID);

    if (!container) {
      return;
    }

    container.replaceChildren();
    nodes = null;

    if (!isSignedIn()) {
      container.appendChild(
        el("p", "chat-notice", "Zaloguj się na konto (Ustawienia → Konto), aby korzystać z czatu."),
      );
      return;
    }

    if (loadState === "loading" || loadState === "idle") {
      container.appendChild(el("p", "chat-notice", "Ładowanie czatu..."));
      return;
    }

    if (loadState === "error") {
      container.appendChild(el("p", "chat-notice", loadError));
      const retry = el("button", "", "Spróbuj ponownie");
      retry.type = "button";
      retry.addEventListener("click", load);
      container.appendChild(retry);
      return;
    }

    const header = el("div", "chat-header");
    const live = el("span", "chat-live");
    header.appendChild(live);
    header.appendChild(el("span", "chat-rules", "Bądź miły. Spam i wulgaryzmy kończą się wyciszeniem."));
    container.appendChild(header);

    const list = el("div", "chat-list");
    list.setAttribute("role", "log");
    list.setAttribute("aria-live", "polite");
    container.appendChild(list);

    const form = buildForm();
    container.appendChild(form.form);
    container.appendChild(form.error);

    nodes = { list, live, send: form.send, input: form.input };
    renderStatus();
    renderMessages(false);
  }

  window.openChatScreen = function openChatScreen() {
    if (typeof showScreen === "function") {
      showScreen("screen-chat");
    }

    if (loadState === "ready" && isSignedIn()) {
      renderAll();
      fetchNewer();
      openChannel();
      return;
    }

    if (!isSignedIn()) {
      renderAll();
      return;
    }

    load();
  };

  function onAccountState() {
    const signedIn = isSignedIn();
    const owner = currentUserId();

    if (!signedIn || (channelOwner && channelOwner !== owner)) {
      closeChannel();
      messages = [];
      lastId = 0;
      loadState = "idle";
    }

    if (isScreenVisible()) {
      if (signedIn && loadState === "idle") {
        load();
      } else {
        renderAll();
      }
    }
  }

  function start() {
    const api = accounts();

    if (api && typeof api.subscribe === "function") {
      api.subscribe(onAccountState);
    }

    if (isScreenVisible()) {
      onAccountState();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.IdlerChatUI = { load, send, isReady: () => loadState === "ready" };
})();
