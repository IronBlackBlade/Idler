const dungeons = {
    goblinHideout: {
        id: "goblinHideout",
        name: "Kryjówka Goblinów",
        icon: "🗝️",
        keyItemId: "goblin_hideout_key",
        recommendedLevel: 10,
        rooms: [
            {
                id: "goblin_watcher",
                name: "Gobliński zwiadowca",
                hp: 130,
                attack: 11,
                gold: 19,
                exp: 28,
                loot: [
                    { item: "coin_pouch", chance: 35 },
                    { item: "goblin_blade_fragment", chance: 20 }
                ]
            },
            {
                id: "goblin_guard",
                name: "Gobliński strażnik",
                hp: 190,
                attack: 14,
                gold: 28,
                exp: 40,
                loot: [
                    { item: "broken_shield", chance: 30 },
                    { item: "coin_pouch", chance: 45 }
                ]
            },
            {
                id: "goblin_shaman",
                name: "Gobliński szaman",
                hp: 260,
                attack: 17,
                gold: 42,
                exp: 58,
                loot: [
                    { item: "goblin_blade_fragment", chance: 50 },
                    { item: "old_coin", chance: 20 }
                ]
            },
            {
                id: "goblin_brute",
                name: "Gobliński brutal",
                hp: 370,
                attack: 22,
                gold: 61,
                exp: 82,
                loot: [
                    { item: "broken_shield", chance: 50 },
                    { item: "coin_pouch", chance: 65 }
                ]
            },
            {
                id: "goblin_king",
                name: "Król Goblinów",
                hp: 620,
                attack: 28,
                gold: 142,
                exp: 180,
                isBoss: true,
                loot: [
                    { item: "goblin_blade_fragment", chance: 100 },
                    { item: "goblin_dagger", chance: 35 }
                ]
            }
        ],
        completionRewards: {
            chanceItems: [
                { item: "upgrade_protection_stone", quantity: 1, chance: 0.15 }
            ],
            gold: 206,
            exp: 225,
            items: [
                {
                    item: "goblin_king_trophy",
                    quantity: 1
                }
            ]
        }
    },

    koboldTunnels: {
        id: "koboldTunnels",
        name: "Tunele Koboldów",
        icon: "⛏️",
        keyItemId: "kobold_tunnels_key",
        recommendedLevel: 20,
        rooms: [
            {
                id: "kobold_scout",
                name: "Kobold zwiadowca",
                hp: 800,
                attack: 42,
                gold: 217,
                exp: 254,
                loot: [
                    { item: "kobold_ear", chance: 50 },
                    { item: "cave_crystal", chance: 15 }
                ]
            },
            {
                id: "kobold_sapper",
                name: "Kobold miner",
                hp: 1200,
                attack: 48,
                gold: 304,
                exp: 344,
                loot: [
                    { item: "kobold_pickaxe", chance: 45 },
                    { item: "cave_crystal", chance: 25 }
                ]
            },
            {
                id: "kobold_shaman",
                name: "Kobold runiczny",
                hp: 1650,
                attack: 55,
                gold: 412,
                exp: 459,
                loot: [
                    { item: "kobold_crown_fragment", chance: 35 },
                    { item: "cave_crystal", chance: 45 }
                ]
            },
            {
                id: "kobold_champion",
                name: "Czempion koboldów",
                hp: 2250,
                attack: 64,
                gold: 542,
                exp: 590,
                loot: [
                    { item: "kobold_crown_fragment", chance: 55 },
                    { item: "stone_core", chance: 30 }
                ]
            },
            {
                id: "kobold_tunnel_king",
                name: "Władca Podziemi",
                hp: 3600,
                attack: 76,
                gold: 1130,
                exp: 1180,
                isBoss: true,
                loot: [
                    { item: "kobold_crown_fragment", chance: 100 },

                ]
            }
        ],
        completionRewards: {
            chanceItems: [
                { item: "upgrade_protection_stone", quantity: 1, chance: 0.15 }
            ],
            gold: 1740,
            exp: 1560,
            items: [
                {
                    item: "kobold_king_trophy",
                    quantity: 1
                }
            ]
        }
    },

    guardianSanctum: {
        id: "guardianSanctum",
        name: "Sanktuarium Strażnika",
        icon: "🏛️",
        keyItemId: "guardian_sanctum_key",
        recommendedLevel: 30,
        rooms: [
            {
                id: "runic_sentinel",
                name: "Runiczny wartownik",
                hp: 2590,
                attack: 63,
                gold: 840,
                exp: 1440,
                loot: [
                    { item: "ancient_rune_fragment", chance: 50 },
                    { item: "spectral_essence", chance: 20 }
                ]
            },
            {
                id: "guardian_phantom",
                name: "Widmo strażnika",
                hp: 3700,
                attack: 71,
                gold: 1160,
                exp: 1970,
                loot: [
                    { item: "spectral_essence", chance: 55 },
                    { item: "guardian_core", chance: 20 }
                ]
            },
            {
                id: "ancient_arbiter",
                name: "Pradawny arbiter",
                hp: 5180,
                attack: 80,
                gold: 1520,
                exp: 2590,
                loot: [
                    { item: "guardian_core", chance: 40 },
                    { item: "ancient_rune_fragment", chance: 65 }
                ]
            },
            {
                id: "sanctum_colossus",
                name: "Kolos sanktuarium",
                hp: 7020,
                attack: 90,
                gold: 1960,
                exp: 3360,
                loot: [
                    { item: "guardian_emblem", chance: 30 },
                    { item: "guardian_core", chance: 55 }
                ]
            },
            {
                id: "eternal_guardian",
                name: "Wieczny Strażnik",
                hp: 11100,
                attack: 104,
                gold: 4200,
                exp: 7200,
                isBoss: true,
                loot: [
                    { item: "guardian_emblem", chance: 100 },
                    { item: "guardian_core", chance: 70 }
                ]
            }
        ],
        completionRewards: {
            chanceItems: [
                { item: "upgrade_protection_stone", quantity: 1, chance: 0.25 }
            ],
            gold: 5600,
            exp: 8640,
            items: [
                {
                    item: "eternal_guardian_trophy",
                    quantity: 1
                }
            ]
        }
    },

    frostCitadel: {
        id: "frostCitadel",
        name: "Twierdza Szronu",
        icon: "❄️",
        keyItemId: "frost_citadel_key",
        recommendedLevel: 45,
        rooms: [
            {
                id: "frostbound_knight",
                name: "Rycerz skutej lodem straży",
                hp: 6910,
                attack: 79,
                gold: 2480,
                exp: 8360,
                loot: [
                    { item: "frozen_chain", chance: 50 },
                    { item: "frost_essence", chance: 35 }
                ]
            },
            {
                id: "glacial_hunter",
                name: "Lodowcowy łowca",
                hp: 9510,
                attack: 87,
                gold: 3260,
                exp: 11000,
                loot: [
                    { item: "ice_wolf_fur", chance: 55 },
                    { item: "ice_elemental_core", chance: 25 }
                ]
            },
            {
                id: "winter_oracle",
                name: "Wyrocznia zimy",
                hp: 12700,
                attack: 97,
                gold: 4340,
                exp: 14400,
                loot: [
                    { item: "frost_essence", chance: 70 },
                    { item: "frost_crown_fragment", chance: 35 }
                ]
            },
            {
                id: "icebound_colossus",
                name: "Kolos lodowej twierdzy",
                hp: 17100,
                attack: 109,
                gold: 5580,
                exp: 19000,
                loot: [
                    { item: "frost_giant_shard", chance: 60 },
                    { item: "ice_elemental_core", chance: 50 }
                ]
            },
            {
                id: "winter_sovereign",
                name: "Władca Wiecznej Zimy",
                hp: 28800,
                attack: 124,
                gold: 11800,
                exp: 41800,
                isBoss: true,
                loot: [
                    { item: "frost_crown_fragment", chance: 100 },
                    { item: "ice_elemental_core", chance: 80 }
                ]
            }
        ],
        completionRewards: {
            chanceItems: [
                { item: "upgrade_protection_stone", quantity: 1, chance: 0.25 }
            ],
            gold: 14000,
            exp: 47500,
            items: [
                {
                    item: "winter_sovereign_trophy",
                    quantity: 1
                }
            ]
        }
    },

    volcanoHeart: {
        id: "volcanoHeart",
        name: "Serce Wulkanu",
        icon: "🌋",
        keyItemId: "volcano_heart_key",
        recommendedLevel: 65,
        rooms: [
            {
                id: "magma_warrior",
                name: "Wojownik magmy",
                hp: 16800,
                attack: 98,
                gold: 8190,
                exp: 52100,
                loot: [
                    { item: "magma_golem_plate", chance: 55 },
                    { item: "ember_essence", chance: 45 }
                ]
            },
            {
                id: "ember_stalker",
                name: "Łowca żaru",
                hp: 23200,
                attack: 107,
                gold: 10700,
                exp: 67500,
                loot: [
                    { item: "lava_hound_hide", chance: 60 },
                    { item: "obsidian_shard", chance: 35 }
                ]
            },
            {
                id: "obsidian_sage",
                name: "Obsydianowy mędrzec",
                hp: 30700,
                attack: 117,
                gold: 14000,
                exp: 87500,
                loot: [
                    { item: "magma_core", chance: 45 },
                    { item: "volcanic_heart_fragment", chance: 35 }
                ]
            },
            {
                id: "inferno_colossus",
                name: "Kolos inferna",
                hp: 41400,
                attack: 129,
                gold: 18100,
                exp: 113000,
                loot: [
                    { item: "magma_core", chance: 65 },
                    { item: "obsidian_shard", chance: 60 }
                ]
            },
            {
                id: "flame_tyrant",
                name: "Tyran Płomieni",
                hp: 71500,
                attack: 147,
                gold: 37000,
                exp: 234000,
                isBoss: true,
                loot: [
                    { item: "volcanic_heart_fragment", chance: 100 },
                    { item: "magma_core", chance: 85 }
                ]
            }
        ],
        completionRewards: {
            chanceItems: [
                { item: "upgrade_protection_stone", quantity: 1, chance: 0.35 }
            ],
            gold: 42900,
            exp: 278000,
            items: [
                {
                    item: "flame_tyrant_trophy",
                    quantity: 1
                }
            ]
        }
    },
    abyssCitadel: {
        id: "abyssCitadel",
        name: "Cytadela Otchłani",
        icon: "🌌",
        keyItemId: "abyss_citadel_key",
        recommendedLevel: 80,

        rooms: [
            {
                id: "memory_keeper",
                name: "Strażnik wspomnień",
                hp: 35900,
                attack: 100,
                gold: 29900,
                exp: 162000,
                loot: [
                    {
                        item: "memory_fragment",
                        chance: 65
                    },
                    {
                        item: "crystallized_thought",
                        chance: 40
                    }
                ]
            },
            {
                id: "rift_stalker",
                name: "Tropiciel Rozdarcia",
                hp: 46100,
                attack: 110,
                gold: 37400,
                exp: 206000,
                loot: [
                    {
                        item: "dimensional_thread",
                        chance: 65
                    },
                    {
                        item: "spatial_gland",
                        chance: 35
                    }
                ]
            },
            {
                id: "void_seer",
                name: "Wieszcz Pustki",
                hp: 59700,
                attack: 122,
                gold: 47300,
                exp: 258000,
                loot: [
                    {
                        item: "astral_pupil",
                        chance: 55
                    },
                    {
                        item: "dark_matter",
                        chance: 40
                    }
                ]
            },
            {
                id: "chaos_colossus",
                name: "Kolos Chaosu",
                hp: 82000,
                attack: 137,
                gold: 61000,
                exp: 335000,
                loot: [
                    {
                        item: "rift_core",
                        chance: 60
                    },
                    {
                        item: "interdimensional_bone",
                        chance: 45
                    },
                    {
                        item: "chaos_essence",
                        chance: 25
                    }
                ]
            },
            {
                id: "abyss_citadel_sovereign",
                name: "Suweren Otchłani",
                hp: 143000,
                attack: 160,
                gold: 120000,
                exp: 669000,
                isBoss: true,
                loot: [
                    {
                        item: "abyss_heart",
                        chance: 100
                    },
                    {
                        item: "chaos_essence",
                        chance: 80
                    },
                    {
                        item: "dark_matter",
                        chance: 70
                    }
                ]
            }
        ],

        completionRewards: {
            chanceItems: [
                { item: "upgrade_protection_stone", quantity: 1, chance: 0.35 }
            ],
            gold: 137000,
            exp: 764000,
            items: [
                {
                    item: "abyss_sovereign_trophy",
                    quantity: 1
                }
            ]
        }
    },

    deepPalace: {
        id: "deepPalace",
        name: "Pałac Głębin",
        icon: "🏛️",
        keyItemId: "deep_palace_key",
        recommendedLevel: 90,

        rooms: [
            {
                id: "sunken_gate_guardian",
                name: "Strażnik Zatopionej Bramy",
                hp: 52800,
                attack: 100,
                gold: 41000,
                exp: 222000,
                loot: [
                    {
                        item: "rusted_guard_medal",
                        chance: 60
                    },
                    {
                        item: "petrified_plate",
                        chance: 40
                    }
                ]
            },
            {
                id: "court_hydromancer",
                name: "Nadworny Hydromanta",
                hp: 69100,
                attack: 110,
                gold: 51700,
                exp: 281000,
                loot: [
                    {
                        item: "enchanted_shell",
                        chance: 60
                    },
                    {
                        item: "depth_essence",
                        chance: 35
                    }
                ]
            },
            {
                id: "royal_siren",
                name: "Królewska Syrena",
                hp: 89400,
                attack: 123,
                gold: 65400,
                exp: 357000,
                loot: [
                    {
                        item: "song_crystal",
                        chance: 55
                    },
                    {
                        item: "coral_heart",
                        chance: 40
                    }
                ]
            },
            {
                id: "palace_reef_colossus",
                name: "Kolos Pałacowych Raf",
                hp: 118000,
                attack: 137,
                gold: 83600,
                exp: 456000,
                loot: [
                    {
                        item: "living_coral_shard",
                        chance: 70
                    },
                    {
                        item: "coral_heart",
                        chance: 55
                    },
                    {
                        item: "depth_essence",
                        chance: 30
                    }
                ]
            },
            {
                id: "spectral_deep_king",
                name: "Widmowy Król Głębin",
                hp: 194000,
                attack: 156,
                gold: 160000,
                exp: 880000,
                isBoss: true,
                loot: [
                    {
                        item: "leviathan_crown",
                        chance: 100
                    },
                    {
                        item: "depth_essence",
                        chance: 85
                    },
                    {
                        item: "coral_heart",
                        chance: 70
                    }
                ]
            }
        ],

        completionRewards: {
            chanceItems: [
                { item: "upgrade_protection_stone", quantity: 1, chance: 0.35 }
            ],
            gold: 182000,
            exp: 1020000,
            items: [
                {
                    item:
                        "spectral_deep_king_trophy",
                    quantity: 1
                }
            ]
        }
    },
    prismaticSpire: {
        id: "prismaticSpire",
        name: "Pryzmatyczna Iglica",
        icon: "💎",
        keyItemId: "crystal_spire_key",
        recommendedLevel: 100,

        rooms: [
            {
                id: "spire_crystal_sentinel",
                name: "Kryształowy Wartownik",
                hp: 173000,
                attack: 129,
                gold: 128000,
                exp: 704000,

                loot: [
                    {
                        item: "spire_armor_fragment",
                        chance: 60
                    },
                    {
                        item: "living_crystal",
                        chance: 40
                    }
                ]
            },

            {
                id: "prismatic_channeler",
                name: "Pryzmatyczny Kanałowiec",
                hp: 217000,
                attack: 139,
                gold: 158000,
                exp: 861000,

                loot: [
                    {
                        item: "unstable_crystal",
                        chance: 65
                    },
                    {
                        item: "prismatic_core",
                        chance: 35
                    }
                ]
            },

            {
                id: "geode_titan",
                name: "Tytan Geod",
                hp: 273000,
                attack: 151,
                gold: 192000,
                exp: 1060000,

                loot: [
                    {
                        item: "geode_heart",
                        chance: 55
                    },
                    {
                        item: "crystalline_sinew",
                        chance: 60
                    },
                    {
                        item: "mountain_essence",
                        chance: 30
                    }
                ]
            },

            {
                id: "spire_prismatic_guardian",
                name: "Strażnik Pryzmatycznego Tronu",
                hp: 360000,
                attack: 163,
                gold: 237000,
                exp: 1310000,

                loot: [
                    {
                        item: "prismatic_scale",
                        chance: 70
                    },
                    {
                        item: "crystal_stinger",
                        chance: 55
                    },
                    {
                        item: "prismatic_core",
                        chance: 45
                    }
                ]
            },

            {
                id: "prismatic_spire_sovereign",
                name: "Władca Pryzmatycznej Iglicy",
                hp: 596000,
                attack: 178,
                gold: 445000,
                exp: 2450000,
                isBoss: true,

                loot: [
                    {
                        item: "mountain_heart",
                        chance: 100
                    },
                    {
                        item: "prismatic_core",
                        chance: 85
                    },
                    {
                        item: "mountain_essence",
                        chance: 70
                    }
                ]
            }
        ],

        completionRewards: {
            chanceItems: [
                { item: "upgrade_protection_stone", quantity: 1, chance: 0.35 }
            ],
            gold: 543000,
            exp: 2930000,

            items: [
                {
                    item: "prismatic_spire_trophy",
                    quantity: 1
                }
            ]
        }
    }



};



