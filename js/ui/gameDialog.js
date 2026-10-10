/*
 * Okno potwierdzenia w stylu gry – zamiennik window.confirm().
 * Użycie:  showGameConfirm("Treść pytania", { confirmText: "Tak", cancelText: "Anuluj" })
 *            .then(ok => { if (ok) { ... } });
 * Zwraca Promise<boolean>. Gdy nie da się zbudować okna, wraca do window.confirm().
 */
function showGameConfirm(message, options) {
    const settings = Object.assign(
        { title: "Potwierdzenie", confirmText: "Tak", cancelText: "Anuluj" },
        options || {}
    );

    if (typeof document === "undefined" || !document.body) {
        return Promise.resolve(
            typeof window !== "undefined" && typeof window.confirm === "function"
                ? window.confirm(message)
                : false
        );
    }

    return new Promise(resolve => {
        const previouslyFocused = document.activeElement;
        const overlay = document.createElement("div");
        overlay.className = "game-dialog-overlay";

        const dialog = document.createElement("section");
        dialog.className = "game-dialog";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");

        const title = document.createElement("h2");
        title.className = "game-dialog-title";
        title.textContent = settings.title;

        const text = document.createElement("div");
        text.className = "game-dialog-message";
        String(message).split("\n").forEach(line => {
            const paragraph = document.createElement("p");
            paragraph.textContent = line;
            if (line.trim() === "") {
                paragraph.className = "game-dialog-gap";
            }
            text.appendChild(paragraph);
        });

        const actions = document.createElement("div");
        actions.className = "game-dialog-actions";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.className = "game-dialog-cancel";
        cancelButton.textContent = settings.cancelText;

        const confirmButton = document.createElement("button");
        confirmButton.type = "button";
        confirmButton.className = "game-dialog-confirm";
        confirmButton.textContent = settings.confirmText;

        function close(result) {
            document.removeEventListener("keydown", onKeyDown, true);
            overlay.remove();
            if (previouslyFocused && typeof previouslyFocused.focus === "function") {
                previouslyFocused.focus();
            }
            resolve(result);
        }

        function onKeyDown(event) {
            if (event.key === "Escape") {
                event.preventDefault();
                close(false);
            }
        }

        cancelButton.addEventListener("click", () => close(false));
        confirmButton.addEventListener("click", () => close(true));
        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                close(false);
            }
        });
        document.addEventListener("keydown", onKeyDown, true);

        actions.append(cancelButton, confirmButton);
        dialog.append(title, text, actions);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        confirmButton.focus();
    });
}
