// AUTO-GENERATED FILE. DO NOT EDIT BY HAND.
// Connects Excel-generated crafting data with the existing game data.

(function () {
    if (typeof items !== "undefined" && window.idlerGeneratedItems) {
        Object.assign(items, window.idlerGeneratedItems);
    }

    if (typeof recipes === "undefined" || !window.idlerGeneratedRecipes) {
        return;
    }

    const generatedByResultId = new Map(
        window.idlerGeneratedRecipes.map(recipe => [recipe.resultItemId, recipe])
    );

    recipes.forEach((recipe, index) => {
        const generated = generatedByResultId.get(recipe.resultItemId);

        if (!generated) {
            return;
        }

        recipes[index] = {
            ...recipe,
            ...generated,
            materials: generated.materials || recipe.materials || [],
        };

        if (typeof items !== "undefined") {
            const resultItem = items[recipe.resultItemId];
            if (resultItem?.type === "ring") {
                recipes[index].category = "jeweler";
                recipes[index].subcategory = "ring";
            } else if (resultItem?.type === "amulet") {
                recipes[index].category = "jeweler";
                recipes[index].subcategory = "amulet";
            } else if (resultItem?.type === "talisman") {
                recipes[index].category = "shaman";
                recipes[index].subcategory = "talisman";
            }
        }

        generatedByResultId.delete(recipe.resultItemId);
    });

    generatedByResultId.forEach(generated => {
        if (typeof items !== "undefined") {
            const resultItem = items[generated.resultItemId];
            if (resultItem?.type === "ring") {
                generated.category = "jeweler";
                generated.subcategory = "ring";
            } else if (resultItem?.type === "amulet") {
                generated.category = "jeweler";
                generated.subcategory = "amulet";
            } else if (resultItem?.type === "talisman") {
                generated.category = "shaman";
                generated.subcategory = "talisman";
            }
        }
        recipes.push(generated);
    });
})();
