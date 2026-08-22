function openGardenScreen() {
    ensureGardenState();
    showScreen("screen-garden");
    setGardenMenuActive();
    renderGarden();
}

function setGardenMenuActive() {
    document
        .querySelectorAll(
            "#menu [data-menu-section]"
        )
        .forEach(button => {
            button.classList.remove(
                "menu-active"
            );
        });

    const gardenButton =
        document.querySelector(
            '#menu [data-menu-section="garden"]'
        );

    if (gardenButton) {
        gardenButton.classList.add(
            "menu-active"
        );
    }
}

function formatGardenTime(totalSeconds) {
    const safeSeconds = Math.max(
        0,
        Math.ceil(Number(totalSeconds) || 0)
    );

    const hours =
        Math.floor(safeSeconds / 3600);

    const minutes =
        Math.floor((safeSeconds % 3600) / 60);

    const seconds =
        safeSeconds % 60;

    if (hours > 0) {
        return hours + " godz. " + minutes + " min";
    }

    if (minutes > 0) {
        return minutes + " min " + seconds + " s";
    }

    return seconds + " s";
}

function getGardenSeedOptionsHtml() {
    const seedInventory =
        getGardenSeedInventoryItems();

    if (seedInventory.length === 0) {
        return `
            <option value="">
                Brak nasion
            </option>
        `;
    }

    return seedInventory
        .map(inventoryItem => {
            const item =
                items[inventoryItem.itemId];

            const growthTime =
                formatGardenTime(
                    getGardenGrowthSeconds(item)
                );

            return `
                <option value="${inventoryItem.itemId}">
                    ${item.name} x${inventoryItem.quantity}
                    (${growthTime})
                </option>
            `;
        })
        .join("");
}

function getGardenPlotHtml(plot, index) {
    if (!plot.seedItemId) {
        return `
            <div class="garden-plot garden-plot-empty">
                <strong>
                    Grządka ${index + 1}
                </strong>

                <select
                    id="garden-seed-select-${index}"
                    class="garden-seed-select"
                >
                    ${getGardenSeedOptionsHtml()}
                </select>

                <button
                    type="button"
                    class="garden-action-button"
                    onclick="plantGardenSeedFromUI(${index})"
                >
                    Zasadź
                </button>
            </div>
        `;
    }

    const sourceItem =
        items[plot.sourceItemId];

    const isReady =
        isGardenPlotReady(plot);

    const remainingSeconds =
        getGardenPlotRemainingSeconds(plot);

    return `
        <div class="garden-plot ${isReady ? "garden-plot-ready" : ""
        }">
            <div class="garden-plant-main">
                <strong>
                    🌿 ${sourceItem?.name || plot.sourceItemId}
                </strong>

                <span
                    class="garden-plant-time"
                    data-garden-timer="${index}"
                >
                    ${isReady
            ? "Gotowe do zebrania"
            : formatGardenTime(
                remainingSeconds
            )
        }
                </span>

<button
    type="button"
    class="garden-action-button"
    data-garden-harvest="${index}"
    onclick="harvestGardenPlot(${index})"
    ${isReady ? "" : "disabled"}
>
    Zbierz
</button>
            </div>
        </div>
    `;
}

function plantGardenSeedFromUI(plotIndex) {
    const select =
        document.getElementById(
            "garden-seed-select-" + plotIndex
        );

    if (!select || !select.value) {
        if (typeof showNotification === "function") {
            showNotification(
                "Wybierz nasiono.",
                "error"
            );
        }

        return;
    }

    plantGardenSeed(
        plotIndex,
        select.value
    );
}

function renderGarden() {
    ensureGardenState();

    const container =
        document.getElementById("garden-panel");

    if (!container) {
        return;
    }
    const unlockedPlotCount =
        getGardenUnlockedPlotCount();

    const plotsHtml =
        player.garden.plots
            .slice(0, unlockedPlotCount)
            .map((plot, index) => {
                return getGardenPlotHtml(
                    plot,
                    index
                );
            })
            .join("");

    const gardenLevel =
        player.garden.level;

    const gardenExp =
        player.garden.exp;

    const gardenExpNeeded =
        player.garden.expToNextLevel;

    const gardenProgress =
        gardenExpNeeded > 0
            ? Math.min(
                100,
                gardenExp /
                gardenExpNeeded *
                100
            )
            : 0;

    const greenhouseLevel =
        player.garden.upgrades
            .greenhouseLevel;

    const greenhouseCost =
        getGardenGreenhouseCost();

    const greenhouseMaxed =
        greenhouseLevel >=
        GARDEN_GREENHOUSE_MAX_LEVEL;

    const greenhouseBonus =
        greenhouseLevel *
        GARDEN_GREENHOUSE_SPEED_PER_LEVEL;

    const soilLevel =
        player.garden.upgrades.fertileSoilLevel;

    const soilCost =
        getGardenSoilCost();

    const soilMaxed =
        soilLevel >= GARDEN_SOIL_MAX_LEVEL;

    const soilBonus =
        soilLevel *
        GARDEN_SOIL_BONUS_CHANCE_PER_LEVEL;
    const seedChestLevel =
        player.garden.upgrades.seedChestLevel;

    const seedChestCost =
        getGardenSeedChestCost();

    const seedChestMaxed =
        seedChestLevel >=
        GARDEN_SEED_CHEST_MAX_LEVEL;

    const seedRecoveryChance =
        getGardenSeedRecoveryChance();

    const expansionLevel =
        player.garden.expansionLevel;
    const expansionMaxed =
        expansionLevel >=
        GARDEN_MAX_EXPANSION_LEVEL;

    const expansionCost =
        getGardenExpansionCost();


    container.innerHTML = `
        <div class="garden-level-panel">
            <div class="garden-level-label">
                <span>
                    Ogrodnictwo
                </span>

                <strong>
                    Poziom ${gardenLevel}
                    · ${gardenExp}/${gardenExpNeeded} EXP
                </strong>
            </div>

            <div class="garden-level-bar">
                <div
                    class="garden-level-fill"
                    style="width: ${gardenProgress}%"
                ></div>
            </div>

            <small>
                Odblokowane grządki:
                ${unlockedPlotCount}/${GARDEN_MAX_PLOT_COUNT}
            </small>
        </div>

        <div class="game-card garden-card">
            <div class="garden-header">
                <span>Ogród</span>

                <p>
                    Sadź nasiona zdobyte podczas zielarstwa
                    i zbieraj rośliny po czasie.
                </p>
            </div>
<div class="garden-bulk-actions">
    <div class="garden-bulk-plant">
        <select
            id="garden-bulk-seed-select"
            class="garden-seed-select"
        >
            ${getGardenSeedOptionsHtml()}
        </select>

        <button
            type="button"
            class="garden-action-button"
            onclick="plantAllGardenPlotsFromUI()"
        >
            Zasadź wszystko
        </button>
    </div>

    <button
        type="button"
        class="garden-action-button garden-harvest-all-button"
        onclick="harvestAllGardenPlots()"
    >
        Zbierz wszystko
    </button>
</div>
            <div class="garden-plots">
                ${plotsHtml}
            </div>
        </div>
</div>
<div class="garden-upgrade-card">
    <div>
        <strong>🌾 Żyzna gleba</strong>

        <span>
            Poziom ${soilLevel}/${GARDEN_SOIL_MAX_LEVEL}
        </span>

        <small>
            Szansa na +1 plonu: ${soilBonus}%
        </small>
    </div>

    <button
        type="button"
        class="garden-upgrade-button"
        onclick="buyGardenSoilUpgrade()"
        ${soilMaxed ? "disabled" : ""}
    >
        ${soilMaxed
            ? "Maksymalny poziom"
            : "Ulepsz za " + soilCost + " 💰"
        }
    </button>
</div>

<div class="garden-upgrade-card">
    <div>
        <strong>🏡 Szklarnia</strong>

        <span>
            Poziom ${greenhouseLevel}/${GARDEN_GREENHOUSE_MAX_LEVEL}
        </span>

        <small>
            Czas wzrostu: -${greenhouseBonus}%
        </small>
    </div>

    <button
        type="button"
        class="garden-upgrade-button"
        onclick="buyGardenGreenhouseUpgrade()"
        ${greenhouseMaxed ? "disabled" : ""}
    >
        ${greenhouseMaxed
            ? "Maksymalny poziom"
            : "Ulepsz za " +
            greenhouseCost +
            " 💰"
        }
    </button>
</div>

<div class="garden-upgrade-card">
    <div>
        <strong>🧰 Skrzynia nasion</strong>

        <span>
            Poziom ${seedChestLevel}/
            ${GARDEN_SEED_CHEST_MAX_LEVEL}
        </span>

        <small>
            Szansa odzyskania nasiona:
            ${seedRecoveryChance}%
        </small>
    </div>

    <button
        type="button"
        class="garden-upgrade-button"
        onclick="buyGardenSeedChestUpgrade()"
        ${seedChestMaxed ? "disabled" : ""}
    >
        ${seedChestMaxed
            ? "Maksymalny poziom"
            : "Ulepsz za " +
            seedChestCost +
            " 💰"
        }
    </button>
</div>
<div class="garden-upgrade-card">
    <div>
        <strong>🧱 Rozbudowa ogrodu</strong>

        <span>
            Poziom ${expansionLevel}/
            ${GARDEN_MAX_EXPANSION_LEVEL}
        </span>

        <small>
            Każdy poziom odblokowuje jedną dodatkową grządkę.
        </small>

        <small>
            Dodatkowe grządki: +${expansionLevel}
        </small>
    </div>

    <button
        type="button"
        class="garden-upgrade-button"
        onclick="buyGardenExpansionUpgrade()"
        ${expansionMaxed ? "disabled" : ""}
    >
        ${expansionMaxed
            ? "Maksymalny poziom"
            : "Ulepsz za " + expansionCost + " 💰"
        }
    </button>
</div>

    `;
}

function updateGardenTimers() {
    const gardenScreen =
        document.getElementById("screen-garden");

    if (
        !gardenScreen ||
        window.getComputedStyle(gardenScreen).display ===
        "none"
    ) {
        return;
    }

    document
        .querySelectorAll("[data-garden-timer]")
        .forEach(timerElement => {
            const plotIndex =
                Number(
                    timerElement.dataset.gardenTimer
                );

            const plot =
                player.garden?.plots?.[plotIndex];

            if (!plot || !plot.seedItemId) {
                return;
            }

            const harvestButton =
                document.querySelector(
                    `[data-garden-harvest="${plotIndex}"]`
                );

            if (isGardenPlotReady(plot)) {
                timerElement.textContent =
                    "Gotowe do zebrania";

                if (harvestButton) {
                    harvestButton.disabled = false;
                }

                timerElement
                    .closest(".garden-plot")
                    ?.classList.add(
                        "garden-plot-ready"
                    );

                return;
            }

            timerElement.textContent =
                formatGardenTime(
                    getGardenPlotRemainingSeconds(plot)
                );
        });
}

setInterval(
    updateGardenTimers,
    1000
);

function initializeGardenUI() {
    if (
        typeof player === "undefined" ||
        typeof ensureGardenState !== "function"
    ) {
        return;
    }

    ensureGardenState();
    renderGarden();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeGardenUI
    );
} else {
    initializeGardenUI();
}

function plantAllGardenPlotsFromUI() {
    const select =
        document.getElementById(
            "garden-bulk-seed-select"
        );

    if (!select || !select.value) {
        if (typeof showNotification === "function") {
            showNotification(
                "Wybierz nasiono.",
                "error"
            );
        }

        return;
    }

    plantAllGardenPlots(
        select.value
    );
}