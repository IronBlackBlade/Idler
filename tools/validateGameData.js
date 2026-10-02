const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectDirectory = path.resolve(__dirname, "..");
const context = vm.createContext({ console });
context.window = context;

function loadDataFile(relativePath) {
  const absolutePath = path.join(projectDirectory, relativePath);
  const source = fs.readFileSync(absolutePath, "utf8");

  vm.runInContext(source, context, { filename: relativePath });
}

[
  "js/data/locations/forest.js",
  "js/data/locations/cave.js",
  "js/data/locations/ruins.js",
  "js/data/locations/ice.js",
  "js/data/locations/volcano.js",
  "js/data/locations/abyss.js",
  "js/data/locations/sunkenKingdom.js",
  "js/data/locations/crystalPeaks.js",
  "js/data/professionTools.js",
  "js/data/items.js",
  "js/data/shop/merchantItems.js",
  "js/data/combatBalance.js",
  "js/data/equipmentSets.js",
  "js/data/crafting/weaponRecipes.js",
  "js/data/crafting/armorRecipes.js",
  "js/data/crafting/jewelryRecipes.js",
  "js/data/crafting/materialRecipes.js",
  "js/data/crafting/recipes.js",
  "js/data/dungeonsData.js",
  "js/data/locations.js",
  "js/data/mining.js",
  "js/data/herbalismData.js",
  "js/data/fishingData.js",
  "js/data/alchemyData.js",
  "js/data/cookingData.js",
].forEach(loadDataFile);

const data = vm.runInContext(
  "({ items, merchantItems, recipes, dungeons, locations, equipmentSetDefinitions, combatMonsterBalanceRows, professionToolItems, miningAreas, herbalismAreas, fishingAreas, fishingBaits, alchemyRecipes, cookingRecipes, tavernTipRewards })",
  context,
);

const errors = [];

function requireItem(itemId, source) {
  if (!data.items[itemId]) {
    errors.push(`${source}: brak przedmiotu \"${itemId}\".`);
  }
}

function validateLoot(loot, source) {
  (loot || []).forEach((entry, index) => {
    requireItem(entry.item, `${source}.loot[${index}]`);
  });
}

Object.entries(data.items).forEach(([key, item]) => {
  if (item.id !== key) {
    errors.push(`items.${key}: id przedmiotu to \"${item.id}\", a powinno być \"${key}\".`);
  }
});

const recipeIds = new Set();

data.recipes.forEach((recipe, index) => {
  const source = `recipes[${index}] (${recipe.id})`;

  if (recipeIds.has(recipe.id)) {
    errors.push(`${source}: powielone id receptury.`);
  }

  recipeIds.add(recipe.id);
  requireItem(recipe.resultItemId, `${source}.resultItemId`);

  if (Number.isFinite(Number(recipe.tier)) && Object.hasOwn(recipe, "goldCost")) {
    errors.push(
      `${source}: receptura tierowa nie może mieć goldCost; koszt pochodzi z economyBalance.craftingGoldCost.`,
    );
  }

  if (recipe.upgradeFromItemId) {
    requireItem(recipe.upgradeFromItemId, `${source}.upgradeFromItemId`);
  }

  (recipe.materials || []).forEach((material, materialIndex) => {
    requireItem(material.itemId, `${source}.materials[${materialIndex}]`);
  });
});

function validateIngredientRecipe(recipe, index, recipeType) {
  const source = `${recipeType}[${index}] (${recipe.id})`;

  requireItem(recipe.resultItemId, `${source}.resultItemId`);

  (recipe.ingredients || []).forEach((ingredient, ingredientIndex) => {
    requireItem(ingredient.itemId, `${source}.ingredients[${ingredientIndex}]`);
  });
}

data.alchemyRecipes.forEach((recipe, index) => {
  validateIngredientRecipe(recipe, index, "alchemyRecipes");
});

data.cookingRecipes.forEach((recipe, index) => {
  validateIngredientRecipe(recipe, index, "cookingRecipes");
});

Object.keys(data.merchantItems).forEach((itemId) => {
  requireItem(itemId, `merchantItems.${itemId}`);
});

data.equipmentSetDefinitions.forEach((equipmentSet) => {
  equipmentSet.itemIds.forEach((itemId) => {
    requireItem(itemId, `equipmentSetDefinitions.${equipmentSet.id}`);
  });
});

Object.entries(data.locations).forEach(([locationId, location]) => {
  const encounters = [...(location.enemies || []), location.boss].filter(Boolean);

  encounters.forEach((encounter) => {
    const source = `locations.${locationId}.${encounter.id}`;
    validateLoot(encounter.loot, source);

    (encounter.firstKillReward?.items || []).forEach((reward, rewardIndex) => {
      requireItem(reward.item, `${source}.firstKillReward.items[${rewardIndex}]`);
    });
  });
});

Object.entries(data.dungeons).forEach(([dungeonId, dungeon]) => {
  requireItem(dungeon.keyItemId, `dungeons.${dungeonId}.keyItemId`);

  dungeon.rooms.forEach((room) => {
    validateLoot(room.loot, `dungeons.${dungeonId}.${room.id}`);
  });

  (dungeon.completionRewards?.items || []).forEach((reward, rewardIndex) => {
    requireItem(
      reward.item,
      `dungeons.${dungeonId}.completionRewards.items[${rewardIndex}]`,
    );
  });
});

const locationEncounterIds = new Set(
  Object.values(data.locations).flatMap((location) => {
    return [...(location.enemies || []), location.boss]
      .filter(Boolean)
      .map((encounter) => encounter.id);
  }),
);

data.combatMonsterBalanceRows.forEach(([monsterId]) => {
  if (!locationEncounterIds.has(monsterId)) {
    errors.push(`combatMonsterBalanceRows: brak potwora \"${monsterId}\" w danych lokacji.`);
  }
});

if (errors.length > 0) {
  console.error(`Walidacja danych nie przeszła (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `Walidacja danych OK: ${Object.keys(data.items).length} przedmiotów, ${data.recipes.length} receptur, ${Object.keys(data.dungeons).length} lochów.`,
  );
}
