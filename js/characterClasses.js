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
                tier * 0.05;
            break;

        case "hunter":
            bonuses.dexterity = tier;
            bonuses.rangedDamagePercent =
                tier * 0.05;
            break;

        case "mage":
            bonuses.intelligence = tier;
            bonuses.combatManaRegenPerSecond =
                tier * 0.1;
            break;

        case "guardian":
            bonuses.endurance = tier;
            bonuses.combatHpRegenPercentPerSecond =
                tier * 0.05;
            break;

        case "rogue":
            bonuses.luck = tier;
            bonuses.goldBonusPercent =
                tier * 0.1;
            break;
    }

    return bonuses;
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

    return {
        strength:
            (Number(
                classDefinition.bonuses?.strength
            ) || 0) +
            progression.strength,

        dexterity:
            (Number(
                classDefinition.bonuses?.dexterity
            ) || 0) +
            progression.dexterity,

        intelligence:
            (Number(
                classDefinition.bonuses?.intelligence
            ) || 0) +
            progression.intelligence,

        endurance:
            (Number(
                classDefinition.bonuses?.endurance
            ) || 0) +
            progression.endurance,

        luck:
            (Number(
                classDefinition.bonuses?.luck
            ) || 0) +
            progression.luck
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

    const shouldChoose =
        window.confirm(
            "Czy na pewno wybierasz klasę " +
            classDefinition.name +
            "?\n\n" +
            "Premie: " +
            bonusSummary +
            "\n\n" +
            "Na tym etapie wybór klasy jest stały."
        );

    if (!shouldChoose) {
        return;
    }

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
  if (player.classId !== "guardian") {
    return 0;
  }

  const level = Math.max(
    1,
    Math.floor(Number(player.level) || 1),
  );

  if (level < 10) {
    return 0;
  }

  const classTier =
    Math.floor((level - 10) / 5) + 1;

}

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
    player.hp <= 0
  ) {
    return 0;
  }

  const derived = getDerivedStats();

  if (player.hp >= derived.maxHp) {
    return 0;
  }

  const regenerationPercent =
    getGuardianCombatHpRegenPercent();

  const healing = Math.max(
    1,
    Math.floor(
      derived.maxHp *
      regenerationPercent /
      100,
    ),
  );

  const previousHp = player.hp;

  player.hp = Math.min(
    derived.maxHp,
    player.hp + healing,
  );

  return player.hp - previousHp;
}