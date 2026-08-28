
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
                        name: "🛡️ Pancerze"
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

let shopItems = [];

function rebuildShopItems() {

    const generatedItems =
        window.idlerGeneratedItems || {};

    const merchantPrices =
        window.idlerMerchantPrices || {};

    const rebuiltShopItems = [];

    // ==================================================
    // 1. WYPOSAŻENIE KUPCA — Excel / generator
    // ==================================================

    Object.entries(merchantPrices).forEach(
        ([itemId, price]) => {

            const item =
                generatedItems[itemId] ||
                (
                    typeof items !== "undefined"
                        ? items[itemId]
                        : null
                );

            if (!item) {
                console.warn(
                    "Brak itemu kupca:",
                    itemId
                );

                return;
            }

            let category = "equipment";
            let subcategory = null;
            let type = null;

            // ------------------------------
            // BROŃ
            // ------------------------------

            if (item.type === "weapon") {

                subcategory = "weapon";

                if (
                    item.weaponClass ===
                    "slashing"
                ) {
                    type = "sword";
                }
                else if (
                    item.weaponClass ===
                    "blunt"
                ) {
                    type = "blunt";
                }
                else if (
                    item.weaponClass ===
                    "bow"
                ) {
                    type = "bow";
                }
                else if (
                    item.weaponClass ===
                    "crossbow"
                ) {
                    type = "crossbow";
                }
                else if (
                    item.weaponClass ===
                    "wand"
                ) {
                    type = "wand";
                }
                else if (
                    item.weaponClass ===
                    "staff"
                ) {
                    type = "staff";
                }
            }

            // ------------------------------
            // PANCERZ
            // ------------------------------

            else if (
                [
                    "shield",
                    "helmet",
                    "armor",
                    "pants",
                    "boots",
                    "gloves"
                ].includes(item.type)
            ) {

                subcategory = "armor";
                type = item.type;
            }

            // ------------------------------
            // BIŻUTERIA
            // ------------------------------

            else if (
                [
                    "ring",
                    "amulet",
                    "talisman"
                ].includes(item.type)
            ) {

                category = "equipment";
                subcategory = "jewelry";
                type = item.type;
            }
            // Jeżeli generator podał item,
            // którego sklep jeszcze nie rozpoznaje,
            // pomijamy go zamiast wrzucać
            // do złej kategorii.

            if (
                !subcategory ||
                !type
            ) {

                console.warn(
                    "Nie można ustalić kategorii sklepu:",
                    itemId
                );

                return;
            }

            rebuiltShopItems.push({
                itemId,
                price: Number(price) || 0,
                category,
                subcategory,
                type
            });
        }
    );


    // ==================================================
    // 2. NARZĘDZIA PROFESJI
    //    professionTools.js
    // ==================================================

    if (
        typeof professionToolItems !==
        "undefined"
    ) {

        Object.values(
            professionToolItems
        ).forEach(item => {

            if (
                !item ||
                item.type !==
                "profession_tool"
            ) {
                return;
            }

            const price =
                Number(item.shopPrice);

            if (
                !Number.isFinite(price) ||
                price <= 0
            ) {
                console.warn(
                    "Brak prawidłowej ceny narzędzia:",
                    item.id
                );

                return;
            }

            rebuiltShopItems.push({
                itemId: item.id,
                price,
                category: "profession",
                subcategory:
                    "profession_tools",
                type: "profession_tool",

                // Zachowujemy dodatkowe dane
                // na wypadek przyszłych potrzeb.
                toolType: item.toolType,
                toolTier: item.toolTier
            });
        });
    }


    // ==================================================
    // 3. PRZYNĘTY WĘDKARSKIE
    //
    // fishingData.js nie posiada obecnie
    // pola ceny sklepowej.
    //
    // Dlatego NIE nadajemy im ceny na siłę.
    // ==================================================

    if (
        typeof fishingBaits !==
        "undefined"
    ) {

        fishingBaits.forEach(
            bait => {

                const item =
                    typeof items !== "undefined"
                        ? items[bait.itemId]
                        : null;

                if (!item) {
                    return;
                }

                if (
                    typeof bait.shopPrice !==
                    "number"
                ) {

                    console.warn(
                        "Przynęta nie ma shopPrice:",
                        bait.itemId
                    );

                    return;
                }

                rebuiltShopItems.push({
                    itemId: bait.itemId,
                    price: bait.shopPrice,
                    category: "profession",
                    subcategory:
                        "fishing_supplies",
                    type: "fishing_bait"
                });
            }
        );
    }


    // ==================================================
    // 4. USUWANIE DUPLIKATÓW
    // ==================================================

    const uniqueItems =
        new Map();

    rebuiltShopItems.forEach(
        shopItem => {

            uniqueItems.set(
                shopItem.itemId,
                shopItem
            );
        }
    );


    shopItems =
        Array.from(
            uniqueItems.values()
        );

}

function getShopItemCategoryDataFromItem(item) {

    if (item.type === "weapon") {

        return {
            category: "equipment",
            subcategory: "weapon",
            type:
                item.weaponClass === "slashing"
                    ? "sword"
                    : item.weaponClass === "blunt"
                        ? "blunt"
                        : item.weaponClass === "bow"
                            ? "bow"
                            : item.weaponClass === "crossbow"
                                ? "crossbow"
                                : item.weaponClass === "wand"
                                    ? "wand"
                                    : item.weaponClass === "staff"
                                        ? "staff"
                                        : null
        };
    }

    if (
        [
            "helmet",
            "armor",
            "pants",
            "boots",
            "gloves",
            "shield"
        ].includes(item.type)
    ) {
        return {
            category: "equipment",
            subcategory: "armor",
            type: item.type
        };
    }

    if (
        [
            "ring",
            "amulet",
            "talisman"
        ].includes(item.type)
    ) {
        return {
            category: "equipment",
            subcategory: "jewelry",
            type: item.type
        };
    }

    return null;
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
