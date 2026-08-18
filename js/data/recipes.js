const recipes = [

    // ========================================
    // PRZETWARZANIE MATERIAŁÓW
    // ========================================

    {
        id: "copper_ingot_recipe",
        name: "Sztabka miedzi",

        category: "materials",
        subcategory: "metallurgy",

        resultItemId: "copper_ingot",
        requiredCraftingLevel: 1,
        craftingExp: 10,
        craftingTimeSeconds: 10,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 2,

        materials: [
            {
                itemId: "copper_ore",
                quantity: 3
            },
            {
                itemId: "coal",
                quantity: 1
            }
        ]
    },

    {
        id: "tin_ingot_recipe",
        name: "Sztabka cyny",

        category: "materials",
        subcategory: "metallurgy",

        resultItemId: "tin_ingot",
        requiredCraftingLevel: 1,
        craftingExp: 10,
        craftingTimeSeconds: 10,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 3,

        materials: [
            {
                itemId: "tin_ore",
                quantity: 3
            },
            {
                itemId: "coal",
                quantity: 1
            }
        ]
    },

    {
        id: "bronze_ingot_recipe",
        name: "Sztabka brązu",

        category: "materials",
        subcategory: "metallurgy",

        resultItemId:
            "bronze_ingot",
        requiredCraftingLevel: 2,
        craftingExp: 18,
        craftingTimeSeconds: 10,
        resultQuantity: 2,

        requiresScroll: false,
        unlockCost: 0,
        goldCost: 3,

        materials: [
            {
                itemId:
                    "copper_ingot",
                quantity: 2
            },
            {
                itemId:
                    "tin_ingot",
                quantity: 1
            }
        ]
    },

    {
        id: "iron_ingot_recipe",
        name: "Sztabka żelaza",

        category: "materials",
        subcategory: "metallurgy",

        resultItemId: "iron_ingot",
        requiredCraftingLevel: 3,
        craftingExp: 20,
        craftingTimeSeconds: 10,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 4,

        materials: [
            {
                itemId: "iron_ore",
                quantity: 3
            },
            {
                itemId: "coal",
                quantity: 1
            }
        ]
    },

    {
        id: "silver_ingot_recipe",
        name: "Sztabka srebra",

        category: "materials",
        subcategory: "metallurgy",

        resultItemId: "silver_ingot",

        requiredCraftingLevel: 5,
        craftingExp: 30,
        craftingTimeSeconds: 12,

        requiresScroll: false,
        unlockCost: 0,
        goldCost: 6,

        materials: [
            {
                itemId: "silver_ore",
                quantity: 3,
            },
            {
                itemId: "coal",
                quantity: 2,
            },
        ],
    },

    {
        id: "gold_ingot_recipe",
        name: "Sztabka złota",

        category: "materials",
        subcategory: "metallurgy",

        resultItemId: "gold_ingot",

        requiredCraftingLevel: 10,
        craftingExp: 45,
        craftingTimeSeconds: 14,

        requiresScroll: false,
        unlockCost: 0,
        goldCost: 8,

        materials: [
            {
                itemId: "gold_ore",
                quantity: 3,
            },
            {
                itemId: "coal",
                quantity: 2,
            },
        ],
    },

    {
        id: "platinum_ingot_recipe",
        name: "Sztabka platyny",

        category: "materials",
        subcategory: "metallurgy",

        resultItemId: "platinum_ingot",

        requiredCraftingLevel: 15,
        craftingExp: 70,
        craftingTimeSeconds: 16,

        requiresScroll: false,
        unlockCost: 0,
        goldCost: 12,

        materials: [
            {
                itemId: "platinum_ore",
                quantity: 3,
            },
            {
                itemId: "deep_coal",
                quantity: 2,
            },
        ],
    },

    {
        id: "mithril_ingot_recipe",
        name: "Sztabka mithrilu",

        category: "materials",
        subcategory: "metallurgy",

        resultItemId: "mithril_ingot",

        requiredCraftingLevel: 20,
        craftingExp: 100,
        craftingTimeSeconds: 20,

        requiresScroll: false,
        unlockCost: 0,
        goldCost: 18,

        materials: [
            {
                itemId: "mithril_ore",
                quantity: 3,
            },
            {
                itemId: "deep_coal",
                quantity: 2,
            },
        ],
    },

    {
        id: "adamantite_ingot_recipe",
        name: "Sztabka adamantytu",
        category: "materials",
        subcategory: "metallurgy",
        resultItemId: "adamantite_ingot",
        requiredCraftingLevel: 35,
        craftingExp: 320,
        craftingTimeSeconds: 36,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 40,
        materials: [
            {
                itemId: "adamantite_ore",
                quantity: 3
            },
            {
                itemId: "runic_stone",
                quantity: 1
            },
            {
                itemId: "deep_coal",
                quantity: 1
            }
        ]
    },

    {
        id: "dragonsteel_ingot_recipe",
        name: "Sztabka smoczej stali",
        category: "materials",
        subcategory: "metallurgy",
        resultItemId: "dragonsteel_ingot",
        requiredCraftingLevel: 50,
        craftingExp: 600,
        craftingTimeSeconds: 48,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 90,
        materials: [
            {
                itemId: "dragonsteel_ore",
                quantity: 3
            },
            {
                itemId: "titan_stone",
                quantity: 1
            },
            {
                itemId: "deep_coal",
                quantity: 2
            }
        ]
    },

    {
        id: "tanned_sheep_leather_recipe",
        name: "Garbowana skóra owcza",

        category: "materials",
        subcategory: "tanner",
        resultItemId:
            "tanned_sheep_leather",
        requiredCraftingLevel: 1,
        craftingExp: 10,
        craftingTimeSeconds: 10,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 2,

        materials: [
            {
                itemId: "sheep_skin",
                quantity: 2
            }
        ]
    },

    {
        id: "wool_cloth_recipe",
        name: "Tkanina wełniana",

        category: "materials",
        subcategory: "tanner",
        resultItemId: "wool_cloth",
        requiredCraftingLevel: 2,
        craftingExp: 15,
        craftingTimeSeconds: 10,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 4,

        materials: [
            {
                itemId: "wool",
                quantity: 3
            }
        ]
    },

    {
        id: "tanned_wolf_leather_recipe",
        name: "Garbowana wilcza skóra",

        category: "materials",
        subcategory: "tanner",
        resultItemId:
            "tanned_wolf_leather",
        requiredCraftingLevel: 3,
        craftingExp: 20,
        craftingTimeSeconds: 10,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 5,

        materials: [
            {
                itemId: "wolf_fur",
                quantity: 2
            }
        ]
    },

    {
        id: "tanned_ice_wolf_leather_recipe",
        name: "Garbowana skóra lodowego wilka",
        category: "materials",
        subcategory: "tanner",
        resultItemId:
            "tanned_ice_wolf_leather",
        requiredCraftingLevel: 20,
        craftingExp: 260,
        craftingTimeSeconds: 30,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 30,
        materials: [
            {
                itemId: "ice_wolf_fur",
                quantity: 2
            }
        ]
    },

    {
        id: "tanned_lava_hound_leather_recipe",
        name: "Garbowana skóra ogara lawy",
        category: "materials",
        subcategory: "tanner",
        resultItemId:
            "tanned_lava_hound_leather",
        requiredCraftingLevel: 35,
        craftingExp: 480,
        craftingTimeSeconds: 42,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 65,
        materials: [
            {
                itemId: "lava_hound_hide",
                quantity: 2
            }
        ]
    },



    {
        id: "chitin_plate_recipe",
        name: "Płyta chitynowa",

        category: "materials",
        subcategory: "armorer",

        resultItemId: "chitin_plate",
        requiredCraftingLevel: 1,
        craftingExp: 10,
        craftingTimeSeconds: 10,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 2,

        materials: [
            {
                itemId: "beetle_shell",
                quantity: 3
            }
        ]
    },

    {
        id: "ancient_chitin_plate_recipe",
        name: "Pradawna płyta chitynowa",

        category: "materials",
        subcategory: "armorer",

        resultItemId: "ancient_chitin_plate",
        requiredCraftingLevel: 15,
        craftingExp: 50,
        craftingTimeSeconds: 16,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 12,

        materials: [
            {
                itemId: "ancient_chitin",
                quantity: 3
            }
        ]
    },

    {
        id: "whetstone_recipe",
        name: "Kamień szlifierski",

        category: "materials",
        subcategory: "blacksmith",

        resultItemId: "whetstone",
        requiredCraftingLevel: 1,
        craftingExp: 5,
        craftingTimeSeconds: 5,

        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1,

        materials: [
            {
                itemId: "stone",
                quantity: 5
            }
        ]
    },

    {
        id: "recipe_weighted_mace_head",
        resultItemId: "weighted_mace_head",
        category: "materials",
        subcategory: "blacksmith",
        name: "Obciążona głowica obuchu",
        description: "Materiał używany do wytwarzania broni obuchowych.",
        requiredCraftingLevel: 5,
        resultQuantity: 1,
        requiresScroll: false
    },



    {
        id: "obsidian_whetstone_recipe",
        name: "Obsydianowy kamień szlifierski",

        category: "materials",
        subcategory: "blacksmith",

        resultItemId: "obsidian_whetstone",
        requiredCraftingLevel: 15,
        craftingExp: 50,
        craftingTimeSeconds: 12,

        requiresScroll: false,
        unlockCost: 0,
        goldCost: 25,

        materials: [
            {
                itemId: "obsidian",
                quantity: 5
            },
            {
                itemId: "stone",
                quantity: 5
            }
        ]

    },
    {
        id: "runic_core_recipe",
        name: "Runiczny rdzeń",
        category: "materials",
        subcategory: "blacksmith",
        resultItemId: "runic_core",
        requiredCraftingLevel: 20,
        craftingExp: 100,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 55,
        materials: [
            {
                itemId: "runic_stone",
                quantity: 3
            },
            {
                itemId: "ice_elemental_core",
                quantity: 1
            },
            {
                itemId: "deep_coal",
                quantity: 1
            }
        ]
    },

    {
        id: "recipe_scorching_mace_head",
        resultItemId: "scorching_mace_head",
        category: "materials",
        subcategory: "blacksmith",
        name: "Rozżarzona głowica obuchu",
        description: "Materiał używany do wytwarzania późniejszych broni obuchowych.",
        requiredCraftingLevel: 25,
        craftingTimeSeconds: 25,
        resultQuantity: 1,
        requiresScroll: false
    },

    {
        id: "titan_whetstone_recipe",
        name: "Tytanowy kamień szlifierski",

        category: "materials",
        subcategory: "blacksmith",

        resultItemId: "titan_whetstone",
        requiredCraftingLevel: 25,
        craftingExp: 100,
        craftingTimeSeconds: 25,

        requiresScroll: false,
        unlockCost: 0,
        goldCost: 50,

        materials: [
            {
                itemId: "titan_stone",
                quantity: 5
            },
            {
                itemId: "stone",
                quantity: 5
            }
        ]
    },
    {
        id: "simple_crossbow_trigger_recipe",
        name: "Prosty mechanizm spustowy",
        category: "materials",
        subcategory: "bowyer",
        resultItemId: "simple_crossbow_trigger",
        requiredCraftingLevel: 5,
        craftingExp: 45,
        craftingTimeSeconds: 14,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 8,
        materials: [
            {
                itemId: "iron_ingot",
                quantity: 2
            },
            {
                itemId: "goblin_blade_fragment",
                quantity: 2
            },
            {
                itemId: "spider_silk",
                quantity: 1
            }
        ]
    },

    {
        id: "reinforced_crossbow_mechanism_recipe",
        name: "Wzmocniony mechanizm naciągowy",
        category: "materials",
        subcategory: "bowyer",
        resultItemId: "reinforced_crossbow_mechanism",
        requiredCraftingLevel: 15,
        craftingExp: 120,
        craftingTimeSeconds: 28,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 28,
        materials: [
            {
                itemId: "platinum_ingot",
                quantity: 2
            },
            {
                itemId: "kobold_pickaxe",
                quantity: 2
            },
            {
                itemId: "cave_crystal",
                quantity: 2
            },
            {
                itemId: "ancient_rune_fragment",
                quantity: 2
            }
        ]
    },

    {
        id: "crossbow_tension_mechanism_recipe",
        name: "Mechanizm naciągowy kuszy",
        category: "materials",
        subcategory: "bowyer",
        resultItemId: "crossbow_tension_mechanism",
        requiredCraftingLevel: 25,
        craftingExp: 300,
        craftingTimeSeconds: 44,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 70,
        materials: [
            {
                itemId: "adamantite_ingot",
                quantity: 2
            },
            {
                itemId: "ancient_rune_fragment",
                quantity: 3
            },
            {
                itemId: "guardian_core",
                quantity: 1
            },
            {
                itemId: "frozen_chain",
                quantity: 2
            }
        ]
    },
    {
        id: "forest_blade_recipe",
        name: "Leśne ostrze",
        subcategory: "melee_weapon",
        resultItemId: "forest_blade",
        requiredCraftingLevel: 1,
        craftingExp: 25,
        craftingTimeSeconds: 12,
        requiresScroll: false,
        unlockCost: 80,
        goldCost: 60,        
        materials: [],
    },

    

    {
        id: "cave_sword_recipe",
        name: "Zabójca Koboldów",
        subcategory: "melee_weapon",
        resultItemId: "cave_sword",
        requiredCraftingLevel: 5,
        craftingExp: 50,
        craftingTimeSeconds: 14,
        requiresScroll: false,
        unlockCost: 250,
        goldCost: 180,
        materials: [ ],
    },

    {
        id: "guardian_blade_recipe",
        name: "Ostrze strażnika",
        subcategory: "melee_weapon",
        resultItemId: "guardian_blade",
        requiredCraftingLevel: 10,
        craftingExp: 85,
        craftingTimeSeconds: 16,
        requiresScroll: false,
        unlockCost: 600,
        goldCost: 450,
        materials: [],
    },

    {
        id: "steel_guardian_sword_recipe",
        name: "Miecz stalowego strażnika",
        subcategory: "melee_weapon",
        resultItemId: "steel_guardian_sword",
        requiredCraftingLevel: 15,
        craftingExp: 120,
        craftingTimeSeconds: 18,
        requiresScroll: false,
        unlockCost: 900,
        goldCost: 700,

        materials: [ ]
    },

    {
        id: "elite_guardian_blade_recipe",
        name: "Ostrze elitarnego strażnika",
        subcategory: "melee_weapon",
        resultItemId: "elite_guardian_blade",
        requiredCraftingLevel: 20,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1400,
        goldCost: 1100,

        materials: [ ]
    },

    {
        id: "commander_sword_recipe",
        name: "Miecz dowódcy",
        subcategory: "melee_weapon",
        resultItemId: "commander_sword",
        requiredCraftingLevel: 25,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1600,
        goldCost: 1200,
        materials: [],
    },

    {
        id: "dragon_blade_recipe",
        name: "Smocze ostrze",
        subcategory: "melee_weapon",
        resultItemId: "dragon_blade",
        requiredCraftingLevel: 20,
        craftingExp: 220,
        craftingTimeSeconds: 24,
        requiresScroll: false,
        unlockCost: 5000,
        goldCost: 4000,
        materials: [],
    },

    // ======================================================
    // BROŃ OBUCHOWA
    // ======================================================

    {
        id: "forest_club_recipe",
        name: "Leśna pałka",
        subcategory: "melee_weapon",
        resultItemId: "forest_club",
        requiredCraftingLevel: 1,
        craftingExp: 25,
        craftingTimeSeconds: 12,
        requiresScroll: false,
        unlockCost: 80,
        goldCost: 60,
        materials: [],
    },

    {
        id: "kobold_slayer_mace_recipe",
        name: "Maczuga pogromcy koboldów",
        subcategory: "melee_weapon",
        resultItemId: "kobold_slayer_mace",
        requiredCraftingLevel: 5,
        craftingExp: 50,
        craftingTimeSeconds: 14,
        requiresScroll: false,
        unlockCost: 250,
        goldCost: 180,
        materials: [],
    },

    {
        id: "power_club_recipe",
        name: "Maczuga mocy",
        subcategory: "melee_weapon",
        resultItemId: "power_club",
        requiredCraftingLevel: 10,
        craftingExp: 85,
        craftingTimeSeconds: 16,
        requiresScroll: false,
        unlockCost: 600,
        goldCost: 450,
        materials: [],
    },

    {
        id: "steel_guardian_hammer_recipe",
        name: "Młot stalowego strażnika",
        subcategory: "melee_weapon",
        resultItemId: "steel_guardian_hammer",
        requiredCraftingLevel: 15,
        craftingExp: 120,
        craftingTimeSeconds: 18,
        requiresScroll: false,
        unlockCost: 900,
        goldCost: 700,
        materials: []
    },

    {
        id: "elite_guardian_hammer_recipe",
        name: "Młot elitarnego strażnika",
        subcategory: "melee_weapon",
        resultItemId: "elite_guardian_hammer",
        requiredCraftingLevel: 20,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1400,
        goldCost: 1100,
        materials: []
    },

    {
        id: "shadow_hammer_recipe",
        name: "Młot cienia",
        subcategory: "melee_weapon",
        resultItemId: "shadow_hammer",
        requiredCraftingLevel: 25,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1600,
        goldCost: 1200,
        materials: []
    },

    {
        id: "dragon_hammer_recipe",
        name: "Smoczy młot",
        subcategory: "melee_weapon",
        resultItemId: "dragon_hammer",
        requiredCraftingLevel: 30,
        craftingExp: 220,
        craftingTimeSeconds: 24,
        requiresScroll: false,
        unlockCost: 5000,
        goldCost: 4000,
        materials: []
    },


    {
        id: "bark_shield_recipe",
        name: "Tarcza z kory",
        resultItemId: "bark_shield",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 50,
        materials: []
    },

    {
        id: "kobold_shield_recipe",
        name: "Tarcza koboldów",
        resultItemId: "kobold_shield",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 190,
        materials: []
    },

    {
        id: "guardian_shield_recipe",
        name: "Tarcza strażnika",
        resultItemId: "guardian_shield",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 500,
        materials: []
    },

    {
        id: "steel_guardian_shield_recipe",
        name: "Stalowa tarcza strażnika",
        resultItemId: "steel_guardian_shield",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 900,
        materials: []
    },

    {
        id: "elite_guardian_shield_recipe",
        name: "Tarcza elitarnego strażnika",
        resultItemId: "elite_guardian_shield",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1400,
        materials: []
    },

    {
        id: "commander_shield_recipe",
        name: "Tarcza dowódcy",
        resultItemId: "commander_shield",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1300,
        materials: []
    },


    {
        id: "dragon_shield_recipe",
        name: "Smocza tarcza",
        resultItemId: "dragon_shield",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 4200,
        materials: []
    },

    {
        id: "beetle_helmet_recipe",
        name: "Hełm z pancerza chrząszcza",
        resultItemId: "beetle_helmet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 40,
        materials: []
    },

    {
        id: "kobold_helmet_recipe",
        name: "Hełm kobolda",
        resultItemId: "kobold_helmet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 160,
        materials: []
    },

    {
        id: "guardian_helmet_recipe",
        name: "Hełm strażnika",
        resultItemId: "guardian_helmet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 420,
        materials: []
    },

    {
        id: "steel_guardian_helmet_recipe",
        name: "Hełm stalowego strażnika",
        resultItemId: "steel_guardian_helmet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 800,
        materials: []
    },

    {
        id: "elite_guardian_helmet_recipe",
        name: "Hełm elitarnego strażnika",
        resultItemId: "elite_guardian_helmet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1300,
        materials: []
    },

    {
        id: "commander_helmet_recipe",
        name: "Hełm dowódcy",
        resultItemId: "commander_helmet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1100,
        materials: []
    },


    {
        id: "dragon_helmet_recipe",
        name: "Smoczy hełm",
        resultItemId: "dragon_helmet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 3800,
        materials: [ ]
    },

    {
        id: "wolf_armor_recipe",
        name: "Pancerz wilka",
        resultItemId: "wolf_armor",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 90,
        materials: []
    },

    {
        id: "kobold_armor_recipe",
        name: "Pancerz kobolda",
        resultItemId: "kobold_armor",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 280,
        materials: [ ]
    },

    {
        id: "guardian_armor_recipe",
        name: "Pancerz strażnika",
        resultItemId: "guardian_armor",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 750,
        materials: []
    },

    {
        id: "steel_guardian_armor_recipe",
        name: "Pancerz stalowego strażnika",
        resultItemId: "steel_guardian_armor",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1500,
        materials: []
    },

    {
        id: "elite_guardian_armor_recipe",
        name: "Pancerz elitarnego strażnika",
        resultItemId: "elite_guardian_armor",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 2400,
        materials: []
    },

    {
        id: "commander_armor_recipe",
        name: "Pancerz dowódcy",
        resultItemId: "commander_armor",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 2200,
        materials: []
    },



    {
        id: "dragon_armor_recipe",
        name: "Smoczy pancerz",
        resultItemId: "dragon_armor",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 7000,
        materials: []
    },

    {
        id: "tracker_pants_recipe",
        name: "Spodnie tropiciela",
        resultItemId: "tracker_pants",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 70,
        materials: [ ]
    },

    {
        id: "kobold_pants_recipe",
        name: "Nogawice kobolda",
        resultItemId: "kobold_pants",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 220,
        materials: []
    },

    {
        id: "guardian_pants_recipe",
        name: "Nogawice strażnika",
        resultItemId: "guardian_pants",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 580,
        materials: []
    },



    {
        id: "steel_guardian_pants_recipe",
        name: "Stalowe spodnie strażnika",
        resultItemId: "steel_guardian_pants",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1100,
        materials: []
    },

    {
        id: "elite_guardian_pants_recipe",
        name: "Spodnie elitarnego strażnika",
        resultItemId: "elite_guardian_pants",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1800,
        materials: []
    },

    {
        id: "commander_pants_recipe",
        name: "Nogawice dowódcy",
        resultItemId: "commander_pants",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1600,
        materials: []
    },

    {
        id: "dragon_pants_recipe",
        name: "Smocze nogawice",
        resultItemId: "dragon_pants",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 5200,
        materials: []
    },

    {
        id: "wolf_boots_recipe",
        name: "Buty wilka",
        resultItemId: "wolf_boots",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 60,
        materials: []
    },

    {
        id: "kobold_boots_recipe",
        name: "Buty kobolda",
        resultItemId: "kobold_boots",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 200,
        materials: []
    },

    {
        id: "guardian_boots_recipe",
        name: "Buty strażnika",
        resultItemId: "guardian_boots",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 520,
        materials: []
    },

    {
        id: "steel_guardian_boots_recipe",
        name: "Stalowe buty strażnika",
        resultItemId: "steel_guardian_boots",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1000,
        materials: [ ]
    },

    {
        id: "elite_guardian_boots_recipe",
        name: "Buty elitarnego strażnika",
        resultItemId: "elite_guardian_boots",
        requiresScroll: false,
        unlockCost: 0,
        requiredCraftingLevel: 20,
        goldCost: 1600,
        materials: [],
        
    },


    {
        id: "commander_boots_recipe",
        name: "Buty dowódcy",
        resultItemId: "commander_boots",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1450,
        materials: []
    },

    {
        id: "dragon_boots_recipe",
        name: "Smocze buty",
        resultItemId: "dragon_boots",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 4800,
        materials: []
    },

    {
        id: "wolf_gloves_recipe",
        name: "Rękawice wilka",
        resultItemId: "wolf_gloves",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 65,
        materials: []
    },

    {
        id: "kobold_gloves_recipe",
        name: "Rękawice kobolda",
        resultItemId: "kobold_gloves",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 210,
        materials: []
    },

    {
        id: "guardian_gloves_recipe",
        name: "Rękawice strażnika",
        resultItemId: "guardian_gloves",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 550,
        materials: []
    },

    {
        id: "steel_guardian_gloves_recipe",
        name: "Stalowe rękawice strażnika",
        resultItemId: "steel_guardian_gloves",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1000,
        materials: []
    },

    {
        id: "elite_guardian_gloves_recipe",
        name: "Rękawice elitarnego strażnika",
        resultItemId: "elite_guardian_gloves",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1650,
        materials: []
    },

    {
        id: "commander_gloves_recipe",
        name: "Rękawice dowódcy",
        resultItemId: "commander_gloves",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1500,
        materials: []
    },

    {
        id: "dragon_gloves_recipe",
        name: "Smocze rękawice",
        resultItemId: "dragon_gloves",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 5000,
        materials: []
    },

    {
        id: "lucky_ring_recipe",
        name: "Pierścień szczęścia",
        resultItemId: "lucky_ring",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 90,
        materials: []
    },

    {
        id: "kobold_ring_recipe",
        name: "Pierścień kobolda",
        resultItemId: "kobold_ring",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 260,
        materials: []
    },

    {
        id: "guardian_ring_recipe",
        name: "Pierścień strażnika",
        resultItemId: "guardian_ring",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 700,
        materials: []
    },

    {
        id: "steel_guardian_ring_recipe",
        name: "Pierścień stalowego strażnika",
        resultItemId: "steel_guardian_ring",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 900,
        materials: []
    },

    {
        id: "elite_guardian_ring_recipe",
        name: "Pierścień elitarnego strażnika",
        resultItemId: "elite_guardian_ring",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1400,
        materials: [ ]
    },

    {
        id: "commander_ring_recipe",
        name: "Pierścień dowódcy",
        resultItemId: "commander_ring",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1900,
        materials: []
    },

    {
        id: "dragon_ring_recipe",
        name: "Smoczy pierścień",
        resultItemId: "dragon_ring",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 6200,
        materials: []
    },

    {
        id: "mana_amulet_recipe",
        name: "Amulet many",
        resultItemId: "mana_amulet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 100,
        materials: []
    },

    {
        id: "kobold_amulet_recipe",
        name: "Amulet kobolda",
        resultItemId: "kobold_amulet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 280,
        materials: []
    },

    {
        id: "guardian_amulet_recipe",
        name: "Amulet strażnika",
        resultItemId: "guardian_amulet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 760,
        materials: []
    },

    {
        id: "steel_guardian_amulet_recipe",
        name: "Amulet stalowego strażnika",
        resultItemId: "steel_guardian_amulet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 850,
        materials: []
    },

    {
        id: "elite_guardian_amulet_recipe",
        name: "Amulet elitarnego strażnika",
        resultItemId: "elite_guardian_amulet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1350,
        materials: []
    },


    {
        id: "commander_amulet_recipe",
        name: "Amulet dowódcy",
        resultItemId: "commander_amulet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 2000,
        materials: []
    },

    {
        id: "dragon_amulet_recipe",
        name: "Smoczy amulet",
        resultItemId: "dragon_amulet",
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 6500,
        materials: []
    },

    {
        id: "nature_talisman_recipe",
        name: "Talizman natury",
        resultItemId: "nature_talisman",
        requiredCraftingLevel: 1,
        craftingExp: 25,
        craftingTimeSeconds: 12,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 120,
        materials: []
    },

    {
        id: "kobold_talisman_recipe",
        name: "Talizman kobolda",
        resultItemId: "kobold_talisman",
        requiredCraftingLevel: 5,
        craftingExp: 50,
        craftingTimeSeconds: 14,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 320,
        materials: []
    },

    {
        id: "guardian_talisman_recipe",
        name: "Talizman strażnika",
        resultItemId: "guardian_talisman",
        requiredCraftingLevel: 10,
        craftingExp: 85,
        craftingTimeSeconds: 16,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 850,
        materials: []
    },

    {
        id: "steel_guardian_talisman_recipe",
        name: "Talizman stalowego strażnika",
        resultItemId: "steel_guardian_talisman",
        requiredCraftingLevel: 15,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 900,
        materials: []
    },

    {
        id: "elite_guardian_talisman_recipe",
        name: "Talizman elitarnego strażnika",
        resultItemId: "elite_guardian_talisman",
        requiredCraftingLevel: 20,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 1450,
        materials: []
    },

    {
        id: "commander_talisman_recipe",
        name: "Talizman dowódcy",
        resultItemId: "commander_talisman",
        requiredCraftingLevel: 25,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 2300,
        materials: []
    },

    {
        id: "dragon_talisman_recipe",
        name: "Smoczy talizman",
        resultItemId: "dragon_talisman",
        requiredCraftingLevel: 30,
        craftingExp: 220,
        craftingTimeSeconds: 24,
        requiresScroll: false,
        unlockCost: 0,
        goldCost: 7200,
        materials: []
    },

    // ======================================================
    // BROŃ DYSTANSOWA
    // ======================================================

    {
        id: "forest_bow_recipe",
        name: "Leśny łuk",
        subcategory: "bow",
        resultItemId: "forest_bow",
        requiredCraftingLevel: 1,
        craftingExp: 25,
        craftingTimeSeconds: 12,
        requiresScroll: false,
        unlockCost: 80,
        goldCost: 60,
        materials: [],
    },

    {
        id: "wolf_bow_recipe",
        name: "Wilczy łuk",
        subcategory: "bow",
        resultItemId: "wolf_bow",
        requiredCraftingLevel: 5,
        craftingExp: 50,
        craftingTimeSeconds: 14,
        requiresScroll: false,
        unlockCost: 250,
        goldCost: 180,
        materials: [],
    },

    {
        id: "guardian_bow_recipe",
        name: "Łuk strażnika",
        subcategory: "bow",
        resultItemId: "guardian_bow",
        requiredCraftingLevel: 10,
        craftingExp: 85,
        craftingTimeSeconds: 16,
        requiresScroll: false,
        unlockCost: 600,
        goldCost: 450,
        materials: [],
    },

    {
        id: "steel_guardian_bow_recipe",
        name: "Łuk stalowego strażnika",
        subcategory: "bow",
        resultItemId: "steel_guardian_bow",
        requiredCraftingLevel: 15,
        craftingExp: 120,
        craftingTimeSeconds: 18,
        requiresScroll: false,
        unlockCost: 900,
        goldCost: 700,
        materials: []
    },

    {
        id: "elite_guardian_bow_recipe",
        name: "Łuk elitarnego strażnika",
        subcategory: "bow",
        resultItemId: "elite_guardian_bow",
        requiredCraftingLevel: 20,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1400,
        goldCost: 1100,
        materials: []
    },

    {
        id: "shadow_bow_recipe",
        name: "Łuk cienia",
        subcategory: "bow",
        resultItemId: "shadow_bow",
        requiredCraftingLevel: 15,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1600,
        goldCost: 1200,
        materials: [],
    },

    {
        id: "dragon_bow_recipe",
        name: "Smoczy łuk",
        subcategory: "bow",
        resultItemId: "dragon_bow",
        requiredCraftingLevel: 20,
        craftingExp: 220,
        craftingTimeSeconds: 24,
        requiresScroll: false,
        unlockCost: 5000,
        goldCost: 4000,
        materials: [],
    },

    {
        id: "forest_crossbow_recipe",
        name: "Leśna kusza",
        subcategory: "crossbow",
        resultItemId: "forest_crossbow",
        requiredCraftingLevel: 1,
        craftingExp: 25,
        craftingTimeSeconds: 12,
        requiresScroll: false,
        unlockCost: 80,
        goldCost: 150,
        materials: []
    },
    {
        id: "wolf_crossbow_recipe",
        name: "Wilcza kusza",
        subcategory: "crossbow",
        resultItemId: "wolf_crossbow",
        requiredCraftingLevel: 5,
        craftingExp: 50,
        craftingTimeSeconds: 14,
        requiresScroll: false,
        unlockCost: 250,
        goldCost: 300,
        materials: []
    },
    {
        id: "guardian_crossbow_recipe",
        name: "Kusza strażnika",
        subcategory: "crossbow",
        resultItemId: "guardian_crossbow",
        requiredCraftingLevel: 10,
        craftingExp: 85,
        craftingTimeSeconds: 16,
        requiresScroll: false,
        unlockCost: 600,
        goldCost: 850,
        materials: []
    },
    {
        id: "steel_guardian_crossbow_recipe",
        name: "Kusza stalowego strażnika",
        subcategory: "crossbow",
        resultItemId: "steel_guardian_crossbow",
        requiredCraftingLevel: 15,
        craftingExp: 120,
        craftingTimeSeconds: 18,
        requiresScroll: false,
        unlockCost: 900,
        goldCost: 1800,
        materials: []
    },
    {
        id: "elite_guardian_crossbow_recipe",
        name: "Kusza elitarnego strażnika",
        subcategory: "crossbow",
        resultItemId: "elite_guardian_crossbow",
        requiredCraftingLevel: 20,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1400,
        goldCost: 4000,
        materials: []
    },
    {
        id: "shadow_crossbow_recipe",
        name: "Kusza cienia",
        subcategory: "crossbow",
        resultItemId: "shadow_crossbow",
        requiredCraftingLevel: 25,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1600,
        goldCost: 8000,
        materials: []
    },
    {
        id: "dragon_crossbow_recipe",
        name: "Smocza kusza",
        subcategory: "crossbow",
        resultItemId: "dragon_crossbow",
        requiredCraftingLevel: 30,
        craftingExp: 220,
        craftingTimeSeconds: 24,
        requiresScroll: false,
        unlockCost: 5000,
        goldCost: 14000,
        materials: []
    },

    // ======================================================
    // BROŃ MAGICZNA
    // ======================================================

    {
        id: "nature_staff_recipe",
        name: "Kostur natury",
        subcategory: "staff",
        resultItemId: "nature_staff",
        requiredCraftingLevel: 1,
        craftingExp: 25,
        craftingTimeSeconds: 12,
        requiresScroll: false,
        unlockCost: 80,
        goldCost: 60,
        materials: [],
    },


    {
        id: "crystal_staff_recipe",
        name: "Kryształowy kostur",
        subcategory: "staff",
        resultItemId: "crystal_staff",
        requiredCraftingLevel: 5,
        craftingExp: 50,
        craftingTimeSeconds: 14,
        requiresScroll: false,
        unlockCost: 250,
        goldCost: 180,
        materials: []
    },

    {
        id: "guardian_staff_recipe",
        name: "Kostur strażnika",
        subcategory: "staff",
        resultItemId: "guardian_staff",
        requiredCraftingLevel: 10,
        craftingExp: 85,
        craftingTimeSeconds: 16,
        requiresScroll: false,
        unlockCost: 600,
        goldCost: 450,
        materials: []
    },

    {
        id: "guardian_arcane_staff_recipe",
        name: "Kostur arkanicznego strażnika",
        subcategory: "staff",
        resultItemId: "guardian_arcane_staff",
        requiredCraftingLevel: 15,
        craftingExp: 120,
        craftingTimeSeconds: 18,
        requiresScroll: false,
        unlockCost: 900,
        goldCost: 700,
        materials: []
    },



    {
        id: "frost_giant_staff_recipe",
        name: "Kostur lodowego giganta",
        subcategory: "staff",
        resultItemId: "frost_giant_staff",
        requiredCraftingLevel: 20,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1400,
        goldCost: 1100,
    },


    {
        id: "shadow_staff_recipe",
        name: "Kostur cienia",
        subcategory: "staff",
        resultItemId: "shadow_staff",
        requiredCraftingLevel: 25,
        craftingExp: 140,
        craftingTimeSeconds: 25,
        requiresScroll: false,
        unlockCost: 1600,
        goldCost: 1200,
        materials: [],
    },

    {
        id: "volcanic_staff_recipe",
        name: "Wulkaniczny kostur",
        subcategory: "staff",
        resultItemId: "volcanic_staff",
        requiredCraftingLevel: 30,
        craftingExp: 220,
        craftingTimeSeconds: 24,
        requiresScroll: false,
        unlockCost: 5000,
        goldCost: 4000,
        materials: [],
    },
    {
        id: "nature_wand_recipe",
        name: "Różdżka natury",
        subcategory: "wand",
        resultItemId: "nature_wand",
        requiredCraftingLevel: 1,
        craftingExp: 25,
        craftingTimeSeconds: 12,
        requiresScroll: false,
        unlockCost: 80,
        goldCost: 60,
        materials: [],
    },

    {
        id: "crystal_wand_recipe",
        name: "Kryształowa różdżka",
        subcategory: "wand",
        resultItemId: "crystal_wand",
        requiredCraftingLevel: 5,
        craftingExp: 50,
        craftingTimeSeconds: 14,
        requiresScroll: false,
        unlockCost: 250,
        goldCost: 180,
        materials: [],
    },


    {
        id: "guardian_wand_recipe",
        name: "Różdżka strażnika",
        subcategory: "wand",
        resultItemId: "guardian_wand",
        requiredCraftingLevel: 10,
        craftingExp: 85,
        craftingTimeSeconds: 16,
        requiresScroll: false,
        unlockCost: 600,
        goldCost: 450,
        materials: [],
    },


    {
        id: "shadow_wand_recipe",
        name: "Różdżka cienia",
        subcategory: "wand",
        resultItemId: "shadow_wand",
        requiredCraftingLevel: 15,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1600,
        goldCost: 1200,
        materials: [],
    },

    {
        id: "elite_guardian_wand_recipe",
        name: "Różdżka elitarnego strażnika",
        subcategory: "wand",
        resultItemId: "elite_guardian_wand",
        requiredCraftingLevel: 20,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1400,
        goldCost: 1100,
        materials: []
    },

    {
        id: "commander_wand_recipe",
        name: "Różdżka dowódcy",
        subcategory: "wand",
        resultItemId: "commander_wand",
        requiredCraftingLevel: 25,
        craftingExp: 140,
        craftingTimeSeconds: 20,
        requiresScroll: false,
        unlockCost: 1600,
        goldCost: 1200,
        materials: [],
    },

    {
        id: "dragon_wand_recipe",
        name: "Smocza różdżka",
        subcategory: "wand",
        resultItemId: "dragon_wand",
        requiredCraftingLevel: 30,
        craftingExp: 220,
        craftingTimeSeconds: 24,
        requiresScroll: false,
        unlockCost: 5000,
        goldCost: 4000,
        materials: [],
    },


    ...professionToolUpgradeRecipes


];

const armorerTierSettings = {
    1: {
        requiredCraftingLevel: 1,
        craftingExp: 25,
        craftingTimeSeconds: 12,
        ingotId: "copper_ingot",
    },

    10: {
        requiredCraftingLevel: 5,
        craftingExp: 50,
        craftingTimeSeconds: 14,
        ingotId: "bronze_ingot",
    },

    20: {
        requiredCraftingLevel: 10,
        craftingExp: 85,
        craftingTimeSeconds: 16,
        ingotId: "iron_ingot",
    },

    25: {
        requiredCraftingLevel: 15,
        craftingExp: 120,
        craftingTimeSeconds: 18,
        ingotId: "platinum_ingot",
    },

    30: {
        requiredCraftingLevel: 20,
        craftingExp: 170,
        craftingTimeSeconds: 22,
        ingotId: "mithril_ingot",
    },

    40: {
        requiredCraftingLevel: 25,
        craftingExp: 220,
        craftingTimeSeconds: 24,
        ingotId: "adamantite_ingot",
    },

    50: {
        requiredCraftingLevel: 30,
        craftingExp: 280,
        craftingTimeSeconds: 28,
        ingotId: "dragonsteel_ingot",
    },
};

const armorerIngotQuantityByType = {
    shield: 2,
    helmet: 2,
    armor: 4,
    pants: 3,
    boots: 2,
    gloves: 2,
};

recipes.forEach((recipe) => {
    const resultItem =
        items[recipe.resultItemId];

    if (!resultItem) {
        return;
    }

    const ingotQuantity =
        armorerIngotQuantityByType[
        resultItem.type
        ];

    /*
     * Jeśli typ przedmiotu nie znajduje
     * się na liście Płatnerza,
     * pozostawiamy recepturę bez zmian.
     */
    if (!ingotQuantity) {
        return;
    }

    const tierSettings =
        armorerTierSettings[
        resultItem.requiredLevel
        ];

    if (!tierSettings) {
        return;
    }

    recipe.requiredCraftingLevel =
        tierSettings.requiredCraftingLevel;

    recipe.craftingExp =
        tierSettings.craftingExp;

    recipe.craftingTimeSeconds =
        tierSettings.craftingTimeSeconds;

    /*
     * Stara moneta jest łupem na sprzedaż,
     * dlatego usuwamy ją z receptur.
     */
    recipe.materials =
        recipe.materials.filter(
            (material) => {
                return (
                    material.itemId !==
                    "old_coin"
                );
            },
        );

    const alreadyHasIngot =
        recipe.materials.some(
            (material) => {
                return (
                    material.itemId ===
                    tierSettings.ingotId
                );
            },
        );

    if (!alreadyHasIngot) {
        recipe.materials.push({
            itemId:
                tierSettings.ingotId,

            quantity:
                ingotQuantity,
        });
    }
});

const armorerLocationMaterialsByTier = {
    40: {
        shield: [
            {
                itemId: "frost_giant_shard",
                quantity: 2
            },
            {
                itemId: "frozen_chain",
                quantity: 2
            }
        ],

        helmet: [
            {
                itemId: "frozen_bone",
                quantity: 2
            },
            {
                itemId: "frost_essence",
                quantity: 2
            }
        ],

        armor: [
            {
                itemId: "tanned_ice_wolf_leather",
                quantity: 2
            },
            {
                itemId: "frozen_chain",
                quantity: 2
            }
        ],

        pants: [
            {
                itemId: "tanned_ice_wolf_leather",
                quantity: 2
            },
            {
                itemId: "frozen_bone",
                quantity: 2
            }
        ],

        boots: [
            {
                itemId: "tanned_ice_wolf_leather",
                quantity: 2
            },
            {
                itemId: "frost_essence",
                quantity: 2
            }
        ],

        gloves: [
            {
                itemId: "frozen_chain",
                quantity: 2
            },
            {
                itemId: "frost_giant_shard",
                quantity: 2
            }
        ]
    },



    50: {
        shield: [
            {
                itemId: "obsidian_shard",
                quantity: 2
            },
            {
                itemId: "magma_golem_plate",
                quantity: 2
            }
        ],

        helmet: [
            {
                itemId: "charred_bone",
                quantity: 2
            },
            {
                itemId: "ember_essence",
                quantity: 2
            }
        ],

        armor: [
            {
                itemId: "magma_golem_plate",
                quantity: 2
            },
            {
                itemId: "magma_core",
                quantity: 2
            }
        ],

        pants: [
            {
                itemId: "tanned_lava_hound_leather",
                quantity: 2
            },
            {
                itemId: "charred_bone",
                quantity: 2
            }
        ],

        boots: [
            {
                itemId: "tanned_lava_hound_leather",
                quantity: 2
            },
            {
                itemId: "ember_essence",
                quantity: 2
            }
        ],

        gloves: [
            {
                itemId: "obsidian_shard",
                quantity: 2
            },
            {
                itemId: "magma_golem_plate",
                quantity: 2
            }
        ]
    }


};


const armorerPreviousLocationMaterialsByTier = {
    40: {
        shield: [
            {
                itemId: "stone_core",
                quantity: 2
            },
            {
                itemId: "cave_crystal",
                quantity: 2
            }
        ],

        helmet: [
            {
                itemId: "stone_core",
                quantity: 2
            },
            {
                itemId: "cave_crystal",
                quantity: 2
            }
        ],

        armor: [
            {
                itemId: "stone_core",
                quantity: 2
            },
            {
                itemId: "cave_crystal",
                quantity: 2
            }
        ],

        pants: [
            {
                itemId: "stone_core",
                quantity: 2
            },
            {
                itemId: "cave_crystal",
                quantity: 2
            }
        ],

        boots: [
            {
                itemId: "stone_core",
                quantity: 2
            },
            {
                itemId: "cave_crystal",
                quantity: 2
            }
        ],

        gloves: [
            {
                itemId: "stone_core",
                quantity: 2
            },
            {
                itemId: "cave_crystal",
                quantity: 2
            }
        ]
    },

    50: {
        shield: [
            {
                itemId: "frost_giant_shard",
                quantity: 2
            },
            {
                itemId: "frozen_chain",
                quantity: 2
            }
        ],

        helmet: [
            {
                itemId: "frozen_bone",
                quantity: 2
            },
            {
                itemId: "frost_essence",
                quantity: 2
            }
        ],

        armor: [
            {
                itemId: "tanned_ice_wolf_leather",
                quantity: 2
            },
            {
                itemId: "frozen_chain",
                quantity: 2
            }
        ],

        pants: [
            {
                itemId: "tanned_ice_wolf_leather",
                quantity: 2
            },
            {
                itemId: "frozen_bone",
                quantity: 2
            }
        ],

        boots: [
            {
                itemId: "tanned_ice_wolf_leather",
                quantity: 2
            },
            {
                itemId: "frost_essence",
                quantity: 2
            }
        ],

        gloves: [
            {
                itemId: "frozen_chain",
                quantity: 2
            },
            {
                itemId: "frost_giant_shard",
                quantity: 2
            }
        ]
    }
};

recipes.forEach(recipe => {
    const resultItem =
        items[recipe.resultItemId];

    if (!resultItem) {
        return;
    }

    // Clean old late-tier materials from Commander and Dragon recipes
    if (
        resultItem.id.startsWith("commander_") ||
        resultItem.id.startsWith("dragon_")
    ) {
        const obsoleteLateTierMaterials = new Set([
            "kobold_crown_fragment",
            "stone_core",
            "cave_crystal",
            "old_coin"
        ]);

        recipe.materials = recipe.materials.filter(material => {
            return !obsoleteLateTierMaterials.has(material.itemId);
        });
    }

    const tierMaterials =
        armorerLocationMaterialsByTier[
        resultItem.requiredLevel
        ]?.[resultItem.type];

    if (!tierMaterials) {
        return;
    }

    const previousTierMaterials =
        armorerPreviousLocationMaterialsByTier[
        resultItem.requiredLevel
        ]?.[resultItem.type];

    if (previousTierMaterials) {
        previousTierMaterials.forEach(requiredMaterial => {
            const existingMaterial = recipe.materials.find(
                material =>
                    material.itemId === requiredMaterial.itemId
            );

            if (existingMaterial) {
                existingMaterial.quantity =
                    Math.max(
                        existingMaterial.quantity,
                        requiredMaterial.quantity
                    );
            } else {
                recipe.materials.push({
                    ...requiredMaterial
                });
            }
        });
    }

    tierMaterials.forEach(
        requiredMaterial => {
            const existingMaterial =
                recipe.materials.find(
                    material => {
                        return (
                            material.itemId ===
                            requiredMaterial.itemId
                        );
                    }
                );

            if (existingMaterial) {
                existingMaterial.quantity =
                    Math.max(
                        existingMaterial.quantity,
                        requiredMaterial.quantity
                    );

                return;
            }

            recipe.materials.push({
                ...requiredMaterial
            });
        }
    );

    let bossMaterialId = null;

    if (
        resultItem.id.startsWith(
            "commander_"
        )
    ) {
        bossMaterialId =
            "frost_crown_fragment";
    }

    if (
        resultItem.id.startsWith(
            "dragon_"
        )
    ) {
        bossMaterialId =
            "volcanic_heart_fragment";
    }

    if (
        bossMaterialId &&
        !recipe.materials.some(
            material =>
                material.itemId ===
                bossMaterialId
        )
    ) {
        recipe.materials.push({
            itemId: bossMaterialId,
            quantity: 1
        });
    }
});

const jewelerTierSettings = {
    1: {
        requiredCraftingLevel: 1,
        craftingExp: 25,
        craftingTimeSeconds: 12,
        ingotId: "tin_ingot",
        gemId: "quartz",
    },

    10: {
        requiredCraftingLevel: 5,
        craftingExp: 50,
        craftingTimeSeconds: 14,
        ingotId: "silver_ingot",
        gemId: "amethyst",
    },

    20: {
        requiredCraftingLevel: 10,
        craftingExp: 85,
        craftingTimeSeconds: 16,
        ingotId: "gold_ingot",
        gemId: "sapphire",
    },

    25: {
        requiredCraftingLevel: 15,
        craftingExp: 120,
        craftingTimeSeconds: 18,
        ingotId: "platinum_ingot",
        gemId: "ruby",
    },

    30: {
        requiredCraftingLevel: 20,
        craftingExp: 170,
        craftingTimeSeconds: 22,
        ingotId: "mithril_ingot",
        gemId: "ruby",
    },

    40: {
        requiredCraftingLevel: 25,
        craftingExp: 220,
        craftingTimeSeconds: 24,
        ingotId: "adamantite_ingot",
        gemId: "diamond",
    },

    50: {
        requiredCraftingLevel: 30,
        craftingExp: 280,
        craftingTimeSeconds: 28,
        ingotId: "dragonsteel_ingot",
        gemId: "diamond",
    },
};

const jewelerIngotQuantityByType = {
    ring: 1,
    amulet: 2,
};

recipes.forEach((recipe) => {
    const resultItem =
        items[recipe.resultItemId];

    if (!resultItem) {
        return;
    }

    const ingotQuantity =
        jewelerIngotQuantityByType[
        resultItem.type
        ];

    /*
     * Pozostałe rodzaje przedmiotów
     * nie należą do Jubilera.
     */
    if (!ingotQuantity) {
        return;
    }

    const tierSettings =
        jewelerTierSettings[
        resultItem.requiredLevel
        ];

    if (!tierSettings) {
        return;
    }

    recipe.requiredCraftingLevel =
        tierSettings.requiredCraftingLevel;

    recipe.craftingExp =
        tierSettings.craftingExp;

    recipe.craftingTimeSeconds =
        tierSettings.craftingTimeSeconds;

    /*
     * Usuwamy stare, powtarzające się
     * składniki biżuterii.
     */
    recipe.materials =
        recipe.materials.filter(
            (material) => {
                return (
                    material.itemId !==
                    "old_coin" &&
                    material.itemId !==
                    "cave_crystal"
                );
            },
        );

    const newMaterials = [
        {
            itemId: tierSettings.ingotId,
            quantity: ingotQuantity,
        },
        {
            itemId: tierSettings.gemId,
            quantity: 1,
        },
    ];

    newMaterials.forEach(
        (newMaterial) => {
            const alreadyExists =
                recipe.materials.some(
                    (material) => {
                        return (
                            material.itemId ===
                            newMaterial.itemId
                        );
                    },
                );

            if (!alreadyExists) {
                recipe.materials.push(
                    newMaterial,
                );
            }
        },
    );
});

const jewelryLocationMaterialsByTier = {
    30: {
        ring: [
            {
                itemId: "frost_essence",
                quantity: 3
            },
            {
                itemId:
                    "ice_elemental_core",
                quantity: 1
            }
        ],

        amulet: [
            {
                itemId: "frozen_chain",
                quantity: 2
            },
            {
                itemId:
                    "ice_elemental_core",
                quantity: 1
            }
        ],

        talisman: [
            {
                itemId: "frozen_bone",
                quantity: 3
            },
            {
                itemId: "frost_essence",
                quantity: 4
            },
            {
                itemId:
                    "frost_giant_shard",
                quantity: 1
            }
        ]
    },
    40: {
        ring: [
            {
                itemId: "frost_essence",
                quantity: 5
            },
            {
                itemId: "ice_elemental_core",
                quantity: 2
            }
        ],

        amulet: [
            {
                itemId: "frozen_chain",
                quantity: 4
            },
            {
                itemId: "ice_elemental_core",
                quantity: 2
            }
        ],

        talisman: [
            {
                itemId: "frozen_bone",
                quantity: 5
            },
            {
                itemId: "frost_essence",
                quantity: 6
            },
            {
                itemId: "frost_giant_shard",
                quantity: 2
            }
        ]
    },

    50: {
        ring: [
            {
                itemId: "ember_essence",
                quantity: 3
            },
            {
                itemId: "magma_core",
                quantity: 1
            }
        ],

        amulet: [
            {
                itemId: "obsidian_shard",
                quantity: 2
            },
            {
                itemId: "magma_core",
                quantity: 1
            }
        ],

        talisman: [
            {
                itemId: "charred_bone",
                quantity: 3
            },
            {
                itemId: "ember_essence",
                quantity: 5
            },
            {
                itemId: "magma_core",
                quantity: 1
            }
        ]
    }
};



const jewelryPreviousLocationMaterialsByTier = {
    40: {
        ring: [
            { itemId: "stone_core", quantity: 2 },
            { itemId: "cave_crystal", quantity: 2 }
        ],
        amulet: [
            { itemId: "stone_core", quantity: 2 },
            { itemId: "cave_crystal", quantity: 2 }
        ]
    },

    50: {
        ring: [
            { itemId: "frost_giant_shard", quantity: 3 },
            { itemId: "frozen_chain", quantity: 3 }
        ],
        amulet: [
            { itemId: "frost_giant_shard", quantity: 3 },
            { itemId: "frozen_chain", quantity: 3 }
        ]
    }
};

const obsoleteLateJewelryMaterials =
    new Set([
        "kobold_crown_fragment",
        "old_coin",
        "obsidian",
        "earth_core_shard",
        "burning_crystal"
    ]);

recipes.forEach(recipe => {
    const resultItem =
        items[recipe.resultItemId];

    if (!resultItem) {
        return;
    }

    const tierMaterials =
        jewelryLocationMaterialsByTier[
        resultItem.requiredLevel
        ]?.[resultItem.type];

    if (!tierMaterials) {
        return;
    }
    const jewelryPreviousTierMaterials =
        jewelryPreviousLocationMaterialsByTier[
        resultItem.requiredLevel
        ]?.[resultItem.type];

    if (jewelryPreviousTierMaterials) {
        jewelryPreviousTierMaterials.forEach(requiredMaterial => {
            const existingMaterial = recipe.materials.find(
                material =>
                    material.itemId === requiredMaterial.itemId
            );

            if (existingMaterial) {
                existingMaterial.quantity =
                    Math.max(
                        existingMaterial.quantity,
                        requiredMaterial.quantity
                    );

                return;
            }

            recipe.materials.push({
                ...requiredMaterial
            });
        });
    }

    if (
        resultItem.id.startsWith("commander_") ||
        resultItem.id.startsWith("dragon_")
    ) {

        const obsoleteLateEquipmentMaterials = new Set([
            "kobold_crown_fragment",
            "old_coin"
        ]);

        recipe.materials =
            recipe.materials.filter(material => {
                return !obsoleteLateEquipmentMaterials.has(
                    material.itemId
                );
            });
    }

    recipe.materials =
        recipe.materials.filter(
            material => {
                return (
                    !obsoleteLateJewelryMaterials
                        .has(
                            material.itemId
                        )
                );
            }
        );

    tierMaterials.forEach(
        requiredMaterial => {
            const existingMaterial =
                recipe.materials.find(
                    material => {
                        return (
                            material.itemId ===
                            requiredMaterial.itemId
                        );
                    }
                );

            if (existingMaterial) {
                existingMaterial.quantity =
                    Math.max(
                        existingMaterial.quantity,
                        requiredMaterial.quantity
                    );

                return;
            }

            recipe.materials.push({
                ...requiredMaterial
            });
        }
    );

    let bossMaterialId = null;

    if (
        resultItem.id.startsWith(
            "commander_"
        )
    ) {
        bossMaterialId =
            "frost_crown_fragment";
    }

    if (
        resultItem.id.startsWith(
            "dragon_"
        )
    ) {
        bossMaterialId =
            "volcanic_heart_fragment";
    }

    if (
        bossMaterialId &&
        !recipe.materials.some(
            material =>
                material.itemId ===
                bossMaterialId
        )
    ) {
        recipe.materials.push({
            itemId: bossMaterialId,
            quantity: 1
        });
    }
});

const blacksmithWhetstoneRequirements = {
    forest_blade_recipe: 1,
    cave_sword_recipe: 1,
    guardian_blade_recipe: 2,
    steel_guardian_sword_recipe: 2,
    elite_guardian_blade: 3,
    commander_sword_recipe: 3,
    dragon_blade_recipe: 4,
};

recipes.forEach(recipe => {
    const requiredQuantity =
        blacksmithWhetstoneRequirements[
        recipe.id
        ];

    if (!requiredQuantity) {
        return;
    }

    const alreadyHasWhetstone =
        recipe.materials.some(
            material =>
                material.itemId ===
                "whetstone"
        );

    if (alreadyHasWhetstone) {
        return;
    }

    recipe.materials.push({
        itemId: "whetstone",
        quantity: requiredQuantity
    });
});

// ======================================================
// EKSPERCKIE I MISTRZOWSKIE ULEPSZENIA EKWIPUNKU
// ======================================================

const lateEquipmentUpgradeSettings = {

};


recipes.forEach(recipe => {

    const equipmentRecipe =
        equipmentCraftRecipes[
        recipe.resultItemId
        ];

    if (!equipmentRecipe) {
        return;
    }

    recipe.materials =
        equipmentRecipe.materials.map(material => ({
            ...material
        }));

});

const upgradableEquipmentTypes = new Set([
    "weapon",
    "shield",
    "helmet",
    "armor",
    "pants",
    "boots",
    "gloves",
    "ring",
    "amulet",
    "talisman"
]);

recipes.forEach(recipe => {
    const resultItem = items[recipe.resultItemId];
    const settings = lateEquipmentUpgradeSettings[
        resultItem?.requiredLevel
    ];

    if (
        !resultItem ||
        !settings ||
        !upgradableEquipmentTypes.has(resultItem.type)
    ) {
        return;
    }

    const sourceMaterial = recipe.materials.find(material => {
        const materialItem = items[material.itemId];

        if (!materialItem) {
            return false;
        }

        if (resultItem.type === "weapon") {
            return materialItem.type === "weapon";
        }

        return materialItem.type === resultItem.type;
    });

    if (!sourceMaterial) {
        return;
    }

    const materialKey = resultItem.type === "weapon"
        ? "weapon:" + resultItem.weaponType
        : resultItem.type;
    const upgradeMaterials = settings.materials[materialKey];

    if (!upgradeMaterials) {
        return;
    }

    recipe.requiredCraftingLevel =
        settings.requiredCraftingLevel;
    recipe.craftingExp = settings.craftingExp;
    recipe.craftingTimeSeconds =
        settings.craftingTimeSeconds;
    recipe.goldCost = Math.max(
        Number(recipe.goldCost) || 0,
        settings.goldCosts[resultItem.type] || 0
    );
    recipe.upgradeFromItemId =
        sourceMaterial.itemId;
    recipe.equipmentUpgradeRank =
        settings.rank;
    recipe.equipmentUpgradeRankLabel =
        settings.rankLabel;
    const armorerEquipmentTypes = new Set([
        "shield",
        "helmet",
        "armor",
        "pants",
        "boots",
        "gloves"
    ]);

    if (armorerEquipmentTypes.has(resultItem.type)) {
        const currentLocationMaterials =
            armorerLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        const previousLocationMaterials =
            armorerPreviousLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        recipe.materials = [
            {
                itemId: sourceMaterial.itemId,
                quantity: 1
            },
            ...previousLocationMaterials.map(material => ({
                ...material
            })),
            ...currentLocationMaterials.map(material => ({
                ...material
            })),
            {
                itemId: settings.bossMaterialId,
                quantity: 1
            }
        ];
    } else if (
        resultItem.type === "shield" ||
        resultItem.type === "helmet" ||
        resultItem.type === "armor" ||
        resultItem.type === "pants" ||
        resultItem.type === "boots" ||
        resultItem.type === "gloves"
    ) {
        const currentLocationMaterials =
            armorerLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        const previousLocationMaterials =
            armorerPreviousLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        recipe.materials = [
            {
                itemId: sourceMaterial.itemId,
                quantity: 1
            },
            ...previousLocationMaterials.map(material => ({
                ...material
            })),
            ...currentLocationMaterials.map(material => ({
                ...material
            })),
            {
                itemId: settings.bossMaterialId,
                quantity: 1
            }
        ];
    } else if (
        resultItem.type === "shield" ||
        resultItem.type === "helmet" ||
        resultItem.type === "armor" ||
        resultItem.type === "pants" ||
        resultItem.type === "boots" ||
        resultItem.type === "gloves"
    ) {
        const currentLocationMaterials =
            armorerLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        const previousLocationMaterials =
            armorerPreviousLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        recipe.materials = [
            {
                itemId: sourceMaterial.itemId,
                quantity: 1
            },
            ...previousLocationMaterials.map(material => ({
                ...material
            })),
            ...currentLocationMaterials.map(material => ({
                ...material
            })),
            {
                itemId: settings.bossMaterialId,
                quantity: 1
            }
        ];
    } else if (
        resultItem.type === "shield" ||
        resultItem.type === "helmet" ||
        resultItem.type === "armor" ||
        resultItem.type === "pants" ||
        resultItem.type === "boots" ||
        resultItem.type === "gloves"
    ) {
        const currentLocationMaterials =
            armorerLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        const previousLocationMaterials =
            armorerPreviousLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        recipe.materials = [
            {
                itemId: sourceMaterial.itemId,
                quantity: 1
            },
            ...upgradeMaterials.map(material => ({
                ...material
            })),
            ...previousLocationMaterials.map(material => ({
                ...material
            })),
            ...currentLocationMaterials.map(material => ({
                ...material
            })),
            {
                itemId: settings.bossMaterialId,
                quantity: 1
            }
        ];
    } else if (
        resultItem.type === "ring" ||
        resultItem.type === "amulet"
    ) {
        const currentLocationMaterials =
            jewelryLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        const previousLocationMaterials =
            jewelryPreviousLocationMaterialsByTier[
            resultItem.requiredLevel
            ]?.[resultItem.type] || [];

        recipe.materials = [
            {
                itemId: sourceMaterial.itemId,
                quantity: 1
            },
            ...previousLocationMaterials.map(material => ({
                ...material
            })),
            ...currentLocationMaterials.map(material => ({
                ...material
            })),
            {
                itemId: settings.bossMaterialId,
                quantity: 1
            }
        ];
    } else {
        recipe.materials = [
            {
                itemId: sourceMaterial.itemId,
                quantity: 1
            },
            ...upgradeMaterials.map(material => ({
                ...material
            })),
            {
                itemId: settings.bossMaterialId,
                quantity: 1
            }
        ];
    }
});

const equipmentUpgradePresentationByLevel = {
    1: {
        rank: "basic",
        rankLabel: "Podstawowe ulepszenie"
    },
    10: {
        rank: "improved",
        rankLabel: "Ulepszone uzbrojenie"
    },
    20: {
        rank: "advanced",
        rankLabel: "Zaawansowane ulepszenie"
    },
    40: {
        rank: "expert",
        rankLabel: "Eksperckie ulepszenie"
    },
    50: {
        rank: "master",
        rankLabel: "Mistrzowskie ulepszenie"
    }
};

const equipmentUpgradePresentationTypes =
    new Set([
        "weapon",
        "shield",
        "helmet",
        "armor",
        "pants",
        "boots",
        "gloves",
        "ring",
        "amulet",
        "talisman"
    ]);

recipes.forEach(recipe => {
    const resultItem = items[recipe.resultItemId];

    if (
        !resultItem ||
        !equipmentUpgradePresentationTypes
            .has(resultItem.type)
    ) {
        return;
    }

    const sourceMaterial = recipe.materials.find(material => {
        const materialItem = items[material.itemId];

        if (!materialItem) {
            return false;
        }

        if (resultItem.type === "weapon") {
            return materialItem.type === "weapon";
        }

        return materialItem.type === resultItem.type;
    });

    if (!sourceMaterial) {
        return;
    }

    const presentation = recipe.requiresScroll
        ? {
            rank: "special",
            rankLabel: "Specjalne ulepszenie"
        }
        : equipmentUpgradePresentationByLevel[
        resultItem.requiredLevel
        ] || {
            rank: "special",
            rankLabel: "Specjalne ulepszenie"
        };

    recipe.upgradeFromItemId =
        recipe.upgradeFromItemId ||
        sourceMaterial.itemId;
    recipe.equipmentUpgradeRank =
        recipe.equipmentUpgradeRank ||
        presentation.rank;
    recipe.equipmentUpgradeRankLabel =
        recipe.equipmentUpgradeRankLabel ||
        presentation.rankLabel;
});

const eliteGuardianBootsRecipe = recipes.find(
    recipe => recipe.id === "elite_guardian_boots_recipe"
);