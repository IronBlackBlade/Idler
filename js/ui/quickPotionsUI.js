/*
 * Okienko szybkiego picia mikstur w ekranach aktywności.
 * Pokazuje tylko mikstury, które pasują do danej aktywności i które gracz posiada
 * (albo są właśnie aktywne), a kliknięcie od razu je wypija.
 */
const QUICK_POTION_SCREENS = Object.freeze({
    "screen-mining-locations": {
        title: "Mikstury górnicze",
        effects: ["mining_speed"]
    },
    "screen-herbalism-locations": {
        title: "Mikstury zielarskie",
        effects: ["herbalism_speed"]
    },
    "screen-hunting": {
        title: "Mikstury bojowe",
        effects: [
            "instant_healing",
            "hunter_luck",
            "melee_weapon_damage",
            "ranged_weapon_damage",
            "magic_weapon_damage",
            "spell_damage",
            "combat_defense",
            "mana_regeneration"
        ]
    },
    "screen-combat": {
        title: "Mikstury bojowe",
        effects: [
            "instant_healing",
            "hunter_luck",
            "melee_weapon_damage",
            "ranged_weapon_damage",
            "magic_weapon_damage",
            "spell_damage",
            "combat_defense",
            "mana_regeneration"
        ]
    }
});

function formatQuickPotionTime(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return minutes + ":" + String(seconds).padStart(2, "0");
}

function getQuickPotionShortEffect(potion) {
    const value = Number(potion.effectValue) || 0;

    if (potion.potionEffectId === "instant_healing") {
        return "+" + value + "% HP";
    }

    return "+" + value + "%";
}

function getQuickPotionsForScreen(config) {
    const inventory = Array.isArray(player.inventory) ? player.inventory : [];
    const activeEffects = player.activeEffects?.potionEffects || {};
    const now = Date.now();

    return Object.values(items)
        .filter(item =>
            item.type === "potion" &&
            config.effects.includes(item.potionEffectId)
        )
        .map(item => {
            const entry = inventory.find(slot => slot.itemId === item.id);
            const effect = activeEffects[item.potionEffectId];
            const isActive =
                item.potionEffectId !== "instant_healing" &&
                effect &&
                effect.expiresAt > now &&
                effect.itemId === item.id;

            return {
                item,
                quantity: Number(entry?.quantity) || 0,
                remaining: isActive ? effect.expiresAt - now : 0
            };
        })
        .filter(entry => entry.quantity > 0 || entry.remaining > 0)
        .sort((a, b) =>
            (a.item.potionEffectId === b.item.potionEffectId
                ? Number(a.item.effectValue) - Number(b.item.effectValue)
                : String(a.item.potionEffectId).localeCompare(String(b.item.potionEffectId)))
        );
}

function renderQuickPotions(screenId) {
    const section = document.getElementById(screenId);
    const config = QUICK_POTION_SCREENS[screenId];

    if (!section || !config || typeof player === "undefined") {
        return;
    }

    let box = section.querySelector(":scope > .quick-potions");

    if (!box) {
        box = document.createElement("div");
        box.className = "quick-potions";
        section.insertBefore(box, section.firstChild);
    }

    const potions = getQuickPotionsForScreen(config);

    const signature = potions
        .map(entry => [
            entry.item.id,
            entry.quantity,
            entry.remaining > 0 ? formatQuickPotionTime(entry.remaining) : ""
        ].join(":"))
        .join("|");

    if (box.dataset.signature === signature) {
        return;
    }

    box.dataset.signature = signature;

    const chips = potions.length === 0
        ? '<span class="quick-potions-empty">Brak pasujących mikstur w plecaku.</span>'
        : potions.map(entry => {
            const rarity = entry.item.rarity || "common";
            const active = entry.remaining > 0;

            return `
                <button type="button"
                        class="quick-potion rarity-${rarity}${active ? " is-active" : ""}"
                        data-potion-id="${entry.item.id}"
                        ${entry.quantity <= 0 ? "disabled" : ""}
                        title="${entry.item.description}">
                    <span class="quick-potion-icon">🧪</span>
                    <span class="quick-potion-name">${entry.item.name}</span>
                    <span class="quick-potion-effect">${getQuickPotionShortEffect(entry.item)}</span>
                    <span class="quick-potion-qty">×${entry.quantity}</span>
                    ${active
                        ? `<span class="quick-potion-timer">⏱️ ${formatQuickPotionTime(entry.remaining)}</span>`
                        : ""}
                </button>
            `;
        }).join("");

    box.innerHTML = `
        <div class="quick-potions-title">🧪 ${config.title} — szybkie picie</div>
        <div class="quick-potions-list">${chips}</div>
    `;
}

function refreshQuickPotions() {
    Object.keys(QUICK_POTION_SCREENS).forEach(screenId => {
        const section = document.getElementById(screenId);

        // Odświeżamy tylko widoczny ekran.
        if (section && section.offsetParent !== null) {
            renderQuickPotions(screenId);
        }
    });
}

document.addEventListener("click", event => {
    const button = event.target.closest?.(".quick-potion");

    if (!button || button.disabled) {
        return;
    }

    const potionId = button.dataset.potionId;

    if (typeof usePotion === "function") {
        usePotion(potionId);
    }

    refreshQuickPotions();
});

setInterval(refreshQuickPotions, 1000);
