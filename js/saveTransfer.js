/*
 * Eksport i import zapisu gry (Ustawienia → Zarządzanie zapisem).
 *
 * Eksport: plik .json z surową zawartością zapisu (idler_save).
 * Import: walidacja pliku, potwierdzenie, kopia zapasowa bieżącego zapisu
 * (idler_save_backup) i przeładowanie strony.
 */
const SAVE_TRANSFER_FORMAT = "idler-save";
const SAVE_BACKUP_KEY = "idler_save_backup";

function getSaveTransferStatusElement() {
    return document.getElementById("save-transfer-status");
}

function setSaveTransferStatus(message, isError = false) {
    const element = getSaveTransferStatusElement();
    if (!element) {
        return;
    }
    element.textContent = message;
    element.className = "save-transfer-status" + (isError ? " error" : " ok");
}

function buildSaveExportText() {
    if (typeof saveGame === "function") {
        saveGame();
    }
    const raw = localStorage.getItem("idler_save");
    if (!raw) {
        return null;
    }
    return JSON.stringify({
        format: SAVE_TRANSFER_FORMAT,
        exportedAt: new Date().toISOString(),
        save: raw
    });
}

function pad2Transfer(n) {
    return String(n).padStart(2, "0");
}

function exportSaveToFile() {
    const text = buildSaveExportText();
    if (!text) {
        setSaveTransferStatus("Brak zapisu do wyeksportowania.", true);
        return;
    }
    const now = new Date();
    const fileName = "idler-zapis-" + now.getFullYear() + "-" + pad2Transfer(now.getMonth() + 1) +
        "-" + pad2Transfer(now.getDate()) + "-" + pad2Transfer(now.getHours()) +
        pad2Transfer(now.getMinutes()) + ".json";
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSaveTransferStatus("Zapisano plik: " + fileName);
}

async function copySaveToClipboard() {
    const text = buildSaveExportText();
    if (!text) {
        setSaveTransferStatus("Brak zapisu do skopiowania.", true);
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        setSaveTransferStatus("Zapis skopiowany do schowka.");
    } catch (error) {
        setSaveTransferStatus("Nie udało się skopiować. Użyj eksportu do pliku.", true);
    }
}

function parseImportedSave(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (error) {
        throw new Error("Plik nie jest poprawnym JSON-em.");
    }
    let raw;
    if (parsed && parsed.format === SAVE_TRANSFER_FORMAT && typeof parsed.save === "string") {
        raw = parsed.save;
    } else if (parsed && typeof parsed === "object" && parsed.player) {
        // Surowy zapis (sam obiekt idler_save).
        raw = JSON.stringify(parsed);
    } else {
        throw new Error("To nie jest plik zapisu gry Idler.");
    }
    let save;
    try {
        save = JSON.parse(raw);
    } catch (error) {
        throw new Error("Zapis w pliku jest uszkodzony.");
    }
    if (!save || typeof save !== "object" || !save.player || typeof save.player !== "object") {
        throw new Error("W pliku brak danych postaci.");
    }
    return { raw, save };
}

async function applyImportedSave(text) {
    let imported;
    try {
        imported = parseImportedSave(text);
    } catch (error) {
        setSaveTransferStatus(error.message, true);
        return;
    }
    const level = Number(imported.save.player.level) || 1;
    const when = imported.save.time ? new Date(imported.save.time).toLocaleString("pl-PL") : "nieznany";
    const message = "Zaimportować zapis? Postać z poziomem " + level + " (zapisano: " + when +
        ") zastąpi obecną. Bieżący zapis zostanie zachowany jako kopia zapasowa.";
    const confirmed = typeof showGameConfirm === "function"
        ? await showGameConfirm(message, { title: "Import zapisu", confirmText: "Importuj" })
        : window.confirm(message);
    if (!confirmed) {
        return;
    }
    // Blokuje automatyczne zapisy, które nadpisałyby import przed przeładowaniem.
    window.idlerIsReloadingAfterBackground = true;
    const current = localStorage.getItem("idler_save");
    if (current) {
        localStorage.setItem(SAVE_BACKUP_KEY, current);
    }
    localStorage.setItem("idler_save", imported.raw);
    window.location.reload();
}

function importSaveFromFile(input) {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = () => applyImportedSave(String(reader.result || ""));
    reader.onerror = () => setSaveTransferStatus("Nie udało się odczytać pliku.", true);
    reader.readAsText(file);
}

async function restoreSaveBackup() {
    const backup = localStorage.getItem(SAVE_BACKUP_KEY);
    if (!backup) {
        setSaveTransferStatus("Brak kopii zapasowej.", true);
        return;
    }
    const confirmed = typeof showGameConfirm === "function"
        ? await showGameConfirm("Przywrócić zapis sprzed ostatniego importu? Obecny zapis zostanie zastąpiony.",
            { title: "Przywracanie kopii", confirmText: "Przywróć" })
        : window.confirm("Przywrócić kopię zapasową?");
    if (!confirmed) {
        return;
    }
    window.idlerIsReloadingAfterBackground = true;
    localStorage.setItem("idler_save", backup);
    localStorage.removeItem(SAVE_BACKUP_KEY);
    window.location.reload();
}

function refreshSaveTransferUi() {
    const button = document.getElementById("restore-save-backup-button");
    if (button) {
        button.hidden = !localStorage.getItem(SAVE_BACKUP_KEY);
    }
}

document.addEventListener("DOMContentLoaded", refreshSaveTransferUi);
