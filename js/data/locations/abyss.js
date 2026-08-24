const abyss = {
    id: "abyss",
    name: "🌌 Rubieże Otchłani",
    description:
        "Niestabilna kraina rozdarć wymiarowych, utraconych wspomnień i istot zrodzonych poza znanym światem.",
    recommendedLevel: 60,
    requiredLevel: 60,
    boss: {
        id: "abyss_lord",
        name: "👑 Władca Otchłani",
        hp: 180000,
        attack: 360,
        gold: 15500,
        exp: 22500,
        firstKillReward: {
            gold: 22000,
            exp: 32000,
            items: [
                {
                    item: "heart_of_the_abyss",
                    quantity: 1
                }
            ]
        },
        loot: [
            {
                item: "dark_matter",
                chance: 55
            },
            {
                item: "rift_core",
                chance: 45
            },
            {
                item: "chaos_essence",
                chance: 35
            },
            {
                item: "heart_of_the_abyss",
                chance: 18
            }
        ]
    },
    enemies: [
        {
            id: "memory_devourer",
            name: "Pożeracz wspomnień",
            hp: 25000,
            attack: 215,
            gold: 5200,
            exp: 7200,
            loot: [
                {
                    item: "memory_fragment",
                    chance: 36
                },
                {
                    item: "crystallized_thought",
                    chance: 16
                },
                {
                    item: "cerebral_membrane",
                    chance: 6
                }
            ]
        },
        {
            id: "dimension_weaver",
            name: "Tkacz wymiarów",
            hp: 31500,
            attack: 235,
            gold: 6500,
            exp: 9000,
            loot: [
                {
                    item: "dimensional_thread",
                    chance: 35
                },
                {
                    item: "weaver_armor_shard",
                    chance: 15
                },
                {
                    item: "spatial_gland",
                    chance: 6
                }
            ]
        },
        {
            id: "nameless_observer",
            name: "Bezimienny obserwator",
            hp: 38000,
            attack: 255,
            gold: 7900,
            exp: 11000,
            loot: [
                {
                    item: "observer_lens",
                    chance: 34
                },
                {
                    item: "astral_pupil",
                    chance: 14
                },
                {
                    item: "focus_ring",
                    chance: 5
                }
            ]
        },
        {
            id: "void_herald",
            name: "Herold Pustki",
            hp: 46500,
            attack: 278,
            gold: 9600,
            exp: 13400,
            loot: [
                {
                    item: "void_armor_fragment",
                    chance: 32
                },
                {
                    item: "dark_matter",
                    chance: 13
                },
                {
                    item: "herald_blade",
                    chance: 5
                }
            ]
        },
        {
            id: "rift_architect",
            name: "Architekt Rozdarcia",
            hp: 56000,
            attack: 305,
            gold: 11800,
            exp: 16600,
            loot: [
                {
                    item: "rift_core",
                    chance: 28
                },
                {
                    item: "interdimensional_bone",
                    chance: 12
                },
                {
                    item: "chaos_essence",
                    chance: 5
                }
            ]
        }
    ]
};
