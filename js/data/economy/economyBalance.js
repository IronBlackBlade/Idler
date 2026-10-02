// ======================================================
// EKONOMIA GRY – BALANS
// ======================================================
//
// Ten plik zawiera centralne wartości ekonomii gry.
// T1–T7 są obecnie używane.
// T8–T9 są przygotowane na przyszłość.
//
// ======================================================

window.economyBalance = {

    // ==================================================
    // KOSZT ZŁOTA ZA CRAFTING
    // ==================================================
    //
    // Dotyczy pojedynczego przedmiotu.
    //
    // T1 = poziom 1
    // T2 = poziom 10
    // T3 = poziom 20
    // T4 = poziom 25
    // T5 = poziom 30
    // T6 = poziom 40
    // T7 = poziom 50
    // T8 = poziom 75 - przyszłość
    // T9 = poziom 100 - przyszłość
    //

    craftingGoldCost: {
        1: 25,
        2: 150,
        3: 750,
        4: 2500,
        5: 5000,
        6: 10000,
        7: 20000,
        8: 35000,
        9: 60000
    },


    // ==================================================
    // POZIOMY TIERÓW
    // ==================================================

    tierLevels: {
        1: 1,
        2: 10,
        3: 20,
        4: 25,
        5: 30,
        6: 40,
        7: 50,
        8: 75,
        9: 100
    },


    // ==================================================
    // ZŁOTO Z POTWORÓW
    // ==================================================
    //
    // Na tym etapie jeszcze NIE zmieniamy enemy.js.
    // Wartości wpiszemy tutaj, aby ekonomia była
    // w jednym miejscu.
    //
    // UWAGA:
    // Są to wartości balansu do wdrożenia.
    //

    monsterGold: {

        // LAS
        forest: {
            1: 2,
            2: 3,
            3: 5,
            4: 8,
            5: 12
        },

        // JASKINIA
        cave: {
            1: 15,
            2: 20,
            3: 27,
            4: 35,
            5: 45
        },

        // RUINY
        ruins: {
            1: 65,
            2: 85,
            3: 110,
            4: 145,
            5: 190
        },

        // LODOWA KRAINA
        ice: {
            1: 220,
            2: 270,
            3: 330,
            4: 410,
            5: 520
        },

        // WULKAN
        volcano: {
            1: 450,
            2: 550,
            3: 680,
            4: 820,
            5: 1000
        },

        // OTCHŁAŃ
        abyss: {
            1: 1100,
            2: 1350,
            3: 1650,
            4: 2000,
            5: 2400
        },

        // ZATOPIONE KRÓLESTWO
        sunkenKingdom: {
            1: 3000,
            2: 3700,
            3: 4500,
            4: 5500,
            5: 6800
        },

        // KRYSZTAŁOWE SZCZYTY
        crystalPeaks: {
            1: 8000,
            2: 10000,
            3: 12500,
            4: 15500,
            5: 19000
        }
    },


    // ==================================================
    // CENY MATERIAŁÓW
    // ==================================================
    //
    // Ceny sprzedaży materiałów u kupca.
    //
    // Na razie wpisujemy tylko ceny, które zostały
    // już ustalone.
    //
    // Kolejne lokacje uzupełnimy później.
    //

    materialPrices: {

        // ----------------------------------------------
        // LAS
        // ----------------------------------------------

        rat_tail: 5,
        beetle_wing: 5,
        sharp_tooth: 8,
        wolf_fang: 15,
        small_spike: 20,
        ram_horn: 25,
        broken_shield: 30,
        wolf_claw: 40,


        // ----------------------------------------------
        // JASKINIA
        // ----------------------------------------------

        bat_wing: 25,
        bat_fang: 40,
        dark_feather: 60,
        spider_venom: 50,
        spider_silk: 75,
        bone: 35,
        rusty_chain: 80,
        stone_core: 120,
        heavy_rock: 45,
        kobold_pickaxe: 70,
        cave_crystal: 100,


        // ----------------------------------------------
        // RUINY
        // ----------------------------------------------

        ancient_chitin: 100,
        torn_guardian_cloth: 120,
        rusted_guardian_plate: 180,
        ancient_rune_fragment: 220,
        spectral_essence: 300,
        guardian_core: 400,
        guardian_emblem: 600
    }
};


// ======================================================
// ALIAS DLA WYGODNEGO DOSTĘPU
// ======================================================

const economyBalance = window.economyBalance;
