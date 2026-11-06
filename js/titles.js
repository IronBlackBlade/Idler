/*
 * Osiągnięcia „Świat" i tytuły (wyłącznie kosmetyczne).
 *
 * - Licznik statystyk nowych systemów: player.worldStats.
 * - Nowe osiągnięcia dopisywane do listy z achievements.js.
 * - Tytuły odblokowują się z osiągnięciami; gracz wybiera jeden do wyświetlenia
 *   pod imieniem bohatera. Tytuły nie dają żadnych premii.
 */
const WORLD_STAT_DEFAULTS = Object.freeze({
    dailyClaimed: 0,
    weeklyClaimed: 0,
    bestStreak: 0,
    forgeAttempts: 0,
    forgeSuccesses: 0,
    stonesUsed: 0,
    merchantPurchases: 0
});

function getWorldStats() {
    if (!player.worldStats || typeof player.worldStats !== "object") {
        player.worldStats = {};
    }
    Object.keys(WORLD_STAT_DEFAULTS).forEach((key) => {
        player.worldStats[key] = Math.max(0, Math.floor(Number(player.worldStats[key]) || 0));
    });
    return player.worldStats;
}

function recordWorldStat(key, amount = 1) {
    const stats = getWorldStats();
    stats[key] = (stats[key] || 0) + amount;
}

function recordWorldStatMax(key, value) {
    const stats = getWorldStats();
    stats[key] = Math.max(stats[key] || 0, Math.floor(Number(value) || 0));
}

function getHighestEquipmentUpgradeLevel() {
    return Object.values(player.equipmentUpgrades || {}).reduce(
        (max, level) => Math.max(max, Number(level) || 0),
        0
    );
}

/* Tytuły przypisane do osiągnięć (także istniejących). */
const ACHIEVEMENT_TITLES = Object.freeze({
    boss_nightmare: "Pogromca bossów",
    complete_bestiary: "Badacz potworów",
    location_master: "Znawca lokacji",
    world_master: "Mistrz świata",
    character_level_50: "Weteran",
    character_level_100: "Legenda",
    world_daily_streak_7: "Wytrwały",
    world_daily_total_50: "Zleceniobiorca",
    world_weekly_total_10: "Pewny wykonawca",
    world_forge_item_5: "Kowal",
    world_forge_item_10: "Mistrz kuźni",
    world_merchant_25: "Stały klient",
    world_bestiary_location_1: "Znawca potworów",
    world_bestiary_all: "Wszechwiedzący"
});

function getWorldAchievementDefinitions() {
    const stats = getWorldStats();
    const completedBestiaries =
        typeof getCompletedBestiaryLocationCount === "function"
            ? getCompletedBestiaryLocationCount()
            : 0;
    const totalLocations = typeof locations !== "undefined" ? Object.keys(locations).length : 8;
    const make = (id, points, icon, name, description, progress, target) => ({
        id, category: "world", points, icon, name, description, progress, target
    });
    return [
        make("world_daily_first", 5, "📅", "Pierwsze zlecenie", "Odbierz nagrodę za zlecenie dzienne.", stats.dailyClaimed, 1),
        make("world_daily_streak_7", 15, "🔥", "Siedem dni z rzędu", "Osiągnij serię 7 dni ukończonych zleceń dziennych.", stats.bestStreak, 7),
        make("world_daily_total_50", 20, "📜", "Zleceniobiorca", "Odbierz 50 zleceń dziennych.", stats.dailyClaimed, 50),
        make("world_weekly_total_10", 15, "🗓️", "Tygodniowy wykonawca", "Odbierz 10 zleceń tygodniowych.", stats.weeklyClaimed, 10),
        make("world_forge_first", 5, "🔨", "Pierwsze uderzenie", "Ulepsz przedmiot w Kuźni.", stats.forgeSuccesses, 1),
        make("world_forge_item_5", 10, "⚒️", "Rozgrzane żelazo", "Ulepsz przedmiot do poziomu +5.", getHighestEquipmentUpgradeLevel(), 5),
        make("world_forge_item_10", 25, "🌟", "Dzieło mistrza", "Ulepsz przedmiot do poziomu +10.", getHighestEquipmentUpgradeLevel(), 10),
        make("world_stone_used", 5, "💎", "Pod ochroną", "Zużyj kamień ochronny, który uchronił przedmiot przed spadkiem.", stats.stonesUsed, 1),
        make("world_merchant_first", 5, "🧳", "Wędrowny klient", "Kup coś od Wędrownego kupca.", stats.merchantPurchases, 1),
        make("world_merchant_25", 15, "🛍️", "Stały klient", "Dokonaj 25 zakupów u Wędrownego kupca.", stats.merchantPurchases, 25),
        make("world_bestiary_location_1", 15, "📖", "Znawca potworów", "Ukończ bestiariusz jednej lokacji (wszystkie gwiazdki).", completedBestiaries, 1),
        make("world_bestiary_all", 40, "📚", "Wszechwiedzący", "Ukończ bestiariusze wszystkich lokacji.", completedBestiaries, Math.max(1, totalLocations))
    ];
}

/* Rozszerzenie listy osiągnięć o kategorię „Świat". */
if (typeof getJournalAchievementDefinitions === "function") {
    const baseGetJournalAchievementDefinitions = getJournalAchievementDefinitions;
    getJournalAchievementDefinitions = function () {
        return baseGetJournalAchievementDefinitions().concat(getWorldAchievementDefinitions());
    };
}

function isTitleUnlocked(achievementId) {
    return Boolean(player.journal?.unlockedAchievements?.[achievementId]);
}

function getUnlockedTitles() {
    return Object.entries(ACHIEVEMENT_TITLES)
        .filter(([id]) => isTitleUnlocked(id))
        .map(([id, title]) => ({ id, title }));
}

function getSelectedTitle() {
    const id = player.selectedTitleId;
    if (id && ACHIEVEMENT_TITLES[id] && isTitleUnlocked(id)) {
        return ACHIEVEMENT_TITLES[id];
    }
    return "";
}

function selectTitle(achievementId) {
    if (achievementId && !(ACHIEVEMENT_TITLES[achievementId] && isTitleUnlocked(achievementId))) {
        return;
    }
    player.selectedTitleId = achievementId || null;
    if (typeof saveGame === "function") {
        saveGame();
    }
    renderPlayerTitle();
    if (typeof renderJournalAchievements === "function") {
        renderJournalAchievements();
    }
}

function renderPlayerTitle() {
    const element = document.getElementById("side-hero-player-title");
    if (!element) {
        return;
    }
    const title = getSelectedTitle();
    element.textContent = title ? "« " + title + " »" : "";
    element.hidden = !title;
}

function getAchievementTitleHtml(achievement, unlocked) {
    const title = ACHIEVEMENT_TITLES[achievement.id];
    if (!title) {
        return "";
    }
    if (!unlocked) {
        return '<div class="achievement-title">🎖️ Tytuł: ' + title + "</div>";
    }
    const selected = player.selectedTitleId === achievement.id;
    return '<div class="achievement-title">🎖️ Tytuł: ' + title +
        ' <button type="button" class="achievement-title-button" onclick="selectTitle(' +
        (selected ? "null" : "'" + achievement.id + "'") + ')">' +
        (selected ? "Zdejmij" : "Ustaw") + "</button></div>";
}

setInterval(renderPlayerTitle, 3000);
