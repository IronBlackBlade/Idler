const gardenQuests = [
    {
        id: "garden_plant_1",
        activityId: "garden",
        progressSource: "totalPlanted",
        chainStage: 1,
        chainLength: 4,
        title: "Pierwsze zasiewy",
        description: "Zasadź 5 roślin.",
        requiredLevel: 1,
        requiredKills: 5,
        currentKills: 0,
        rewardGold: 250,
        rewardExp: 100,
        rewardActivityExp: 40,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix: "garden_plant",
        activityId: "garden",
        progressSource: "totalPlanted",
        title: "Pierwsze zasiewy",
        requiredLevel: 1,
        requiredKills: [25, 100, 300],
        descriptions: [
            "Zasadź łącznie 25 roślin.",
            "Zasadź łącznie 100 roślin.",
            "Zasadź łącznie 300 roślin."
        ],
        rewardGold: [750, 2500, 7500],
        rewardExp: [300, 1000, 3000],
        rewardActivityExp: [100, 300, 800]
    }),

    {
        id: "garden_harvest_1",
        activityId: "garden",
        progressSource: "totalHarvests",
        chainStage: 1,
        chainLength: 4,
        title: "Czas zbiorów",
        description: "Zbierz rośliny z 5 grządek.",
        requiredLevel: 1,
        requiredKills: 5,
        currentKills: 0,
        rewardGold: 300,
        rewardExp: 120,
        rewardActivityExp: 50,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix: "garden_harvest",
        activityId: "garden",
        progressSource: "totalHarvests",
        title: "Czas zbiorów",
        requiredLevel: 1,
        requiredKills: [25, 100, 300],
        descriptions: [
            "Zbierz rośliny z 25 grządek.",
            "Zbierz rośliny ze 100 grządek.",
            "Zbierz rośliny z 300 grządek."
        ],
        rewardGold: [900, 3000, 9000],
        rewardExp: [350, 1200, 3500],
        rewardActivityExp: [125, 350, 900]
    }),

    {
        id: "garden_level_1",
        activityId: "garden",
        progressSource: "gardenLevel",
        chainStage: 1,
        chainLength: 4,
        title: "Doświadczony ogrodnik",
        description: "Osiągnij 5. poziom Ogrodnictwa.",
        requiredLevel: 1,
        requiredKills: 5,
        currentKills: 0,
        rewardGold: 500,
        rewardExp: 200,
        rewardActivityExp: 100,
        completed: false,
        claimed: false
    },

    ...createQuestFollowUpStages({
        idPrefix: "garden_level",
        activityId: "garden",
        progressSource: "gardenLevel",
        title: "Doświadczony ogrodnik",
        requiredLevel: 1,
        requiredKills: [10, 20, 30],
        descriptions: [
            "Osiągnij 10. poziom Ogrodnictwa.",
            "Osiągnij 20. poziom Ogrodnictwa.",
            "Osiągnij 30. poziom Ogrodnictwa."
        ],
        rewardGold: [1500, 5000, 12000],
        rewardExp: [600, 2000, 5000],
        rewardActivityExp: [250, 700, 1500]
    })
];