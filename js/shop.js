const shopItems = [
    { itemId: "old_sword", price: 100, category: "weapon" },
    { itemId: "iron_sword", price: 300, category: "weapon" },
    { itemId: "steel_sword", price: 900, category: "weapon" },
    { itemId: "guard_sword", price: 1800, category: "weapon" },
    { itemId: "knight_sword", price: 5400, category: "weapon" },
    { itemId: "captain_sword", price: 10800, category: "weapon" },
    { itemId: "master_sword", price: 21600, category: "weapon" },

    { itemId: "club", price: 100, category: "blunt" },
    { itemId: "kobold_mace", price: 280, category: "blunt" },
    { itemId: "battle_club", price: 850, category: "blunt" },
    { itemId: "iron_club", price: 1600, category: "blunt" },
    { itemId: "war_hammer", price: 5000, category: "blunt" },
    { itemId: "mace", price: 10000, category: "blunt" },
    { itemId: "heavy_war_hammer", price: 21000, category: "blunt" },


    // BROŃ DYSTANSOWA

    { itemId: "old_bow", price: 100, category: "bow" },
    { itemId: "hunter_bow", price: 280, category: "bow" },
    { itemId: "long_bow", price: 450, category: "bow" },
    { itemId: "oak_bow", price: 1500, category: "bow" },
    { itemId: "ranger_bow", price: 5500, category: "bow" },
    { itemId: "war_bow", price: 10500, category: "bow" },
    { itemId: "master_bow", price: 21000, category: "bow" },

    { itemId: "simple_crossbow", price: 120, category: "crossbow" },
    { itemId: "light_crossbow", price: 175, category: "crossbow" },
    { itemId: "hunting_crossbow", price: 550, category: "crossbow" },
    { itemId: "steel_crossbow", price: 1750, category: "crossbow" },
    { itemId: "battle_crossbow", price: 5500, category: "crossbow" },
    { itemId: "heavy_crossbow", price: 11000, category: "crossbow" },
    { itemId: "master_crossbow", price: 22000, category: "crossbow" },


    // BROŃ MAGICZNA

    { itemId: "wooden_wand", price: 100, category: "wand" },
    { itemId: "simple_wand", price: 300, category: "wand" },
    { itemId: "apprentice_wand", price: 900, category: "wand" },
    { itemId: "arcane_wand", price: 2100, category: "wand" },
    { itemId: "magic_wand", price: 6000, category: "wand" },
    { itemId: "master_wand", price: 12000, category: "wand" },
    { itemId: "archmaster_wand", price: 24000, category: "wand" },

    { itemId: "simple_staff", price: 120, category: "staff" },
    { itemId: "apprentice_staff", price: 250, category: "staff" },
    { itemId: "adept_staff", price: 850, category: "staff" },
    { itemId: "battle_staff", price: 2500, category: "staff" },
    { itemId: "mage_staff", price: 6000, category: "staff" },
    { itemId: "heavy_battle_staff", price: 12000, category: "staff" },
    { itemId: "master_staff", price: 24000, category: "staff" },

    { itemId: "wooden_shield", price: 80, category: "shield" },
    { itemId: "iron_shield", price: 300, category: "shield" },
    { itemId: "steel_shield", price: 950, category: "shield" },
    { itemId: "knight_shield", price: 3800, category: "shield" },
    { itemId: "master_shield", price: 14000, category: "shield" },

    { itemId: "leather_helmet", price: 60, category: "helmet" },
    { itemId: "iron_helmet", price: 260, category: "helmet" },
    { itemId: "steel_helmet", price: 800, category: "helmet" },
    { itemId: "knight_helmet", price: 3000, category: "helmet" },
    { itemId: "master_helmet", price: 11000, category: "helmet" },

    { itemId: "leather_armor", price: 140, category: "armor" },
    { itemId: "iron_armor", price: 650, category: "armor" },
    { itemId: "steel_armor", price: 1800, category: "armor" },
    { itemId: "knight_armor", price: 7000, category: "armor" },
    { itemId: "master_armor", price: 26000, category: "armor" },

    { itemId: "leather_pants", price: 90, category: "pants" },
    { itemId: "iron_pants", price: 360, category: "pants" },
    { itemId: "steel_pants", price: 1200, category: "pants" },
    { itemId: "knight_pants", price: 4600, category: "pants" },
    { itemId: "master_pants", price: 17000, category: "pants" },

    { itemId: "old_boots", price: 60, category: "boots" },
    { itemId: "iron_boots", price: 320, category: "boots" },
    { itemId: "steel_boots", price: 1050, category: "boots" },
    { itemId: "knight_boots", price: 4200, category: "boots" },
    { itemId: "master_boots", price: 15500, category: "boots" },

    { itemId: "leather_gloves", price: 70, category: "gloves" },
    { itemId: "iron_gloves", price: 340, category: "gloves" },
    { itemId: "steel_gloves", price: 1100, category: "gloves" },
    { itemId: "knight_gloves", price: 4400, category: "gloves" },
    { itemId: "master_gloves", price: 16000, category: "gloves" },

    { itemId: "simple_ring", price: 120, category: "ring" },
    { itemId: "lucky_ring", price: 180, category: "ring" },
    { itemId: "iron_ring", price: 450, category: "ring" },
    { itemId: "steel_ring", price: 1500, category: "ring" },
    { itemId: "knight_ring", price: 6200, category: "ring" },
    { itemId: "master_ring", price: 23000, category: "ring" },

    { itemId: "simple_amulet", price: 140, category: "amulet" },
    { itemId: "iron_amulet", price: 500, category: "amulet" },
    { itemId: "steel_amulet", price: 1600, category: "amulet" },
    { itemId: "knight_amulet", price: 6500, category: "amulet" },
    { itemId: "master_amulet", price: 24000, category: "amulet" },

    { itemId: "simple_talisman", price: 160, category: "talisman" },
    { itemId: "iron_talisman", price: 600, category: "talisman" },
    { itemId: "steel_talisman", price: 1900, category: "talisman" },
    { itemId: "knight_talisman", price: 7200, category: "talisman" },
    { itemId: "master_talisman", price: 27000, category: "talisman" },
    // NARZĘDZIA PROFESJI — 6 TYPÓW × 5 RANG

    ...Object.values(
        professionToolItems
    )
        .filter(item => {
            return item.toolTier === 1;
        })
        .map(item => {
            return {
                itemId: item.id,
                price: item.shopPrice,
                category: "profession",
                subcategory: "profession_tools"
            };
        }),
    {
        itemId: "worm_bait", price: 8,
        category: "profession",
        subcategory: "fishing_supplies"
    },
    {
        itemId: "royal_grub", price: 30,
        category: "profession",
        subcategory: "fishing_supplies"
    },
    {
        itemId: "magnetic_lure", price: 80,
        category: "profession",
        subcategory: "fishing_supplies"
    },
];

const shopCategories = [

    {
        id: "equipment",
        name: "⚔️ Wyposażenie",

        subcategories: [

            {
                id: "weapon",
                name: "🗡️ Broń",

                types: [
                    {
                        id: "sword",
                        name: "⚔️ Miecze"
                    },
                    {
                        id: "blunt",
                        name: "🔨 Obuchowa"
                    },
                    {
                        id: "bow",
                        name: "🏹 Łuki"
                    },
                    {
                        id: "crossbow",
                        name: "🏹 Kusze"
                    },
                    {
                        id: "wand",
                        name: "🪄 Różdżki"
                    },
                    {
                        id: "staff",
                        name: "🔮 Kostury"
                    }
                ]
            },


            {
                id: "armor",
                name: "🛡️ Pancerz",

                types: [
                    {
                        id: "helmet",
                        name: "⛑️ Hełmy"
                    },
                    {
                        id: "armor",
                        name: "🛡️ Zbroje"
                    },
                    {
                        id: "pants",
                        name: "👖 Spodnie"
                    },
                    {
                        id: "boots",
                        name: "🥾 Buty"
                    },
                    {
                        id: "gloves",
                        name: "🧤 Rękawice"
                    },
                    {
                        id: "shield",
                        name: "🛡️ Tarcze"
                    }
                ]
            },


            {
                id: "jewelry",
                name: "💍 Biżuteria",

                types: [
                    {
                        id: "ring",
                        name: "💍 Pierścienie"
                    },
                    {
                        id: "amulet",
                        name: "📿 Amulety"
                    },
                    {
                        id: "talisman",
                        name: "🔮 Talizmany"
                    }
                ]
            }

        ]
    },


    {
        id: "profession",
        name: "🧰 Profesje",

        subcategories: [
            {
                id: "profession_tools",
                name: "🛠️ Narzędzia"
            },
            {
                id: "fishing_supplies",
                name: "🎣 Zaopatrzenie"
            }
        ]
    }

];


const shopSubcategoryMap = {

    // BROŃ
    weapon: {
        category: "equipment",
        subcategory: "weapon"
    },

    blunt: {
        category: "equipment",
        subcategory: "weapon"
    },

    bow: {
        category: "equipment",
        subcategory: "weapon"
    },

    crossbow: {
        category: "equipment",
        subcategory: "weapon"
    },

    wand: {
        category: "equipment",
        subcategory: "weapon"
    },

    staff: {
        category: "equipment",
        subcategory: "weapon"
    },


    // PANCERZ
    shield: {
        category: "equipment",
        subcategory: "armor"
    },

    helmet: {
        category: "equipment",
        subcategory: "armor"
    },

    armor: {
        category: "equipment",
        subcategory: "armor"
    },

    pants: {
        category: "equipment",
        subcategory: "armor"
    },

    boots: {
        category: "equipment",
        subcategory: "armor"
    },

    gloves: {
        category: "equipment",
        subcategory: "armor"
    },


    // BIŻUTERIA
    ring: {
        category: "equipment",
        subcategory: "jewelry"
    },

    amulet: {
        category: "equipment",
        subcategory: "jewelry"
    },

    talisman: {
        category: "equipment",
        subcategory: "jewelry"
    },


    // PROFESJE
    profession_tools: {
        category: "profession",
        subcategory: "profession_tools"
    },

    fishing_supplies: {
        category: "profession",
        subcategory: "fishing_supplies"
    }

};

function getShopItemCategoryData(
    shopItem
) {

    if (
        shopItem.type
    ) {

        return {
            category: shopItem.category,
            subcategory: shopItem.subcategory,
            type: shopItem.type
        };

    }

    if (
        shopItem.subcategory
    ) {

        return {
            category: shopItem.category,
            subcategory: shopItem.subcategory,
            type:
                shopItem.category === "equipment"
                    ? getShopItemType(
                        shopItem.itemId
                    )
                    : null
        };

    }

    const shopTypeMap = {

        weapon: {

            sword: "sword",
            blunt: "blunt",
            bow: "bow",
            crossbow: "crossbow",
            wand: "wand",
            staff: "staff"

        }

    };

    const oldCategory =
        shopItem.category;

    if (
        shopItem.category === "profession"
    ) {

        if (
            shopItem.toolType
        ) {

            return {
                category: "profession",
                subcategory: "profession_tools"
            };

        }


        if (
            shopItem.itemId.includes(
                "bait"
            ) ||
            shopItem.itemId.includes(
                "lure"
            )
        ) {

            return {
                category: "profession",
                subcategory: "fishing_supplies"
            };

        }

    }


    if (
        shopSubcategoryMap[oldCategory]
    ) {

        const mappedCategory =
            shopSubcategoryMap[
            oldCategory
            ];

        let itemType = null;


        if (
            mappedCategory.category === "equipment"
        ) {

            if (
                mappedCategory.subcategory === "weapon"
            ) {

                itemType =
                    getShopItemType(
                        shopItem.itemId
                    );

            }
            else if (
                mappedCategory.subcategory === "jewelry"
            ) {

                itemType =
                    oldCategory;

            }

            else if (
                mappedCategory.subcategory === "armor"
            ) {

                itemType =
                    oldCategory;

            }

        }


        return {
            ...mappedCategory,
            type: itemType
        };

    }


    return {
        category: "equipment",
        subcategory: "weapon",
        type: getShopItemType(
            shopItem.itemId
        )
    };

}

function getShopItemType(itemId) {

    if (
        itemId.includes("sword")
    ) {
        return "sword";
    }


    if (
        itemId.includes("crossbow")
    ) {
        return "crossbow";
    }


    if (
        itemId.includes("bow")
    ) {
        return "bow";
    }


    if (
        itemId.includes("club") ||
        itemId.includes("mace") ||
        itemId.includes("hammer")
    ) {
        return "blunt";
    }


    if (
        itemId.includes("wand")
    ) {
        return "wand";
    }


    if (
        itemId.includes("staff")
    ) {
        return "staff";
    }

    if (
        itemId.includes("helmet")
    ) {
        return "helmet";
    }


    if (
        itemId.includes("armor")
    ) {
        return "armor";
    }


    if (
        itemId.includes("pants")
    ) {
        return "pants";
    }


    if (
        itemId.includes("boots")
    ) {
        return "boots";
    }


    if (
        itemId.includes("gloves")
    ) {
        return "gloves";
    }


    if (
        itemId.includes("shield")
    ) {
        return "shield";
    }
    return null;
}

function getFinalShopItemPrice(
    basePrice
) {
    const safeBasePrice =
        Math.max(
            0,
            Number(basePrice) || 0
        );

    /*
     * Gdy funkcje Handlu są już dostępne,
     * korzystamy ze zniżki z drzewka.
     */
    if (
        typeof getFinalTradeBuyPrice ===
        "function"
    ) {
        return getFinalTradeBuyPrice(
            safeBasePrice
        );
    }

    /*
     * Zabezpieczenie dla sytuacji,
     * gdy skills.js nie został jeszcze
     * wczytany albo funkcja nie istnieje.
     */
    return safeBasePrice;
}

function applyMerchantPurchaseRefund(
    paidGold
) {
    const safePaidGold =
        Math.max(
            0,
            Math.floor(
                Number(paidGold) || 0
            )
        );

    if (safePaidGold <= 0) {
        return 0;
    }

    const refundChance =
        typeof getMerchantRefundChance ===
            "function"
            ? getMerchantRefundChance()
            : 0;

    const refundTriggered =
        typeof rollTradeChance ===
            "function"
            ? rollTradeChance(
                refundChance
            )
            : false;

    if (!refundTriggered) {
        return 0;
    }

    const purchaseCapstoneActive =
        typeof isTradeCapstoneSelected ===
        "function" &&
        isTradeCapstoneSelected(
            "trade_purchase_capstone"
        );

    const refundMultiplier =
        purchaseCapstoneActive
            ? 1
            : 0.5;

    const refundGold =
        Math.floor(
            safePaidGold *
            refundMultiplier
        );

    if (refundGold <= 0) {
        return 0;
    }

    player.gold +=
        refundGold;

    if (
        typeof addSystemLog ===
        "function"
    ) {
        addSystemLog(
            (
                purchaseCapstoneActive
                    ? "👑 Magnat zakupów: odzyskano pełne "
                    : "🛒 Zwrot kupiecki: odzyskano "
            ) +
            refundGold +
            " złota.",
            "purchase"
        );
    }

    if (
        typeof showNotification ===
        "function"
    ) {
        showNotification(
            (
                purchaseCapstoneActive
                    ? "Magnat zakupów: pełny zwrot +"
                    : "Zwrot kupiecki: +"
            ) +
            refundGold +
            " złota!",
            "success"
        );
    }

    return refundGold;
}

function getShopItemRequiredLevel(
    item
) {
    if (
        item?.type ===
        "profession_tool"
    ) {
        return Math.max(
            1,
            Number(
                item.requiredProfessionLevel
            ) || 1
        );
    }

    return Math.max(
        1,
        Number(
            item?.requiredLevel
        ) || 1
    );
}

function getShopItemCurrentLevel(
    item
) {
    if (
        item?.type !==
        "profession_tool"
    ) {
        return Math.max(
            1,
            Number(player.level) || 1
        );
    }

    const professionStateByToolType = {
        pickaxe: "mining",
        sickle: "herbalism",
        fishingRod: "fishing",
        alchemyKit: "alchemy",
        cookingTools: "cooking",
        craftingHammer: "crafting"
    };

    const professionState =
        professionStateByToolType[
        item.toolType
        ];

    return Math.max(
        1,
        Number(
            player[
                professionState
            ]?.level
        ) || 1
    );
}

function buyItem(itemId, price) {
    const item = items[itemId];
    const finalPrice =
        getFinalShopItemPrice(
            price
        );

    if (!item) {
        console.warn("Item not found:", itemId);
        return;
    }

    /*
     * Sam zakup nie wymaga poziomu.
     * Przedmiot może być materiałem
     * potrzebnym do rzemiosła.
     */

    if (
        player.gold <
        finalPrice
    ) {
        showNotification(
            `Nie masz wystarczająco złota. Potrzebujesz ${finalPrice} 💰.`,
            "error"
        );

        if (typeof addCombatLog === "function") {
            addCombatLog("❌ Nie masz wystarczająco złota.");
        }

        return;
    }

    player.gold -=
        finalPrice;

    addItemToInventory(
        itemId
    );

    const refundedGold =
        applyMerchantPurchaseRefund(
            finalPrice
        );

    if (typeof addSystemLog === "function") {
        addSystemLog(
            "🛒 Kupiono: " +
            item.name +
            " za " +
            finalPrice +
            " złota.",
            "purchase"
        );
    }

    showNotification(
        `Kupiono: ${item.name}`,
        "success"
    );

    if (typeof addCombatLog === "function") {
        addCombatLog("🛒 Kupiono: " + item.name + ".");
    }

    saveGame();
    render();

    if (
        typeof refreshShopView ===
        "function"
    ) {
        refreshShopView();
    }

}

function buyItemQuantity(
    itemId,
    unitPrice,
    quantity
) {
    const item = items[itemId];
    const safeQuantity = Math.max(
        1,
        Math.min(
            99999,
            Math.floor(
                Number(quantity) || 1
            )
        )
    );
    const finalUnitPrice =
        typeof getFinalTradeBulkBuyPrice ===
            "function"
            ? getFinalTradeBulkBuyPrice(
                unitPrice,
                safeQuantity
            )
            : getFinalShopItemPrice(
                unitPrice
            );

    const totalPrice =
        finalUnitPrice *
        safeQuantity;

    if (!item) {
        return;
    }

    if (player.gold < totalPrice) {
        showNotification(
            "Nie masz wystarczająco złota. Potrzebujesz " +
            totalPrice +
            " 💰.",
            "error"
        );
        return;
    }

    player.gold -=
        totalPrice;

    addItemToInventory(
        itemId,
        safeQuantity
    );

    const refundedGold =
        applyMerchantPurchaseRefund(
            totalPrice
        );

    if (typeof addSystemLog === "function") {
        addSystemLog(
            "🛒 Kupiono: " +
            item.name +
            " ×" +
            safeQuantity +
            " za " +
            totalPrice +
            " złota.",
            "purchase"
        );
    }

    showNotification(
        "Kupiono: " +
        item.name +
        " ×" +
        safeQuantity,
        "success"
    );
    saveGame();
    render();

    if (
        typeof refreshShopView ===
        "function"
    ) {
        refreshShopView();
    }
}

function buyAndEquipItem(
    itemId,
    price,
    requestedSlot = null
) {
    const item =
        items[itemId];

    if (!item) {
        console.warn(
            "Nie znaleziono przedmiotu:",
            itemId
        );

        return;
    }

    const requiredLevel =
        getShopItemRequiredLevel(
            item
        );

    const currentLevel =
        getShopItemCurrentLevel(
            item
        );

    if (
        currentLevel <
        requiredLevel
    ) {
        const levelTypeText =
            item.type ===
                "profession_tool"
                ? "poziomu profesji "
                : "poziomu ";

        showNotification(
            "Ten przedmiot wymaga " +
            levelTypeText +
            requiredLevel +
            ".",
            "error"
        );

        return;
    }

    const safePrice =
        getFinalShopItemPrice(
            price
        );

    if (
        player.gold <
        safePrice
    ) {
        showNotification(
            "Nie masz wystarczająco złota. " +
            "Potrzebujesz " +
            safePrice +
            " 💰.",
            "error"
        );

        return;
    }

    /*
     * Sprawdzamy, czy przekazany slot
     * naprawdę pasuje do przedmiotu.
     */
    let targetSlot =
        requestedSlot || null;

    if (
        targetSlot &&
        typeof canEquipItemInSlot ===
        "function" &&
        !canEquipItemInSlot(
            item,
            targetSlot
        )
    ) {
        targetSlot = null;
    }

    player.gold -=
        safePrice;

    addItemToInventory(
        itemId,
        1
    );

    const refundedGold =
        applyMerchantPurchaseRefund(
            safePrice
        );
    if (
        typeof addSystemLog ===
        "function"
    ) {
        addSystemLog(
            "🛒 Kupiono i założono: " +
            item.name +
            " za " +
            safePrice +
            " złota.",
            "purchase"
        );
    }

    if (
        typeof showNotification ===
        "function"
    ) {
        showNotification(
            "Kupiono i założono: " +
            item.name +
            ".",
            "success"
        );
    }

    /*
     * Przedmiot został chwilę wcześniej
     * dodany do plecaka, więc istniejąca
     * funkcja equipItem może go założyć.
     */
    if (
        item.type ===
        "profession_tool" &&
        typeof equipProfessionTool ===
        "function"
    ) {
        equipProfessionTool(
            itemId
        );
    } else if (
        typeof equipItem ===
        "function"
    ) {
        equipItem(
            itemId,
            targetSlot
        );
    } else {
        saveGame();
        render();
    }

    if (
        typeof refreshShopView ===
        "function"
    ) {
        refreshShopView();
    }
    if (
        itemId.includes("ring")
    ) {
        return "ring";
    }


    if (
        itemId.includes("amulet")
    ) {
        return "amulet";
    }


    if (
        itemId.includes("talisman")
    ) {
        return "talisman";
    }
}
