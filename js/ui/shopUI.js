const savedShopCategory =
    localStorage.getItem(
        "idler_shop_category"
    );

let currentShopCategory =
    savedShopCategory || null;

const savedShopSubcategory =
    localStorage.getItem(
        "idler_shop_subcategory"
    );

let currentShopSubcategory =
    savedShopSubcategory || null;



const savedShopType =
    localStorage.getItem(
        "idler_shop_type"
    );

let currentShopType =
    savedShopType || null;

function setShopCategory(
    categoryId
) {
    currentShopCategory =
        categoryId;

    currentShopType =
        null;

    localStorage.removeItem(
        "idler_shop_type"
    );


    const selectedCategory =
        shopCategories.find(
            category =>
                category.id === categoryId
        );


    if (
        selectedCategory &&
        selectedCategory.subcategories &&
        selectedCategory.subcategories.length > 0
    ) {

        currentShopSubcategory =
            selectedCategory.subcategories[0].id;


        localStorage.setItem(
            "idler_shop_subcategory",
            currentShopSubcategory
        );

    }
    else {

        currentShopSubcategory =
            null;


        localStorage.removeItem(
            "idler_shop_subcategory"
        );

    }


    localStorage.setItem(
        "idler_shop_category",
        categoryId
    );


    renderShop();
}
function openShopItemFromJournal(
    itemId
) {
    const shopEntry =
        typeof shopItems !==
            "undefined"
            ? shopItems.find(
                shopItem => {
                    return (
                        shopItem.itemId ===
                        itemId
                    );
                }
            )
            : null;

    if (!shopEntry) {
        console.warn(
            "Przedmiot nie jest dostępny u Kupca:",
            itemId
        );

        return;
    }

    currentShopCategory =
        shopEntry.category;

    localStorage.setItem(
        "idler_shop_category",
        currentShopCategory
    );

    if (
        typeof showScreen ===
        "function"
    ) {
        showScreen(
            "screen-shop"
        );
    }

    renderShop();

    if (
        typeof focusJournalNavigationTarget ===
        "function"
    ) {
        focusJournalNavigationTarget(
            '[data-shop-item-id="' +
            itemId +
            '"]'
        );
    }
}

function updateShopQuantityCost(
    itemId,
    unitPrice
) {
    const input =
        document.getElementById(
            "shop-quantity-" + itemId
        );
    const costElement =
        document.getElementById(
            "shop-quantity-cost-" +
            itemId
        );
    const buyButton =
        document.getElementById(
            "shop-quantity-buy-" +
            itemId
        );

    if (
        !input ||
        !costElement ||
        !buyButton
    ) {
        return;
    }

    const quantity = Math.max(
        0,
        Math.min(
            99999,
            Math.floor(
                Number(input.value) || 0
            )
        )
    );
    const finalUnitPrice =
        typeof getFinalTradeBulkBuyPrice ===
            "function"
            ? getFinalTradeBulkBuyPrice(
                unitPrice,
                quantity
            )
            : (
                typeof getFinalShopItemPrice ===
                    "function"
                    ? getFinalShopItemPrice(
                        unitPrice
                    )
                    : Math.max(
                        0,
                        Number(unitPrice) || 0
                    )
            );

    const totalCost =
        quantity *
        finalUnitPrice;

    costElement.textContent =
        totalCost.toLocaleString("pl-PL") +
        " 💰";
    buyButton.disabled =
        quantity <= 0 ||
        player.gold < totalCost;
    buyButton.textContent =
        quantity <= 0
            ? "Wpisz liczbę sztuk"
            : player.gold < totalCost
                ? "Brakuje złota"
                : "Kup " +
                quantity.toLocaleString(
                    "pl-PL"
                ) +
                " szt.";
}

function buySelectedShopQuantity(
    itemId,
    unitPrice
) {
    const input =
        document.getElementById(
            "shop-quantity-" + itemId
        );

    if (!input) {
        return;
    }

    const quantity = Math.max(
        0,
        Math.min(
            99999,
            Math.floor(
                Number(input.value) || 0
            )
        )
    );

    if (quantity <= 0) {
        showNotification(
            "Wpisz liczbę przynęt większą od zera.",
            "error"
        );
        return;
    }

    buyItemQuantity(
        itemId,
        unitPrice,
        quantity
    );
}

function renderShop() {

    rebuildShopItems();

    const container = document.getElementById("shop-list");

    if (!container) {
        return;
    }

    if (typeof shopItems === "undefined") {
        console.warn("shopItems is not defined");
        return;
    }

    if (typeof shopCategories === "undefined") {
        console.warn("shopCategories is not defined");
        return;
    }

    container.innerHTML = "";

    const shopHeader =
        document.createElement(
            "div"
        );

    shopHeader.className =
        "shop-rpg-header";


    shopHeader.innerHTML = `

<div class="shop-rpg-merchant-icon">
    🧔
</div>


<div class="shop-rpg-merchant-info">

    <div class="shop-rpg-merchant-name">
        Kowal Grimbold
    </div>


    <div class="shop-rpg-merchant-description">
        Najlepszy sprzęt dla odważnych
        poszukiwaczy przygód.
    </div>


</div>


<div class="shop-rpg-gold">

    💰
    ${player.gold.toLocaleString("pl-PL")}

</div>

`;


    container.appendChild(
        shopHeader
    );
    const uniqueCategories = shopCategories.filter((category, index, categories) => {
        return categories.findIndex(otherCategory => {
            return otherCategory.id === category.id;
        }) === index;
    });

    /*
     * Sprawdzamy, czy zapisana kategoria
     * nadal istnieje.
     */
    const selectedCategoryExists =
        uniqueCategories.some(
            category => {
                return (
                    category.id ===
                    currentShopCategory
                );
            }
        );

    if (
        !selectedCategoryExists &&
        uniqueCategories.length > 0
    ) {
        currentShopCategory =
            uniqueCategories[0].id;

        localStorage.setItem(
            "idler_shop_category",
            currentShopCategory
        );
    }

    const categoryPanel =
        document.createElement(
            "div"
        );

    categoryPanel.className =
        "shop-category-panel";

    uniqueCategories.forEach(
        category => {
            const categoryItemsCount =
                shopItems
                    .filter(shopItem => {
                        return (
                            getShopItemCategoryData(
                                shopItem
                            ).category === category.id
                        );
                    })
                    .filter(
                        (
                            shopItem,
                            index,
                            filteredItems
                        ) => {
                            return (
                                filteredItems
                                    .findIndex(
                                        otherItem => {
                                            return (
                                                otherItem.itemId ===
                                                shopItem.itemId
                                            );
                                        }
                                    ) === index
                            );
                        }
                    )
                    .length;

            const tabButton =
                document.createElement(
                    "div"
                );


            tabButton.className =
                "shop-side-button";

            tabButton.innerHTML =
                `
    <span>
        ${category.name}
    </span>

    <small>
        ${categoryItemsCount}
    </small>
    `;

            if (
                category.id ===
                currentShopCategory
            ) {
                tabButton.classList.add(
                    "active"
                );
            }

            tabButton.addEventListener(
                "click",
                () => {

                    setShopCategory(
                        category.id
                    );

                }
            );

            categoryPanel.appendChild(
                tabButton
            );


        }
    );

    container.appendChild(
        categoryPanel
    );

    const subTabsContainer =
        document.createElement(
            "div"
        );



    subTabsContainer.className =
        "shop-subcategory-panel";

    const selectedCategory =
        uniqueCategories.find(
            category => {
                return (
                    category.id ===
                    currentShopCategory
                );
            }
        );


    if (
        selectedCategory &&
        selectedCategory.subcategories
    ) {

        selectedCategory.subcategories.forEach(
            subcategory => {

                const subButton =
                    document.createElement(
                        "button"
                    );


                subButton.type =
                    "button";


                subButton.className =
                    "shop-subcategory-button";


                subButton.textContent =
                    subcategory.name;
                if (
                    subcategory.id ===
                    currentShopSubcategory
                ) {
                    subButton.classList.add(
                        "active"
                    );
                }


                subButton.onclick = () => {

                    currentShopSubcategory =
                        subcategory.id;


                    currentShopType =
                        null;


                    localStorage.removeItem(
                        "idler_shop_type"
                    );


                    localStorage.setItem(
                        "idler_shop_subcategory",
                        subcategory.id
                    );


                    renderShop();

                };

                subTabsContainer.appendChild(
                    subButton
                );

            }
        );

    }


    container.appendChild(
        subTabsContainer
    );

    const typeTabsContainer =
        document.createElement(
            "div"
        );


    typeTabsContainer.className =
        "shop-type-panel";

    const selectedSubcategory =
        selectedCategory &&
            selectedCategory.subcategories
            ? selectedCategory.subcategories.find(
                subcategory =>
                    subcategory.id ===
                    currentShopSubcategory
            )
            : null;

    if (
        selectedSubcategory &&
        selectedSubcategory.types
    ) {

        selectedSubcategory.types.forEach(
            type => {

                const typeButton =
                    document.createElement(
                        "button"
                    );


                typeButton.type =
                    "button";


                typeButton.className =
                    "shop-type-button";


                typeButton.textContent =
                    type.name;
                if (
                    type.id ===
                    currentShopType
                ) {

                    typeButton.classList.add(
                        "active"
                    );

                }

                typeButton.onclick = () => {

                    currentShopType =
                        type.id;


                    localStorage.setItem(
                        "idler_shop_type",
                        type.id
                    );


                    renderShop();

                };


                typeTabsContainer.appendChild(
                    typeButton
                );

            }
        );

    }


    container.appendChild(
        typeTabsContainer
    );

    uniqueCategories.forEach(
        category => {

            const categoryItems = shopItems
                .filter(shopItem => {

                    const categoryData =
                        getShopItemCategoryData(
                            shopItem
                        );


                    const sameCategory =
                        categoryData.category ===
                        category.id;


                    const sameSubcategory =
                        categoryData.subcategory ===
                        currentShopSubcategory;

                    const sameType =
                        !currentShopType ||
                        categoryData.type === currentShopType;



                    return (
                        sameCategory &&
                        sameSubcategory &&
                        sameType
                    );

                })
                .filter(
                    (
                        shopItem,
                        index,
                        filteredItems
                    ) => {
                        return (
                            filteredItems.findIndex(
                                otherItem => {
                                    return (
                                        otherItem.itemId ===
                                        shopItem.itemId
                                    );
                                }
                            ) === index
                        );
                    }
                );

            categoryItems.sort(
                compareShopItems
            );

            const details =
                document.createElement(
                    "details"
                );

            details.className =
                "shop-category shop-category-tab-panel";

            /*
             * Otwarta i widoczna jest wyłącznie
             * aktualnie wybrana kategoria.
             */
            details.open =
                category.id ===
                currentShopCategory;

            details.hidden =
                category.id !==
                currentShopCategory;

            const summary = document.createElement("summary");
            summary.textContent = `${category.name} (${categoryItems.length})`;
            details.appendChild(summary);

            const itemsContainer = document.createElement("div");
            itemsContainer.className = "shop-category-items";

            if (categoryItems.length === 0) {
                itemsContainer.innerHTML = `
                <p class="empty-category">
                    Brak przedmiotów w tej kategorii.
                </p>
            `;
            }

            categoryItems.forEach(shopItem => {

                const item = items[shopItem.itemId];

                if (!item) {
                    console.warn("Shop item not found:", shopItem.itemId);
                    return;
                }

                const finalPrice =
                    typeof getFinalShopItemPrice ===
                        "function"
                        ? getFinalShopItemPrice(
                            shopItem.price
                        )
                        : shopItem.price;
                const bulkTenUnitPrice =
                    typeof getFinalTradeBulkBuyPrice ===
                        "function"
                        ? getFinalTradeBulkBuyPrice(
                            shopItem.price,
                            10
                        )
                        : finalPrice;

                const bulkTenTotalPrice =
                    bulkTenUnitPrice *
                    10;

                const hasTradeDiscount =
                    finalPrice <
                    shopItem.price;

                const requiredLevel =
                    getShopItemRequiredLevel(
                        item
                    );

                const currentLevel =
                    getShopItemCurrentLevel(
                        item
                    );

                const hasLevel =
                    currentLevel >=
                    requiredLevel;

                const isProfessionTool =
                    item.type ===
                    "profession_tool";

                const levelLabel =
                    isProfessionTool
                        ? "Poziom profesji"
                        : "Poziom";

                const professionToolTierHtml =
                    isProfessionTool
                        ? `
                        <span>
                            Ranga:
                            ${getProfessionToolTierLabel(
                            item
                        )}
                        </span>
                    `
                        : "";

                const hasEnoughGold =
                    player.gold >=
                    finalPrice;

                const canBuy =
                    hasEnoughGold;
                const isFishingSupply =
                    shopItem.category ===
                    "fishing_supplies";
                const canBuyTen =
                    player.gold >=
                    bulkTenTotalPrice;

                const canBuyAndEquip =
                    !isFishingSupply &&
                    hasLevel &&
                    hasEnoughGold;

                const ownership =
                    getShopItemOwnership(
                        shopItem.itemId
                    );

                const ownershipHtml =
                    getShopOwnershipHtml(
                        ownership
                    );

                const comparison =
                    getShopItemComparison(
                        item
                    );

                const comparisonTargetName =
                    comparison.equippedItem
                        ? comparison
                            .equippedItem
                            .name
                        : "Pusty slot";
                const comparisonStatIcons = {

                    "Obrażenia": "⚔️",
                    "Atak": "⚔️",

                    "Krytyk": "🎯",
                    "Szansa krytyczna": "🎯",

                    "Pancerz": "🛡️",
                    "Obrona": "🛡️",

                    "Życie": "❤️",
                    "Zdrowie": "❤️",

                    "Mana": "🔵",

                    "Szybkość": "⚡",

                    "Unik": "💨",

                    "Siła": "💪",
                    "Zręczność": "🏹",
                    "Inteligencja": "🧠"

                };


                const comparisonHtml =
                    comparison.rows.length > 0
                        ? comparison.rows
                            .map(row => {
                                return `
                    <div
                        class="
                            shop-comparison-stat
                            ${row.differenceClass}
                        "
                    >
                        <span
                            class="shop-comparison-label"
                        >
                            ${comparisonStatIcons[row.label] || "📌"}
${row.label}
                        </span>

                        <strong
                            class="shop-comparison-value"
                        >
                            ${row.value}
                        </strong>

                        <span
                            class="shop-comparison-difference"
                        >
                            ${row.difference}
                        </span>
                    </div>
                `;
                            })
                            .join("")
                        : `
            <div class="shop-comparison-empty">
                Brak statystyk do porównania
            </div>
        `;




                const buyButtonText =
                    !hasEnoughGold
                        ? "Brak złota"
                        : !hasLevel
                            ? (
                                isProfessionTool
                                    ? "Kup do plecaka"
                                    : "Kup jako materiał"
                            )
                            : "Kup";


                const upgradeStatus =
                    getShopItemUpgradeStatus(
                        item
                    );

                const upgradeStatusHtml = `
    <span
        class="
            shop-upgrade-badge
            shop-upgrade-${upgradeStatus.id}
        "
    >
        ${upgradeStatus.icon}
        ${upgradeStatus.label}
    </span>
`;

                const buyAndEquipButtonText =
                    isFishingSupply
                        ? (
                            canBuyTen
                                ? "Kup ×10"
                                : "Brak złota na ×10"
                        )
                        : !hasLevel
                            ? "Niedostępne"
                            : !hasEnoughGold
                                ? "Brak złota"
                                : "Kup i załóż";

                const comparisonSlotArgument =
                    comparison.slot
                        ? "'" +
                        comparison.slot +
                        "'"
                        : "null";

                const buyDisabledAttribute =
                    canBuy
                        ? ""
                        : "disabled";

                const buyAndEquipDisabledAttribute =
                    (
                        isFishingSupply
                            ? canBuyTen
                            : canBuyAndEquip
                    )
                        ? ""
                        : "disabled";

                const secondaryButtonAction =
                    isFishingSupply
                        ? (
                            "buyItemQuantity('" +
                            shopItem.itemId +
                            "', " +
                            shopItem.price +
                            ", 10)"
                        )
                        : (
                            "buyAndEquipItem('" +
                            shopItem.itemId +
                            "', " +
                            shopItem.price +
                            ", " +
                            comparisonSlotArgument +
                            ")"
                        );

                const secondaryButtonAvailable =
                    isFishingSupply
                        ? canBuyTen
                        : canBuyAndEquip;
                const quantityPurchaseHtml =
                    isFishingSupply
                        ? `
                        <div class="shop-quantity-purchase">
                            <label for="shop-quantity-${shopItem.itemId}">
                                Liczba sztuk
                                <input
                                    id="shop-quantity-${shopItem.itemId}"
                                    type="number"
                                    min="1"
                                    max="99999"
                                    step="1"
                                    value="10"
                                    inputmode="numeric"
                                    oninput="updateShopQuantityCost(
                                        '${shopItem.itemId}',
                                        ${finalPrice}
                                    )"
                                    onkeydown="if (event.key === 'Enter') {
                                        buySelectedShopQuantity(
                                            '${shopItem.itemId}',
                                            ${shopItem.price}
                                        )
                                    }"
                                >
                            </label>

                            <div class="shop-quantity-total">
                                Łączny koszt
                                <strong id="shop-quantity-cost-${shopItem.itemId}">
                                    ${bulkTenTotalPrice.toLocaleString("pl-PL")} 💰
                                </strong>
                            </div>

                            <button
                                id="shop-quantity-buy-${shopItem.itemId}"
                                class="shop-buy-btn shop-quantity-buy-button"
                                onclick="buySelectedShopQuantity(
                                    '${shopItem.itemId}',
                                    ${shopItem.price}
                                )"
                                ${canBuyTen ? "" : "disabled"}
                            >
                                ${canBuyTen
                            ? "Kup 10 szt."
                            : "Brakuje złota"}
                            </button>
                        </div>
                    `
                        : "";

                const div =
                    document.createElement("div");

                div.className =
                    "shop-item";

                div.dataset.shopItemId =
                    shopItem.itemId;

                if (ownership.isInInventory) {
                    div.classList.add(
                        "shop-item-owned"
                    );
                }

                if (ownership.isEquipped) {
                    div.classList.add(
                        "shop-item-equipped"
                    );
                }

                if (item.rarity) {
                    div.classList.add("rarity-" + item.rarity);
                }


                div.innerHTML = `
<div class="shop-rpg-card">

    <div class="shop-rpg-top">

        <div class="shop-rpg-icon-box">
            <div class="shop-rpg-icon">
                ${getShopItemIcon(item)}
            </div>
        </div>


        <div class="shop-rpg-title-area">

            <div class="shop-rpg-name">
                ${item.name}
            </div>

            <div class="shop-rpg-rarity">
                ⭐
                ${typeof getRarityName ===
                        "function"
                        ? getRarityName(item.rarity)
                        : item.rarity}
            </div>

            ${upgradeStatusHtml}

        </div>

    </div>


    <div class="shop-rpg-info">

        <span>
            🗡️
            ${getShopItemTypeName(item)}
        </span>

        <span>
            📈
            ${levelLabel}:
            ${requiredLevel}
        </span>

    </div>



<div class="shop-rpg-stats-section">

    <div class="shop-rpg-section-title">
        ⚔️ Statystyki
    </div>


    <div class="shop-rpg-stats">

        ${getShopItemStatsHtml(item, comparison)}

    </div>

</div>
    <div class="shop-rpg-price">

        💰
        ${hasTradeDiscount
                        ? `
                <del>
                    ${shopItem.price}
                </del>

                <strong class="shop-stat-value">
                    ${finalPrice}
                </strong>
            `
                        :
                        `
                ${finalPrice}
            `
                    }

    </div>
    <div class="shop-rpg-actions">

        <button
            class="shop-buy-btn"
            onclick="buyItem(
                '${shopItem.itemId}',
                ${shopItem.price}
            )"
            ${buyDisabledAttribute}
        >
            🛒 Kup
        </button>


        <button
            class="shop-buy-btn shop-buy-equip-btn"
            onclick="${secondaryButtonAction}"
            ${buyAndEquipDisabledAttribute}
        >
            ⚔️ Kup i załóż
        </button>

    </div>


<div class="shop-rpg-comparison">

    <div class="shop-rpg-comparison-title">
        ⚔️ Porównanie
    </div>


    <div class="shop-rpg-comparison-target">
        Aktualnie:
        <strong class="shop-stat-value">
            ${comparisonTargetName}
        </strong>
    </div>

</div>


</div>
`;


                itemsContainer.appendChild(div);
            });

            details.appendChild(itemsContainer);
            container.appendChild(details);
        });
}

function getStatComparisonClass(
    label,
    comparison
) {

    if (
        !comparison ||
        !comparison.rows
    ) {
        return "";
    }


    const row =
        comparison.rows.find(
            stat =>
                stat.label === label
        );


    if (!row) {
        return "";
    }


    return row.differenceClass || "";

}

function getStatComparisonHtml(
    label,
    comparison
) {

    if (
        !comparison ||
        !comparison.rows
    ) {
        return "";
    }


    const row =
        comparison.rows.find(
            stat =>
                stat.label === label
        );


    if (!row) {
        return "";
    }


    return `
    <span class="stat-comparison ${row.differenceClass}">
        (${row.difference})
    </span>
`;

}

function getShopItemStatsHtml(
    item,
    comparison
) {

    let html = "";


    if (item.type === "weapon") {


        const weaponLabels =
            getWeaponCombatLabels(item);


        weaponLabels.forEach(label => {

            const parts =
                label.split(":");


            const labelName =
                parts[0].trim();


            html += `

    <div class="shop-stat-box">

        <span>
            ${labelName}
        </span>


        <div class="shop-stat-value-area">

            <strong class="shop-stat-value">
                ${parts.slice(1).join(":")}
            </strong>


            ${getStatComparisonHtml(
                labelName,
                comparison
            )}

        </div>

    </div>

    `;

        });



        if (item.damage) {

            html += `

    <div class="shop-stat-box">

        <span>
            ⚔️ Obrażenia
        </span>


        <div class="shop-stat-value-area">

            <strong class="shop-stat-value">
                ${item.damage}
            </strong>


            ${getStatComparisonHtml(
                "Obrażenia",
                comparison
            )}

        </div>

    </div>

    `;

        }


    }
    /*
        PANCERZ
    */

    if (
        item.type === "armor" ||
        item.type === "helmet" ||
        item.type === "gloves" ||
        item.type === "boots" ||
        item.type === "pants" ||
        item.type === "shield"
    ) {


        if (item.armor) {

            html += `

<div class="shop-stat-box">

    <span>
        🛡️ Pancerz
    </span>


    <div class="shop-stat-value-area">

        <strong class="shop-stat-value">
            ${item.armor}
        </strong>

        ${getStatComparisonHtml(
                "Pancerz",
                comparison
            )}

    </div>

</div>


        `;

        }

    }

    if (
        item.type === "ring" ||
        item.type === "amulet" ||
        item.type === "talisman"
    ) {


        if (item.strength) {

            html += `

<div class="shop-stat-box">

    <span>
        💪 Siła
    </span>


    <div class="shop-stat-value-area">

<div class="shop-stat-value-area">

    <strong class="shop-stat-value">
        +${item.strength}
    </strong>


    ${getStatComparisonHtml(
                "Siła",
                comparison
            )}

</div>



    </div>


</div>

`;

        }

        if (item.intelligence) {

            html += `

<div class="shop-stat-box">

    <span>
        🧠 Inteligencja
    </span>


    <div class="shop-stat-value-area">

<div class="shop-stat-value-area">

    <strong class="shop-stat-value">
        +${item.intelligence}
    </strong>


    ${getStatComparisonHtml(
                "Inteligencja",
                comparison
            )}

</div>



    </div>


</div>

`;

        }


        if (item.luck) {

            html += `

<div class="shop-stat-box">

    <span>
        🍀 Szczęście
    </span>


    <div class="shop-stat-value-area">

<div class="shop-stat-value-area">

    <strong class="shop-stat-value">
        +${item.luck}
    </strong>


    ${getStatComparisonHtml(
                "Szczęście",
                comparison
            )}

</div>

     

    </div>


</div>

`;

        }


    }
    return html;

}

function getShopItemTypeName(item) {
    if (item.type === "weapon") {
        if (item.weaponType === "ranged") {
            return "Broń dystansowa";
        }

        if (item.weaponType === "magic") {
            return "Broń magiczna";
        }

        return "Broń biała";
    }

    const typeNames = {
        shield: "Tarcza",
        helmet: "Hełm",
        armor: "Pancerz",
        pants: "Spodnie",
        boots: "Buty",
        gloves: "Rękawice",
        ring: "Pierścień",
        amulet: "Amulet",
        talisman: "Talizman",
        fishing_bait:
            "Przynęta wędkarska",
        profession_tool:
            "Narzędzie profesji"
    };

    return typeNames[item.type] || item.type || "Przedmiot";
}


function getShopItemIcon(item) {

    const weaponType =
        getShopItemType(
            item.id || item.itemId
        );


    if (
        item.type === "weapon"
    ) {

        if (
            item.weaponClass === "slashing" ||
            weaponType === "sword"
        ) {
            return "⚔️";
        }


        if (
            item.weaponClass === "blunt" ||
            weaponType === "blunt"
        ) {
            return "🔨";
        }


        if (
            weaponType === "bow"
        ) {
            return "🏹";
        }


        if (
            weaponType === "crossbow"
        ) {
            return "🏹";
        }


        if (
            weaponType === "wand"
        ) {
            return "🪄";
        }


        if (
            weaponType === "staff"
        ) {
            return "🔮";
        }

    }


    const icons = {

        shield: "🛡️",
        helmet: "⛑️",
        armor: "🥋",
        pants: "👖",
        boots: "🥾",
        gloves: "🧤",

        ring: "💍",
        amulet: "📿",
        talisman: "🔮",

        profession_tool: "🛠️"

    };


    return icons[item.type] || "🪱";

}