// Ręcznie utrzymywany balans pancerza. Wartość oznacza sumę sześciu części:
// pancerz, hełm, spodnie, rękawice, buty i tarcza.
const fullSetArmorByLevel = [
    [1, 20],
    [10, 35],
    [20, 50],
    [35, 75],
    [50, 100],
    [75, 135],
    [100, 170],
];

// Docelowe obrażenia broni kupca według wymaganego poziomu.
const merchantWeaponDamageByLevel = [
    [1, 10],
    [10, 25],
    [20, 45],
    [35, 85],
    [50, 135],
    [75, 190],
    [100, 250],
];

// Podział zachowuje kolejność: pancerz > tarcza > spodnie = hełm > buty = rękawice.
const armorSlotsByLevel = [
    [1, { armor: 7, shield: 5, pants: 3, helmet: 3, boots: 1, gloves: 1 }],
    [10, { armor: 12, shield: 7, pants: 5, helmet: 5, boots: 3, gloves: 3 }],
    [20, { armor: 16, shield: 10, pants: 8, helmet: 8, boots: 4, gloves: 4 }],
    [35, { armor: 26, shield: 15, pants: 12, helmet: 12, boots: 5, gloves: 5 }],
    [50, { armor: 34, shield: 20, pants: 16, helmet: 16, boots: 7, gloves: 7 }],
    [75, { armor: 50, shield: 27, pants: 20, helmet: 20, boots: 9, gloves: 9 }],
    [100, { armor: 60, shield: 34, pants: 25, helmet: 25, boots: 13, gloves: 13 }],
];

function getFullSetArmorAtLevel(level) {
    const safeLevel = Math.max(1, Number(level) || 1);
    const first = fullSetArmorByLevel[0];
    const last = fullSetArmorByLevel.at(-1);

    if (safeLevel <= first[0]) return first[1];
    if (safeLevel >= last[0]) return last[1];

    for (let index = 1; index < fullSetArmorByLevel.length; index++) {
        const [nextLevel, nextArmor] = fullSetArmorByLevel[index];
        const [previousLevel, previousArmor] = fullSetArmorByLevel[index - 1];

        if (safeLevel <= nextLevel) {
            const progress = (safeLevel - previousLevel) / (nextLevel - previousLevel);
            return Math.round(previousArmor + (nextArmor - previousArmor) * progress);
        }
    }

    return last[1];
}

function getMerchantWeaponDamageAtLevel(level) {
    const safeLevel = Math.max(1, Number(level) || 1);
    const first = merchantWeaponDamageByLevel[0];
    const last = merchantWeaponDamageByLevel.at(-1);

    if (safeLevel <= first[0]) return first[1];
    if (safeLevel >= last[0]) return last[1];

    for (let index = 1; index < merchantWeaponDamageByLevel.length; index++) {
        const [nextLevel, nextDamage] = merchantWeaponDamageByLevel[index];
        const [previousLevel, previousDamage] = merchantWeaponDamageByLevel[index - 1];

        if (safeLevel <= nextLevel) {
            const progress = (safeLevel - previousLevel) / (nextLevel - previousLevel);
            return Math.round(previousDamage + (nextDamage - previousDamage) * progress);
        }
    }

    return last[1];
}

function getCraftedWeaponDamageAtLevel(level) {
    const safeLevel = Math.max(1, Number(level) || 1);
    const baseDamage = getMerchantWeaponDamageAtLevel(safeLevel);
    const nextTier = merchantWeaponDamageByLevel.find(([tierLevel]) => tierLevel > safeLevel);

    if (!nextTier) {
        return Math.round(baseDamage * 1.1);
    }

    const [, nextDamage] = nextTier;

    // Craft daje przewagę, ale nie dochodzi do wartości następnego progu.
    return Math.round(baseDamage + (nextDamage - baseDamage) * 0.55);
}

function getArmorDistribution(level) {
    const safeLevel = Math.max(1, Number(level) || 1);
    const first = armorSlotsByLevel[0];
    const last = armorSlotsByLevel.at(-1);

    if (safeLevel <= first[0]) return { ...first[1] };
    if (safeLevel >= last[0]) return { ...last[1] };

    for (let index = 1; index < armorSlotsByLevel.length; index++) {
        const [nextLevel, nextSlots] = armorSlotsByLevel[index];
        const [previousLevel, previousSlots] = armorSlotsByLevel[index - 1];

        if (safeLevel <= nextLevel) {
            const progress = (safeLevel - previousLevel) / (nextLevel - previousLevel);
            return Object.fromEntries(
                Object.keys(previousSlots).map(type => [
                    type,
                    Math.round(previousSlots[type] + (nextSlots[type] - previousSlots[type]) * progress),
                ])
            );
        }
    }

    return { ...last[1] };
}

function getCraftedArmorDistribution(level) {
    const safeLevel = Math.max(1, Number(level) || 1);
    const baseSlots = getArmorDistribution(safeLevel);
    const nextTier = armorSlotsByLevel.find(([tierLevel]) => tierLevel > safeLevel);

    if (!nextTier) {
        return Object.fromEntries(
            Object.entries(baseSlots).map(([type, armor]) => [
                type,
                Math.max(1, Math.round(armor * 1.1)),
            ])
        );
    }

    const [, nextSlots] = nextTier;

    return Object.fromEntries(
        Object.keys(baseSlots).map(type => [
            type,
            Math.round(baseSlots[type] + (nextSlots[type] - baseSlots[type]) * 0.55),
        ])
    );
}

function applyEquipmentArmorBalance() {
    if (typeof items === "undefined") return;

    Object.values(items).forEach(item => {
        if (!item || !Object.hasOwn(armorSlotsByLevel[0][1], item.type)) return;

        const distribution = getArmorDistribution(item.requiredLevel);
        item.armor = distribution[item.type];
    });
}

function applyMerchantWeaponBalance() {
    if (typeof items === "undefined" || !window.idlerMerchantPrices) return;

    Object.keys(merchantItems).forEach(itemId => {
        const item = items[itemId];

        if (!item || item.type !== "weapon") return;

        item.damage = getMerchantWeaponDamageAtLevel(item.requiredLevel);
    });
}

function applyCraftedWeaponBalance() {
    if (typeof items === "undefined" || typeof recipes === "undefined") return;

    recipes.forEach(recipe => {
        const item = items[recipe?.resultItemId];

        if (!item || item.type !== "weapon") return;

        item.damage = getCraftedWeaponDamageAtLevel(item.requiredLevel);
    });
}

function applyCraftedArmorBalance() {
    if (typeof items === "undefined" || typeof recipes === "undefined") return;

    recipes.forEach(recipe => {
        const item = items[recipe?.resultItemId];

        if (!item || !Object.hasOwn(armorSlotsByLevel[0][1], item.type)) return;

        item.armor = getCraftedArmorDistribution(item.requiredLevel)[item.type];
    });
}

applyEquipmentArmorBalance();
applyMerchantWeaponBalance();
applyCraftedWeaponBalance();
applyCraftedArmorBalance();
