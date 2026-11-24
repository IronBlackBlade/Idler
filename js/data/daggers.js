/*
 * Sztylety - broń dla Łotrzyka.
 *
 * Linia sztyletów odpowiada linii mieczy (te same poziomy, rzadkości,
 * obrażenia bazowe i ceny). Różnica jest w walce: sztylet atakuje szybciej,
 * ale pojedyncze trafienie jest słabsze (patrz weaponCombatSettings.dagger).
 *
 * Plik ładowany po items.js, merchantItems.js i weaponRecipes.js, a przed
 * reinforcedGear.js / stormforgedGear.js (które dodają wersje wzmocnione).
 */
(function () {
  const DAGGER_LINE = [
    ["old_sword", "old_dagger", "Stary sztylet"],
    ["forest_blade", "forest_dagger", "Leśny sztylet"],
    ["kobold_sword", "kobold_dagger", "Sztylet kobolda"],
    ["cave_sword", "cave_dagger", "Zabójca Kobolda"],
    ["iron_sword", "iron_dagger", "Żelazny sztylet"],
    ["guardian_blade", "guardian_dagger", "Sztylet strażnika"],
    ["steel_guardian_sword", "steel_guardian_dagger", "Sztylet stalowego strażnika"],
    ["elite_guardian_blade", "elite_guardian_dagger", "Sztylet elitarnego strażnika"],
    ["steel_sword", "steel_dagger", "Stalowy sztylet"],
    ["commander_sword", "commander_dagger", "Sztylet dowódcy"],
    ["knight_sword", "knight_dagger", "Rycerski sztylet"],
    ["dragon_blade", "dragon_dagger", "Smoczy sztylet"],
    ["war_sword", "war_dagger", "Sztylet wojenny"],
    ["heavy_war_sword", "heavy_war_dagger", "Ciężki sztylet wojenny"],
    ["voidforged_sword", "voidforged_dagger", "Otchłanny sztylet"],
    ["riftwoven_sword", "riftwoven_dagger", "Wymiarowy sztylet"],
    ["tidecaller_sword", "tidecaller_dagger", "Głębinowy sztylet"],
    ["deepcrown_sword", "deepcrown_dagger", "Królewski sztylet"],
    ["prismforged_sword", "prismforged_dagger", "Pryzmatyczny sztylet"],
  ];

  const swordToDagger = {};
  DAGGER_LINE.forEach(([swordId, daggerId]) => {
    swordToDagger[swordId] = daggerId;
  });

  DAGGER_LINE.forEach(([swordId, daggerId, name]) => {
    const sword = items[swordId];

    if (!sword) {
      return;
    }

    items[daggerId] = Object.assign({}, sword, {
      id: daggerId,
      name,
      weaponClass: "dagger",
      weaponType: "melee",
    });

    if (
      typeof merchantItems !== "undefined" &&
      merchantItems[swordId] !== undefined
    ) {
      merchantItems[daggerId] = merchantItems[swordId];
    }
  });

  const daggerRecipes = [];

  (window.craftingWeaponRecipes || []).forEach((recipe) => {
    const daggerId = swordToDagger[recipe.resultItemId];

    if (!daggerId) {
      return;
    }

    daggerRecipes.push(
      Object.assign({}, recipe, {
        id: daggerId + "_recipe",
        name: items[daggerId].name,
        resultItemId: daggerId,
        subcategory: "dagger",
        materials: recipe.materials.map((material) =>
          Object.assign({}, material, {
            itemId: swordToDagger[material.itemId] || material.itemId,
          }),
        ),
      }),
    );
  });

  window.craftingWeaponRecipes.push(...daggerRecipes);
})();
