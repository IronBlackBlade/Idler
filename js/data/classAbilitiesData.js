/*
 * Unikalne umiejętności klas i podklas (silnik: js/classAbilities.js).
 *
 * abilityKind:
 *  - "strike": jednorazowe uderzenie (mnożnik obrażeń broni) z dodatkami,
 *  - "buff":   wzmocnienie czasowe (obrażenia zadawane / otrzymywane).
 * Wartości "...PerLevel" rosną z poziomem umiejętności.
 */
skillTrees.push(
    {
        id: "warrior_arts",
        name: "🔥 Sztuki wojownika",
        description: "Unikalne umiejętności aktywne Wojownika.",
        requiredClass: "warrior"
    },
    {
        id: "warrior_berserker",
        name: "🩸 Berserker",
        description: "Furia, krwawienie i wysysanie życia.",
        requiredClass: "warrior",
        requiredSubclass: "warrior_berserker"
    },
    {
        id: "warrior_slayer",
        name: "🛡️ Pogromca",
        description: "Walka jednym celem i dobijanie potężnych wrogów.",
        requiredClass: "warrior",
        requiredSubclass: "warrior_slayer"
    },
    {
        id: "hunter_arts",
        name: "🏹 Sztuki łowcy",
        description: "Unikalne umiejętności aktywne Łowcy.",
        requiredClass: "hunter"
    },
    {
        id: "hunter_archer",
        name: "🎯 Łucznik",
        description: "Salwy strzał i celne strzały.",
        requiredClass: "hunter",
        requiredSubclass: "hunter_archer"
    },
    {
        id: "hunter_crossbowman",
        name: "⚙️ Kusznik",
        description: "Ciężkie bełty i dobijanie wrogów.",
        requiredClass: "hunter",
        requiredSubclass: "hunter_crossbowman"
    },
    {
        id: "mage_arts",
        name: "✨ Sztuki maga",
        description: "Unikalne umiejętności aktywne Maga.",
        requiredClass: "mage"
    },
    {
        id: "mage_warlock",
        name: "🌑 Czarnoksiężnik",
        description: "Klątwy, drenaż życia i mroczna moc.",
        requiredClass: "mage",
        requiredSubclass: "mage_warlock"
    },
    {
        id: "mage_druid",
        name: "🌿 Druid",
        description: "Leczenie, ochrona i moc natury.",
        requiredClass: "mage",
        requiredSubclass: "mage_druid"
    },
    {
        id: "guardian_arts",
        name: "🛡️ Sztuki strażnika",
        description: "Unikalne umiejętności aktywne Strażnika.",
        requiredClass: "guardian"
    },
    {
        id: "guardian_bastion",
        name: "🏰 Bastion",
        description: "Niezłomna obrona.",
        requiredClass: "guardian",
        requiredSubclass: "guardian_bastion"
    },
    {
        id: "guardian_light",
        name: "✨ Obrońca światła",
        description: "Święte leczenie i błogosławieństwa.",
        requiredClass: "guardian",
        requiredSubclass: "guardian_light"
    },
    {
        id: "rogue_arts",
        name: "🗡️ Sztuki łotrzyka",
        description: "Unikalne umiejętności aktywne Łotrzyka.",
        requiredClass: "rogue"
    },
    {
        id: "rogue_poisoner",
        name: "☠️ Truciciel",
        description: "Trucizny i obrażenia w czasie.",
        requiredClass: "rogue",
        requiredSubclass: "rogue_poisoner"
    },
    {
        id: "rogue_assassin",
        name: "🎯 Skrytobójca",
        description: "Dobijanie i precyzyjne ciosy.",
        requiredClass: "rogue",
        requiredSubclass: "rogue_assassin"
    }
);

Object.assign(skills, {
    // ===== Wojownik: sztuki klasowe =====
    war_rend: {
        id: "war_rend",
        name: "Rzeź",
        description:
            "Potężne cięcie bronią, które zadaje duże obrażenia i wywołuje krwawienie.",
        tree: "warrior_arts",
        branch: "arts",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "warrior",
        requiredLevel: 12,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [800, 2000, 5000, 12000, 28000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 12,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 8,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 2.0,
            damageMultiplierPerLevel: 0.3,
            bleedTickMultiplier: 0.25,
            bleedTicks: 4,
            bleedTickSeconds: 1
        }
    },

    war_battle_cry: {
        id: "war_battle_cry",
        name: "Okrzyk bojowy",
        description:
            "Wzmacnia Cię na krótko: zadajesz więcej obrażeń.",
        tree: "warrior_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "warrior",
        requiredLevel: 15,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [900, 2200, 5500, 13000, 30000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 25,
            cooldownReductionSecondsPerLevel: 1.5,
            durationSeconds: 10,
            baseDamageDealtPercent: 15,
            damageDealtPercentPerLevel: 3
        }
    },

    war_blood_frenzy: {
        id: "war_blood_frenzy",
        name: "Szał krwi",
        description:
            "Im mniej masz zdrowia, tym więcej obrażeń zadajesz (do wartości maksymalnej przy bliskim zeru HP).",
        tree: "warrior_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "warrior",
        requiredLevel: 20,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [1200, 3000, 7500, 18000, 40000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 20,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 40,
            cooldownReductionSecondsPerLevel: 2,
            durationSeconds: 12,
            scalesWithMissingHp: true,
            baseDamageDealtPercent: 30,
            damageDealtPercentPerLevel: 6
        }
    },

    // ===== Berserker =====
    ber_bloodthirst: {
        id: "ber_bloodthirst",
        name: "Żądza krwi",
        description:
            "Brutalny cios, który leczy Cię częścią zadanych obrażeń.",
        tree: "warrior_berserker",
        branch: "berserker",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "warrior",
        requiredSubclass: "warrior_berserker",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 18,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 10,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.7,
            damageMultiplierPerLevel: 0.25,
            baseLifestealPercent: 30,
            lifestealPercentPerLevel: 4
        }
    },

    ber_reckless_fury: {
        id: "ber_reckless_fury",
        name: "Bezgraniczny szał",
        description:
            "Zadajesz znacznie więcej obrażeń, ale otrzymujesz o 20% więcej.",
        tree: "warrior_berserker",
        branch: "berserker",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "warrior",
        requiredSubclass: "warrior_berserker",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 22,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 45,
            cooldownReductionSecondsPerLevel: 2,
            durationSeconds: 10,
            baseDamageDealtPercent: 35,
            damageDealtPercentPerLevel: 5,
            damageTakenPercent: 20
        }
    },

    ber_rampage: {
        id: "ber_rampage",
        name: "Rozjuszenie",
        description: "Zwiększa obrażenia bronią białą o 3% za każdy poziom.",
        tree: "warrior_berserker",
        branch: "berserker",
        type: "passive",
        requiredClass: "warrior",
        requiredSubclass: "warrior_berserker",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [5000, 12000, 26000, 55000, 110000],
        prerequisites: [],
        effect: { meleeDamagePercentPerLevel: 3 }
    },

    // ===== Pogromca =====
    sl_armor_breaker: {
        id: "sl_armor_breaker",
        name: "Łamacz pancerzy",
        description:
            "Miażdżące uderzenie, które zadaje dodatkowe obrażenia potężnym przeciwnikom (bossom).",
        tree: "warrior_slayer",
        branch: "slayer",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "warrior",
        requiredSubclass: "warrior_slayer",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 9,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.9,
            damageMultiplierPerLevel: 0.25,
            baseBossDamagePercent: 30,
            bossDamagePercentPerLevel: 5
        }
    },

    sl_executioner_blow: {
        id: "sl_executioner_blow",
        name: "Cios wykańczający",
        description:
            "Uderzenie, które zadaje podwójne obrażenia przeciwnikowi poniżej 35% zdrowia.",
        tree: "warrior_slayer",
        branch: "slayer",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "warrior",
        requiredSubclass: "warrior_slayer",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 14,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 7,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.3,
            damageMultiplierPerLevel: 0.2,
            executeThresholdPercent: 35,
            executeMultiplier: 2
        }
    },

    sl_iron_bulwark: {
        id: "sl_iron_bulwark",
        name: "Żelazna postawa",
        description:
            "Na krótko zmniejsza otrzymywane obrażenia.",
        tree: "warrior_slayer",
        branch: "slayer",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "warrior",
        requiredSubclass: "warrior_slayer",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 20,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 40,
            cooldownReductionSecondsPerLevel: 2,
            durationSeconds: 10,
            baseDamageTakenReductionPercent: 20,
            damageTakenReductionPercentPerLevel: 3
        }
    },

    sl_hardened: {
        id: "sl_hardened",
        name: "Hartowanie",
        description: "Zwiększa maksymalne HP o 2% za każdy poziom.",
        tree: "warrior_slayer",
        branch: "slayer",
        type: "passive",
        requiredClass: "warrior",
        requiredSubclass: "warrior_slayer",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [5000, 12000, 26000, 55000, 110000],
        prerequisites: [],
        effect: { maxHpPercentPerLevel: 2 }
    },

    // ===== Łowca: sztuki klasowe =====
    hun_quick_shot: {
        id: "hun_quick_shot",
        name: "Szybki strzał",
        description: "Dwa błyskawiczne strzały pod rząd.",
        tree: "hunter_arts",
        branch: "arts",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "hunter",
        requiredLevel: 12,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [800, 2000, 5000, 12000, 28000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 10,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 6,
            cooldownReductionSecondsPerLevel: 0.4,
            baseDamageMultiplier: 0.9,
            damageMultiplierPerLevel: 0.15,
            hits: 2
        }
    },
    hun_hunters_mark: {
        id: "hun_hunters_mark",
        name: "Znak łowcy",
        description: "Oznaczasz zdobycz: przez chwilę zadajesz więcej obrażeń.",
        tree: "hunter_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "hunter",
        requiredLevel: 15,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [900, 2200, 5500, 13000, 30000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 14,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 24,
            cooldownReductionSecondsPerLevel: 1.5,
            durationSeconds: 10,
            baseDamageDealtPercent: 15,
            damageDealtPercentPerLevel: 3
        }
    },
    hun_evasive_roll: {
        id: "hun_evasive_roll",
        name: "Zwinny unik",
        description: "Szybki przewrót: przez chwilę otrzymujesz mniej obrażeń.",
        tree: "hunter_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "hunter",
        requiredLevel: 20,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [1200, 3000, 7500, 18000, 40000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 30,
            cooldownReductionSecondsPerLevel: 2,
            durationSeconds: 8,
            baseDamageTakenReductionPercent: 15,
            damageTakenReductionPercentPerLevel: 3
        }
    },

    // ===== Łucznik =====
    arc_arrow_rain: {
        id: "arc_arrow_rain",
        name: "Deszcz strzał",
        description: "Salwa czterech strzał z góry.",
        tree: "hunter_archer",
        branch: "archer",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "hunter",
        requiredSubclass: "hunter_archer",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 20,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 11,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 0.6,
            damageMultiplierPerLevel: 0.1,
            hits: 4
        }
    },
    arc_piercing_shot: {
        id: "arc_piercing_shot",
        name: "Przebijający strzał",
        description: "Celny strzał zadający dodatkowe obrażenia bossom.",
        tree: "hunter_archer",
        branch: "archer",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "hunter",
        requiredSubclass: "hunter_archer",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 18,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 10,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.8,
            damageMultiplierPerLevel: 0.25,
            baseBossDamagePercent: 30,
            bossDamagePercentPerLevel: 5
        }
    },
    arc_eagle_eye: {
        id: "arc_eagle_eye",
        name: "Orli wzrok",
        description: "Zwiększa obrażenia dystansowe o 3% za każdy poziom.",
        tree: "hunter_archer",
        branch: "archer",
        type: "passive",
        requiredClass: "hunter",
        requiredSubclass: "hunter_archer",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [5000, 12000, 26000, 55000, 110000],
        prerequisites: [],
        effect: { rangedDamagePercentPerLevel: 3 }
    },

    // ===== Kusznik =====
    cro_heavy_bolt: {
        id: "cro_heavy_bolt",
        name: "Ciężki bełt",
        description: "Potężny bełt z krwawieniem.",
        tree: "hunter_crossbowman",
        branch: "crossbowman",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "hunter",
        requiredSubclass: "hunter_crossbowman",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 20,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 12,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 2.4,
            damageMultiplierPerLevel: 0.35,
            bleedTickMultiplier: 0.2,
            bleedTicks: 4,
            bleedTickSeconds: 1
        }
    },
    cro_finishing_bolt: {
        id: "cro_finishing_bolt",
        name: "Bełt dobijający",
        description: "Dwukrotnie większe obrażenia we wrogu poniżej 35% HP.",
        tree: "hunter_crossbowman",
        branch: "crossbowman",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "hunter",
        requiredSubclass: "hunter_crossbowman",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 9,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.5,
            damageMultiplierPerLevel: 0.2,
            executeThresholdPercent: 35,
            executeMultiplier: 2
        }
    },
    cro_precision: {
        id: "cro_precision",
        name: "Precyzja kuszy",
        description: "Zwiększa szansę na trafienie krytyczne z broni dystansowej o 2% za każdy poziom.",
        tree: "hunter_crossbowman",
        branch: "crossbowman",
        type: "passive",
        requiredClass: "hunter",
        requiredSubclass: "hunter_crossbowman",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [5000, 12000, 26000, 55000, 110000],
        prerequisites: [],
        effect: { rangedCritChancePercentPerLevel: 2 }
    },

    // ===== Mag: sztuki klasowe =====
    mag_energy_surge: {
        id: "mag_energy_surge",
        name: "Wyładowanie energii",
        description: "Trzy szybkie wyładowania arkanicznej energii.",
        tree: "mage_arts",
        branch: "arts",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "mage",
        requiredLevel: 12,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [800, 2000, 5000, 12000, 28000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 12,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 7,
            cooldownReductionSecondsPerLevel: 0.4,
            baseDamageMultiplier: 0.8,
            damageMultiplierPerLevel: 0.12,
            hits: 3
        }
    },
    mag_elemental_power: {
        id: "mag_elemental_power",
        name: "Moc żywiołów",
        description: "Przez chwilę Twoje obrażenia są większe.",
        tree: "mage_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "mage",
        requiredLevel: 15,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [900, 2200, 5500, 13000, 30000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 14,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 25,
            cooldownReductionSecondsPerLevel: 1.5,
            durationSeconds: 10,
            baseDamageDealtPercent: 15,
            damageDealtPercentPerLevel: 3
        }
    },
    mag_mana_surge: {
        id: "mag_mana_surge",
        name: "Przypływ many",
        description: "Gdy brakuje Ci many, odzyskujesz jej część.",
        tree: "mage_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "mage",
        requiredLevel: 20,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [1200, 3000, 7500, 18000, 40000],
        prerequisites: [],
        effect: {
            abilityKind: "manaRestore",
            baseManaCost: 0,
            manaCostReductionPerLevel: 0,
            baseCooldownSeconds: 45,
            cooldownReductionSecondsPerLevel: 2,
            baseManaRestorePercent: 30,
            manaRestorePercentPerLevel: 5
        }
    },

    // ===== Czarnoksiężnik =====
    wlk_shadow_curse: {
        id: "wlk_shadow_curse",
        name: "Klątwa cienia",
        description: "Mroczna klątwa zadaje obrażenia i długo drenuje wroga.",
        tree: "mage_warlock",
        branch: "warlock",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "mage",
        requiredSubclass: "mage_warlock",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 20,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 12,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.5,
            damageMultiplierPerLevel: 0.2,
            bleedTickMultiplier: 0.3,
            bleedTicks: 6,
            bleedTickSeconds: 1
        }
    },
    wlk_soul_drain: {
        id: "wlk_soul_drain",
        name: "Wyssanie duszy",
        description: "Wysysa życie wroga i leczy Cię częścią obrażeń.",
        tree: "mage_warlock",
        branch: "warlock",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "mage",
        requiredSubclass: "mage_warlock",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 18,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 10,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.6,
            damageMultiplierPerLevel: 0.25,
            baseLifestealPercent: 25,
            lifestealPercentPerLevel: 4
        }
    },
    wlk_dark_mastery: {
        id: "wlk_dark_mastery",
        name: "Mroczne mistrzostwo",
        description: "Zwiększa obrażenia czarów ofensywnych o 3% za każdy poziom.",
        tree: "mage_warlock",
        branch: "warlock",
        type: "passive",
        requiredClass: "mage",
        requiredSubclass: "mage_warlock",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [5000, 12000, 26000, 55000, 110000],
        prerequisites: [],
        effect: { offensiveSpellDamagePercentPerLevel: 3 }
    },

    // ===== Druid =====
    dru_regrowth: {
        id: "dru_regrowth",
        name: "Odrodzenie",
        description: "Natura leczy Twoje rany.",
        tree: "mage_druid",
        branch: "druid",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "mage",
        requiredSubclass: "mage_druid",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "heal",
            baseManaCost: 18,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 20,
            cooldownReductionSecondsPerLevel: 1,
            baseHealPercent: 18,
            healPercentPerLevel: 3
        }
    },
    dru_barkskin: {
        id: "dru_barkskin",
        name: "Kora drzewa",
        description: "Twarda kora zmniejsza otrzymywane obrażenia.",
        tree: "mage_druid",
        branch: "druid",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "mage",
        requiredSubclass: "mage_druid",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 30,
            cooldownReductionSecondsPerLevel: 2,
            durationSeconds: 10,
            baseDamageTakenReductionPercent: 20,
            damageTakenReductionPercentPerLevel: 4
        }
    },
    dru_thorn_lash: {
        id: "dru_thorn_lash",
        name: "Bicz cierni",
        description: "Kolczasty bicz z krwawieniem.",
        tree: "mage_druid",
        branch: "druid",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "mage",
        requiredSubclass: "mage_druid",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 9,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.3,
            damageMultiplierPerLevel: 0.2,
            bleedTickMultiplier: 0.25,
            bleedTicks: 4,
            bleedTickSeconds: 1
        }
    },
    dru_vitality: {
        id: "dru_vitality",
        name: "Siła natury",
        description: "Zwiększa maksymalne zdrowie o 2% za każdy poziom.",
        tree: "mage_druid",
        branch: "druid",
        type: "passive",
        requiredClass: "mage",
        requiredSubclass: "mage_druid",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [5000, 12000, 26000, 55000, 110000],
        prerequisites: [],
        effect: { maxHpPercentPerLevel: 2 }
    },

    // ===== Strażnik =====
    grd_shield_bash: {
        id: "grd_shield_bash",
        name: "Uderzenie tarczą",
        description: "Mocne uderzenie tarczą.",
        tree: "guardian_arts",
        branch: "arts",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "guardian",
        requiredLevel: 12,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [800, 2000, 5000, 12000, 28000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 10,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 7,
            cooldownReductionSecondsPerLevel: 0.4,
            baseDamageMultiplier: 1.5,
            damageMultiplierPerLevel: 0.2
        }
    },
    grd_stand_firm: {
        id: "grd_stand_firm",
        name: "Niezłomna postawa",
        description: "Przez chwilę otrzymujesz mniej obrażeń.",
        tree: "guardian_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "guardian",
        requiredLevel: 15,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [900, 2200, 5500, 13000, 30000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 14,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 28,
            cooldownReductionSecondsPerLevel: 1.5,
            durationSeconds: 10,
            baseDamageTakenReductionPercent: 15,
            damageTakenReductionPercentPerLevel: 3
        }
    },
    grd_second_wind: {
        id: "grd_second_wind",
        name: "Drugi oddech",
        description: "Odzyskujesz część zdrowia.",
        tree: "guardian_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "guardian",
        requiredLevel: 20,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [1200, 3000, 7500, 18000, 40000],
        prerequisites: [],
        effect: {
            abilityKind: "heal",
            baseManaCost: 18,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 35,
            cooldownReductionSecondsPerLevel: 2,
            baseHealPercent: 12,
            healPercentPerLevel: 2
        }
    },

    // ===== Bastion =====
    bas_fortress: {
        id: "bas_fortress",
        name: "Twierdza",
        description: "Potężna osłona: bardzo mniejsze obrażenia przez dłuższy czas.",
        tree: "guardian_bastion",
        branch: "bastion",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "guardian",
        requiredSubclass: "guardian_bastion",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 22,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 40,
            cooldownReductionSecondsPerLevel: 2,
            durationSeconds: 12,
            baseDamageTakenReductionPercent: 30,
            damageTakenReductionPercentPerLevel: 4
        }
    },
    bas_crushing_shield: {
        id: "bas_crushing_shield",
        name: "Druzgocąca tarcza",
        description: "Zdruzgocz wroga ciężką tarczą.",
        tree: "guardian_bastion",
        branch: "bastion",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "guardian",
        requiredSubclass: "guardian_bastion",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 18,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 10,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.9,
            damageMultiplierPerLevel: 0.3
        }
    },
    bas_bulwark: {
        id: "bas_bulwark",
        name: "Mur obronny",
        description: "Zwiększa maksymalne zdrowie o 3% za każdy poziom.",
        tree: "guardian_bastion",
        branch: "bastion",
        type: "passive",
        requiredClass: "guardian",
        requiredSubclass: "guardian_bastion",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [5000, 12000, 26000, 55000, 110000],
        prerequisites: [],
        effect: { maxHpPercentPerLevel: 3 }
    },

    // ===== Obrońca światła =====
    lgt_holy_light: {
        id: "lgt_holy_light",
        name: "Święte światło",
        description: "Światło leczy Twoje rany.",
        tree: "guardian_light",
        branch: "light",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "guardian",
        requiredSubclass: "guardian_light",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "heal",
            baseManaCost: 18,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 18,
            cooldownReductionSecondsPerLevel: 1,
            baseHealPercent: 20,
            healPercentPerLevel: 3
        }
    },
    lgt_radiant_strike: {
        id: "lgt_radiant_strike",
        name: "Promienny cios",
        description: "Uderzenie światłem, które w bossach zadaje więcej obrażeń.",
        tree: "guardian_light",
        branch: "light",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "guardian",
        requiredSubclass: "guardian_light",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 9,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.5,
            damageMultiplierPerLevel: 0.25,
            baseBossDamagePercent: 25,
            bossDamagePercentPerLevel: 5
        }
    },
    lgt_blessing: {
        id: "lgt_blessing",
        name: "Błogosławieństwo",
        description: "Przez chwilę zadajesz więcej obrażeń.",
        tree: "guardian_light",
        branch: "light",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "guardian",
        requiredSubclass: "guardian_light",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 26,
            cooldownReductionSecondsPerLevel: 1.5,
            durationSeconds: 10,
            baseDamageDealtPercent: 15,
            damageDealtPercentPerLevel: 3
        }
    },

    // ===== Łotrzyk =====
    rog_backstab: {
        id: "rog_backstab",
        name: "Cios w plecy",
        description: "Szybki, podwójny cios sztyletem.",
        tree: "rogue_arts",
        branch: "arts",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "rogue",
        requiredLevel: 12,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [800, 2000, 5000, 12000, 28000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 10,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 6,
            cooldownReductionSecondsPerLevel: 0.4,
            baseDamageMultiplier: 1.0,
            damageMultiplierPerLevel: 0.15,
            hits: 2
        }
    },
    rog_shadow_veil: {
        id: "rog_shadow_veil",
        name: "Zasłona cienia",
        description: "Przez chwilę otrzymujesz mniej obrażeń.",
        tree: "rogue_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "rogue",
        requiredLevel: 15,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [900, 2200, 5500, 13000, 30000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 14,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 28,
            cooldownReductionSecondsPerLevel: 1.5,
            durationSeconds: 8,
            baseDamageTakenReductionPercent: 15,
            damageTakenReductionPercentPerLevel: 3
        }
    },
    rog_adrenaline: {
        id: "rog_adrenaline",
        name: "Adrenalina",
        description: "Przez chwilę zadajesz więcej obrażeń.",
        tree: "rogue_arts",
        branch: "arts",
        type: "active",
        spellType: "defensive",
        classAbility: true,
        requiredClass: "rogue",
        requiredLevel: 20,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [1200, 3000, 7500, 18000, 40000],
        prerequisites: [],
        effect: {
            abilityKind: "buff",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 30,
            cooldownReductionSecondsPerLevel: 1.5,
            durationSeconds: 10,
            baseDamageDealtPercent: 18,
            damageDealtPercentPerLevel: 3
        }
    },

    // ===== Truciciel =====
    poi_venom_strike: {
        id: "poi_venom_strike",
        name: "Jadowite ostrze",
        description: "Zatrute ostrze truje wroga przez dłuższy czas.",
        tree: "rogue_poisoner",
        branch: "poisoner",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "rogue",
        requiredSubclass: "rogue_poisoner",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 10,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.0,
            damageMultiplierPerLevel: 0.15,
            bleedTickMultiplier: 0.4,
            bleedTicks: 6,
            bleedTickSeconds: 1
        }
    },
    poi_toxic_cloud: {
        id: "poi_toxic_cloud",
        name: "Trujący obłok",
        description: "Szybkie ciosy zatrutymi nożami.",
        tree: "rogue_poisoner",
        branch: "poisoner",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "rogue",
        requiredSubclass: "rogue_poisoner",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 18,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 11,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 0.7,
            damageMultiplierPerLevel: 0.1,
            hits: 3,
            bleedTickMultiplier: 0.15,
            bleedTicks: 5,
            bleedTickSeconds: 1
        }
    },
    poi_toxicology: {
        id: "poi_toxicology",
        name: "Toksykologia",
        description: "Zwiększa obrażenia bronią białą o 3% za każdy poziom.",
        tree: "rogue_poisoner",
        branch: "poisoner",
        type: "passive",
        requiredClass: "rogue",
        requiredSubclass: "rogue_poisoner",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [5000, 12000, 26000, 55000, 110000],
        prerequisites: [],
        effect: { meleeDamagePercentPerLevel: 3 }
    },

    // ===== Skrytobójca =====
    ass_assassinate: {
        id: "ass_assassinate",
        name: "Zabójcze cięcie",
        description: "Dwukrotnie większe obrażenia we wrogu poniżej 35% HP.",
        tree: "rogue_assassin",
        branch: "assassin",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "rogue",
        requiredSubclass: "rogue_assassin",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 16,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 9,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 1.6,
            damageMultiplierPerLevel: 0.25,
            executeThresholdPercent: 35,
            executeMultiplier: 2
        }
    },
    ass_deadly_strike: {
        id: "ass_deadly_strike",
        name: "Śmiertelny cios",
        description: "Precyzyjny cios w czuły punkt, groźny dla bossów.",
        tree: "rogue_assassin",
        branch: "assassin",
        type: "active",
        spellType: "offensive",
        classAbility: true,
        requiredClass: "rogue",
        requiredSubclass: "rogue_assassin",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [6000, 14000, 30000, 65000, 130000],
        prerequisites: [],
        effect: {
            abilityKind: "strike",
            baseManaCost: 20,
            manaCostReductionPerLevel: 1,
            baseCooldownSeconds: 12,
            cooldownReductionSecondsPerLevel: 0.5,
            baseDamageMultiplier: 2.2,
            damageMultiplierPerLevel: 0.35,
            baseBossDamagePercent: 30,
            bossDamagePercentPerLevel: 5
        }
    },
    ass_lethality: {
        id: "ass_lethality",
        name: "Zabójczość",
        description: "Zwiększa szansę na trafienie krytyczne o 1% za każdy poziom.",
        tree: "rogue_assassin",
        branch: "assassin",
        type: "passive",
        requiredClass: "rogue",
        requiredSubclass: "rogue_assassin",
        requiredLevel: 50,
        maxLevel: 5,
        costPerLevel: 1,
        goldCosts: [5000, 12000, 26000, 55000, 110000],
        prerequisites: [],
        effect: { critChancePercentPerLevel: 1 }
    }
});

/*
 * Przebudowa klas: stare drzewka klasowe są wycofane. Umiejętności zostają
 * w danych (żeby nic się nie zepsuło), ale nie można ich już poznawać,
 * a drzewka nie są pokazywane. Punkty graczy zwraca migracja
 * migrateLegacyClassSkills() (js/classAbilities.js).
 */
const legacyClassTreeIds = ["warrior", "hunter", "mage", "guardian", "rogue"];

Object.values(skills).forEach(skill => {
    if (legacyClassTreeIds.includes(skill.tree)) {
        skill.legacyClassSkill = true;
    }
});

for (let i = skillTrees.length - 1; i >= 0; i--) {
    if (legacyClassTreeIds.includes(skillTrees[i].id)) {
        skillTrees.splice(i, 1);
    }
}
