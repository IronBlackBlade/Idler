function createEquipmentSetCombatState() {
    return {
        commanderDefenseTriggered: false,
        commanderDefenseCharges: 0,
        dragonBurnDamagePerTick: 0,
        dragonBurnTicksRemaining: 0
    };
}

var equipmentSetCombatState =
    createEquipmentSetCombatState();

function resetEquipmentSetCombatState() {
    equipmentSetCombatState =
        createEquipmentSetCombatState();
}

function clearEquipmentSetEnemyEffects() {
    equipmentSetCombatState
        .dragonBurnDamagePerTick = 0;
    equipmentSetCombatState
        .dragonBurnTicksRemaining = 0;
}

function getEquipmentSetCombatState() {
    return {
        ...equipmentSetCombatState
    };
}

function applyCommanderDefenseToDamage(
    incomingDamage,
    maximumHp
) {
    const safeDamage = Math.max(
        0,
        Math.floor(
            Number(incomingDamage) || 0
        )
    );
    const effect =
        typeof getActiveEquipmentSetUniqueEffect ===
            "function"
            ? getActiveEquipmentSetUniqueEffect(
                "commander_unyielding_defense"
            )
            : null;

    if (!effect || safeDamage <= 0) {
        equipmentSetCombatState
            .commanderDefenseCharges = 0;

        return {
            damage: safeDamage,
            triggered: false,
            active: false,
            reducedBy: 0,
            chargesRemaining: 0
        };
    }

    let triggered = false;

    if (
        !equipmentSetCombatState
            .commanderDefenseTriggered &&
        equipmentSetCombatState
            .commanderDefenseCharges <= 0
    ) {
        const safeMaximumHp = Math.max(
            1,
            Number(maximumHp) || 1
        );
        const activationHp =
            safeMaximumHp *
            effect.hpThresholdPercent /
            100;
        const projectedHp =
            (Number(player.hp) || 0) -
            safeDamage;

        if (projectedHp <= activationHp) {
            equipmentSetCombatState
                .commanderDefenseTriggered =
                true;
            equipmentSetCombatState
                .commanderDefenseCharges =
                Math.max(
                    1,
                    Number(effect.hitCount) || 1
                );
            triggered = true;
        }
    }

    if (
        equipmentSetCombatState
            .commanderDefenseCharges <= 0
    ) {
        return {
            damage: safeDamage,
            triggered: false,
            active: false,
            reducedBy: 0,
            chargesRemaining: 0
        };
    }

    const reducedDamage = Math.max(
        1,
        Math.floor(
            safeDamage *
            (
                1 -
                effect.damageReductionPercent /
                100
            )
        )
    );

    equipmentSetCombatState
        .commanderDefenseCharges--;

    return {
        damage: reducedDamage,
        triggered,
        active: true,
        reducedBy:
            safeDamage -
            reducedDamage,
        chargesRemaining:
            equipmentSetCombatState
                .commanderDefenseCharges,
        effect
    };
}

function applyDragonWrathBurn(
    criticalDamage
) {
    const effect =
        typeof getActiveEquipmentSetUniqueEffect ===
            "function"
            ? getActiveEquipmentSetUniqueEffect(
                "dragon_wrath_burn"
            )
            : null;
    const safeCriticalDamage = Math.max(
        0,
        Math.floor(
            Number(criticalDamage) || 0
        )
    );

    if (!effect || safeCriticalDamage <= 0) {
        return {
            applied: false,
            refreshed: false,
            damagePerTick: 0,
            ticksRemaining: 0
        };
    }

    const refreshed =
        equipmentSetCombatState
            .dragonBurnTicksRemaining > 0;
    const damagePerTick = Math.max(
        1,
        Math.floor(
            safeCriticalDamage *
            effect.damagePercentPerTick /
            100
        )
    );

    equipmentSetCombatState
        .dragonBurnDamagePerTick =
        Math.max(
            equipmentSetCombatState
                .dragonBurnDamagePerTick,
            damagePerTick
        );
    equipmentSetCombatState
        .dragonBurnTicksRemaining =
        Math.max(
            1,
            Number(effect.tickCount) || 1
        );

    return {
        applied: true,
        refreshed,
        damagePerTick:
            equipmentSetCombatState
                .dragonBurnDamagePerTick,
        ticksRemaining:
            equipmentSetCombatState
                .dragonBurnTicksRemaining,
        effect
    };
}

function collectDragonWrathBurnDamage() {
    const effect =
        typeof getActiveEquipmentSetUniqueEffect ===
            "function"
            ? getActiveEquipmentSetUniqueEffect(
                "dragon_wrath_burn"
            )
            : null;

    if (
        !effect ||
        equipmentSetCombatState
            .dragonBurnTicksRemaining <= 0
    ) {
        clearEquipmentSetEnemyEffects();
        return 0;
    }

    const damage = Math.max(
        0,
        Math.floor(
            equipmentSetCombatState
                .dragonBurnDamagePerTick
        )
    );

    equipmentSetCombatState
        .dragonBurnTicksRemaining--;

    if (
        equipmentSetCombatState
            .dragonBurnTicksRemaining <= 0
    ) {
        equipmentSetCombatState
            .dragonBurnDamagePerTick = 0;
    }

    return damage;
}

function getOfflineCommanderDefenseEffectiveHp(
    damagePerHit
) {
    const effect =
        typeof getActiveEquipmentSetUniqueEffect ===
            "function"
            ? getActiveEquipmentSetUniqueEffect(
                "commander_unyielding_defense"
            )
            : null;

    if (!effect) {
        return 0;
    }

    return Math.max(
        0,
        Number(damagePerHit) || 0
    ) *
        effect.damageReductionPercent /
        100 *
        effect.hitCount;
}

function getOfflineDragonWrathBurnDamage(
    criticalHitCount,
    criticalDamage
) {
    const effect =
        typeof getActiveEquipmentSetUniqueEffect ===
            "function"
            ? getActiveEquipmentSetUniqueEffect(
                "dragon_wrath_burn"
            )
            : null;

    if (!effect) {
        return 0;
    }

    return Math.floor(
        Math.max(
            0,
            Math.floor(
                Number(criticalHitCount) || 0
            )
        ) *
            Math.max(
                0,
                Math.floor(
                    Number(criticalDamage) || 0
                )
            ) *
            effect.damagePercentPerTick /
            100 *
            effect.tickCount
    );
}

// ======================================================
// UNIKALNE EFEKTY ZESTAWÓW (TIERY 8–12)
// ======================================================

function getSetEffect(effectId) {
    return typeof getActiveEquipmentSetUniqueEffect === "function"
        ? getActiveEquipmentSetUniqueEffect(effectId)
        : null;
}

// Żer Otchłani: leczenie po pokonaniu przeciwnika.
function getVoidDevourHealing(maximumHp) {
    const effect = getSetEffect("void_devour");

    if (!effect) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(
            (Number(maximumHp) || 0) *
            (Number(effect.healPercent) || 0) /
            100
        )
    );
}

// Echo rozdarcia: szansa na powtórzenie ataku.
function rollRiftEchoDamage(attackDamage) {
    const effect = getSetEffect("rift_echo");
    const safeDamage = Math.max(
        0,
        Math.floor(Number(attackDamage) || 0)
    );

    if (
        !effect ||
        safeDamage <= 0 ||
        Math.random() * 100 >= (Number(effect.chancePercent) || 0)
    ) {
        return 0;
    }

    return Math.max(
        1,
        Math.floor(
            safeDamage *
            (Number(effect.damagePercent) || 0) /
            100
        )
    );
}

// Bariera przypływu: szansa na osłabienie uderzenia przeciwnika.
function applyTideWardToDamage(incomingDamage) {
    const effect = getSetEffect("tide_ward");
    const safeDamage = Math.max(
        0,
        Math.floor(Number(incomingDamage) || 0)
    );

    if (
        !effect ||
        safeDamage <= 0 ||
        Math.random() * 100 >= (Number(effect.chancePercent) || 0)
    ) {
        return {
            damage: safeDamage,
            triggered: false,
            reducedBy: 0
        };
    }

    const reduced = Math.max(
        1,
        Math.floor(
            safeDamage *
            (1 - (Number(effect.damageReductionPercent) || 0) / 100)
        )
    );

    return {
        damage: reduced,
        triggered: true,
        reducedBy: safeDamage - reduced
    };
}

// Odpłata króla: odbicie części otrzymanych obrażeń.
function getRoyalRetributionDamage(damageTaken) {
    const effect = getSetEffect("royal_retribution");
    const safeDamage = Math.max(
        0,
        Math.floor(Number(damageTaken) || 0)
    );

    if (!effect || safeDamage <= 0) {
        return 0;
    }

    return Math.max(
        1,
        Math.floor(
            safeDamage *
            (Number(effect.reflectPercent) || 0) /
            100
        )
    );
}

// Rozszczepienie: dodatkowe obrażenia i leczenie po trafieniu krytycznym.
function getPrismRefractionEffect(criticalDamage, maximumHp) {
    const effect = getSetEffect("prism_refraction");
    const safeDamage = Math.max(
        0,
        Math.floor(Number(criticalDamage) || 0)
    );

    if (!effect || safeDamage <= 0) {
        return {
            damage: 0,
            healing: 0
        };
    }

    return {
        damage: Math.max(
            1,
            Math.floor(
                safeDamage *
                (Number(effect.damagePercent) || 0) /
                100
            )
        ),
        healing: Math.max(
            0,
            Math.floor(
                (Number(maximumHp) || 0) *
                (Number(effect.healPercent) || 0) /
                100
            )
        )
    };
}

// Premie złota i EXP z potworów (zestawy).
function getSetKillRewardBonuses() {
    const bonuses =
        typeof getActiveEquipmentSetBonuses === "function"
            ? getActiveEquipmentSetBonuses()
            : {};

    return {
        goldPercent: Math.max(0, Number(bonuses.goldBonusPercent) || 0),
        expPercent: Math.max(0, Number(bonuses.expBonusPercent) || 0)
    };
}

// ======================================================
// UNIKALNE EFEKTY ZESTAWÓW – SYMULACJA OFFLINE
// ======================================================

// Echo rozdarcia: oczekiwane dodatkowe obrażenia z powtórzeń ataku.
function getOfflineRiftEchoDamage(totalAttackDamage) {
    const effect = getSetEffect("rift_echo");

    if (!effect) {
        return 0;
    }

    return Math.max(
        0,
        Number(totalAttackDamage) || 0
    ) *
        (Number(effect.chancePercent) || 0) / 100 *
        (Number(effect.damagePercent) || 0) / 100;
}

// Rozszczepienie: dodatkowe obrażenia z trafień krytycznych.
function getOfflinePrismRefractionDamage(criticalHitCount, criticalDamage) {
    const effect = getSetEffect("prism_refraction");

    if (!effect) {
        return 0;
    }

    return Math.max(0, Number(criticalHitCount) || 0) *
        Math.max(0, Number(criticalDamage) || 0) *
        (Number(effect.damagePercent) || 0) / 100;
}

// Bariera przypływu: mnożnik obrażeń otrzymywanych.
function getOfflineTideWardMultiplier() {
    const effect = getSetEffect("tide_ward");

    if (!effect) {
        return 1;
    }

    return 1 -
        (Number(effect.chancePercent) || 0) / 100 *
        (Number(effect.damageReductionPercent) || 0) / 100;
}

// Odpłata króla: obrażenia odbite z otrzymanych w czasie walki.
function getOfflineRoyalRetributionDamage(damageTakenPerSecond, activeSeconds) {
    const effect = getSetEffect("royal_retribution");

    if (!effect) {
        return 0;
    }

    return Math.max(0, Number(damageTakenPerSecond) || 0) *
        Math.max(0, Number(activeSeconds) || 0) *
        (Number(effect.reflectPercent) || 0) / 100;
}

// Żer Otchłani i Rozszczepienie: leczenie na sekundę walki.
function getOfflineSetSustainHealingPerSecond(enemies, maximumHp) {
    const devour = getSetEffect("void_devour");
    const refraction = getSetEffect("prism_refraction");

    if (
        (!devour && !refraction) ||
        !Array.isArray(enemies) ||
        enemies.length === 0 ||
        typeof calculatePlayerDamage !== "function" ||
        typeof getPlayerAttackIntervalMs !== "function"
    ) {
        return 0;
    }

    const safeMaxHp = Math.max(1, Number(maximumHp) || 1);
    const samples = 40;
    let totalDamage = 0;
    let criticalCount = 0;

    for (let index = 0; index < samples; index++) {
        const result = calculatePlayerDamage();

        totalDamage += Math.max(1, Number(result.damage) || 1);

        if (result.isCritical) {
            criticalCount++;
        }
    }

    const averageDamage = Math.max(1, totalDamage / samples);
    const criticalRate = criticalCount / samples;
    const attackSeconds =
        Math.max(250, Number(getPlayerAttackIntervalMs(true)) || 1000) / 1000;
    const averageEnemyHp =
        enemies.reduce((total, enemy) => {
            return total + Math.max(1, Number(enemy.hp) || 1);
        }, 0) / enemies.length;
    const fightSeconds =
        Math.ceil(averageEnemyHp / averageDamage) * attackSeconds +
        (
            typeof NEXT_FIGHT_DELAY_MS === "number"
                ? NEXT_FIGHT_DELAY_MS / 1000
                : 2
        );

    let healing = 0;

    if (devour) {
        healing +=
            safeMaxHp * (Number(devour.healPercent) || 0) / 100 /
            Math.max(1, fightSeconds);
    }

    if (refraction) {
        healing +=
            criticalRate / attackSeconds *
            safeMaxHp * (Number(refraction.healPercent) || 0) / 100;
    }

    return healing;
}
