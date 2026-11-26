/*
 * Interfejs kont: karta "Konto" w Ustawieniach, okno logowania / rejestracji
 * i wskaźnik zalogowanego gracza w panelu bohatera.
 * Logika kont jest w js/online/accounts.js.
 */
(function () {
  const CARD_ID = "account-card-body";
  const HERO_NAME_ID = "side-hero-name";
  let defaultHeroName = null;

  let overlay = null;
  let currentMode = "login";
  let busy = false;
  let recoveryPrompted = false;

  function getAccounts() {
    return window.IdlerAccounts || null;
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

  // ---------- Karta w ustawieniach ----------

  function renderCard() {
    const body = document.getElementById(CARD_ID);
    const accounts = getAccounts();

    if (!body || !accounts) {
      return;
    }

    const state = accounts.getState();
    body.textContent = "";

    const status = el("p", "account-card-status");
    const actions = el("div", "account-card-actions");
    const hint = el("p", "account-card-hint");

    if (state.status === "unconfigured") {
      status.textContent = "Konta online nie są jeszcze skonfigurowane.";
      hint.textContent =
        "Wpisz adres i klucz Supabase w pliku js/online/onlineConfig.js (instrukcja w docs/KONTA-SUPABASE.md). Gra działa normalnie bez konta.";
    } else if (state.status === "unavailable") {
      status.textContent = "Nie udało się uruchomić kont online.";
      hint.textContent =
        "Sprawdź plik js/vendor/supabase-js-2.45.4.js i dane w js/online/onlineConfig.js. Gra działa normalnie bez konta.";
    } else if (state.status === "loading") {
      status.textContent = "Sprawdzanie konta...";
    } else if (state.status === "signedIn" || state.status === "recovery") {
      const name = state.profile?.username;

      status.append("Zalogowano jako ");
      status.appendChild(el("strong", "", name || state.user?.email || "gracz"));

      if (state.user?.email && name) {
        hint.textContent = "Adres e-mail: " + state.user.email;
      }

      const logout = el("button", "", "🚪 Wyloguj się");
      logout.type = "button";
      logout.addEventListener("click", handleSignOut);
      actions.appendChild(logout);

      if (state.status === "recovery") {
        const change = el("button", "", "🔑 Ustaw nowe hasło");
        change.type = "button";
        change.addEventListener("click", () => openDialog("recovery"));
        actions.appendChild(change);
      }
    } else {
      status.textContent = "Nie jesteś zalogowany. Gra działa bez konta, ale konto da Ci dostęp do funkcji online.";

      const login = el("button", "", "🔐 Zaloguj się");
      login.type = "button";
      login.addEventListener("click", () => openDialog("login"));

      const register = el("button", "", "✨ Załóż konto");
      register.type = "button";
      register.addEventListener("click", () => openDialog("register"));

      actions.append(login, register);
    }

    body.appendChild(status);

    if (actions.children.length > 0) {
      body.appendChild(actions);
    }

    if (hint.textContent) {
      body.appendChild(hint);
    }

    if (
      state.status === "signedIn" &&
      window.IdlerCloudSaveUI &&
      typeof window.IdlerCloudSaveUI.buildBlock === "function"
    ) {
      body.appendChild(window.IdlerCloudSaveUI.buildBlock());
    }
  }

  // ---------- Imię bohatera = nazwa konta ----------

  function renderHeroName() {
    const target = document.getElementById(HERO_NAME_ID);
    const accounts = getAccounts();

    if (!target || !accounts) {
      return;
    }

    if (defaultHeroName === null) {
      defaultHeroName = target.textContent.trim();
    }

    const state = accounts.getState();
    const username = state.profile?.username;

    target.textContent =
      state.status === "signedIn" && username ? username : defaultHeroName;
  }

  // ---------- Wymóg konta ----------

  // Gra wymaga konta tylko wtedy, gdy konta są skonfigurowane i działają.
  // Bez konfiguracji (albo gdy biblioteka się nie załadowała) gra nie jest blokowana.
  function isGateRequired() {
    const accounts = getAccounts();

    return Boolean(
      accounts &&
        accounts.isAvailable() &&
        accounts.getState().status === "signedOut",
    );
  }

  function ensureGate() {
    if (isGateRequired() && !overlay) {
      openDialog("login");
    }
  }

  // ---------- Okno ----------

  function closeDialog() {
    if (!overlay) {
      return;
    }

    document.removeEventListener("keydown", onKeyDown, true);
    overlay.remove();
    overlay = null;
    busy = false;
    ensureGate();
  }

  function onKeyDown(event) {
    if (event.key === "Escape" && !busy && !isGateRequired()) {
      event.preventDefault();
      event.stopPropagation();
      closeDialog();
    }
  }

  function setMessage(text, kind) {
    const message = overlay?.querySelector(".account-message");

    if (!message) {
      return;
    }

    message.textContent = text || "";
    message.className = "account-message" + (kind ? " " + kind : "");
  }

  function setBusy(value) {
    busy = value;

    overlay?.querySelectorAll("button, input").forEach((node) => {
      node.disabled = value;
    });
  }

  function buildField(config) {
    const field = el("div", "account-field");
    const label = el("label", "", config.label);
    const input = document.createElement("input");

    input.type = config.type;
    input.name = config.name;
    input.id = "account-field-" + config.name;
    input.autocomplete = config.autocomplete;
    input.required = true;
    input.spellcheck = false;

    if (config.maxLength) {
      input.maxLength = config.maxLength;
    }

    label.htmlFor = input.id;
    field.append(label, input);

    if (config.hint) {
      field.appendChild(el("span", "account-field-hint", config.hint));
    }

    return field;
  }

  function buildDialog(mode) {
    const accounts = getAccounts();
    const dialog = el("section", "game-dialog account-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");

    const titles = {
      login: "Logowanie",
      register: "Zakładanie konta",
      reset: "Reset hasła",
      recovery: "Nowe hasło",
    };

    const required = isGateRequired();
    const title = el(
      "h2",
      "game-dialog-title",
      required && (mode === "login" || mode === "register")
        ? "Witaj w Idlerze"
        : titles[mode],
    );
    title.id = "account-dialog-title";
    dialog.setAttribute("aria-labelledby", title.id);
    dialog.appendChild(title);

    if (mode === "login" || mode === "register") {
      const tabs = el("div", "account-tabs");
      tabs.setAttribute("role", "tablist");

      [
        ["login", "Zaloguj się"],
        ["register", "Załóż konto"],
      ].forEach(([tabMode, text]) => {
        const tab = el("button", "account-tab", text);
        tab.type = "button";
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-selected", tabMode === mode ? "true" : "false");
        tab.addEventListener("click", () => {
          if (!busy && tabMode !== currentMode) {
            openDialog(tabMode);
          }
        });
        tabs.appendChild(tab);
      });

      dialog.appendChild(tabs);
    }

    const form = el("form", "account-form");
    form.noValidate = true;

    if (required && (mode === "login" || mode === "register")) {
      form.appendChild(
        el(
          "p",
          "account-intro",
          mode === "register"
            ? "Nazwa gracza będzie imieniem Twojego bohatera i będzie widoczna dla innych graczy."
            : "Aby grać, zaloguj się na swoje konto albo załóż nowe.",
        ),
      );
    }

    const passwordHint =
      "Co najmniej " + accounts.MIN_PASSWORD_LENGTH + " znaków.";

    if (mode === "register") {
      form.appendChild(
        buildField({
          label: "Nazwa gracza",
          type: "text",
          name: "username",
          autocomplete: "username",
          maxLength: 20,
          hint: "3–20 znaków: litery bez polskich znaków, cyfry, _ i -. Będzie widoczna dla innych graczy.",
        }),
      );
    }

    if (mode === "login") {
      form.appendChild(
        buildField({
          label: "Nick lub adres e-mail",
          type: "text",
          name: "email",
          autocomplete: "username",
        }),
      );
    } else if (mode === "register" || mode === "reset") {
      form.appendChild(
        buildField({
          label: "Adres e-mail",
          type: "email",
          name: "email",
          autocomplete: "email",
        }),
      );
    }

    if (mode === "reset") {
      form.insertBefore(
        el(
          "p",
          "account-intro",
          "Podaj adres e-mail konta. Wyślemy link do ustawienia nowego hasła.",
        ),
        form.firstChild,
      );
    }

    if (mode === "recovery") {
      form.appendChild(
        el("p", "account-intro", "Ustaw nowe hasło do swojego konta."),
      );
    }

    if (mode === "login") {
      form.appendChild(
        buildField({
          label: "Hasło",
          type: "password",
          name: "password",
          autocomplete: "current-password",
        }),
      );
    }

    if (mode === "register" || mode === "recovery") {
      form.appendChild(
        buildField({
          label: mode === "recovery" ? "Nowe hasło" : "Hasło",
          type: "password",
          name: "password",
          autocomplete: "new-password",
          hint: passwordHint,
        }),
      );
      form.appendChild(
        buildField({
          label: "Powtórz hasło",
          type: "password",
          name: "password2",
          autocomplete: "new-password",
        }),
      );
    }

    if (mode !== "reset") {
      const showRow = el("label", "account-show-password");
      const showBox = document.createElement("input");
      showBox.type = "checkbox";
      showBox.addEventListener("change", () => {
        form.querySelectorAll('input[name^="password"]').forEach((input) => {
          input.type = showBox.checked ? "text" : "password";
        });
      });
      showRow.append(showBox, document.createTextNode("Pokaż hasło"));
      form.appendChild(showRow);
    }

    if (mode === "login") {
      const forgot = el("button", "account-link-button", "Nie pamiętasz hasła?");
      forgot.type = "button";
      forgot.addEventListener("click", () => {
        if (!busy) {
          openDialog("reset");
        }
      });
      form.appendChild(forgot);
    }

    const message = el("p", "account-message");
    message.setAttribute("role", "alert");
    form.appendChild(message);

    const actions = el("div", "game-dialog-actions");

    let cancel = null;

    if (!required || mode === "reset") {
      cancel = el(
        "button",
        "game-dialog-cancel",
        required ? "Wróć" : mode === "recovery" ? "Później" : "Zamknij",
      );
      cancel.type = "button";
      cancel.addEventListener("click", () => {
        if (busy) {
          return;
        }

        if (required) {
          openDialog("login");
        } else {
          closeDialog();
        }
      });
    }

    const submitTexts = {
      login: "Zaloguj się",
      register: "Załóż konto",
      reset: "Wyślij link",
      recovery: "Zapisz hasło",
    };

    const submit = el("button", "game-dialog-confirm", submitTexts[mode]);
    submit.type = "submit";

    if (cancel) {
      actions.appendChild(cancel);
    }

    actions.appendChild(submit);
    form.appendChild(actions);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleSubmit(mode, form);
    });

    dialog.appendChild(form);

    return dialog;
  }

  function openDialog(mode) {
    if (!getAccounts() || !getAccounts().isAvailable()) {
      return;
    }

    currentMode = mode;

    const previous = overlay;
    overlay = el("div", "game-dialog-overlay");
    overlay.appendChild(buildDialog(mode));
    document.body.appendChild(overlay);

    if (previous) {
      previous.remove();
    } else {
      document.addEventListener("keydown", onKeyDown, true);
    }

    const firstInput = overlay.querySelector("input");

    if (firstInput) {
      firstInput.focus();
    }
  }

  function readForm(form) {
    const values = {};

    form.querySelectorAll("input[name]").forEach((input) => {
      values[input.name] = input.value;
    });

    return values;
  }

  async function handleSubmit(mode, form) {
    if (busy) {
      return;
    }

    const accounts = getAccounts();
    const values = readForm(form);

    if (
      (mode === "register" || mode === "recovery") &&
      values.password !== values.password2
    ) {
      setMessage("Hasła nie są takie same.", "error");
      return;
    }

    setMessage("");
    setBusy(true);

    let result;

    try {
      if (mode === "login") {
        result = await accounts.signIn({
          email: values.email,
          password: values.password,
        });
      } else if (mode === "register") {
        result = await accounts.signUp({
          email: values.email,
          password: values.password,
          username: values.username,
        });
      } else if (mode === "reset") {
        result = await accounts.sendPasswordReset(values.email);
      } else {
        result = await accounts.updatePassword(values.password);
      }
    } catch (error) {
      result = { ok: false, error: accounts.translateError(error) };
    }

    if (!overlay) {
      return;
    }

    setBusy(false);

    if (!result.ok) {
      setMessage(result.error, "error");
      return;
    }

    if (mode === "login" || mode === "recovery") {
      closeDialog();
      notify(mode === "login" ? "Zalogowano." : "Hasło zostało zmienione.");
      return;
    }

    if (mode === "register") {
      if (result.needsConfirmation) {
        showInfo(
          "Konto utworzone",
          "Wysłaliśmy wiadomość z linkiem potwierdzającym na adres " +
            values.email.trim() +
            ". Kliknij go, a potem zaloguj się.",
        );
      } else {
        closeDialog();
        notify("Konto zostało utworzone.");
      }
      return;
    }

    showInfo(
      "Sprawdź skrzynkę",
      "Jeśli konto z tym adresem istnieje, wysłaliśmy na nie link do ustawienia nowego hasła.",
    );
  }

  function showInfo(title, text) {
    if (!overlay) {
      return;
    }

    const dialog = el("section", "game-dialog account-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.appendChild(el("h2", "game-dialog-title", title));

    const body = el("div", "game-dialog-message");
    body.appendChild(el("p", "", text));
    dialog.appendChild(body);

    const actions = el("div", "game-dialog-actions");
    const ok = el("button", "game-dialog-confirm", "OK");
    ok.type = "button";
    ok.addEventListener("click", closeDialog);
    actions.appendChild(ok);
    dialog.appendChild(actions);

    overlay.textContent = "";
    overlay.appendChild(dialog);
    ok.focus();
  }

  function notify(text) {
    if (typeof showNotification === "function") {
      showNotification(text, "success");
    }
  }

  async function handleSignOut() {
    const accounts = getAccounts();

    const confirmed =
      typeof showGameConfirm === "function"
        ? await showGameConfirm("Na pewno chcesz się wylogować? Aby dalej grać, trzeba będzie zalogować się ponownie. Postęp w grze zostanie na tym urządzeniu.", {
            title: "Wylogowanie",
            confirmText: "Wyloguj",
          })
        : true;

    if (!confirmed) {
      return;
    }

    // Ostatnia wysyłka zapisu do chmury przed wylogowaniem (najwyżej kilka sekund).
    if (window.IdlerCloudSave && typeof window.IdlerCloudSave.flush === "function") {
      await window.IdlerCloudSave.flush();
    }

    const result = await accounts.signOut();

    if (!result.ok) {
      notify(result.error);
    }
  }

  window.IdlerAccountUI = { renderCard };

  // ---------- Start ----------

  function refresh(state) {
    renderCard();
    renderHeroName();

    if (overlay && state?.status === "signedIn" && currentMode !== "recovery") {
      closeDialog();
    }

    ensureGate();

    // Wejście z linku resetu hasła: od razu pokaż okno z nowym hasłem.
    if (state?.status === "recovery") {
      if (!recoveryPrompted) {
        recoveryPrompted = true;
        openDialog("recovery");
      }
    } else {
      recoveryPrompted = false;
    }
  }

  function start() {
    const accounts = getAccounts();

    if (!accounts) {
      return;
    }

    renderCard();
    accounts.subscribe(refresh);
    accounts.init().then(() => refresh(accounts.getState()));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
