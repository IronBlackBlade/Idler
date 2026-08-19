function openGardenScreen() {
    ensureGardenState();

    if (typeof showScreen === "function") {
        showScreen("screen-garden");
    }

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

            return `
                <option value="${inventoryItem.itemId}">
                    ${item.name} x${inventoryItem.quantity}
                </option>
            `;
        })
        .join("");
}

function getGardenPlotHtml(plot, index) {
    if (!plot.seedItemId) {
        return `
            <div class="garden-plot">
                <div class="garden-plot-header">
                    <strong>
                        Grządka ${index + 1}
                    </strong>
                    <span>
                        Wolna
                    </span>
                </div>

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

    const seedItem =
        items[plot.seedItemId];

    const sourceItem =
        items[plot.sourceItemId];

    const remainingSeconds =
        getGardenPlotRemainingSeconds(plot);

    const isReady =
        isGardenPlotReady(plot);

    return `
        <div class="garden-plot">
            <div class="garden-plot-header">
                <strong>
                    Grządka ${index + 1}
                </strong>
                <span>
                    ${isReady ? "Gotowe" : "Rośnie"}
                </span>
            </div>

            <div class="garden-growing-info">
                <strong>
                    ${seedItem?.name || plot.seedItemId}
                </strong>

                <span>
                    Plon:
                    ${sourceItem?.name || plot.sourceItemId}
                </span>

                <span>
                    ${isReady
                        ? "Można zebrać"
                        : "Pozostało: " +
                            formatGardenTime(remainingSeconds)
                    }
                </span>
            </div>

            <button
                type="button"
                class="garden-action-button"
                onclick="harvestGardenPlot(${index})"
                ${isReady ? "" : "disabled"}
            >
                Zbierz
            </button>
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
                    <strong>
                        Sadzenie składników
                    </strong>
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

setInterval(() => {
    const gardenScreen =
        document.getElementById("screen-garden");

    if (
        !gardenScreen ||
        window.getComputedStyle(gardenScreen).display === "none"
    ) {
        return;
    }

    renderGarden();
}, 1000);