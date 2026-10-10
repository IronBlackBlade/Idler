/*
 * Ikony ryb i skarbów z łowienia.
 * Uzupełnia items[...] o pole icon (tylko tam, gdzie go brak),
 * dzięki czemu ikony pokazują się w łowiskach i wszędzie, gdzie gra używa item.icon.
 */
const FISH_ICONS = {
    small_carp: "🐟",
    river_perch: "🐟",
    silver_roach: "🐟",
    golden_trout: "🐠",
    blind_cavefish: "🐟",
    stone_eel: "🐍",
    shadow_tench: "🐟",
    crystal_fish: "💎",
    ruins_bream: "🐟",
    azure_tuna: "🐟",
    ancient_eel: "🐍",
    royal_lionfish: "🐠",
    frost_cod: "🐟",
    ice_pike: "🐟",
    snow_salmon: "🐟",
    crystal_sturgeon: "🐟",
    emberfish: "🔥",
    lava_eel: "🐍",
    magma_ray: "🐠",
    phoenix_koi: "🐠",
    freshwater_pearl: "🦪",
    sunken_lockbox: "📦",
    coral_relic: "🪸",
    frostbound_chest: "🧊",
    volcanic_cache: "🌋"
};

Object.keys(FISH_ICONS).forEach(itemId => {
    if (typeof items !== "undefined" && items[itemId] && !items[itemId].icon) {
        items[itemId].icon = FISH_ICONS[itemId];
    }
});
