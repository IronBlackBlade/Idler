/*
 * Avatary bohatera (wyłącznie kosmetyczne).
 *
 * - Gracz wybiera avatar klikając portret w lewym górnym rogu.
 * - Część avatarów jest od początku, reszta odblokowuje się osiągnięciami.
 * - Wybór zapisuje się w player.avatarId (trafia też do zapisu online,
 *   skąd serwer bierze avatar do rankingu, profilu i czatu).
 */
const DEFAULT_AVATAR_ID = "turtle";

const AVATARS = Object.freeze([
    { id: "turtle", icon: "🐢", name: "Żółw" },
    { id: "wizard", icon: "🧙", name: "Czarodziej" },
    { id: "elf", icon: "🧝", name: "Elf" },
    { id: "fox", icon: "🦊", name: "Lis" },
    { id: "wolf", icon: "🐺", name: "Wilk" },
    { id: "owl", icon: "🦉", name: "Sowa" },
    { id: "bear", icon: "🐻", name: "Niedźwiedź" },
    { id: "cat", icon: "🐱", name: "Kot" },
    { id: "frog", icon: "🐸", name: "Żaba" },
    { id: "boar", icon: "🐗", name: "Dzik" },
    { id: "lion", icon: "🦁", name: "Lew" },
    { id: "octopus", icon: "🐙", name: "Ośmiornica" },
    { id: "bat", icon: "🦇", name: "Nietoperz" },
    { id: "goblin", icon: "👺", name: "Goblin" },
    { id: "robot", icon: "🤖", name: "Golem" },
    { id: "pumpkin", icon: "🎃", name: "Dynia" },
    { id: "unicorn", icon: "🦄", name: "Jednorożec", unlock: "character_level_50" },
    { id: "dragon", icon: "🐉", name: "Smok", unlock: "character_level_100" },
    { id: "lightning", icon: "⚡", name: "Burza", unlock: "character_level_120" },
    { id: "skull", icon: "💀", name: "Czaszka", unlock: "boss_slayer_50" },
    { id: "crown", icon: "👑", name: "Korona", unlock: "boss_slayer_200" },
    { id: "key", icon: "🗝️", name: "Klucznik", unlock: "dungeon_first" },
    { id: "castle", icon: "🏰", name: "Zdobywca lochów", unlock: "dungeon_master" },
    { id: "anvil", icon: "⚒️", name: "Kowal", unlock: "crafting_master" },
    { id: "book", icon: "📚", name: "Uczony", unlock: "complete_bestiary" },
    { id: "globe", icon: "🌍", name: "Podróżnik", unlock: "location_master" },
    { id: "gem", icon: "💎", name: "Miliarder", unlock: "character_gold_1000000000" }
]);

function getAvatarDefinition(id) {
    return AVATARS.find((avatar) => avatar.id === id) || null;
}

/* Ikona avatara po id; nieznane id (np. z serwera) = domyślny avatar. */
function getAvatarIcon(id) {
    const avatar = getAvatarDefinition(id) || getAvatarDefinition(DEFAULT_AVATAR_ID);
    return avatar.icon;
}

function isAvatarUnlocked(avatar) {
    if (!avatar.unlock) {
        return true;
    }
    return Boolean(player.journal?.unlockedAchievements?.[avatar.unlock]);
}

function getAvatarUnlockHint(avatar) {
    if (!avatar.unlock) {
        return "";
    }
    let name = "";
    if (typeof getJournalAchievementDefinitions === "function") {
        try {
            const found = getJournalAchievementDefinitions().find((item) => item.id === avatar.unlock);
            name = found ? found.name : "";
        } catch (error) {
            name = "";
        }
    }
    return "Osiągnięcie: " + (name || avatar.unlock);
}

function getPlayerAvatarId() {
    const avatar = getAvatarDefinition(player.avatarId);
    return avatar && isAvatarUnlocked(avatar) ? avatar.id : DEFAULT_AVATAR_ID;
}

function renderPlayerAvatar() {
    const icon = getAvatarIcon(getPlayerAvatarId());
    document.querySelectorAll(".side-hero-avatar").forEach((element) => {
        if (element.textContent.trim() !== icon) {
            element.textContent = icon;
        }
        element.classList.add("avatar-changeable");
        element.setAttribute("role", "button");
        element.setAttribute("tabindex", "0");
        element.setAttribute("title", "Zmień avatar");
    });
}

function selectAvatar(id) {
    const avatar = getAvatarDefinition(id);
    if (!avatar || !isAvatarUnlocked(avatar)) {
        return false;
    }
    player.avatarId = avatar.id;
    if (typeof saveGame === "function") {
        saveGame();
    }
    renderPlayerAvatar();
    syncAvatarOnline(true);
    return true;
}

/* Wysyła avatar do konta online (ranking, profil, czat). Błędy są ciche. */
let lastSyncedAvatar = null;
let lastSyncedUser = null;

async function syncAvatarOnline(force) {
    try {
        const accounts = window.IdlerAccounts;
        const state = accounts?.getState?.();
        const client = accounts?.getClient?.();
        if (!client || state?.status !== "signedIn" || !state.user) {
            return;
        }
        const avatarId = getPlayerAvatarId();
        if (!force && lastSyncedUser === state.user.id && lastSyncedAvatar === avatarId) {
            return;
        }
        lastSyncedUser = state.user.id;
        lastSyncedAvatar = avatarId;
        const result = await client.rpc("idler_set_avatar", { p_avatar: avatarId });
        if (result?.error) {
            lastSyncedAvatar = null;
        }
    } catch (error) {
        lastSyncedAvatar = null;
    }
}

function closeAvatarPicker() {
    document.querySelectorAll(".avatar-picker-overlay").forEach((node) => node.remove());
}

function openAvatarPicker() {
    closeAvatarPicker();

    const overlay = document.createElement("div");
    overlay.className = "game-dialog-overlay avatar-picker-overlay";

    const dialog = document.createElement("section");
    dialog.className = "game-dialog avatar-picker";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Wybór avatara");

    const title = document.createElement("h2");
    title.className = "game-dialog-title";
    title.textContent = "Wybierz avatar";
    dialog.appendChild(title);

    const current = getPlayerAvatarId();
    const grid = document.createElement("div");
    grid.className = "avatar-grid";

    AVATARS.forEach((avatar) => {
        const unlocked = isAvatarUnlocked(avatar);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "avatar-option";
        button.classList.toggle("selected", avatar.id === current);
        button.classList.toggle("locked", !unlocked);
        button.setAttribute("aria-pressed", avatar.id === current ? "true" : "false");
        button.title = unlocked ? avatar.name : getAvatarUnlockHint(avatar);

        const icon = document.createElement("span");
        icon.className = "avatar-option-icon";
        icon.textContent = unlocked ? avatar.icon : "🔒";
        const label = document.createElement("span");
        label.className = "avatar-option-name";
        label.textContent = avatar.name;
        button.appendChild(icon);
        button.appendChild(label);

        if (!unlocked) {
            const hint = document.createElement("span");
            hint.className = "avatar-option-hint";
            hint.textContent = getAvatarUnlockHint(avatar);
            button.appendChild(hint);
            button.setAttribute("aria-disabled", "true");
        }

        button.addEventListener("click", () => {
            if (!unlocked) {
                return;
            }
            if (selectAvatar(avatar.id)) {
                closeAvatarPicker();
            }
        });
        grid.appendChild(button);
    });

    dialog.appendChild(grid);

    const actions = document.createElement("div");
    actions.className = "game-dialog-actions";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "game-dialog-cancel";
    close.textContent = "Zamknij";
    close.addEventListener("click", closeAvatarPicker);
    actions.appendChild(close);
    dialog.appendChild(actions);

    overlay.appendChild(dialog);
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeAvatarPicker();
        }
    });
    document.body.appendChild(overlay);
    close.focus();
}

document.addEventListener("click", (event) => {
    if (event.target.closest?.(".side-hero-avatar, .mobile-topbar-avatar")) {
        openAvatarPicker();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.querySelector(".avatar-picker-overlay")) {
        closeAvatarPicker();
    } else if (
        (event.key === "Enter" || event.key === " ") &&
        event.target.classList?.contains("side-hero-avatar")
    ) {
        event.preventDefault();
        openAvatarPicker();
    }
});

window.IdlerAvatars = { AVATARS, syncAvatarOnline, getAvatarIcon, getPlayerAvatarId, openAvatarPicker, selectAvatar };

setInterval(() => {
    renderPlayerAvatar();
    syncAvatarOnline(false);
}, 2000);
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderPlayerAvatar);
} else {
    renderPlayerAvatar();
}
