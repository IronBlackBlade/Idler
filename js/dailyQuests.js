/*
 * Codzienne i tygodniowe zlecenia.
 *
 * Postęp liczony jest jako różnica między aktualnym licznikiem
 * aktywności a jego stanem z chwili wylosowania zlecenia, dlatego
 * działa także podczas gry offline i nie wymaga dodatkowych hooków.
 * Losowanie jest deterministyczne (zależy od daty), więc odświeżenie
 * strony nie pozwala wylosować innych zleceń.
 */
const DAILY_QUEST_TEMPLATES = Object.freeze({
    kills: {
        icon: "⚔️",
        title: "Łowca",
        unit: "pokonanych wrogów",
        base: 40,
        perLevel: 3,
        activity: null,
        getCounter: () =>
            typeof getJournalTotalLocationCounter === "function"
                ? getJournalTotalLocationCounter("totalKills")
                : 0
    },
    mining: {
        icon: "⛏️",
        title: "Górnik",
        unit: "cykli wydobycia",
        base: 20,
        perLevel: 0.3,
        activity: "mining",
        getCounter: () => player.mining?.statistics?.totalCycles || 0
    },
    herbalism: {
        icon: "🌿",
        title: "Zielarz",
        unit: "cykli zbierania ziół",
        base: 20,
        perLevel: 0.3,
        activity: "herbalism",
        getCounter: () => player.herbalism?.statistics?.totalCycles || 0
    },
    fishing: {
        icon: "🎣",
        title: "Rybak",
        unit: "cykli połowu",
        base: 20,
        perLevel: 0.3,
        activity: "fishing",
        getCounter: () => player.fishing?.statistics?.totalCycles || 0
    },
    crafting: {
        icon: "🔨",
        title: "Rzemieślnik",
        unit: "wytworzonych przedmiotów",
        base: 4,
        perLevel: 0.05,
        activity: "crafting",
        getCounter: () => player.crafting?.statistics?.totalCrafted || 0
    },
    alchemy: {
        icon: "⚗️",
        title: "Alchemik",
        unit: "uwarzonych mikstur",
        base: 6,
        perLevel: 0.1,
        activity: "alchemy",
        getCounter: () => player.alchemy?.statistics?.totalCrafted || 0
    },
    cooking: {
        icon: "🍲",
        title: "Kucharz",
        unit: "przygotowanych posiłków",
        base: 8,
        perLevel: 0.1,
        activity: "cooking",
        getCounter: () => player.cooking?.statistics?.totalMealsCooked || 0
    },
    garden: {
        icon: "🌱",
        title: "Ogrodnik",
        unit: "zbiorów w ogrodzie",
        base: 8,
        perLevel: 0.1,
        activity: "garden",
        getCounter: () => player.garden?.statistics?.totalHarvests || 0
    }
});

const DAILY_QUEST_COUNT = 3;
const WEEKLY_QUEST_COUNT = 2;
const WEEKLY_TARGET_MULTIPLIER = 6;
// Dzienny limit przerzutów (resetuje się razem ze zleceniami dziennymi).
const DAILY_REROLL_LIMIT = Object.freeze({ daily: 3, weekly: 1 });
const DAILY_STREAK_BONUS_PER_DAY = 0.05;
const DAILY_STREAK_BONUS_MAX = 0.5;

function pad2(n) {
    return String(n).padStart(2, "0");
}

function getDailyQuestDayKey(date = new Date()) {
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" +
        pad2(date.getDate());
}

function getDailyQuestWeekKey(date = new Date()) {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const offset = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - offset);
    return getDailyQuestDayKey(monday);
}

function getDailyQuestPreviousDayKey(dayKey) {
    const [y, m, d] = dayKey.split("-").map(Number);
    return getDailyQuestDayKey(new Date(y, m - 1, d - 1));
}

function createDailyQuestRandom(seedText) {
    let h = 2166136261;
    for (let i = 0; i < seedText.length; i++) {
        h ^= seedText.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return function () {
        h += 0x6d2b79f5;
        let t = h;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function isDailyQuestTypeAvailable(type) {
    const template = DAILY_QUEST_TEMPLATES[type];
    if (!template) {
        return false;
    }
    if (!template.activity) {
        return true;
    }
    // Aktywność uznajemy za odblokowaną, gdy gracz już jej używał.
    return template.getCounter() > 0;
}

function getDailyQuestTarget(type, scope) {
    const template = DAILY_QUEST_TEMPLATES[type];
    const level = Math.max(1, player.level || 1);
    const daily = Math.max(
        1,
        Math.round(template.base + template.perLevel * level)
    );
    return scope === "weekly" ? daily * WEEKLY_TARGET_MULTIPLIER : daily;
}

function getDailyQuestGoldReward(scope) {
    const level = Math.max(1, player.level || 1);
    const gold = Math.round(40 * level * level + 200);
    return scope === "weekly" ? gold * 5 : gold;
}

function getDailyQuestHeroExp(scope) {
    const needed = Math.max(1, player.expToNextLevel || 100);
    return Math.max(1, Math.floor(needed * (scope === "weekly" ? 0.25 : 0.06)));
}

function pickDailyQuestTypes(seedText, count) {
    const random = createDailyQuestRandom(seedText);
    const pool = Object.keys(DAILY_QUEST_TEMPLATES).filter(
        (type) =>
            isDailyQuestTypeAvailable(type) ||
            // Wszystko poza ogrodem jest dostępne od początku gry.
            type !== "garden"
    );
    const picked = [];
    // Zawsze jedno zlecenie bojowe, reszta losowa.
    if (pool.includes("kills")) {
        picked.push("kills");
        pool.splice(pool.indexOf("kills"), 1);
    }
    while (picked.length < count && pool.length > 0) {
        const index = Math.floor(random() * pool.length);
        picked.push(pool.splice(index, 1)[0]);
    }
    return picked;
}

function buildDailyQuests(seedText, count, scope) {
    return pickDailyQuestTypes(seedText, count).map((type) => ({
        type,
        target: getDailyQuestTarget(type, scope),
        baseline: DAILY_QUEST_TEMPLATES[type].getCounter(),
        claimed: false
    }));
}

function ensureDailyQuestState() {
    if (!player.dailyQuests || typeof player.dailyQuests !== "object") {
        player.dailyQuests = {
            dayKey: null,
            weekKey: null,
            daily: [],
            weekly: [],
            bonusClaimed: false,
            streak: 0,
            lastCompletedDay: null
        };
    }

    const state = player.dailyQuests;
    if (state.version !== 2) {
        // Jednorazowe przelosowanie po rozszerzeniu puli aktywności.
        state.version = 2;
        if (![...(state.daily || []), ...(state.weekly || [])].some((e) => e.claimed)) {
            state.dayKey = null;
            state.weekKey = null;
        }
    }
    const today = getDailyQuestDayKey();
    const week = getDailyQuestWeekKey();
    let changed = false;

    if (state.dayKey !== today || !Array.isArray(state.daily)) {
        // Seria przerywa się, jeśli wczoraj nie ukończono kompletu.
        if (
            state.lastCompletedDay !== getDailyQuestPreviousDayKey(today) &&
            state.lastCompletedDay !== today
        ) {
            state.streak = 0;
        }
        state.dayKey = today;
        state.daily = buildDailyQuests("daily-" + today, DAILY_QUEST_COUNT, "daily");
        state.bonusClaimed = false;
        changed = true;
    }

    if (state.weekKey !== week || !Array.isArray(state.weekly)) {
        state.weekKey = week;
        state.weekly = buildDailyQuests("weekly-" + week, WEEKLY_QUEST_COUNT, "weekly");
        changed = true;
    }

    if (!state.rerolls || state.rerolls.dayKey !== today) {
        state.rerolls = { dayKey: today, daily: 0, weekly: 0 };
        changed = true;
    }

    // Uzupełnienie, gdyby zestaw zapisany wcześniej był krótszy.
    [["daily", DAILY_QUEST_COUNT], ["weekly", WEEKLY_QUEST_COUNT]].forEach(
        ([scope, count]) => {
            const list = state[scope];
            if (list.length >= count) {
                return;
            }
            const seed = scope + "-fill-" + (scope === "daily" ? today : week);
            const used = list.map((e) => e.type);
            pickDailyQuestTypes(seed, count + used.length, scope)
                .filter((type) => !used.includes(type))
                .slice(0, count - list.length)
                .forEach((type) => {
                    list.push({
                        type,
                        target: getDailyQuestTarget(type, scope),
                        baseline: DAILY_QUEST_TEMPLATES[type].getCounter(),
                        claimed: false
                    });
                });
            changed = true;
        }
    );

    return changed;
}

function getDailyQuestProgress(entry) {
    const template = DAILY_QUEST_TEMPLATES[entry.type];
    const current = template.getCounter() - entry.baseline;
    return Math.max(0, Math.min(entry.target, Math.floor(current)));
}

function isDailyQuestComplete(entry) {
    return getDailyQuestProgress(entry) >= entry.target;
}

function getDailyStreakMultiplier() {
    const streak = player.dailyQuests?.streak || 0;
    return 1 + Math.min(DAILY_STREAK_BONUS_MAX, streak * DAILY_STREAK_BONUS_PER_DAY);
}

function grantDailyQuestReward(gold, heroExp, label) {
    const goldResult =
        typeof grantGoldReward === "function"
            ? grantGoldReward(gold)
            : (player.gold += gold, { totalGold: gold });
    player.exp += heroExp;
    if (typeof checkLevelUp === "function") {
        checkLevelUp();
    }
    if (typeof addCombatLog === "function") {
        addCombatLog(
            "📅 " + label + ": +" + heroExp + " EXP, +" +
            (goldResult?.totalGold ?? gold) + " złota."
        );
    }
}

function claimDailyQuest(scope, index) {
    ensureDailyQuestState();
    const list = scope === "weekly" ? player.dailyQuests.weekly : player.dailyQuests.daily;
    const entry = list[index];
    if (!entry || entry.claimed || !isDailyQuestComplete(entry)) {
        return;
    }
    entry.claimed = true;
    if (typeof recordWorldStat === "function") {
        recordWorldStat(scope === "weekly" ? "weeklyClaimed" : "dailyClaimed");
    }
    const multiplier = scope === "daily" ? getDailyStreakMultiplier() : 1;
    grantDailyQuestReward(
        Math.floor(getDailyQuestGoldReward(scope) * multiplier),
        Math.floor(getDailyQuestHeroExp(scope) * multiplier),
        (scope === "weekly" ? "Zlecenie tygodniowe: " : "Zlecenie dzienne: ") +
        DAILY_QUEST_TEMPLATES[entry.type].title
    );
    finishDailyQuestAction();
}

function getDailyRerollsLeft(scope) {
    ensureDailyQuestState();
    return Math.max(0, DAILY_REROLL_LIMIT[scope] - (player.dailyQuests.rerolls[scope] || 0));
}

function rerollDailyQuest(scope, index) {
    ensureDailyQuestState();
    const state = player.dailyQuests;
    const list = scope === "weekly" ? state.weekly : state.daily;
    const entry = list[index];
    if (!entry || entry.claimed || isDailyQuestComplete(entry)) {
        return;
    }
    if (getDailyRerollsLeft(scope) <= 0) {
        return;
    }
    const usedTypes = list.map((e) => e.type);
    const candidates = Object.keys(DAILY_QUEST_TEMPLATES).filter(
        (type) =>
            !usedTypes.includes(type) &&
            (isDailyQuestTypeAvailable(type) || type !== "garden")
    );
    if (candidates.length === 0) {
        return;
    }
    const random = createDailyQuestRandom(
        "reroll-" + scope + "-" + state.dayKey + "-" + index + "-" + state.rerolls[scope]
    );
    const type = candidates[Math.floor(random() * candidates.length)];
    list[index] = {
        type,
        target: getDailyQuestTarget(type, scope),
        baseline: DAILY_QUEST_TEMPLATES[type].getCounter(),
        claimed: false
    };
    state.rerolls[scope] = (state.rerolls[scope] || 0) + 1;
    if (typeof showNotification === "function") {
        showNotification("Przerzucono zlecenie: " + DAILY_QUEST_TEMPLATES[type].title + ".", "success");
    }
    finishDailyQuestAction();
}

function claimDailyBonus() {
    ensureDailyQuestState();
    const state = player.dailyQuests;
    if (state.bonusClaimed || !state.daily.every((e) => e.claimed)) {
        return;
    }
    state.bonusClaimed = true;
    if (state.lastCompletedDay !== state.dayKey) {
        state.streak = (state.streak || 0) + 1;
        state.lastCompletedDay = state.dayKey;
    }
    if (typeof recordWorldStatMax === "function") {
        recordWorldStatMax("bestStreak", state.streak);
    }
    const multiplier = getDailyStreakMultiplier();
    grantDailyQuestReward(
        Math.floor(getDailyQuestGoldReward("daily") * 2 * multiplier),
        Math.floor(getDailyQuestHeroExp("daily") * 2 * multiplier),
        "Skrzynia dziennych zleceń"
    );
    finishDailyQuestAction();
}

function finishDailyQuestAction() {
    if (typeof updateUI === "function") {
        updateUI();
    }
    if (typeof saveGame === "function") {
        saveGame();
    }
    renderDailyQuests();
}

function getDailyQuestClaimableCount() {
    ensureDailyQuestState();
    const state = player.dailyQuests;
    let count = [...state.daily, ...state.weekly].filter(
        (e) => !e.claimed && isDailyQuestComplete(e)
    ).length;
    if (!state.bonusClaimed && state.daily.every((e) => e.claimed)) {
        count++;
    }
    return count;
}

function formatDailyTimeLeft(ms) {
    const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days > 0) {
        return days + " d " + hours + " h";
    }
    return hours + " h " + minutes + " min";
}

function renderDailyQuestCard(scope, entry, index) {
    const template = DAILY_QUEST_TEMPLATES[entry.type];
    const progress = getDailyQuestProgress(entry);
    const complete = progress >= entry.target;
    const multiplier = scope === "daily" ? getDailyStreakMultiplier() : 1;
    const gold = Math.floor(getDailyQuestGoldReward(scope) * multiplier);
    const exp = Math.floor(getDailyQuestHeroExp(scope) * multiplier);
    const percent = Math.floor((progress / entry.target) * 100);
    const canReroll = !entry.claimed && !complete && getDailyRerollsLeft(scope) > 0;
    const rerollButton = entry.claimed || complete
        ? ""
        : '<button class="daily-reroll-button" ' + (canReroll ? "" : "disabled ") +
        'onclick="rerollDailyQuest(\'' + scope + "'," + index + ')">🔄 Przerzuć (' +
        getDailyRerollsLeft(scope) + "/" + DAILY_REROLL_LIMIT[scope] + ")</button>";
    const button = entry.claimed
        ? '<button disabled>✔ Odebrano</button>'
        : '<button ' + (complete ? "" : "disabled ") +
        'onclick="claimDailyQuest(\'' + scope + "'," + index + ')">' +
        (complete ? "🎁 Odbierz" : "W toku") + "</button>";
    return (
        '<div class="daily-quest-card' + (entry.claimed ? " claimed" : complete ? " complete" : "") + '">' +
        '<div class="daily-quest-title">' + template.icon + " " + template.title +
        "</div>" +
        '<div class="daily-quest-desc">' + entry.target + " " + template.unit + "</div>" +
        '<div class="daily-quest-bar"><div style="width:' + percent + '%"></div></div>' +
        '<div class="daily-quest-meta"><span>' + progress + " / " + entry.target +
        "</span><span>+" + exp + " EXP, +" + gold + " 💰</span></div>" +
        button + rerollButton + "</div>"
    );
}

function renderDailyQuests() {
    const container = document.getElementById("daily-quests");
    if (!container) {
        return;
    }
    ensureDailyQuestState();
    const state = player.dailyQuests;
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const nextMonday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + (8 - (now.getDay() || 7))
    );
    const allClaimed = state.daily.every((e) => e.claimed);
    const streak = state.streak || 0;
    const bonusPercent = Math.round((getDailyStreakMultiplier() - 1) * 100);

    container.innerHTML =
        '<section class="daily-quests-section">' +
        "<h3>📅 Zlecenia dzienne <small>reset za " +
        formatDailyTimeLeft(tomorrow - now) + "</small></h3>" +
        '<p class="daily-quests-streak">🔥 Seria: ' + streak + " dni" +
        (bonusPercent > 0 ? " (+" + bonusPercent + "% do nagród dziennych)" : "") +
        "</p>" +
        '<div class="daily-quest-grid">' +
        state.daily.map((e, i) => renderDailyQuestCard("daily", e, i)).join("") +
        "</div>" +
        '<button class="daily-bonus-button" ' +
        (allClaimed && !state.bonusClaimed ? "" : "disabled ") +
        'onclick="claimDailyBonus()">' +
        (state.bonusClaimed
            ? "✔ Skrzynia odebrana"
            : "🎁 Skrzynia za komplet (odbierz wszystkie dzienne)") +
        "</button>" +
        "<h3>🗓️ Zlecenia tygodniowe <small>reset za " +
        formatDailyTimeLeft(nextMonday - now) + "</small></h3>" +
        '<div class="daily-quest-grid">' +
        state.weekly.map((e, i) => renderDailyQuestCard("weekly", e, i)).join("") +
        "</div></section>";
}

function updateDailyQuestMenuBadge() {
    const button = document.getElementById("menu-quests-button");
    if (!button) {
        return;
    }
    if (getDailyQuestClaimableCount() > 0) {
        button.classList.add("has-daily-reward");
    } else {
        button.classList.remove("has-daily-reward");
    }
}

setInterval(function () {
    if (typeof player === "undefined" || !player) {
        return;
    }
    const changed = ensureDailyQuestState();
    updateDailyQuestMenuBadge();
    const screen = document.getElementById("screen-quests");
    if (screen && screen.style.display !== "none" && screen.offsetParent !== null) {
        renderDailyQuests();
    } else if (changed && typeof saveGame === "function") {
        saveGame();
    }
}, 5000);
