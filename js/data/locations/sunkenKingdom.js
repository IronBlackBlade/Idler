const sunkenKingdom = {
    id: "sunkenKingdom",
    name: "🌊 Zatopione Królestwo",
    description:
        "Ruiny dawnego królestwa spoczywające pod wzburzonym morzem, zamieszkane przez topielców i istoty głębin.",
    recommendedLevel: 70,
    requiredLevel: 70,
    boss: {
        id: "crown_leviathan",
        name: "👑 Lewiatan Korony",
        hp: 24000,
        attack: 240,
        gold: 28000,
        exp: 40500,
        firstKillReward: {
            gold: 40000,
            exp: 58000,
            items: [
                {
                    item: "leviathan_crown",
                    quantity: 1
                }
            ]
        },
        loot: [
            {
                item: "depth_essence",
                chance: 55
            },
            {
                item: "coral_heart",
                chance: 45
            },
            {
                item: "deep_scale",
                chance: 35
            },
            {
                item: "leviathan_crown",
                chance: 18
            }
        ]
    },
    enemies: [
        {
            id: "drowned_royal_guard",
            name: "Topielec Królewskiej Gwardii",
            hp: 1100,
            attack: 125,
            gold: 14500,
            exp: 20400,
            loot: [
                {
                    item: "royal_uniform_scrap",
                    chance: 36
                },
                {
                    item: "rusted_guard_medal",
                    chance: 16
                },
                {
                    item: "drowned_bone",
                    chance: 6
                }
            ]
        },
        {
            id: "deep_hunter",
            name: "Głębinowy Łowca",
            hp: 1280,
            attack: 138,
            gold: 17600,
            exp: 24800,
            loot: [
                {
                    item: "deep_scale",
                    chance: 35
                },
                {
                    item: "sea_predator_fang",
                    chance: 15
                },
                {
                    item: "pressure_gland",
                    chance: 6
                }
            ]
        },
        {
            id: "abyss_siren",
            name: "Syrena Otchłani",
            hp: 1500,
            attack: 152,
            gold: 21300,
            exp: 30000,
            loot: [
                {
                    item: "siren_scale",
                    chance: 34
                },
                {
                    item: "enchanted_shell",
                    chance: 14
                },
                {
                    item: "song_crystal",
                    chance: 5
                }
            ]
        },
        {
            id: "coral_colossus",
            name: "Koralowy Kolos",
            hp: 1750,
            attack: 166,
            gold: 25800,
            exp: 36300,
            loot: [
                {
                    item: "living_coral_shard",
                    chance: 32
                },
                {
                    item: "petrified_plate",
                    chance: 13
                },
                {
                    item: "coral_heart",
                    chance: 5
                }
            ]
        },
        {
            id: "sunken_throne_priest",
            name: "Kapłan Zatopionego Tronu",
            hp: 2050,
            attack: 182,
            gold: 31200,
            exp: 44000,
            loot: [
                {
                    item: "soaked_scroll",
                    chance: 28
                },
                {
                    item: "sunken_cult_relic",
                    chance: 12
                },
                {
                    item: "depth_essence",
                    chance: 5
                }
            ]
        }
    ]
};
