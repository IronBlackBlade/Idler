const crystalPeaks = {
    id: "crystalPeaks",

    name: "💎 Kryształowe Szczyty",

    description:
        "Wysokogórska kraina pełna lewitujących kryształów, " +
        "pryzmatycznych bestii i pradawnych konstruktów.",

    recommendedLevel: 80,
    requiredLevel: 80,

    boss: {
        id: "heart_of_the_mountain",
        name: "💠 Serce Góry",

        hp: 1800000,
        attack: 980,
        gold: 210000,
        exp: 300000,

        firstKillReward: {
            gold: 275000,
            exp: 400000,

            items: [
                {
                    item: "mountain_heart",
                    quantity: 1
                }
            ]
        },

        loot: [
            {
                item: "prismatic_core",
                chance: 55
            },
            {
                item: "living_crystal",
                chance: 45
            },
            {
                item: "mountain_essence",
                chance: 35
            },
            {
                item: "mountain_heart",
                chance: 18
            }
        ]
    },

    enemies: [
        {
            id: "crystal_beetle",
            name: "Kryształowy żuk",

            hp: 420000,
            attack: 620,
            gold: 70000,
            exp: 98000,

            loot: [
                {
                    item: "crystal_shell",
                    chance: 36
                },
                {
                    item: "shimmering_mandible",
                    chance: 16
                },
                {
                    item: "crystal_gland",
                    chance: 6
                }
            ]
        },

        {
            id: "shardling",
            name: "Odpryskowiec",

            hp: 500000,
            attack: 680,
            gold: 85000,
            exp: 118000,

            loot: [
                {
                    item: "floating_shard",
                    chance: 35
                },
                {
                    item: "unstable_crystal",
                    chance: 15
                },
                {
                    item: "shardling_core",
                    chance: 6
                }
            ]
        },

        {
            id: "geode_breaker",
            name: "Łamacz geod",

            hp: 610000,
            attack: 750,
            gold: 103000,
            exp: 145000,

            loot: [
                {
                    item: "geode_fragment",
                    chance: 34
                },
                {
                    item: "crystalline_sinew",
                    chance: 14
                },
                {
                    item: "geode_heart",
                    chance: 5
                }
            ]
        },

        {
            id: "prismatic_manticore",
            name: "Pryzmatyczny mantykor",

            hp: 740000,
            attack: 830,
            gold: 125000,
            exp: 175000,

            loot: [
                {
                    item: "prismatic_scale",
                    chance: 32
                },
                {
                    item: "crystal_stinger",
                    chance: 13
                },
                {
                    item: "refracted_venom",
                    chance: 5
                }
            ]
        },

        {
            id: "crystal_spire_guardian",
            name: "Strażnik Kryształowej Iglicy",

            hp: 900000,
            attack: 910,
            gold: 152000,
            exp: 215000,

            loot: [
                {
                    item: "spire_armor_fragment",
                    chance: 28
                },
                {
                    item: "living_crystal",
                    chance: 12
                },
                {
                    item: "prismatic_core",
                    chance: 5
                }
            ]
        }
    ]
};