/*
 * Konta graczy (Supabase Auth) – logika bez interfejsu.
 *
 * Gra działa w pełni także bez konta i bez konfiguracji. Konto jest dodatkiem
 * pod funkcje online (ranking, profil publiczny) – nie dotyka zapisu gry (idler_save).
 *
 * Stany (IdlerAccounts.getState().status):
 *   "unconfigured" – brak URL/klucza w js/online/onlineConfig.js
 *   "unavailable"  – biblioteka Supabase się nie załadowała
 *   "loading"      – sprawdzanie sesji
 *   "signedOut"    – niezalogowany
 *   "signedIn"     – zalogowany (user + profile)
 *   "recovery"     – wejście z linku "zresetuj hasło": trzeba ustawić nowe hasło
 */
const IdlerAccounts = (function () {
  const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MIN_PASSWORD_LENGTH = 8;
  const MAX_PASSWORD_LENGTH = 72;

  let client = null;
  let initialized = false;
  const listeners = new Set();

  const state = {
    status: "loading",
    user: null,
    profile: null,
  };

  function getConfig() {
    return window.IDLER_ONLINE_CONFIG || {};
  }

  function hasConfig() {
    const config = getConfig();

    return Boolean(
      String(config.supabaseUrl || "").trim() &&
        String(config.supabaseAnonKey || "").trim(),
    );
  }

  function getState() {
    return {
      status: state.status,
      user: state.user,
      profile: state.profile,
    };
  }

  function subscribe(listener) {
    listeners.add(listener);

    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  function notify() {
    const snapshot = getState();

    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error("Błąd w nasłuchiwaniu kont:", error);
      }
    });
  }

  function setState(changes) {
    Object.assign(state, changes);
    notify();
  }

  // ---------- Walidacja pól (czyste funkcje, zwracają tekst błędu lub "") ----------

  function validateEmail(email) {
    const value = String(email || "").trim();

    if (!value) {
      return "Podaj adres e-mail.";
    }

    if (!EMAIL_PATTERN.test(value)) {
      return "Adres e-mail wygląda na niepoprawny.";
    }

    return "";
  }

  function validateUsername(username) {
    const value = String(username || "").trim();

    if (!value) {
      return "Podaj nazwę gracza.";
    }

    if (!USERNAME_PATTERN.test(value)) {
      return "Nazwa gracza: 3–20 znaków, tylko litery bez polskich znaków, cyfry, _ i -.";
    }

    return "";
  }

  function validatePassword(password) {
    const value = String(password || "");

    if (value.length < MIN_PASSWORD_LENGTH) {
      return "Hasło musi mieć co najmniej " + MIN_PASSWORD_LENGTH + " znaków.";
    }

    if (value.length > MAX_PASSWORD_LENGTH) {
      return "Hasło może mieć najwyżej " + MAX_PASSWORD_LENGTH + " znaków.";
    }

    return "";
  }

  // ---------- Tłumaczenie błędów serwera ----------

  function translateError(error) {
    const message = String(error?.message || error || "").toLowerCase();
    const code = String(error?.code || "").toLowerCase();

    if (message.includes("invalid login credentials")) {
      return "Nieprawidłowy e-mail lub hasło.";
    }

    if (message.includes("email not confirmed")) {
      return "Potwierdź adres e-mail: kliknij link w wiadomości, którą wysłaliśmy.";
    }

    if (
      message.includes("user already registered") ||
      code === "user_already_exists" ||
      code === "email_exists"
    ) {
      return "Konto z tym adresem e-mail już istnieje.";
    }

    if (
      message.includes("rate limit") ||
      message.includes("too many") ||
      code === "over_email_send_rate_limit" ||
      code === "over_request_rate_limit"
    ) {
      return "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.";
    }

    if (message.includes("password") && message.includes("weak")) {
      return "To hasło jest zbyt słabe. Wybierz dłuższe lub mniej oczywiste.";
    }

    if (
      message.includes("failed to fetch") ||
      message.includes("networkerror") ||
      message.includes("network request failed") ||
      message.includes("load failed")
    ) {
      return "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.";
    }

    if (message.includes("same password")) {
      return "Nowe hasło musi być inne niż poprzednie.";
    }

    if (message.includes("database error saving new user")) {
      return "Nie udało się utworzyć konta. Ta nazwa gracza mogła zostać właśnie zajęta.";
    }

    return "Coś poszło nie tak. Spróbuj ponownie za chwilę.";
  }

  // ---------- Profil ----------

  async function loadProfile(user) {
    if (!client || !user) {
      return null;
    }

    try {
      const { data, error } = await client
        .from("player_profiles")
        .select("id, username, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.warn("Nie udało się wczytać profilu:", error.message);
        return null;
      }

      return data || null;
    } catch (error) {
      console.warn("Nie udało się wczytać profilu:", error);
      return null;
    }
  }

  async function applySession(session, event) {
    if (event === "PASSWORD_RECOVERY") {
      setState({
        status: "recovery",
        user: session?.user || null,
        profile: null,
      });
      return;
    }

    if (!session?.user) {
      setState({ status: "signedOut", user: null, profile: null });
      return;
    }

    // Najpierw stan zalogowany (z nazwą z metadanych), potem doczytany profil.
    const metadataName = session.user.user_metadata?.username || null;

    setState({
      status: "signedIn",
      user: session.user,
      profile: metadataName ? { username: metadataName } : null,
    });

    const profile = await loadProfile(session.user);

    if (profile && state.user?.id === session.user.id) {
      setState({ profile });
    }
  }

  // ---------- Inicjalizacja ----------

  async function init() {
    if (initialized) {
      return getState();
    }

    initialized = true;

    if (!hasConfig()) {
      setState({ status: "unconfigured" });
      return getState();
    }

    const factory = window.supabase?.createClient;

    if (typeof factory !== "function") {
      setState({ status: "unavailable" });
      return getState();
    }

    const config = getConfig();

    try {
      client = factory(
        String(config.supabaseUrl).trim(),
        String(config.supabaseAnonKey).trim(),
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        },
      );
    } catch (error) {
      console.error("Nie udało się utworzyć klienta Supabase:", error);
      setState({ status: "unavailable" });
      return getState();
    }

    client.auth.onAuthStateChange((event, session) => {
      // Odroczenie: wywołania Supabase wewnątrz tego callbacku mogłyby się zablokować.
      setTimeout(() => {
        applySession(session, event);
      }, 0);
    });

    try {
      const { data } = await client.auth.getSession();

      // Wejście z linku resetu hasła zgłasza PASSWORD_RECOVERY w onAuthStateChange.
      if (state.status !== "recovery") {
        await applySession(data?.session || null, "INITIAL_SESSION");
      }
    } catch (error) {
      console.warn("Nie udało się sprawdzić sesji:", error);
      setState({ status: "signedOut", user: null, profile: null });
    }

    return getState();
  }

  function isAvailable() {
    return Boolean(client);
  }

  // ---------- Operacje ----------

  async function checkUsernameAvailable(username) {
    const { data, error } = await client.rpc("idler_username_available", {
      candidate: String(username).trim(),
    });

    if (error) {
      throw error;
    }

    return data === true;
  }

  async function signUp({ email, password, username }) {
    if (!client) {
      return { ok: false, error: "Konta online są niedostępne." };
    }

    const problem =
      validateUsername(username) ||
      validateEmail(email) ||
      validatePassword(password);

    if (problem) {
      return { ok: false, error: problem };
    }

    try {
      const available = await checkUsernameAvailable(username);

      if (!available) {
        return { ok: false, error: "Ta nazwa gracza jest już zajęta." };
      }

      const { data, error } = await client.auth.signUp({
        email: String(email).trim(),
        password: String(password),
        options: {
          data: { username: String(username).trim() },
          emailRedirectTo: window.location.origin + window.location.pathname,
        },
      });

      if (error) {
        return { ok: false, error: translateError(error) };
      }

      // Przy włączonym potwierdzaniu e-maila istniejące konto nie zwraca błędu,
      // tylko użytkownika bez tożsamości.
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { ok: false, error: "Konto z tym adresem e-mail już istnieje." };
      }

      return {
        ok: true,
        needsConfirmation: !data?.session,
      };
    } catch (error) {
      return { ok: false, error: translateError(error) };
    }
  }

  async function signIn({ email, password }) {
    if (!client) {
      return { ok: false, error: "Konta online są niedostępne." };
    }

    const problem = validateEmail(email) || (password ? "" : "Podaj hasło.");

    if (problem) {
      return { ok: false, error: problem };
    }

    try {
      const { error } = await client.auth.signInWithPassword({
        email: String(email).trim(),
        password: String(password),
      });

      if (error) {
        return { ok: false, error: translateError(error) };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: translateError(error) };
    }
  }

  async function signOut() {
    if (!client) {
      return { ok: true };
    }

    try {
      const { error } = await client.auth.signOut();

      if (error) {
        return { ok: false, error: translateError(error) };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: translateError(error) };
    }
  }

  async function sendPasswordReset(email) {
    if (!client) {
      return { ok: false, error: "Konta online są niedostępne." };
    }

    const problem = validateEmail(email);

    if (problem) {
      return { ok: false, error: problem };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(
        String(email).trim(),
        {
          redirectTo: window.location.origin + window.location.pathname,
        },
      );

      if (error) {
        return { ok: false, error: translateError(error) };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: translateError(error) };
    }
  }

  async function updatePassword(newPassword) {
    if (!client) {
      return { ok: false, error: "Konta online są niedostępne." };
    }

    const problem = validatePassword(newPassword);

    if (problem) {
      return { ok: false, error: problem };
    }

    try {
      const { error } = await client.auth.updateUser({
        password: String(newPassword),
      });

      if (error) {
        return { ok: false, error: translateError(error) };
      }

      // Po zmianie hasła z linku sesja jest normalną sesją zalogowanego gracza.
      const { data } = await client.auth.getSession();
      await applySession(data?.session || null, "SIGNED_IN");

      return { ok: true };
    } catch (error) {
      return { ok: false, error: translateError(error) };
    }
  }

  // Klient Supabase dla innych modułów online (zapis w chmurze, ranking).
  function getClient() {
    return client;
  }

  function getUsername() {
    return state.profile?.username || null;
  }

  return {
    init,
    getState,
    subscribe,
    isAvailable,
    getClient,
    getUsername,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
    validateEmail,
    validateUsername,
    validatePassword,
    translateError,
    MIN_PASSWORD_LENGTH,
  };
})();

window.IdlerAccounts = IdlerAccounts;
