/*
 * Lochy offline.
 *
 * Jeżeli gra została zamknięta w trakcie wyprawy do lochu, liczymy ją tak jak
 * walkę offline: zadane obrażenia z całego okna czasowego rozdzielamy na kolejne
 * pomieszczenia. Po ukończeniu (lub porażce) bohater wraca do aktywności, którą
 * miał przed wejściem do lochu, a pozostały czas jest liczony już dla niej.
 */

function getOfflineDungeonInventorySnapshot() {
    const totals = {};

    (Array.isArray(player.inventory) ? player.inventory : []).forEach(slot => {
        const itemId = slot?.id || slot?.itemId;

        if (!itemId) {
            return;
        }

        totals[itemId] = (totals[itemId] || 0) + (Number(slot.quantity) || 1);
    });

    return totals;
}

function getOfflineDungeonLootGained(before) {
    const after = getOfflineDungeonInventorySnapshot();

    return Object.keys(after)
        .map(itemId => ({
            itemId,
            quantity: after[itemId] - (before[itemId] || 0)
        }))
        .filter(entry => entry.quantity > 0);
}

/*
 * Ustawia stan gracza tak, jakby wrócił do aktywności sprzed lochu,
 * żeby zwykłe liczenie offline mogło ją policzyć dla pozostałego czasu.
 */
function restoreActivityStateForOffline(activityType) {
    if (typeof normalizeLoadedActivityState === "function") {
        normalizeLoadedActivityState(activityType || null);
    }

    if (activityType === "mining" && player.mining) {
        player.mining.activeAreaId = player.mining.selectedAreaId;
        player.mining.cycleStartedAt = 0;
        player.mining.cycleDurationMs = 0;
    } else if (activityType === "herbalism" && player.herbalism) {
        player.herbalism.activeAreaId = player.herbalism.selectedAreaId;
        player.herbalism.cycleStartedAt = 0;
        player.herbalism.cycleDurationMs = 0;
    } else if (activityType === "fishing" && player.fishing) {
        player.fishing.activeAreaId = player.fishing.selectedAreaId;
        player.fishing.activeBaitId = player.fishing.selectedBaitId;
        player.fishing.cycleStartedAt = 0;
        player.fishing.cycleDurationMs = 0;
    } else if (activityType === "combat") {
        if (typeof spawnEnemy === "function") {
            spawnEnemy();
        }
    }
}

function grantOfflineDungeonRoomReward(room) {
    const bonuses =
        typeof getSetKillRewardBonuses === "function"
            ? getSetKillRewardBonuses()
            : { goldPercent: 0, expPercent: 0 };

    const gold = Math.floor(
        (Number(room.gold) || 0) * (1 + (Number(bonuses.goldPercent) || 0) / 100)
    );
    const exp = Math.floor(
        (Number(room.exp) || 0) * (1 + (Number(bonuses.expPercent) || 0) / 100)
    );

    player.gold += gold;
    player.exp += exp;

    const killedEnemy = {
        id: room.id,
        name: room.name,
        loot: room.loot || [],
        lootChanceMultiplier: 1,
        encounterType: room.isBoss ? "dungeon_boss" : "dungeon",
        isDungeonEncounter: true
    };

    try {
        if (typeof recordBestiaryKill === "function") {
            recordBestiaryKill(killedEnemy, killedEnemy.encounterType, player.location);
        }

        if (typeof rollLoot === "function") {
            rollLoot(killedEnemy);
        }

        if (typeof updateQuests === "function") {
            updateQuests(room.name);
        }
    } catch (error) {
        console.error("Błąd nagród lochu offline:", error);
    }

    return { gold, exp };
}

function processOfflineDungeonProgress(savedAt, currentTime = Date.now()) {
    const state =
        typeof getActiveDungeonState === "function"
            ? getActiveDungeonState()
            : null;

    if (!state || !state.room) {
        return null;
    }

    const safeEnd = Number(currentTime) || Date.now();
    const safeStart = Math.min(safeEnd, Number(savedAt) || safeEnd);
    const windowMs = safeEnd - safeStart;

    if (windowMs <= 0) {
        return null;
    }

    const { dungeon, progress, dungeonId } = state;
    const rooms = dungeon.rooms;
    const location = locations[player.location];

    if (typeof resetWarriorCombatState === "function") {
        resetWarriorCombatState();
    }

    if (typeof resetCombatWeaponCapstoneState === "function") {
        resetCombatWeaponCapstoneState();
    }

    /*
     * Przeżywalność liczymy względem przeciwników z lochu, a nie z lokacji,
     * w której gracz polował przed wejściem.
     */
    let originalEnemies = null;
    let swappedEnemies = false;

    if (location && Array.isArray(location.enemies)) {
        originalEnemies = location.enemies;

        try {
            location.enemies = rooms.slice(progress.roomIndex).map(room => ({
                id: room.id,
                name: room.name,
                hp: room.hp,
                attack: room.attack,
                gold: room.gold,
                exp: room.exp,
                loot: room.loot || []
            }));
            swappedEnemies = true;
        } catch (error) {
            swappedEnemies = false;
        }
    }

    let combatDamage;

    try {
        combatDamage = calculateOfflineCombatDamage(safeStart, safeEnd);
    } finally {
        if (swappedEnemies) {
            location.enemies = originalEnemies;
        }
    }

    if (Number.isFinite(Number(combatDamage.finalMana))) {
        const derived = getDerivedStats();

        player.mana = Math.max(
            0,
            Math.min(derived.maxMana, Number(combatDamage.finalMana))
        );
    }

    const totalDamage = Math.max(0, Number(combatDamage.damage) || 0);

    if (totalDamage <= 0 || combatDamage.attackCount <= 0) {
        return null;
    }

    /*
     * Śmierć przerywa wyprawę (tak jak online). Zakładamy, że pierwsza
     * następuje równomiernie w oknie czasowym.
     */
    const deathCount = Math.max(0, Number(combatDamage.deathCount) || 0);
    const deathFraction = deathCount > 0 ? 1 / (deathCount + 1) : 1;
    let budget = totalDamage * deathFraction;
    const budgetAtStart = budget;

    const startRoomIndex = progress.roomIndex;
    const currentRoomHp =
        enemy.isDungeonEncounter === true &&
        enemy.dungeonId === dungeonId &&
        enemy.dungeonRoomIndex === progress.roomIndex &&
        Number(enemy.hp) > 0
            ? Number(enemy.hp)
            : rooms[progress.roomIndex].hp;

    let roomIndex = progress.roomIndex;
    let roomHpLeft = currentRoomHp;
    const clearedRooms = [];

    while (roomIndex < rooms.length && budget >= roomHpLeft) {
        budget -= roomHpLeft;
        clearedRooms.push(rooms[roomIndex]);
        roomIndex++;

        if (roomIndex < rooms.length) {
            roomHpLeft = rooms[roomIndex].hp;
        }
    }

    const completed = roomIndex >= rooms.length;
    const failed = !completed && deathCount > 0;
    const finished = completed || failed;

    const lootBefore = getOfflineDungeonInventorySnapshot();
    let goldTotal = 0;
    let expTotal = 0;

    clearedRooms.forEach(room => {
        const reward = grantOfflineDungeonRoomReward(room);

        goldTotal += reward.gold;
        expTotal += reward.exp;
    });

    // Czas faktycznie zużyty na wyprawę (przy wcześniejszym końcu reszta idzie na aktywność).
    let usedMs = windowMs;

    if (completed) {
        usedMs = Math.min(
            windowMs,
            Math.ceil(windowMs * ((budgetAtStart - budget) / totalDamage))
        );
    } else if (failed) {
        usedMs = Math.min(windowMs, Math.ceil(windowMs * deathFraction));
    }

    const finishedAt = safeStart + usedMs;
    let statusText = "W trakcie";
    let completionReward = null;
    const returnActivity = player.dungeonReturnActivity || null;

    if (completed) {
        completionReward = completeDungeonRun(state, {
            offline: true,
            completedAt: finishedAt
        });

        goldTotal += completionReward.goldReward;
        expTotal += completionReward.expReward;
        statusText = "Ukończony";
    } else if (failed) {
        progress.active = false;
        progress.roomIndex = 0;
        progress.failedRuns++;
        statusText = "Przerwany (porażka)";

        if (typeof addSystemLog === "function") {
            addSystemLog(
                "💨 " + dungeon.name + ": wyprawa przerwana w czasie nieobecności.",
                "dungeon"
            );
        }
    } else {
        progress.roomIndex = roomIndex;

        if (typeof prepareDungeonRoom === "function") {
            prepareDungeonRoom(dungeonId);
        }

        enemy.hp = Math.max(1, Math.round(roomHpLeft - budget));
    }

    if (completed && typeof addSystemLog === "function") {
        addSystemLog(
            "🏆 Ukończono loch " + dungeon.name +
            " w czasie nieobecności (razem: " + progress.completionCount + ").",
            "dungeon"
        );
    }

    const lootGained = getOfflineDungeonLootGained(lootBefore);

    player.dungeonReturnActivity = finished ? null : player.dungeonReturnActivity;

    const summary = {
        durationMilliseconds: usedMs,
        sections: [
            {
                icon: dungeon.icon || "🗝️",
                title: "Loch — " + dungeon.name,
                stats: [
                    { label: "Stan wyprawy", value: statusText },
                    {
                        label: "Pokonane pomieszczenia",
                        value:
                            clearedRooms.length +
                            " z " + (rooms.length - startRoomIndex)
                    },
                    { label: "EXP bohatera", value: expTotal, prefix: expTotal > 0 ? "+" : "" },
                    { label: "Złoto", value: goldTotal, prefix: goldTotal > 0 ? "+" : "" }
                ],
                items: lootGained
            }
        ]
    };

    return {
        summary,
        finished,
        finishedAt,
        returnActivity: finished ? returnActivity : null
    };
}
