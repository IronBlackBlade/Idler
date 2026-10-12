const craftingBatchCounts = {};


function getCraftingRecipeById(recipeId) {
  return (
    recipes.find((recipe) => {
      return recipe.id === recipeId;
    }) || null
  );
}

function getCraftingBatchCount(recipeId) {
  return Math.max(
    1,
    Math.min(9999, Math.floor(Number(craftingBatchCounts[recipeId]) || 1)),
  );
}

function setCraftingBatchCount(recipeId, value) {
  craftingBatchCounts[recipeId] = Math.max(
    1,
    Math.min(9999, Math.floor(Number(value) || 1)),
  );

  updateCraftingBatchPreview(recipeId);
}

function changeCraftingBatchCount(recipeId, change) {
  const recipe = getCraftingRecipeById(recipeId);

  if (!recipe) {
    return;
  }

  const currentCount = getCraftingBatchCount(recipeId);

  const maximumCount = getMaxRecipeCraftCount(recipe);

  let newCount = currentCount + change;

  /*
   * Przycisk plus nie pozwala
   * przekroczyć aktualnego maksimum.
   */
  if (change > 0 && maximumCount > 0) {
    newCount = Math.min(newCount, maximumCount);
  }

  setCraftingBatchCount(recipeId, newCount);
}

function setMaximumCraftingBatchCount(recipeId) {
  const recipe = getCraftingRecipeById(recipeId);

  if (!recipe) {
    return;
  }

  const maximumCount = getMaxRecipeCraftCount(recipe);

  if (maximumCount <= 0) {
    setCraftingBatchCount(recipeId, 1);

    if (typeof showNotification === "function") {
      showNotification(
        "Brakuje materiałów lub złota na wykonanie tej receptury.",
        "error",
      );
    }

    return;
  }

  setCraftingBatchCount(recipeId, maximumCount);
}

function updateCraftingBatchPreview(recipeId, preserveInputValue = false) {
  const recipe = getCraftingRecipeById(recipeId);

  if (!recipe) {
    return;
  }

  const card = document.querySelector(
    `[data-crafting-recipe-id="${recipeId}"]`,
  );

  if (!card) {
    return;
  }

  const craftCount = getCraftingBatchCount(recipeId);

  const maximumCount = getMaxRecipeCraftCount(recipe);

  const singleResultQuantity = getRecipeResultQuantity(recipe);

  const totalResultQuantity = singleResultQuantity * craftCount;

  const totalGoldCost = getRecipeTotalGoldCost(recipe, craftCount);

  const baseTotalGoldCost = (Number(recipe.goldCost) || 0) * craftCount;

  const canCraft =
    canCraftRecipe(recipe, craftCount);

  const countInput = card.querySelector(".crafting-count-input");

  if (countInput && !preserveInputValue) {
    countInput.value = craftCount;
  }

  if (countInput) {
    countInput.classList.toggle("invalid", craftCount > maximumCount);
  }

  const maximumElement = card.querySelector("[data-crafting-max-count]");

  if (maximumElement) {
    maximumElement.textContent = maximumCount;
  }

  const totalResultElement = card.querySelector("[data-crafting-total-result]");

  if (totalResultElement) {
    totalResultElement.textContent = "x" + totalResultQuantity;
  }

  const totalCostElement = card.querySelector("[data-crafting-total-cost]");

  if (totalCostElement) {
    totalCostElement.innerHTML =
      totalGoldCost < baseTotalGoldCost
        ? "<s>" + baseTotalGoldCost + "</s> " + totalGoldCost
        : totalGoldCost;
  }

  const craftButton = card.querySelector('[data-crafting-action="craft"]');

  if (craftButton) {
    craftButton.textContent =
      "Dodaj x" + totalResultQuantity;

    craftButton.disabled = !canCraft;

    craftButton.classList.toggle("crafting-button-unavailable", !canCraft);
  }

  const decreaseButton = card.querySelector(
    '[data-crafting-action="decrease"]',
  );

  if (decreaseButton) {
    decreaseButton.disabled = craftCount <= 1;
  }

  const increaseButton = card.querySelector(
    '[data-crafting-action="increase"]',
  );

  if (increaseButton) {
    increaseButton.disabled = maximumCount <= 0 || craftCount >= maximumCount;
  }

  const maximumButton = card.querySelector('[data-crafting-action="maximum"]');

  if (maximumButton) {
    maximumButton.disabled = maximumCount <= 0;
  }

  /*
   * Aktualizujemy wymagania materiałów.
   */
  recipe.materials.forEach((material) => {
    const materialElement = card.querySelector(
      `[data-crafting-material-id="${material.itemId}"]`,
    );

    if (!materialElement) {
      return;
    }

    const materialItem = items[material.itemId];

    const ownedQuantity = getCraftingItemQuantity(material.itemId);

    const requiredQuantity = material.quantity * craftCount;

    const equippedQuantity = getEquippedCraftingItemQuantity(material.itemId);

    const hasEnough = ownedQuantity >= requiredQuantity;

    const equippedText =
      equippedQuantity > 0 ? " — założone: " + equippedQuantity : "";

    materialElement.classList.toggle("material-ok", hasEnough);

    materialElement.classList.toggle("material-missing", !hasEnough);

    materialElement.innerHTML = `
                ${hasEnough ? "✅" : "❌"}
                ${materialItem?.name || material.itemId}:
                ${ownedQuantity}/${requiredQuantity}
                ${equippedText}
            `;
  });

  card.classList.toggle("crafting-batch-over-limit", craftCount > maximumCount);
}

/*
 * Telefon: receptury w wytwarzaniu są zwijane do nagłówka (nazwa + znaczniki),
 * a po dotknięciu rozwijają się do pełnej karty. Stan przeżywa ponowne
 * renderowanie listy.
 */
(function () {
    const MOBILE_QUERY = "(max-width: 700px)";
    const expandedRecipes = new Set();
    let scheduled = false;

    function isMobile() {
        return window.matchMedia(MOBILE_QUERY).matches;
    }

    function applyCraftingCollapse() {
        scheduled = false;

        const mobile = isMobile();

        document
            .querySelectorAll("#crafting-list .crafting-item")
            .forEach(function (item) {
                const id = item.dataset.craftingRecipeId;
                item.classList.toggle(
                    "crafting-collapsed",
                    mobile && !expandedRecipes.has(id)
                );
            });
    }

    function scheduleApply() {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(applyCraftingCollapse);
    }

    function init() {
        const list = document.getElementById("crafting-list");

        if (!list) return;

        new MutationObserver(scheduleApply).observe(list, {
            childList: true,
            subtree: true,
        });

        list.addEventListener("click", function (event) {
            if (!isMobile()) return;

            const header = event.target.closest(".crafting-item-header");

            if (!header) return;

            const item = header.closest(".crafting-item");
            const id = item && item.dataset.craftingRecipeId;

            if (!id) return;

            if (expandedRecipes.has(id)) expandedRecipes.delete(id);
            else expandedRecipes.add(id);

            applyCraftingCollapse();
        });

        window.addEventListener("resize", scheduleApply);
        applyCraftingCollapse();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
