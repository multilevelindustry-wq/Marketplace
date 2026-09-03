/* ==========================================================
   INTERNATIONAL DELIVERY INTEGRATION
   Add these imports near the top of payment.js:
==========================================================

import {
    COUNTRIES,
    getCountryByCode,
    populateCountrySelect
} from "./country.js";

import {
    calculateCountryDistance
} from "./country-distances.js";

import {
    getRegions,
    calculateRegionDistance
} from "./regional-distances.js";

========================================================== */

function getDeliveryCountry() {
    return String(
        document.getElementById("deliveryCountry")?.value || "NG"
    ).trim().toUpperCase();
}

function getSellerCountry(item) {
    return String(
        item?.shippingData?.sellerCountry ||
        item?.sellerCountry ||
        item?.country ||
        "NG"
    ).trim().toUpperCase();
}

function getSellerRegion(item) {
    return String(
        item?.shippingData?.sellerState ||
        item?.shippingData?.sellerRegion ||
        item?.sellerState ||
        item?.sellerRegion ||
        item?.pickupState ||
        ""
    ).trim();
}

function getBuyerRegion() {
    return String(
        document.getElementById("deliveryState")?.value || ""
    ).trim();
}

/* Calculates:
   - same country + both regions known -> region-to-region
   - different countries -> country-to-country
   - same country but region data unavailable -> country-level fallback
*/
function calculateItemDeliveryDistance(item, buyerCountry, buyerRegion) {
    const sellerCountry = getSellerCountry(item);
    const sellerRegion = getSellerRegion(item);

    if (!buyerCountry) return 0;

    if (sellerCountry === buyerCountry) {
        const regionDistance =
            calculateRegionDistance(
                buyerCountry,
                sellerRegion,
                buyerRegion
            );

        if (regionDistance > 0) return regionDistance;

        return 20;
    }

    return calculateCountryDistance(
        sellerCountry,
        buyerCountry
    );
}

function getCartDistancesInternational() {
    const buyerCountry = getDeliveryCountry();
    const buyerRegion = getBuyerRegion();

    return cartItems.map(item => ({
        productId: getProductId(item),
        sellerCountry: getSellerCountry(item),
        sellerRegion: getSellerRegion(item),
        buyerCountry,
        buyerRegion,
        distance: calculateItemDeliveryDistance(
            item,
            buyerCountry,
            buyerRegion
        )
    }));
}

function calculateCartDistanceInternational() {
    const distances = getCartDistancesInternational();
    if (!distances.length) return 0;
    return Math.max(...distances.map(x => x.distance));
}

/* Replace the old calculateCartDistance() calls used by delivery
   pricing with this version. */
function calculateCartDistanceForCheckout() {
    return calculateCartDistanceInternational();
}

/* Country selector + dynamic region/state selector */
function initializeInternationalLocationSelectors() {
    const countrySelect =
        document.getElementById("deliveryCountry");

    const stateSelect =
        document.getElementById("deliveryState");

    if (!countrySelect) return;

    populateCountrySelect(countrySelect, {
        selected: "NG",
        placeholder: "Select country"
    });

    function updateRegions() {
        const countryCode = countrySelect.value;
        const regions = getRegions(countryCode);

        if (!stateSelect) return;

        stateSelect.innerHTML = "";

        if (!countryCode) {
            stateSelect.innerHTML =
                '<option value="">Select state / region</option>';
            return;
        }

        if (!regions.length) {
            stateSelect.innerHTML =
                '<option value="">Enter state / region</option>';
            stateSelect.removeAttribute("required");
            stateSelect.setAttribute("placeholder", "Enter state / region");
            stateSelect.style.display = "none";

            const hint =
                document.getElementById("deliveryStateHint");

            if (hint) {
                hint.style.display = "block";
                hint.textContent =
                    "State/region dataset not available for this country; enter it manually.";
            }
            return;
        }

        stateSelect.style.display = "";
        stateSelect.setAttribute("required", "required");
        stateSelect.innerHTML =
            '<option value="">Select state / region</option>';

        regions
            .slice()
            .sort((a,b) => a.name.localeCompare(b.name))
            .forEach(region => {
                const option = document.createElement("option");
                option.value = region.name;
                option.textContent = region.name;
                stateSelect.appendChild(option);
            });

        const hint =
            document.getElementById("deliveryStateHint");

        if (hint) hint.style.display = "none";
    }

    countrySelect.addEventListener("change", () => {
        selectedDelivery = null;
        updateRegions();

        const currencyInfo =
            document.getElementById("buyerCurrencyInfo");

        const currencyName =
            document.getElementById("buyerCurrencyName");

        const country =
            getCountryByCode(countrySelect.value);

        if (currencyInfo && country) {
            currencyInfo.style.display = "block";
            if (currencyName) {
                currencyName.textContent =
                    `${country.currency} (${country.name})`;
            }
        }

        renderDeliveryServices();
        updatePaymentSummary();
        updatePayButton();
    });

    if (countrySelect.value === "NG") {
        updateRegions();
    }
}

/* Replace getDeliveryOptions() with this version. */
function getDeliveryOptionsInternational(buyerCountry) {
    const distance = calculateCartDistanceInternational();
    const weight = getTotalWeight();
    const size = getTotalSize();

    const distances = getCartDistancesInternational();

    const farthestSeller =
        distances.reduce(
            (far, current) =>
                !far || current.distance > far.distance
                    ? current
                    : far,
            null
        );

    return DELIVERY_SERVICES.map(service => ({
        ...service,
        price: calculateDeliveryPrice(
            service,
            distance,
            weight,
            size
        ),
        distance,
        weight,
        size,
        farthestSeller
    }));
}

/* IMPORTANT:
   Replace the body of the old getDeliveryOptions(buyerState)
   with this implementation. */
function getDeliveryOptions(buyerState) {
    return getDeliveryOptionsInternational(
        getDeliveryCountry()
    );
}

/* Replace getDeliveryDetails() with this version so the order
   stores country + region. */
function getDeliveryDetailsInternational() {
    return {
        name:
            document.getElementById("buyerName")?.value?.trim() || "",
        phone:
            document.getElementById("buyerPhone")?.value?.trim() || "",
        email:
            document.getElementById("buyerEmail")?.value?.trim() || "",
        country:
            getDeliveryCountry(),
        state:
            document.getElementById("deliveryState")?.value?.trim() || "",
        city:
            document.getElementById("deliveryCity")?.value?.trim() || "",
        area:
            document.getElementById("deliveryArea")?.value?.trim() || "",
        postalCode:
            document.getElementById("deliveryPostalCode")?.value?.trim() || "",
        address:
            document.getElementById("deliveryAddress")?.value?.trim() || "",
        instructions:
            document.getElementById("deliveryInstructions")?.value?.trim() || ""
    };
}

/* In your existing getDeliveryDetails(), add:
   country: getDeliveryCountry(),
   and keep state as the region/state value.

   In createOrder(), change:
       distanceKm: calculateCartDistance(delivery.state)
   to:
       distanceKm: calculateCartDistanceInternational()

   And add:
       country: delivery.country

   to the delivery object.
*/

/* IMPORTANT:
   Firestore products should contain seller country and region.
   When loading products, include:
       sellerCountry: firestoreProduct.sellerCountry || "NG",
       sellerState: firestoreProduct.pickupState || firestoreProduct.sellerState || ""

   For Nigeria this gives:
       NG + Lagos -> NG + Rivers
   For USA:
       US + California -> US + New York
   For international:
       US -> CN
*/
