/*
 * Ikony przedmiotów w plecaku. Jeżeli przedmiot ma własną ikonę (pole icon),
 * używamy jej; w przeciwnym razie dobieramy ją po typie lub po nazwie (id).
 */
const ITEM_ICONS_BY_TYPE = Object.freeze({
    shield: "🛡️",
    helmet: "⛑️",
    armor: "🥋",
    pants: "👖",
    boots: "🥾",
    gloves: "🧤",
    ring: "💍",
    amulet: "📿",
    talisman: "🔮",
    potion: "🧪",
    food: "🍲",
    fish: "🐟",
    fishing_treasure: "🪙",
    fishing_bait: "🪱",
    herb: "🌿",
    seed: "🌱",
    recipe: "📜",
    dungeon_key: "🗝️",
    dungeon_reward: "🏆",
    vendor_trash: "🗑️",
    profession_tool: "🛠️",
    processed_material: "🧱",
    crafting_material: "📦"
});

const ITEM_ICONS_BY_WEAPON_CLASS = Object.freeze({
    slashing: "⚔️",
    dagger: "🗡️",
    blunt: "🔨",
    bow: "🏹",
    crossbow: "🎯",
    staff: "🪄",
    wand: "✨"
});

// Kolejność ma znaczenie: pierwsze pasujące słowo wygrywa.
const ITEM_ICON_KEYWORDS = Object.freeze([
    ["ingot", "🧱"],
    ["_ore", "⛏️"],
    ["diamond", "💎"],
    ["amethyst", "💎"],
    ["ruby", "💎"],
    ["sapphire", "💎"],
    ["emerald", "💎"],
    ["gem", "💎"],
    ["crystal", "💎"],
    ["pearl", "🦪"],
    ["coin", "🪙"],
    ["pouch", "👛"],
    ["bone", "🦴"],
    ["fang", "🦷"],
    ["tooth", "🦷"],
    ["claw", "🐾"],
    ["horn", "🐂"],
    ["spike", "📌"],
    ["silk", "🕸️"],
    ["web", "🕸️"],
    ["feather", "🪶"],
    ["quill", "🪶"],
    ["wing", "🪽"],
    ["fur", "🧶"],
    ["wool", "🧶"],
    ["leather", "🟤"],
    ["skin", "🟤"],
    ["hide", "🟤"],
    ["tail", "🐀"],
    ["scale", "🐉"],
    ["shell", "🐚"],
    ["chitin", "🐚"],
    ["coral", "🪸"],
    ["venom", "☠️"],
    ["poison", "☠️"],
    ["essence", "🔮"],
    ["dust", "✨"],
    ["ember", "🔥"],
    ["fire", "🔥"],
    ["flame", "🔥"],
    ["magma", "🌋"],
    ["volcanic", "🌋"],
    ["frost", "❄️"],
    ["ice", "❄️"],
    ["storm", "⚡"],
    ["thunder", "⚡"],
    ["heart", "❤️‍🔥"],
    ["core", "🔘"],
    ["chain", "⛓️"],
    ["rivet", "🔩"],
    ["whetstone", "🪨"],
    ["stone", "🪨"],
    ["rock", "🪨"],
    ["fossil", "🦕"],
    ["blade", "🗡️"],
    ["shield", "🛡️"],
    ["string", "🧵"],
    ["trigger", "⚙️"],
    ["head", "⚙️"],
    ["mint", "🌿"],
    ["leaf", "🍃"],
    ["root", "🌱"],
    ["mushroom", "🍄"],
    ["flower", "🌸"],
    ["berry", "🫐"],
    ["pickaxe", "⛏️"],
    ["crown", "👑"],
    ["scroll", "📜"],
    ["rune", "🔣"],
    ["relic", "🏺"],
    ["emblem", "🎖️"],
    ["medal", "🎖️"],
    ["lens", "🔍"],
    ["pupil", "👁️"],
    ["gland", "🧬"],
    ["membrane", "🧬"],
    ["mandible", "🦷"],
    ["thread", "🧵"],
    ["cloth", "🧵"],
    ["scrap", "🧵"],
    ["matter", "🌑"],
    ["shard", "🧩"],
    ["fragment", "🧩"],
    ["plate", "🔰"],
    ["ring", "💍"]
]);

function getItemIcon(item, itemId) {
    if (!item) {
        return "❔";
    }

    if (item.icon && typeof item.icon === "string" && item.icon.length <= 8) {
        return item.icon;
    }

    if (item.type === "weapon") {
        return ITEM_ICONS_BY_WEAPON_CLASS[item.weaponClass] || "⚔️";
    }

    // Wyposażenie, mikstury, ryby itp. mają jednoznaczną ikonę po typie.
    const materialTypes = ["processed_material", "crafting_material", "vendor_trash"];

    if (ITEM_ICONS_BY_TYPE[item.type] && !materialTypes.includes(item.type)) {
        return ITEM_ICONS_BY_TYPE[item.type];
    }

    const key = String(itemId || item.id || "").toLowerCase();
    const match = ITEM_ICON_KEYWORDS.find(([word]) => key.includes(word));

    if (match) {
        return match[1];
    }

    return ITEM_ICONS_BY_TYPE[item.type] || "📦";
}

function getItemIconHtml(item, itemId) {
    return '<span class="inventory-item-icon" aria-hidden="true">' +
        getItemIcon(item, itemId) +
        "</span>";
}

window.getItemIcon = getItemIcon;
window.getItemIconHtml = getItemIconHtml;
