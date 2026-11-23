const characterClasses = {
    warrior: {
        id: "warrior",
        name: "Wojownik",
        icon: "⚔️",

        description:
            "Mistrz walki w zwarciu, który łączy wysokie obrażenia z większą wytrzymałością.",

        unlockLevel: 10,

        bonuses: {
            strength: 5,
            endurance: 2
        }
    },

    hunter: {
        id: "hunter",
        name: "Łowca",
        icon: "🏹",

        description:
            "Specjalista od łuków i kusz, polegający na zręczności oraz szczęściu.",

        unlockLevel: 10,

        bonuses: {
            dexterity: 5,
            luck: 2
        }
    },

    mage: {
        id: "mage",
        name: "Mag",
        icon: "🪄",

        description:
            "Włada bronią magiczną i czarami, korzystając z wysokiej inteligencji.",

        unlockLevel: 10,

        bonuses: {
            intelligence: 5,
            luck: 2
        }
    },

    guardian: {
        id: "guardian",
        name: "Strażnik",
        icon: "🛡️",

        description:
            "Wytrzymały obrońca z dużą liczbą punktów życia i większą siłą.",

        unlockLevel: 10,

        bonuses: {
            endurance: 5,
            strength: 2
        }
    },

    rogue: {
        id: "rogue",
        name: "Łotrzyk",
        icon: "🗡️",

        description:
            "Szybki wojownik opierający się na unikach, zręczności i trafieniach krytycznych.",

        unlockLevel: 10,

        bonuses: {
            dexterity: 4,
            luck: 3
        }
    }
};


/*
 * Podklasy: każda klasa ma dwie, wybierane na poziomie SUBCLASS_UNLOCK_LEVEL.
 * Premie do atrybutów dodają się do premii klasy.
 */
const SUBCLASS_UNLOCK_LEVEL = 50;
const SUBCLASS_CHANGE_BASE_COST = 50000;
const SUBCLASS_CHANGE_COST_GROWTH = 1.5;

const characterSubclasses = {
    warrior_berserker: {
        id: "warrior_berserker",
        classId: "warrior",
        name: "Berserker",
        icon: "🩸",
        description:
            "Szaleńcza furia: wysokie obrażenia, krwawienie i wysysanie życia kosztem obrony.",
        bonuses: { strength: 4, luck: 1 }
    },

    warrior_slayer: {
        id: "warrior_slayer",
        classId: "warrior",
        name: "Pogromca",
        icon: "🛡️",
        description:
            "Walka jednym celem: przebijanie pancerza i obrażenia przeciw potężnym przeciwnikom.",
        bonuses: { strength: 3, endurance: 2 }
    },

    hunter_archer: {
        id: "hunter_archer",
        classId: "hunter",
        name: "Łucznik",
        icon: "🎯",
        description:
            "Mistrz łuku: szybkie strzały, wielokrotne trafienia i uniki.",
        bonuses: { dexterity: 4, luck: 1 }
    },

    hunter_crossbowman: {
        id: "hunter_crossbowman",
        classId: "hunter",
        name: "Kusznik",
        icon: "⚙️",
        description:
            "Mistrz kuszy: wolniejsze, lecz miażdżące i przebijające pancerz trafienia.",
        bonuses: { dexterity: 3, strength: 2 }
    },

    mage_warlock: {
        id: "mage_warlock",
        classId: "mage",
        name: "Czarnoksiężnik",
        icon: "🌑",
        description:
            "Klątwy i mroczna magia: wyssanie życia, osłabianie wrogów i wysokie obrażenia kosztem własnego zdrowia.",
        bonuses: { intelligence: 4, luck: 1 }
    },

    mage_druid: {
        id: "mage_druid",
        classId: "mage",
        name: "Druid",
        icon: "🌿",
        description:
            "Magia natury: leczenie, wzmacnianie siebie i obrażenia w czasie.",
        bonuses: { intelligence: 3, endurance: 2 }
    },

    guardian_bastion: {
        id: "guardian_bastion",
        classId: "guardian",
        name: "Bastion",
        icon: "🏰",
        description:
            "Czysta obrona: kolce, odbijanie obrażeń i niezłomność.",
        bonuses: { endurance: 4, strength: 1 }
    },

    guardian_light: {
        id: "guardian_light",
        classId: "guardian",
        name: "Obrońca światła",
        icon: "✨",
        description:
            "Święta ochrona: leczenie, regeneracja i podtrzymywanie przy życiu.",
        bonuses: { endurance: 3, intelligence: 2 }
    },

    rogue_poisoner: {
        id: "rogue_poisoner",
        classId: "rogue",
        name: "Truciciel",
        icon: "☠️",
        description:
            "Kumulujące się trucizny i obrażenia w czasie, zabójcze dla potężnych przeciwników.",
        bonuses: { dexterity: 3, intelligence: 2 }
    },

    rogue_assassin: {
        id: "rogue_assassin",
        classId: "rogue",
        name: "Skrytobójca",
        icon: "🌑",
        description:
            "Szybkie wykańczanie: trafienia krytyczne i premie za pierwszy cios.",
        bonuses: { dexterity: 3, luck: 2 }
    }
};
