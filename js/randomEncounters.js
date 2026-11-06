/*
 * Rzadkie spotkania.
 *
 * Polowanie (nie w lochach, nie bossowie):
 *  - ✨ Złoty potwór (RARE_ENEMY_CHANCE): więcej HP i obrażeń, ale nagroda
 *    w złocie i EXP ×6 oraz dwukrotnie większa szansa na łup.
 *  - 💰 Skarb (TREASURE_CHANCE): po zabiciu wroga garść złota
 *    (10× nagroda za wroga).
 * Górnictwo, zielarstwo, rybołówstwo:
 *  - 🍀 Szczęśliwe znalezisko (LUCKY_FIND_CHANCE): dodatkowy, darmowy cykl.
 * Spotkania występują tylko podczas gry online (nie w trybie offline).
 */
const RARE_ENEMY_CHANCE = 0.01;
const RARE_ENEMY_HP_MULTIPLIER = 1.8;
const RARE_ENEMY_ATTACK_MULTIPLIER = 1.1;
const RARE_ENEMY_REWARD_MULTIPLIER = 6;
const RARE_ENEMY_LOOT_MULTIPLIER = 2;
const TREASURE_CHANCE = 0.005;
const TREASURE_GOLD_MULTIPLIER = 10;
const LUCKY_FIND_CHANCE = 0.02;

function isRandomEncounterAllowed() {
    if (typeof isDungeonRunActive === "function" && isDungeonRunActive()) {
        return false;
    }
    return enemy.isDungeonEncounter !== true && player.isBossFight !== true;
}

function maybeMakeRareEnemy() {
    if (!isRandomEncounterAllowed() || Math.random() >= RARE_ENEMY_CHANCE) {
        return;
    }
    enemy.encounterType = "rare";
    enemy.encounterLabel = "✨ Złoty";
    enemy.maxHp = Math.round(enemy.maxHp * RARE_ENEMY_HP_MULTIPLIER);
    enemy.hp = enemy.maxHp;
    enemy.attack = Math.round(enemy.attack * RARE_ENEMY_ATTACK_MULTIPLIER);
    enemy.gold = Math.round(enemy.gold * RARE_ENEMY_REWARD_MULTIPLIER);
    enemy.exp = Math.round(enemy.exp * RARE_ENEMY_REWARD_MULTIPLIER);
    enemy.lootChanceMultiplier =
        (enemy.lootChanceMultiplier || 1) * RARE_ENEMY_LOOT_MULTIPLIER;
    if (typeof addCombatLog === "function") {
        addCombatLog("✨ Złoty potwór: " + enemy.name + "! Pokonaj go, by zdobyć bogatą nagrodę.");
    }
}

function maybeFindTreasure(defeatedEnemy) {
    if (!isRandomEncounterAllowed() || Math.random() >= TREASURE_CHANCE) {
        return;
    }
    const penalty =
        typeof getLocationRewardMultiplier === "function"
            ? getLocationRewardMultiplier(player.location)
            : 1;
    const gold = Math.max(
        1,
        Math.floor((Number(defeatedEnemy?.gold) || 0) * TREASURE_GOLD_MULTIPLIER * penalty)
    );
    if (typeof grantGoldReward === "function") {
        grantGoldReward(gold);
    } else {
        player.gold += gold;
    }
    if (typeof addCombatLog === "function") {
        addCombatLog("💰 Skarb! Znaleziono sakiewkę: +" + gold + " złota.");
    }
    if (typeof showNotification === "function") {
        showNotification("💰 Znaleziono skarb: +" + gold + " złota!", "success");
    }
}

/* Złoty potwór po każdym zwykłym wylosowaniu wroga. */
if (typeof spawnEnemy === "function") {
    const baseSpawnEnemy = spawnEnemy;
    spawnEnemy = function () {
        const result = baseSpawnEnemy.apply(this, arguments);
        maybeMakeRareEnemy();
        return result;
    };
}

/* Skarb po zabiciu wroga (rollLoot wywoływane jest przy każdym zabójstwie). */
if (typeof rollLoot === "function") {
    const baseRollLoot = rollLoot;
    rollLoot = function (defeatedEnemy) {
        const result = baseRollLoot.apply(this, arguments);
        maybeFindTreasure(defeatedEnemy);
        return result;
    };
}

/* Szczęśliwe znalezisko: dodatkowy cykl profesji zbierackich. */
[
    ["completeMiningCycle", "⛏️ Szczęśliwa żyła"],
    ["completeHerbalismCycle", "🌿 Obfite zbiory"],
    ["completeFishingCycle", "🎣 Wyjątkowy połów"]
].forEach(([name, label]) => {
    const base = globalThis[name];
    if (typeof base !== "function") {
        return;
    }
    globalThis[name] = function (area) {
        const result = base.apply(this, arguments);
        if (Math.random() < LUCKY_FIND_CHANCE) {
            base.call(this, area);
            if (typeof showNotification === "function") {
                showNotification("🍀 " + label + "! Dodatkowy cykl za darmo.", "success");
            }
            if (typeof addSystemLog === "function") {
                addSystemLog("🍀 " + label + ": dodatkowy cykl.", "reward");
            }
        }
        return result;
    };
});
