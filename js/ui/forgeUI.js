/*
 * Kuźnia – ekran ulepszania sprzętu (+1 … +10).
 * Pokazuje przedmioty założone i z plecaka, podgląd statystyk przed/po,
 * szansę, koszt i ustawienie kamienia ochronnego.
 */
const FORGE_SLOT_TYPES = ["weapon", "shield", "helmet", "armor", "pants", "boots", "gloves", "ring", "amulet", "talisman"];
const FORGE_SLOT_LABELS = {
    all: "Wszystko", weapon: "⚔️ Broń", shield: "🛡️ Tarcza", helmet: "⛑️ Hełm",
    armor: "🥋 Pancerz", pants: "👖 Spodnie", boots: "🥾 Buty", gloves: "🧤 Rękawice",
    ring: "💍 Pierścień", amulet: "📿 Amulet", talisman: "🔮 Talizman"
};
const FORGE_STAT_LABELS = [
    ["damage", "Obrażenia"], ["attack", "Atak"], ["armor", "Pancerz"], ["strength", "Siła"],
    ["dexterity", "Zręczność"], ["intelligence", "Inteligencja"], ["endurance", "Wytrzymałość"],
    ["luck", "Szczęście"], ["critChance", "Szansa na krytyk"], ["critDamage", "Obrażenia krytyczne"],
    ["dodgeChance", "Szansa na unik"], ["lootBonus", "Bonus do łupu"]
];

let forgeSelectedItemId = null;
let forgeSlotFilter = "all";

function getForgeItemIds() {
    const ids = new Set();
    Object.values(player.equipment || {}).forEach((id) => id && ids.add(id));
    (player.inventory || []).forEach((entry) => {
        if (entry.quantity > 0) {
            ids.add(entry.itemId);
        }
    });
    return [...ids]
        .filter((id) => items[id] && FORGE_SLOT_TYPES.includes(items[id].type))
        .sort((a, b) => {
            const diff = (items[b].requiredLevel || 1) - (items[a].requiredLevel || 1);
            return diff !== 0 ? diff : items[a].name.localeCompare(items[b].name, "pl");
        });
}

function setForgeFilter(filter) {
    forgeSlotFilter = filter;
    forgeSelectedItemId = null;
    renderForge();
}

function selectForgeItem(itemId) {
    forgeSelectedItemId = itemId;
    renderForge();
}

function formatForgeNumber(value) {
    return Number(value).toLocaleString("pl-PL");
}

function getForgeStatRowsHtml(item) {
    const level = getEquipmentUpgradeLevel(item.id);
    const maxed = level >= EQUIPMENT_UPGRADE_MAX_LEVEL;
    const next = Math.min(EQUIPMENT_UPGRADE_MAX_LEVEL, level + 1);
    return FORGE_STAT_LABELS.filter(([key]) => item[key])
        .map(([key, label]) => {
            const now = getItemStatAtUpgradeLevel(item, item[key], key, level);
            const after = getItemStatAtUpgradeLevel(item, item[key], key, next);
            const diff = Math.round((after - now) * 10) / 10;
            return '<div class="forge-stat-row"><span class="forge-stat-name">' + label +
                '</span><span class="forge-stat-now">' + now + "</span>" +
                (maxed
                    ? '<span class="forge-stat-after">max</span>'
                    : '<span class="forge-stat-after">' + after +
                    (diff > 0 ? ' <em>+' + diff + "</em>" : "") + "</span>") +
                "</div>";
        }).join("");
}

function getForgeLevelTrackHtml(level) {
    let html = '<div class="forge-track">';
    for (let i = 1; i <= EQUIPMENT_UPGRADE_MAX_LEVEL; i++) {
        const state = i <= level ? "done" : i === level + 1 ? "next" : "";
        html += '<span class="forge-pip ' + state + '">+' + i + "</span>";
    }
    return html + "</div>";
}

function getForgeCostTile(label, value, ok, detail) {
    return '<div class="forge-tile ' + (ok ? "ok" : "bad") + '">' +
        '<div class="forge-tile-label">' + label + "</div>" +
        '<div class="forge-tile-value">' + value + "</div>" +
        '<div class="forge-tile-detail">' + detail + "</div></div>";
}

function renderForge() {
    const container = document.getElementById("forge-content");
    if (!container) {
        return;
    }
    const allIds = getForgeItemIds();
    const ids = allIds.filter(
        (id) => forgeSlotFilter === "all" || items[id].type === forgeSlotFilter
    );
    if (!forgeSelectedItemId || !ids.includes(forgeSelectedItemId)) {
        forgeSelectedItemId = ids[0] || null;
    }
    const equippedIds = Object.values(player.equipment || {});
    const filters = '<select class="forge-filter-select" onchange="setForgeFilter(this.value)">' +
        Object.entries(FORGE_SLOT_LABELS).map(([id, label]) =>
            '<option value="' + id + '"' + (id === forgeSlotFilter ? " selected" : "") + ">" +
            label + "</option>"
        ).join("") + "</select>";

    const list = ids.map((id) => {
        const item = items[id];
        const level = getEquipmentUpgradeLevel(id);
        return '<button class="forge-item' + (id === forgeSelectedItemId ? " selected" : "") +
            '" data-rarity="' + (item.rarity || "common") + '" onclick="selectForgeItem(\'' + id + '\')">' +
            '<span class="forge-item-name">' + item.name + "</span>" +
            '<span class="forge-item-badge' + (level > 0 ? " has-level" : "") + '">+' + level + "</span>" +
            '<span class="forge-item-meta">Poz. ' + (item.requiredLevel || 1) +
            (equippedIds.includes(id) ? " · 🧍 założony" : "") + "</span></button>";
    }).join("") || '<p class="forge-empty">Brak przedmiotów w tej kategorii.</p>';

    let detail = '<p class="forge-empty">Wybierz przedmiot z listy po lewej.</p>';
    const item = ids.includes(forgeSelectedItemId) ? items[forgeSelectedItemId] : null;
    if (item) {
        const level = getEquipmentUpgradeLevel(item.id);
        const maxed = level >= EQUIPMENT_UPGRADE_MAX_LEVEL;
        const cost = getEquipmentUpgradeCost(item.id);
        const have = getInventoryItemQuantity(cost.ingotId);
        const stones = getInventoryItemQuantity(PROTECTION_STONE_ID);
        const goldOk = player.gold >= cost.gold;
        const ingotOk = have >= cost.ingots;
        const canUpgrade = goldOk && ingotOk;
        const safeId = item.id.replace(/'/g, "");
        const chancePercent = Math.round(cost.chance * 100);
        const risk = cost.chance >= 1
            ? "Sukces gwarantowany."
            : level > 0
                ? "Porażka: koszt przepada, 25% szans na spadek o 1 poziom" +
                (isProtectionStoneEnabled() && stones > 0 ? " (kamień ochronny to zablokuje)." : ".")
                : "Porażka: koszt przepada, poziom bez zmian.";

        detail =
            '<div class="forge-head" data-rarity="' + (item.rarity || "common") + '">' +
            "<h3>" + item.name + "</h3>" +
            '<span class="forge-head-meta">Poz. ' + (item.requiredLevel || 1) + " · " +
            getRarityName(item.rarity) + (equippedIds.includes(item.id) ? " · założony" : "") +
            "</span></div>" +
            '<div class="forge-section-title">Poziom ulepszenia</div>' +
            getForgeLevelTrackHtml(level) +
            '<div class="forge-section-title">Statystyki</div>' +
            '<div class="forge-stat-row forge-stat-header"><span class="forge-stat-name"></span>' +
            '<span class="forge-stat-now">Teraz</span><span class="forge-stat-after">' +
            (maxed ? "" : "Po +" + cost.target) + "</span></div>" +
            getForgeStatRowsHtml(item) +
            (maxed
                ? '<div class="forge-maxed">✅ Maksymalny poziom ulepszenia</div>'
                : '<div class="forge-section-title">Ulepszenie do +' + cost.target + "</div>" +
                '<div class="forge-tiles">' +
                '<div class="forge-tile chance"><div class="forge-tile-label">Szansa</div>' +
                '<div class="forge-tile-value">' + chancePercent + "%</div>" +
                '<div class="forge-tile-detail">sukcesu</div></div>' +
                getForgeCostTile("Złoto", "💰 " + formatForgeNumber(cost.gold), goldOk,
                    "masz " + formatForgeNumber(Math.floor(player.gold))) +
                getForgeCostTile("Materiał", items[cost.ingotId].name + " ×" + cost.ingots, ingotOk,
                    "masz " + have) +
                "</div>" +
                '<p class="forge-risk">' + risk + "</p>" +
                '<div class="forge-actions">' +
                '<button class="forge-primary" ' + (canUpgrade ? "" : "disabled ") +
                "onclick=\"upgradeItemById('" + safeId + "')\">🔨 Ulepsz do +" + cost.target + "</button>" +
                '<button ' + (canUpgrade ? "" : "disabled ") +
                "onclick=\"upgradeItemToLevel('" + safeId + "'," + EQUIPMENT_UPGRADE_MAX_LEVEL +
                ')">⏫ Do +' + EQUIPMENT_UPGRADE_MAX_LEVEL + " (do pierwszej porażki)</button>" +
                "</div>" +
                (canUpgrade ? "" : '<p class="forge-hint">Brakuje ' +
                    [!goldOk ? "złota" : "", !ingotOk ? "materiałów" : ""].filter(Boolean).join(" i ") + ".</p>")) +
            '<label class="forge-stone"><input type="checkbox" ' +
            (isProtectionStoneEnabled() ? "checked " : "") + 'onchange="toggleProtectionStone()"> ' +
            "💎 Używaj kamienia ochronnego <span>(masz " + stones + ")</span></label>";
    }

    container.innerHTML =
        '<div class="forge-layout"><div class="forge-sidebar">' + filters +
        '<div class="forge-list">' + list + "</div></div>" +
        '<div class="forge-detail">' + detail + "</div></div>";
}
