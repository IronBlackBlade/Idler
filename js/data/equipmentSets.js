const equipmentSetDefinitions = [
    {
        id: "wilds_set",
        name: "Rynsztunek ostępów",
        icon: "🌿",
        theme: "wilds",
        itemIds: [
            "bark_shield",
            "beetle_helmet",
            "wolf_armor",
            "tracker_pants",
            "wolf_boots",
            "wolf_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Leśny kamuflaż",
                description: "+3% pancerza",
                bonuses: {
                    armorPercent: 3
                }
            },
            {
                pieces: 6,
                name: "Instynkt przetrwania",
                description:
                    "+4% maks. HP, +1 p.p. szansy na unik i +8% szybkości zielarstwa",
                bonuses: {
                    maxHpPercent: 4,
                    dodgeChance: 1,
                    herbalismSpeedPercent: 8
                }
            }
        ]
    },
    {
        id: "kobold_set",
        name: "Rynsztunek koboldów",
        icon: "👺",
        theme: "kobold",
        itemIds: [
            "kobold_shield",
            "kobold_helmet",
            "kobold_armor",
            "kobold_pants",
            "kobold_boots",
            "kobold_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Jaskiniowy szyk",
                description: "+5% pancerza",
                bonuses: {
                    armorPercent: 5
                }
            },
            {
                pieces: 6,
                name: "Podstępna zgraja",
                description:
                    "+7% maks. HP, +2 p.p. szansy na trafienie krytyczne i +8% szybkości kopania",
                bonuses: {
                    maxHpPercent: 7,
                    critChance: 2,
                    miningSpeedPercent: 8
                }
            }
        ]
    },
    {
        id: "guardian_set",
        name: "Rynsztunek strażnika",
        icon: "🪨",
        theme: "guardian",
        itemIds: [
            "guardian_shield",
            "guardian_helmet",
            "guardian_armor",
            "guardian_pants",
            "guardian_boots",
            "guardian_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Kamienna osłona",
                description: "+7% pancerza",
                bonuses: {
                    armorPercent: 7
                }
            },
            {
                pieces: 6,
                name: "Niewzruszona straż",
                description:
                    "+9% maks. HP, +3 p.p. szansy na unik i +8% szansy na łup z polowania",
                bonuses: {
                    maxHpPercent: 9,
                    dodgeChance: 3,
                    huntingLootBonusPercent: 8
                }
            }
        ]
    },
    {
        id: "commander_set",
        name: "Rynsztunek dowódcy",
        icon: "🛡️",
        theme: "commander",
        itemIds: [
            "commander_shield",
            "commander_helmet",
            "commander_armor",
            "commander_pants",
            "commander_boots",
            "commander_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Żelazna dyscyplina",
                description: "+10% pancerza",
                bonuses: {
                    armorPercent: 10
                }
            },
            {
                pieces: 6,
                name: "Niezłomny szyk",
                description:
                    "+12% maks. HP i +4 p.p. szansy na unik",
                uniqueEffect: {
                    id: "commander_unyielding_defense",
                    name: "Niezłomna obrona",
                    description:
                        "Po spadku poniżej 35% HP otrzymujesz o 20% mniej obrażeń przez 3 ataki przeciwnika (raz na walkę).",
                    hpThresholdPercent: 35,
                    damageReductionPercent: 20,
                    hitCount: 3
                },
                bonuses: {
                    maxHpPercent: 12,
                    dodgeChance: 4
                }
            }
        ]
    },
    {
        id: "dragon_set",
        name: "Smoczy rynsztunek",
        icon: "🐉",
        theme: "dragon",
        itemIds: [
            "dragon_shield",
            "dragon_helmet",
            "dragon_armor",
            "dragon_pants",
            "dragon_boots",
            "dragon_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Smocze łuski",
                description: "+15% pancerza",
                bonuses: {
                    armorPercent: 15
                }
            },
            {
                pieces: 6,
                name: "Serce pradawnego smoka",
                description:
                    "+18% maks. HP i +6 p.p. szansy na trafienie krytyczne",
                uniqueEffect: {
                    id: "dragon_wrath_burn",
                    name: "Smoczy gniew",
                    description:
                        "Trafienia krytyczne podpalają przeciwnika na 3 tury, zadając co turę 15% obrażeń trafienia krytycznego.",
                    damagePercentPerTick: 15,
                    tickCount: 3
                },
                bonuses: {
                    maxHpPercent: 18,
                    critChance: 6
                }
            }
        ]
    },
    {
        id: "voidforged_set",
        name: "Rynsztunek pustki",
        icon: "🌑",
        theme: "void",
        itemIds: [
            "voidforged_shield",
            "voidforged_helmet",
            "voidforged_armor",
            "voidforged_pants",
            "voidforged_boots",
            "voidforged_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Pochłonięcie",
                description: "+12% złota z potworów",
                bonuses: {
                    goldBonusPercent: 12
                }
            },
            {
                pieces: 6,
                name: "Żer Otchłani",
                description:
                    "Po pokonaniu przeciwnika odzyskujesz 8% maks. HP.",
                uniqueEffect: {
                    id: "void_devour",
                    name: "Żer Otchłani",
                    description: "Po pokonaniu przeciwnika odzyskujesz 8% maks. HP.",
                    healPercent: 8
                }
            }
        ]
    },
    {
        id: "riftwoven_set",
        name: "Rynsztunek rozdarcia",
        icon: "🌀",
        theme: "rift",
        itemIds: [
            "riftwoven_shield",
            "riftwoven_helmet",
            "riftwoven_armor",
            "riftwoven_pants",
            "riftwoven_boots",
            "riftwoven_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Szczelina czasu",
                description: "+10% EXP z walk",
                bonuses: {
                    expBonusPercent: 10
                }
            },
            {
                pieces: 6,
                name: "Echo rozdarcia",
                description:
                    "Każdy atak ma 15% szansy na powtórzenie się z 60% obrażeń.",
                uniqueEffect: {
                    id: "rift_echo",
                    name: "Echo rozdarcia",
                    description: "Każdy atak ma 15% szansy na powtórzenie się z 60% obrażeń.",
                    chancePercent: 15,
                    damagePercent: 60
                }
            }
        ]
    },
    {
        id: "tidecaller_set",
        name: "Rynsztunek głębin",
        icon: "🌊",
        theme: "tide",
        itemIds: [
            "tidecaller_shield",
            "tidecaller_helmet",
            "tidecaller_armor",
            "tidecaller_pants",
            "tidecaller_boots",
            "tidecaller_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Skarby głębin",
                description: "+15% szansy na łup z polowania",
                bonuses: {
                    huntingLootBonusPercent: 15
                }
            },
            {
                pieces: 6,
                name: "Bariera przypływu",
                description:
                    "Każde uderzenie przeciwnika ma 15% szansy na osłabienie o 50%.",
                uniqueEffect: {
                    id: "tide_ward",
                    name: "Bariera przypływu",
                    description: "Każde uderzenie przeciwnika ma 15% szansy na osłabienie o 50%.",
                    chancePercent: 15,
                    damageReductionPercent: 50
                }
            }
        ]
    },
    {
        id: "deepcrown_set",
        name: "Rynsztunek głębokiego króla",
        icon: "👑",
        theme: "royal",
        itemIds: [
            "deepcrown_shield",
            "deepcrown_helmet",
            "deepcrown_armor",
            "deepcrown_pants",
            "deepcrown_boots",
            "deepcrown_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Królewskie przywileje",
                description: "+10% szybkości kopania i zielarstwa",
                bonuses: {
                    miningSpeedPercent: 10,
                    herbalismSpeedPercent: 10
                }
            },
            {
                pieces: 6,
                name: "Odpłata króla",
                description:
                    "Odbijasz 20% otrzymanych obrażeń z powrotem w przeciwnika.",
                uniqueEffect: {
                    id: "royal_retribution",
                    name: "Odpłata króla",
                    description: "Odbijasz 20% otrzymanych obrażeń z powrotem w przeciwnika.",
                    reflectPercent: 20
                }
            }
        ]
    },
    {
        id: "prismforged_set",
        name: "Pryzmatyczny rynsztunek",
        icon: "💎",
        theme: "prism",
        itemIds: [
            "prismforged_shield",
            "prismforged_helmet",
            "prismforged_armor",
            "prismforged_pants",
            "prismforged_boots",
            "prismforged_gloves"
        ],
        thresholds: [
            {
                pieces: 3,
                name: "Pryzmatyczny blask",
                description: "+8% złota z potworów i +8% EXP z walk",
                bonuses: {
                    goldBonusPercent: 8,
                    expBonusPercent: 8
                }
            },
            {
                pieces: 6,
                name: "Rozszczepienie",
                description:
                    "Trafienia krytyczne zadają dodatkowe 40% obrażeń i leczą 3% maks. HP.",
                uniqueEffect: {
                    id: "prism_refraction",
                    name: "Rozszczepienie",
                    description: "Trafienia krytyczne zadają dodatkowe 40% obrażeń i leczą 3% maks. HP.",
                    damagePercent: 40,
                    healPercent: 3
                }
            }
        ]
    }
];

function getEquipmentSetDefinition(setId) {
    return (
        equipmentSetDefinitions.find(definition => {
            return definition.id === setId;
        }) || null
    );
}

function getEquipmentSetForItemId(itemId) {
    const item =
        typeof items !== "undefined"
            ? items[itemId]
            : null;

    const baseItemId =
        item?.baseItemId || itemId;

    return (
        equipmentSetDefinitions.find(definition => {
            return definition.itemIds.includes(
                baseItemId
            );
        }) || null
    );
}

function getEquippedEquipmentSetPieceIds(
    definition,
    equipment = player.equipment
) {
    if (
        !definition ||
        !equipment ||
        typeof equipment !== "object"
    ) {
        return [];
    }

    const equippedBaseItemIds = new Set();

    Object.values(equipment)
        .filter(Boolean)
        .forEach(itemId => {
            const item =
                typeof items !== "undefined"
                    ? items[itemId]
                    : null;

            equippedBaseItemIds.add(
                item?.baseItemId || itemId
            );
        });

    return definition.itemIds.filter(itemId => {
        return equippedBaseItemIds.has(itemId);
    });
}

function getEquipmentSetProgress(
    definition,
    equipment = player.equipment
) {
    const equippedItemIds =
        getEquippedEquipmentSetPieceIds(
            definition,
            equipment
        );

    return {
        definition,
        equippedItemIds,
        equippedPieces: equippedItemIds.length,
        totalPieces: definition?.itemIds?.length || 0,
        thresholds: (definition?.thresholds || []).map(
            threshold => {
                return {
                    ...threshold,
                    active:
                        equippedItemIds.length >=
                        threshold.pieces
                };
            }
        )
    };
}

function getActiveEquipmentSetBonuses(
    equipment = player.equipment
) {
    const bonuses = {
        maxHpPercent: 0,
        armorPercent: 0,
        dodgeChance: 0,
        critChance: 0,
        miningSpeedPercent: 0,
        herbalismSpeedPercent: 0,
        huntingLootBonusPercent: 0,
        goldBonusPercent: 0,
        expBonusPercent: 0
    };

    equipmentSetDefinitions.forEach(definition => {
        const progress =
            getEquipmentSetProgress(
                definition,
                equipment
            );

        progress.thresholds.forEach(threshold => {
            if (!threshold.active) {
                return;
            }

            Object.keys(bonuses).forEach(bonusKey => {
                bonuses[bonusKey] += Math.max(
                    0,
                    Number(
                        threshold.bonuses?.[bonusKey]
                    ) || 0
                );
            });
        });
    });

    return bonuses;
}

function getActiveEquipmentSetActivityBonus(
    bonusKey,
    equipment = player.equipment
) {
    const supportedBonusKeys = [
        "miningSpeedPercent",
        "herbalismSpeedPercent",
        "huntingLootBonusPercent",
        "goldBonusPercent",
        "expBonusPercent"
    ];

    if (!supportedBonusKeys.includes(bonusKey)) {
        return 0;
    }

    return Math.max(
        0,
        Number(
            getActiveEquipmentSetBonuses(
                equipment
            )[bonusKey]
        ) || 0
    );
}

function getEquipmentSetThresholdFullDescription(
    threshold
) {
    if (!threshold) {
        return "";
    }

    const descriptions = [
        threshold.description
    ].filter(Boolean);

    if (threshold.uniqueEffect) {
        descriptions.push(
            threshold.uniqueEffect.name +
            ": " +
            threshold.uniqueEffect.description
        );
    }

    return descriptions.join(" · ");
}

function getActiveEquipmentSetUniqueEffect(
    effectId,
    equipment = player.equipment
) {
    const activeThreshold =
        getActiveEquipmentSetThresholds(
            equipment
        ).find(entry => {
            return (
                entry.threshold
                    .uniqueEffect?.id ===
                effectId
            );
        });

    return activeThreshold
        ? activeThreshold.threshold
            .uniqueEffect
        : null;
}

function getActiveEquipmentSetThresholds(
    equipment = player.equipment
) {
    return equipmentSetDefinitions.flatMap(
        definition => {
            const progress =
                getEquipmentSetProgress(
                    definition,
                    equipment
                );

            return progress.thresholds
                .filter(threshold => {
                    return threshold.active;
                })
                .map(threshold => {
                    return {
                        id:
                            definition.id +
                            ":" +
                            threshold.pieces,
                        definition,
                        threshold,
                        equippedPieces:
                            progress.equippedPieces,
                        totalPieces:
                            progress.totalPieces
                    };
                });
        }
    );
}

function getEquipmentSetThresholdChanges(
    previousEquipment,
    nextEquipment
) {
    const previousThresholds =
        getActiveEquipmentSetThresholds(
            previousEquipment
        );
    const nextThresholds =
        getActiveEquipmentSetThresholds(
            nextEquipment
        );
    const previousIds = new Set(
        previousThresholds.map(entry => {
            return entry.id;
        })
    );
    const nextIds = new Set(
        nextThresholds.map(entry => {
            return entry.id;
        })
    );

    return {
        activated:
            nextThresholds.filter(entry => {
                return !previousIds.has(
                    entry.id
                );
            }),
        deactivated:
            previousThresholds.filter(entry => {
                return !nextIds.has(
                    entry.id
                );
            })
    };
}

function notifyEquipmentSetThresholdChanges(
    previousEquipment,
    nextEquipment
) {
    const changes =
        getEquipmentSetThresholdChanges(
            previousEquipment,
            nextEquipment
        );

    changes.activated.forEach(entry => {
        const message =
            entry.definition.icon +
            " Aktywowano: " +
            entry.threshold.name +
            " — " +
            getEquipmentSetThresholdFullDescription(
                entry.threshold
            );

        if (
            typeof showNotification ===
            "function"
        ) {
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
                message +
                " (" +
                entry.definition.name +
                ")",
                "equipment"
            );
        }
    });

    changes.deactivated.forEach(entry => {
        const message =
            entry.definition.icon +
            " Utracono premię: " +
            entry.threshold.name +
            " — " +
            getEquipmentSetThresholdFullDescription(
                entry.threshold
            );

        if (
            typeof showNotification ===
            "function"
        ) {
            showNotification(
                message,
                "warning"
            );
        }

        if (
            typeof addSystemLog ===
            "function"
        ) {
            addSystemLog(
                message +
                " (" +
                entry.definition.name +
                ")",
                "equipment"
            );
        }
    });

    return changes;
}
