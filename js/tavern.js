function getDefaultTavernState() {
    return {
        activeJob: null,
        lastCompletedJob: null,
        completedJobs: 0,
        statistics: {
            totalGoldSpent: 0,
            totalJobsCompleted: 0
        }
    };
}

function ensureTavernState() {
    if (
        !player.tavern ||
        typeof player.tavern !== "object"
    ) {
        player.tavern = getDefaultTavernState();
    }

    if (
        !player.tavern.statistics ||
        typeof player.tavern.statistics !== "object"
    ) {
        player.tavern.statistics = {
            totalGoldSpent: 0,
            totalJobsCompleted: 0
        };
    }

    if (
        typeof player.tavern.lastCompletedJob !== "object"
    ) {
        player.tavern.lastCompletedJob = null;
    }

    if (
        typeof player.tavern.lastResult !== "object"
    ) {
        player.tavern.lastResult = null;
    }

    player.tavern.completedJobs =
        Math.max(
            0,
            Math.floor(
                Number(player.tavern.completedJobs) || 0
            )
        );

    player.tavern.statistics.totalGoldSpent =
        Math.max(
            0,
            Math.floor(
                Number(player.tavern.statistics.totalGoldSpent) || 0
            )
        );

    player.tavern.statistics.totalJobsCompleted =
        Math.max(
            0,
            Math.floor(
                Number(player.tavern.statistics.totalJobsCompleted) || 0
            )
        );
}

function getTavernAdventurer(adventurerId) {
    if (
        typeof tavernAdventurers === "undefined" ||
        !Array.isArray(tavernAdventurers)
    ) {
        return null;
    }

    return (
        tavernAdventurers.find(adventurer => {
            return adventurer.id === adventurerId;
        }) || null
    );
}

function getTavernActivityLabel(activityType) {
    if (activityType === "mining") {
        return "Kopalnia";
    }

    if (activityType === "herbalism") {
        return "Zielarstwo";
    }

    if (activityType === "fishing") {
        return "Łowienie";
    }
    if (activityType === "hunting") {
        return "Polowanie";
    }

    return "Aktywność";
}

function getUnlockedTavernAreas(activityType) {
    if (activityType === "mining") {
        if (typeof ensureMiningState === "function") {
            ensureMiningState();
        }

        return miningAreas.filter(area => {
            const requiredLevel =
                Math.max(
                    1,
                    Math.floor(
                        Number(area.requiredMiningLevel) || 1
                    )
                );

            return player.mining.level >= requiredLevel;
        });
    }

    if (activityType === "herbalism") {
        if (typeof ensureHerbalismState === "function") {
            ensureHerbalismState();
        }

        return herbalismAreas.filter(area => {
            const requiredLevel =
                Math.max(
                    1,
                    Math.floor(
                        Number(area.requiredHerbalismLevel) || 1
                    )
                );

            return player.herbalism.level >= requiredLevel;
        });
    }

    if (activityType === "fishing") {
        if (typeof ensureFishingState === "function") {
            ensureFishingState();
        }

        return fishingAreas.filter(area => {
            const requiredLevel =
                Math.max(
                    1,
                    Math.floor(
                        Number(area.requiredFishingLevel) || 1
                    )
                );

            return player.fishing.level >= requiredLevel;
        });
    }
    if (activityType === "hunting") {
        if (
            typeof locations === "undefined" ||
            !locations
        ) {
            return [];
        }

        const locationList =
            Array.isArray(locations)
                ? locations
                : Object.keys(locations).map(locationId => {
                    return {
                        ...locations[locationId],
                        id: locations[locationId].id || locationId
                    };
                });

        return locationList.filter(location => {
            const requiredLevel =
                Math.max(
                    1,
                    Math.floor(
                        Number(location.requiredLevel) || 1
                    )
                );

            return player.level >= requiredLevel;
        });
    }

    return [];
}

function getTavernArea(activityType, areaId) {
    const areas =
        getUnlockedTavernAreas(activityType);

    return (
        areas.find(area => {
            return area.id === areaId;
        }) || null
    );
}

function hasActiveTavernJob() {
    ensureTavernState();

    return Boolean(player.tavern.activeJob);
}

function getTavernTimeRemainingSeconds() {
    ensureTavernState();

    if (!player.tavern.activeJob) {
        return 0;
    }

    return Math.max(
        0,
        Math.ceil(
            (
                player.tavern.activeJob.finishesAt -
                Date.now()
            ) / 1000
        )
    );
}

function hireTavernAdventurer(
    adventurerId,
    areaId,
    durationMultiplier = 1
) {
    ensureTavernState();

    if (player.tavern.activeJob) {
        if (typeof showNotification === "function") {
            showNotification(
                "Masz już aktywnego śmiałka z karczmy.",
                "error"
            );
        }

        return false;
    }

    const adventurer =
        getTavernAdventurer(adventurerId);

    if (!adventurer) {
        console.warn(
            "Nie znaleziono śmiałka:",
            adventurerId
        );

        return false;
    }

    const area =
        getTavernArea(
            adventurer.activityType,
            areaId
        );

    if (!area) {
        if (typeof showNotification === "function") {
            showNotification(
                "Ten obszar nie jest jeszcze odblokowany.",
                "error"
            );
        }

        return false;
    }

    const safeDurationMultiplier =
        Math.max(
            1,
            Math.floor(
                Number(durationMultiplier) || 1
            )
        );

    const hireCost =
        Math.max(
            0,
            Math.floor(
                Number(adventurer.hireCost) || 0
            )
        ) * safeDurationMultiplier;

    if (player.gold < hireCost) {
        if (typeof showNotification === "function") {
            showNotification(
                "Brakuje złota na wynajęcie śmiałka.",
                "error"
            );
        }

        return false;
    }

    const now = Date.now();

    player.gold -= hireCost;

    player.tavern.activeJob = {
        adventurerId: adventurer.id,
        activityType: adventurer.activityType,
        areaId: area.id,
        startedAt: now,
        finishesAt:
            now +
            Math.max(
                1,
                Number(adventurer.durationMinutes) || 60
            ) *
            safeDurationMultiplier *
            60 *
            1000,
        hireCost: hireCost,
        durationMultiplier: safeDurationMultiplier,
        efficiencyPercent:
            Math.max(
                1,
                Number(adventurer.efficiencyPercent) || 10
            )
    };

    player.tavern.statistics.totalGoldSpent +=
        hireCost;

    if (typeof addSystemLog === "function") {
        addSystemLog(
            adventurer.icon +
            " Wynajęto śmiałka: " +
            adventurer.name +
            " do obszaru: " +
            area.name +
            ".",
            "tavern"
        );
    }

    if (typeof showNotification === "function") {
        showNotification(
            "Wynajęto: " + adventurer.name + ".",
            "success"
        );
    }

    saveGame();

    saveGame();

    if (typeof renderAdventurersTavern === "function") {
        renderAdventurersTavern();
    }

    if (typeof updateAdventurersTavernTimer === "function") {
        updateAdventurersTavernTimer();
    }

    if (typeof render === "function") {
        render();
    }

    return true;
}

function cancelTavernJob() {
    ensureTavernState();

    if (!player.tavern.activeJob) {
        return false;
    }

    const job =
        player.tavern.activeJob;

    const adventurer =
        getTavernAdventurer(
            job.adventurerId
        );

    player.tavern.activeJob = null;

    if (typeof addSystemLog === "function") {
        addSystemLog(
            "↩️ Anulowano zlecenie śmiałka: " +
            (
                adventurer?.name ||
                "nieznany śmiałek"
            ) +
            ".",
            "tavern"
        );
    }

    if (typeof showNotification === "function") {
        showNotification(
            "Anulowano zlecenie śmiałka.",
            "success"
        );
    }

    saveGame();

    if (typeof renderAdventurersTavern === "function") {
        renderAdventurersTavern();
    }

    return true;
}

function getTavernAreaByJob(job) {
    if (!job) {
        return null;
    }

    if (job.activityType === "mining") {
        return typeof getMiningArea === "function"
            ? getMiningArea(job.areaId)
            : null;
    }

    if (job.activityType === "herbalism") {
        return typeof getHerbalismArea === "function"
            ? getHerbalismArea(job.areaId)
            : null;
    }

    if (job.activityType === "fishing") {
        return typeof getFishingArea === "function"
            ? getFishingArea(job.areaId)
            : null;
    }

    return null;
}

function getTavernDropExpKey(activityType) {
    if (activityType === "mining") {
        return "miningExp";
    }

    if (activityType === "herbalism") {
        return "herbalismExp";
    }

    if (activityType === "fishing") {
        return "fishingExp";
    }

    return null;
}

function getRandomWeightedTavernDrop(drops) {
    if (
        !Array.isArray(drops) ||
        drops.length === 0
    ) {
        return null;
    }

    const totalWeight =
        drops.reduce((total, drop) => {
            return total + Math.max(
                0,
                Number(drop.weight) || 0
            );
        }, 0);

    if (totalWeight <= 0) {
        return drops[0];
    }

    let roll =
        Math.random() * totalWeight;

    for (const drop of drops) {
        roll -= Math.max(
            0,
            Number(drop.weight) || 0
        );

        if (roll <= 0) {
            return drop;
        }
    }

    return drops[drops.length - 1];
}

function addTavernRewardToMap(
    rewardMap,
    drop,
    rarityGroup,
    activityType
) {
    if (!drop || !drop.itemId) {
        return;
    }

    if (!rewardMap[drop.itemId]) {
        rewardMap[drop.itemId] = {
            itemId: drop.itemId,
            quantity: 0,
            rarityGroup: rarityGroup,
            experience: 0
        };
    }

    const expKey =
        getTavernDropExpKey(activityType);

    rewardMap[drop.itemId].quantity++;

    if (expKey) {
        rewardMap[drop.itemId].experience +=
            Math.max(
                0,
                Math.floor(
                    Number(drop[expKey]) || 0
                )
            );
    }
}

function generateTavernJobRewards(job, area) {
    if (!job || !area) {
        return {
            rewards: [],
            completedCycles: 0,
            totalExp: 0
        };
    }

    const durationSeconds =
        Math.max(
            1,
            Math.floor(
                (
                    job.finishesAt -
                    job.startedAt
                ) / 1000
            )
        );

    const areaDurationSeconds =
        Math.max(
            1,
            Math.floor(
                Number(area.durationSeconds) || 1
            )
        );

    const fullCycles =
        Math.floor(
            durationSeconds /
            areaDurationSeconds
        );

    const completedCycles =
        Math.max(
            1,
            Math.floor(
                fullCycles *
                Math.max(
                    1,
                    Number(job.efficiencyPercent) || 10
                ) /
                100
            )
        );

    const rewardMap = {};

    for (
        let cycleIndex = 0;
        cycleIndex < completedCycles;
        cycleIndex++
    ) {
        const basicDrop =
            getRandomWeightedTavernDrop(
                area.basicDrops
            );

        addTavernRewardToMap(
            rewardMap,
            basicDrop,
            "basic",
            job.activityType
        );

        const rareChance =
            Math.max(
                0,
                Number(area.rareChance) || 0
            );

        if (Math.random() * 100 < rareChance) {
            const rareDrop =
                getRandomWeightedTavernDrop(
                    area.rareDrops
                );

            addTavernRewardToMap(
                rewardMap,
                rareDrop,
                "rare",
                job.activityType
            );
        }

        const exceptionalChance =
            Math.max(
                0,
                Number(area.exceptionalChance) || 0
            );

        if (
            Array.isArray(area.exceptionalDrops) &&
            Math.random() * 100 < exceptionalChance
        ) {
            const exceptionalDrop =
                getRandomWeightedTavernDrop(
                    area.exceptionalDrops
                );

            addTavernRewardToMap(
                rewardMap,
                exceptionalDrop,
                "exceptional",
                job.activityType
            );
        }

        const treasureChance =
            Math.max(
                0,
                Number(area.treasureChance) || 0
            );

        if (
            Array.isArray(area.treasureDrops) &&
            Math.random() * 100 < treasureChance
        ) {
            const treasureDrop =
                getRandomWeightedTavernDrop(
                    area.treasureDrops
                );

            addTavernRewardToMap(
                rewardMap,
                treasureDrop,
                "treasure",
                job.activityType
            );
        }
    }

    const rewards =
        Object.values(rewardMap)
            .filter(reward => {
                return reward.quantity > 0;
            });

    const totalExp =
        rewards.reduce((total, reward) => {
            return total + Math.max(
                0,
                Math.floor(
                    Number(reward.experience) || 0
                )
            );
        }, 0);

    return {
        rewards,
        completedCycles,
        totalExp
    };
}

function applyTavernJobProfessionProgress(
    job,
    area,
    rewards,
    completedCycles,
    totalExp
) {
    if (job.activityType === "mining") {
        if (
            typeof recordMiningProgress === "function"
        ) {
            recordMiningProgress(
                rewards,
                completedCycles,
                area.id
            );
        }

        if (
            typeof addMiningExp === "function"
        ) {
            addMiningExp(totalExp);
        }

        return;
    }

    if (job.activityType === "herbalism") {
        if (
            typeof recordHerbalismProgress === "function"
        ) {
            recordHerbalismProgress(
                rewards,
                completedCycles,
                area.id
            );
        }

        if (
            typeof addHerbalismExp === "function"
        ) {
            addHerbalismExp(totalExp);
        }

        return;
    }

    if (job.activityType === "fishing") {
        if (
            typeof recordFishingProgress === "function"
        ) {
            recordFishingProgress(
                rewards,
                completedCycles,
                area.id
            );
        }

        if (
            typeof addFishingExp === "function"
        ) {
            addFishingExp(totalExp);
        }
    }
}

function completeTavernJob() {
    ensureTavernState();

    const job =
        player.tavern.activeJob;

    if (!job) {
        return false;
    }

    const adventurer =
        getTavernAdventurer(
            job.adventurerId
        );

    const area =
        getTavernAreaByJob(job);

    if (!adventurer || !area) {
        player.tavern.activeJob = null;
        saveGame();

        if (typeof renderAdventurersTavern === "function") {
            renderAdventurersTavern();
        }

        return false;
    }

    const result =
        generateTavernJobRewards(
            job,
            area
        );

    result.rewards.forEach(reward => {
        addItemToInventory(
            reward.itemId,
            reward.quantity
        );
    });

    applyTavernJobProfessionProgress(
        job,
        area,
        result.rewards,
        result.completedCycles,
        result.totalExp
    );

    player.tavern.completedJobs++;
    player.tavern.statistics.totalJobsCompleted++;

    player.tavern.lastResult = {
        time: Date.now(),
        adventurerId: adventurer.id,
        activityType: job.activityType,
        areaId: area.id,
        completedCycles: result.completedCycles,
        totalExp: result.totalExp,
        rewards: result.rewards
    };

    player.tavern.activeJob = null;

    const totalItems =
        result.rewards.reduce((total, reward) => {
            return total + reward.quantity;
        }, 0);

    if (typeof addSystemLog === "function") {
        addSystemLog(
            adventurer.icon +
            " " +
            adventurer.name +
            " wrócił z obszaru " +
            area.name +
            ". Przyniósł " +
            totalItems +
            " przedmiotów i +" +
            result.totalExp +
            " EXP.",
            "tavern"
        );
    }

    if (typeof showNotification === "function") {
        showNotification(
            adventurer.name +
            " zakończył zlecenie.",
            "success"
        );
    }

    saveGame();

    if (typeof renderInventory === "function") {
        renderInventory();
    }

    if (typeof renderAdventurersTavern === "function") {
        renderAdventurersTavern();
    }

    if (typeof render === "function") {
        render();
    }

    return true;
}

function checkTavernJobCompletion() {
    ensureTavernState();

    if (!player.tavern.activeJob) {
        return false;
    }

    if (
        player.tavern.activeJob.finishesAt >
        Date.now()
    ) {
        return false;
    }

    return completeTavernJob();
}

function setTavernMenuActive() {
    const menuButtons =
        document.querySelectorAll(
            "[data-menu-section]"
        );

    menuButtons.forEach(button => {
        button.classList.remove("active");
    });

    const tavernButton =
        document.querySelector(
            '[data-menu-section="tavern"]'
        );

    if (tavernButton) {
        tavernButton.classList.add("active");
    }

    const townCategory =
        document.getElementById(
            "menu-category-town"
        );

    if (townCategory) {
        townCategory.hidden = false;
    }

    const townToggle =
        document.querySelector(
            '[aria-controls="menu-category-town"]'
        );

    if (townToggle) {
        townToggle.setAttribute(
            "aria-expanded",
            "true"
        );
    }
}

function openTavernScreen() {
    ensureTavernState();

    if (
        typeof checkTavernJobCompletion === "function"
    ) {
        checkTavernJobCompletion({
            render: false
        });
    }

    if (typeof showScreen === "function") {
        showScreen("screen-tavern");
    }

    if (
        typeof renderAdventurersTavern === "function"
    ) {
        renderAdventurersTavern();
    }
}



function getTavernJobAreaDefinition(job) {
    if (!job) {
        return null;
    }

    if (job.activityType === "mining") {
        return typeof getMiningArea === "function"
            ? getMiningArea(job.areaId)
            : null;
    }

    if (job.activityType === "herbalism") {
        return typeof getHerbalismArea === "function"
            ? getHerbalismArea(job.areaId)
            : null;
    }

    if (job.activityType === "fishing") {
        return typeof getFishingArea === "function"
            ? getFishingArea(job.areaId)
            : null;
    }
    if (job.activityType === "hunting") {
        if (
            typeof locations === "undefined" ||
            !locations
        ) {
            return null;
        }

        if (Array.isArray(locations)) {
            return (
                locations.find(location => {
                    return location.id === job.areaId;
                }) || null
            );
        }

        return locations[job.areaId] || null;
    }
    return null;
}

function rollWeightedTavernDrop(drops) {
    if (
        !Array.isArray(drops) ||
        drops.length === 0
    ) {
        return null;
    }

    const totalWeight =
        drops.reduce((total, drop) => {
            return total + Math.max(
                0,
                Number(drop.weight) || 0
            );
        }, 0);

    if (totalWeight <= 0) {
        return null;
    }

    let roll =
        Math.random() * totalWeight;

    for (const drop of drops) {
        roll -= Math.max(
            0,
            Number(drop.weight) || 0
        );

        if (roll <= 0) {
            return drop;
        }
    }

    return drops[drops.length - 1];
}

function rollTavernRewardDrop(job, area) {
    if (!job || !area) {
        return null;
    }

    const rareChance =
        Math.max(
            0,
            Number(area.rareChance) || 0
        );

    const exceptionalChance =
        Math.max(
            0,
            Number(area.exceptionalChance) || 0
        );

    const treasureChance =
        Math.max(
            0,
            Number(area.treasureChance) || 0
        );

    if (
        job.activityType === "fishing" &&
        Array.isArray(area.treasureDrops) &&
        Math.random() * 100 < treasureChance
    ) {
        return rollWeightedTavernDrop(
            area.treasureDrops
        );
    }

    if (
        Array.isArray(area.exceptionalDrops) &&
        Math.random() * 100 < exceptionalChance
    ) {
        return rollWeightedTavernDrop(
            area.exceptionalDrops
        );
    }

    if (
        Array.isArray(area.rareDrops) &&
        Math.random() * 100 < rareChance
    ) {
        return rollWeightedTavernDrop(
            area.rareDrops
        );
    }

    return rollWeightedTavernDrop(
        area.basicDrops || []
    );
}

function getTavernJobCycleCount(job, area) {
    if (!job || !area) {
        return 0;
    }

    const startedAt =
        Math.max(
            0,
            Number(job.startedAt) || 0
        );

    const finishesAt =
        Math.max(
            startedAt,
            Number(job.finishesAt) || startedAt
        );

    const durationSeconds =
        Math.max(
            1,
            Math.floor(
                (finishesAt - startedAt) / 1000
            )
        );

    const areaCycleSeconds =
        Math.max(
            1,
            Math.floor(
                Number(area.durationSeconds) || 10
            )
        );

    const fullPlayerCycles =
        Math.floor(
            durationSeconds / areaCycleSeconds
        );

    const efficiencyPercent =
        Math.max(
            1,
            Number(job.efficiencyPercent) || 10
        );

    return Math.max(
        1,
        Math.floor(
            fullPlayerCycles *
            efficiencyPercent /
            100
        )
    );
}

function addTavernRewardToList(rewards, itemId, quantity) {
    if (!itemId || quantity <= 0) {
        return;
    }

    const existingReward =
        rewards.find(reward => {
            return reward.itemId === itemId;
        });

    if (existingReward) {
        existingReward.quantity += quantity;
        return;
    }

    rewards.push({
        itemId,
        quantity
    });
}

function getTavernHuntingEnemies(location) {
    if (!location) {
        return [];
    }

    if (Array.isArray(location.enemies)) {
        return location.enemies;
    }

    if (Array.isArray(location.monsters)) {
        return location.monsters;
    }

    if (Array.isArray(location.enemyIds)) {
        return location.enemyIds
            .map(enemyId => {
                if (
                    typeof enemies !== "undefined" &&
                    enemies &&
                    enemies[enemyId]
                ) {
                    return enemies[enemyId];
                }

                return null;
            })
            .filter(Boolean);
    }

    return [];
}

function rollTavernHuntingEnemy(location) {
    const enemiesList =
        getTavernHuntingEnemies(location);

    if (enemiesList.length === 0) {
        return null;
    }

    const randomIndex =
        Math.floor(
            Math.random() * enemiesList.length
        );

    return enemiesList[randomIndex];
}

function addTavernGoldRewardToList(rewards, quantity) {
    const safeQuantity =
        Math.max(
            0,
            Math.floor(
                Number(quantity) || 0
            )
        );

    if (safeQuantity <= 0) {
        return;
    }

    const existingReward =
        rewards.find(reward => {
            return reward.type === "gold";
        });

    if (existingReward) {
        existingReward.quantity += safeQuantity;
        return;
    }

    rewards.push({
        type: "gold",
        quantity: safeQuantity
    });
}

function rollTavernEnemyLoot(enemyData, rewards) {
    if (
        !enemyData ||
        !Array.isArray(enemyData.loot)
    ) {
        return;
    }

    enemyData.loot.forEach(lootEntry => {
        const chance =
            Math.max(
                0,
                Number(
                    lootEntry.chance ||
                    lootEntry.dropChance ||
                    0
                ) || 0
            );

        if (
            chance > 0 &&
            Math.random() * 100 > chance
        ) {
            return;
        }

        const itemId =
            lootEntry.itemId ||
            lootEntry.item ||
            lootEntry.id;

        if (!itemId) {
            return;
        }

        const minQuantity =
            Math.max(
                1,
                Math.floor(
                    Number(
                        lootEntry.minQuantity ||
                        lootEntry.quantity ||
                        1
                    ) || 1
                )
            );

        const maxQuantity =
            Math.max(
                minQuantity,
                Math.floor(
                    Number(
                        lootEntry.maxQuantity ||
                        lootEntry.quantity ||
                        minQuantity
                    ) || minQuantity
                )
            );

        const quantity =
            minQuantity +
            Math.floor(
                Math.random() *
                (
                    maxQuantity -
                    minQuantity +
                    1
                )
            );

        addTavernRewardToList(
            rewards,
            itemId,
            quantity
        );
    });
}

function generateTavernHuntingRewards(job, location) {
    const rewards = [];

    const cycleCount =
        getTavernJobCycleCount(
            job,
            {
                ...location,
                durationSeconds:
                    location.durationSeconds || 60
            }
        );

    for (
        let index = 0;
        index < cycleCount;
        index++
    ) {
        const enemyData =
            rollTavernHuntingEnemy(location);

        if (!enemyData) {
            continue;
        }

        const enemyGold =
            Math.max(
                0,
                Math.floor(
                    Number(enemyData.gold) || 0
                )
            );

        addTavernGoldRewardToList(
            rewards,
            enemyGold
        );

        rollTavernEnemyLoot(
            enemyData,
            rewards
        );
    }

    return rewards;
}

function generateTavernJobRewards(job) {
    const area =
        getTavernJobAreaDefinition(job);

    if (!job || !area) {
        return [];
    }

    if (job.activityType === "hunting") {
        return generateTavernHuntingRewards(
            job,
            area
        );
    }

    const cycleCount =
        getTavernJobCycleCount(
            job,
            area
        );

    const rewards = [];

    for (
        let index = 0;
        index < cycleCount;
        index++
    ) {
        const drop =
            rollTavernRewardDrop(
                job,
                area
            );

        if (!drop || !drop.itemId) {
            continue;
        }

        addTavernRewardToList(
            rewards,
            drop.itemId,
            1
        );
    }

    return rewards;
}

function getTavernRewardsText(rewards) {
    if (
        !Array.isArray(rewards) ||
        rewards.length === 0
    ) {
        return "brak łupów";
    }

    return rewards
        .map(reward => {
            if (reward.type === "gold") {
                return (
                    "Złoto x" +
                    reward.quantity
                );
            }

            const item =
                typeof items !== "undefined"
                    ? items[reward.itemId]
                    : null;

            return (
                (item?.name || reward.itemId) +
                " x" +
                reward.quantity
            );
        })
        .join(", ");
}

function completeTavernJob(options = {}) {
    ensureTavernState();

    const job =
        player.tavern.activeJob;

    if (!job) {
        return false;
    }

    if (Date.now() < job.finishesAt) {
        return false;
    }

    const adventurer =
        getTavernAdventurer(
            job.adventurerId
        );

    const area =
        getTavernJobAreaDefinition(job);

    const rewards =
        generateTavernJobRewards(job);



    player.tavern.lastCompletedJob = {
        adventurerId: job.adventurerId,
        activityType: job.activityType,
        areaId: job.areaId,
        completedAt: Date.now(),
        rewards: rewards,
        claimed: false
    };

    player.tavern.activeJob = null;
    player.tavern.completedJobs++;

    player.tavern.statistics.totalJobsCompleted =
        Math.max(
            0,
            Math.floor(
                Number(
                    player.tavern.statistics.totalJobsCompleted
                ) || 0
            )
        ) + 1;

    const rewardsText =
        getTavernRewardsText(rewards);

    if (typeof addSystemLog === "function") {
        addSystemLog(
            "🍺 Śmiałek wrócił z pracy: " +
            (
                adventurer?.name ||
                "nieznany śmiałek"
            ) +
            " z obszaru " +
            (
                area?.name ||
                job.areaId
            ) +
            ". Zdobyto: " +
            rewardsText +
            ".",
            "tavern"
        );
    }

    if (typeof showNotification === "function") {
        showNotification(
            "Śmiałek wrócił z łupami!",
            "success"
        );
    }

    saveGame();

    if (
        options.render !== false &&
        typeof renderAdventurersTavern === "function"
    ) {
        renderAdventurersTavern();
    }

    if (
        options.render !== false &&
        typeof renderInventory === "function"
    ) {
        renderInventory();
    }

    return true;
}

function checkTavernJobCompletion(options = {}) {
    return completeTavernJob(options);
}

setInterval(() => {
    if (
        typeof player === "undefined" ||
        !player.tavern ||
        !player.tavern.activeJob
    ) {
        return;
    }

    const completed =
        checkTavernJobCompletion();

    if (
        !completed &&
        typeof renderAdventurersTavern === "function"
    ) {
        const tavernScreen =
            document.getElementById("screen-tavern");

        const isTavernVisible =
            tavernScreen &&
            window.getComputedStyle(
                tavernScreen
            ).display !== "none";

        if (isTavernVisible) {
            renderAdventurersTavern();
        }
    }
}, 1000);


function claimTavernLastReturn() {
    ensureTavernState();

    const lastJob =
        player.tavern.lastCompletedJob;

    if (
        !lastJob ||
        lastJob.claimed === true
    ) {
        if (typeof showNotification === "function") {
            showNotification(
                "Nie ma łupów do odebrania.",
                "error"
            );
        }

        return false;
    }

    const rewards =
        Array.isArray(lastJob.rewards)
            ? lastJob.rewards
            : [];

    rewards.forEach(reward => {
        if (reward.type === "gold") {
            player.gold +=
                Math.max(
                    0,
                    Math.floor(
                        Number(reward.quantity) || 0
                    )
                );

            return;
        }

        if (
            reward.itemId &&
            typeof addItemToInventory === "function"
        ) {
            addItemToInventory(
                reward.itemId,
                reward.quantity
            );
        }
    });

    lastJob.claimed = true;

    if (typeof addSystemLog === "function") {
        addSystemLog(
            "🎒 Odebrano łupy ze zlecenia śmiałka.",
            "tavern"
        );
    }

    if (typeof showNotification === "function") {
        showNotification(
            "Odebrano łupy z karczmy.",
            "success"
        );
    }

    saveGame();

    if (
        typeof renderAdventurersTavern ===
        "function"
    ) {
        renderAdventurersTavern();
    }

    if (typeof renderInventory === "function") {
        renderInventory();
    }

    if (typeof render === "function") {
        render();
    }

    return true;
}