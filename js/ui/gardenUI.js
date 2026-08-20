function openGardenScreen() {
    ensureGardenState();
    showScreen("screen-garden");
    setGardenMenuActive();
    renderGarden();
}

function formatGardenTime(totalSeconds) {
    const safeSeconds =
        Math.max(
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
        return (
            hours +
            " godz. " +
            minutes +
            " min"
        );
    }

    if (minutes > 0) {
        return (
            minutes +
            " min " +
            seconds +
            " s"
        );
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

            const growthSeconds =
                getGardenGrowthSeconds(item);

            const growthTime =
                formatGardenTime(growthSeconds);

            return `
    <option value="${inventoryItem.itemId}">
        ${item.name} x${inventoryItem.quantity} (${growthTime})
    </option>
`;
        })
        .join("");
}

function getGardenPlotHtml(plot, index) {
    if (!plot.seedItemId) {
        return `
            <div class="garden-plot garden-plot-empty">
                <strong>Grządka ${index + 1}</strong>

                <div class="garden-plant-row">
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
    <div class="garden-plot ${isReady ? "garden-plot-ready" : ""}">
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
            : formatGardenTime(remainingSeconds)
        }
            </span>

            <button
                type="button"
                class="garden-action-button"
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

    const plotsHtml =
        player.garden.plots
            .map((plot, index) => {
                return getGardenPlotHtml(
                    plot,
                    index
                );
            })
            .join("");

    container.innerHTML = `
        <div class="game-card garden-card">
            <div class="garden-header">
                <div>
                    <span>
                        Ogród
                    </span>
                    <p>
                        Sadź nasiona zdobyte podczas zielarstwa i odbieraj dodatkowe składniki po czasie.
                    </p>
                </div>
            </div>

            <div class="garden-plots">
                ${plotsHtml}
            </div>
        </div>
    `;
}


function updateGardenTimers() {
    const gardenScreen =
        document.getElementById("screen-garden");

    if (
        !gardenScreen ||
        window.getComputedStyle(gardenScreen).display === "none"
    ) {
        return;
    }

    document
        .querySelectorAll("[data-garden-timer]")
        .forEach(timerElement => {
            const plotIndex =
                Number(timerElement.dataset.gardenTimer);

            const plot =
                player.garden?.plots?.[plotIndex];

            if (!plot || !plot.seedItemId) {
                return;
            }

            if (isGardenPlotReady(plot)) {
                renderGarden();
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
    if (typeof ensureGardenState === "function") {
        ensureGardenState();
    }

    if (typeof renderGarden === "function") {
        renderGarden();
    }
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeGardenUI
    );
} else {
    initializeGardenUI();
}

function setGardenMenuActive() {
    document
        .querySelectorAll("[data-menu-section]")
        .forEach(button => {
            button.classList.remove("active");
        });

    const gardenButton =
        document.querySelector(
            '[data-menu-section="garden"]'
        );

    if (gardenButton) {
        gardenButton.classList.add("active");
    }
}