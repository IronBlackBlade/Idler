function getHeroClassBonusesHtml(classDefinition) {
    if (!classDefinition?.bonuses) {
        return "";
    }

    const statNames = {
        strength: "Siła",
        dexterity: "Zręczność",
        intelligence: "Inteligencja",
        endurance: "Wytrzymałość",
        luck: "Szczęście"
    };

    return Object.entries(classDefinition.bonuses)
        .map(([statName, value]) => {
            return `
                <span class="hero-class-bonus-chip">
                    +${value}
                    ${statNames[statName] || statName}
                </span>
            `;
        })
        .join("");
}


function formatClassProgressionValue(value) {
    return Number(value)
        .toFixed(2)
        .replace(/\.?0+$/, "")
        .replace(".", ",");
}

function getHeroClassProgressionHtml() {
    if (
        typeof getClassProgressionBonuses !== "function" ||
        typeof getClassProgressionTier !== "function"
    ) {
        return "";
    }

    const tier = getClassProgressionTier();
    const bonuses = getClassProgressionBonuses();

    const descriptions = {
        warrior:
            `+${bonuses.strength} Siły · ` +
            `+${formatClassProgressionValue(
                bonuses.meleeDamagePercent
            )}% obrażeń wręcz`,

        hunter:
            `+${bonuses.dexterity} Zręczności · ` +
            `+${formatClassProgressionValue(
                bonuses.rangedDamagePercent
            )}% obrażeń dystansowych`,

        mage:
            `+${bonuses.intelligence} Inteligencji · ` +
            `+${formatClassProgressionValue(
                bonuses.combatManaRegenPerSecond
            )} many/s w walce`,

        guardian:
            `+${bonuses.endurance} Wytrzymałości · ` +
            `+${formatClassProgressionValue(
                bonuses.combatHpRegenPercentPerSecond
            )}% HP/s w walce`,

        rogue:
            `+${bonuses.luck} Szczęścia · ` +
            `+${formatClassProgressionValue(
                bonuses.goldBonusPercent
            )}% złota`
    };

    const nextLevel =
        10 + (tier + 1) * 5;

    return `
        <span class="hero-class-progress-bonus">
            ${descriptions[player.classId] || ""}
        </span>

        <small>
            Następna premia: poziom ${nextLevel}
        </small>
    `;
}

function getClassProgressionPreviewHtml(classId) {
    const progressionByClass = {
        warrior: {
            icon: "⚔️",
            text:
                "Co 5 poziomów: +1 Siły " +
                "i +0,1% obrażeń wręcz"
        },

        hunter: {
            icon: "🏹",
            text:
                "Co 5 poziomów: +1 Zręczności " +
                "i +0,1% obrażeń dystansowych"
        },

        mage: {
            icon: "🔵",
            text:
                "Co 5 poziomów: +1 Inteligencji " +
                "i +0,2 many/s podczas walki"
        },

        guardian: {
            icon: "❤️",
            text:
                "Co 5 poziomów: +1 Wytrzymałości " +
                "i +0,05% maks. HP/s podczas walki"
        },

        rogue: {
            icon: "💰",
            text:
                "Co 5 poziomów: +1 Szczęścia " +
                "i +0,2% zdobywanego złota ze wszystkich żródeł"
        }
    };

    const progression =
        progressionByClass[classId];

    if (!progression) {
        return "";
    }

    return `
        <div class="hero-class-growth-preview">
            <span class="hero-class-growth-icon">
                ${progression.icon}
            </span>

            <span>
                ${progression.text}
            </span>
        </div>
    `;
}

function renderCharacterClassSection() {
    const attributesGrid =
        document.querySelector(
            '[data-hero-panel="attributes"] .hero-attributes-grid'
        ) ||
        document.querySelector(
            ".hero-attributes-grid"
        );

    if (!attributesGrid) {
        return;
    }

    const attributeConfirmation =
        document.querySelector(
            '[data-hero-panel="attributes"] ' +
            ".hero-attribute-confirmation"
        );

    let section =
        document.getElementById(
            "hero-character-class-section"
        );

    if (!section) {
        section =
            document.createElement("section");

        section.id =
            "hero-character-class-section";

        section.className =
            "hero-class-section";

        attributesGrid.parentElement.insertBefore(
            section,
            attributeConfirmation ||
            attributesGrid
        );
    }

    const selectedClass =
        typeof getPlayerClassDefinition ===
            "function"
            ? getPlayerClassDefinition()
            : null;

    if (selectedClass) {
        const tier =
            typeof getClassProgressionTier ===
                "function"
                ? getClassProgressionTier()
                : 0;

        section.classList.add(
            "has-selected-class"
        );

        section.innerHTML = `
            <div class="hero-class-compact-card">
                <div class="hero-class-compact-icon">
                    ${selectedClass.icon}
                </div>

                <div class="hero-class-compact-info">
                    <strong>
                        ${selectedClass.name}
                    </strong>

                    <p>
                        ${selectedClass.description}
                    </p>

                    <div class="hero-class-bonus-list">
                        ${getHeroClassBonusesHtml(
            selectedClass
        )}
                    </div>
                </div>

                <div class="hero-class-compact-progress">
                    <strong>
                        Rozwój klasy: stopień ${tier}
                    </strong>

                    ${getHeroClassProgressionHtml()}
                </div>
            </div>
        `;

        return;
    }

    section.classList.remove(
        "has-selected-class"
    );

    const definitions =
        Object.values(characterClasses);

    const requiredLevel =
        definitions.length > 0
            ? Math.min(
                ...definitions.map(
                    definition => {
                        return Number(
                            definition.unlockLevel
                        ) || 10;
                    }
                )
            )
            : 10;

    const selectionUnlocked =
        Number(player.level) >=
        requiredLevel;

    const progressPercent =
        Math.min(
            100,
            Math.max(
                0,
                Number(player.level) || 0
            ) /
            requiredLevel *
            100
        );

    const classCardsHtml =
        definitions
            .map(classDefinition => {
                const unlockLevel =
                    Number(
                        classDefinition.unlockLevel
                    ) || 10;

                const isUnlocked =
                    Number(player.level) >=
                    unlockLevel;

                return `
                    <article
                        class="hero-class-card ${isUnlocked
                        ? ""
                        : "locked"
                    }"
                    >
                        <div class="hero-class-card-icon">
                            ${classDefinition.icon}
                        </div>

                        <strong class="hero-class-card-name">
                            ${classDefinition.name}
                        </strong>

                        <p>
                            ${classDefinition.description}
                        </p>

                        <div class="hero-class-bonuses">
                            ${getHeroClassBonusesHtml(
                        classDefinition
                    )}
                        </div>
${getClassProgressionPreviewHtml(
                        classDefinition.id
                    )}
                        <button
                            type="button"
                            onclick="chooseCharacterClass('${classDefinition.id}')"
                            ${isUnlocked
                        ? ""
                        : "disabled"
                    }
                        >
                            ${isUnlocked
                        ? "Wybierz klasę"
                        : "Poziom " +
                        unlockLevel
                    }
                        </button>
                    </article>
                `;
            })
            .join("");

    let availabilityHtml = "";

    if (selectionUnlocked) {
        availabilityHtml = `
            <div class="hero-class-unlocked-message">
                Wybór klasy został odblokowany.
                Przeczytaj premie i wybierz
                specjalizację bohatera.
            </div>
        `;
    } else {
        availabilityHtml = `
            <div class="hero-class-progress">
                <div class="hero-class-progress-info">
                    <span>
                        Postęp do odblokowania
                    </span>

                    <strong>
                        ${player.level}/${requiredLevel}
                    </strong>
                </div>

                <div class="hero-class-progress-track">
                    <div
                        class="hero-class-progress-fill"
                        style="width: ${progressPercent}%"
                    ></div>
                </div>
            </div>
        `;
    }

    section.innerHTML = `
        <div class="hero-class-header">
            <div>
                <strong>
                    Wybór klasy postaci
                </strong>

                <span>
                    Klasa zapewnia stałe premie
                    do wybranych atrybutów.
                </span>
            </div>

            <span
                class="hero-class-status ${selectionUnlocked
            ? "unlocked"
            : ""
        }"
            >
                ${selectionUnlocked
            ? "Dostępne"
            : "Poziom " +
            player.level +
            "/" +
            requiredLevel
        }
            </span>
        </div>

        ${availabilityHtml}

        <div class="hero-class-grid">
            ${classCardsHtml}
        </div>
    `;
}
function renderHeroClassSummaryCard() {
    const summaryGrid =
        document.querySelector(
            '[data-hero-panel="summary"] .hero-summary-grid'
        ) ||
        document.querySelector(
            ".hero-summary-grid"
        );

    if (!summaryGrid) {
        return;
    }

    let classCard =
        document.getElementById(
            "hero-class-summary-card"
        );

    if (!classCard) {
        classCard =
            document.createElement(
                "div"
            );

        classCard.id =
            "hero-class-summary-card";

        summaryGrid.appendChild(
            classCard
        );
    }

    classCard.className =
        "hero-summary-card summary-class";

    const selectedClass =
        typeof getPlayerClassDefinition ===
            "function"
            ? getPlayerClassDefinition()
            : null;

    if (selectedClass) {
        classCard.innerHTML = `
            <div class="hero-summary-icon">
                ${selectedClass.icon}
            </div>

            <div class="hero-summary-content">
                <span>
                    Klasa postaci
                </span>

                <strong>
                    ${selectedClass.name}
                </strong>
            </div>
        `;

        return;
    }

    const isUnlocked =
        player.level >= 10;

    classCard.innerHTML = `
        <div class="hero-summary-icon">
            ${isUnlocked
            ? "🏛️"
            : "🔒"
        }
        </div>

        <div class="hero-summary-content">
            <span>
                Klasa postaci
            </span>

            <strong>
                ${isUnlocked
            ? "Wybierz klasę"
            : "Od 10. poziomu"
        }
            </strong>
        </div>
    `;
}

function openCharacterClassSelection() {
    if (
        typeof openHeroTab ===
        "function"
    ) {
        openHeroTab(
            "attributes"
        );
    }

    /*
     * Czekamy, aż zakładka Atrybuty
     * stanie się widoczna.
     */
    requestAnimationFrame(() => {
        const classSection =
            document.getElementById(
                "hero-character-class-section"
            );

        if (!classSection) {
            return;
        }

        classSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        classSection.classList.add(
            "hero-class-section-highlight"
        );

        setTimeout(() => {
            classSection.classList.remove(
                "hero-class-section-highlight"
            );
        }, 1200);
    });
}

function renderSideHeroClassHud() {
    const classElement =
        document.getElementById(
            "side-hero-class"
        );

    const classButton =
        document.getElementById(
            "side-hero-class-button"
        );

    if (
        !classElement ||
        !classButton
    ) {
        return;
    }

    const selectedClass =
        typeof getPlayerClassDefinition ===
            "function"
            ? getPlayerClassDefinition()
            : null;

    /*
     * Klasa została już wybrana.
     */
    if (selectedClass) {
        classElement.textContent =
            selectedClass.icon +
            " " +
            selectedClass.name;

        classElement.classList.add(
            "has-class"
        );

        classElement.classList.remove(
            "class-available"
        );

        classButton.hidden = true;

        return;
    }

    classElement.classList.remove(
        "has-class"
    );

    /*
     * Gracz osiągnął poziom 10,
     * ale nie wybrał jeszcze klasy.
     */
    if (
        Number(player.level) >= 10
    ) {
        classElement.textContent =
            "🏛️ Klasa niewybrana";

        classElement.classList.add(
            "class-available"
        );

        classButton.hidden = false;

        return;
    }

    /*
     * Klasa nie została jeszcze
     * odblokowana.
     */
    classElement.textContent =
        "🔒 Klasa od 10. poziomu";

    classElement.classList.remove(
        "class-available"
    );

    classButton.hidden = true;
}

