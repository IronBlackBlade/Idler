const craftingBalance = {
  experience: {
    base: 300,
    linearPerLevel: 110,
    power: 1.65,
    powerMultiplier: 28,
  },

  queue: {
    maxSize: 10,
  },

  timing: {
    defaultDurationSeconds: 10,
  },
  equipmentUpgrade: {
    statRanges: {
      1: {
        main: [2, 4],
        random: [1, 2],
        jewelryRandom: [1, 2],
      },

      5: {
        main: [2, 4],
        random: [1, 2],
        jewelryRandom: [1, 2],
      },

      10: {
        main: [4, 7],
        random: [2, 4],
        jewelryRandom: [2, 3],
      },

      20: {
        main: [7, 11],
        random: [3, 6],
        jewelryRandom: [3, 5],
      },

      25: {
        main: [9, 13],
        random: [4, 7],
        jewelryRandom: [3, 6],
      },

      30: {
        main: [11, 16],
        random: [5, 9],
        jewelryRandom: [4, 7],
      },

      40: {
        main: [16, 22],
        random: [7, 13],
        jewelryRandom: [6, 9],
      },

      50: {
        main: [22, 30],
        random: [9, 17],
        jewelryRandom: [8, 12],
      },
    },
  },
  upgradePresentation: {
    1: {
      rank: "basic",
      rankLabel: "Podstawowe ulepszenie",
    },

    10: {
      rank: "improved",
      rankLabel: "Ulepszone uzbrojenie",
    },

    20: {
      rank: "advanced",
      rankLabel: "Zaawansowane ulepszenie",
    },

    40: {
      rank: "expert",
      rankLabel: "Eksperckie ulepszenie",
    },

    50: {
      rank: "master",
      rankLabel: "Mistrzowskie ulepszenie",
    },
  },
};
