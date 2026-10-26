// Ręcznie utrzymywany balans walki. Zmieniaj tutaj HP i atak potworów.
// HP uwzględnia realne obrażenia podstawowe: broń + 0,8 głównego atrybutu.
// Zwykły potwór ma ginąć w środku docelowego czasu lokacji podstawowym mieczem.
// [id, HP, atak, typ spotkania]
const combatMonsterBalanceRows = [
    // Las: pełny set 20 pancerza; maksymalny hit: około 5 HP.
    ["beetle", 42, 23, "normal"], ["sheep", 49, 24, "normal"], ["rat", 56, 24, "normal"], ["wolf", 63, 25, "normal"], ["goblin", 70, 26, "normal"], ["goblin_chief", 315, 28, "boss"],
    // Jaskinia: pełny set 35 pancerza; maksymalny hit: około 9 HP.
    ["bat", 174, 40, "normal"], ["cave_spider", 203, 41, "normal"], ["skeleton", 232, 42, "normal"], ["kobold", 261, 44, "normal"], ["stone_golem", 290, 45, "normal"], ["kobold_king", 1305, 49, "boss"],
    // Ruiny: pełny set 50 pancerza; maksymalny hit: około 23 HP.
    ["ruins_scarab", 335, 61, "normal"], ["ruin_scavenger", 419, 64, "normal"], ["animated_armor", 503, 67, "normal"], ["ruin_sentinel", 587, 72, "normal"], ["spectral_knight", 671, 75, "normal"], ["ancient_guardian", 2516, 87, "boss"],
    // Lód (poz. 30): pełny set 67 pancerza; maksymalny hit: około 34 HP.
    ["frost_wisp", 604, 84, "normal"], ["ice_wolf", 728, 89, "normal"], ["frozen_warrior", 852, 94, "normal"], ["frost_giant", 976, 101, "normal"], ["ice_elemental", 1100, 105, "normal"], ["frost_queen", 3718, 124, "boss"],
    // Wulkan (poz. 45): pełny set 92 pancerza; maksymalny hit: około 56 HP.
    ["ash_scorpion", 1102, 120, "normal"], ["lava_hound", 1309, 128, "normal"], ["charred_skeleton", 1516, 136, "normal"], ["magma_golem", 1722, 145, "normal"], ["fire_elemental", 1928, 154, "normal"], ["volcanic_dragon", 6199, 185, "boss"],
    // Otchłań (poz. 65): pełny set 121 pancerza; maksymalny hit: około 118 HP.
    ["memory_devourer", 1704, 178, "normal"], ["dimension_weaver", 1988, 197, "normal"], ["nameless_observer", 2273, 216, "normal"], ["void_herald", 2557, 234, "normal"], ["rift_architect", 2841, 252, "normal"], ["abyss_lord", 8528, 317, "boss"],
    // Zatopione Królestwo (poz. 80): pełny set 142 pancerza; maksymalny hit: około 182 HP.
    ["drowned_royal_guard", 2360, 232, "normal"], ["deep_hunter", 2832, 260, "normal"], ["abyss_siren", 3304, 289, "normal"], ["coral_colossus", 3776, 317, "normal"], ["sunken_throne_priest", 4248, 345, "normal"], ["crown_leviathan", 10620, 445, "boss"],
    // Kryształowe Szczyty (poz. 100): pełny set 170 pancerza; maksymalny hit: około 296 HP.
    ["crystal_beetle", 3300, 316, "normal"], ["shardling", 3957, 362, "normal"], ["geode_breaker", 4612, 411, "normal"], ["prismatic_manticore", 5269, 457, "normal"], ["crystal_spire_guardian", 5926, 501, "normal"], ["heart_of_the_mountain", 12629, 664, "boss"],
];

window.idlerMonsterBalance = Object.fromEntries(
    combatMonsterBalanceRows.map(([id, hp, attack, encounterType]) => [
        id,
        { hp, attack, encounterType },
    ])
);
