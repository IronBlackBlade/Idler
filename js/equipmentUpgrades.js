/*
 * Ulepszanie sprzętu (+1 … +10).
 *
 * Poziom ulepszenia jest zapisany per przedmiot (player.equipmentUpgrades[itemId]),
 * bo ekwipunek przechowuje ID przedmiotów, a nie osobne egzemplarze.
 * Ulepszenie zwiększa statystyki przedmiotu (atrybuty, pancerz, szansa
 * na krytyk itd., obrażenia broni) o stały procent za poziom.
 * Porażka zabiera koszt, a z szansą 25% obniża poziom o 1 (przedmiot nigdy się nie niszczy).
 */
const EQUIPMENT_UPGRADE_MAX_LEVEL = 10;
const EQUIPMENT_UPGRADE_BONUS_PER_LEVEL = 0.025;
const EQUIPMENT_UPGRADE_GOLD_FACTOR = 2;
// Pancerz odejmuje się od ataku wroga, więc jego bonus z ulepszeń jest słabszy.
const EQUIPMENT_UPGRADE_ARMOR_BONUS_FACTOR = 0.5;
const EQUIPMENT_UPGRADE_DOWNGRADE_CHANCE = 0.25;
const PROTECTION_STONE_ID = "upgrade_protection_stone";

function isProtectionStoneEnabled() {
    return player.equipmentUpgradeSettings?.useProtection !== false;
}

function toggleProtectionStone() {
    if (!player.equipmentUpgradeSettings) {
        player.equipmentUpgradeSettings = {};
    }
    player.equipmentUpgradeSettings.useProtection = !isProtectionStoneEnabled();
    saveGame();
    if (typeof renderForge === "function") {
        renderForge();
    }
}
const EQUIPMENT_UPGRADE_SUCCESS_CHANCE = Object.freeze({
    1: 1, 2: 1, 3: 1, 4: 1, 5: 1,
    6: 0.85, 7: 0.75, 8: 0.65, 9: 0.55, 10: 0.45
});
const EQUIPMENT_UPGRADE_INGOT_BANDS = Object.freeze([
    [1, "copper_ingot"], [10, "tin_ingot"], [20, "iron_ingot"],
    [30, "steel_ingot"], [40, "silver_ingot"], [50, "gold_ingot"],
    [60, "platinum_ingot"], [65, "mithril_ingot"], [72, "adamantite_ingot"],
    [90, "dragonsteel_ingot"]
]);

function getEquipmentUpgradeLevel(itemId) {
    const level = Number(player?.equipmentUpgrades?.[itemId]) || 0;
    return Math.max(0, Math.min(EQUIPMENT_UPGRADE_MAX_LEVEL, Math.floor(level)));
}

function getEquipmentUpgradeMultiplier(itemId) {
    return 1 + getEquipmentUpgradeLevel(itemId) * EQUIPMENT_UPGRADE_BONUS_PER_LEVEL;
}

function getItemStatAtUpgradeLevel(item, value, statKey, level) {
    const base = Number(value) || 0;
    if (!item || base === 0) {
        return base;
    }
    let multiplier = 1 + level * EQUIPMENT_UPGRADE_BONUS_PER_LEVEL;
    if (statKey === "armor") {
        multiplier = 1 + (multiplier - 1) * EQUIPMENT_UPGRADE_ARMOR_BONUS_FACTOR;
    }
    return Math.round(base * multiplier * 10) / 10;
}

function getUpgradedItemStat(item, value, statKey = null) {
    if (!item) {
        return Number(value) || 0;
    }
    return getItemStatAtUpgradeLevel(
        item,
        value,
        statKey,
        getEquipmentUpgradeLevel(item.id)
    );
}

function getEquipmentUpgradeCost(itemId) {
    const item = items[itemId];
    const target = getEquipmentUpgradeLevel(itemId) + 1;
    const requiredLevel = Math.max(1, Number(item?.requiredLevel) || 1);
    let ingotId = EQUIPMENT_UPGRADE_INGOT_BANDS[0][1];
    EQUIPMENT_UPGRADE_INGOT_BANDS.forEach(([minLevel, id]) => {
        if (requiredLevel >= minLevel) {
            ingotId = id;
        }
    });
    return {
        target,
        gold: Math.round(EQUIPMENT_UPGRADE_GOLD_FACTOR * requiredLevel * requiredLevel * target) + 50 * target,
        ingotId,
        ingots: Math.ceil(target / 5),
        chance: EQUIPMENT_UPGRADE_SUCCESS_CHANCE[target] || 0
    };
}

function getInventoryItemQuantity(itemId) {
    const entry = (player.inventory || []).find((e) => e.itemId === itemId);
    return entry ? entry.quantity : 0;
}

function upgradeEquippedItem(slot) {
    upgradeItemById(player.equipment?.[slot]);
}

/*
 * Jedna próba ulepszenia. Zwraca "success", "fail" albo "blocked"
 * (brak złota/materiałów lub maksymalny poziom).
 */
function attemptItemUpgrade(itemId, silent = false) {
    const item = items[itemId];
    if (!item) {
        return "blocked";
    }
    if (getEquipmentUpgradeLevel(itemId) >= EQUIPMENT_UPGRADE_MAX_LEVEL) {
        return "blocked";
    }
    const cost = getEquipmentUpgradeCost(itemId);
    if (player.gold < cost.gold) {
        if (!silent) {
            showNotification("Brakuje złota: potrzebujesz " + cost.gold + " 💰.", "error");
        }
        return "blocked";
    }
    if (getInventoryItemQuantity(cost.ingotId) < cost.ingots) {
        if (!silent) {
            showNotification(
                "Brakuje materiałów: " + items[cost.ingotId].name + " ×" + cost.ingots + ".",
                "error"
            );
        }
        return "blocked";
    }
    player.gold -= cost.gold;
    removeItemFromInventory(cost.ingotId, cost.ingots);
    if (!player.equipmentUpgrades || typeof player.equipmentUpgrades !== "object") {
        player.equipmentUpgrades = {};
    }
    if (Math.random() < cost.chance) {
        player.equipmentUpgrades[itemId] = cost.target;
        showNotification(item.name + " ulepszono do +" + cost.target + "!", "success");
        if (typeof addCombatLog === "function") {
            addCombatLog("🔨 Ulepszono: " + item.name + " +" + cost.target + ".");
        }
        return "success";
    }
    const currentLevel = getEquipmentUpgradeLevel(itemId);
    let downgraded =
        currentLevel > 0 && Math.random() < EQUIPMENT_UPGRADE_DOWNGRADE_CHANCE;
    let protectedByStone = false;
    if (
        downgraded &&
        isProtectionStoneEnabled() &&
        getInventoryItemQuantity(PROTECTION_STONE_ID) > 0
    ) {
        removeItemFromInventory(PROTECTION_STONE_ID, 1);
        downgraded = false;
        protectedByStone = true;
    }
    if (downgraded) {
        player.equipmentUpgrades[itemId] = currentLevel - 1;
    }
    const resultText = downgraded
        ? "Poziom spadł do +" + (currentLevel - 1) + "."
        : protectedByStone
            ? "Kamień ochronny uchronił przed spadkiem poziomu."
            : "Poziom bez zmian.";
    showNotification("Ulepszenie nie powiodło się. " + resultText, "error");
    if (typeof addCombatLog === "function") {
        addCombatLog("💥 Nieudane ulepszenie: " + item.name + ". " + resultText);
    }
    return "fail";
}

function finishEquipmentUpgradeAction() {
    saveGame();
    render();
    if (typeof renderEquipmentSlots === "function") {
        renderEquipmentSlots();
    }
    if (typeof renderForge === "function") {
        renderForge();
    }
}

function upgradeItemById(itemId) {
    if (attemptItemUpgrade(itemId) !== "blocked") {
        finishEquipmentUpgradeAction();
    }
}

/*
 * Ulepsza do wskazanego poziomu; zatrzymuje się po pierwszej porażce
 * albo gdy zabraknie złota lub materiałów.
 */
function upgradeItemToLevel(itemId, targetLevel) {
    let guard = 0;
    while (getEquipmentUpgradeLevel(itemId) < targetLevel && guard++ < 200) {
        const result = attemptItemUpgrade(itemId, true);
        if (result === "blocked") {
            showNotification("Przerwano: brakuje złota lub materiałów.", "error");
            break;
        }
        if (result === "fail") {
            break;
        }
    }
    finishEquipmentUpgradeAction();
}

function getEquipmentUpgradeSlotHtml(slot, itemId) {
    const level = getEquipmentUpgradeLevel(itemId);
    return level > 0
        ? "<span>Ulepszenie: +" + level + " (+" +
        Math.round(level * EQUIPMENT_UPGRADE_BONUS_PER_LEVEL * 1000) / 10 + "%)</span>"
        : "";
}
