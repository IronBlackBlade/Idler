const recipes = [
  ...window.craftingWeaponRecipes,
  ...window.craftingArmorRecipes,
  ...window.craftingJewelryRecipes,
  ...window.craftingMaterialRecipes,
  ...(window.craftingReinforcedRecipes || []),


];

window.recipes = recipes;
