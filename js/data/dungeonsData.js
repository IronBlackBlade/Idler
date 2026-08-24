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
                gold: 16,
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
                gold: 24,
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
                gold: 36,
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
                gold: 52,
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
                gold: 120,
                exp: 180,
                isBoss: true,
                loot: [
                    { item: "goblin_blade_fragment", chance: 100 },
                    { item: "goblin_dagger", chance: 35 }
                ]
            }
        ],
        completionRewards: {
            gold: 175,
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
                gold: 100,
                exp: 155,
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
                gold: 140,
                exp: 210,
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
                gold: 190,
                exp: 280,
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
                gold: 250,
                exp: 360,
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
                gold: 520,
                exp: 720,
                isBoss: true,
                loot: [
                    { item: "kobold_crown_fragment", chance: 100 },

                ]
            }
        ],
        completionRewards: {
            gold: 800,
            exp: 950,
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
                hp: 3500,
                attack: 85,
                gold: 420,
                exp: 600,
                loot: [
                    { item: "ancient_rune_fragment", chance: 50 },
                    { item: "spectral_essence", chance: 20 }
                ]
            },
            {
                id: "guardian_phantom",
                name: "Widmo strażnika",
                hp: 5000,
                attack: 96,
                gold: 580,
                exp: 820,
                loot: [
                    { item: "spectral_essence", chance: 55 },
                    { item: "guardian_core", chance: 20 }
                ]
            },
            {
                id: "ancient_arbiter",
                name: "Pradawny arbiter",
                hp: 7000,
                attack: 108,
                gold: 760,
                exp: 1080,
                loot: [
                    { item: "guardian_core", chance: 40 },
                    { item: "ancient_rune_fragment", chance: 65 }
                ]
            },
            {
                id: "sanctum_colossus",
                name: "Kolos sanktuarium",
                hp: 9500,
                attack: 122,
                gold: 980,
                exp: 1400,
                loot: [
                    { item: "guardian_emblem", chance: 30 },
                    { item: "guardian_core", chance: 55 }
                ]
            },
            {
                id: "eternal_guardian",
                name: "Wieczny Strażnik",
                hp: 15000,
                attack: 140,
                gold: 2100,
                exp: 3000,
                isBoss: true,
                loot: [
                    { item: "guardian_emblem", chance: 100 },
                    { item: "guardian_core", chance: 70 }
                ]
            }
        ],
        completionRewards: {
            gold: 2800,
            exp: 3600,
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
                hp: 12500,
                attack: 142,
                gold: 1600,
                exp: 2200,
                loot: [
                    { item: "frozen_chain", chance: 50 },
                    { item: "frost_essence", chance: 35 }
                ]
            },
            {
                id: "glacial_hunter",
                name: "Lodowcowy łowca",
                hp: 17200,
                attack: 158,
                gold: 2100,
                exp: 2900,
                loot: [
                    { item: "ice_wolf_fur", chance: 55 },
                    { item: "ice_elemental_core", chance: 25 }
                ]
            },
            {
                id: "winter_oracle",
                name: "Wyrocznia zimy",
                hp: 23000,
                attack: 176,
                gold: 2800,
                exp: 3800,
                loot: [
                    { item: "frost_essence", chance: 70 },
                    { item: "frost_crown_fragment", chance: 35 }
                ]
            },
            {
                id: "icebound_colossus",
                name: "Kolos lodowej twierdzy",
                hp: 31000,
                attack: 198,
                gold: 3600,
                exp: 5000,
                loot: [
                    { item: "frost_giant_shard", chance: 60 },
                    { item: "ice_elemental_core", chance: 50 }
                ]
            },
            {
                id: "winter_sovereign",
                name: "Władca Wiecznej Zimy",
                hp: 52000,
                attack: 225,
                gold: 7600,
                exp: 11000,
                isBoss: true,
                loot: [
                    { item: "frost_crown_fragment", chance: 100 },
                    { item: "ice_elemental_core", chance: 80 }
                ]
            }
        ],
        completionRewards: {
            gold: 9000,
            exp: 12500,
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
        recommendedLevel: 60,
        rooms: [
            {
                id: "magma_warrior",
                name: "Wojownik magmy",
                hp: 40000,
                attack: 235,
                gold: 4200,
                exp: 6000,
                loot: [
                    { item: "magma_golem_plate", chance: 55 },
                    { item: "ember_essence", chance: 45 }
                ]
            },
            {
                id: "ember_stalker",
                name: "Łowca żaru",
                hp: 55000,
                attack: 255,
                gold: 5500,
                exp: 7800,
                loot: [
                    { item: "lava_hound_hide", chance: 60 },
                    { item: "obsidian_shard", chance: 35 }
                ]
            },
            {
                id: "obsidian_sage",
                name: "Obsydianowy mędrzec",
                hp: 73000,
                attack: 280,
                gold: 7200,
                exp: 10100,
                loot: [
                    { item: "magma_core", chance: 45 },
                    { item: "volcanic_heart_fragment", chance: 35 }
                ]
            },
            {
                id: "inferno_colossus",
                name: "Kolos inferna",
                hp: 98000,
                attack: 310,
                gold: 9300,
                exp: 13000,
                loot: [
                    { item: "magma_core", chance: 65 },
                    { item: "obsidian_shard", chance: 60 }
                ]
            },
            {
                id: "flame_tyrant",
                name: "Tyran Płomieni",
                hp: 170000,
                attack: 350,
                gold: 19000,
                exp: 27000,
                isBoss: true,
                loot: [
                    { item: "volcanic_heart_fragment", chance: 100 },
                    { item: "magma_core", chance: 85 }
                ]
            }
        ],
        completionRewards: {
            gold: 22000,
            exp: 32000,
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
        recommendedLevel: 70,

        rooms: [
            {
                id: "memory_keeper",
                name: "Strażnik wspomnień",
                hp: 120000,
                attack: 340,
                gold: 12000,
                exp: 17000,
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
                hp: 155000,
                attack: 375,
                gold: 15000,
                exp: 21500,
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
                hp: 200000,
                attack: 415,
                gold: 19000,
                exp: 27000,
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
                hp: 275000,
                attack: 465,
                gold: 24500,
                exp: 35000,
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
                hp: 480000,
                attack: 540,
                gold: 48000,
                exp: 70000,
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
            gold: 55000,
            exp: 80000,
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
        recommendedLevel: 80,

        rooms: [
            {
                id: "sunken_gate_guardian",
                name: "Strażnik Zatopionej Bramy",
                hp: 260000,
                attack: 500,
                gold: 27000,
                exp: 38000,
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
                hp: 340000,
                attack: 550,
                gold: 34000,
                exp: 48000,
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
                hp: 440000,
                attack: 610,
                gold: 43000,
                exp: 61000,
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
                hp: 580000,
                attack: 680,
                gold: 55000,
                exp: 78000,
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
                hp: 950000,
                attack: 780,
                gold: 105000,
                exp: 150000,
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
            gold: 120000,
            exp: 175000,
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
        recommendedLevel: 90,

        rooms: [
            {
                id: "spire_crystal_sentinel",
                name: "Kryształowy Wartownik",
                hp: 1400000,
                attack: 1050,
                gold: 260000,
                exp: 360000,

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
                hp: 1750000,
                attack: 1130,
                gold: 320000,
                exp: 440000,

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
                hp: 2200000,
                attack: 1220,
                gold: 390000,
                exp: 540000,

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
                hp: 2900000,
                attack: 1320,
                gold: 480000,
                exp: 670000,

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
                hp: 4800000,
                attack: 1450,
                gold: 900000,
                exp: 1250000,
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
            gold: 1100000,
            exp: 1500000,

            items: [
                {
                    item: "prismatic_spire_trophy",
                    quantity: 1
                }
            ]
        }
    }



};



