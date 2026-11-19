/*
 * Forum pomysłów (Społeczność -> Forum pomysłów).
 * Widoki: lista (Popularne / Najnowsze + filtr statusu), nowy wpis, wpis z komentarzami.
 * Dane wyłącznie przez RPC idler_forum_*.
 */
(function () {
  const CONTAINER_ID = "forum-content";
  const PAGE_SIZE = 20;
  const STATUSES = [
    { id: "", label: "Wszystkie" },
    { id: "open", label: "Nowe" },
    { id: "planned", label: "Planowane" },
    { id: "done", label: "Zrobione" },
    { id: "rejected", label: "Odrzucone" },
  ];
  const STATUS_LABELS = { open: "Nowy", planned: "Planowany", done: "Zrobiony", rejected: "Odrzucony" };

  let view = "list"; // list | new | post
  let sort = "top";
  let status = "";
  let posts = [];
  let hasMore = false;
  let loading = false;
  let error = "";
  let currentPostId = null;
  let draftTitle = "";
  let draftBody = "";
  let draftComment = "";
  let busy = false;
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

  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
  }

  function container() {
    return document.getElementById(CONTAINER_ID);
  }

  async function call(name, args) {
    const client = getClient();
    if (!client) return { error: new Error("no client") };
    try {
      return await client.rpc(name, args);
    } catch (e) {
      return { error: e };
    }
  }

  const SETUP_HINT = "Nie udało się połączyć z forum. Jeśli to się powtarza, uruchom w Supabase plik supabase/forum.sql.";

  function failText(result) {
    return result && result.data && result.data.message ? result.data.message : SETUP_HINT;
  }

  function isOk(result) {
    return result && !result.error && result.data && result.data.ok === true;
  }

  // ---------- Lista ----------

  async function loadPosts(append) {
    const current = ++requestId;
    loading = true;
    error = "";
    render();

    const result = await call("idler_forum_list", {
      p_sort: sort,
      p_status: status || null,
      p_limit: PAGE_SIZE,
      p_offset: append ? posts.length : 0,
    });

    if (current !== requestId) return;
    loading = false;

    if (!isOk(result)) {
      error = failText(result);
      render();
      return;
    }

    const page = Array.isArray(result.data.posts) ? result.data.posts : [];
    posts = append ? posts.concat(page) : page;
    hasMore = page.length === PAGE_SIZE;
    render();
  }

  function buildVote(post, onChange) {
    const wrap = el("div", "forum-votes");

    [
      { value: 1, icon: "👍", count: post.up, title: "Podoba mi się" },
      { value: -1, icon: "👎", count: post.down, title: "Nie podoba mi się" },
    ].forEach((item) => {
      const active = post.my_vote === item.value;
      const vote = button(
        item.icon + " " + item.count,
        "forum-vote" + (item.value === 1 ? " up" : " down") + (active ? " voted" : ""),
        async (event) => {
          event.stopPropagation();
          if (busy) return;
          busy = true;
          const result = await call("idler_forum_vote", { p_post_id: post.id, p_value: item.value });
          busy = false;
          if (isOk(result)) {
            post.my_vote = result.data.my_vote;
            post.up = result.data.up;
            post.down = result.data.down;
            onChange();
          } else {
            error = failText(result);
            render();
          }
        },
      );
      vote.title = active ? "Cofnij głos" : item.title;
      vote.setAttribute("aria-pressed", active ? "true" : "false");
      wrap.appendChild(vote);
    });

    return wrap;
  }

  function buildBadge(statusId) {
    return el("span", "forum-badge forum-badge-" + statusId, STATUS_LABELS[statusId] || statusId);
  }

  function renderList(root) {
    const bar = el("div", "forum-toolbar");
    const tabs = el("div", "ranking-tabs");
    [
      { id: "top", label: "🔥 Popularne" },
      { id: "new", label: "🕒 Najnowsze" },
    ].forEach((item) => {
      const tab = button(item.label, "ranking-tab", () => {
        sort = item.id;
        loadPosts(false);
      });
      tab.setAttribute("aria-selected", item.id === sort ? "true" : "false");
      tabs.appendChild(tab);
    });
    bar.appendChild(tabs);
    root.appendChild(bar);

    const filter = el("div", "forum-filter");
    STATUSES.forEach((item) => {
      const chip = button(item.label, "forum-chip" + (item.id === status ? " active" : ""), () => {
        status = item.id;
        loadPosts(false);
      });
      filter.appendChild(chip);
    });
    root.appendChild(filter);

    root.appendChild(
      button("➕ Nowy pomysł", "game-dialog-confirm forum-new", () => {
        view = "new";
        error = "";
        render();
      }),
    );

    if (error) root.appendChild(el("p", "chat-error forum-error", error));

    if (loading && posts.length === 0) {
      root.appendChild(el("p", "ranking-message", "Ładowanie…"));
      return;
    }

    if (!loading && posts.length === 0 && !error) {
      root.appendChild(el("p", "ranking-message", "Brak wpisów. Dodaj pierwszy pomysł!"));
    }

    const list = el("div", "forum-list");
    posts.forEach((post) => {
      const card = el("article", "forum-card");
      card.tabIndex = 0;
      const open = () => openPost(post.id);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter") open();
      });

      const main = el("div", "forum-main");
      const head = el("div", "forum-head");
      head.appendChild(el("span", "forum-title", post.title));
      head.appendChild(buildBadge(post.status));
      main.appendChild(head);
      main.appendChild(
        el(
          "div",
          "forum-meta",
          post.username + " · " + formatDate(post.created_at) + " · 💬 " + post.comments,
        ),
      );
      card.appendChild(buildVote(post, render));
      card.appendChild(main);
      list.appendChild(card);
    });
    root.appendChild(list);

    if (hasMore) {
      const more = button(loading ? "Ładowanie…" : "Pokaż więcej", "game-dialog-cancel forum-more", () =>
        loadPosts(true),
      );
      more.disabled = loading;
      root.appendChild(more);
    }
  }

  // ---------- Nowy wpis ----------

  function renderNew(root) {
    root.appendChild(
      button("← Wróć do listy", "game-dialog-cancel forum-back", () => {
        view = "list";
        error = "";
        render();
      }),
    );
    root.appendChild(el("h3", "forum-heading", "Nowy pomysł"));

    const title = el("input", "forum-input");
    title.type = "text";
    title.maxLength = 80;
    title.placeholder = "Krótki tytuł (4–80 znaków)";
    title.value = draftTitle;
    title.disabled = busy;
    title.addEventListener("input", () => (draftTitle = title.value));
    root.appendChild(title);

    const body = el("textarea", "bugreport-text");
    body.maxLength = 1000;
    body.rows = 6;
    body.placeholder = "Opisz pomysł: co ma się zmienić i dlaczego? (10–1000 znaków)";
    body.value = draftBody;
    body.disabled = busy;
    body.addEventListener("input", () => (draftBody = body.value));
    root.appendChild(body);

    if (error) root.appendChild(el("p", "chat-error forum-error", error));

    const send = button(busy ? "Wysyłanie…" : "Opublikuj", "game-dialog-confirm bugreport-send", submitPost);
    send.disabled = busy;
    root.appendChild(send);
  }

  async function submitPost() {
    if (busy) return;
    busy = true;
    error = "";
    render();

    const result = await call("idler_forum_create", { p_title: draftTitle, p_body: draftBody });
    busy = false;

    if (!isOk(result)) {
      error = failText(result);
      render();
      return;
    }

    draftTitle = "";
    draftBody = "";
    view = "list";
    sort = "new";
    status = "";
    if (typeof showNotification === "function") {
      showNotification("💡 Pomysł opublikowany. Dziękujemy!", "success");
    }
    loadPosts(false);
  }

  // ---------- Wpis ----------

  async function openPost(id) {
    currentPostId = id;
    view = "post";
    error = "";
    draftComment = "";
    postData = null;
    render();
    await loadPost();
  }

  let postData = null;

  async function loadPost() {
    const id = currentPostId;
    const result = await call("idler_forum_get", { p_post_id: id });
    if (id !== currentPostId || view !== "post") return;

    if (!isOk(result)) {
      error = failText(result);
    } else {
      postData = result.data;
      error = "";
    }
    render();
  }

  function renderPost(root) {
    root.appendChild(
      button("← Wróć do listy", "game-dialog-cancel forum-back", () => {
        view = "list";
        error = "";
        // Odśwież liczniki na liście.
        loadPosts(false);
      }),
    );

    if (!postData) {
      root.appendChild(error ? el("p", "chat-error forum-error", error) : el("p", "ranking-message", "Ładowanie…"));
      return;
    }

    const post = postData.post;
    const head = el("div", "forum-head");
    head.appendChild(el("h3", "forum-heading", post.title));
    head.appendChild(buildBadge(post.status));
    root.appendChild(head);
    root.appendChild(el("div", "forum-meta", post.username + " · " + formatDate(post.created_at)));
    root.appendChild(el("p", "forum-body", post.body));

    if (post.admin_note) {
      const note = el("div", "forum-note");
      note.appendChild(el("strong", "", "Odpowiedź twórcy: "));
      note.appendChild(document.createTextNode(post.admin_note));
      root.appendChild(note);
    }

    const voteRow = el("div", "forum-voterow");
    voteRow.appendChild(buildVote(post, render));
    voteRow.appendChild(el("span", "forum-meta", "Czy podoba Ci się ten pomysł?"));
    root.appendChild(voteRow);

    if (window.IdlerAdmin?.isAdmin?.()) {
      root.appendChild(buildAdminControls(post));
    }

    root.appendChild(el("h4", "forum-subheading", "Komentarze (" + postData.comments.length + ")"));

    postData.comments.forEach((comment) => {
      const row = el("div", "forum-comment" + (comment.mine ? " mine" : ""));
      row.appendChild(el("div", "forum-meta", comment.username + " · " + formatDate(comment.created_at)));
      row.appendChild(el("div", "forum-comment-body", comment.body));
      if (window.IdlerAdmin?.isAdmin?.()) {
        row.appendChild(
          button("Ukryj komentarz", "admin-btn", async () => {
            const yes = await window.IdlerAdmin.confirmAction("Ukryć ten komentarz?", "Ukryj komentarz", "Ukryj");
            if (!yes) return;
            const result = await window.IdlerAdmin.call("idler_admin_forum_hide_comment", { p_comment_id: comment.id });
            if (!isOk(result)) {
              error = failText(result);
              render();
              return;
            }
            await loadPost();
          }),
        );
      }
      root.appendChild(row);
    });

    const input = el("textarea", "bugreport-text forum-comment-input");
    input.maxLength = 400;
    input.rows = 3;
    input.placeholder = "Napisz komentarz (maks. 400 znaków)";
    input.value = draftComment;
    input.disabled = busy;
    input.addEventListener("input", () => (draftComment = input.value));
    root.appendChild(input);

    if (error) root.appendChild(el("p", "chat-error forum-error", error));

    const send = button(busy ? "Wysyłanie…" : "Dodaj komentarz", "game-dialog-confirm bugreport-send", submitComment);
    send.disabled = busy;
    root.appendChild(send);
  }

  function buildAdminControls(post) {
    const box = el("div", "forum-admin");
    box.appendChild(el("h4", "", "🛡️ Moderacja"));

    const select = el("select", "admin-select");
    STATUSES.filter((item) => item.id).forEach((item) => {
      const node = el("option", "", item.label);
      node.value = item.id;
      if (item.id === post.status) node.selected = true;
      select.appendChild(node);
    });
    box.appendChild(select);

    const note = el("textarea", "bugreport-text forum-comment-input");
    note.maxLength = 500;
    note.rows = 2;
    note.placeholder = "Odpowiedź twórcy (widoczna dla wszystkich)";
    note.value = post.admin_note || "";
    box.appendChild(note);

    const actions = el("div", "admin-actions");
    const save = async (hidden) => {
      if (hidden) {
        const yes = await window.IdlerAdmin.confirmAction("Ukryć ten wpis przed graczami?", "Ukryj wpis", "Ukryj");
        if (!yes) return;
      }
      const result = await window.IdlerAdmin.call("idler_admin_forum_update", {
        p_post_id: post.id,
        p_status: select.value,
        p_note: note.value,
        p_hidden: hidden,
      });
      if (!isOk(result)) {
        error = failText(result);
        render();
        return;
      }
      if (hidden) {
        view = "list";
        loadPosts(false);
      } else {
        await loadPost();
      }
    };
    actions.appendChild(button("Zapisz status i odpowiedź", "admin-btn", () => save(false)));
    actions.appendChild(button("Ukryj wpis", "admin-btn danger", () => save(true)));
    box.appendChild(actions);
    return box;
  }

  async function submitComment() {
    if (busy || !currentPostId) return;
    busy = true;
    error = "";
    render();

    const result = await call("idler_forum_comment", { p_post_id: currentPostId, p_body: draftComment });
    busy = false;

    if (!isOk(result)) {
      error = failText(result);
      render();
      return;
    }

    draftComment = "";
    await loadPost();
  }

  // ---------- Główny render ----------

  function render() {
    const root = container();
    if (!root) return;

    root.replaceChildren();

    if (!isSignedIn()) {
      root.appendChild(
        el("p", "ranking-message", "Forum wymaga zalogowanego konta (i skonfigurowanego Supabase)."),
      );
      return;
    }

    if (view === "new") renderNew(root);
    else if (view === "post") renderPost(root);
    else renderList(root);
  }

  window.openForumScreen = function openForumScreen() {
    if (typeof showScreen === "function") {
      showScreen("screen-forum");
    }
    view = "list";
    error = "";
    if (isSignedIn()) {
      loadPosts(false);
    } else {
      render();
    }
  };

  function onAccountState() {
    const screen = document.getElementById("screen-forum");
    if (screen && screen.offsetParent !== null && !busy) {
      if (isSignedIn() && view === "list" && posts.length === 0 && !loading) {
        loadPosts(false);
      } else {
        render();
      }
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

  window.IdlerForumUI = { render };
})();
