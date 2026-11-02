/*
 * Kara za zbyt długie siedzenie w starej lokacji.
 *
 * Kara zależy od tego, ile poziomów temu odblokowała się następna lokacja
 * (ta, do której bohater powinien już przejść). Przez pierwsze
 * LOCATION_PENALTY_GRACE_LEVELS poziomów nie ma żadnej kary, potem rośnie
 * o 10% za poziom, maksymalnie do -80% złota i EXP.
 * Najnowsza odblokowana lokacja nigdy nie jest karana.
 * Nie dotyczy bossów lokacji ani lochów. Nie zmienia szans na łupy.
 */
const LOCATION_PENALTY_GRACE_LEVELS = 3;
const LOCATION_PENALTY_PER_LEVEL = 0.1;
const LOCATION_PENALTY_MAX = 0.8;

function getNextLocationRequiredLevel(locationId) {
    const location = locations[locationId];
    if (!location) {
        return null;
    }
    const required = location.requiredLevel || 1;
    let next = null;
    Object.values(locations).forEach((other) => {
        const otherRequired = other.requiredLevel || 1;
        if (otherRequired > required && (next === null || otherRequired < next)) {
            next = otherRequired;
        }
    });
    return next;
}

function getLocationRewardPenalty(locationId) {
    const nextRequired = getNextLocationRequiredLevel(locationId);
    if (nextRequired === null || player.level < nextRequired) {
        return 0;
    }
    const levelsSinceUnlock = player.level - nextRequired;
    const steps = levelsSinceUnlock - LOCATION_PENALTY_GRACE_LEVELS + 1;
    if (steps <= 0) {
        return 0;
    }
    return Math.min(LOCATION_PENALTY_MAX, steps * LOCATION_PENALTY_PER_LEVEL);
}

function getLocationRewardMultiplier(locationId) {
    return 1 - getLocationRewardPenalty(locationId);
}
