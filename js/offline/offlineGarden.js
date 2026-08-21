function processOfflineGardenProgress(
    offlineStartedAt,
    offlineFinishedAt
) {
    if (
        typeof ensureGardenState !== "function" ||
        typeof player === "undefined"
    ) {
        return null;
    }

    ensureGardenState();

    const unlockedPlotCount =
        getGardenUnlockedPlotCount();

    const readyItems = [];
    let readyPlotCount = 0;

    player.garden.plots
        .slice(0, unlockedPlotCount)
        .forEach(plot => {
            if (
                !plot.seedItemId ||
                plot.offlineNotified === true
            ) {
                return;
            }

            const finishesAt =
                Math.max(
                    0,
                    Number(plot.finishesAt) || 0
                );

            if (
                finishesAt <= 0 ||
                finishesAt > offlineFinishedAt
            ) {
                return;
            }

            const sourceItemId =
                plot.sourceItemId ||
                items[plot.seedItemId]
                    ?.sourceItemId;

            readyPlotCount++;
            plot.offlineNotified = true;

            if (!sourceItemId) {
                return;
            }

            const existingItem =
                readyItems.find(item => {
                    return (
                        item.itemId ===
                        sourceItemId
                    );
                });

            if (existingItem) {
                existingItem.quantity++;
            } else {
                readyItems.push({
                    itemId: sourceItemId,
                    quantity: 1
                });
            }
        });

    if (readyPlotCount <= 0) {
        return null;
    }

    if (typeof saveGame === "function") {
        saveGame();
    }

    return {
        durationMilliseconds:
            Math.max(
                0,
                offlineFinishedAt -
                offlineStartedAt
            ),

        sections: [
            {
                icon: "🌱",
                title: "Ogród",
                stats: [
                    {
                        label: "Gotowe grządki",
                        value: readyPlotCount
                    },
                    {
                        label: "Status",
                        value: "Rośliny czekają na zebranie"
                    }
                ]
            }
        ]
    };
}