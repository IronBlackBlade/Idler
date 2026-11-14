/*
 * Wzmocniony sprzęt (tier 13, poziom 110)
 *
 * Wzmocnione wersje pryzmatycznego rynsztunku. Powstają z już posiadanego
 * przedmiotu pryzmatycznego + materiałów z Zapomnianych Głębi.
 *
 * - statystyki bazowe są wyższe o ok. 9% (pancerz o co najmniej +1),
 * - losowe statystyki z craftingu są wyższe o ok. 8% (craftingBalance, poziom 110),
 * - wzmocnione części liczą się do Pryzmatycznego rynsztunku (setPieceId),
 *   więc premie setu działają bez zmian.
 */
(function () {
  const STAT_BONUS_FACTOR = 1.09;
  const VALUE_FACTOR = 1.6;
  const REQUIRED_LEVEL = 110;
  const STAT_KEYS = [
    "damage",
    "armor",
    "strength",
    "dexterity",
    "intelligence",
    "endurance",
    "luck",
  ];

  // Materiały z Zapomnianych Głębi dobrane do profesji rzemieślniczej.
  const LOCATION_MATERIALS = {
    blacksmith: [
      { itemId: "rusted_gear", quantity: 12 },
      { itemId: "magma_anvil_shard", quantity: 8 },
      { itemId: "forgemaster_tongs", quantity: 3 },
      { itemId: "titan_forged_plating", quantity: 4 },
    ],
    bowyer: [
      { itemId: "clockwork_spring", quantity: 12 },
      { itemId: "dwarven_alloy", quantity: 8 },
      { itemId: "automaton_heart", quantity: 3 },
      { itemId: "titan_forged_plating", quantity: 4 },
    ],
    arcanist: [
      { itemId: "wraith_dust", quantity: 12 },
      { itemId: "cursed_pickaxe_head", quantity: 8 },
      { itemId: "ghostlight_lantern", quantity: 3 },
      { itemId: "forge_essence", quantity: 4 },
    ],
    armorer: [
      { itemId: "deep_chitin_plate", quantity: 12 },
      { itemId: "golem_slag_core", quantity: 8 },
      { itemId: "runed_plate", quantity: 3 },
      { itemId: "titan_forged_plating", quantity: 4 },
    ],
    jeweler: [
      { itemId: "forge_ember", quantity: 12 },
      { itemId: "blind_pincer", quantity: 8 },
      { itemId: "pale_gland", quantity: 3 },
      { itemId: "forge_essence", quantity: 4 },
    ],
    shaman: [
      { itemId: "wraith_dust", quantity: 12 },
      { itemId: "blind_pincer", quantity: 8 },
      { itemId: "ghostlight_lantern", quantity: 3 },
      { itemId: "forge_essence", quantity: 4 },
    ],
  };

  const DEFINITIONS = [
    { base: "sword", name: "Wzmocniony pryzmatyczny miecz", category: "blacksmith", subcategory: "sword" },
    { base: "mace", name: "Wzmocniony pryzmatyczny młot", category: "blacksmith", subcategory: "mace" },
    { base: "bow", name: "Wzmocniony pryzmatyczny łuk", category: "bowyer", subcategory: "bow" },
    { base: "crossbow", name: "Wzmocniona pryzmatyczna kusza", category: "bowyer", subcategory: "crossbow" },
    { base: "staff", name: "Wzmocniony pryzmatyczny kostur", category: "arcanist", subcategory: "staff" },
    { base: "wand", name: "Wzmocniona pryzmatyczna różdżka", category: "arcanist", subcategory: "wand" },
    { base: "armor", name: "Wzmocniony pryzmatyczny pancerz", category: "armorer", subcategory: "armor" },
    { base: "helmet", name: "Wzmocniony pryzmatyczny hełm", category: "armorer", subcategory: "helmet" },
    { base: "pants", name: "Wzmocnione pryzmatyczne spodnie", category: "armorer", subcategory: "pants" },
    { base: "shield", name: "Wzmocniona pryzmatyczna tarcza", category: "armorer", subcategory: "shield" },
    { base: "boots", name: "Wzmocnione pryzmatyczne buty", category: "armorer", subcategory: "boots" },
    { base: "gloves", name: "Wzmocnione pryzmatyczne rękawice", category: "armorer", subcategory: "gloves" },
    { base: "amulet", name: "Wzmocniony pryzmatyczny amulet", category: "jeweler", subcategory: "amulet" },
    { base: "ring", name: "Wzmocniony pryzmatyczny pierścień", category: "jeweler", subcategory: "ring" },
    { base: "talisman", name: "Wzmocniony pryzmatyczny talizman", category: "shaman", subcategory: "talisman" },
  ];

  function boostStat(value) {
    const base = Number(value) || 0;

    return Math.max(base + 1, Math.round(base * STAT_BONUS_FACTOR));
  }

  const reinforcedItems = {};
  const reinforcedRecipes = [];

  DEFINITIONS.forEach((definition) => {
    const baseItemId = "prismforged_" + definition.base;
    const baseItem = items[baseItemId];

    if (!baseItem) {
      return;
    }

    const itemId = "reinforced_" + baseItemId;
    const reinforcedItem = {
      ...baseItem,
      id: itemId,
      name: definition.name,
      requiredLevel: REQUIRED_LEVEL,
      value: Math.round((Number(baseItem.value) || 0) * VALUE_FACTOR),
      reinforced: true,
      setPieceId: baseItemId,
      description:
        "Pryzmatyczny rynsztunek przekuty w kuźniach Zapomnianych Głębi.",
    };

    STAT_KEYS.forEach((statKey) => {
      if (Number(baseItem[statKey]) > 0) {
        reinforcedItem[statKey] = boostStat(baseItem[statKey]);
      }
    });

    reinforcedItems[itemId] = reinforcedItem;

    reinforcedRecipes.push({
      id: itemId + "_recipe",
      name: definition.name,
      resultItemId: itemId,
      category: definition.category,
      subcategory: definition.subcategory,
      tier: 13,
      requiredPlayerLevel: REQUIRED_LEVEL,
      requiredCraftingLevel: 60,
      craftingExp: 760,
      craftingTimeSeconds: 48,
      requiresScroll: false,
      unlockCost: 0,
      equipmentUpgradeRank: "reinforced",
      equipmentUpgradeRankLabel: "Wzmocnienie",
      materials: [
        { itemId: baseItemId, quantity: 1 },
        ...LOCATION_MATERIALS[definition.category].map((material) => ({
          ...material,
        })),
        { itemId: "forge_titan_heart", quantity: 1 },
        { itemId: "dragonsteel_ingot", quantity: 4 },
      ],
    });
  });

  Object.assign(items, reinforcedItems);

  window.craftingReinforcedRecipes = reinforcedRecipes;

  /*
   * equipmentBalance.js nadpisuje obrażenia i pancerz według poziomu,
   * więc wzmocnienie liczymy od wartości już zbalansowanej wersji
   * pryzmatycznej. Wywoływane na końcu equipmentBalance.js.
   */
  window.applyReinforcedGearBalance = function () {
    Object.values(items).forEach((item) => {
      if (!item || !item.reinforced) {
        return;
      }

      const baseItem = items[item.setPieceId];

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
