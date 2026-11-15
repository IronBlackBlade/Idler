const stormySkies = {
    id: "stormySkies",

    name: "⛈️ Burzowe Niebiosa",

    description:
        "Archipelag latających wysp ponad wiecznym nawałnicznym frontem, " +
        "gdzie grzmiące rocze, burzowe elementale i niebiańscy templariusze " +
        "strzegą pradawnej Błyskawicznej Cytadeli.",

    recommendedLevel: 120,
    chestGoldMultiplier: 4300,
    requiredLevel: 120,

    boss: {
        id: "tempest_sovereign",
        name: "⚡ Władca Burzy",

        hp: 17400,
        attack: 885,
        gold: 400000,
        exp: 175000,

        firstKillReward: {
            gold: 520000,
            exp: 235000,

            items: [
                {
                    item: "storm_sovereign_heart",
                    quantity: 1
                }
            ]
        },

        loot: [
            {
                item: "sovereign_stormplate",
                chance: 55
            },
            {
                item: "storm_essence",
                chance: 40
            },
            {
                item: "storm_sovereign_heart",
                chance: 18
            }
        ]
    },

    enemies: [
        {
            id: "wind_harpy",
            name: "Harpia wichru",

            hp: 4600,
            attack: 410,
            gold: 155000,
            exp: 66000,

            loot: [
                {
                    item: "storm_feather",
                    chance: 36
                },
                {
                    item: "harpy_talon",
                    chance: 16
                },
                {
                    item: "gale_pearl",
                    chance: 6
                }
            ]
        },

        {
            id: "cloud_serpent",
            name: "Chmurowy wąż",

            hp: 5500,
            attack: 470,
            gold: 183000,
            exp: 78000,

            loot: [
                {
                    item: "cloud_scale",
                    chance: 35
                },
                {
                    item: "vapor_fang",
                    chance: 15
                },
                {
                    item: "stratus_gem",
                    chance: 6
                }
            ]
        },

        {
            id: "thunder_roc",
            name: "Grzmiący roc",

            hp: 6400,
            attack: 535,
            gold: 214000,
            exp: 91000,

            loot: [
                {
                    item: "thunder_quill",
                    chance: 34
                },
                {
                    item: "roc_eggshell",
                    chance: 14
                },
                {
                    item: "stormcaller_beak",
                    chance: 5
                }
            ]
        },

        {
            id: "storm_elemental",
            name: "Elementał burzy",

            hp: 7300,
            attack: 600,
            gold: 248000,
            exp: 105500,

            loot: [
                {
                    item: "static_core",
                    chance: 32
                },
                {
                    item: "tempest_shard",
                    chance: 13
                },
                {
                    item: "bottled_lightning",
                    chance: 5
                }
            ]
        },

        {
            id: "sky_templar",
            name: "Niebiański templariusz",

            hp: 8200,
            attack: 665,
            gold: 285000,
            exp: 121000,

            loot: [
                {
                    item: "sky_steel_rivet",
                    chance: 28
                },
                {
                    item: "wind_forged_ingot",
                    chance: 12
                },
                {
                    item: "templar_halo",
                    chance: 5
                }
            ]
        }
    ]
};
