function getDungeonDefinition(dungeonId) {
    return dungeons[dungeonId] || null;
}

function createDungeonProgress() {
    return {
        active: false,
        roomIndex: 0,
        completed: false,
        completionCount: 0,
        failedRuns: 0,
        enteredAt: 0,
        completedAt: 0
    };
}

function ensureDungeonProgress(dungeonId) {
    if (
        !player.dungeons ||
        typeof player.dungeons !== "object" ||
        Array.isArray(player.dungeons)
    ) {
        player.dungeons = {};
    }

    if (
        !player.dungeons[dungeonId] ||
        typeof player.dungeons[dungeonId] !== "object" ||
        Array.isArray(player.dungeons[dungeonId])
    ) {
        player.dungeons[dungeonId] =
            createDungeonProgress();
    }

    const progress = player.dungeons[dungeonId];
    const dungeon = getDungeonDefinition(dungeonId);
    const roomCount = dungeon?.rooms?.length || 1;

    progress.active = progress.active === true;
    progress.completed = progress.completed === true;
    progress.roomIndex = Math.max(
        0,
        Math.min(
            roomCount - 1,
            Math.floor(Number(progress.roomIndex) || 0)
        )
    );
    progress.completionCount = Math.max(
        0,
        Math.floor(Number(progress.completionCount) || 0)
    );
    progress.failedRuns = Math.max(
        0,
        Math.floor(Number(progress.failedRuns) || 0)
    );
    progress.enteredAt = Math.max(
        0,
        Number(progress.enteredAt) || 0
    );
    progress.completedAt = Math.max(
        0,
        Number(progress.completedAt) || 0
    );

    return progress;
}

function ensureDungeonState() {
    Object.keys(dungeons).forEach(dungeonId => {
        ensureDungeonProgress(dungeonId);
    });
}

function getActiveDungeonId() {
    ensureDungeonState();

    return Object.keys(dungeons).find(dungeonId => {
        return ensureDungeonProgress(dungeonId).active;
    }) || null;
}

function isDungeonRunActive() {
    return Boolean(getActiveDungeonId());
}

function getActiveDungeonState() {
    const dungeonId = getActiveDungeonId();

    if (!dungeonId) {
        return null;
    }

    const dungeon = getDungeonDefinition(dungeonId);
    const progress = ensureDungeonProgress(dungeonId);
    const room = dungeon.rooms[progress.roomIndex] || null;

    return {
        dungeonId,
        dungeon,
        progress,
        room,
        roomNumber: progress.roomIndex + 1,
        roomCount: dungeon.rooms.length
    };
}

function prepareDungeonRoom(dungeonId) {
    const state = getActiveDungeonState();

    if (!state || state.dungeonId !== dungeonId || !state.room) {
        return false;
    }

    const room = state.room;

    Object.assign(enemy, {
        id: room.id,
        name: room.name,
        hp: room.hp,
        maxHp: room.hp,
        attack: room.attack,
        gold: room.gold,
        exp: room.exp,
        loot: room.loot || [],
        baseName: room.name,
        encounterType: room.isBoss ? "dungeon_boss" : "dungeon",
        encounterLabel: room.isBoss ? "👑 BOSS LOCHU" : "🗝️ LOCH",
        lootChanceMultiplier: 1,
        eliteModifierId: null,
        eliteModifierLabel: "",
        eliteModifierDescription: "",
        isDungeonEncounter: true,
        dungeonId,
        dungeonRoomIndex: state.progress.roomIndex
    });

    player.isBossFight = false;

    if (typeof recordBestiaryEncounter === "function") {
        recordBestiaryEncounter(enemy, player.location);
    }

    return true;
}

function hasActiveActivityBeforeDungeon() {
    const combatActive =
        typeof isFighting !== "undefined" &&
        isFighting;

    const miningActive =
        player.mining?.isMining === true;

    const herbalismActive =
        player.herbalism?.isGathering === true;

    const fishingActive =
        player.fishing?.isFishing === true;

    const alchemyActive =
        player.alchemy?.isCrafting === true ||
        (
            Array.isArray(player.alchemy?.queue) &&
            player.alchemy.queue.length > 0
        );

    return (
        combatActive ||
        miningActive ||
        herbalismActive ||
        fishingActive ||
        alchemyActive
    );
}

function confirmDungeonActivityInterrupt(dungeon) {
    if (!hasActiveActivityBeforeDungeon()) {
        return true;
    }

    return window.confirm(
        "Wejście do lochu przerwie aktualne aktywności.\n\n" +
        "Czy na pewno chcesz rozpocząć wyprawę do lochu: " +
        dungeon.name +
        "?"
    );
}

function stopActivitiesBeforeDungeon() {
    if (typeof prepareActivityStart === "function") {
        prepareActivityStart(ACTIVITY_TYPES.COMBAT);
        return;
    }

    if (
        typeof isFighting !== "undefined" &&
        isFighting &&
        typeof stopFight === "function"
    ) {
        stopFight(false);
    }

    if (
        player.mining?.isMining &&
        typeof stopMining === "function"
    ) {
        stopMining(false);
    }

    if (
        player.herbalism?.isGathering &&
        typeof stopHerbalism === "function"
    ) {
        stopHerbalism(false);
    }

    if (
        player.fishing?.isFishing &&
        typeof stopFishing === "function"
    ) {
        stopFishing(false);
    }

    if (
        (
            player.alchemy?.isCrafting ||
            player.alchemy?.queue?.length > 0
        ) &&
        typeof cancelAlchemyActivity === "function"
    ) {
        cancelAlchemyActivity(true);
    }
}

function hasActiveActivityBeforeDungeon() {
    const combatActive =
        typeof isFighting !== "undefined" &&
        isFighting;

    const miningActive =
        player.mining?.isMining === true;

    const herbalismActive =
        player.herbalism?.isGathering === true;

    const fishingActive =
        player.fishing?.isFishing === true;

    const alchemyActive =
        player.alchemy?.isCrafting === true ||
        (
            Array.isArray(player.alchemy?.queue) &&
            player.alchemy.queue.length > 0
        );

    return (
        combatActive ||
        miningActive ||
        herbalismActive ||
        fishingActive ||
        alchemyActive
    );
}

function confirmDungeonActivityInterrupt(dungeon) {
    if (!hasActiveActivityBeforeDungeon()) {
        return true;
    }

    return window.confirm(
        "Wejście do lochu przerwie aktualne aktywności.\n\n" +
        "Czy na pewno chcesz rozpocząć wyprawę do lochu: " +
        dungeon.name +
        "?"
    );
}

function stopActivitiesBeforeDungeon() {
    if (typeof prepareActivityStart === "function") {
        prepareActivityStart(ACTIVITY_TYPES.COMBAT);
        return;
    }

    if (
        typeof isFighting !== "undefined" &&
        isFighting &&
        typeof stopFight === "function"
    ) {
        stopFight(false);
    }

    if (
        player.mining?.isMining &&
        typeof stopMining === "function"
    ) {
        stopMining(false);
    }

    if (
        player.herbalism?.isGathering &&
        typeof stopHerbalism === "function"
    ) {
        stopHerbalism(false);
    }

    if (
        player.fishing?.isFishing &&
        typeof stopFishing === "function"
    ) {
        stopFishing(false);
    }

    if (
        (
            player.alchemy?.isCrafting ||
            player.alchemy?.queue?.length > 0
        ) &&
        typeof cancelAlchemyActivity === "function"
    ) {
        cancelAlchemyActivity(true);
    }
}

function startDungeonRun(dungeonId) {
    const dungeon = getDungeonDefinition(dungeonId);

    if (!dungeon) {
        return false;
    }

    const progress = ensureDungeonProgress(dungeonId);

    if (progress.active) {
        showScreen("screen-combat");

        if (!isFighting) {
            player.combatCooldownUntil = 0;
            startFight();
        }

        return true;
    }

    const keyQuantity =
        typeof getInventoryItemQuantity === "function"
            ? getInventoryItemQuantity(dungeon.keyItemId)
            : 0;

    if (keyQuantity <= 0) {
        showNotification(
            "Potrzebujesz klucza do tego lochu.",
            "error"
        );

        return false;
    }

    if (!confirmDungeonActivityInterrupt(dungeon)) {
        return false;
    }

    stopActivitiesBeforeDungeon();

    removeItemFromInventory(dungeon.keyItemId, 1);

    progress.active = true;
    progress.roomIndex = 0;
    progress.enteredAt = Date.now();

    clearEnemyCombatEffects();
    clearCombatLog();
    prepareDungeonRoom(dungeonId);

    addCombatLog(
        dungeon.icon +
        " Rozpoczynasz wyprawę: " +
        dungeon.name +
        "."
    );

    addCombatLog(
        "🚪 Pomieszczenie 1/" +
        dungeon.rooms.length +
        ": " +
        dungeon.rooms[0].name +
        "."
    );

    if (typeof addSystemLog === "function") {
        addSystemLog(
            dungeon.icon +
            " Rozpoczęto wyprawę do lochu: " +
            dungeon.name +
            ".",
            "dungeon"
        );
    }

    player.combatCooldownUntil = 0;

    saveGame();
    showScreen("screen-combat");
    startFight();

    return true;
}

function startGoblinHideoutDungeon() {
    return startDungeonRun("goblinHideout");
}

function completeDungeonRun(state) {
    const { dungeon, progress } = state;
    const rewards = dungeon.completionRewards || {};

    progress.active = false;
    progress.completed = true;
    progress.completionCount++;
    progress.completedAt = Date.now();

    const goldReward = Math.max(0, Number(rewards.gold) || 0);
    const expReward = Math.max(0, Number(rewards.exp) || 0);

    player.gold += goldReward;
    player.exp += expReward;

    (rewards.items || []).forEach(reward => {
        addItemToInventory(reward.item, reward.quantity || 1);
    });

    addCombatLog(
        "🏆 Ukończono loch: " + dungeon.name + "!"
    );
    addCombatLog(
        "⭐ Nagroda za ukończenie: " + expReward +
        " EXP i " + goldReward + " złota."
    );

    if (typeof addSystemLog === "function") {
        addSystemLog(
            "🏆 Ukończono loch " + dungeon.name +
            " (razem: " + progress.completionCount + ").",
            "dungeon"
        );
    }

    stopFight(false);
    clearEnemyCombatEffects();
    spawnEnemy();
    saveGame();
    showScreen("screen-dungeons");
    renderDungeons();
}

function handleDungeonEnemyDefeat(defeatedEnemy) {
    const state = getActiveDungeonState();

    if (
        !state ||
        defeatedEnemy?.dungeonId !== state.dungeonId ||
        defeatedEnemy?.dungeonRoomIndex !== state.progress.roomIndex
    ) {
        return false;
    }

    if (state.roomNumber >= state.roomCount) {
        completeDungeonRun(state);
        return true;
    }

    state.progress.roomIndex++;
    clearEnemyCombatEffects();
    prepareDungeonRoom(state.dungeonId);

    addCombatLog(
        "🚪 Pomieszczenie " +
        (state.progress.roomIndex + 1) + "/" +
        state.roomCount + ": " + enemy.name + "."
    );

    saveGame();

    if (typeof renderDungeons === "function") {
        renderDungeons();
    }

    return true;
}

function abandonDungeonRun(reason = "Wyprawa została przerwana.") {
    const state = getActiveDungeonState();

    if (!state) {
        return false;
    }

    state.progress.active = false;
    state.progress.roomIndex = 0;
    state.progress.failedRuns++;

    stopFight(false);
    clearEnemyCombatEffects();
    spawnEnemy();

    addCombatLog("💨 " + reason);

    if (typeof addSystemLog === "function") {
        addSystemLog(
            "💨 " + state.dungeon.name + ": " + reason,
            "dungeon"
        );
    }

    saveGame();
    showScreen("screen-dungeons");
    renderDungeons();

    return true;
}
