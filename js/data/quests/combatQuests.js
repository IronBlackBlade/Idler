const combatQuests = [
    {
        id: "kill_beetles_1",
        chainStage: 1,
        chainLength: 4,
        title: "Pierwsze polowanie",
        description: "Pokonaj 5 chrząszczy.",
        targetEnemyName: "Chrząszcz",
        requiredKills: 5,
        currentKills: 0,
        rewardGold: 20,
        rewardExp: 25,
        completed: false,
        claimed: false
    },

    {
        id: "kill_beetles_2",

        previousQuestId:
            "kill_beetles_1",

        chainStage: 2,
        chainLength: 4,

        title:
            "Chrząszcze: drugi etap",

        description:
            "Pokonaj 25 chrząszczy.",

        targetEnemyName:
            "Chrząszcz",

        requiredKills: 25,
        currentKills: 0,

        rewardGold: 80,
        rewardExp: 100,

        completed: false,
        claimed: false
    },
    {
        id: "kill_beetles_3",

        previousQuestId:
            "kill_beetles_2",

        chainStage: 3,
        chainLength: 4,

        title:
            "Chrząszcze: trzeci etap",

        description:
            "Pokonaj 50 chrząszczy.",

        targetEnemyName:
            "Chrząszcz",

        requiredKills: 50,
        currentKills: 0,

        rewardGold: 180,
        rewardExp: 220,

        completed: false,
        claimed: false
    },
    {
        id: "kill_beetles_4",

        previousQuestId:
            "kill_beetles_3",

        chainStage: 4,
        chainLength: 4,

        title:
            "Chrząszcze: ostatni etap",

        description:
            "Pokonaj 100 chrząszczy.",

        targetEnemyName:
            "Chrząszcz",

        requiredKills: 100,
        currentKills: 0,

        rewardGold: 450,
        rewardExp: 550,

        completed: false,
        claimed: false
    },

    {
        id: "kill_sheep_1",
        chainStage: 1,
        chainLength: 4,
        title: "Wełniany problem",
        description: "Pokonaj 5 owiec.",
        targetEnemyName: "Owca",
        requiredKills: 5,
        currentKills: 0,
        rewardGold: 25,
        rewardExp: 35,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_sheep",

        title:
            "Wełniany problem",

        targetEnemyName:
            "Owca",

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj 25 owiec.",
            "Pokonaj 50 owiec.",
            "Pokonaj 100 owiec."
        ],

        rewardGold: [
            100,
            220,
            500
        ],

        rewardExp: [
            130,
            280,
            650
        ]
    }),

    {
        id: "kill_rats_1",
        chainStage: 1,
        chainLength: 4,
        title: "Szczury w lesie",
        description: "Pokonaj 6 olbrzymich szczurów.",
        targetEnemyName: "Olbrzymi szczur",
        requiredKills: 6,
        currentKills: 0,
        rewardGold: 40,
        rewardExp: 55,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_rats",

        title:
            "Szczury w lesie",

        targetEnemyName:
            "Olbrzymi szczur",

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj 25 olbrzymich szczurów.",
            "Pokonaj 50 olbrzymich szczurów.",
            "Pokonaj 100 olbrzymich szczurów."
        ],

        rewardGold: [
            140,
            300,
            700
        ],

        rewardExp: [
            180,
            380,
            850
        ]
    }),

    {
        id: "kill_wolves_1",
        chainStage: 1,
        chainLength: 4,
        title: "Młode wilki",
        description: "Pokonaj 6 młodych wilków.",
        targetEnemyName: "Młody wilk",
        requiredKills: 6,
        currentKills: 0,
        rewardGold: 60,
        rewardExp: 80,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_wolves",

        title:
            "Młode wilki",

        targetEnemyName:
            "Młody wilk",

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj 25 młodych wilków.",
            "Pokonaj 50 młodych wilków.",
            "Pokonaj 100 młodych wilków."
        ],

        rewardGold: [
            190,
            420,
            950
        ],

        rewardExp: [
            250,
            540,
            1200
        ]
    }),

    {
        id: "kill_goblins_1",
        chainStage: 1,
        chainLength: 4,
        title: "Goblińskie kłopoty",
        description: "Pokonaj 8 goblinów.",
        targetEnemyName: "Goblin",
        requiredKills: 8,
        currentKills: 0,
        rewardGold: 100,
        rewardExp: 130,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_goblins",

        title:
            "Goblińskie kłopoty",

        targetEnemyName:
            "Goblin",

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj 25 goblinów.",
            "Pokonaj 50 goblinów.",
            "Pokonaj 100 goblinów."
        ],

        rewardGold: [
            300,
            700,
            1600
        ],

        rewardExp: [
            400,
            900,
            2000
        ]
    }),

    {
        id: "kill_forest_boss_1",
        chainStage: 1,
        chainLength: 3,
        title: "Władca lasu",
        description: "Pokonaj Gobliniego Herszta.",
        targetEnemyName: "👑 Goblini Herszt",
        requiredKills: 1,
        currentKills: 0,
        rewardGold: 250,
        rewardExp: 300,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_forest_boss",

        title:
            "Władca lasu",

        targetEnemyName:
            "👑 Goblini Herszt",

        requiredKills: [
            3,
            5
        ],

        descriptions: [
            "Pokonaj Gobliniego Herszta łącznie 3 razy.",
            "Pokonaj Gobliniego Herszta łącznie 5 razy."
        ],

        rewardGold: [
            800,
            1600
        ],

        rewardExp: [
            1000,
            2000
        ]
    }),

    {
        id: "kill_bats_1",
        chainStage: 1,
        chainLength: 4,
        title: "Cień pod sklepieniem",
        description: "Pokonaj 8 nietoperzy.",
        targetEnemyName: "Nietoperz",
        requiredKills: 8,
        requiredLevel: 10,
        currentKills: 0,
        rewardGold: 120,
        rewardExp: 180,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_bats",

        title:
            "Cień pod sklepieniem",

        targetEnemyName:
            "Nietoperz",

        requiredLevel: 10,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 nietoperzy.",
            "Pokonaj łącznie 50 nietoperzy.",
            "Pokonaj łącznie 100 nietoperzy."
        ],

        rewardGold: [
            400,
            900,
            2000
        ],

        rewardExp: [
            600,
            1300,
            2900
        ]
    }),

    {
        id: "kill_cave_spiders_1",
        chainStage: 1,
        chainLength: 4,
        title: "Pajęcza sieć",
        description: "Pokonaj 8 pająków jaskiniowych.",
        targetEnemyName: "Pająk jaskiniowy",
        requiredKills: 8,
        requiredLevel: 10,
        currentKills: 0,
        rewardGold: 150,
        rewardExp: 220,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_cave_spiders",

        title:
            "Pajęcza sieć",

        targetEnemyName:
            "Pająk jaskiniowy",

        requiredLevel: 10,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 pająków jaskiniowych.",
            "Pokonaj łącznie 50 pająków jaskiniowych.",
            "Pokonaj łącznie 100 pająków jaskiniowych."
        ],

        rewardGold: [
            500,
            1100,
            2500
        ],

        rewardExp: [
            700,
            1550,
            3400
        ]
    }),

    {
        id: "kill_skeletons_1",
        chainStage: 1,
        chainLength: 4,
        title: "Kości nie kłamią",
        description: "Pokonaj 10 szkieletów.",
        targetEnemyName: "Szkielet",
        requiredKills: 10,
        requiredLevel: 10,
        currentKills: 0,
        rewardGold: 200,
        rewardExp: 300,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_skeletons",

        title:
            "Kości nie kłamią",

        targetEnemyName:
            "Szkielet",

        requiredLevel: 10,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 szkieletów.",
            "Pokonaj łącznie 50 szkieletów.",
            "Pokonaj łącznie 100 szkieletów."
        ],

        rewardGold: [
            650,
            1450,
            3200
        ],

        rewardExp: [
            950,
            2100,
            4600
        ]
    }),

    {
        id: "kill_kobolds_1",
        chainStage: 1,
        chainLength: 4,
        title: "Problem z koboldami",
        description: "Pokonaj 10 koboldów.",
        targetEnemyName: "Kobold",
        requiredKills: 10,
        requiredLevel: 10,
        currentKills: 0,
        rewardGold: 260,
        rewardExp: 380,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_kobolds",

        title:
            "Problem z koboldami",

        targetEnemyName:
            "Kobold",

        requiredLevel: 10,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 koboldów.",
            "Pokonaj łącznie 50 koboldów.",
            "Pokonaj łącznie 100 koboldów."
        ],

        rewardGold: [
            800,
            1800,
            4000
        ],

        rewardExp: [
            1200,
            2600,
            5800
        ]
    }),

    {
        id: "kill_stone_golems_1",
        chainStage: 1,
        chainLength: 4,
        title: "Kamienne zagrożenie",
        description: "Pokonaj 6 kamiennych golemów.",
        targetEnemyName: "Kamienny golem",
        requiredKills: 6,
        requiredLevel: 10,
        currentKills: 0,
        rewardGold: 320,
        rewardExp: 480,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_stone_golems",

        title:
            "Kamienne zagrożenie",

        targetEnemyName:
            "Kamienny golem",

        requiredLevel: 10,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 kamiennych golemów.",
            "Pokonaj łącznie 50 kamiennych golemów.",
            "Pokonaj łącznie 100 kamiennych golemów."
        ],

        rewardGold: [
            1000,
            2300,
            5200
        ],

        rewardExp: [
            1500,
            3400,
            7500
        ]
    }),

    {
        id: "kill_cave_boss_1",
        chainStage: 1,
        chainLength: 3,
        title: "Król pod ziemią",
        description: "Pokonaj Króla Koboldów.",
        targetEnemyName: "👑 Król Koboldów",
        requiredKills: 1,
        requiredLevel: 10,
        currentKills: 0,
        rewardGold: 700,
        rewardExp: 900,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_cave_boss",

        title:
            "Król pod ziemią",

        targetEnemyName:
            "👑 Król Koboldów",

        requiredLevel: 10,

        requiredKills: [
            3,
            5
        ],

        descriptions: [
            "Pokonaj Króla Koboldów łącznie 3 razy.",
            "Pokonaj Króla Koboldów łącznie 5 razy."
        ],

        rewardGold: [
            2500,
            5500
        ],

        rewardExp: [
            3200,
            7000
        ]
    }),

    /* ========================================
   ZADANIA — ZAPOMNIANE RUINY
======================================== */

    {
        id: "kill_ruins_scarabs_1",
        chainStage: 1,
        chainLength: 4,
        title: "Chitynowa plaga",
        description:
            "Pokonaj 10 skarabeuszy ruin.",

        targetEnemyName:
            "Skarabeusz ruin",

        requiredLevel: 20,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 450,
        rewardExp: 700,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_ruins_scarabs",

        title:
            "Chitynowa plaga",

        targetEnemyName:
            "Skarabeusz ruin",

        requiredLevel: 20,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 skarabeuszy ruin.",
            "Pokonaj łącznie 50 skarabeuszy ruin.",
            "Pokonaj łącznie 100 skarabeuszy ruin."
        ],

        rewardGold: [
            1400,
            3200,
            7200
        ],

        rewardExp: [
            2100,
            4700,
            10500
        ]
    }),

    {
        id: "kill_ruin_scavengers_1",
        chainStage: 1,
        chainLength: 4,
        title: "Złodzieje przeszłości",
        description:
            "Pokonaj 10 zbieraczy z ruin.",

        targetEnemyName:
            "Zbieracz z ruin",

        requiredLevel: 20,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 575,
        rewardExp: 925,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_ruin_scavengers",

        title:
            "Złodzieje przeszłości",

        targetEnemyName:
            "Zbieracz z ruin",

        requiredLevel: 20,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 zbieraczy z ruin.",
            "Pokonaj łącznie 50 zbieraczy z ruin.",
            "Pokonaj łącznie 100 zbieraczy z ruin."
        ],

        rewardGold: [
            1800,
            4100,
            9200
        ],

        rewardExp: [
            2800,
            6300,
            14000
        ]
    }),

    {
        id: "kill_animated_armor_1",
        chainStage: 1,
        chainLength: 4,
        title: "Puste pancerze",
        description:
            "Pokonaj 10 ożywionych zbroi.",

        targetEnemyName:
            "Ożywiona zbroja",

        requiredLevel: 20,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 750,
        rewardExp: 1175,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_animated_armor",

        title:
            "Puste pancerze",

        targetEnemyName:
            "Ożywiona zbroja",

        requiredLevel: 20,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 ożywionych zbroi.",
            "Pokonaj łącznie 50 ożywionych zbroi.",
            "Pokonaj łącznie 100 ożywionych zbroi."
        ],

        rewardGold: [
            2300,
            5300,
            12000
        ],

        rewardExp: [
            3600,
            8200,
            18500
        ]
    }),

    {
        id: "kill_ruin_sentinels_1",
        chainStage: 1,
        chainLength: 4,
        title: "Strażnicy bez pana",
        description:
            "Pokonaj 8 strażników ruin.",

        targetEnemyName:
            "Strażnik ruin",

        requiredLevel: 20,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 800,
        rewardExp: 1240,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_ruin_sentinels",

        title:
            "Strażnicy bez pana",

        targetEnemyName:
            "Strażnik ruin",

        requiredLevel: 20,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 strażników ruin.",
            "Pokonaj łącznie 50 strażników ruin.",
            "Pokonaj łącznie 100 strażników ruin."
        ],

        rewardGold: [
            2600,
            5900,
            13500
        ],

        rewardExp: [
            4000,
            9000,
            20500
        ]
    }),

    {
        id: "kill_spectral_knights_1",
        chainStage: 1,
        chainLength: 4,
        title: "Rycerze zza grobu",
        description:
            "Pokonaj 8 widmowych rycerzy.",

        targetEnemyName:
            "Widmowy rycerz",

        requiredLevel: 20,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 1080,
        rewardExp: 1640,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_spectral_knights",

        title:
            "Rycerze zza grobu",

        targetEnemyName:
            "Widmowy rycerz",

        requiredLevel: 20,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 widmowych rycerzy.",
            "Pokonaj łącznie 50 widmowych rycerzy.",
            "Pokonaj łącznie 100 widmowych rycerzy."
        ],

        rewardGold: [
            3400,
            7800,
            17500
        ],

        rewardExp: [
            5100,
            11600,
            26000
        ]
    }),

    {
        id: "kill_ruins_boss_1",
        chainStage: 1,
        chainLength: 3,
        title: "Serce ruin",
        description:
            "Pokonaj Pradawnego Strażnika.",

        targetEnemyName:
            "👑 Pradawny Strażnik",

        requiredLevel: 20,
        requiredKills: 1,
        currentKills: 0,

        rewardGold: 2600,
        rewardExp: 4000,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_ruins_boss",

        title:
            "Serce ruin",

        targetEnemyName:
            "👑 Pradawny Strażnik",

        requiredLevel: 20,

        requiredKills: [
            3,
            5
        ],

        descriptions: [
            "Pokonaj Pradawnego Strażnika łącznie 3 razy.",
            "Pokonaj Pradawnego Strażnika łącznie 5 razy."
        ],

        rewardGold: [
            8500,
            19000
        ],

        rewardExp: [
            13000,
            29000
        ]
    }),

    /* ========================================
       ZADANIA — LODOWA KRAINA
    ======================================== */

    {
        id: "kill_frost_wisps_1",
        chainStage: 1,
        chainLength: 4,
        title: "Zgaszone ogniki",
        description:
            "Pokonaj 10 mroźnych ogników.",

        targetEnemyName:
            "Mroźny ognik",

        requiredLevel: 30,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 1750,
        rewardExp: 2600,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_frost_wisps",

        title:
            "Zgaszone ogniki",

        targetEnemyName:
            "Mroźny ognik",

        requiredLevel: 30,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 mroźnych ogników.",
            "Pokonaj łącznie 50 mroźnych ogników.",
            "Pokonaj łącznie 100 mroźnych ogników."
        ],

        rewardGold: [
            5400,
            12200,
            27500
        ],

        rewardExp: [
            8000,
            18000,
            40500
        ]
    }),

    {
        id: "kill_ice_wolves_1",
        chainStage: 1,
        chainLength: 4,
        title: "Wilki wiecznej zimy",
        description:
            "Pokonaj 10 lodowych wilków.",

        targetEnemyName:
            "Lodowy wilk",

        requiredLevel: 30,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 2150,
        rewardExp: 3250,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_ice_wolves",

        title:
            "Wilki wiecznej zimy",

        targetEnemyName:
            "Lodowy wilk",

        requiredLevel: 30,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 lodowych wilków.",
            "Pokonaj łącznie 50 lodowych wilków.",
            "Pokonaj łącznie 100 lodowych wilków."
        ],

        rewardGold: [
            6700,
            15200,
            34200
        ],

        rewardExp: [
            10000,
            22600,
            50800
        ]
    }),

    {
        id: "kill_frozen_warriors_1",
        chainStage: 1,
        chainLength: 4,
        title: "Armia pod lodem",
        description:
            "Pokonaj 10 zamarzniętych wojowników.",

        targetEnemyName:
            "Zamarznięty wojownik",

        requiredLevel: 30,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 2750,
        rewardExp: 4100,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_frozen_warriors",

        title:
            "Armia pod lodem",

        targetEnemyName:
            "Zamarznięty wojownik",

        requiredLevel: 30,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 zamarzniętych wojowników.",
            "Pokonaj łącznie 50 zamarzniętych wojowników.",
            "Pokonaj łącznie 100 zamarzniętych wojowników."
        ],

        rewardGold: [
            8500,
            19300,
            43500
        ],

        rewardExp: [
            12700,
            28700,
            64500
        ]
    }),

    {
        id: "kill_frost_giants_1",
        chainStage: 1,
        chainLength: 4,
        title: "Olbrzymy północy",
        description:
            "Pokonaj 8 lodowych olbrzymów.",

        targetEnemyName:
            "Lodowy olbrzym",

        requiredLevel: 30,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 2880,
        rewardExp: 4200,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_frost_giants",

        title:
            "Olbrzymy północy",

        targetEnemyName:
            "Lodowy olbrzym",

        requiredLevel: 30,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 lodowych olbrzymów.",
            "Pokonaj łącznie 50 lodowych olbrzymów.",
            "Pokonaj łącznie 100 lodowych olbrzymów."
        ],

        rewardGold: [
            9200,
            20800,
            46800
        ],

        rewardExp: [
            13500,
            30400,
            68500
        ]
    }),

    {
        id: "kill_ice_elementals_1",
        chainStage: 1,
        chainLength: 4,
        title: "Serce lodu",
        description:
            "Pokonaj 8 żywiołaków lodu.",

        targetEnemyName:
            "Żywiołak lodu",

        requiredLevel: 30,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 3800,
        rewardExp: 5520,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_ice_elementals",

        title:
            "Serce lodu",

        targetEnemyName:
            "Żywiołak lodu",

        requiredLevel: 30,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 żywiołaków lodu.",
            "Pokonaj łącznie 50 żywiołaków lodu.",
            "Pokonaj łącznie 100 żywiołaków lodu."
        ],

        rewardGold: [
            12000,
            27000,
            61000
        ],

        rewardExp: [
            17500,
            39500,
            89000
        ]
    }),

    {
        id: "kill_frost_queen_1",
        chainStage: 1,
        chainLength: 3,
        title: "Upadek królowej",
        description:
            "Pokonaj Królową Mrozu.",

        targetEnemyName:
            "👑 Królowa Mrozu",

        requiredLevel: 30,
        requiredKills: 1,
        currentKills: 0,

        rewardGold: 8000,
        rewardExp: 11500,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_frost_queen",

        title:
            "Upadek królowej",

        targetEnemyName:
            "👑 Królowa Mrozu",

        requiredLevel: 30,

        requiredKills: [
            3,
            5
        ],

        descriptions: [
            "Pokonaj Królową Mrozu łącznie 3 razy.",
            "Pokonaj Królową Mrozu łącznie 5 razy."
        ],

        rewardGold: [
            26000,
            58000
        ],

        rewardExp: [
            38000,
            85000
        ]
    }),

    /* ========================================
       ZADANIA — WULKANICZNE PUSTKOWIE
    ======================================== */

    {
        id: "kill_ash_scorpions_1",
        chainStage: 1,
        chainLength: 4,
        title: "Pełzające w popiele",
        description:
            "Pokonaj 10 popielnych skorpionów.",

        targetEnemyName:
            "Popielny skorpion",

        requiredLevel: 45,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 6500,
        rewardExp: 9250,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_ash_scorpions",

        title:
            "Pełzające w popiele",

        targetEnemyName:
            "Popielny skorpion",

        requiredLevel: 45,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 popielnych skorpionów.",
            "Pokonaj łącznie 50 popielnych skorpionów.",
            "Pokonaj łącznie 100 popielnych skorpionów."
        ],

        rewardGold: [
            20000,
            45000,
            102000
        ],

        rewardExp: [
            28500,
            64500,
            145000
        ]
    }),

    {
        id: "kill_lava_hounds_1",
        chainStage: 1,
        chainLength: 4,
        title: "Ogary z głębin",
        description:
            "Pokonaj 10 ogarów lawy.",

        targetEnemyName:
            "Ogar lawy",

        requiredLevel: 45,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 8250,
        rewardExp: 11750,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_lava_hounds",

        title:
            "Ogary z głębin",

        targetEnemyName:
            "Ogar lawy",

        requiredLevel: 45,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 ogarów lawy.",
            "Pokonaj łącznie 50 ogarów lawy.",
            "Pokonaj łącznie 100 ogarów lawy."
        ],

        rewardGold: [
            25500,
            58000,
            131000
        ],

        rewardExp: [
            36500,
            82500,
            185000
        ]
    }),

    {
        id: "kill_charred_skeletons_1",
        chainStage: 1,
        chainLength: 4,
        title: "Kości w ogniu",
        description:
            "Pokonaj 10 zwęglonych szkieletów.",

        targetEnemyName:
            "Zwęglony szkielet",

        requiredLevel: 45,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 10500,
        rewardExp: 15000,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_charred_skeletons",

        title:
            "Kości w ogniu",

        targetEnemyName:
            "Zwęglony szkielet",

        requiredLevel: 45,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 zwęglonych szkieletów.",
            "Pokonaj łącznie 50 zwęglonych szkieletów.",
            "Pokonaj łącznie 100 zwęglonych szkieletów."
        ],

        rewardGold: [
            32500,
            74000,
            167000
        ],

        rewardExp: [
            46500,
            105000,
            236000
        ]
    }),

    {
        id: "kill_magma_golems_1",
        chainStage: 1,
        chainLength: 4,
        title: "Kamień i magma",
        description:
            "Pokonaj 8 magmowych golemów.",

        targetEnemyName:
            "Magmowy golem",

        requiredLevel: 45,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 11000,
        rewardExp: 15600,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_magma_golems",

        title:
            "Kamień i magma",

        targetEnemyName:
            "Magmowy golem",

        requiredLevel: 45,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 magmowych golemów.",
            "Pokonaj łącznie 50 magmowych golemów.",
            "Pokonaj łącznie 100 magmowych golemów."
        ],

        rewardGold: [
            35000,
            79000,
            178000
        ],

        rewardExp: [
            50000,
            112000,
            252000
        ]
    }),

    {
        id: "kill_fire_elementals_1",
        chainStage: 1,
        chainLength: 4,
        title: "Żywy płomień",
        description:
            "Pokonaj 8 żywiołaków ognia.",

        targetEnemyName:
            "Żywiołak ognia",

        requiredLevel: 45,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 14400,
        rewardExp: 20400,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_fire_elementals",

        title:
            "Żywy płomień",

        targetEnemyName:
            "Żywiołak ognia",

        requiredLevel: 45,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 żywiołaków ognia.",
            "Pokonaj łącznie 50 żywiołaków ognia.",
            "Pokonaj łącznie 100 żywiołaków ognia."
        ],

        rewardGold: [
            45000,
            102000,
            230000
        ],

        rewardExp: [
            64000,
            144000,
            324000
        ]
    }),

    {
        id: "kill_volcanic_dragon_1",
        chainStage: 1,
        chainLength: 3,
        title: "Ostatni lot smoka",
        description:
            "Pokonaj Pradawnego Smoka Wulkanu.",

        targetEnemyName:
            "🐉 Pradawny Smok Wulkanu",

        requiredLevel: 45,
        requiredKills: 1,
        currentKills: 0,

        rewardGold: 22000,
        rewardExp: 32000,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_volcanic_dragon",

        title:
            "Ostatni lot smoka",

        targetEnemyName:
            "🐉 Pradawny Smok Wulkanu",

        requiredLevel: 45,

        requiredKills: [
            3,
            5
        ],

        descriptions: [
            "Pokonaj Pradawnego Smoka Wulkanu łącznie 3 razy.",
            "Pokonaj Pradawnego Smoka Wulkanu łącznie 5 razy."
        ],

        rewardGold: [
            72000,
            162000
        ],

        rewardExp: [
            105000,
            236000
        ]
    }),

    {
        id: "kill_memory_devourers_1",
        chainStage: 1,
        chainLength: 4,
        title: "Żerujący na wspomnieniach",
        description:
            "Pokonaj 10 pożeraczy wspomnień.",

        targetEnemyName:
            "Pożeracz wspomnień",

        requiredLevel: 65,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 25250,
        rewardExp: 36000,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_memory_devourers",

        title:
            "Żerujący na wspomnieniach",

        targetEnemyName:
            "Pożeracz wspomnień",

        requiredLevel: 65,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 pożeraczy wspomnień.",
            "Pokonaj łącznie 50 pożeraczy wspomnień.",
            "Pokonaj łącznie 100 pożeraczy wspomnień."
        ],

        rewardGold: [
            78000,
            175000,
            397000
        ],

        rewardExp: [
            111000,
            251000,
            564250
        ]
    }),

    {
        id: "kill_dimension_weavers_1",
        chainStage: 1,
        chainLength: 4,
        title: "Przędza wymiarów",
        description:
            "Pokonaj 10 tkaczy wymiarów.",

        targetEnemyName:
            "Tkacz wymiarów",

        requiredLevel: 65,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 31500,
        rewardExp: 45000,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_dimension_weavers",

        title:
            "Przędza wymiarów",

        targetEnemyName:
            "Tkacz wymiarów",

        requiredLevel: 65,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 tkaczy wymiarów.",
            "Pokonaj łącznie 50 tkaczy wymiarów.",
            "Pokonaj łącznie 100 tkaczy wymiarów."
        ],

        rewardGold: [
            97750,
            222250,
            501750
        ],

        rewardExp: [
            139750,
            316000,
            708500
        ]
    }),

    {
        id: "kill_nameless_observers_1",
        chainStage: 1,
        chainLength: 4,
        title: "Spojrzenie z ciemności",
        description:
            "Pokonaj 10 bezimiennych obserwatorów.",

        targetEnemyName:
            "Bezimienny obserwator",

        requiredLevel: 65,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 38500,
        rewardExp: 55000,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_nameless_observers",

        title:
            "Spojrzenie z ciemności",

        targetEnemyName:
            "Bezimienny obserwator",

        requiredLevel: 65,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 bezimiennych obserwatorów.",
            "Pokonaj łącznie 50 bezimiennych obserwatorów.",
            "Pokonaj łącznie 100 bezimiennych obserwatorów."
        ],

        rewardGold: [
            119250,
            271250,
            612250
        ],

        rewardExp: [
            170500,
            385000,
            865250
        ]
    }),

    {
        id: "kill_void_heralds_1",
        chainStage: 1,
        chainLength: 4,
        title: "Echo Pustki",
        description:
            "Pokonaj 8 heroldów Pustki.",

        targetEnemyName:
            "Herold Pustki",

        requiredLevel: 65,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 37750,
        rewardExp: 53500,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_void_heralds",

        title:
            "Echo Pustki",

        targetEnemyName:
            "Herold Pustki",

        requiredLevel: 65,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 heroldów Pustki.",
            "Pokonaj łącznie 50 heroldów Pustki.",
            "Pokonaj łącznie 100 heroldów Pustki."
        ],

        rewardGold: [
            120250,
            271500,
            611500
        ],

        rewardExp: [
            171750,
            384750,
            865750
        ]
    }),

    {
        id: "kill_rift_architects_1",
        chainStage: 1,
        chainLength: 4,
        title: "Rozdarcie rzeczywistości",
        description:
            "Pokonaj 8 architektów Rozdarcia.",

        targetEnemyName:
            "Architekt Rozdarcia",

        requiredLevel: 65,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 47000,
        rewardExp: 66500,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_rift_architects",

        title:
            "Rozdarcie rzeczywistości",

        targetEnemyName:
            "Architekt Rozdarcia",

        requiredLevel: 65,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 architektów Rozdarcia.",
            "Pokonaj łącznie 50 architektów Rozdarcia.",
            "Pokonaj łącznie 100 architektów Rozdarcia."
        ],

        rewardGold: [
            146500,
            332000,
            748500
        ],

        rewardExp: [
            208250,
            468750,
            1054500
        ]
    }),

    {
        id: "kill_abyss_lord_1",
        chainStage: 1,
        chainLength: 3,
        title: "Kres Otchłani",
        description:
            "Pokonaj Władcę Otchłani.",

        targetEnemyName:
            "👑 Władca Otchłani",

        requiredLevel: 65,
        requiredKills: 1,
        currentKills: 0,

        rewardGold: 38250,
        rewardExp: 55500,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_abyss_lord",

        title:
            "Kres Otchłani",

        targetEnemyName:
            "👑 Władca Otchłani",

        requiredLevel: 65,

        requiredKills: [
            3,
            5
        ],

        descriptions: [
            "Pokonaj Władcę Otchłani łącznie 3 razy.",
            "Pokonaj Władcę Otchłani łącznie 5 razy."
        ],

        rewardGold: [
            124750,
            280500
        ],

        rewardExp: [
            181750,
            408500
        ]
    }),

    {
        id: "kill_drowned_guards_1",
        chainStage: 1,
        chainLength: 4,
        title: "Straż pod falami",
        description:
            "Pokonaj 10 topielców Królewskiej Gwardii.",

        targetEnemyName:
            "Topielec Królewskiej Gwardii",

        requiredLevel: 80,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 52250,
        rewardExp: 74500,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_drowned_guards",

        title:
            "Straż pod falami",

        targetEnemyName:
            "Topielec Królewskiej Gwardii",

        requiredLevel: 80,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 topielców Królewskiej Gwardii.",
            "Pokonaj łącznie 50 topielców Królewskiej Gwardii.",
            "Pokonaj łącznie 100 topielców Królewskiej Gwardii."
        ],

        rewardGold: [
            161000,
            362500,
            821500
        ],

        rewardExp: [
            229500,
            519500,
            1167750
        ]
    }),

    {
        id: "kill_deep_hunters_1",
        chainStage: 1,
        chainLength: 4,
        title: "Łowy w głębinie",
        description:
            "Pokonaj 10 głębinowych łowców.",

        targetEnemyName:
            "Głębinowy Łowca",

        requiredLevel: 80,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 63500,
        rewardExp: 90500,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_deep_hunters",

        title:
            "Łowy w głębinie",

        targetEnemyName:
            "Głębinowy Łowca",

        requiredLevel: 80,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 głębinowych łowców.",
            "Pokonaj łącznie 50 głębinowych łowców.",
            "Pokonaj łącznie 100 głębinowych łowców."
        ],

        rewardGold: [
            196500,
            446750,
            1009000
        ],

        rewardExp: [
            281250,
            635500,
            1425000
        ]
    }),

    {
        id: "kill_abyss_sirens_1",
        chainStage: 1,
        chainLength: 4,
        title: "Pieśń syren",
        description:
            "Pokonaj 10 syren Otchłani.",

        targetEnemyName:
            "Syrena Otchłani",

        requiredLevel: 80,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 77000,
        rewardExp: 110000,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_abyss_sirens",

        title:
            "Pieśń syren",

        targetEnemyName:
            "Syrena Otchłani",

        requiredLevel: 80,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 syren Otchłani.",
            "Pokonaj łącznie 50 syren Otchłani.",
            "Pokonaj łącznie 100 syren Otchłani."
        ],

        rewardGold: [
            238250,
            542750,
            1224750
        ],

        rewardExp: [
            341000,
            770000,
            1730750
        ]
    }),

    {
        id: "kill_coral_colossi_1",
        chainStage: 1,
        chainLength: 4,
        title: "Koralowa twierdza",
        description:
            "Pokonaj 8 koralowych kolosów.",

        targetEnemyName:
            "Koralowy Kolos",

        requiredLevel: 80,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 75000,
        rewardExp: 106500,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_coral_colossi",

        title:
            "Koralowa twierdza",

        targetEnemyName:
            "Koralowy Kolos",

        requiredLevel: 80,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 koralowych kolosów.",
            "Pokonaj łącznie 50 koralowych kolosów.",
            "Pokonaj łącznie 100 koralowych kolosów."
        ],

        rewardGold: [
            238750,
            539000,
            1214000
        ],

        rewardExp: [
            341000,
            764000,
            1718750
        ]
    }),

    {
        id: "kill_throne_priests_1",
        chainStage: 1,
        chainLength: 4,
        title: "Zatopiony tron",
        description:
            "Pokonaj 8 kapłanów Zatopionego Tronu.",

        targetEnemyName:
            "Kapłan Zatopionego Tronu",

        requiredLevel: 80,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 91000,
        rewardExp: 128750,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_throne_priests",

        title:
            "Zatopiony tron",

        targetEnemyName:
            "Kapłan Zatopionego Tronu",

        requiredLevel: 80,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 kapłanów Zatopionego Tronu.",
            "Pokonaj łącznie 50 kapłanów Zatopionego Tronu.",
            "Pokonaj łącznie 100 kapłanów Zatopionego Tronu."
        ],

        rewardGold: [
            284000,
            644000,
            1452250
        ],

        rewardExp: [
            404000,
            909250,
            2045750
        ]
    }),

    {
        id: "kill_crown_leviathan_1",
        chainStage: 1,
        chainLength: 3,
        title: "Gniew Lewiatana",
        description:
            "Pokonaj Lewiatana Korony.",

        targetEnemyName:
            "👑 Lewiatan Korony",

        requiredLevel: 80,
        requiredKills: 1,
        currentKills: 0,

        rewardGold: 50000,
        rewardExp: 72750,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_crown_leviathan",

        title:
            "Gniew Lewiatana",

        targetEnemyName:
            "👑 Lewiatan Korony",

        requiredLevel: 80,

        requiredKills: [
            3,
            5
        ],

        descriptions: [
            "Pokonaj Lewiatana Korony łącznie 3 razy.",
            "Pokonaj Lewiatana Korony łącznie 5 razy."
        ],

        rewardGold: [
            164000,
            368750
        ],

        rewardExp: [
            239000,
            537250
        ]
    }),

    {
        id: "kill_crystal_beetles_1",
        chainStage: 1,
        chainLength: 4,
        title: "Chrzęst kryształów",
        description:
            "Pokonaj 10 kryształowych żuków.",

        targetEnemyName:
            "Kryształowy żuk",

        requiredLevel: 100,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 107500,
        rewardExp: 153000,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_crystal_beetles",

        title:
            "Chrzęst kryształów",

        targetEnemyName:
            "Kryształowy żuk",

        requiredLevel: 100,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 kryształowych żuków.",
            "Pokonaj łącznie 50 kryształowych żuków.",
            "Pokonaj łącznie 100 kryształowych żuków."
        ],

        rewardGold: [
            331000,
            744250,
            1687250
        ],

        rewardExp: [
            471500,
            1066750,
            2398500
        ]
    }),

    {
        id: "kill_shardlings_1",
        chainStage: 1,
        chainLength: 4,
        title: "Odłamki w mroku",
        description:
            "Pokonaj 10 odpryskowców.",

        targetEnemyName:
            "Odpryskowiec",

        requiredLevel: 100,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 129500,
        rewardExp: 184500,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_shardlings",

        title:
            "Odłamki w mroku",

        targetEnemyName:
            "Odpryskowiec",

        requiredLevel: 100,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 odpryskowców.",
            "Pokonaj łącznie 50 odpryskowców.",
            "Pokonaj łącznie 100 odpryskowców."
        ],

        rewardGold: [
            400500,
            910750,
            2057000
        ],

        rewardExp: [
            573250,
            1295500,
            2905000
        ]
    }),

    {
        id: "kill_geode_breakers_1",
        chainStage: 1,
        chainLength: 4,
        title: "Pęknięte geody",
        description:
            "Pokonaj 10 łamaczy geod.",

        targetEnemyName:
            "Łamacz geod",

        requiredLevel: 100,
        requiredKills: 10,
        currentKills: 0,

        rewardGold: 158500,
        rewardExp: 226500,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_geode_breakers",

        title:
            "Pęknięte geody",

        targetEnemyName:
            "Łamacz geod",

        requiredLevel: 100,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 łamaczy geod.",
            "Pokonaj łącznie 50 łamaczy geod.",
            "Pokonaj łącznie 100 łamaczy geod."
        ],

        rewardGold: [
            490750,
            1117500,
            2521750
        ],

        rewardExp: [
            702250,
            1585500,
            3563500
        ]
    }),

    {
        id: "kill_prismatic_manticores_1",
        chainStage: 1,
        chainLength: 4,
        title: "Pryzmatyczny pazur",
        description:
            "Pokonaj 8 pryzmatycznych mantykorów.",

        targetEnemyName:
            "Pryzmatyczny mantykor",

        requiredLevel: 100,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 154250,
        rewardExp: 218750,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_prismatic_manticores",

        title:
            "Pryzmatyczny pazur",

        targetEnemyName:
            "Pryzmatyczny mantykor",

        requiredLevel: 100,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 pryzmatycznych mantykorów.",
            "Pokonaj łącznie 50 pryzmatycznych mantykorów.",
            "Pokonaj łącznie 100 pryzmatycznych mantykorów."
        ],

        rewardGold: [
            491000,
            1108000,
            2496500
        ],

        rewardExp: [
            701250,
            1570750,
            3534500
        ]
    }),

    {
        id: "kill_spire_guardians_1",
        chainStage: 1,
        chainLength: 4,
        title: "Kryształowa Iglica",
        description:
            "Pokonaj 8 strażników Kryształowej Iglicy.",

        targetEnemyName:
            "Strażnik Kryształowej Iglicy",

        requiredLevel: 100,
        requiredKills: 8,
        currentKills: 0,

        rewardGold: 189750,
        rewardExp: 268750,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_spire_guardians",

        title:
            "Kryształowa Iglica",

        targetEnemyName:
            "Strażnik Kryształowej Iglicy",

        requiredLevel: 100,

        requiredKills: [
            25,
            50,
            100
        ],

        descriptions: [
            "Pokonaj łącznie 25 strażników Kryształowej Iglicy.",
            "Pokonaj łącznie 50 strażników Kryształowej Iglicy.",
            "Pokonaj łącznie 100 strażników Kryształowej Iglicy."
        ],

        rewardGold: [
            593000,
            1344000,
            3030750
        ],

        rewardExp: [
            843250,
            1897500,
            4269250
        ]
    }),

    {
        id: "kill_mountain_heart_1",
        chainStage: 1,
        chainLength: 3,
        title: "Bicie serca góry",
        description:
            "Pokonaj Serce Góry.",

        targetEnemyName:
            "💠 Serce Góry",

        requiredLevel: 100,
        requiredKills: 1,
        currentKills: 0,

        rewardGold: 158750,
        rewardExp: 231000,

        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix:
            "kill_mountain_heart",

        title:
            "Bicie serca góry",

        targetEnemyName:
            "💠 Serce Góry",

        requiredLevel: 100,

        requiredKills: [
            3,
            5
        ],

        descriptions: [
            "Pokonaj Serce Góry łącznie 3 razy.",
            "Pokonaj Serce Góry łącznie 5 razy."
        ],

        rewardGold: [
            519500,
            1168750
        ],

        rewardExp: [
            757500,
            1702750
        ]
    }),


];