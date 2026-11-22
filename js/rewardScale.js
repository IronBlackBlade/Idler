/*
 * Globalne skalowanie nagród (tempo progresu).
 *
 * Zmniejsza EXP i złoto z aktywności (walka, bossowie, lochy, zadania,
 * skrzynie, zamówienia) oraz EXP zawodów. Ceny, koszty i wartości
 * przedmiotów NIE są skalowane. Żeby zmienić tempo gry, wystarczy zmienić
 * liczby poniżej (1 = bez zmian, 0.6 = o 40% mniej).
 */
const REWARD_SCALE = Object.freeze({
    combat: 0.6,        // złoto i EXP z walki (potwory, bossowie, skarby, skrzynie)
    gold: 0.6,          // złoto z zadań, zamówień, lochów i nagród za pierwszego bossa
    exp: 0.6,           // EXP postaci z zadań, lochów i nagród za pierwszego bossa
    professionExp: 0.6  // EXP zawodów (kopalnia, zielarstwo, rybołówstwo itd.)
});

function scaleRewardValue(value, factor) {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        return 0;
    }

    return Math.max(1, Math.round(number * factor));
}

function scaleGoldReward(value) {
    return scaleRewardValue(value, REWARD_SCALE.gold);
}

function scaleExpReward(value) {
    return scaleRewardValue(value, REWARD_SCALE.exp);
}

/*
 * EXP zawodów bywa małą liczbą (1-5), więc zaokrąglamy losowo, a nie zawsze
 * w górę/dół: średnio wychodzi dokładnie założony mnożnik.
 */
function scaleProfessionExp(value) {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        return 0;
    }

    const scaled = number * REWARD_SCALE.professionExp;
    const whole = Math.floor(scaled);

    return whole + (Math.random() < scaled - whole ? 1 : 0);
}

/*
 * Podgląd EXP zawodu pokazywany w interfejsie (wartość oczekiwana po skalowaniu,
 * bez losowania). Nie zmienia faktycznie przyznawanego EXP.
 */
function previewProfessionExp(value) {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        return 0;
    }

    return Math.round(number * REWARD_SCALE.professionExp * 10) / 10;
}

window.previewProfessionExp = previewProfessionExp;
window.REWARD_SCALE = REWARD_SCALE;
window.scaleGoldReward = scaleGoldReward;
window.scaleExpReward = scaleExpReward;
window.scaleProfessionExp = scaleProfessionExp;
