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
    name: "Sztabka brązu",

    category: "materials",
    subcategory: "metallurgy",

    resultItemId: "bronze_ingot",
    requiredCraftingLevel: 2,
    craftingExp: 18,
    craftingTimeSeconds: 10,
    resultQuantity: 2,

    requiresScroll: false,
    unlockCost: 0,
    goldCost: 3,

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
        quantity: 3,
      },
      {
        itemId: "coal",
        quantity: 1,
      },
    ],
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
    requiredCraftingLevel: 50,
    craftingExp: 600,
    craftingTimeSeconds: 48,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 90,
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
    requiredCraftingLevel: 1,
    craftingExp: 10,
    craftingTimeSeconds: 10,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 3,

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
    requiredCraftingLevel: 3,
    craftingExp: 15,
    craftingTimeSeconds: 12,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 4,

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
    requiredCraftingLevel: 5,
    craftingExp: 20,
    craftingTimeSeconds: 15,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 5,

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
    requiredCraftingLevel: 20,
    craftingExp: 260,
    craftingTimeSeconds: 30,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 30,
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
    requiredCraftingLevel: 35,
    craftingExp: 480,
    craftingTimeSeconds: 42,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 65,
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
    requiredCraftingLevel: 1,
    craftingExp: 10,
    craftingTimeSeconds: 10,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 2,

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
    requiredCraftingLevel: 15,
    craftingExp: 50,
    craftingTimeSeconds: 16,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 12,

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
    requiredCraftingLevel: 40,
    craftingExp: 900,
    craftingTimeSeconds: 60,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 140,

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
    requiredCraftingLevel: 50,
    craftingExp: 1250,
    craftingTimeSeconds: 72,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 190,

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
    requiredCraftingLevel: 60,
    craftingExp: 1700,
    craftingTimeSeconds: 84,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 260,

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
    requiredCraftingLevel: 1,
    craftingExp: 5,
    craftingTimeSeconds: 5,

    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1,

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
    requiredCraftingLevel: 15,
    craftingExp: 50,
    craftingTimeSeconds: 12,

    requiresScroll: false,
    unlockCost: 0,
    goldCost: 25,

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
    requiredCraftingLevel: 25,
    craftingExp: 100,
    craftingTimeSeconds: 25,

    requiresScroll: false,
    unlockCost: 0,
    goldCost: 50,

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
    requiredCraftingLevel: 35,
    craftingExp: 320,
    craftingTimeSeconds: 30,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 120,
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
    requiredCraftingLevel: 45,
    craftingExp: 600,
    craftingTimeSeconds: 42,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 250,
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
    requiredCraftingLevel: 55,
    craftingExp: 950,
    craftingTimeSeconds: 55,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 450,
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
    id: "recipe_weighted_mace_head",
    resultItemId: "weighted_mace_head",
    category: "materials",
    subcategory: "blacksmith",
    name: "Obciążona głowica obuchu",
    description: "Materiał używany do wytwarzania broni obuchowych.",
    requiredCraftingLevel: 5,
    resultQuantity: 1,
    requiresScroll: false,
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
    id: "recipe_scorching_mace_head",
    resultItemId: "scorching_mace_head",
    category: "materials",
    subcategory: "blacksmith",
    name: "Rozżarzona głowica obuchu",
    description:
      "Materiał używany do wytwarzania późniejszych broni obuchowych.",
    requiredCraftingLevel: 25,
    craftingTimeSeconds: 25,
    resultQuantity: 1,
    requiresScroll: false,
  },

  {
    id: "abyss_mace_head_recipe",
    name: "Głowica Otchłani",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "abyss_mace_head",
    requiredCraftingLevel: 40,
    craftingExp: 900,
    craftingTimeSeconds: 60,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 140,
    materials: [],
  },

  {
    id: "deep_mace_head_recipe",
    name: "Głowica Głębinowa",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "deep_mace_head",
    requiredCraftingLevel: 50,
    craftingExp: 1250,
    craftingTimeSeconds: 72,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 190,

    materials: [],
  },

  {
    id: "prismatic_mace_head_recipe",
    name: "Pryzmatyczna głowica",
    category: "materials",
    subcategory: "blacksmith",
    resultItemId: "prismatic_mace_head",
    requiredCraftingLevel: 60,
    craftingExp: 1700,
    craftingTimeSeconds: 84,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 260,

    materials: [],
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
    requiredCraftingLevel: 15,
    craftingExp: 120,
    craftingTimeSeconds: 28,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 28,
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
    requiredCraftingLevel: 25,
    craftingExp: 300,
    craftingTimeSeconds: 44,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 70,
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
    requiredCraftingLevel: 35,
    craftingExp: 480,
    craftingTimeSeconds: 36,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 140,
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
    requiredCraftingLevel: 45,
    craftingExp: 750,
    craftingTimeSeconds: 48,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 280,
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
    requiredCraftingLevel: 55,
    craftingExp: 1150,
    craftingTimeSeconds: 60,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 520,
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
    requiredCraftingLevel: 40,
    craftingExp: 900,
    craftingTimeSeconds: 60,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 140,

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
    requiredCraftingLevel: 50,
    craftingExp: 1250,
    craftingTimeSeconds: 72,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 190,

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
    requiredCraftingLevel: 60,
    craftingExp: 1700,
    craftingTimeSeconds: 84,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 260,

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
    materials: [],
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

    materials: [],
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

    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
  },

  {
    id: "bark_shield_recipe",
    name: "Tarcza z kory",
    resultItemId: "bark_shield",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 50,
    materials: [],
  },

  {
    id: "kobold_shield_recipe",
    name: "Tarcza koboldów",
    resultItemId: "kobold_shield",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 190,
    materials: [],
  },

  {
    id: "guardian_shield_recipe",
    name: "Tarcza strażnika",
    resultItemId: "guardian_shield",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 500,
    materials: [],
  },

  {
    id: "steel_guardian_shield_recipe",
    name: "Stalowa tarcza strażnika",
    resultItemId: "steel_guardian_shield",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 900,
    materials: [],
  },

  {
    id: "elite_guardian_shield_recipe",
    name: "Tarcza elitarnego strażnika",
    resultItemId: "elite_guardian_shield",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1400,
    materials: [],
  },

  {
    id: "commander_shield_recipe",
    name: "Tarcza dowódcy",
    resultItemId: "commander_shield",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1300,
    materials: [],
  },

  {
    id: "dragon_shield_recipe",
    name: "Smocza tarcza",
    resultItemId: "dragon_shield",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 4200,
    materials: [],
  },

  {
    id: "beetle_helmet_recipe",
    name: "Hełm z pancerza chrząszcza",
    resultItemId: "beetle_helmet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 40,
    materials: [],
  },

  {
    id: "kobold_helmet_recipe",
    name: "Hełm kobolda",
    resultItemId: "kobold_helmet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 160,
    materials: [],
  },

  {
    id: "guardian_helmet_recipe",
    name: "Hełm strażnika",
    resultItemId: "guardian_helmet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 420,
    materials: [],
  },

  {
    id: "steel_guardian_helmet_recipe",
    name: "Hełm stalowego strażnika",
    resultItemId: "steel_guardian_helmet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 800,
    materials: [],
  },

  {
    id: "elite_guardian_helmet_recipe",
    name: "Hełm elitarnego strażnika",
    resultItemId: "elite_guardian_helmet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1300,
    materials: [],
  },

  {
    id: "commander_helmet_recipe",
    name: "Hełm dowódcy",
    resultItemId: "commander_helmet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1100,
    materials: [],
  },

  {
    id: "dragon_helmet_recipe",
    name: "Smoczy hełm",
    resultItemId: "dragon_helmet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 3800,
    materials: [],
  },

  {
    id: "wolf_armor_recipe",
    name: "Pancerz wilka",
    resultItemId: "wolf_armor",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 90,
    materials: [],
  },

  {
    id: "kobold_armor_recipe",
    name: "Pancerz kobolda",
    resultItemId: "kobold_armor",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 280,
    materials: [],
  },

  {
    id: "guardian_armor_recipe",
    name: "Pancerz strażnika",
    resultItemId: "guardian_armor",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 750,
    materials: [],
  },

  {
    id: "steel_guardian_armor_recipe",
    name: "Pancerz stalowego strażnika",
    resultItemId: "steel_guardian_armor",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1500,
    materials: [],
  },

  {
    id: "elite_guardian_armor_recipe",
    name: "Pancerz elitarnego strażnika",
    resultItemId: "elite_guardian_armor",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 2400,
    materials: [],
  },

  {
    id: "commander_armor_recipe",
    name: "Pancerz dowódcy",
    resultItemId: "commander_armor",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 2200,
    materials: [],
  },

  {
    id: "dragon_armor_recipe",
    name: "Smoczy pancerz",
    resultItemId: "dragon_armor",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 7000,
    materials: [],
  },

  {
    id: "tracker_pants_recipe",
    name: "Spodnie tropiciela",
    resultItemId: "tracker_pants",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 70,
    materials: [],
  },

  {
    id: "kobold_pants_recipe",
    name: "Nogawice kobolda",
    resultItemId: "kobold_pants",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 220,
    materials: [],
  },

  {
    id: "guardian_pants_recipe",
    name: "Nogawice strażnika",
    resultItemId: "guardian_pants",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 580,
    materials: [],
  },

  {
    id: "steel_guardian_pants_recipe",
    name: "Stalowe spodnie strażnika",
    resultItemId: "steel_guardian_pants",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1100,
    materials: [],
  },

  {
    id: "elite_guardian_pants_recipe",
    name: "Spodnie elitarnego strażnika",
    resultItemId: "elite_guardian_pants",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1800,
    materials: [],
  },

  {
    id: "commander_pants_recipe",
    name: "Nogawice dowódcy",
    resultItemId: "commander_pants",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1600,
    materials: [],
  },

  {
    id: "dragon_pants_recipe",
    name: "Smocze nogawice",
    resultItemId: "dragon_pants",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 5200,
    materials: [],
  },

  {
    id: "wolf_boots_recipe",
    name: "Buty wilka",
    resultItemId: "wolf_boots",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 60,
    materials: [],
  },

  {
    id: "kobold_boots_recipe",
    name: "Buty kobolda",
    resultItemId: "kobold_boots",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 200,
    materials: [],
  },

  {
    id: "guardian_boots_recipe",
    name: "Buty strażnika",
    resultItemId: "guardian_boots",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 520,
    materials: [],
  },

  {
    id: "steel_guardian_boots_recipe",
    name: "Stalowe buty strażnika",
    resultItemId: "steel_guardian_boots",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1000,
    materials: [],
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
    materials: [],
  },

  {
    id: "dragon_boots_recipe",
    name: "Smocze buty",
    resultItemId: "dragon_boots",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 4800,
    materials: [],
  },

  {
    id: "wolf_gloves_recipe",
    name: "Rękawice wilka",
    resultItemId: "wolf_gloves",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 65,
    materials: [],
  },

  {
    id: "kobold_gloves_recipe",
    name: "Rękawice kobolda",
    resultItemId: "kobold_gloves",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 210,
    materials: [],
  },

  {
    id: "guardian_gloves_recipe",
    name: "Rękawice strażnika",
    resultItemId: "guardian_gloves",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 550,
    materials: [],
  },

  {
    id: "steel_guardian_gloves_recipe",
    name: "Stalowe rękawice strażnika",
    resultItemId: "steel_guardian_gloves",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1000,
    materials: [],
  },

  {
    id: "elite_guardian_gloves_recipe",
    name: "Rękawice elitarnego strażnika",
    resultItemId: "elite_guardian_gloves",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1650,
    materials: [],
  },

  {
    id: "commander_gloves_recipe",
    name: "Rękawice dowódcy",
    resultItemId: "commander_gloves",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1500,
    materials: [],
  },

  {
    id: "dragon_gloves_recipe",
    name: "Smocze rękawice",
    resultItemId: "dragon_gloves",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 5000,
    materials: [],
  },

  {
    id: "mana_ring_recipe",
    name: "Pierścień many",
    resultItemId: "mana_ring",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 90,
    materials: [],
  },

  {
    id: "kobold_ring_recipe",
    name: "Pierścień kobolda",
    resultItemId: "kobold_ring",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 260,
    materials: [],
  },

  {
    id: "guardian_ring_recipe",
    name: "Pierścień strażnika",
    resultItemId: "guardian_ring",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 700,
    materials: [],
  },

  {
    id: "steel_guardian_ring_recipe",
    name: "Pierścień stalowego strażnika",
    resultItemId: "steel_guardian_ring",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 900,
    materials: [],
  },

  {
    id: "elite_guardian_ring_recipe",
    name: "Pierścień elitarnego strażnika",
    resultItemId: "elite_guardian_ring",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1400,
    materials: [],
  },

  {
    id: "commander_ring_recipe",
    name: "Pierścień dowódcy",
    resultItemId: "commander_ring",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1900,
    materials: [],
  },

  {
    id: "dragon_ring_recipe",
    name: "Smoczy pierścień",
    resultItemId: "dragon_ring",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 6200,
    materials: [],
  },

  {
    id: "mana_amulet_recipe",
    name: "Amulet many",
    resultItemId: "mana_amulet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 100,
    materials: [],
  },

  {
    id: "kobold_amulet_recipe",
    name: "Amulet kobolda",
    resultItemId: "kobold_amulet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 280,
    materials: [],
  },

  {
    id: "guardian_amulet_recipe",
    name: "Amulet strażnika",
    resultItemId: "guardian_amulet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 760,
    materials: [],
  },

  {
    id: "steel_guardian_amulet_recipe",
    name: "Amulet stalowego strażnika",
    resultItemId: "steel_guardian_amulet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 850,
    materials: [],
  },

  {
    id: "elite_guardian_amulet_recipe",
    name: "Amulet elitarnego strażnika",
    resultItemId: "elite_guardian_amulet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1350,
    materials: [],
  },

  {
    id: "commander_amulet_recipe",
    name: "Amulet dowódcy",
    resultItemId: "commander_amulet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 2000,
    materials: [],
  },

  {
    id: "dragon_amulet_recipe",
    name: "Smoczy amulet",
    resultItemId: "dragon_amulet",
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 6500,
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
  },

  {
    id: "steel_guardian_talisman_recipe",
    name: "Talizman stalowego strażnika",
    resultItemId: "steel_guardian_talisman",
    requiredCraftingLevel: 15,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 900,
    materials: [],
  },

  {
    id: "elite_guardian_talisman_recipe",
    name: "Talizman elitarnego strażnika",
    resultItemId: "elite_guardian_talisman",
    requiredCraftingLevel: 20,
    requiresScroll: false,
    unlockCost: 0,
    goldCost: 1450,
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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
    materials: [],
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

  ...professionToolUpgradeRecipes,
];


