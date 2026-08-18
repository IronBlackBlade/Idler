function renderAdventurersTavern() {
    if (typeof ensureTavernState === "function") {
        ensureTavernState();
    }

    const container =
        document.getElementById(
            "tavern-adventurers-panel"
        );

    if (!container) {
        return;
    }

    try {
        if (
            typeof checkTavernJobCompletion === "function"
        ) {
            checkTavernJobCompletion({
                render: false
            });
        }
    } catch (error) {
        console.error(
            "Błąd sprawdzania zlecenia śmiałka:",
            error
        );
    }

    container.innerHTML =
        getTavernDashboardHtml();
}

function getTavernDashboardHtml() {
    return `
        <div class="game-card tavern-dashboard-card">
            ${getTavernDashboardHeaderHtml()}

            <div class="tavern-dashboard-body">
                ${getTavernStatusPanelHtml()}
                ${getTavernAvailableAdventurersHtml()}
            </div>
        </div>
    `;
}

function getTavernDashboardHeaderHtml() {
    const activeJob =
        player.tavern?.activeJob || null;

    const lastCompletedJob =
        player.tavern?.lastCompletedJob || null;

    let message =
        "Witaj w karczmie. Wybierz śmiałka, wskaż mu odblokowany obszar i wyślij go po skromny zysk.";

    if (activeJob) {
        const adventurer =
            getTavernAdventurer(
                activeJob.adventurerId
            );

        const area =
            getTavernArea(
                activeJob.activityType,
                activeJob.areaId
            );

        message =
            (
                adventurer?.name ||
                "Śmiałek"
            ) +
            " jest już w drodze. Obszar: " +
            (
                area?.name ||
                activeJob.areaId
            ) +
            ".";
    } else if (lastCompletedJob) {
        const adventurer =
            getTavernAdventurer(
                lastCompletedJob.adventurerId
            );

        message =
            (
                adventurer?.name ||
                "Śmiałek"
            ) +
            " wrócił z ostatniej wyprawy. Sprawdź, co przyniósł.";
    }

    return `
        <div class="tavern-dashboard-header">
            <div class="tavern-keeper-portrait">
                🍺
            </div>

            <div class="tavern-dashboard-title">
                <span>
                    Karczmarz
                </span>

                <strong>
                    Pod Złotym Kuflem
                </strong>

                <p>
                    ${message}
                </p>
            </div>
        </div>
    `;
}

function getTavernStatusPanelHtml() {
    const activeJob =
        player.tavern?.activeJob || null;

    if (activeJob) {
        return getTavernActiveJobCompactHtml(
            activeJob
        );
    }

    const lastJob =
        player.tavern?.lastCompletedJob || null;

    if (lastJob) {
        return getTavernLastReturnCompactHtml(
            lastJob
        );
    }

    return `
        <section class="tavern-dashboard-section">
            <div class="tavern-section-header">
                <strong>
                    🍺 Status karczmy
                </strong>
                <span>
                    Brak aktywnego zlecenia
                </span>
            </div>

            <p class="tavern-muted-text">
                Wybierz śmiałka z listy poniżej.
            </p>
        </section>
    `;
}
function getTavernActiveJobCompactHtml(job) {
    const adventurer =
        getTavernAdventurer(
            job.adventurerId
        );

    const area =
        getTavernArea(
            job.activityType,
            job.areaId
        );

    return `
        <section class="tavern-dashboard-section">
            <div class="tavern-section-header">
                <strong>
                    ${adventurer?.icon || "👣"}
                    Aktywne zlecenie
                </strong>

                <span>
                    ${getTavernActivityLabel(job.activityType)}
                </span>
            </div>

            <div class="tavern-active-compact">
                <div>
                    <strong>
                        ${adventurer?.name || "Śmiałek"}
                    </strong>

                    <span>
                        Obszar:
                        ${area?.name || job.areaId}
                    </span>

                    <span>
                        Skuteczność:
                        ${job.efficiencyPercent}%
                    </span>
                </div>

                <div class="tavern-active-time">
                    Pozostało:
                    <strong id="tavern-active-time-value">
                        ${formatTavernDuration(
        getTavernTimeRemainingSeconds()
    )}
                    </strong>
                </div>

                <button
                    type="button"
                    class="tavern-secondary-button"
                    onclick="cancelTavernJob()"
                >
                    Anuluj
                </button>
            </div>
        </section>
    `;
}

function getTavernLastReturnCompactHtml(lastJob) {
    const adventurer =
        getTavernAdventurer(
            lastJob.adventurerId
        );

    const area =
        getTavernArea(
            lastJob.activityType,
            lastJob.areaId
        );

    const rewards =
        Array.isArray(lastJob.rewards)
            ? lastJob.rewards
            : [];

    const rewardsHtml =
        rewards.length > 0
            ? rewards
                .map(reward => {
                    if (reward.type === "gold") {
                        return `
                            <div class="tavern-reward-pill">
                                <span>💰 Złoto</span>
                                <strong>x${reward.quantity}</strong>
                            </div>
                        `;
                    }

                    const item =
                        typeof items !== "undefined"
                            ? items[reward.itemId]
                            : null;

                    return `
                        <div class="tavern-reward-pill">
                            <span>
                                ${item?.name || reward.itemId}
                            </span>
                            <strong>
                                x${reward.quantity}
                            </strong>
                        </div>
                    `;
                })
                .join("")
            : `
                <p class="tavern-muted-text">
                    Śmiałek wrócił bez łupów.
                </p>
            `;
    const isClaimed =
        lastJob.claimed === true;

    return `
    <section class="tavern-dashboard-section">
        <div class="tavern-section-header">
            <strong>
                🎒 Ostatni powrót
            </strong>

            <span>
                ${area?.name || lastJob.areaId}
            </span>
        </div>

        <div class="tavern-last-return-compact">
            <div class="tavern-return-summary">
                <strong>
                    ${adventurer?.icon || "👣"}
                    ${adventurer?.name || "Śmiałek"}
                </strong>
            </div>

            <div class="tavern-rewards-grid">
                ${rewardsHtml}
            </div>

            <div class="tavern-return-actions">
                <button
                    type="button"
                    class="tavern-claim-button"
                    onclick="claimTavernLastReturn()"
                    ${isClaimed ? "disabled" : ""}
                >
                    ${isClaimed ? "Odebrano" : "Odbierz łupy"}
                </button>
            </div>
        </div>
    </section>
`;

}

function getTavernAvailableAdventurersHtml() {
    if (
        typeof tavernAdventurers === "undefined" ||
        !Array.isArray(tavernAdventurers)
    ) {
        return `
            <section class="tavern-dashboard-section">
                <div class="tavern-section-header">
                    <strong>
                        Śmiałkowie
                    </strong>
                </div>

                <p class="tavern-muted-text">
                    Brak danych śmiałków.
                </p>
            </section>
        `;
    }

    const rows =
        tavernAdventurers
            .map(adventurer => {
                return getTavernAdventurerRowHtml(
                    adventurer
                );
            })
            .join("");

    return `
        <section class="tavern-dashboard-section">
            <div class="tavern-section-header">
                <strong>
                    🧭 Dostępni śmiałkowie
                </strong>

                <span>
                    Wybierz obszar i wyślij na zlecenie
                </span>
            </div>

            <div class="tavern-adventurer-list">
                ${rows}
            </div>
        </section>
    `;
}

function getTavernAdventurerRowHtml(adventurer) {
    const unlockedAreas =
        getUnlockedTavernAreas(
            adventurer.activityType
        );

    const canHire =
        !player.tavern.activeJob &&
        player.gold >= adventurer.hireCost &&
        unlockedAreas.length > 0;

    const areaOptions =
        unlockedAreas
            .map(area => {
                return `
                    <option value="${area.id}">
                        ${area.name}
                    </option>
                `;
            })
            .join("");

    const selectId =
        "tavern-area-" +
        adventurer.id;

    const durationSelectId =
        "tavern-duration-" +
        adventurer.id;

    const durationOptions = [
        {
            multiplier: 1,
            label: "1 godz."
        },
        {
            multiplier: 4,
            label: "4 godz."
        },
        {
            multiplier: 8,
            label: "8 godz."
        },
        {
            multiplier: 12,
            label: "12 godz."
        },
        {
            multiplier: 24,
            label: "24 godz."
        }
    ];

    const durationOptionsHtml =
        durationOptions
            .map(option => {
                const cost =
                    Math.max(
                        0,
                        Math.floor(
                            Number(adventurer.hireCost) || 0
                        )
                    ) * option.multiplier;

                return `
                <option value="${option.multiplier}">
                    ${option.label} - ${cost} 💰
                </option>
            `;
            })
            .join("");

    const buttonText =
        player.tavern.activeJob
            ? "Zajęte"
            : player.gold < adventurer.hireCost
                ? "Brak złota"
                : unlockedAreas.length === 0
                    ? "Brak obszarów"
                    : "Wynajmij";

    return `
        <div class="tavern-adventurer-row">
            <div class="tavern-adventurer-main">
                <div class="tavern-adventurer-icon">
                    ${adventurer.icon}
                </div>

                <div>
                    <strong>
                        ${adventurer.name}
                    </strong>

                    <span>
                        ${getTavernActivityLabel(adventurer.activityType)}
                        • ${adventurer.efficiencyPercent}%
                        • ${adventurer.durationMinutes} min
                        • ${adventurer.hireCost} 💰
                    </span>
                </div>
            </div>

<select
    id="${selectId}"
    class="tavern-area-select"
    ${unlockedAreas.length === 0 ? "disabled" : ""}
>
    ${areaOptions}
</select>

<select
    id="${durationSelectId}"
    class="tavern-duration-select"
    ${unlockedAreas.length === 0 || player.tavern.activeJob ? "disabled" : ""}
>
    ${durationOptionsHtml}
</select>

<button
    type="button"
    class="tavern-hire-button"
    onclick="hireTavernAdventurerFromUI('${adventurer.id}')"
    ${!canHire ? "disabled" : ""}
>
    ${buttonText}
</button>
        </div>
    `;
}

function getTavernKeeperHtml() {
    const activeJob =
        player.tavern?.activeJob || null;

    const lastCompletedJob =
        player.tavern?.lastCompletedJob || null;

    let keeperMessage =
        "Witaj w karczmie. Wybierz śmiałka, wskaż mu odblokowany obszar i wyślij go po skromny zysk.";

    if (activeJob) {
        const adventurer =
            getTavernAdventurer(
                activeJob.adventurerId
            );

        const area =
            getTavernArea(
                activeJob.activityType,
                activeJob.areaId
            );

        keeperMessage =
            (
                adventurer?.name ||
                "Śmiałek"
            ) +
            " jest już w drodze. Pracuje w obszarze: " +
            (
                area?.name ||
                activeJob.areaId
            ) +
            ".";
    } else if (lastCompletedJob) {
        const adventurer =
            getTavernAdventurer(
                lastCompletedJob.adventurerId
            );

        keeperMessage =
            (
                adventurer?.name ||
                "Śmiałek"
            ) +
            " wrócił z ostatniej wyprawy. Sprawdź, co przyniósł.";
    }

    return `
        <div class="game-card tavern-keeper-card">
            <div class="tavern-keeper-layout">
                <div class="tavern-keeper-portrait">
                    🍺
                </div>

                <div class="tavern-keeper-content">
                    <span class="tavern-keeper-label">
                        Karczmarz
                    </span>

                    <strong>
                        Pod Złotym Kuflem
                    </strong>

                    <p>
                        ${keeperMessage}
                    </p>
                </div>
            </div>
        </div>
    `;
}

function getTavernActiveJobHtml() {
    const job =
        player.tavern.activeJob;

    if (!job) {
        return `
            <div class="game-card tavern-active-card">
                <div class="card-header">
                    🍺 Aktywne zlecenie
                </div>

                <p>
                    Nie masz aktywnego śmiałka.
                </p>
            </div>
        `;
    }

    const adventurer =
        getTavernAdventurer(
            job.adventurerId
        );

    const area =
        getTavernArea(
            job.activityType,
            job.areaId
        );

    const remainingSeconds =
        getTavernTimeRemainingSeconds();

    return `
        <div class="game-card tavern-active-card">
            <div class="card-header">
                🍺 Aktywny śmiałek
            </div>

            <div class="tavern-active-job">
                <div>
                    <strong>
                        ${adventurer?.icon || "👣"}
                        ${adventurer?.name || "Śmiałek"}
                    </strong>

                    <span>
                        ${getTavernActivityLabel(job.activityType)}:
                        ${area?.name || job.areaId}
                    </span>

                    <span>
                        Skuteczność:
                        ${job.efficiencyPercent}%
                    </span>
                </div>

<div class="tavern-active-time">
    Pozostało:
    <strong id="tavern-active-time-value">
        ${formatTavernDuration(remainingSeconds)}
    </strong>
</div>

                <button
                    type="button"
                    onclick="cancelTavernJob()"
                >
                    Anuluj zlecenie
                </button>
            </div>
        </div>
    `;
}

function getTavernLastReturnHtml() {
    const lastJob =
        player.tavern.lastCompletedJob;

    if (!lastJob) {
        return "";
    }

    const adventurer =
        getTavernAdventurer(
            lastJob.adventurerId
        );

    const area =
        getTavernArea(
            lastJob.activityType,
            lastJob.areaId
        );

    const rewards =
        Array.isArray(lastJob.rewards)
            ? lastJob.rewards
            : [];

    const rewardsHtml =
        rewards.length > 0
            ? rewards
                .map(reward => {
                    if (reward.type === "gold") {
                        return `
            <div class="tavern-return-reward">
                <span>
                    💰 Złoto
                </span>

                <strong>
                    x${reward.quantity}
                </strong>
            </div>
        `;
                    }

                    const item =
                        typeof items !== "undefined"
                            ? items[reward.itemId]
                            : null;

                    return `
        <div class="tavern-return-reward">
            <span>
                ${item?.name || reward.itemId}
            </span>

            <strong>
                x${reward.quantity}
            </strong>
        </div>
    `;
                })
                .join("")
            : `
                <p>
                    Śmiałek wrócił bez łupów.
                </p>
            `;

    return `
        <div class="game-card tavern-last-return-card">
            <div class="card-header">
                🎒 Ostatni powrót
            </div>

            <div class="tavern-last-return-content">
                <strong>
                    ${adventurer?.icon || "👣"}
                    ${adventurer?.name || "Śmiałek"}
                </strong>

                <span>
                    Obszar:
                    ${area?.name || lastJob.areaId}
                </span>

                <div class="tavern-return-rewards">
                    ${rewardsHtml}
                </div>
            </div>
        </div>
    `;
}

function getTavernLastResultHtml() {
    const result =
        player.tavern.lastResult;

    if (!result) {
        return "";
    }

    const adventurer =
        getTavernAdventurer(
            result.adventurerId
        );

    const area =
        getTavernArea(
            result.activityType,
            result.areaId
        );

    const rewardsHtml =
        Array.isArray(result.rewards)
            ? result.rewards
                .map(reward => {
                    const item =
                        items[reward.itemId];

                    return `
                        <div class="tavern-result-item">
                            <span>
                                ${item?.name || reward.itemId}
                            </span>

                            <strong>
                                x${reward.quantity}
                            </strong>
                        </div>
                    `;
                })
                .join("")
            : "";

    return `
        <div class="game-card tavern-result-card">
            <div class="card-header">
                📦 Ostatni powrót
            </div>

            <p>
                ${adventurer?.icon || "👣"}
                ${adventurer?.name || "Śmiałek"}
                wrócił z obszaru:
                <strong>
                    ${area?.name || result.areaId}
                </strong>
            </p>

            <div class="tavern-result-summary">
                <span>
                    Cykle:
                    <strong>
                        ${result.completedCycles}
                    </strong>
                </span>

                <span>
                    EXP:
                    <strong>
                        +${result.totalExp}
                    </strong>
                </span>
            </div>

            <div class="tavern-result-items">
                ${rewardsHtml || "<p>Brak łupów.</p>"}
            </div>
        </div>
    `;
}

function getTavernAdventurersHtml() {
    if (
        typeof tavernAdventurers === "undefined" ||
        !Array.isArray(tavernAdventurers)
    ) {
        return `
            <div class="game-card">
                <div class="card-header">
                    Śmiałkowie
                </div>

                <p>
                    Brak danych śmiałków.
                </p>
            </div>
        `;
    }

    const cards =
        tavernAdventurers
            .map(adventurer => {
                return getTavernAdventurerCardHtml(
                    adventurer
                );
            })
            .join("");

    return `
        <div class="tavern-adventurers-grid">
            ${cards}
        </div>
    `;
}

function getTavernAdventurerCardHtml(
    adventurer
) {
    const unlockedAreas =
        getUnlockedTavernAreas(
            adventurer.activityType
        );

    const canHire =
        !player.tavern.activeJob &&
        player.gold >= adventurer.hireCost &&
        unlockedAreas.length > 0;

    const areaOptions =
        unlockedAreas
            .map(area => {
                return `
                    <option value="${area.id}">
                        ${area.name}
                    </option>
                `;
            })
            .join("");

    const selectId =
        "tavern-area-" +
        adventurer.id;

    const buttonText =
        player.tavern.activeJob
            ? "Śmiałek już pracuje"
            : player.gold < adventurer.hireCost
                ? "Brakuje złota"
                : unlockedAreas.length === 0
                    ? "Brak odblokowanych obszarów"
                    : "Wynajmij";

    return `
        <div class="game-card tavern-adventurer-card">
            <div class="card-header">
                ${adventurer.icon} ${adventurer.name}
            </div>

            <p>
                ${adventurer.description}
            </p>

            <div class="tavern-adventurer-info">
                <span>
                    Aktywność:
                    <strong>
                        ${getTavernActivityLabel(adventurer.activityType)}
                    </strong>
                </span>

                <span>
                    Czas:
                    <strong>
                        ${adventurer.durationMinutes} min
                    </strong>
                </span>

                <span>
                    Skuteczność:
                    <strong>
                        ${adventurer.efficiencyPercent}%
                    </strong>
                </span>

                <span>
                    Koszt:
                    <strong>
                        ${adventurer.hireCost} 💰
                    </strong>
                </span>
            </div>

            <label class="tavern-area-select-label">
                Obszar

                <select
                    id="${selectId}"
                    ${unlockedAreas.length === 0 ? "disabled" : ""}
                >
                    ${areaOptions}
                </select>
            </label>

            <button
                type="button"
                class="tavern-hire-button"
                onclick="hireTavernAdventurerFromUI('${adventurer.id}')"
                ${!canHire ? "disabled" : ""}
            >
                ${buttonText}
            </button>
        </div>
    `;
}

function hireTavernAdventurerFromUI(
    adventurerId
) {
    const areaSelect =
        document.getElementById(
            "tavern-area-" + adventurerId
        );

    const durationSelect =
        document.getElementById(
            "tavern-duration-" + adventurerId
        );

    if (!areaSelect) {
        return;
    }

    const durationMultiplier =
        durationSelect
            ? durationSelect.value
            : 1;

    hireTavernAdventurer(
        adventurerId,
        areaSelect.value,
        durationMultiplier
    );
}

function formatTavernDuration(
    totalSeconds
) {
    const safeSeconds =
        Math.max(
            0,
            Math.ceil(
                Number(totalSeconds) || 0
            )
        );

    const hours =
        Math.floor(
            safeSeconds / 3600
        );

    const minutes =
        Math.floor(
            (
                safeSeconds % 3600
            ) / 60
        );

    const seconds =
        safeSeconds % 60;

    if (hours > 0) {
        return (
            hours +
            " godz. " +
            minutes +
            " min " +
            seconds +
            " s"
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

function isTavernScreenVisible() {
    const tavernScreen =
        document.getElementById(
            "screen-tavern"
        );

    if (!tavernScreen) {
        return false;
    }

    return window.getComputedStyle(
        tavernScreen
    ).display !== "none";
}

function updateAdventurersTavernTimer() {
    const timeElement =
        document.getElementById(
            "tavern-active-time-value"
        );

    if (!timeElement) {
        return;
    }

    timeElement.textContent =
        formatTavernDuration(
            getTavernTimeRemainingSeconds()
        );
}

setInterval(() => {
    if (!isTavernScreenVisible()) {
        return;
    }

    try {
        const hadActiveJob =
            Boolean(
                player.tavern &&
                player.tavern.activeJob
            );

        if (
            hadActiveJob &&
            typeof checkTavernJobCompletion === "function"
        ) {
            const completed =
                checkTavernJobCompletion({
                    render: false
                });

            if (completed) {
                if (
                    typeof renderAdventurersTavern ===
                    "function"
                ) {
                    renderAdventurersTavern();
                }

                return;
            }
        }

        updateAdventurersTavernTimer();
    } catch (error) {
        console.error(
            "Błąd odświeżania Karczmy:",
            error
        );
    }
}, 1000);