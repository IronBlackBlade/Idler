const GARDEN_MAX_PLOT_COUNT = 9;

const GARDEN_PLOT_UNLOCK_LEVELS = [
    1,
    1,
    1,
    5,
    10,
    20
];

const GARDEN_GROWTH_SECONDS_BY_GROUP = {
    basic: 60 * 60,
    rare: 4 * 60 * 60,
    exceptional: 8 * 60 * 60
};

const GARDEN_YIELD_RANGE_BY_GROUP = {
    basic: {
        min: 2,
        max: 4
    },
    rare: {
        min: 2,
        max: 3
    },
    exceptional: {
        min: 1,
        max: 2
    }
};

const GARDEN_SEED_RECOVERY_CHANCE = 20;

const GARDEN_MAX_UPGRADE_LEVEL = 5;

const GARDEN_UPGRADE_COSTS = {
    1: 2000,
    2: 6000,
    3: 16000,
    4: 40000
};

const GARDEN_GREENHOUSE_MAX_LEVEL = 5;

const GARDEN_GREENHOUSE_COSTS = [
    2000,
    5000,
    10000,
    25000,
    45000
];

const GARDEN_SOIL_MAX_LEVEL = 5;

const GARDEN_SOIL_COSTS = [
    1500,
    4500,
    6500,
    13000,
    35000
];

const GARDEN_SOIL_BONUS_CHANCE_PER_LEVEL = 5;

const GARDEN_GREENHOUSE_SPEED_PER_LEVEL = 5;

const GARDEN_SEED_CHEST_MAX_LEVEL = 5;

const GARDEN_SEED_CHEST_COSTS = [
    1500,
    4000,
    9000,
    20000,
    40000
];

const GARDEN_SEED_CHEST_RECOVERY_BONUS_PER_LEVEL = 5;

const GARDEN_MAX_EXPANSION_LEVEL = 3;

const GARDEN_EXPANSION_COSTS = [
    15000,
    35000,
    70000
];

function getGardenExpToNextLevel(level) {
    const safeLevel = Math.max(
        1,
        Math.floor(Number(level) || 1)
    );

    return Math.floor(
        80 +
        (safeLevel - 1) * 20 +
        Math.pow(safeLevel - 1, 1.5) * 8
    );
}

function getGardenUnlockedPlotCount() {
    ensureGardenState();

    const levelUnlockedCount =
        GARDEN_PLOT_UNLOCK_LEVELS.filter(
            requiredLevel => {
                return player.garden.level >= requiredLevel;
            }
        ).length;

    return Math.min(
        player.garden.plots.length,
        levelUnlockedCount +
        player.garden.expansionLevel
    );
}

function addGardenExp(amount) {
    ensureGardenState();

    const gainedExp = Math.max(
        0,
        Math.floor(Number(amount) || 0)
    );

    if (gainedExp <= 0) {
        return;
    }

    player.garden.exp += gainedExp;

    while (
        player.garden.exp >=
        player.garden.expToNextLevel
    ) {
        player.garden.exp -=
            player.garden.expToNextLevel;

        player.garden.level++;

        player.garden.expToNextLevel =
            getGardenExpToNextLevel(
                player.garden.level
            );

        if (typeof addSystemLog === "function") {
            addSystemLog(
                "🌱 Osiągnięto " +
                player.garden.level +
                " poziom Ogrodnictwa.",
                "garden"
            );
        }
    }
}

function getDefaultGardenState() {
    return {
        level: 1,
        exp: 0,
        upgradeLevel: 1,
        upgrades: {
            greenhouseLevel: 0,
            fertileSoilLevel: 0,
            seedChestLevel: 0
        },
        expansionLevel: 0,
        expToNextLevel:
            getGardenExpToNextLevel(1),

        statistics: {
            totalPlanted: 0,
            totalHarvests: 0,
            totalHarvestedItems: 0
        },

        plots: Array.from(
            {
                length: GARDEN_MAX_PLOT_COUNT
            },
            (_, index) => {
                return {
                    id:
                        "garden_plot_" +
                        (index + 1),
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
        !player.garden.upgrades ||
        typeof player.garden.upgrades !== "object"
    ) {
        player.garden.upgrades = {
            greenhouseLevel: 0
        };
    }

    player.garden.upgrades.greenhouseLevel =
        Math.max(
            0,
            Math.min(
                GARDEN_GREENHOUSE_MAX_LEVEL,
                Math.floor(
                    Number(
                        player.garden.upgrades
                            .greenhouseLevel
                    ) || 0
                )
            )
        );

    player.garden.upgrades.fertileSoilLevel =
        Math.max(
            0,
            Math.min(
                GARDEN_SOIL_MAX_LEVEL,
                Math.floor(
                    Number(
                        player.garden.upgrades
                            .fertileSoilLevel
                    ) || 0
                )
            )
        );

    player.garden.upgrades.seedChestLevel =
        Math.max(
            0,
            Math.min(
                GARDEN_SEED_CHEST_MAX_LEVEL,
                Math.floor(
                    Number(
                        player.garden.upgrades
                            .seedChestLevel
                    ) || 0
                )
            )
        );

    player.garden.expansionLevel =
        Math.max(
            0,
            Math.min(
                GARDEN_MAX_EXPANSION_LEVEL,
                Math.floor(
                    Number(
                        player.garden.expansionLevel
                    ) || 0
                )
            )
        );

    if (
        !Array.isArray(player.garden.plots)
    ) {
        player.garden.plots =
            getDefaultGardenState().plots;
    }

    if (
        !player.garden.statistics ||
        typeof player.garden.statistics !== "object"
    ) {
        player.garden.statistics = {
            totalPlanted: 0,
            totalHarvests: 0,
            totalHarvestedItems: 0
        };
    }

    player.garden.statistics.totalPlanted =
        Math.max(
            0,
            Math.floor(
                Number(
                    player.garden.statistics
                        .totalPlanted
                ) || 0
            )
        );

    player.garden.statistics.totalHarvests =
        Math.max(
            0,
            Math.floor(
                Number(
                    player.garden.statistics
                        .totalHarvests
                ) || 0
            )
        );

    player.garden.statistics.totalHarvestedItems =
        Math.max(
            0,
            Math.floor(
                Number(
                    player.garden.statistics
                        .totalHarvestedItems
                ) || 0
            )
        );

    player.garden.level = Math.max(
        1,
        Math.floor(
            Number(player.garden.level) || 1
        )
    );

    player.garden.exp = Math.max(
        0,
        Math.floor(
            Number(player.garden.exp) || 0
        )
    );

    player.garden.expToNextLevel =
        getGardenExpToNextLevel(
            player.garden.level
        );
    player.garden.upgradeLevel = Math.max(
        1,
        Math.min(
            GARDEN_MAX_UPGRADE_LEVEL,
            Math.floor(
                Number(player.garden.upgradeLevel) || 1
            )
        )
    );
    while (
        player.garden.plots.length <
        GARDEN_MAX_PLOT_COUNT
    ) {
        const index =
            player.garden.plots.length;

        player.garden.plots.push({
            id: "garden_plot_" + (index + 1),
            seedItemId: null,
            sourceItemId: null,
            plantedAt: 0,
            finishesAt: 0,
            offlineNotified: false
        });
    }

    if (
        typeof initializeHerbalismSeedItems ===
        "function"
    ) {
        initializeHerbalismSeedItems();
    }

    player.garden.plots.forEach(plot => {
        if (
            typeof plot.offlineNotified !==
            "boolean"
        ) {
            plot.offlineNotified = false;
        }
    });
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
    const seedGroup =
        seedItem?.seedGroup || "basic";

    const baseSeconds =
        GARDEN_GROWTH_SECONDS_BY_GROUP[
        seedGroup
        ] ||
        GARDEN_GROWTH_SECONDS_BY_GROUP.basic;

    const greenhouseLevel =
        Math.max(
            0,
            Number(
                player.garden?.upgrades
                    ?.greenhouseLevel
            ) || 0
        );

    const speedBonusPercent =
        greenhouseLevel *
        GARDEN_GREENHOUSE_SPEED_PER_LEVEL;

    return Math.max(
        1,
        Math.round(
            baseSeconds *
            (1 - speedBonusPercent / 100)
        )
    );
}

function getGardenYieldQuantity(seedItem) {
    const seedGroup =
        seedItem?.seedGroup || "basic";

    const yieldRange =
        GARDEN_YIELD_RANGE_BY_GROUP[seedGroup] ||
        GARDEN_YIELD_RANGE_BY_GROUP.basic;

    const minimumYield =
        Math.max(
            1,
            Math.floor(
                Number(yieldRange.min) || 1
            )
        );

    const maximumYield =
        Math.max(
            minimumYield,
            Math.floor(
                Number(yieldRange.max) ||
                minimumYield
            )
        );
    const baseYield =
        minimumYield +
        Math.floor(
            Math.random() *
            (
                maximumYield -
                minimumYield +
                1
            )
        );

    const soilLevel =
        Math.max(
            0,
            Number(
                player.garden?.upgrades
                    ?.fertileSoilLevel
            ) || 0
        );

    const bonusChance =
        soilLevel *
        GARDEN_SOIL_BONUS_CHANCE_PER_LEVEL;

    const bonusYield =
        Math.random() * 100 < bonusChance
            ? 1
            : 0;

    return baseYield + bonusYield;
}

function getGardenSeedRecoveryChance() {
    ensureGardenState();

    return Math.min(
        100,
        GARDEN_SEED_RECOVERY_CHANCE +
        player.garden.upgrades.seedChestLevel *
        GARDEN_SEED_CHEST_RECOVERY_BONUS_PER_LEVEL
    );
}

function rollGardenSeedRecovery() {
    ensureGardenState();

    const chance =
        getGardenSeedRecoveryChance();

    return Math.random() * 100 < chance;
}

function getGardenUpgradeCost() {
    ensureGardenState();

    return (
        GARDEN_UPGRADE_COSTS[
        player.garden.upgradeLevel
        ] || 0
    );
}

function upgradeGarden() {
    ensureGardenState();

    if (
        player.garden.upgradeLevel >=
        GARDEN_MAX_UPGRADE_LEVEL
    ) {
        showNotification?.(
            "Ogród ma już maksymalny poziom.",
            "error"
        );

        return false;
    }

    const cost = getGardenUpgradeCost();

    if (player.gold < cost) {
        showNotification?.(
            "Brakuje złota na ulepszenie Ogrodu.",
            "error"
        );

        return false;
    }

    player.gold -= cost;
    player.garden.upgradeLevel++;

    addSystemLog?.(
        "🌱 Ulepszono Ogród do poziomu " +
        player.garden.upgradeLevel +
        ".",
        "garden"
    );

    showNotification?.(
        "Ogród został ulepszony!",
        "success"
    );

    saveGame();
    renderGarden?.();
    render?.();

    return true;
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
    const unlockedPlotCount =
        getGardenUnlockedPlotCount();

    if (plotIndex >= unlockedPlotCount) {
        if (typeof showNotification === "function") {
            showNotification(
                "Ta grządka nie jest jeszcze odblokowana.",
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

    plot.offlineNotified = false;

    player.garden.statistics.totalPlanted++;


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
        if (
            typeof showNotification ===
            "function"
        ) {
            showNotification(
                "Roślina jeszcze nie dojrzała.",
                "error"
            );
        }

        return false;
    }

    const seedItemId =
        plot.seedItemId;

    const seedItem =
        items[seedItemId];

    const sourceItemId =
        plot.sourceItemId ||
        seedItem?.sourceItemId;

    if (!sourceItemId) {
        return false;
    }

    const quantity =
        getGardenYieldQuantity(seedItem);

    const recoveredSeed =
        rollGardenSeedRecovery();

    addItemToInventory(
        sourceItemId,
        quantity
    );

    if (recoveredSeed) {
        addItemToInventory(
            seedItemId,
            1
        );
    }

    const gardenExp =
        Math.max(
            1,
            quantity * 5
        );

    addGardenExp(gardenExp);

    player.garden.statistics.totalHarvests++;
    player.garden.statistics.totalHarvestedItems +=
        quantity;

    const sourceItem =
        items[sourceItemId];

    plot.seedItemId = null;
    plot.sourceItemId = null;
    plot.plantedAt = 0;
    plot.finishesAt = 0;

    if (
        typeof showNotification ===
        "function"
    ) {
        let message =
            "Zebrano: " +
            (
                sourceItem?.name ||
                sourceItemId
            ) +
            " x" +
            quantity +
            ".";

        if (recoveredSeed) {
            message +=
                " Odzyskano nasiono!";
        }

        showNotification(
            message,
            "success"
        );
    }

    if (
        typeof addSystemLog ===
        "function"
    ) {
        addSystemLog(
            "🌱 Zebrano " +
            (
                sourceItem?.name ||
                sourceItemId
            ) +
            " x" +
            quantity +
            (
                recoveredSeed
                    ? " i odzyskano nasiono."
                    : "."
            ),
            "garden"
        );
    }
    plot.offlineNotified = false;
    saveGame();

    if (
        typeof renderGarden ===
        "function"
    ) {
        renderGarden();
    }

    if (
        typeof renderInventory ===
        "function"
    ) {
        renderInventory();
    }

    return true;
}

function harvestAllGardenPlots() {
    ensureGardenState();

    const unlockedPlotCount =
        getGardenUnlockedPlotCount();

    const readyPlotIndexes = [];

    player.garden.plots
        .slice(0, unlockedPlotCount)
        .forEach((plot, index) => {
            if (isGardenPlotReady(plot)) {
                readyPlotIndexes.push(index);
            }
        });

    if (readyPlotIndexes.length === 0) {
        if (typeof showNotification === "function") {
            showNotification(
                "Brak gotowych roślin do zebrania.",
                "error"
            );
        }

        return false;
    }

    readyPlotIndexes.forEach(plotIndex => {
        harvestGardenPlot(plotIndex);
    });

    return true;
}

function plantAllGardenPlots(seedItemId) {
    ensureGardenState();

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
                "Wybierz prawidłowe nasiono.",
                "error"
            );
        }

        return false;
    }

    const unlockedPlotCount =
        getGardenUnlockedPlotCount();

    const freePlotIndexes = [];

    player.garden.plots
        .slice(0, unlockedPlotCount)
        .forEach((plot, index) => {
            if (!plot.seedItemId) {
                freePlotIndexes.push(index);
            }
        });

    if (freePlotIndexes.length === 0) {
        if (typeof showNotification === "function") {
            showNotification(
                "Brak wolnych grządek.",
                "error"
            );
        }

        return false;
    }

    const inventoryEntry =
        player.inventory.find(entry => {
            return entry.itemId === seedItemId;
        });

    const availableSeeds =
        Math.max(
            0,
            Math.floor(
                Number(inventoryEntry?.quantity) || 0
            )
        );

    if (availableSeeds <= 0) {
        if (typeof showNotification === "function") {
            showNotification(
                "Nie masz wybranego nasiona.",
                "error"
            );
        }

        return false;
    }

    const plotsToPlant =
        freePlotIndexes.slice(
            0,
            Math.min(
                freePlotIndexes.length,
                availableSeeds
            )
        );

    plotsToPlant.forEach(plotIndex => {
        plantGardenSeed(
            plotIndex,
            seedItemId
        );
    });

    return plotsToPlant.length > 0;
}

function getGardenGreenhouseCost() {
    ensureGardenState();

    const level =
        player.garden.upgrades
            .greenhouseLevel;

    if (
        level >=
        GARDEN_GREENHOUSE_MAX_LEVEL
    ) {
        return 0;
    }

    return (
        GARDEN_GREENHOUSE_COSTS[level] ||
        0
    );
}

function buyGardenGreenhouseUpgrade() {
    ensureGardenState();

    const currentLevel =
        player.garden.upgrades
            .greenhouseLevel;

    if (
        currentLevel >=
        GARDEN_GREENHOUSE_MAX_LEVEL
    ) {
        showNotification?.(
            "Szklarnia ma maksymalny poziom.",
            "error"
        );

        return false;
    }

    const cost =
        getGardenGreenhouseCost();

    if (player.gold < cost) {
        showNotification?.(
            "Brakuje złota na ulepszenie szklarni.",
            "error"
        );

        return false;
    }

    player.gold -= cost;

    player.garden.upgrades
        .greenhouseLevel++;

    saveGame();

    renderGarden?.();
    render?.();

    showNotification?.(
        "Ulepszono szklarnię!",
        "success"
    );

    return true;
}

function getGardenSoilCost() {
    ensureGardenState();

    const level =
        player.garden.upgrades
            .fertileSoilLevel;

    if (level >= GARDEN_SOIL_MAX_LEVEL) {
        return 0;
    }

    return GARDEN_SOIL_COSTS[level] || 0;
}

function buyGardenSoilUpgrade() {
    ensureGardenState();

    const level =
        player.garden.upgrades
            .fertileSoilLevel;

    if (level >= GARDEN_SOIL_MAX_LEVEL) {
        showNotification?.(
            "Żyzna gleba ma maksymalny poziom.",
            "error"
        );

        return false;
    }

    const cost = getGardenSoilCost();

    if (player.gold < cost) {
        showNotification?.(
            "Brakuje złota na ulepszenie gleby.",
            "error"
        );

        return false;
    }

    player.gold -= cost;
    player.garden.upgrades.fertileSoilLevel++;

    saveGame();
    renderGarden?.();
    render?.();

    showNotification?.(
        "Ulepszono żyzną glebę!",
        "success"
    );

    return true;
}

function getGardenSeedChestCost() {
    ensureGardenState();

    const level =
        player.garden.upgrades
            .seedChestLevel;

    if (level >= GARDEN_SEED_CHEST_MAX_LEVEL) {
        return 0;
    }

    return GARDEN_SEED_CHEST_COSTS[level] || 0;
}

function buyGardenSeedChestUpgrade() {
    ensureGardenState();

    const level =
        player.garden.upgrades
            .seedChestLevel;

    if (level >= GARDEN_SEED_CHEST_MAX_LEVEL) {
        showNotification?.(
            "Skrzynia nasion ma maksymalny poziom.",
            "error"
        );

        return false;
    }

    const cost = getGardenSeedChestCost();

    if (player.gold < cost) {
        showNotification?.(
            "Brakuje złota na ulepszenie skrzyni nasion.",
            "error"
        );

        return false;
    }

    player.gold -= cost;
    player.garden.upgrades.seedChestLevel++;

    saveGame();
    renderGarden?.();
    render?.();

    showNotification?.(
        "Ulepszono skrzynię nasion!",
        "success"
    );

    return true;
}

function getGardenExpansionCost() {
    ensureGardenState();

    const level =
        player.garden.expansionLevel;

    if (level >= GARDEN_MAX_EXPANSION_LEVEL) {
        return 0;
    }

    return GARDEN_EXPANSION_COSTS[level] || 0;
}

function buyGardenExpansionUpgrade() {
    ensureGardenState();

    const level =
        player.garden.expansionLevel;

    if (level >= GARDEN_MAX_EXPANSION_LEVEL) {
        showNotification?.(
            "Ogród ma już maksymalną rozbudowę.",
            "error"
        );

        return false;
    }

    const cost = getGardenExpansionCost();

    if (player.gold < cost) {
        showNotification?.(
            "Brakuje złota na rozbudowę ogrodu.",
            "error"
        );

        return false;
    }

    player.gold -= cost;
    player.garden.expansionLevel++;

    addSystemLog?.(
        "🧱 Rozbudowano ogród - odblokowano nową grządkę.",
        "garden"
    );

    saveGame();
    renderGarden?.();
    render?.();

    showNotification?.(
        "Rozbudowano ogród!",
        "success"
    );

    return true;
}