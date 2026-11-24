/*
 * Silnik unikalnych umiejętności aktywnych klas i podklas.
 * Dane: js/data/classAbilitiesData.js (pole classAbility: true).
 *
 * Umiejętności korzystają z istniejących miejsc na czary: ofensywne
 * i defensywne (mana, odnowienie, automatyczne użycie w walce).
 */
var classAbilityState = {
    bleeds: [],
    buffs: {}
};

function resetClassAbilityState() {
    classAbilityState.bleeds = [];
    classAbilityState.buffs = {};
}

function getClassAbilityValue(spell, baseKey, perLevelKey) {
    const level = Math.max(1, Number(getSkillLevel(spell.id)) || 1);
    const effect = spell.effect || {};

    return (
        (Number(effect[baseKey]) || 0) +
        (Number(effect[perLevelKey]) || 0) * (level - 1)
    );
}

function isClassAbilityBossFight() {
    return player.isBossFight === true || enemy?.isBoss === true;
}

/* ---------- Aktywne wzmocnienia ---------- */

function getActiveClassAbilityBuffs() {
    const now = Date.now();

    return Object.values(classAbilityState.buffs)
        .filter(buff => buff.until > now);
}

function getClassAbilityDamageDealtMultiplier() {
    const derived = getDerivedStats();
    const missingHpFraction = Math.max(
        0,
        Math.min(1, 1 - (Number(player.hp) || 0) / Math.max(1, derived.maxHp))
    );
    let percent = 0;

    getActiveClassAbilityBuffs().forEach(buff => {
        percent += buff.scalesWithMissingHp
            ? buff.damageDealtPercent * missingHpFraction
            : buff.damageDealtPercent;
    });

    return 1 + percent / 100;
}

function getClassAbilityDamageTakenMultiplier() {
    let percent = 0;

    getActiveClassAbilityBuffs().forEach(buff => {
        percent += (buff.damageTakenPercent || 0);
        percent -= (buff.damageTakenReductionPercent || 0);
    });

    return Math.max(0.2, 1 + percent / 100);
}

/* ---------- Rzucanie ---------- */

function castClassAbility(spell, manaCost) {
    const kind = spell.effect?.abilityKind;

    if (kind === "strike") {
        return castClassAbilityStrike(spell, manaCost);
    }

    if (kind === "buff") {
        return castClassAbilityBuff(spell, manaCost);
    }

    if (kind === "heal") {
        return castClassAbilityHeal(spell, manaCost);
    }

    if (kind === "manaRestore") {
        return castClassAbilityManaRestore(spell, manaCost);
    }

    return false;
}

function castClassAbilityStrike(spell, manaCost) {
    const effect = spell.effect;
    let multiplier = getClassAbilityValue(
        spell,
        "baseDamageMultiplier",
        "damageMultiplierPerLevel"
    );

    const enemyHpPercent = (enemy.hp / Math.max(1, enemy.maxHp)) * 100;

    if (
        effect.executeThresholdPercent &&
        enemyHpPercent <= effect.executeThresholdPercent
    ) {
        multiplier *= Number(effect.executeMultiplier) || 1;
    }

    if (effect.baseBossDamagePercent && isClassAbilityBossFight()) {
        multiplier *=
            1 +
            getClassAbilityValue(
                spell,
                "baseBossDamagePercent",
                "bossDamagePercentPerLevel"
            ) / 100;
    }

    const hits = Math.max(1, Number(effect.hits) || 1);
    const damage = Math.max(
        1,
        Math.floor(
            getAttack() * multiplier * hits *
            getClassAbilityDamageDealtMultiplier()
        )
    );

    player.mana -= manaCost;
    enemy.hp -= damage;
    startSpellCooldown(spell);

    let extraText = "";

    if (effect.bleedTickMultiplier) {
        classAbilityState.bleeds = [{
            damagePerTick: Math.max(
                1,
                Math.floor(damage * Number(effect.bleedTickMultiplier))
            ),
            ticksRemaining: Number(effect.bleedTicks) || 3,
            tickMilliseconds: (Number(effect.bleedTickSeconds) || 1) * 1000,
            nextTickAt: Date.now() + (Number(effect.bleedTickSeconds) || 1) * 1000
        }];
        extraText = " i wywołuje krwawienie";
    }

    if (effect.baseLifestealPercent) {
        const heal = Math.floor(
            damage *
            getClassAbilityValue(
                spell,
                "baseLifestealPercent",
                "lifestealPercentPerLevel"
            ) / 100
        );
        const maxHp = getDerivedStats().maxHp;

        player.hp = Math.min(maxHp, player.hp + heal);
        extraText += " (leczenie: +" + heal + " HP)";
    }

    if (typeof addCombatLog === "function") {
        addCombatLog(
            "⚔️ " + spell.name + (hits > 1 ? " (" + hits + " trafienia)" : "") + " zadaje " + damage + " obrażeń" +
            extraText + ". Mana: -" + manaCost + "."
        );
    }

    return true;
}

function castClassAbilityBuff(spell, manaCost) {
    const effect = spell.effect;
    const existing = classAbilityState.buffs[spell.id];

    if (existing && existing.until > Date.now()) {
        return false;
    }

    const durationSeconds = Number(effect.durationSeconds) || 0;

    classAbilityState.buffs[spell.id] = {
        until: Date.now() + durationSeconds * 1000,
        damageDealtPercent: getClassAbilityValue(
            spell,
            "baseDamageDealtPercent",
            "damageDealtPercentPerLevel"
        ),
        scalesWithMissingHp: effect.scalesWithMissingHp === true,
        damageTakenPercent: Number(effect.damageTakenPercent) || 0,
        damageTakenReductionPercent: getClassAbilityValue(
            spell,
            "baseDamageTakenReductionPercent",
            "damageTakenReductionPercentPerLevel"
        )
    };

    player.mana -= manaCost;
    startSpellCooldown(spell);

    if (typeof addCombatLog === "function") {
        addCombatLog(
            "📣 " + spell.name + ": wzmocnienie na " + durationSeconds +
            " s. Mana: -" + manaCost + "."
        );
    }

    return true;
}

function castClassAbilityHeal(spell, manaCost) {
    const maxHp = getDerivedStats().maxHp;

    if (player.hp >= maxHp) {
        return false;
    }

    const percent = getClassAbilityValue(
        spell,
        "baseHealPercent",
        "healPercentPerLevel"
    );
    const heal = Math.max(1, Math.floor(maxHp * percent / 100));

    player.mana -= manaCost;
    player.hp = Math.min(maxHp, player.hp + heal);
    startSpellCooldown(spell);

    if (typeof addCombatLog === "function") {
        addCombatLog(
            "🌿 " + spell.name + " leczy " + heal + " HP. Mana: -" + manaCost + "."
        );
    }

    return true;
}

function castClassAbilityManaRestore(spell, manaCost) {
    const maxMana = Number(getDerivedStats().maxMana) || 0;
    const percent = getClassAbilityValue(
        spell,
        "baseManaRestorePercent",
        "manaRestorePercentPerLevel"
    );
    const gain = Math.floor(maxMana * percent / 100);

    if (player.mana >= maxMana * 0.7) {
        return false;
    }

    player.mana = Math.min(maxMana, player.mana - manaCost + gain);
    startSpellCooldown(spell);

    if (typeof addCombatLog === "function") {
        addCombatLog("🔷 " + spell.name + " przywraca " + gain + " many.");
    }

    return true;
}

/* ---------- Krwawienie (tyknięcia) ---------- */

function tickClassAbilityBleed() {
    const now = Date.now();
    let total = 0;

    classAbilityState.bleeds.forEach(bleed => {
        while (bleed.ticksRemaining > 0 && now >= bleed.nextTickAt) {
            total += bleed.damagePerTick;
            bleed.ticksRemaining--;
            bleed.nextTickAt += bleed.tickMilliseconds;
        }
    });

    classAbilityState.bleeds =
        classAbilityState.bleeds.filter(bleed => bleed.ticksRemaining > 0);

    if (total > 0) {
        enemy.hp -= total;

        if (typeof addCombatLog === "function") {
            addCombatLog("🩸 Krwawienie zadaje " + total + " obrażeń.");
        }
    }

    return total;
}

/* ---------- Podpięcie w istniejące funkcje ---------- */

(function hookClassAbilities() {
    // Obrażenia gracza × wzmocnienia (np. Okrzyk bojowy).
    if (typeof calculatePlayerDamage === "function") {
        const originalCalculatePlayerDamage = calculatePlayerDamage;

        calculatePlayerDamage = function () {
            const result = originalCalculatePlayerDamage.apply(this, arguments);
            const multiplier = getClassAbilityDamageDealtMultiplier();

            if (result && multiplier !== 1) {
                result.damage = Math.max(
                    1,
                    Math.floor(result.damage * multiplier)
                );
            }

            return result;
        };
    }

    // Obrażenia otrzymywane × osłony/ryzyko (np. Żelazna postawa).
    if (typeof applyCombatDefensePotionReduction === "function") {
        const originalReduction = applyCombatDefensePotionReduction;

        applyCombatDefensePotionReduction = function (damage) {
            const reduced = originalReduction.apply(this, arguments);
            const multiplier = getClassAbilityDamageTakenMultiplier();

            return multiplier === 1
                ? reduced
                : Math.max(1, Math.floor(reduced * multiplier));
        };
    }

    // Reset przy początku/końcu walki.
    if (typeof resetSpellCombatState === "function") {
        const originalReset = resetSpellCombatState;

        resetSpellCombatState = function () {
            resetClassAbilityState();
            return originalReset.apply(this, arguments);
        };
    }

    // Liczenie offline: szacunkowy mnożnik obrażeń z umiejętności klasowych.
    if (typeof calculateOfflineCombatDamage === "function") {
        const originalOffline = calculateOfflineCombatDamage;

        calculateOfflineCombatDamage = function () {
            const result = originalOffline.apply(this, arguments);

            if (result && Number(result.damage) > 0) {
                result.damage = Math.floor(
                    result.damage * getOfflineClassAbilityFactor()
                );
            }

            return result;
        };
    }
})();

/*
 * Offline: z wybranych umiejętności liczymy średnią premię do obrażeń
 * (ograniczoną regeneracją many i odnowieniem), bez symulacji każdego użycia.
 */
function getOfflineClassAbilityFactor() {
    let baseDps = 0;

    try {
        baseDps =
            getAttack() /
            Math.max(0.2, getPlayerAttackIntervalMs(true) / 1000);
    } catch (error) {
        return 1;
    }

    if (!(baseDps > 0)) {
        return 1;
    }

    const derived = getDerivedStats();
    const manaRegenPerSecond = Math.max(
        0,
        Number(getManaRegenerationPerSecond()) || 1
    );

    let extraDps = 0;
    let buffBonus = 0;

    ["offensive", "defensive"].forEach(slot => {
        const spell = typeof getSelectedSpell === "function"
            ? getSelectedSpell(slot)
            : null;

        if (!spell || !spell.classAbility || !spell.effect) {
            return;
        }

        const cooldown = Math.max(1, getSpellCooldownMilliseconds(spell) / 1000);
        const manaCost = Math.max(1, getSpellManaCost(spell));
        const castsPerSecond = Math.min(1 / cooldown, manaRegenPerSecond / manaCost);

        if (spell.effect.abilityKind === "strike") {
            const multiplier = getClassAbilityValue(
                spell,
                "baseDamageMultiplier",
                "damageMultiplierPerLevel"
            );
            const bleed =
                (Number(spell.effect.bleedTickMultiplier) || 0) *
                (Number(spell.effect.bleedTicks) || 0);

            extraDps +=
                castsPerSecond * getAttack() * multiplier *
                (Number(spell.effect.hits) || 1) * (1 + bleed);
        } else if (spell.effect.abilityKind === "buff") {
            const duration = Number(spell.effect.durationSeconds) || 0;
            const uptime = Math.min(1, castsPerSecond * duration);
            let percent = getClassAbilityValue(
                spell,
                "baseDamageDealtPercent",
                "damageDealtPercentPerLevel"
            );

            // Szał krwi działa średnio przy ok. połowie brakującego HP.
            if (spell.effect.scalesWithMissingHp) {
                percent *= 0.3;
            }

            buffBonus += uptime * percent / 100;
        }
    });

    return Math.min(2.5, (1 + buffBonus) * (1 + extraDps / baseDps));
}

window.castClassAbility = castClassAbility;
window.tickClassAbilityBleed = tickClassAbilityBleed;
window.getOfflineClassAbilityFactor = getOfflineClassAbilityFactor;


/*
 * Jednorazowa migracja zapisów: zwrot punktów za stare umiejętności klasowe.
 */
function migrateLegacyClassSkills() {
    if (!player || player.classRebuildMigrated === true) {
        return false;
    }

    let refundedPoints = 0;
    let refundedGold = 0;

    Object.keys(player.skills || {}).forEach(skillId => {
        const skill = skills[skillId];

        if (!skill || skill.legacyClassSkill !== true) {
            return;
        }

        const level = Math.max(0, Number(player.skills[skillId]) || 0);

        refundedPoints += level * (Number(skill.costPerLevel) || 1);

        for (let i = 0; i < level; i++) {
            refundedGold += Number(skill.goldCosts?.[i]) || 0;
        }

        delete player.skills[skillId];
    });

    if (refundedPoints > 0) {
        player.skillPoints =
            Math.max(0, Number(player.skillPoints) || 0) + refundedPoints;
        player.skillGoldSpent = Math.max(
            0,
            (Number(player.skillGoldSpent) || 0) - refundedGold
        );

        if (typeof addLog === "function") {
            addLog(
                "🔄 Przebudowa klas: zwrócono " + refundedPoints +
                " pkt umiejętności za stare drzewka klasowe."
            );
        }
    }

    player.selectedWarriorCapstone = null;
    player.selectedHunterCapstone = null;
    player.selectedMageCapstone = null;
    player.selectedGuardianCapstone = null;
    player.selectedRogueCapstone = null;

    if (player.selectedSpells) {
        ["offensive", "defensive"].forEach(slot => {
            const id = player.selectedSpells[slot];

            if (id && (!skills[id] || skills[id].legacyClassSkill === true)) {
                player.selectedSpells[slot] = null;
            }
        });
    }

    player.classRebuildMigrated = true;

    return refundedPoints > 0;
}

window.migrateLegacyClassSkills = migrateLegacyClassSkills;
