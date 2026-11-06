/*
 * Nagrody za wiedzę o potworach.
 *
 * Każdy gatunek wroga ma 3 progi (liczba pokonanych): 50, 200 i 500.
 * Postęp wszystkich gatunków lokacji daje jej małą stałą premię do
 * złota i EXP (maksymalnie +3% każdego) przy pełnym bestiariuszu lokacji.
 */
const BESTIARY_TIERS = Object.freeze([50, 200, 500]);
const BESTIARY_MAX_GOLD_BONUS_PERCENT = 3;
const BESTIARY_MAX_EXP_BONUS_PERCENT = 3;
// Globalna premia za każdą w pełni ukończoną lokację (wszystkie gwiazdki).
const BESTIARY_GLOBAL_BONUS_PER_LOCATION_PERCENT = 0.5;

function getEnemyBestiaryKills(enemyId) {
    const entry = player.journal?.bestiary?.[enemyId];
    return Math.max(0, Math.floor(Number(entry?.kills) || 0));
}

function getEnemyBestiaryTier(enemyId) {
    const kills = getEnemyBestiaryKills(enemyId);
    return BESTIARY_TIERS.filter((threshold) => kills >= threshold).length;
}

function getLocationBestiaryProgress(locationId) {
    const location = typeof locations !== "undefined" ? locations[locationId] : null;
    const enemies = location?.enemies || [];
    if (enemies.length === 0) {
        return 0;
    }
    const earned = enemies.reduce((sum, e) => sum + getEnemyBestiaryTier(e.id), 0);
    return earned / (enemies.length * BESTIARY_TIERS.length);
}

function getLocationBestiaryBonuses(locationId = player.location) {
    const progress = getLocationBestiaryProgress(locationId);
    return {
        progress,
        goldBonus: Math.round(progress * BESTIARY_MAX_GOLD_BONUS_PERCENT * 100) / 100,
        experienceBonus: Math.round(progress * BESTIARY_MAX_EXP_BONUS_PERCENT * 100) / 100
    };
}

function getCompletedBestiaryLocationCount() {
    if (typeof locations === "undefined") {
        return 0;
    }
    return Object.keys(locations).filter(
        (id) => getLocationBestiaryProgress(id) >= 1
    ).length;
}

function getGlobalBestiaryBonusPercent() {
    return getCompletedBestiaryLocationCount() * BESTIARY_GLOBAL_BONUS_PER_LOCATION_PERCENT;
}

function getBestiaryRewardMultipliers(locationId = player.location) {
    const bonuses = getLocationBestiaryBonuses(locationId);
    const globalBonus = getGlobalBestiaryBonusPercent();
    return {
        gold: 1 + (bonuses.goldBonus + globalBonus) / 100,
        exp: 1 + (bonuses.experienceBonus + globalBonus) / 100
    };
}

function getGlobalBestiarySummaryHtml() {
    const total = typeof locations !== "undefined" ? Object.keys(locations).length : 0;
    return "<div><span>Ukończone bestiariusze lokacji</span><strong>" +
        getCompletedBestiaryLocationCount() + " / " + total +
        "</strong><span class=\"bestiary-location-bonus\">Globalnie: złoto i EXP +" +
        getGlobalBestiaryBonusPercent() + "%</span></div>";
}

function getEnemyBestiaryTierHtml(enemyId) {
    const kills = getEnemyBestiaryKills(enemyId);
    const tier = getEnemyBestiaryTier(enemyId);
    const next = BESTIARY_TIERS[tier];
    const stars = BESTIARY_TIERS.map((_, i) => (i < tier ? "★" : "☆")).join("");
    return '<div class="bestiary-tier"><span class="bestiary-stars">' + stars + "</span> " +
        (next ? "Następny próg: " + kills + " / " + next : "Wiedza pełna") + "</div>";
}

function getLocationBestiarySummaryHtml(locationId) {
    const bonuses = getLocationBestiaryBonuses(locationId);
    return '<span class="bestiary-location-bonus">Wiedza: ' +
        Math.round(bonuses.progress * 100) + "% · złoto +" + bonuses.goldBonus +
        "%, EXP +" + bonuses.experienceBonus + "%</span>";
}
