const craftingBalance = {
  experience: {
    base: 300,
    linearPerLevel: 110,
    power: 1.65,
    powerMultiplier: 28,
    defaultRecipeExp: 10,
  },

  queue: {
    maxSize: 10,
  },

  timing: {
    defaultDurationSeconds: 10,
    minimumDurationMilliseconds: 1000,
  },
  equipmentUpgrade: {
    statRanges: {
      1: {
        main: [2, 4],
        random: [1, 2],
        jewelryRandom: [1, 2],
      },

      5: {
        main: [2, 4],
        random: [1, 2],
        jewelryRandom: [1, 2],
      },

      10: {
        main: [4, 7],
        random: [2, 4],
        jewelryRandom: [2, 3],
      },

      20: {
        main: [7, 11],
        random: [3, 6],
        jewelryRandom: [3, 5],
      },

      25: {
        main: [9, 13],
        random: [4, 7],
        jewelryRandom: [3, 6],
      },

      30: {
        main: [11, 16],
        random: [5, 9],
        jewelryRandom: [4, 7],
      },

      40: {
        main: [16, 22],
        random: [7, 13],
        jewelryRandom: [6, 9],
      },

      50: {
        main: [22, 30],
        random: [9, 17],
        jewelryRandom: [8, 12],
      },
    },
  },
  upgradePresentation: {
    1: {
      rank: "basic",
      rankLabel: "Podstawowe ulepszenie",
    },

    10: {
      rank: "improved",
      rankLabel: "Ulepszone uzbrojenie",
    },

    20: {
      rank: "advanced",
      rankLabel: "Zaawansowane ulepszenie",
    },

    40: {
      rank: "expert",
      rankLabel: "Eksperckie ulepszenie",
    },

    50: {
      rank: "master",
      rankLabel: "Mistrzowskie ulepszenie",
    },
  },
  upgradeStats: {
    randomStatCount: {
      equipment: 2,
      jewelry: 3,
    },
    mainStatByType: {
      weapon: {
        melee: "strength",
        ranged: "dexterity",
        magic: "intelligence",
      },

      shield: "endurance",
      helmet: "endurance",
      armor: "endurance",
      pants: "endurance",
      boots: "endurance",
      gloves: "endurance",

      talisman: "luck",
    },
    all: ["strength", "dexterity", "intelligence", "endurance", "luck"],

    ring: ["strength", "dexterity", "intelligence"],

    amulet: ["endurance", "luck"],
  },
  locationMaterials: {
    // ======================================================
    // FOREST — LOKACJA 1
    // ======================================================
    1: {
      blacksmith: ["wolf_fang", "sharp_tooth"],
      bowyer: ["rat_tail", "beetle_wing"],
      arcanist: ["small_spike", "ram_horn"],
      armorer: ["broken_shield", "wolf_claw"],
      jeweler: ["beetle_wing", "wolf_fang"],
      shaman: ["rat_tail", "small_spike"],
    },

    // ======================================================
    // CAVE — LOKACJA 2
    // ======================================================
    2: {
      blacksmith: ["bat_wing", "rusty_chain"],
      bowyer: ["dark_feather", "spider_venom"],
      arcanist: ["bat_fang", "bone"],
      armorer: ["stone_core", "heavy_rock"],
      jeweler: ["bat_wing", "bone"],
      shaman: ["spider_venom", "rusty_chain"],
    },

    // ======================================================
    // RUINS — LOKACJA 3
    // ======================================================
    3: {
      blacksmith: ["spectral_essence", "guardian_emblem"],
      bowyer: ["spectral_essence", "guardian_emblem"],
      arcanist: ["spectral_essence", "guardian_emblem"],
      armorer: ["torn_guardian_cloth", "rusted_guardian_plate"],
      jeweler: ["guardian_emblem", "torn_guardian_cloth"],
      shaman: ["rusted_guardian_plate", "spectral_essence"],
    },

    // ======================================================
    // ICE — LOKACJA 4
    // ======================================================
    4: {
      blacksmith: ["frost_giant_shard", "frost_crown_fragment"],
      bowyer: ["frost_giant_shard", "frost_crown_fragment"],
      arcanist: ["frost_giant_shard", "frost_crown_fragment"],
      armorer: ["frozen_bone", "frost_essence"],
      jeweler: ["frost_essence", "frost_giant_shard"],
      shaman: ["frozen_bone", "frost_crown_fragment"],
    },

    // ======================================================
    // VOLCANO — LOKACJA 5
    // ======================================================
    5: {
      blacksmith: ["magma_core", "ember_essence"],
      bowyer: ["charred_bone", "volcanic_heart_fragment"],
      arcanist: ["magma_core", "volcanic_heart_fragment"],
      armorer: ["obsidian_shard", "magma_golem_plate"],
      jeweler: ["ember_essence", "magma_core"],
      shaman: ["charred_bone", "obsidian_shard"],
    },

    // ======================================================
    // ABYSS — LOKACJA 6
    // ======================================================
    6: {
      blacksmith: ["crystallized_thought", "herald_blade"],
      bowyer: ["observer_lens", "astral_pupil"],
      arcanist: ["memory_fragment", "weaver_armor_shard"],
      armorer: ["spatial_gland", "interdimensional_bone"],
      jeweler: ["focus_ring", "memory_fragment"],
      shaman: ["weaver_armor_shard", "astral_pupil"],
    },

    // ======================================================
    // SUNKEN KINGDOM — LOKACJA 7
    // ======================================================
    7: {
      blacksmith: ["sea_predator_fang", "rusted_guard_medal"],
      bowyer: ["royal_uniform_scrap", "living_coral_shard"],
      arcanist: ["song_crystal", "soaked_scroll"],
      armorer: ["drowned_bone", "sunken_cult_relic"],
      jeweler: ["sea_predator_fang", "song_crystal"],
      shaman: ["rusted_guard_medal", "living_coral_shard"],
    },

    // ======================================================
    // CRYSTAL PEAKS — LOKACJA 8
    // ======================================================
    8: {
      blacksmith: ["mountain_essence", "geode_fragment"],
      bowyer: ["shimmering_mandible", "crystal_stinger"],
      arcanist: ["unstable_crystal", "refracted_venom"],
      armorer: ["crystal_shell", "spire_armor_fragment"],
      jeweler: ["floating_shard", "geode_heart"],
      shaman: ["shardling_core", "mountain_essence"],
    },
  },
  locationMaterialRequirements: {
    1: [
      { location: 1, quantity: 10 },
      { location: 1, quantity: 10 },
    ],
    2: [
      { location: 1, quantity: 12 },
      { location: 2, quantity: 10 },
    ],
    3: [
      { location: 2, quantity: 10 },
      { location: 2, quantity: 10 },
    ],
    4: [
      { location: 2, quantity: 12 },
      { location: 3, quantity: 10 },
    ],
    5: [
      { location: 3, quantity: 10 },
      { location: 3, quantity: 10 },
    ],
    6: [
      { location: 3, quantity: 12 },
      { location: 4, quantity: 10 },
    ],
    7: [
      { location: 4, quantity: 10 },
      { location: 4, quantity: 10 },
    ],
    8: [
      { location: 4, quantity: 12 },
      { location: 5, quantity: 10 },
    ],
    9: [
      { location: 5, quantity: 10 },
      { location: 5, quantity: 10 },
    ],
    10: [
      { location: 5, quantity: 12 },
      { location: 6, quantity: 10 },
    ],
    11: [
      { location: 6, quantity: 10 },
      { location: 6, quantity: 10 },
    ],
    12: [
      { location: 6, quantity: 12 },
      { location: 7, quantity: 10 },
    ],
    13: [
      { location: 7, quantity: 10 },
      { location: 7, quantity: 10 },
    ],
    14: [
      { location: 7, quantity: 12 },
      { location: 8, quantity: 10 },
    ],
  },
};
