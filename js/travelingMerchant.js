/*
 * Wędrowny kupiec – codziennie nowa, ograniczona oferta
 * rzadkich półproduktów (sztabki, płyty, kamienie, mechanizmy).
 * Ceny są wyższe niż wartość przedmiotów, więc to ujście dla złota
 * i wygodny skrót, a nie zamiennik farmienia.
 */
const TRAVELING_MERCHANT_OFFER_COUNT = 6;
const TRAVELING_MERCHANT_MARKUP = 2.5;
const TRAVELING_MERCHANT_FEATURED_DISCOUNT = 0.25;
const TRAVELING_MERCHANT_PROTECTION_STONE_PRICE = 25000;

function getTravelingMerchantMaxBasePrice() {
    const level = Math.max(1, player.level || 1);
    return Math.max(150, Math.floor(20 * Math.pow(level, 1.5)));
}

function getTravelingMerchantStock(basePrice) {
    if (basePrice < 200) return 20;
    if (basePrice < 1000) return 10;
    if (basePrice < 4000) return 5;
    return 3;
}

function ensureTravelingMerchantState() {
    const dayKey = getDailyQuestDayKey();
    let state = player.travelingMerchant;
    if (!state || typeof state !== "object" || state.dayKey !== dayKey) {
        state = { dayKey, offers: [] };
        player.travelingMerchant = state;
        const maxPrice = getTravelingMerchantMaxBasePrice();
        const pool = Object.entries(window.processedMaterialPrices || {})
            .filter(([id, price]) => items[id] && price <= maxPrice)
            .map(([id]) => id);
        const random = createDailyQuestRandom("merchant-" + dayKey);
        const count = Math.min(TRAVELING_MERCHANT_OFFER_COUNT, pool.length);
        for (let i = 0; i < count; i++) {
            const id = pool.splice(Math.floor(random() * pool.length), 1)[0];
            const basePrice = window.processedMaterialPrices[id];
            state.offers.push({
                itemId: id,
                stock: getTravelingMerchantStock(basePrice),
                featured: i === 0
            });
        }
        if ((player.level || 1) >= 10 && items.upgrade_protection_stone) {
            state.offers.push({
                itemId: "upgrade_protection_stone",
                stock: 2,
                featured: false,
                fixedPrice: TRAVELING_MERCHANT_PROTECTION_STONE_PRICE
            });
        }
    }
    return state;
}

function getTravelingMerchantUnitPrice(offer) {
    if (offer.fixedPrice) {
        return typeof getFinalShopItemPrice === "function"
            ? Math.max(1, Math.round(getFinalShopItemPrice(offer.fixedPrice)))
            : offer.fixedPrice;
    }
    const base = window.processedMaterialPrices[offer.itemId] || 0;
    const discount = offer.featured ? 1 - TRAVELING_MERCHANT_FEATURED_DISCOUNT : 1;
    const price = Math.max(1, Math.round(base * TRAVELING_MERCHANT_MARKUP * discount));
    return typeof getFinalShopItemPrice === "function"
        ? Math.max(1, Math.round(getFinalShopItemPrice(price)))
        : price;
}

function buyTravelingMerchantOffer(index, quantity) {
    const state = ensureTravelingMerchantState();
    const offer = state.offers[index];
    if (!offer || offer.stock <= 0) return;
    const amount = Math.min(offer.stock, Math.max(1, quantity));
    const total = getTravelingMerchantUnitPrice(offer) * amount;
    if (player.gold < total) {
        showNotification("Nie masz wystarczająco złota. Potrzebujesz " + total + " 💰.", "error");
        return;
    }
    player.gold -= total;
    offer.stock -= amount;
    addItemToInventory(offer.itemId, amount);
    if (typeof recordWorldStat === "function") {
        recordWorldStat("merchantPurchases");
    }
    const name = items[offer.itemId].name;
    showNotification("Kupiono: " + name + " ×" + amount, "success");
    if (typeof addSystemLog === "function") {
        addSystemLog("🧳 Wędrowny kupiec: " + name + " ×" + amount + " za " + total + " złota.", "purchase");
    }
    saveGame();
    render();
    renderTravelingMerchant();
}

function renderTravelingMerchant() {
    const container = document.getElementById("traveling-merchant");
    if (!container) return;
    const state = ensureTravelingMerchantState();
    container.innerHTML =
        '<div class="game-card traveling-merchant"><div class="card-header">🧳 Wędrowny kupiec ' +
        "<small>nowa oferta codziennie, ograniczony zapas</small></div>" +
        '<div class="traveling-merchant-grid">' +
        state.offers.map((offer, i) => {
            const item = items[offer.itemId];
            const price = getTravelingMerchantUnitPrice(offer);
            const soldOut = offer.stock <= 0;
            const buttons = soldOut
                ? "<button disabled>Wyprzedane</button>"
                : '<button onclick="buyTravelingMerchantOffer(' + i + ',1)">Kup ×1</button>' +
                (offer.stock > 1
                    ? '<button onclick="buyTravelingMerchantOffer(' + i + "," + offer.stock +
                    ')">Kup wszystko (×' + offer.stock + ")</button>"
                    : "");
            return '<div class="traveling-merchant-card' + (offer.featured ? " featured" : "") +
                (soldOut ? " sold-out" : "") + '">' +
                '<div class="traveling-merchant-name">' + (item.icon || "") + " " + item.name +
                (offer.featured ? " 🏷️ −25%" : "") + "</div>" +
                "<div>" + price.toLocaleString("pl-PL") + " 💰 / szt. · zapas: " + offer.stock + "</div>" +
                buttons + "</div>";
        }).join("") + "</div></div>";
}
