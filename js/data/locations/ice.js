const ice = {
    id: "ice",

    name: "❄️ Lodowa Kraina",

    description:
        "Skuta lodem kraina zamieszkana przez mroźne duchy, olbrzymy i żywiołaki.",

    recommendedLevel: 35,
    requiredLevel: 35,

    boss: {
        id: "frost_queen",
        name: "👑 Królowa Mrozu",

        hp: 6500,
        attack: 120,

        gold: 4000,
        exp: 5800,

        firstKillReward: {
            gold: 5500,
            exp: 7800,

            items: [
                {
                    item:
                        "frost_crown_fragment",

                    quantity: 1
                }
            ]
        },

        loot: [
            {
                item:
                    "frost_crown_fragment",

                chance: 55
            },
            {
                item:
                    "ice_elemental_core",

                chance: 50
            },
            {
                item:
                    "frost_essence",

                chance: 45
            }
        ]
    },

    enemies: [
        {
            id: "frost_wisp",
            name: "Mroźny ognik",

            hp: 300,
            attack: 35,

            gold: 350,
            exp: 520,

            loot: [
                {
                    item:
                        "frost_essence",

                    chance: 38
                },
                {
                    item:
                        "ice_elemental_core",

                    chance: 3
                }
            ]
        },

        {
            id: "ice_wolf",
            name: "Lodowy wilk",

            hp: 360,
            attack: 42,

            gold: 430,
            exp: 650,

            loot: [
                {
                    item:
                        "ice_wolf_fur",

                    chance: 35
                },
                {
                    item:
                        "frost_essence",

                    chance: 12
                }
            ]
        },

        {
            id: "frozen_warrior",
            name: "Zamarznięty wojownik",

            hp: 430,
            attack: 49,

            gold: 550,
            exp: 820,

            loot: [
                {
                    item:
                        "frozen_bone",

                    chance: 34
                },
                {
                    item:
                        "frozen_chain",

                    chance: 18
                },
                {
                    item:
                        "frost_essence",

                    chance: 8
                }
            ]
        },

        {
            id: "frost_giant",
            name: "Lodowy olbrzym",

            hp: 520,
            attack: 56,

            gold: 720,
            exp: 1050,

            loot: [
                {
                    item:
                        "frost_giant_shard",

                    chance: 32
                },
                {
                    item:
                        "frozen_chain",

                    chance: 14
                },
                {
                    item:
                        "ice_elemental_core",

                    chance: 6
                }
            ]
        },

        {
            id: "ice_elemental",
            name: "Żywiołak lodu",

            hp: 620,
            attack: 64,

            gold: 950,
            exp: 1380,

            loot: [
                {
                    item:
                        "ice_elemental_core",

                    chance: 25
                },
                {
                    item:
                        "frost_essence",

                    chance: 30
                },
                {
                    item:
                        "frost_giant_shard",

                    chance: 12
                }
            ]
        }
    ]
};