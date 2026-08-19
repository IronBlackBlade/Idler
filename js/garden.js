const GARDEN_PLOT_COUNT = 3;

const GARDEN_GROWTH_SECONDS_BY_RARITY = {
    common: 300,
    uncommon: 600,
    rare: 900,
    epic: 1800,
    legendary: 3600
};

const GARDEN_YIELD_BY_RARITY = {
    common: 2,
    uncommon: 2,
    rare: 2,
    epic: 1,
    legendary: 1
};

function getDefaultGardenState() {
    return {
        plots: Array.from(
            { length: GARDEN_PLOT_COUNT },
            (_, index) => {
                return {
                    id: "garden_plot_" + (index + 1),
                    seedItemId: null,
                    sourceItemId: null,
                    plantedAt: 0,
                    finishesAt: 0
                };
            }
        )
    };
}

function ensureGardenState() {
    if (
        !player.garden ||
        typeof player.garden !== "object"
    ) {
        player.garden = getDefaultGardenState();
    }

    if (
        !Array.isArray(player.garden.plots)
    ) {
        player.garden.plots =
            getDefaultGardenState().plots;
    }

    while (
        player.garden.plots.length <
        GARDEN_PLOT_COUNT
    ) {
        const index =
            player.garden.plots.length;

        player.garden.plots.push({
            id: "garden_plot_" + (index + 1),
            seedItemId: null,
            sourceItemId: null,
            plantedAt: 0,
            finishesAt: 0
        });
    }

    if (
        typeof initializeHerbalismSeedItems ===
        "function"
    ) {
        initializeHerbalismSeedItems();
    }
}

function getGardenSeedInventoryItems() {
    ensureGardenState();

    if (
        !Array.isArray(player.inventory) ||
        typeof items === "undefined"
    ) {
        return [];
    }

    return player.inventory
        .filter(inventoryItem => {
            const item =
                items[inventoryItem.itemId];

            return (
                item &&
                item.type === "seed" &&
                item.sourceItemId
            );
        });
}

function getGardenGrowthSeconds(seedItem) {
    const rarity =
        seedItem?.rarity || "common";

    return (
        GARDEN_GROWTH_SECONDS_BY_RARITY[rarity] ||
        GARDEN_GROWTH_SECONDS_BY_RARITY.common
    );
}

function getGardenYieldQuantity(seedItem) {
    const rarity =
        seedItem?.rarity || "common";

    return (
        GARDEN_YIELD_BY_RARITY[rarity] ||
        1
    );
}

function removeGardenSeedFromInventory(
    seedItemId,
    quantity = 1
) {
    if (
        !Array.isArray(player.inventory) ||
        !seedItemId
    ) {
        return false;
    }

    const inventoryItem =
        player.inventory.find(entry => {
            return entry.itemId === seedItemId;
        });

    if (
        !inventoryItem ||
        inventoryItem.quantity < quantity
    ) {
        return false;
    }

    inventoryItem.quantity -= quantity;

    if (inventoryItem.quantity <= 0) {
        player.inventory =
            player.inventory.filter(entry => {
                return entry.itemId !== seedItemId;
            });
    }

    return true;
}

function plantGardenSeed(
    plotIndex,
    seedItemId
) {
    ensureGardenState();

    const plot =
        player.garden.plots[plotIndex];

    if (!plot) {
        return false;
    }

    if (plot.seedItemId) {
        if (typeof showNotification === "function") {
            showNotification(
                "Ta grządka jest już zajęta.",
                "error"
            );
        }

        return false;
    }

    const seedItem =
        typeof items !== "undefined"
            ? items[seedItemId]
            : null;

    if (
        !seedItem ||
        seedItem.type !== "seed" ||
        !seedItem.sourceItemId
    ) {
        if (typeof showNotification === "function") {
            showNotification(
                "Nieprawidłowe nasiono.",
                "error"
            );
        }

        return false;
    }

    const removed =
        removeGardenSeedFromInventory(
            seedItemId,
            1
        );

    if (!removed) {
        if (typeof showNotification === "function") {
            showNotification(
                "Nie masz tego nasiona.",
                "error"
            );
        }

        return false;
    }

    const now = Date.now();
    const growthSeconds =
        getGardenGrowthSeconds(seedItem);

    plot.seedItemId = seedItemId;
    plot.sourceItemId = seedItem.sourceItemId;
    plot.plantedAt = now;
    plot.finishesAt =
        now + growthSeconds * 1000;

    if (typeof showNotification === "function") {
        showNotification(
            "Zasadzono: " + seedItem.name + ".",
            "success"
        );
    }

    saveGame();

    if (typeof renderGarden === "function") {
        renderGarden();
    }

    if (typeof renderInventory === "function") {
        renderInventory();
    }

    return true;
}

function isGardenPlotReady(plot) {
    return Boolean(
        plot &&
        plot.seedItemId &&
        Date.now() >= plot.finishesAt
    );
}

function getGardenPlotRemainingSeconds(plot) {
    if (
        !plot ||
        !plot.seedItemId
    ) {
        return 0;
    }

    return Math.max(
        0,
        Math.ceil(
            (plot.finishesAt - Date.now()) / 1000
        )
    );
}

function harvestGardenPlot(plotIndex) {
    ensureGardenState();

    const plot =
        player.garden.plots[plotIndex];

    if (!plot || !plot.seedItemId) {
        return false;
    }

    if (!isGardenPlotReady(plot)) {
        if (typeof showNotification === "function") {
            showNotification(
                "Roślina jeszcze nie dojrzała.",
                "error"
            );
        }

        return false;
    }

    const seedItem =
        items[plot.seedItemId];

    const sourceItemId =
        plot.sourceItemId ||
        seedItem?.sourceItemId;

    if (!sourceItemId) {
        return false;
    }

    const quantity =
        getGardenYieldQuantity(seedItem);

    addItemToInventory(
        sourceItemId,
        quantity
    );

    const sourceItem =
        items[sourceItemId];

    plot.seedItemId = null;
    plot.sourceItemId = null;
    plot.plantedAt = 0;
    plot.finishesAt = 0;

    if (typeof showNotification === "function") {
        showNotification(
            "Zebrano: " +
            (sourceItem?.name || sourceItemId) +
            " x" +
            quantity +
            ".",
            "success"
        );
    }

    saveGame();

    if (typeof renderGarden === "function") {
        renderGarden();
    }

    if (typeof renderInventory === "function") {
        renderInventory();
    }

    return true;
}