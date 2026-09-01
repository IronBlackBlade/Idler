// Ręcznie utrzymywany balans walki. Zmieniaj tutaj HP i atak potworów.
// HP uwzględnia realne obrażenia podstawowe: broń + 0,8 głównego atrybutu.
// Zwykły potwór ma ginąć w środku docelowego czasu lokacji podstawowym mieczem.
// [id, HP, atak, typ spotkania]
const combatMonsterBalanceRows = [
    // Las: pełny set 20 pancerza; maksymalny hit: około 5 HP.
    ["beetle", 42, 23, "normal"], ["sheep", 49, 24, "normal"], ["rat", 56, 24, "normal"], ["wolf", 63, 25, "normal"], ["goblin", 70, 26, "normal"], ["goblin_chief", 315, 28, "boss"],
    // Jaskinia: pełny set 35 pancerza; maksymalny hit: około 9 HP.
    ["cave_bat", 174, 40, "normal"], ["cave_spider", 203, 41, "normal"], ["skeleton", 232, 42, "normal"], ["kobold", 261, 44, "normal"], ["stone_golem", 290, 45, "normal"], ["kobold_king", 1305, 49, "boss"],
    // Ruiny: pełny set 50 pancerza; maksymalny hit: około 23 HP.
    ["ruins_scarab", 335, 61, "normal"], ["ruin_scavenger", 419, 64, "normal"], ["animated_armor", 503, 67, "normal"], ["ruin_sentinel", 587, 72, "normal"], ["spectral_knight", 671, 75, "normal"], ["ancient_guardian", 2516, 87, "boss"],
    // Lód: pełny set 75 pancerza; maksymalny hit: około 42 HP.
    ["frost_wisp", 760, 95, "normal"], ["ice_wolf", 903, 102, "normal"], ["frozen_warrior", 1045, 108, "normal"], ["frost_giant", 1188, 115, "normal"], ["ice_elemental", 1330, 121, "normal"], ["frost_queen", 4275, 144, "boss"],
    // Wulkan: pełny set 100 pancerza; maksymalny hit: około 63 HP.
    ["ash_scorpion", 1293, 132, "normal"], ["lava_hound", 1535, 141, "normal"], ["charred_skeleton", 1778, 150, "normal"], ["magma_golem", 2020, 160, "normal"], ["fire_elemental", 2262, 171, "normal"], ["volcanic_dragon", 7272, 206, "boss"],
    // Otchłań: pełny set 114 pancerza; maksymalny hit: około 91 HP.
    ["memory_eater", 1418, 160, "normal"], ["dimension_weaver", 1683, 175, "normal"], ["nameless_observer", 1949, 190, "normal"], ["void_herald", 2215, 203, "normal"], ["rift_architect", 2481, 218, "normal"], ["abyss_lord", 7974, 270, "boss"],
    // Zatopione Królestwo: pełny set 128 pancerza; maksymalny hit: około 138 HP.
    ["royal_guard_drowned", 2016, 198, "normal"], ["deep_hunter", 2318, 221, "normal"], ["abyss_mermaid", 2621, 244, "normal"], ["coral_colossus", 2923, 267, "normal"], ["sunken_priest", 3226, 288, "normal"], ["crown_leviathan", 9072, 368, "boss"],
    // Kryształowe Szczyty: pełny set 145 pancerza; maksymalny hit: około 170 HP.
    ["crystal_beetle", 2360, 232, "normal"], ["shardling", 2832, 260, "normal"], ["geode_breaker", 3304, 289, "normal"], ["prismatic_manticore", 3776, 317, "normal"], ["crystal_spire_guardian", 4248, 345, "normal"], ["mountain_heart", 10620, 445, "boss"],
];

window.idlerMonsterBalance = Object.fromEntries(
    combatMonsterBalanceRows.map(([id, hp, attack, encounterType]) => [
        id,
        { hp, attack, encounterType },
    ])
);
