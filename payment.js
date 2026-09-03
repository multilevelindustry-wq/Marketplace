/* ==========================================================
   PAYMENT.JS — INTERNATIONAL DELIVERY + CHECKOUT
   Works with Firebase Firestore, Paystack and PayPal.
   Distances are estimates from the supplied country/region datasets.
========================================================== */

import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { populateCountrySelect, getCountryByCode } from "./country.js";
import { calculateCountryDistance } from "./country-distances.js";
import { getRegions, calculateRegionDistance } from "./regional-distances.js";

const CART_STORAGE_KEY = "yourStoreCart";
const DEFAULT_COUNTRY = "NG";
const DEFAULT_SELLER_COUNTRY = "NG";
const DEFAULT_SELLER_STATE = "Lagos";

let cartItems = [];
let selectedDelivery = null;
let selectedPaymentMethod = null;
let currentOrder = null;
const firestoreProductCache = new Map();

const DELIVERY_SERVICES = [
    { id:"standard", name:"3–7 days Standard Delivery", description:"Affordable delivery option", basePrice:4000, pricePerKg:650, pricePerKm:9, sizeRate:650, multiplier:2.2 },
    { id:"economy", name:"3–10 days Economy Delivery", description:"Lowest-cost option", basePrice:3000, pricePerKg:550, pricePerKm:8, sizeRate:750, multiplier:2.3 },
    { id:"express", name:"1–5 days Express Delivery", description:"Faster delivery for urgent orders", basePrice:4500, pricePerKg:550, pricePerKm:10, sizeRate:950, multiplier:2.2 },
    { id:"premium", name:"1–4 days Premium Delivery", description:"Priority handling and delivery", basePrice:6000, pricePerKg:700, pricePerKm:12, sizeRate:2100, multiplier:2.33 },
    { id:"heavy_cargo", name:"5–14 days Heavy Cargo Delivery", description:"For large or heavy packages", basePrice:8500, pricePerKg:800, pricePerKm:11, sizeRate:2200, multiplier:2.35 }
];

const SIZE_VALUE = {
    small: 1, medium: 2, large: 4, extra_large: 7,
    "extra-large": 7, xlarge: 7, xl: 7
};

function money(value) {
    return `₦${Math.round(Number(value) || 0).toLocaleString("en-NG")}`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function normalizeCode(value) { return String(value || "").trim().toUpperCase(); }
function getCountryCode() { return normalizeCode(document.getElementById("deliveryCountry")?.value || DEFAULT_COUNTRY); }
function getBuyerRegion() { return document.getElementById("deliveryState")?.value?.trim() || ""; }

function getProductId(item) {
    return item?.productId || item?.productID || item?.product_id || item?.firestoreId || item?.id || "";
}

function getQuantity(item) { return Math.max(1, Number(item?.quantity ?? item?.qty ?? 1) || 1); }

function getCartItems() {
    try {
        const raw = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
        return Array.isArray(raw) ? raw : [];
    } catch { return []; }
}

async function getFirestoreProduct(id) {
    if (!id) return null;
    if (firestoreProductCache.has(id)) return firestoreProductCache.get(id);
    try {
        const snap = await getDoc(doc(db, "products", id));
        const data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
        firestoreProductCache.set(id, data);
        return data;
    } catch (error) {
        console.warn("Product lookup failed:", id, error);
        return null;
    }
}

function weightToKg(value, unit = "kg") {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return 0;
    const u = String(unit || "kg").toLowerCase();
    if (u === "g" || u === "gram" || u === "grams") return n / 1000;
    if (u === "mg") return n / 1000000;
    if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") return n * 0.45359237;
    return n;
}

function getItemWeight(item) {
    const s = item.shippingData || item;
    return weightToKg(s.packageWeightKg ?? s.weightKg ?? s.packageWeight ?? 0, s.packageWeightUnit || s.weightUnit || "kg");
}

function getItemSize(item) {
    const raw = String(item?.shippingData?.packageSize ?? item?.packageSize ?? "medium").trim().toLowerCase();
    if (SIZE_VALUE[raw]) return SIZE_VALUE[raw];
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 2;
}

function getTotalWeight() { return cartItems.reduce((s, i) => s + getItemWeight(i) * getQuantity(i), 0); }
function getTotalSize() { return cartItems.reduce((s, i) => s + getItemSize(i) * getQuantity(i), 0); }
function getProductsTotal() { return cartItems.reduce((s, i) => s + (Number(i.price ?? i.buyerPrice ?? i.amount ?? 0) || 0) * getQuantity(i), 0); }

function getSellerCountry(item) {
    const s = item.shippingData || item;
    return normalizeCode(s.sellerCountry || s.pickupCountry || s.country || DEFAULT_SELLER_COUNTRY);
}
function getSellerRegion(item) {
    const s = item.shippingData || item;
    return String(s.sellerState || s.sellerRegion || s.pickupState || s.region || "").trim();
}

async function loadCartShippingData() {
    const raw = getCartItems();
    const result = [];
    for (const item of raw) {
        const id = getProductId(item);
        const product = await getFirestoreProduct(id);
        const merged = { ...(product || {}), ...item };
        merged.id = id || product?.id || item.id;
        merged.productId = id || product?.id || item.productId;
        merged.name = item.name || product?.name || "Product";
        merged.price = Number(item.price ?? item.buyerPrice ?? product?.price ?? 0) || 0;
        merged.quantity = getQuantity(item);
        merged.shippingData = {
            packageWeightKg: item.packageWeightKg ?? item.weightKg ?? product?.packageWeightKg ?? product?.weightKg ?? product?.packageWeight ?? 0,
            packageWeightUnit: item.packageWeightUnit ?? item.weightUnit ?? product?.packageWeightUnit ?? product?.weightUnit ?? "kg",
            packageSize: item.packageSize ?? product?.packageSize ?? "medium",
            packageDimensions: item.packageDimensions ?? product?.packageDimensions ?? "",
            sellerCountry: item.sellerCountry ?? item.pickupCountry ?? product?.sellerCountry ?? product?.pickupCountry ?? DEFAULT_SELLER_COUNTRY,
            sellerState: item.sellerState ?? item.pickupState ?? product?.sellerState ?? product?.pickupState ?? DEFAULT_SELLER_STATE,
            sellerLga: item.sellerLga ?? item.pickupLga ?? product?.sellerLga ?? product?.pickupLga ?? "",
            sellerCity: item.sellerCity ?? item.pickupCity ?? product?.sellerCity ?? product?.pickupCity ?? "",
            freeShipping: item.freeShipping ?? product?.freeShipping ?? false
        };
        result.push(merged);
    }
    cartItems = result;
}

function calculateItemDistance(item) {
    const buyerCountry = getCountryCode();
    const buyerRegion = getBuyerRegion();
    const sellerCountry = getSellerCountry(item);
    const sellerRegion = getSellerRegion(item);

    if (!buyerCountry || !sellerCountry) return 0;
    if (sellerCountry === buyerCountry) {
        const d = calculateRegionDistance(buyerCountry, sellerRegion, buyerRegion);
        return d > 0 ? d : 20;
    }
    return calculateCountryDistance(sellerCountry, buyerCountry);
}

function getCartDistances() {
    return cartItems.map(item => ({
        productId: getProductId(item),
        sellerCountry: getSellerCountry(item),
        sellerRegion: getSellerRegion(item),
        buyerCountry: getCountryCode(),
        buyerRegion: getBuyerRegion(),
        distance: calculateItemDistance(item)
    }));
}

function calculateCartDistance() {
    const list = getCartDistances();
    return list.length ? Math.max(...list.map(x => x.distance)) : 0;
}

function calculateDeliveryPrice(service, distance, weight, size) {
    const raw = service.basePrice + distance * service.pricePerKm + weight * service.pricePerKg + size * service.sizeRate;
    const value = raw * service.multiplier;
    return Math.max(service.basePrice, Math.round(value / 50) * 50);
}

function getDeliveryOptions() {
    const distance = calculateCartDistance();
    const weight = getTotalWeight();
    const size = getTotalSize();
    const distances = getCartDistances();
    const farthestSeller = distances.reduce((a, b) => !a || b.distance > a.distance ? b : a, null);
    return DELIVERY_SERVICES.map(service => ({
        ...service,
        distance,
        weight,
        size,
        farthestSeller,
        price: calculateDeliveryPrice(service, distance, weight, size)
    }));
}

function updateRegions() {
    const country = getCountryCode();
    const state = document.getElementById("deliveryState");
    const hint = document.getElementById("deliveryStateHint");
    if (!state) return;
    const regions = getRegions(country);
    state.innerHTML = `<option value="">Select state / region</option>`;
    if (!regions.length) {
        state.required = false;
        state.style.display = "";
        if (hint) { hint.style.display = "block"; hint.textContent = "State/region is not in the detailed distance dataset. Enter it manually; country distance will be used."; }
        const option = document.createElement("option");
        option.value = "Other"; option.textContent = "Other / Enter manually"; state.appendChild(option);
        return;
    }
    state.required = true;
    state.style.display = "";
    regions.slice().sort((a,b) => a.name.localeCompare(b.name)).forEach(r => {
        const option = document.createElement("option");
        option.value = r.name; option.textContent = r.name;
        state.appendChild(option);
    });
    if (hint) hint.style.display = "none";
}

function updateCurrencyInfo() {
    const country = getCountryByCode(getCountryCode());
    const box = document.getElementById("buyerCurrencyInfo");
    const name = document.getElementById("buyerCurrencyName");
    if (country && box) box.style.display = "block";
    if (country && name) name.textContent = `${country.currency} (${country.name})`;
}

function renderDeliveryServices() {
    const card = document.getElementById("deliveryServicesCard");
    const container = document.getElementById("deliveryServices");
    const info = document.getElementById("deliveryDistanceInfo");
    if (!container) return;

    const options = getDeliveryOptions();
    if (!options.length) { if (card) card.style.display = "none"; return; }
    if (card) card.style.display = "block";

    const distance = calculateCartDistance();
    if (info) info.textContent = `${distance.toLocaleString()} km estimated delivery distance • ${getTotalWeight().toFixed(2)} kg • size ${getTotalSize()}`;

    container.innerHTML = options.map(o => `
        <label class="delivery-service-option" data-service-id="${escapeHTML(o.id)}">
            <input type="radio" name="deliveryService" value="${escapeHTML(o.id)}" ${selectedDelivery?.id === o.id ? "checked" : ""}>
            <span class="delivery-service-content">
                <strong>${escapeHTML(o.name)}</strong>
                <small>${escapeHTML(o.description)}</small>
                <small>${o.distance.toLocaleString()} km • ${o.weight.toFixed(2)} kg</small>
                <b>${money(o.price)}</b>
            </span>
        </label>`).join("");

    container.querySelectorAll('input[name="deliveryService"]').forEach(input => {
        input.addEventListener("change", () => {
            const option = options.find(x => x.id === input.value);
            selectedDelivery = option || null;
            updatePaymentSummary();
            updatePayButton();
        });
    });
}

function getDeliveryDetails() {
    return {
        name: document.getElementById("buyerName")?.value?.trim() || "",
        phone: document.getElementById("buyerPhone")?.value?.trim() || "",
        email: document.getElementById("buyerEmail")?.value?.trim() || "",
        country: getCountryCode(),
        countryName: getCountryByCode(getCountryCode())?.name || getCountryCode(),
        state: getBuyerRegion(),
        city: document.getElementById("deliveryCity")?.value?.trim() || "",
        area: document.getElementById("deliveryArea")?.value?.trim() || "",
        postalCode: document.getElementById("deliveryPostalCode")?.value?.trim() || "",
        address: document.getElementById("deliveryAddress")?.value?.trim() || "",
        instructions: document.getElementById("deliveryInstructions")?.value?.trim() || ""
    };
}

function validateDeliveryDetails() {
    const d = getDeliveryDetails();
    const country = getCountryCode();
    const hasRegions = getRegions(country).length > 0;
    const required = [d.name,d.phone,d.email,d.city,d.area,d.address];
    if (!country || required.some(x => !x)) return false;
    if (hasRegions && !d.state) return false;
    if (!selectedDelivery || !selectedPaymentMethod) return false;
    return true;
}

function updateSummary() {
    const products = getProductsTotal();
    const delivery = Number(selectedDelivery?.price || 0);
    const total = products + delivery;
    const items = document.getElementById("items");
    const deliveryEl = document.getElementById("delivery");
    const totalEl = document.getElementById("total");
    const localRow = document.getElementById("localCurrencyRow");
    const localTotal = document.getElementById("localCurrencyTotal");
    if (items) items.textContent = money(products);
    if (deliveryEl) deliveryEl.textContent = delivery ? money(delivery) : "—";
    if (totalEl) totalEl.textContent = money(total);
    if (localRow) localRow.style.display = "none";
    if (localTotal) localTotal.textContent = "";
    return total;
}
function updateProductSummary() { updateSummary(); }
function updateDeliveryAmount() { updateSummary(); }
function updateTotalAmount() { updateSummary(); }
function updatePaymentSummary() { updateSummary(); }
function getTotalPayable() { return updateSummary(); }

function showStatus(message, type = "info") {
    const el = document.getElementById("status");
    if (!el) return;
    el.textContent = message;
    el.dataset.type = type;
}

function createOrderId() { return `ORD-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`; }

function createOrder() {
    const delivery = getDeliveryDetails();
    const total = getTotalPayable();
    return {
        id: createOrderId(), createdAt: new Date().toISOString(), status: "payment_pending", paymentStatus: "pending",
        paymentMethod: selectedPaymentMethod,
        buyer: { name: delivery.name, phone: delivery.phone, email: delivery.email },
        delivery: {
            ...delivery,
            distanceKm: calculateCartDistance(), totalWeightKg: getTotalWeight(), totalSize: getTotalSize(),
            service: selectedDelivery ? { id:selectedDelivery.id, name:selectedDelivery.name, description:selectedDelivery.description, price:selectedDelivery.price } : null
        },
        products: cartItems.map(item => ({
            id:getProductId(item), productId:getProductId(item), name:item.name, price:Number(item.price)||0, quantity:getQuantity(item),
            weightKg:getItemWeight(item), packageWeightKg:getItemWeight(item), packageSize:item.shippingData?.packageSize || item.packageSize || "medium",
            sizeValue:getItemSize(item), dimensions:item.shippingData?.packageDimensions || "", sellerId:item.sellerId || item.shippingData?.sellerId || "",
            sellerCountry:getSellerCountry(item), sellerRegion:getSellerRegion(item)
        })),
        amount: { products:getProductsTotal(), delivery:Number(selectedDelivery?.price || 0), total, currency:"NGN" },
        currency:"NGN"
    };
}

function saveOrderLocally(order) {
    const orders = JSON.parse(localStorage.getItem("adminOrders") || "[]");
    orders.push(order); localStorage.setItem("adminOrders", JSON.stringify(orders)); localStorage.setItem("lastOrder", JSON.stringify(order));
}
function markOrderPaid(order, reference, gateway) {
    order.status = "paid"; order.paymentStatus = "paid"; order.reference = reference; order.gateway = gateway; order.paidAt = new Date().toISOString();
    saveOrderLocally(order);
}
function completeOrder(order) {
    localStorage.setItem("lastPaidOrder", JSON.stringify(order));
    localStorage.setItem("completedOrder", JSON.stringify(order));
    localStorage.removeItem(CART_STORAGE_KEY); localStorage.removeItem("cart");
    window.location.href = "order-success.html";
}

function payWithPaystack() {
    if (!validateDeliveryDetails()) { showStatus("Complete your delivery details, choose delivery service and payment method.", "error"); return; }
    if (!window.PaystackPop) { showStatus("Paystack is not loaded. Refresh and try again.", "error"); return; }
    currentOrder = createOrder();
    const amountKobo = Math.round(currentOrder.amount.total * 100);
    const popup = new PaystackPop();
    popup.newTransaction({
        key: "pk_live_ae2ef39d24e2f001cbc716def10d3ede5148af5b",
        email: currentOrder.buyer.email,
        amount: amountKobo,
        currency: "NGN",
        reference: currentOrder.id,
        metadata: { orderId:currentOrder.id, country:currentOrder.delivery.country, region:currentOrder.delivery.state, distanceKm:currentOrder.delivery.distanceKm },
        onSuccess: transaction => { markOrderPaid(currentOrder, transaction.reference || currentOrder.id, "paystack"); completeOrder(currentOrder); },
        onCancel: () => showStatus("Payment was cancelled.", "error")
    });
}

function getPayPalAmount() { return Number((getTotalPayable() / 1600).toFixed(2)); }

function initializePayPal() {
    const container = document.getElementById("paypal-button-container");
    if (!container || !window.paypal || selectedPaymentMethod !== "paypal") return;
    if (container.dataset.rendered === "true") return;
    container.dataset.rendered = "true";
    window.paypal.Buttons({
        createOrder: (data, actions) => {
            if (!validateDeliveryDetails()) { showStatus("Complete delivery details and select a delivery service.", "error"); return Promise.reject(new Error("Invalid checkout")); }
            currentOrder = createOrder();
            return actions.order.create({ purchase_units:[{ reference_id:currentOrder.id, amount:{currency_code:"USD", value:getPayPalAmount().toFixed(2)} }] });
        },
        onApprove: async (data, actions) => {
            try { const details = await actions.order.capture(); markOrderPaid(currentOrder, details.id || data.orderID, "paypal"); completeOrder(currentOrder); }
            catch (e) { console.error(e); showStatus("PayPal payment could not be completed.", "error"); }
        },
        onError: error => { console.error(error); container.dataset.rendered = "false"; showStatus("PayPal payment error. Please try again.", "error"); }
    }).render(container);
}

function updatePayButton() {
    const button = document.getElementById("pay");
    if (!button) return;
    const ready = validateDeliveryDetails();
    button.disabled = !ready || selectedPaymentMethod === "paypal";
    button.textContent = selectedPaymentMethod === "paystack" ? `Pay ${money(getTotalPayable())}` : "Pay Now";
}

function initializePaymentMethods() {
    document.querySelectorAll('.option[data-method]').forEach(option => {
        option.addEventListener("click", () => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio) { radio.checked = true; selectedPaymentMethod = radio.value; }
            document.querySelectorAll('.option[data-method]').forEach(x => x.classList.remove("selected"));
            option.classList.add("selected");
            const paypal = document.getElementById("paypal-button-container");
            if (paypal) { paypal.style.display = selectedPaymentMethod === "paypal" ? "block" : "none"; paypal.dataset.rendered = "false"; paypal.innerHTML = ""; }
            updatePaymentSummary(); updatePayButton();
            if (selectedPaymentMethod === "paypal") setTimeout(initializePayPal, 100);
        });
    });
}

function initializeLocation() {
    const country = document.getElementById("deliveryCountry");
    if (!country) return;
    populateCountrySelect(country, { selected:DEFAULT_COUNTRY, placeholder:"Select country" });
    updateRegions(); updateCurrencyInfo();
    country.addEventListener("change", () => { selectedDelivery = null; updateRegions(); updateCurrencyInfo(); renderDeliveryServices(); updatePaymentSummary(); updatePayButton(); });
    document.getElementById("deliveryState")?.addEventListener("change", () => { selectedDelivery = null; renderDeliveryServices(); updatePaymentSummary(); updatePayButton(); });
}

function initializeDeliveryButton() {
    document.getElementById("getDeliveryRates")?.addEventListener("click", () => {
        if (!getCountryCode()) { showStatus("Select your country first.", "error"); return; }
        selectedDelivery = null; renderDeliveryServices(); updatePaymentSummary(); updatePayButton();
        document.getElementById("deliveryServicesCard")?.scrollIntoView({behavior:"smooth", block:"nearest"});
    });
}

function initializePayButton() {
    document.getElementById("pay")?.addEventListener("click", () => {
        if (selectedPaymentMethod === "paystack") payWithPaystack();
        else if (selectedPaymentMethod === "paypal") initializePayPal();
        else showStatus("Select a payment method.", "error");
    });
}
function initializeBackButton() { document.getElementById("back")?.addEventListener("click", () => history.length > 1 ? history.back() : (window.location.href = "cart.html")); }

async function init() {
    await loadCartShippingData();
    initializeLocation();
    initializeDeliveryButton();
    initializePaymentMethods();
    initializePayButton();
    initializeBackButton();
    renderDeliveryServices();
    updatePaymentSummary(); updatePayButton();
}

document.addEventListener("DOMContentLoaded", init);

window.deliveryCheckout = {
    getCartDistances,
    calculateCartDistance,
    getDeliveryOptions,
    getDeliveryDetails,
    getTotalPayable
};
