function getDungeonCardState(dungeonId) {
    const dungeon = getDungeonDefinition(dungeonId);
    const keyProgress =
        player.dungeonKeyProgress?.[dungeonId] ||
        {
            firstKeyGranted: false,
            bossKillsSinceKey: 0
        };

    const keyQuantity =
        typeof getInventoryItemQuantity === "function"
            ? getInventoryItemQuantity(dungeon.keyItemId)
            : 0;

    const progress = ensureDungeonProgress(dungeonId);

    return {
        dungeon,
        progress,
        keyQuantity,
        unlocked:
            keyProgress.firstKeyGranted === true ||
            keyQuantity > 0 ||
            progress.completed === true
    };
}

function renderDungeonCard(dungeonId, index) {
    const state = getDungeonCardState(dungeonId);
    const { dungeon, progress, keyQuantity, unlocked } = state;
    const canStart = unlocked && keyQuantity > 0;
    const roomNumber = progress.roomIndex + 1;
    const trophyItem = dungeon.completionRewards?.items?.[0];
    const trophyName = trophyItem && items[trophyItem.item]
        ? items[trophyItem.item].name
        : "specjalne trofeum";

    let statusText = "Nieodkryty";
    let buttonText = "🔒 Pokonaj bossa lokacji";
    let buttonAction = "";
    let buttonDisabled = true;

    if (progress.active) {
        statusText = "W trakcie";
        buttonText = "⚔️ Wróć do wyprawy";
        buttonAction = "startDungeonRun('" + dungeonId + "')";
        buttonDisabled = false;
    } else if (canStart) {
        statusText = "Gotowy";
        buttonText = "🚪 Rozpocznij wyprawę";
        buttonAction = "startDungeonRun('" + dungeonId + "')";
        buttonDisabled = false;
    } else if (unlocked) {
        statusText = "Brak klucza";
        buttonText = "🗝️ Potrzebujesz klucza";
    }

    const ordinal = [
        "Pierwszy",
        "Drugi",
        "Trzeci",
        "Czwarty",
        "Piąty",
        "Szósty",
        "Siódmy",
        "Ósmy"
    ][index] || (index + 1) + ".";
    const bossName = dungeon.rooms[dungeon.rooms.length - 1].name;

    return `
        <article class="game-card journal-boss-card ${unlocked ? "discovered" : "locked"}">
            <div class="journal-boss-header">
                <span class="journal-boss-icon">${unlocked ? dungeon.icon : "🔒"}</span>

                <div>
                    <strong>${unlocked ? dungeon.name : "???"}</strong>
                    <span>${ordinal} loch</span>
                </div>

                <span class="journal-boss-status ${progress.active || canStart ? "defeated" : ""}">
                    ${statusText}
                </span>
            </div>

            <p>
                ${unlocked
                    ? "Przebij się przez kolejne komnaty i pokonaj finałowego bossa. Porażka lub opuszczenie lochu kończy wyprawę."
                    : "Pokonaj bossa odpowiadającej lokacji, aby zdobyć pierwszy klucz."}
            </p>

            <div class="journal-boss-stats">
                <div>
                    <span>Zalecany poziom</span>
                    <strong>${dungeon.recommendedLevel}</strong>
                </div>

                <div>
                    <span>Pomieszczenia</span>
                    <strong>${dungeon.rooms.length}</strong>
                </div>

                <div>
                    <span>Koszt wejścia</span>
                    <strong>1 klucz</strong>
                </div>

                <div>
                    <span>Klucze w plecaku</span>
                    <strong>${keyQuantity}</strong>
                </div>
            </div>

            <div class="journal-boss-first-reward ${progress.completed ? "claimed" : ""}">
                <span>${progress.active ? "🚪 Aktualny postęp" : "🏆 Ukończenia"}</span>
                <strong>
                    ${progress.active
                        ? "Pomieszczenie " + roomNumber + "/" + dungeon.rooms.length
                        : progress.completionCount}
                </strong>
            </div>

            <p>
                ${unlocked
                    ? "Finałowy boss: " + bossName + ". Nagroda: " + trophyName + "."
                    : "Finałowy boss: ???"}
            </p>

            <button type="button" onclick="${buttonAction}" ${buttonDisabled ? "disabled" : ""}>
                ${buttonText}
            </button>
        </article>
    `;
}

function renderDungeons() {
    const container = document.getElementById("dungeons-list");

    if (!container) {
        return;
    }

    container.innerHTML = Object.keys(dungeons)
        .map(renderDungeonCard)
        .join("");
}