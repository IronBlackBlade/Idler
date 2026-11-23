function getPlayerClassDefinition() {
    if (!player.classId) {
        return null;
    }

    return (
        characterClasses[
        player.classId
        ] || null
    );
}

function getClassProgressionTier() {
    if (!player.classId) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(
            (
                Math.max(
                    10,
                    Number(player.level) || 10
                ) - 10
            ) / 5
        )
    );
}

function getClassProgressionBonuses() {
    const tier =
        getClassProgressionTier();

    const bonuses = {
        strength: 0,
        dexterity: 0,
        intelligence: 0,
        endurance: 0,
        luck: 0,

        meleeDamagePercent: 0,
        rangedDamagePercent: 0,
        combatManaRegenPerSecond: 0,
        combatHpRegenPercentPerSecond: 0,
        goldBonusPercent: 0
    };

    if (tier <= 0) {
        return bonuses;
    }

    switch (player.classId) {
        case "warrior":
            bonuses.strength = tier;
            bonuses.meleeDamagePercent =
                tier * 0.1;
            break;

        case "hunter":
            bonuses.dexterity = tier;
            bonuses.rangedDamagePercent =
                tier * 0.1;
            break;

        case "mage":
            bonuses.intelligence = tier;
            bonuses.combatManaRegenPerSecond =
                tier * 0.2;
            break;

        case "guardian":
            bonuses.endurance = tier;
            bonuses.combatHpRegenPercentPerSecond =
                tier * 0.05;
            break;

        case "rogue":
            bonuses.luck = tier;
            bonuses.goldBonusPercent =
                tier * 0.2;
            break;
    }

    return bonuses;
}

function grantGoldReward(amount) {
    const baseGold = Math.max(
        0,
        Math.floor(Number(amount) || 0)
    );

    if (baseGold <= 0) {
        return {
            baseGold: 0,
            bonusGold: 0,
            totalGold: 0
        };
    }

    const progression =
        typeof getClassProgressionBonuses === "function"
            ? getClassProgressionBonuses()
            : null;

    const bonusPercent =
        player.classId === "rogue"
            ? Math.max(
                0,
                Number(
                    progression?.goldBonusPercent
                ) || 0
            )
            : 0;

    const previousRemainder = Math.max(
        0,
        Number(player.rogueGoldBonusRemainder) || 0
    );

    const exactBonus =
        baseGold * bonusPercent / 100 +
        previousRemainder;

    const bonusGold =
        Math.floor(exactBonus);

    player.rogueGoldBonusRemainder =
        exactBonus - bonusGold;

    const totalGold =
        baseGold + bonusGold;

    player.gold += totalGold;

    return {
        baseGold,
        bonusGold,
        totalGold
    };
}

function getPlayerClassBonuses() {
    const emptyBonuses = {
        strength: 0,
        dexterity: 0,
        intelligence: 0,
        endurance: 0,
        luck: 0
    };

    const classDefinition =
        getPlayerClassDefinition();

    if (!classDefinition) {
        return emptyBonuses;
    }

    const progression =
        getClassProgressionBonuses();

    const subclassBonuses =
        getPlayerSubclassDefinition()?.bonuses || {};

    return {
        strength:
            (Number(
                classDefinition.bonuses?.strength
            ) || 0) +
            progression.strength +
            (Number(subclassBonuses.strength) || 0),

        dexterity:
            (Number(
                classDefinition.bonuses?.dexterity
            ) || 0) +
            progression.dexterity +
            (Number(subclassBonuses.dexterity) || 0),

        intelligence:
            (Number(
                classDefinition.bonuses?.intelligence
            ) || 0) +
            progression.intelligence +
            (Number(subclassBonuses.intelligence) || 0),

        endurance:
            (Number(
                classDefinition.bonuses?.endurance
            ) || 0) +
            progression.endurance +
            (Number(subclassBonuses.endurance) || 0),

        luck:
            (Number(
                classDefinition.bonuses?.luck
            ) || 0) +
            progression.luck +
            (Number(subclassBonuses.luck) || 0)
    };
}

function getCharacterClassStatName(
    statName
) {
    const statNames = {
        strength: "Siły",
        dexterity: "Zręczności",
        intelligence: "Inteligencji",
        endurance: "Wytrzymałości",
        luck: "Szczęścia"
    };

    return (
        statNames[statName] ||
        statName
    );
}

function getCharacterClassBonusSummary(
    classDefinition
) {
    if (
        !classDefinition ||
        !classDefinition.bonuses
    ) {
        return "";
    }

    return Object.entries(
        classDefinition.bonuses
    )
        .map(([statName, value]) => {
            return (
                "+" +
                value +
                " " +
                getCharacterClassStatName(
                    statName
                )
            );
        })
        .join(", ");
}

function chooseCharacterClass(
    classId
) {
    const classDefinition =
        characterClasses[classId];

    if (!classDefinition) {
        console.warn(
            "Nieznana klasa:",
            classId
        );

        return;
    }

    const currentClass =
        getPlayerClassDefinition();

    if (currentClass) {
        if (
            typeof showNotification ===
            "function"
        ) {
            showNotification(
                "Klasa postaci została już wybrana.",
                "error"
            );
        }

        return;
    }

    if (
        player.level <
        classDefinition.unlockLevel
    ) {
        if (
            typeof showNotification ===
            "function"
        ) {
            showNotification(
                "Wybór klasy odblokowuje się na poziomie " +
                classDefinition.unlockLevel +
                ".",
                "error"
            );
        }

        return;
    }

    const bonusSummary =
        getCharacterClassBonusSummary(
            classDefinition
        );

    showGameConfirm(
        "Czy na pewno wybierasz klasę " +
        classDefinition.name +
        "?\n\n" +
        "Premie: " +
        bonusSummary +
        "\n\n" +
        "Na tym etapie wybór klasy jest stały.",
        { title: "Wybór klasy", confirmText: "Wybieram" }
    ).then(shouldChoose => {
        if (shouldChoose) {
            applyCharacterClassChoice(
                classDefinition,
                bonusSummary
            );
        }
    });
}

function applyCharacterClassChoice(
    classDefinition,
    bonusSummary
) {

    player.classId =
        classDefinition.id;

    /*
     * Po wybraniu klasy odnawiamy HP
     * i manę do nowych maksymalnych
     * wartości.
     */
    const derived =
        getDerivedStats();

    player.hp =
        derived.maxHp;

    player.mana =
        derived.maxMana;

    if (
        typeof showNotification ===
        "function"
    ) {
        showNotification(
            "Wybrano klasę: " +
            classDefinition.name +
            ".",
            "success"
        );
    }

    if (
        typeof addSystemLog ===
        "function"
    ) {
        addSystemLog(
            classDefinition.icon +
            " Bohater wybrał klasę " +
            classDefinition.name +
            ". Premie: " +
            bonusSummary +
            ".",
            "class"
        );
    }

    if (
        typeof saveGame ===
        "function"
    ) {
        saveGame();
    }

    if (
        typeof renderHero ===
        "function"
    ) {
        renderHero();
    }

    if (
        typeof renderPlayerHud ===
        "function"
    ) {
        renderPlayerHud();
    }
}

function getGuardianCombatHpRegenPercent() {
    if (
        player.classId !== "guardian" ||
        typeof getClassProgressionBonuses !==
        "function"
    ) {
        return 0;
    }

    const bonuses =
        getClassProgressionBonuses();

    return Math.max(
        0,
        Number(
            bonuses
                .combatHpRegenPercentPerSecond
        ) || 0
    );
}

let guardianCombatRegenLastAt = 0;
let guardianCombatRegenRemainder = 0;

function applyGuardianCombatRegeneration() {
    const combatIsActive =
        player.isFighting === true ||
        (
            typeof isFighting !== "undefined" &&
            isFighting === true
        );

    if (
        !combatIsActive ||
        player.classId !== "guardian" ||
        Number(player.hp) <= 0
    ) {
        guardianCombatRegenLastAt = 0;
        guardianCombatRegenRemainder = 0;
        return 0;
    }

    /*
     * Procent regeneracji jest podawany na sekundę,
     * więc leczenie liczymy od czasu ostatniego wywołania.
     */
    const now = Date.now();
    const elapsedSeconds = guardianCombatRegenLastAt > 0
        ? Math.min(5, Math.max(0, (now - guardianCombatRegenLastAt) / 1000))
        : 0;

    guardianCombatRegenLastAt = now;

    if (elapsedSeconds <= 0) {
        return 0;
    }

    const derived = getDerivedStats();
    const maximumHp = Math.max(
        1,
        Number(derived.maxHp) || 1
    );

    if (player.hp >= maximumHp) {
        guardianCombatRegenRemainder = 0;
        return 0;
    }

    const regenerationPercent =
        getGuardianCombatHpRegenPercent();

    if (regenerationPercent <= 0) {
        return 0;
    }

    const exactHealing =
        maximumHp *
        regenerationPercent /
        100 *
        elapsedSeconds +
        guardianCombatRegenRemainder;

    const wholeHealing = Math.floor(exactHealing);

    guardianCombatRegenRemainder = exactHealing - wholeHealing;

    const previousHp = player.hp;

    player.hp = Math.min(
        maximumHp,
        player.hp + wholeHealing
    );

    return player.hp - previousHp;
}


/* ========================================
   PODKLASY
======================================== */

function getPlayerSubclassDefinition() {
    if (!player.classId || !player.subclassId) {
        return null;
    }

    const subclass =
        characterSubclasses[player.subclassId];

    if (!subclass || subclass.classId !== player.classId) {
        return null;
    }

    return subclass;
}

function getClassSubclasses(classId) {
    return Object.values(characterSubclasses)
        .filter(subclass => subclass.classId === classId);
}

/*
 * Pierwszy wybór jest darmowy, każda zmiana kosztuje złoto
 * i jest o połowę droższa od poprzedniej.
 */
function getSubclassChangeCost() {
    if (!player.subclassId) {
        return 0;
    }

    const changes = Math.max(
        0,
        Math.floor(Number(player.subclassChangeCount) || 0)
    );

    return Math.round(
        SUBCLASS_CHANGE_BASE_COST *
        Math.pow(SUBCLASS_CHANGE_COST_GROWTH, changes)
    );
}

function chooseCharacterSubclass(subclassId) {
    const subclass = characterSubclasses[subclassId];

    if (!subclass || subclass.classId !== player.classId) {
        showNotification?.("Ta podklasa nie pasuje do Twojej klasy.", "error");
        return;
    }

    if (player.subclassId === subclassId) {
        return;
    }

    if (Number(player.level) < SUBCLASS_UNLOCK_LEVEL) {
        showNotification?.(
            "Podklasę wybierzesz na poziomie " + SUBCLASS_UNLOCK_LEVEL + ".",
            "error"
        );
        return;
    }

    const cost = getSubclassChangeCost();

    if (player.gold < cost) {
        showNotification?.(
            "Zmiana podklasy kosztuje " + formatFullNumber(cost) + " złota.",
            "error"
        );
        return;
    }

    const isChange = Boolean(player.subclassId);
    const bonusSummary = getCharacterClassBonusSummary(subclass);

    showGameConfirm(
        (isChange
            ? "Zmienić podklasę na " + subclass.name + "?\n\n" +
              "Koszt: " + formatFullNumber(cost) + " złota.\n"
            : "Wybierasz podklasę " + subclass.name + "?\n\n") +
        "Premie: " + bonusSummary + "\n\n" +
        (isChange
            ? "Zmiana jest płatna, a każda kolejna będzie droższa."
            : "Pierwszy wybór jest darmowy. Późniejsza zmiana kosztuje złoto."),
        { title: "Wybór podklasy", confirmText: isChange ? "Zmieniam" : "Wybieram" }
    ).then(confirmed => {
        if (!confirmed) {
            return;
        }

        if (isChange) {
            if (player.gold < cost) {
                return;
            }

            player.gold -= cost;
            player.subclassChangeCount =
                (Number(player.subclassChangeCount) || 0) + 1;
        }

        player.subclassId = subclassId;

        const derived = getDerivedStats();

        player.hp = Math.min(derived.maxHp, Math.max(player.hp, 1));
        player.mana = Math.min(derived.maxMana, player.mana);

        showNotification?.("Wybrano podklasę: " + subclass.name + ".", "success");

        addSystemLog?.(
            subclass.icon + " Bohater wybrał podklasę " + subclass.name +
            ". Premie: " + bonusSummary + ".",
            "class"
        );

        saveGame?.();
        render?.();
        renderHero?.();
        renderPlayerHud?.();
    });
}
