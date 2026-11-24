/*
 * Burzowy sprzęt (tier 14, poziom 120)
 *
 * Burzowe wersje wzmocnionego rynsztunku. Powstają z już posiadanego
 * wzmocnionego przedmiotu + materiałów z Burzowych Niebios.
 *
 * - statystyki bazowe są wyższe o ok. 9% względem wersji wzmocnionej
 *   (pancerz o co najmniej +1),
 * - losowe statystyki z craftingu zależą od craftingBalance (poziom 120),
 * - burzowe części liczą się do tego samego zestawu co wersja bazowa
 *   (setPieceId), więc premie setu działają bez zmian.
 */
(function () {
  const STAT_BONUS_FACTOR = 1.09;
  const VALUE_FACTOR = 1.6;
  const REQUIRED_LEVEL = 120;
  const STAT_KEYS = [
    "damage",
    "armor",
    "strength",
    "dexterity",
    "intelligence",
    "endurance",
    "luck",
  ];

  // Materiały z Burzowych Niebios dobrane do profesji rzemieślniczej.
  const LOCATION_MATERIALS = {
    blacksmith: [
      { itemId: "sky_steel_rivet", quantity: 12 },
      { itemId: "wind_forged_ingot", quantity: 8 },
      { itemId: "templar_halo", quantity: 3 },
      { itemId: "sovereign_stormplate", quantity: 4 },
    ],
    bowyer: [
      { itemId: "thunder_quill", quantity: 12 },
      { itemId: "roc_eggshell", quantity: 8 },
      { itemId: "stormcaller_beak", quantity: 3 },
      { itemId: "sovereign_stormplate", quantity: 4 },
    ],
    arcanist: [
      { itemId: "static_core", quantity: 12 },
      { itemId: "tempest_shard", quantity: 8 },
      { itemId: "bottled_lightning", quantity: 3 },
      { itemId: "storm_essence", quantity: 4 },
    ],
    armorer: [
      { itemId: "cloud_scale", quantity: 12 },
      { itemId: "vapor_fang", quantity: 8 },
      { itemId: "stratus_gem", quantity: 3 },
      { itemId: "sovereign_stormplate", quantity: 4 },
    ],
    jeweler: [
      { itemId: "storm_feather", quantity: 12 },
      { itemId: "harpy_talon", quantity: 8 },
      { itemId: "gale_pearl", quantity: 3 },
      { itemId: "storm_essence", quantity: 4 },
    ],
    shaman: [
      { itemId: "cloud_scale", quantity: 12 },
      { itemId: "tempest_shard", quantity: 8 },
      { itemId: "gale_pearl", quantity: 3 },
      { itemId: "storm_essence", quantity: 4 },
    ],
  };

  const DEFINITIONS = [
    { base: "sword", name: "Burzowy pryzmatyczny miecz", category: "blacksmith", subcategory: "sword" },
    { base: "dagger", name: "Burzowy pryzmatyczny sztylet", category: "blacksmith", subcategory: "dagger" },
    { base: "mace", name: "Burzowy pryzmatyczny młot", category: "blacksmith", subcategory: "mace" },
    { base: "bow", name: "Burzowy pryzmatyczny łuk", category: "bowyer", subcategory: "bow" },
    { base: "crossbow", name: "Burzowa pryzmatyczna kusza", category: "bowyer", subcategory: "crossbow" },
    { base: "staff", name: "Burzowy pryzmatyczny kostur", category: "arcanist", subcategory: "staff" },
    { base: "wand", name: "Burzowa pryzmatyczna różdżka", category: "arcanist", subcategory: "wand" },
    { base: "armor", name: "Burzowy pryzmatyczny pancerz", category: "armorer", subcategory: "armor" },
    { base: "helmet", name: "Burzowy pryzmatyczny hełm", category: "armorer", subcategory: "helmet" },
    { base: "pants", name: "Burzowe pryzmatyczne spodnie", category: "armorer", subcategory: "pants" },
    { base: "shield", name: "Burzowa pryzmatyczna tarcza", category: "armorer", subcategory: "shield" },
    { base: "boots", name: "Burzowe pryzmatyczne buty", category: "armorer", subcategory: "boots" },
    { base: "gloves", name: "Burzowe pryzmatyczne rękawice", category: "armorer", subcategory: "gloves" },
    { base: "amulet", name: "Burzowy pryzmatyczny amulet", category: "jeweler", subcategory: "amulet" },
    { base: "ring", name: "Burzowy pryzmatyczny pierścień", category: "jeweler", subcategory: "ring" },
    { base: "talisman", name: "Burzowy pryzmatyczny talizman", category: "shaman", subcategory: "talisman" },
  ];

  function boostStat(value) {
    const base = Number(value) || 0;

    return Math.max(base + 1, Math.round(base * STAT_BONUS_FACTOR));
  }

  const stormItems = {};
  const stormRecipes = [];

  DEFINITIONS.forEach((definition) => {
    const reinforcedId = "reinforced_prismforged_" + definition.base;
    const reinforcedItem = items[reinforcedId];

    if (!reinforcedItem) {
      return;
    }

    const itemId = "stormforged_prismforged_" + definition.base;
    const stormItem = {
      ...reinforcedItem,
      id: itemId,
      name: definition.name,
      requiredLevel: REQUIRED_LEVEL,
      value: Math.round((Number(reinforcedItem.value) || 0) * VALUE_FACTOR),
      reinforced: false,
      stormforged: true,
      reinforcedBaseId: reinforcedId,
      setPieceId: reinforcedItem.setPieceId,
      description:
        "Wzmocniony rynsztunek pryzmatyczny przekuty w burzy nad latającymi wyspami.",
    };

    STAT_KEYS.forEach((statKey) => {
      if (Number(reinforcedItem[statKey]) > 0) {
        stormItem[statKey] = boostStat(reinforcedItem[statKey]);
      }
    });

    stormItems[itemId] = stormItem;

    stormRecipes.push({
      id: itemId + "_recipe",
      name: definition.name,
      resultItemId: itemId,
      category: definition.category,
      subcategory: definition.subcategory,
      tier: 14,
      requiredPlayerLevel: REQUIRED_LEVEL,
      requiredCraftingLevel: 65,
      craftingExp: 900,
      craftingTimeSeconds: 56,
      requiresScroll: false,
      unlockCost: 0,
      equipmentUpgradeRank: "stormforged",
      equipmentUpgradeRankLabel: "Burzowe hartowanie",
      materials: [
        { itemId: reinforcedId, quantity: 1 },
        ...LOCATION_MATERIALS[definition.category].map((material) => ({
          ...material,
        })),
        { itemId: "storm_sovereign_heart", quantity: 1 },
        { itemId: "dragonsteel_ingot", quantity: 6 },
      ],
    });
  });

  Object.assign(items, stormItems);

  window.craftingStormforgedRecipes = stormRecipes;

  /*
   * equipmentBalance.js nadpisuje obrażenia i pancerz według poziomu,
   * więc burzowe wartości liczymy od wzmocnionej wersji już po jej
   * zbalansowaniu. Wywoływane na końcu equipmentBalance.js.
   */
  window.applyStormforgedGearBalance = function () {
    Object.values(items).forEach((item) => {
      if (!item || !item.stormforged) {
        return;
      }

      const baseItem = items[item.reinforcedBaseId];

      if (!baseItem) {
        return;
      }

      ["damage", "armor"].forEach((statKey) => {
        if (Number(baseItem[statKey]) > 0) {
          item[statKey] = boostStat(baseItem[statKey]);
        }
      });
    });
  };
})();
