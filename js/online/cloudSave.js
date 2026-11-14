/*
 * Zapis postaci w chmurze (Supabase) – logika bez interfejsu.
 *
 * Zasady bezpieczeństwa:
 *  - zapis lokalny (idler_save) zostaje źródłem prawdy w trakcie gry; chmura jest jego kopią,
 *  - zanim zapis lokalny zostanie podmieniony zapisem z chmury, jego kopia trafia do
 *    idler_save_backup (przycisk "Przywróć kopię" w Ustawieniach),
 *  - zapis w chmurze ma numer wersji (revision); wysyłka działa tylko, jeśli numer się zgadza,
 *    więc zapis zmieniony na innym urządzeniu nigdy nie zostanie nadpisany po cichu,
 *  - świeża postać (np. po resecie) nie nadpisze zaawansowanego zapisu w chmurze bez pytania,
 *  - zapis lokalny jest przypisany do konta (idler_cloud_owner): inne konto na tym samym
 *    urządzeniu nie dostanie cudzej postaci.
 *
 * Stany (IdlerCloudSave.getState().status):
 *   "off"       – brak zalogowanego konta / konta niedostępne
 *   "checking"  – porównywanie zapisów po zalogowaniu
 *   "synced"    – zapis lokalny i chmurowy są zgodne
 *   "uploading" – trwa wysyłanie
 *   "offline"   – brak połączenia (ponowimy próbę)
 *   "error"     – inny błąd serwera
 *   "conflict"  – zapisy się różnią, gracz musi wybrać (patrz getConflict())
 */
const IdlerCloudSave = (function () {
  const SAVE_KEY = "idler_save";
  const BACKUP_KEY = "idler_save_backup";
  const OWNER_KEY = "idler_cloud_owner";
  const REV_KEY = "idler_cloud_rev";
  const SYNCED_TIME_KEY = "idler_cloud_synced_time";
  const TABLE = "cloud_saves";

  const UPLOAD_INTERVAL_MS = 3 * 60 * 1000;
  // Zapis lokalny zmieniony nie później niż tyle po ostatniej synchronizacji
  // uznajemy za "nietknięty" (autozapis zdążył jeszcze coś dopisać po wysyłce).
  const UNCHANGED_TOLERANCE_MS = 4 * 60 * 1000;
  const PRISTINE_MAX_LEVEL = 1;
  const PRISTINE_MAX_GOLD = 100;
  const GUARD_MIN_CLOUD_LEVEL = 3;
  const GZIP_PREFIX = "gz1:";

  const state = {
    status: "off",
    lastSyncedAt: null,
    message: "",
    flagged: false,
    flagReason: null,
  };

  let conflict = null;
  let userId = null;
  let syncedUserId = null;
  let timer = null;
  let busy = false;
  const listeners = new Set();

  // ---------- Stan i zdarzenia ----------

  function getState() {
    return {
      status: state.status,
      lastSyncedAt: state.lastSyncedAt,
      message: state.message,
      flagged: state.flagged,
      flagReason: state.flagReason,
    };
  }

  function getConflict() {
    return conflict;
  }

  function subscribe(listener) {
    listeners.add(listener);

    return function unsubscribe() {
      listeners.delete(listener);
    };
  }

  function setState(status, message) {
    state.status = status;
    state.message = message || "";
    listeners.forEach((listener) => {
      try {
        listener(getState());
      } catch (error) {
        console.error("Błąd w nasłuchiwaniu zapisu w chmurze:", error);
      }
    });
  }

  function getClient() {
    return window.IdlerAccounts?.getClient?.() || null;
  }

  function isNetworkError(error) {
    const message = String(error?.message || error || "").toLowerCase();

    return (
      message.includes("failed to fetch") ||
      message.includes("networkerror") ||
      message.includes("network request failed") ||
      message.includes("load failed") ||
      message.includes("timeout")
    );
  }

  // ---------- Kodowanie zapisu (gzip + base64) ----------

  function bytesToBase64(bytes) {
    let binary = "";
    const chunk = 0x8000;

    for (let index = 0; index < bytes.length; index += chunk) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(index, index + chunk),
      );
    }

    return btoa(binary);
  }

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  async function encodeSave(raw) {
    if (typeof CompressionStream !== "function") {
      return raw;
    }

    try {
      const stream = new Blob([raw])
        .stream()
        .pipeThrough(new CompressionStream("gzip"));
      const buffer = await new Response(stream).arrayBuffer();

      return GZIP_PREFIX + bytesToBase64(new Uint8Array(buffer));
    } catch (error) {
      console.warn("Kompresja zapisu nie powiodła się, wysyłam bez niej:", error);
      return raw;
    }
  }

  async function decodeSave(data) {
    if (typeof data !== "string") {
      throw new Error("Zapis w chmurze ma nieprawidłowy format.");
    }

    if (!data.startsWith(GZIP_PREFIX)) {
      return data;
    }

    if (typeof DecompressionStream !== "function") {
      throw new Error(
        "Ta przeglądarka nie obsługuje odczytu skompresowanego zapisu. Użyj nowszej przeglądarki.",
      );
    }

    const bytes = base64ToBytes(data.slice(GZIP_PREFIX.length));
    const stream = new Blob([bytes])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));

    return new Response(stream).text();
  }

  // ---------- Zapis lokalny ----------

  function readLocal() {
    let raw = null;

    try {
      raw = localStorage.getItem(SAVE_KEY);
    } catch (error) {
      return null;
    }

    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      const player = parsed?.player;

      if (!player || typeof player !== "object") {
        return null;
      }

      const level = Number(player.level) || 1;
      const gold = Number(player.gold) || 0;

      return {
        raw,
        level,
        time: Number(parsed.time) || 0,
        pristine: level <= PRISTINE_MAX_LEVEL && gold < PRISTINE_MAX_GOLD,
      };
    } catch (error) {
      return null;
    }
  }

  function readNumber(key) {
    const value = Number(localStorage.getItem(key));

    return Number.isFinite(value) && localStorage.getItem(key) !== null
      ? value
      : null;
  }

  function writeSyncInfo(ownerId, revision, savedTime) {
    try {
      localStorage.setItem(OWNER_KEY, ownerId);
      localStorage.setItem(REV_KEY, String(revision));
      localStorage.setItem(SYNCED_TIME_KEY, String(savedTime || 0));
    } catch (error) {
      console.warn("Nie udało się zapisać informacji o synchronizacji:", error);
    }
  }

  // ---------- Operacje na chmurze ----------

  async function fetchCloudMeta() {
    const { data, error } = await getClient()
      .from(TABLE)
      .select("revision, level, saved_time, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
  }

  async function fetchCloudData() {
    const { data, error } = await getClient()
      .from(TABLE)
      .select("save_data, revision, level, saved_time")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
  }

  // Zapis z chmury zastępuje lokalny (kopia lokalnego trafia do idler_save_backup).
  async function applyCloudSave() {
    const row = await fetchCloudData();

    if (!row) {
      throw new Error("W chmurze nie ma zapisu.");
    }

    const raw = await decodeSave(row.save_data);
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error("Zapis w chmurze jest uszkodzony.");
    }

    if (!parsed?.player || typeof parsed.player !== "object") {
      throw new Error("Zapis w chmurze nie zawiera postaci.");
    }

    const current = localStorage.getItem(SAVE_KEY);

    // Blokuje autozapisy, które nadpisałyby zapis przed przeładowaniem.
    window.idlerIsReloadingAfterBackground = true;

    if (current) {
      localStorage.setItem(BACKUP_KEY, current);
    }

    localStorage.setItem(SAVE_KEY, raw);
    writeSyncInfo(userId, row.revision, Number(parsed.time) || 0);
    window.location.reload();
  }

  // Nowa postać dla tego konta (zapis lokalny innego konta trafia do kopii zapasowej).
  function startNewCharacter() {
    const current = localStorage.getItem(SAVE_KEY);

    window.idlerIsReloadingAfterBackground = true;

    if (current) {
      localStorage.setItem(BACKUP_KEY, current);
    }

    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(REV_KEY);
    localStorage.removeItem(SYNCED_TIME_KEY);
    localStorage.setItem(OWNER_KEY, userId);
    window.location.reload();
  }

  // Wysyła zapis lokalny. options.force: nadpisz chmurę niezależnie od jej wersji.
  async function upload(options) {
    const force = Boolean(options?.force);
    const client = getClient();
    const local = readLocal();

    if (!client || !userId || !local) {
      return { ok: false, reason: "unavailable" };
    }

    const owner = localStorage.getItem(OWNER_KEY);
    const knownRevision = owner === userId ? readNumber(REV_KEY) : null;

    let payload;

    try {
      payload = JSON.parse(local.raw);
    } catch (error) {
      const failure = new Error("Zapis lokalny jest uszkodzony.");
      failure.userMessage = "Zapis lokalny jest uszkodzony, nie można go wysłać.";
      throw failure;
    }

    // Serwer sprawdza zapis (RPC idler_submit_save): zapisuje go zawsze,
    // a podejrzany postęp tylko oznacza flagą (wtedy gracz nie trafia do rankingu).
    const result = await client.rpc("idler_submit_save", {
      p_save: payload,
      p_expected_revision: force ? null : knownRevision,
      p_force: force,
    });

    if (result.error) {
      throw result.error;
    }

    const data = result.data || {};

    if (data.ok === true) {
      state.flagged = Boolean(data.flagged);
      state.flagReason = data.flag_reason || null;
      writeSyncInfo(userId, data.revision, local.time);
      return { ok: true, flagged: state.flagged };
    }

    if (data.error === "conflict") {
      return { ok: false, reason: "conflict" };
    }

    const failure = new Error(data.message || data.error || "Serwer odrzucił zapis.");
    failure.userMessage = data.message || "Serwer odrzucił zapis.";
    throw failure;
  }

  // ---------- Konflikty ----------

  function describeLocal(local) {
    return {
      level: local.level,
      time: local.time,
    };
  }

  function raiseConflict(kind, local, cloud) {
    conflict = {
      kind,
      local: describeLocal(local),
      cloud: {
        level: cloud.level,
        time: Number(cloud.saved_time) || 0,
        revision: cloud.revision,
      },
    };
    setState("conflict", "");
  }

  // Wybór gracza w konflikcie: "cloud" (wczytaj z chmury) lub "local" (nadpisz chmurę).
  async function resolveConflict(choice) {
    if (!conflict || busy) {
      return { ok: false };
    }

    busy = true;

    try {
      if (choice === "cloud") {
        await applyCloudSave();
        return { ok: true };
      }

      if (choice === "new") {
        startNewCharacter();
        return { ok: true };
      }

      setState("uploading", "");
      const result = await upload({ force: true });

      if (!result.ok) {
        setState("error", "Nie udało się nadpisać zapisu w chmurze. Spróbuj ponownie.");
        return { ok: false };
      }

      conflict = null;
      state.lastSyncedAt = Date.now();
      setState("synced", "");
      return { ok: true };
    } catch (error) {
      handleError(error);
      return { ok: false, error: translateError(error) };
    } finally {
      busy = false;
    }
  }

  // ---------- Błędy ----------

  function translateError(error) {
    if (isNetworkError(error)) {
      return "Brak połączenia z serwerem.";
    }

    const message = String(error?.message || "");

    if (error?.userMessage) {
      return error.userMessage;
    }

    if (
      error?.code === "42883" ||
      error?.code === "PGRST202" ||
      message.includes("idler_submit_save")
    ) {
      return "Brak funkcji kontroli zapisu. Uruchom supabase/anticheat_ranking.sql w Supabase.";
    }

    if (
      error?.code === "42P01" ||
      error?.code === "PGRST205" ||
      message.includes("cloud_saves")
    ) {
      return "Brak tabeli zapisu w chmurze. Uruchom supabase/cloud_saves.sql w Supabase.";
    }

    return message || "Nieznany błąd zapisu w chmurze.";
  }

  function handleError(error) {
    console.warn("Zapis w chmurze:", error);

    if (isNetworkError(error)) {
      setState("offline", "Brak połączenia. Spróbuję ponownie.");
      return;
    }

    setState("error", translateError(error));
  }

  // ---------- Synchronizacja po zalogowaniu ----------

  async function syncOnLogin() {
    if (busy) {
      return;
    }

    busy = true;
    conflict = null;
    setState("checking", "");

    try {
      const cloud = await fetchCloudMeta();
      const local = readLocal();
      const owner = localStorage.getItem(OWNER_KEY);
      const localRevision = readNumber(REV_KEY);
      const syncedTime = readNumber(SYNCED_TIME_KEY);
      const ownLocal = owner === userId;
      const foreignLocal = Boolean(owner) && owner !== userId;

      if (!cloud) {
        if (local && foreignLocal) {
          // Zapis lokalny należy do innego konta, a to konto nie ma jeszcze zapisu.
          conflict = {
            kind: "foreign-new",
            local: describeLocal(local),
            cloud: null,
          };
          setState("conflict", "");
          return;
        }

        // Chmura nie ma zapisu tego konta: stary numer wersji (jeśli był) już nie obowiązuje.
        localStorage.removeItem(REV_KEY);

        if (local) {
          const result = await upload();

          if (!result.ok) {
            throw new Error("Nie udało się wysłać zapisu do chmury.");
          }
        } else {
          // Brak zapisu lokalnego: przypisujemy urządzenie do konta, pierwszy autozapis
          // zostanie wysłany przy najbliższej synchronizacji.
          localStorage.setItem(OWNER_KEY, userId);
        }

        state.lastSyncedAt = Date.now();
        setState("synced", "");
        return;
      }

      // W chmurze jest zapis.
      if (!local || (local.pristine && !ownLocal)) {
        await applyCloudSave();
        return;
      }

      if (foreignLocal) {
        // Zapis lokalny cudzego konta: wczytujemy zapis tego konta (kopia lokalnego zostaje).
        await applyCloudSave();
        return;
      }

      if (ownLocal && localRevision === cloud.revision) {
        state.lastSyncedAt = Date.now();
        setState("synced", "");
        return;
      }

      if (
        ownLocal &&
        localRevision !== null &&
        localRevision < cloud.revision &&
        syncedTime !== null &&
        local.time - syncedTime <= UNCHANGED_TOLERANCE_MS
      ) {
        // Lokalnie nic ważnego się nie zmieniło, a chmura jest nowsza: bezpiecznie wczytujemy.
        await applyCloudSave();
        return;
      }

      raiseConflict(ownLocal ? "diverged" : "first-sync", local, cloud);
    } catch (error) {
      handleError(error);
    } finally {
      busy = false;
    }
  }

  // ---------- Wysyłanie cykliczne ----------

  async function uploadIfNeeded(options) {
    if (busy || !userId) {
      return { ok: false, reason: "busy" };
    }

    if (["off", "checking", "conflict"].includes(state.status)) {
      return { ok: false, reason: "paused" };
    }

    const local = readLocal();

    if (!local) {
      return { ok: false, reason: "nolocal" };
    }

    const syncedTime = readNumber(SYNCED_TIME_KEY);

    if (!options?.manual && syncedTime !== null && local.time === syncedTime) {
      return { ok: true, reason: "unchanged" };
    }

    busy = true;

    try {
      // Ochrona: świeża postać nie nadpisze zaawansowanego zapisu w chmurze bez pytania.
      if (local.pristine) {
        const cloud = await fetchCloudMeta();

        if (cloud && cloud.level > GUARD_MIN_CLOUD_LEVEL) {
          raiseConflict("pristine-guard", local, cloud);
          return { ok: false, reason: "conflict" };
        }
      }

      setState("uploading", "");
      const result = await upload();

      if (!result.ok) {
        if (result.reason === "conflict") {
          const cloud = await fetchCloudMeta();

          if (cloud) {
            raiseConflict("diverged", local, cloud);
          } else {
            setState("error", "Nie udało się wysłać zapisu do chmury.");
          }

          return { ok: false, reason: "conflict" };
        }

        setState("error", "Nie udało się wysłać zapisu do chmury.");
        return { ok: false, reason: result.reason };
      }

      state.lastSyncedAt = Date.now();
      setState("synced", "");
      return { ok: true };
    } catch (error) {
      handleError(error);
      return { ok: false, reason: "error" };
    } finally {
      busy = false;
    }
  }

  function manualUpload() {
    return uploadIfNeeded({ manual: true });
  }

  async function manualDownload() {
    if (busy || !userId) {
      return { ok: false };
    }

    busy = true;

    try {
      await applyCloudSave();
      return { ok: true };
    } catch (error) {
      handleError(error);
      return { ok: false, error: translateError(error) };
    } finally {
      busy = false;
    }
  }

  // Ostatnia wysyłka przed wylogowaniem (najwyżej kilka sekund).
  async function flush() {
    if (!userId || ["off", "checking", "conflict"].includes(state.status)) {
      return;
    }

    await Promise.race([
      uploadIfNeeded(),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
  }

  // ---------- Uruchomienie ----------

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      uploadIfNeeded();
    }, UPLOAD_INTERVAL_MS);
  }

  function onAccountState(accountState) {
    if (accountState.status === "signedIn" && accountState.user?.id) {
      userId = accountState.user.id;

      if (syncedUserId !== userId) {
        syncedUserId = userId;
        startTimer();
        syncOnLogin();
      }

      return;
    }

    if (accountState.status === "signedOut") {
      userId = null;
      syncedUserId = null;
      conflict = null;
      stopTimer();
      setState("off", "");
    }
  }

  function start() {
    const accounts = window.IdlerAccounts;

    if (!accounts) {
      return;
    }

    accounts.subscribe(onAccountState);
    onAccountState(accounts.getState());

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        uploadIfNeeded();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  return {
    getState,
    getConflict,
    subscribe,
    resolveConflict,
    manualUpload,
    manualDownload,
    flush,
    translateError,
    // Do testów:
    _encodeSave: encodeSave,
    _decodeSave: decodeSave,
  };
})();

window.IdlerCloudSave = IdlerCloudSave;
