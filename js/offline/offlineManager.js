const MINIMUM_OFFLINE_SUMMARY_DURATION_MS =
    60 * 1000;

function shouldDisplayOfflineSummary(
    summary,
    offlineSeconds = 0
) {
    if (
        !summary ||
        !Array.isArray(summary.sections) ||
        summary.sections.length === 0
    ) {
        return false;
    }

    const summaryDuration = Math.max(
        0,
        Number(
            summary.durationMilliseconds
        ) || 0
    );

    const fallbackDuration = Math.max(
        0,
        Number(offlineSeconds) || 0
    ) * 1000;

    return Math.max(
        summaryDuration,
        fallbackDuration
    ) >= MINIMUM_OFFLINE_SUMMARY_DURATION_MS;
}

// Łączny EXP bohatera od poziomu 1 (suma progów poziomów + bieżący EXP).
function getOfflineTotalExperience() {
    const level = Math.max(1, Math.floor(Number(player.level) || 1));
    let total = Math.max(0, Number(player.exp) || 0);

    if (typeof getExpToNextLevel === "function") {
        for (let current = 1; current < level; current++) {
            total += Number(getExpToNextLevel(current)) || 0;
        }
    }

    return total;
}

// Poziom odpowiadający łącznemu EXP (także gdy awans nie został jeszcze przeliczony).
function getOfflineLevelFromTotalExperience(totalExperience) {
    if (typeof getExpToNextLevel !== "function") {
        return Math.max(1, Math.floor(Number(player.level) || 1));
    }

    let level = 1;
    let remaining = Math.max(0, totalExperience);

    while (level < 5000) {
        const needed = Number(getExpToNextLevel(level)) || 0;

        if (needed <= 0 || remaining < needed) {
            break;
        }

        remaining -= needed;
        level++;
    }

    return level;
}

function buildOfflineOverviewSection(before, durationMilliseconds) {
    const goldDelta = Math.round((Number(player.gold) || 0) - before.gold);
    const expDelta = Math.max(
        0,
        Math.round(getOfflineTotalExperience() - before.totalExperience)
    );
    const levelAfter = getOfflineLevelFromTotalExperience(
        getOfflineTotalExperience()
    );
    const hours = durationMilliseconds / 3600000;
    const stats = [
        {
            label: "Czas offline",
            value: formatOfflineSummaryDuration(durationMilliseconds)
        },
        {
            label: "Złoto (bilans)",
            value: goldDelta,
            prefix: goldDelta > 0 ? "+" : ""
        },
        {
            label: "EXP łącznie",
            value: expDelta,
            prefix: expDelta > 0 ? "+" : ""
        }
    ];

    if (hours >= 1 / 60) {
        stats.push(
            {
                label: "Złoto na godzinę",
                value: Math.round(goldDelta / hours),
                prefix: goldDelta > 0 ? "+" : ""
            },
            {
                label: "EXP na godzinę",
                value: Math.round(expDelta / hours),
                prefix: expDelta > 0 ? "+" : ""
            }
        );
    }

    if (levelAfter > before.level) {
        stats.push({
            label: "Poziom bohatera",
            value: before.level + " → " + levelAfter
        });
    }

    return {
        icon: "📊",
        title: "Podsumowanie offline",
        stats
    };
}

function simulateOfflineProgress(
    offlineSeconds,
    activityType =
        getCurrentActivityTypeForSave(),
    offlineStartedAt =
        Date.now() -
        offlineSeconds * 1000
) {
    const offlineFinishedAt =
        Date.now();

    const overviewBefore = {
        gold: Number(player.gold) || 0,
        level: Math.max(1, Math.floor(Number(player.level) || 1)),
        totalExperience: getOfflineTotalExperience()
    };

    let activitySummary = null;

    if (
        activityType === "mining" &&
        typeof processOfflineMiningProgress ===
        "function"
    ) {
        activitySummary = processOfflineMiningProgress(
            offlineStartedAt,
            offlineFinishedAt
        );
    }

    if (
        activityType === "herbalism" &&
        typeof processOfflineHerbalismProgress ===
        "function"
    ) {
        activitySummary = processOfflineHerbalismProgress(
            offlineStartedAt,
            offlineFinishedAt
        );
    }

    if (
        activityType === "fishing" &&
        typeof processOfflineFishingProgress ===
        "function"
    ) {
        activitySummary = processOfflineFishingProgress(
            offlineStartedAt,
            offlineFinishedAt
        );
    }


    if (
        activityType === "combat" &&
        typeof processOfflineCombatProgress ===
        "function"
    ) {
        activitySummary = processOfflineCombatProgress(
            offlineStartedAt,
            offlineFinishedAt
        );
    }

    const alchemySummary =
        typeof processOfflineAlchemyProgress ===
            "function"
            ? processOfflineAlchemyProgress(
                offlineStartedAt,
                offlineFinishedAt
            )
            : null;
    const craftingSummary =
        typeof processOfflineCraftingProgress ===
            "function"
            ? processOfflineCraftingProgress(
                offlineStartedAt,
                offlineFinishedAt
            )
            : null;

    const gardenSummary =
        typeof processOfflineGardenProgress ===
            "function"
            ? processOfflineGardenProgress(
                offlineStartedAt,
                offlineFinishedAt
            )
            : null;

    const tavernSummary =
        typeof processOfflineTavernProgress ===
            "function"
            ? processOfflineTavernProgress(
                offlineStartedAt,
                offlineFinishedAt
            )
            : null;

    const summaries = [
        activitySummary,
        alchemySummary,
        craftingSummary,
        gardenSummary,
        tavernSummary
        
    ].filter(summary => {
        return (
            summary &&
            Array.isArray(summary.sections) &&
            summary.sections.length > 0
        );
    });

    if (summaries.length === 0) {
        return null;
    }

    // Liczymy tyle czasu, ile faktycznie zaliczono (limit offline), a nie czas na zegarze.
    const overviewDuration =
        Math.max(
            0,
            ...summaries.map(summary => {
                return Number(summary.durationMilliseconds) || 0;
            })
        ) || Math.max(0, offlineFinishedAt - offlineStartedAt);

    const overviewSection = buildOfflineOverviewSection(
        overviewBefore,
        overviewDuration
    );

    return {
        durationMilliseconds:
            Math.max(
                0,
                ...summaries.map(
                    summary => {
                        return Number(
                            summary.durationMilliseconds
                        ) || 0;
                    }
                )
            ),
        sections: [overviewSection].concat(
            summaries.flatMap(
                summary => {
                    return summary.sections;
                }
            )
        )
    };
}