/*
 * Skracanie dużych liczb (złoto itp.): 12 500 -> "12,5K", 1 250 000 -> "1,25M".
 * Liczby poniżej progu zostają pełne (z odstępami tysięcy), żeby małe kwoty
 * i ceny były dokładne.
 */
const COMPACT_NUMBER_THRESHOLD = 10000;

const COMPACT_NUMBER_UNITS = Object.freeze([
    { value: 1e12, suffix: "T" },
    { value: 1e9, suffix: "B" },
    { value: 1e6, suffix: "M" },
    { value: 1e3, suffix: "K" }
]);

function formatCompactNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return String(value ?? "");
    }

    const absolute = Math.abs(number);

    if (absolute < COMPACT_NUMBER_THRESHOLD) {
        return Math.trunc(number).toLocaleString("pl-PL");
    }

    const unit = COMPACT_NUMBER_UNITS.find((entry) => absolute >= entry.value);
    const scaled = absolute / unit.value;
    const digits = scaled < 10 ? 2 : scaled < 100 ? 1 : 0;

    // Obcinamy (nie zaokrąglamy w górę), żeby np. 999 999 nie pokazało "1000K".
    const factor = Math.pow(10, digits);
    let truncated = Math.floor(scaled * factor) / factor;
    let suffix = unit.suffix;

    if (truncated >= 1000) {
        const next = COMPACT_NUMBER_UNITS[COMPACT_NUMBER_UNITS.indexOf(unit) - 1];

        if (next) {
            truncated = Math.floor((absolute / next.value) * 100) / 100;
            suffix = next.suffix;
        }
    }

    return (
        (number < 0 ? "-" : "") +
        truncated.toLocaleString("pl-PL", { maximumFractionDigits: 2 }) +
        suffix
    );
}

function formatFullNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.trunc(number).toLocaleString("pl-PL") : String(value ?? "");
}

window.formatCompactNumber = formatCompactNumber;
window.formatFullNumber = formatFullNumber;
