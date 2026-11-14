const forgottenDepths = {
    id: "forgottenDepths",

    name: "🕳️ Zapomniane Głębie",

    description:
        "Podziemne miasto pradawnych krasnoludów, zalane żarem magmowych kuźni, " +
        "pełne zardzewiałych golemów, widm górników i pradawnych automatów.",

    recommendedLevel: 110,
    chestGoldMultiplier: 3150,
    requiredLevel: 110,

    boss: {
        id: "forge_titan",
        name: "⚒️ Tytan Kuźni",

        hp: 46000,
        attack: 296,
        gold: 315000,
        exp: 140000,

        firstKillReward: {
            gold: 410000,
            exp: 187000,

            items: [
                {
                    item: "forge_titan_heart",
                    quantity: 1
                }
            ]
        },

        loot: [
            {
                item: "titan_forged_plating",
                chance: 55
            },
            {
                item: "forge_essence",
                chance: 40
            },
            {
                item: "forge_titan_heart",
                chance: 18
            }
        ]
    },

    enemies: [
        {
            id: "cave_crawler",
            name: "Jaskiniowy pełzacz",

            hp: 1950,
            attack: 198,
            gold: 105000,
            exp: 46000,

            loot: [
                {
                    item: "deep_chitin_plate",
                    chance: 36
                },
                {
                    item: "blind_pincer",
                    chance: 16
                },
                {
                    item: "pale_gland",
                    chance: 6
                }
            ]
        },

        {
            id: "rust_golem",
            name: "Zardzewiały golem",

            hp: 2200,
            attack: 215,
            gold: 128000,
            exp: 56500,

            loot: [
                {
                    item: "rusted_gear",
                    chance: 35
                },
                {
                    item: "golem_slag_core",
                    chance: 15
                },
                {
                    item: "runed_plate",
                    chance: 6
                }
            ]
        },

        {
            id: "deep_wraith",
            name: "Widmo głębin",

            hp: 2480,
            attack: 232,
            gold: 155000,
            exp: 68000,

            loot: [
                {
                    item: "wraith_dust",
                    chance: 34
                },
                {
                    item: "cursed_pickaxe_head",
                    chance: 14
                },
                {
                    item: "ghostlight_lantern",
                    chance: 5
                }
            ]
        },

        {
            id: "dwarven_automaton",
            name: "Krasnoludzki automat",

            hp: 2860,
            attack: 250,
            gold: 188000,
            exp: 82500,

            loot: [
                {
                    item: "clockwork_spring",
                    chance: 32
                },
                {
                    item: "dwarven_alloy",
                    chance: 13
                },
                {
                    item: "automaton_heart",
                    chance: 5
                }
            ]
        },

        {
            id: "magma_forgemaster",
            name: "Mistrz magmowej kuźni",

            hp: 3250,
            attack: 268,
            gold: 228000,
            exp: 101000,

            loot: [
                {
                    item: "forge_ember",
                    chance: 28
                },
                {
                    item: "magma_anvil_shard",
                    chance: 12
                },
                {
                    item: "forgemaster_tongs",
                    chance: 5
                }
            ]
        }
    ]
};
