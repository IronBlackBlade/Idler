window.craftingMaterialRecipes = [
  // ========================================
  // PRZETWARZANIE MATERIAŁÓW
  // ========================================

  {
    id: "copper_ingot_recipe",
    name: "Sztabka miedzi",

    category: "materials",
    subcategory: "metallurgy",

    resultItemId: "copper_ingot",
    tier: 1,
    requiredCraftingLevel: 1,
    craftingExp: 10,
    craftingTimeSeconds: 10,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "copper_ore",
        quantity: 3,
      },
      {
        itemId: "coal",
        quantity: 1,
      },
    ],
  },

  {
    id: "tin_ingot_recipe",
    tier: 1,
    name: "Sztabka cyny",

    category: "materials",
    subcategory: "metallurgy",

    resultItemId: "tin_ingot",
    requiredCraftingLevel: 2,
    craftingExp: 15,
    craftingTimeSeconds: 10,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "tin_ore",
        quantity: 3,
      },
      {
        itemId: "coal",
        quantity: 1,
      },
    ],
  },

  {
    id: "iron_ingot_recipe",
    tier: 1,
    name: "Sztabka żelaza",

    category: "materials",
    subcategory: "metallurgy",

    resultItemId: "iron_ingot",
    requiredCraftingLevel: 3,
    craftingExp: 20,
    craftingTimeSeconds: 10,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "iron_ore",
        quantity: 3,
      },
      {
        itemId: "coal",
        quantity: 1,
      },
    ],
  },
  {
    id: "bronze_ingot_recipe",
    tier: 1,
    name: "Sztabka brązu",

    category: "materials",
    subcategory: "metallurgy",

    resultItemId: "bronze_ingot",
    requiredCraftingLevel: 4,
    craftingExp: 25,
    craftingTimeSeconds: 10,
    resultQuantity: 2,

    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "copper_ingot",
        quantity: 2,
      },
      {
        itemId: "tin_ingot",
        quantity: 1,
      },
    ],
  },
  {
    id: "silver_ingot_recipe",
    tier: 1,
    name: "Sztabka srebra",

    category: "materials",
    subcategory: "metallurgy",

    resultItemId: "silver_ingot",

    requiredCraftingLevel: 5,
    craftingExp: 30,
    craftingTimeSeconds: 12,

    requiresScroll: false,
    unlockCost: 0,

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
    tier: 2,
    requiredCraftingLevel: 10,
    craftingExp: 45,
    craftingTimeSeconds: 14,

    requiresScroll: false,
    unlockCost: 0,

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
    tier: 2,
    requiredCraftingLevel: 15,
    craftingExp: 70,
    craftingTimeSeconds: 16,

    requiresScroll: false,
    unlockCost: 0,

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
    tier: 3,
    requiredCraftingLevel: 20,
    craftingExp: 100,
    craftingTimeSeconds: 20,

    requiresScroll: false,
    unlockCost: 0,

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
    tier: 5,
    requiredCraftingLevel: 35,
    craftingExp: 320,
    craftingTimeSeconds: 36,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "adamantite_ore",
        quantity: 3,
      },
      {
        itemId: "runic_stone",
        quantity: 1,
      },
      {
        itemId: "deep_coal",
        quantity: 1,
      },
    ],
  },

  {
    id: "dragonsteel_ingot_recipe",
    name: "Sztabka smoczej stali",
    category: "materials",
    subcategory: "metallurgy",
    resultItemId: "dragonsteel_ingot",
    tier: 7,
    requiredCraftingLevel: 50,
    craftingExp: 600,
    craftingTimeSeconds: 48,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "dragonsteel_ore",
        quantity: 3,
      },
      {
        itemId: "titan_stone",
        quantity: 1,
      },
      {
        itemId: "deep_coal",
        quantity: 2,
      },
    ],
  },

  {
    id: "tanned_sheep_leather_recipe",
    name: "Garbowana skóra owcza",

    category: "materials",
    subcategory: "tanner",
    resultItemId: "tanned_sheep_leather",
    tier: 1,
    requiredCraftingLevel: 1,
    craftingExp: 10,
    craftingTimeSeconds: 10,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "sheep_skin",
        quantity: 2,
      },
    ],
  },

  {
    id: "wool_cloth_recipe",
    name: "Tkanina wełniana",

    category: "materials",
    subcategory: "tanner",
    resultItemId: "wool_cloth",
    tier: 1,
    requiredCraftingLevel: 3,
    craftingExp: 15,
    craftingTimeSeconds: 12,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "wool",
        quantity: 3,
      },
    ],
  },

  {
    id: "tanned_wolf_leather_recipe",
    name: "Garbowana wilcza skóra",

    category: "materials",
    subcategory: "tanner",
    resultItemId: "tanned_wolf_leather",
    tier: 1,
    requiredCraftingLevel: 5,
    craftingExp: 20,
    craftingTimeSeconds: 15,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "wolf_fur",
        quantity: 2,
      },
    ],
  },

  {
    id: "tanned_ice_wolf_leather_recipe",
    name: "Garbowana skóra lodowego wilka",
    category: "materials",
    subcategory: "tanner",
    resultItemId: "tanned_ice_wolf_leather",
    tier: 2,
    requiredCraftingLevel: 20,
    craftingExp: 260,
    craftingTimeSeconds: 30,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "ice_wolf_fur",
        quantity: 2,
      },
    ],
  },

  {
    id: "tanned_lava_hound_leather_recipe",
    name: "Garbowana skóra ogara lawy",
    category: "materials",
    subcategory: "tanner",
    resultItemId: "tanned_lava_hound_leather",
    tier: 5,
    requiredCraftingLevel: 35,
    craftingExp: 480,
    craftingTimeSeconds: 42,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "lava_hound_hide",
        quantity: 2,
      },
    ],
  },

  {
    id: "chitin_plate_recipe",
    name: "Płyta chitynowa",

    category: "materials",
    subcategory: "armorer",

    resultItemId: "chitin_plate",
    tier: 1,
    requiredCraftingLevel: 1,
    craftingExp: 10,
    craftingTimeSeconds: 10,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "beetle_shell",
        quantity: 3,
      },
    ],
  },

  {
    id: "ancient_chitin_plate_recipe",
    name: "Pradawna płyta chitynowa",

    category: "materials",
    subcategory: "armorer",

    resultItemId: "ancient_chitin_plate",
    tier: 2,
    requiredCraftingLevel: 15,
    craftingExp: 50,
    craftingTimeSeconds: 16,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "ancient_chitin",
        quantity: 3,
      },
    ],
  },

  {
    id: "void_plate_recipe",
    name: "Płyta z materii pustki",
    category: "materials",
    subcategory: "armorer",
    resultItemId: "void_plate",
    tier: 6,
    requiredCraftingLevel: 40,
    craftingExp: 900,
    craftingTimeSeconds: 60,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "void_armor_fragment",
        quantity: 3,
      },
      {
        itemId: "dark_matter",
        quantity: 1,
      },
    ],
  },

  {
    id: "deep_scale_plate_recipe",
    name: "Płyta z łusek głebinowców",
    category: "materials",
    subcategory: "armorer",
    resultItemId: "deep_scale_plate",
    tier: 7,
    requiredCraftingLevel: 50,
    craftingExp: 1250,
    craftingTimeSeconds: 72,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "deep_scale",
        quantity: 3,
      },
      {
        itemId: "coral_heart",
        quantity: 1,
      },
    ],
  },

  {
    id: "prismatic_plate_recipe",
    name: "Pryzmatyczna płyta",
    category: "materials",
    subcategory: "armorer",
    resultItemId: "prismatic_plate",
    tier: 7,
    requiredCraftingLevel: 60,
    craftingExp: 1700,
    craftingTimeSeconds: 84,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "prismatic_scale",
        quantity: 3,
      },
      {
        itemId: "living_crystal",
        quantity: 1,
      },
    ],
  },

  {
    id: "whetstone_recipe",
    name: "Kamień szlifierski",

    category: "materials",
    subcategory: "blacksmith",

    resultItemId: "whetstone",
    tier: 1,
    requiredCraftingLevel: 1,
    craftingExp: 5,
    craftingTimeSeconds: 5,

    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "stone",
        quantity: 5,
      },
    ],
  },

  {
    id: "obsidian_whetstone_recipe",
    name: "Obsydianowy kamień szlifierski",

    category: "materials",
    subcategory: "blacksmith",

    resultItemId: "obsidian_whetstone",
    tier: 2,
    requiredCraftingLevel: 15,
    craftingExp: 50,
    craftingTimeSeconds: 12,

    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "obsidian",
        quantity: 5,
      },
      {
        itemId: "stone",
        quantity: 5,
      },
    ],
  },
  {
    id: "titan_whetstone_recipe",
    name: "Tytanowy kamień szlifierski",

    category: "materials",
    subcategory: "blacksmith",

    resultItemId: "titan_whetstone",
    tier: 4,
    requiredCraftingLevel: 25,
    craftingExp: 100,
    craftingTimeSeconds: 25,

    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "titan_stone",
        quantity: 5,
      },
      {
        itemId: "stone",
        quantity: 5,
      },
    ],
  },

  {
    id: "prismatic_whetstone_recipe",
    name: "Pryzmatyczny kamień szlifierski",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "prismatic_whetstone",
    tier: 5,
    requiredCraftingLevel: 35,
    craftingExp: 320,
    craftingTimeSeconds: 30,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "crystal_shard",
        quantity: 3,
      },
      {
        itemId: "prismatic_gem",
        quantity: 1,
      },
      {
        itemId: "obsidian_whetstone",
        quantity: 1,
      },
    ],
  },

  {
    id: "abyssal_whetstone_recipe",
    name: "Otchłaniowy kamień szlifierski",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "abyssal_whetstone",
    tier: 6,
    requiredCraftingLevel: 45,
    craftingExp: 600,
    craftingTimeSeconds: 42,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "prismatic_whetstone",
        quantity: 1,
      },
      {
        itemId: "dark_matter",
        quantity: 2,
      },
      {
        itemId: "chaos_essence",
        quantity: 1,
      },
    ],
  },
  {
    id: "deepsea_whetstone_recipe",
    name: "Głębinowy kamień szlifierski",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "deepsea_whetstone",
    tier: 7,
    requiredCraftingLevel: 55,
    craftingExp: 950,
    craftingTimeSeconds: 55,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "abyssal_whetstone",
        quantity: 1,
      },
      {
        itemId: "petrified_plate",
        quantity: 2,
      },
      {
        itemId: "coral_heart",
        quantity: 1,
      },
      {
        itemId: "depth_essence",
        quantity: 1,
      },
    ],
  },

  {
    id: "weighted_mace_head_recipe",
    resultItemId: "weighted_mace_head",
    category: "materials",
    subcategory: "blacksmith",
    tier: 1,
    name: "Obciążona głowica obuchu",
    description: "Materiał używany do wytwarzania broni obuchowych.",
    requiredCraftingLevel: 5,
    craftingExp: 45,
    craftingTimeSeconds: 14,
    resultQuantity: 1,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "iron_ingot",
        quantity: 2,
      },
      {
        itemId: "wolf_claw",
        quantity: 2,
      },
    ],
  },

  {
    id: "runic_core_recipe",
    name: "Runiczny rdzeń",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "runic_core",
    tier: 3,
    requiredCraftingLevel: 20,
    craftingExp: 100,
    craftingTimeSeconds: 20,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "runic_stone",
        quantity: 3,
      },
      {
        itemId: "ice_elemental_core",
        quantity: 1,
      },
      {
        itemId: "deep_coal",
        quantity: 1,
      },
    ],
  },

  {
    id: "scorching_mace_head_recipe",
    resultItemId: "scorching_mace_head",
    tier: 4,
    category: "materials",
    subcategory: "blacksmith",
    name: "Rozżarzona głowica obuchu",
    description:
      "Materiał używany do wytwarzania późniejszych broni obuchowych.",
    requiredCraftingLevel: 25,
    craftingExp: 300,
    craftingTimeSeconds: 25,
    resultQuantity: 1,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "magma_core",
        quantity: 2,
      },
      {
        itemId: "obsidian_shard",
        quantity: 3,
      },
    ],
  },

  {
    id: "abyss_mace_head_recipe",
    name: "Głowica Otchłani",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "abyss_mace_head",
    tier: 6,
    requiredCraftingLevel: 40,
    craftingExp: 900,
    craftingTimeSeconds: 60,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "abyss_heart",
        quantity: 1,
      },
      {
        itemId: "void_plate",
        quantity: 2,
      },
      {
        itemId: "dark_matter",
        quantity: 2,
      },
    ],
  },

  {
    id: "deep_mace_head_recipe",
    name: "Głowica Głębinowa",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "deep_mace_head",
    tier: 7,
    requiredCraftingLevel: 50,
    craftingExp: 1250,
    craftingTimeSeconds: 72,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "deep_scale_plate",
        quantity: 2,
      },
      {
        itemId: "leviathan_crown",
        quantity: 1,
      },
      {
        itemId: "depth_essence",
        quantity: 2,
      },
    ],
  },

  {
    id: "prismatic_mace_head_recipe",
    name: "Pryzmatyczna głowica",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "prismatic_mace_head",
    tier: 7,
    requiredCraftingLevel: 60,
    craftingExp: 1700,
    craftingTimeSeconds: 84,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "prismatic_plate",
        quantity: 2,
      },
      {
        itemId: "prismatic_core",
        quantity: 1,
      },
      {
        itemId: "living_crystal",
        quantity: 2,
      },
    ],
  },

  {
    id: "simple_crossbow_trigger_recipe",
    name: "Prosty mechanizm spustowy",
    category: "materials",
    subcategory: "bowyer",
    resultItemId: "simple_crossbow_trigger",
    tier: 1,
    requiredCraftingLevel: 5,
    craftingExp: 45,
    craftingTimeSeconds: 14,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "iron_ingot",
        quantity: 2,
      },
      {
        itemId: "goblin_blade_fragment",
        quantity: 2,
      },
      {
        itemId: "spider_silk",
        quantity: 1,
      },
    ],
  },

  {
    id: "reinforced_crossbow_mechanism_recipe",
    name: "Wzmocniony mechanizm naciągowy",
    category: "materials",
    subcategory: "bowyer",
    resultItemId: "reinforced_crossbow_mechanism",
    tier: 2,
    requiredCraftingLevel: 15,
    craftingExp: 120,
    craftingTimeSeconds: 28,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "platinum_ingot",
        quantity: 2,
      },
      {
        itemId: "kobold_pickaxe",
        quantity: 2,
      },
      {
        itemId: "cave_crystal",
        quantity: 2,
      },
      {
        itemId: "ancient_rune_fragment",
        quantity: 2,
      },
    ],
  },

  {
    id: "crossbow_tension_mechanism_recipe",
    name: "Mechanizm naciągowy kuszy",
    category: "materials",
    subcategory: "bowyer",
    resultItemId: "crossbow_tension_mechanism",
    tier: 4,
    requiredCraftingLevel: 25,
    craftingExp: 300,
    craftingTimeSeconds: 44,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "adamantite_ingot",
        quantity: 2,
      },
      {
        itemId: "ancient_rune_fragment",
        quantity: 3,
      },
      {
        itemId: "guardian_core",
        quantity: 1,
      },
      {
        itemId: "frozen_chain",
        quantity: 2,
      },
    ],
  },

  {
    id: "abyss_echo_crossbow_mechanism_recipe",
    name: "Mechanizm Echa Otchłani",
    category: "materials",
    subcategory: "bowyer",
    resultItemId: "abyss_echo_crossbow_mechanism",
    tier: 5,
    requiredCraftingLevel: 35,
    craftingExp: 480,
    craftingTimeSeconds: 36,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "crossbow_tension_mechanism",
        quantity: 1,
      },
      {
        itemId: "dark_matter",
        quantity: 2,
      },
      {
        itemId: "dimensional_thread",
        quantity: 3,
      },
      {
        itemId: "rift_core",
        quantity: 1,
      },
    ],
  },
  {
    id: "leviathan_pressure_crossbow_mechanism_recipe",
    name: "Mechanizm Ciśnieniowy Lewiatana",
    category: "materials",
    subcategory: "bowyer",
    resultItemId: "leviathan_pressure_crossbow_mechanism",
    tier: 6,
    requiredCraftingLevel: 45,
    craftingExp: 750,
    craftingTimeSeconds: 48,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "abyss_echo_crossbow_mechanism",
        quantity: 1,
      },
      {
        itemId: "pressure_gland",
        quantity: 2,
      },
      {
        itemId: "petrified_plate",
        quantity: 2,
      },
      {
        itemId: "depth_essence",
        quantity: 1,
      },
    ],
  },
  {
    id: "prismatic_spectral_crossbow_mechanism_recipe",
    name: "Pryzmatyczny Mechanizm Widmowy",
    category: "materials",
    subcategory: "bowyer",
    resultItemId: "prismatic_spectral_crossbow_mechanism",
    tier: 7,
    requiredCraftingLevel: 55,
    craftingExp: 1150,
    craftingTimeSeconds: 60,
    requiresScroll: false,
    unlockCost: 0,
    materials: [
      {
        itemId: "leviathan_pressure_crossbow_mechanism",
        quantity: 1,
      },
      {
        itemId: "crystal_shard",
        quantity: 3,
      },
      {
        itemId: "prismatic_gem",
        quantity: 2,
      },
      {
        itemId: "crystal_heart",
        quantity: 1,
      },
    ],
  },

  {
    id: "dimensional_bowstring_recipe",
    name: "Struna Rozdartego Wymiaru",
    category: "materials",
    subcategory: "bowyer",
    resultItemId: "dimensional_bowstring",
    tier: 6,
    requiredCraftingLevel: 40,
    craftingExp: 900,
    craftingTimeSeconds: 60,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "dimensional_thread",
        quantity: 3,
      },
      {
        itemId: "cerebral_membrane",
        quantity: 1,
      },
    ],
  },

  {
    id: "deep_bowstring_recipe",
    name: "Śpiewająca Cięciwa Głębin",
    category: "materials",
    subcategory: "bowyer",
    resultItemId: "deep_bowstring",
    tier: 7,
    requiredCraftingLevel: 50,
    craftingExp: 1250,
    craftingTimeSeconds: 72,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "siren_scale",
        quantity: 3,
      },
      {
        itemId: "enchanted_shell",
        quantity: 1,
      },
    ],
  },

  {
    id: "prismatic_bowstring_recipe",
    name: "Nić Pryzmatycznego Światła",
    category: "materials",
    subcategory: "bowyer",
    resultItemId: "prismatic_bowstring",
    tier: 7,
    requiredCraftingLevel: 60,
    craftingExp: 1700,
    craftingTimeSeconds: 84,
    requiresScroll: false,
    unlockCost: 0,

    materials: [
      {
        itemId: "crystalline_sinew",
        quantity: 3,
      },
      {
        itemId: "living_crystal",
        quantity: 1,
      },
    ],
  },

  ...professionToolUpgradeRecipes,
];
