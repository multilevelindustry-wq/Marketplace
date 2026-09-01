
import {
    auth,
    db
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   CART STORAGE
========================================================== */

const CART_STORAGE_KEY =
    "yourStoreCart";


/* ==========================================================
   GLOBAL CHECKOUT STATE
========================================================== */

let cartItems = [];

let selectedDelivery = null;

let selectedPaymentMethod = null;

let currentOrder = null;


/* ==========================================================
   DELIVERY DEFAULTS
========================================================== */

const DEFAULT_SELLER_STATE =
    "Lagos";

const MAX_DISTANCE_FALLBACK =
    450;


/* ==========================================================
   NIGERIA STATE DISTANCES
   APPROXIMATE ROAD DISTANCES FROM LAGOS
========================================================== */

const STATE_DISTANCES = {

    Lagos: 0,

    Ogun: 105,

    Oyo: 155,

    Osun: 235,

    Ondo: 320,

    Ekiti: 330,

    Edo: 315,

    Delta: 430,

    Kwara: 390,

    Kogi: 450,

    Benue: 650,

    Nasarawa: 720,

    Niger: 620,

    FCT: 760,

    Kaduna: 900,

    Kano: 1000,

    Katsina: 1100,

    Jigawa: 1080,

    Bauchi: 980,

    Gombe: 1100,

    Yobe: 1300,

    Borno: 1450,

    Plateau: 1050,

    Taraba: 1200,

    Adamawa: 1300,

    Ebonyi: 650,

    Enugu: 570,

    Anambra: 530,

    Abia: 620,

    Imo: 600,

    "Rivers": 610,

    "Akwa Ibom": 750,

    "Cross River": 820,

    Bayelsa: 650,

    Sokoto: 1300,

    Kebbi: 1050,

    Zamfara: 1100

};


/* ==========================================================
   SIZE VALUES
========================================================== */

const SIZE_VALUES = {

    small: 4,

    medium: 7,

    large: 10,

    extra_large: 13

};


/* ==========================================================
   GET PRODUCT ID
========================================================== */

function getProductId(item) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return "";

    }


    return String(

        item.productId ||

        item.id ||

        item.productID ||

        item.firestoreId ||

        ""

    ).trim();

}


/* ==========================================================
   GET CART ITEMS
========================================================== */

function getCartItems() {

    try {

        const savedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if (!savedCart) {

            return [];

        }


        const parsedCart =
            JSON.parse(
                savedCart
            );


        if (
            !Array.isArray(
                parsedCart
            )
        ) {

            return [];

        }


        return parsedCart;

    }

    catch (error) {

        console.error(
            "Unable to load cart:",
            error
        );

        return [];

    }

}


/* ==========================================================
   LOAD PRODUCT FROM FIRESTORE
========================================================== */

async function getFirestoreProduct(
    productId
) {

    if (!productId) {

        return null;

    }


    try {

        const productReference =
            doc(
                db,
                "products",
                productId
            );


        const productSnapshot =
            await getDoc(
                productReference
            );


        if (
            !productSnapshot.exists()
        ) {

            console.error(
                `Product ${productId} was not found in Firestore.`
            );

            return null;

        }


        return {

            id:
                productSnapshot.id,

            ...productSnapshot.data()

        };

    }

    catch (error) {

        console.error(
            "Firestore product error:",
            error
        );

        return null;

    }

}


/* ==========================================================
   GET PRODUCT SHIPPING DATA
========================================================== */

async function getProductShippingData(
    item
) {

    const productId =
        getProductId(item);


    if (!productId) {

        console.error(
            "Cart item has no product ID:",
            item
        );

        return null;

    }


    const product =
        await getFirestoreProduct(
            productId
        );


    if (!product) {

        return null;

    }


    /* ======================================================
       WEIGHT
    ====================================================== */

    const weightKg =
        Number(

            product.packageWeightKg ??

            product.deliveryCalculation
                ?.weightKg ??

            0

        );


    /* ======================================================
       PACKAGE SIZE
    ====================================================== */

    let packageSize =

        product.packageSize ??

        product.deliveryCalculation
            ?.packageSize ??

        "";


    packageSize =
        String(
            packageSize
        )
        .trim()
        .toLowerCase();


    /* ======================================================
       SELLER STATE
    ====================================================== */

    const sellerState =

        product.pickupState ||

        product.deliveryCalculation
            ?.pickupState ||

        DEFAULT_SELLER_STATE;


    /* ======================================================
       FREE SHIPPING
    ====================================================== */

    const freeShipping =
        Boolean(

            product.freeShipping ??

            product.deliveryCalculation
                ?.freeShipping ??

            false

        );


    return {

        productId,

        weightKg:
            Number.isFinite(
                weightKg
            )
                ? weightKg
                : 0,

        packageSize,

        sellerState:
            String(
                sellerState
            ).trim(),

        freeShipping

    };

}


/* ==========================================================
   LOAD ALL FIRESTORE SHIPPING DATA
========================================================== */

async function loadCartShippingData() {

    if (!cartItems.length) {

        console.log(
            "Cart is empty."
        );

        return;

    }


    console.log(
        "Loading product shipping data..."
    );


    const updatedItems =
        [];


    for (
        const item of cartItems
    ) {

        const shippingData =
            await getProductShippingData(
                item
            );


        if (!shippingData) {

            console.warn(
                "Shipping data unavailable for cart item:",
                item
            );

            updatedItems.push({

                ...item,

                shippingData: {

                    weightKg: 0,

                    packageSize: "",

                    sellerState:
                        DEFAULT_SELLER_STATE,

                    freeShipping:
                        false

                }

            });


            continue;

        }


        updatedItems.push({

            ...item,

            shippingData

        });

    }


    cartItems =
        updatedItems;


    console.log(
        "Cart with Firestore shipping data:",
        cartItems
    );

}


/* ==========================================================
   GET ITEM QUANTITY
========================================================== */

function getItemQuantity(item) {

    const quantity =
        Number(
            item?.quantity
        );


    if (
        !Number.isFinite(
            quantity
        ) ||
        quantity <= 0
    ) {

        return 1;

    }


    return quantity;

}


/* ==========================================================
   GET ITEM WEIGHT
   FIRESTORE SHIPPING DATA
========================================================== */

function getItemWeight(item) {

    if (!item) {
        return 0;
    }

    const quantity =
        Number(item.quantity) || 1;

    const weight =
        Number(
            item.packageWeightKg ??
            item.deliveryCalculation?.weightKg ??
            item.weightKg ??
            item.packageWeight ??
            item.weight ??
            0
        );

    if (
        !Number.isFinite(weight) ||
        weight <= 0
    ) {
        return 0;
    }

    return weight * quantity;
}

/* ==========================================================
   GET ITEM SIZE
   FIRESTORE SHIPPING DATA
========================================================== */

function getItemSize(item) {

    if (!item) {
        return 0;
    }

    const quantity =
        Number(item.quantity) || 1;

    const rawSize =
        item.packageSize ??
        item.deliveryCalculation?.packageSize ??
        item.size ??
        "";

    /* ------------------------------------------------------
       NUMERIC SIZE
    ------------------------------------------------------ */

    const numericSize =
        Number(rawSize);

    if (
        Number.isFinite(numericSize) &&
        numericSize > 0
    ) {
        return numericSize * quantity;
    }


    /* ------------------------------------------------------
       TEXT SIZE
    ------------------------------------------------------ */

    const size =
        String(rawSize)
            .trim()
            .toLowerCase();


    const SIZE_VALUES = {

        small: 4,

        medium: 7,

        large: 10,

        extra_large: 13,

        "extra large": 13,

        xl: 13

    };


    return (
        (SIZE_VALUES[size] || 0) *
        quantity
    );
}


/* ==========================================================
   GET TOTAL WEIGHT
========================================================== */

function getTotalWeight() {

    if (
        !Array.isArray(cartItems) ||
        cartItems.length === 0
    ) {
        return 0;
    }

    return cartItems.reduce(
        function(total, item) {

            return (
                total +
                getItemWeight(item)
            );

        },
        0
    );
}


/* ==========================================================
   GET TOTAL SIZE
========================================================== */

function getTotalSize() {

    if (
        !Array.isArray(cartItems) ||
        cartItems.length === 0
    ) {
        return 0;
    }

    return cartItems.reduce(
        function(total, item) {

            return (
                total +
                getItemSize(item)
            );

        },
        0
    );
}


/* ==========================================================
   GET SELLER STATE
========================================================== */

function getSellerState(item) {

    return String(

        item?.shippingData
            ?.sellerState ||

        item?.sellerState ||

        DEFAULT_SELLER_STATE

    ).trim();

}


/* ==========================================================
   INITIALIZE CART
========================================================== */

async function initializeCart() {

    cartItems =
        getCartItems();


    console.log(
        "Cart loaded:",
        cartItems
    );


    if (!cartItems.length) {

        console.log(
            "Cart is empty."
        );

        return;

    }


    await loadCartShippingData();

}


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async function() {

        await initializeCart();

    }

);

/* ==========================================================
   PAYMENT.JS
   BATCH 2 / 5

   STATE-TO-STATE DELIVERY CALCULATION
   NO SHIPBUBBLE API
========================================================== */


/* ==========================================================
   DELIVERY SERVICES
========================================================== */



const DELIVERY_SERVICES = [

    {
        id: "standard",

        name:
            "3-7 days Standard Delivery",

        description:
            "Affordable nationwide delivery",

        basePrice:
            4000,

        pricePerKg:
            650,

        pricePerKm:
            9,

        sizeRate:
            650,

        multiplier:
            2.45
    },


    {
        id: "economy",

        name:
            "3-10 days Economy Delivery",

        description:
            "Lowest-cost delivery option",

        basePrice:
            3000,

        pricePerKg:
            600,

        pricePerKm:
            9,

        sizeRate:
            600,

        multiplier:
            2.3
    },


    {
        id: "express",

        name:
            "1-5 days Express Delivery",

        description:
            "Faster delivery for urgent orders",

        basePrice:
            4500,

        pricePerKg:
            550,

        pricePerKm:
            10,

        sizeRate:
            850,

        multiplier:
            2.55
    },


  

    {
        id: "premium",

        name:
            "1-4 days Premium Delivery",

        description:
            "Priority handling and delivery",

        basePrice:
            6000,

        pricePerKg:
            700,

        pricePerKm:
            11,

        sizeRate:
            2100,

        multiplier:
            2.65
    },


    {
        id: "heavy_cargo",

        name:
            "5-14 days Heavy Cargo Delivery",

        description:
            "For large or heavy packages",

        basePrice:
            8500,

        pricePerKg:
            800,

        pricePerKm:
            10,

        sizeRate:
            2200,

        multiplier:
            2.65
    }

];


/* ==========================================================
   NORMALIZE STATE NAME
========================================================== */

function normalizeState(state) {

    return String(
        state || ""
    )
    .trim()
    .replace(
        /\s+/g,
        " "
    );

}


/* ==========================================================
   GET STATE DISTANCE FROM LAGOS
========================================================== */

function getStateDistanceFromLagos(
    state
) {

    const normalizedState =
        normalizeState(
            state
        );


    const distance =
        STATE_DISTANCES[
            normalizedState
        ];


    if (
        typeof distance !==
        "number"
    ) {

        return MAX_DISTANCE_FALLBACK;

    }


    return distance;

}


/* ==========================================================
   CALCULATE STATE-TO-STATE DISTANCE
========================================================== */

function calculateDistance(
    sellerState,
    buyerState
) {

    sellerState =
        normalizeState(
            sellerState
        );


    buyerState =
        normalizeState(
            buyerState
        );


    if (!buyerState) {

        return 0;

    }


    if (!sellerState) {

        sellerState =
            DEFAULT_SELLER_STATE;

    }


    /* ======================================================
       SAME STATE
    ====================================================== */

    if (
        sellerState ===
        buyerState
    ) {

        /*
         * We do not use zero because
         * there is still local movement
         * inside the state.
         */

        return 60;

    }


    const sellerDistance =
        getStateDistanceFromLagos(
            sellerState
        );


    const buyerDistance =
        getStateDistanceFromLagos(
            buyerState
        );


    const distance =
        Math.abs(

            sellerDistance -
            buyerDistance

        );


    return Math.max(

        Math.round(
            distance
        ),

        20

    );

}


/* ==========================================================
   GET ALL SELLER STATES IN CART
========================================================== */

function getCartSellerStates() {

    if (
        !Array.isArray(
            cartItems
        ) ||
        !cartItems.length
    ) {

        return [];

    }


    return cartItems.map(

        item => {

            return getSellerState(
                item
            );

        }

    );

}


/* ==========================================================
   GET CART DISTANCES
========================================================== */

function getCartDistances(
    buyerState
) {

    if (
        !Array.isArray(
            cartItems
        ) ||
        !cartItems.length
    ) {

        return [];

    }


    return cartItems.map(

        item => {

            const sellerState =
                getSellerState(
                    item
                );


            const distance =
                calculateDistance(

                    sellerState,

                    buyerState

                );


            return {

                productId:
                    getProductId(
                        item
                    ),

                sellerState,

                buyerState,

                distance

            };

        }

    );

}


/* ==========================================================
   GET MAX CART DISTANCE
   Used for the delivery calculation
========================================================== */

function calculateCartDistance(
    buyerState
) {

    const distances =
        getCartDistances(
            buyerState
        );


    if (
        !distances.length
    ) {

        return 0;

    }


    return Math.max(

        ...distances.map(

            item =>
                item.distance

        )

    );

}


/* ==========================================================
   GET FARTHEST SELLER
========================================================== */

function getFarthestSeller(
    buyerState
) {

    const distances =
        getCartDistances(
            buyerState
        );


    if (
        !distances.length
    ) {

        return null;

    }


    return distances.reduce(

        (
            farthest,
            current
        ) => {

            if (
                !farthest
            ) {

                return current;

            }


            return current.distance >
                farthest.distance

                ? current

                : farthest;

        },

        null

    );

}


/* ==========================================================
   CALCULATE DELIVERY PRICE
========================================================== */

function calculateDeliveryPrice(
    service,
    distance,
    weight,
    size
) {

    distance =
        Number(distance) || 0;

    weight =
        Number(weight) || 0;

    size =
        Number(size) || 0;


    const distanceCost =
        distance *
        Number(service.pricePerKm || 0);


    const weightCost =
        weight *
        Number(service.pricePerKg || 0);


    const sizeCost =
        size *
        Number(service.sizeRate || 0);


    const rawPrice =
        Number(service.basePrice || 0) +
        distanceCost +
        weightCost +
        sizeCost;


    const multiplier =
        Number(service.multiplier || 1);


    const finalPrice =
        rawPrice *
        multiplier;


    return Math.max(
        Math.round(finalPrice / 50) * 50,
        Number(service.basePrice || 0)
    );
}


/* ==========================================================
   GET DELIVERY OPTIONS
========================================================== */

function getDeliveryOptions(
    buyerState
) {

    const distance =
        calculateCartDistance(
            buyerState
        );


    const weight =
        getTotalWeight();


    const size =
        getTotalSize();


    const farthestSeller =
        getFarthestSeller(
            buyerState
        );


    return DELIVERY_SERVICES.map(

        service => {

            const price =
                calculateDeliveryPrice(

                    service,

                    distance,

                    weight,

                    size

                );


            return {

                ...service,

                price,

                distance,

                weight,

                size,

                farthestSeller:
                    farthestSeller

            };

        }

    );

}


/* ==========================================================
   DELIVERY CALCULATION DEBUG
========================================================== */

function logDeliveryCalculation(
    buyerState
) {

    const distances =
        getCartDistances(
            buyerState
        );


    console.log(
        "=========================================="
    );


    console.log(
        "DELIVERY CALCULATION"
    );


    console.log(
        "Buyer State:",
        buyerState
    );


    console.log(
        "Total Weight:",
        getTotalWeight(),
        "kg"
    );


    console.log(
        "Total Size:",
        getTotalSize()
    );


    console.table(
        distances
    );


    console.log(
        "Maximum Delivery Distance:",
        calculateCartDistance(
            buyerState
        ),
        "km"
    );


    console.log(
        "Farthest Seller:",
        getFarthestSeller(
            buyerState
        )
    );


    console.log(
        "Delivery Options:",
        getDeliveryOptions(
            buyerState
        )
    );


    console.log(
        "=========================================="
    );

}

/* ==========================================================
   PAYMENT.JS
   BATCH 3 OF 5

   FIRESTORE PRODUCT SHIPPING DATA
   + LOCAL STATE-TO-STATE DELIVERY CALCULATION

   IMPORTANT:
   NO SHIPBUBBLE API
========================================================== */


/* ==========================================================
   FIRESTORE PRODUCT CACHE
========================================================== */

const firestoreProductCache = new Map();


/* ==========================================================
   GET PRODUCT ID FROM CART ITEM
========================================================== */

function getCartProductId(item) {

    if (!item) {
        return "";
    }

    return String(
        item.productId ||
        item.productID ||
        item.id ||
        item.product_id ||
        ""
    ).trim();

}


/* ==========================================================
   GET PRODUCT FROM FIRESTORE
========================================================== */

async function getProductFromFirestore(productId) {

    if (!productId) {

        console.warn(
            "Cart item has no product ID."
        );

        return null;

    }


    /* ------------------------------------------------------
       CHECK CACHE
    ------------------------------------------------------ */

    if (
        firestoreProductCache.has(
            productId
        )
    ) {

        return firestoreProductCache.get(
            productId
        );

    }


    try {

        const productReference =
            doc(
                db,
                "products",
                productId
            );


        const productSnapshot =
            await getDoc(
                productReference
            );


        if (
            !productSnapshot.exists()
        ) {

            console.warn(
                `Product ${productId} was not found in Firestore.`
            );

            return null;

        }


        const product = {

            id:
                productSnapshot.id,

            ...productSnapshot.data()

        };


        firestoreProductCache.set(
            productId,
            product
        );


        return product;

    }

    catch (error) {

        console.error(
            `Unable to load product ${productId}:`,
            error
        );

        return null;

    }

}


/* ==========================================================
   LOAD ALL CART PRODUCTS FROM FIRESTORE
========================================================== */

async function loadCartProductsFromFirestore() {

    if (
        !Array.isArray(cartItems) ||
        !cartItems.length
    ) {

        return [];

    }


    const loadedItems = [];


    for (
        const cartItem of cartItems
    ) {

        const productId =
            getCartProductId(
                cartItem
            );


        if (!productId) {

            console.warn(
                "Cart item without product ID:",
                cartItem
            );

            loadedItems.push(
                cartItem
            );

            continue;

        }


        const firestoreProduct =
            await getProductFromFirestore(
                productId
            );


        if (!firestoreProduct) {

            console.warn(
                `Product ${productId} could not be loaded.`
            );

            loadedItems.push(
                cartItem
            );

            continue;

        }


        /*
         * Keep the cart quantity.
         * Firestore supplies the official
         * shipping information.
         */

        loadedItems.push({

            ...cartItem,

            id:
                productId,

            productId:
                productId,

            name:
                firestoreProduct.name ||
                cartItem.name ||
                "Product",

            price:
                Number(
                    cartItem.price ??
                    firestoreProduct.buyerPrice ??
                    firestoreProduct.price ??
                    0
                ),

            quantity:
                Number(
                    cartItem.quantity
                ) || 1,


            /* --------------------------------------------
               OFFICIAL FIRESTORE SHIPPING DATA
            -------------------------------------------- */

            packageWeightKg:
                Number(
                    firestoreProduct
                        .packageWeightKg
                ) || 0,

            packageWeight:
                firestoreProduct
                    .packageWeight,

            packageWeightUnit:
                firestoreProduct
                    .packageWeightUnit,

            packageSize:
                firestoreProduct
                    .packageSize,

            packageDimensions:
                firestoreProduct
                    .packageDimensions,


            /* --------------------------------------------
               SELLER LOCATION
            -------------------------------------------- */

            sellerState:
                firestoreProduct
                    .pickupState ||
                firestoreProduct
                    .sellerState ||
                cartItem.sellerState ||
                DEFAULT_SELLER_STATE,

            pickupState:
                firestoreProduct
                    .pickupState,

            pickupLga:
                firestoreProduct
                    .pickupLga,

            pickupCity:
                firestoreProduct
                    .pickupCity,

            sellerId:
                firestoreProduct
                    .sellerId ||
                cartItem.sellerId ||
                ""

        });

    }


    return loadedItems;

}


/* ==========================================================
   REFRESH CART WITH FIRESTORE DATA
========================================================== */

async function refreshCartShippingData() {

    try {

        const updatedItems =
            await loadCartProductsFromFirestore();


        cartItems =
            updatedItems;


        console.log(
            "Cart with Firestore shipping data:",
            cartItems
        );


        updateProductSummary();

    }

    catch (error) {

        console.error(
            "Unable to refresh cart shipping data:",
            error
        );

    }

}


/* ==========================================================
   GET FIRESTORE WEIGHT
========================================================== */

function getFirestoreItemWeight(
    item
) {

    const quantity =
        Number(
            item.quantity
        ) || 1;


    const weightKg =
        Number(
            item.packageWeightKg
        );


    if (
        Number.isFinite(weightKg) &&
        weightKg > 0
    ) {

        return (
            weightKg *
            quantity
        );

    }


    /*
     * Fallback for products where the
     * Firestore value uses another field.
     */

    const weight =
        Number(
            item.packageWeight ??
            item.weightKg ??
            item.weight ??
            0
        );


    if (
        !Number.isFinite(weight) ||
        weight <= 0
    ) {

        return 0;

    }


    const unit =
        String(
            item.packageWeightUnit ||
            "kg"
        )
        .trim()
        .toLowerCase();


    let weightInKg =
        weight;


    if (
        unit === "g" ||
        unit === "gram" ||
        unit === "grams"
    ) {

        weightInKg =
            weight / 1000;

    }


    if (
        unit === "mg" ||
        unit === "milligram" ||
        unit === "milligrams"
    ) {

        weightInKg =
            weight / 1000000;

    }


    if (
        unit === "lb" ||
        unit === "lbs" ||
        unit === "pound" ||
        unit === "pounds"
    ) {

        weightInKg =
            weight * 0.453592;

    }


    return (
        weightInKg *
        quantity
    );

}


/* ==========================================================
   GET FIRESTORE SIZE
========================================================== */

function getFirestoreItemSize(
    item
) {

    const quantity =
        Number(
            item.quantity
        ) || 1;


    const rawSize =
        String(
            item.packageSize ||
            item.size ||
            ""
        )
        .trim()
        .toLowerCase();


    const sizeValues = {

        small: 5,

        medium: 6,

        large: 9,

        extra_large: 11,

        "extra-large": 11,

        xlarge: 11,

        xl: 7

    };


    const numericSize =
        Number(
            item.packageSize
        );


    if (
        Number.isFinite(numericSize) &&
        numericSize > 0
    ) {

        return (
            numericSize *
            quantity
        );

    }


    return (
        (sizeValues[rawSize] || 0) *
        quantity
    );

}

/* ==========================================================
   GET PRODUCTS TOTAL
========================================================== */

function getProductsTotal() {

    if (
        !Array.isArray(cartItems) ||
        cartItems.length === 0
    ) {
        return 0;
    }

    return cartItems.reduce(
        function(total, item) {

            const quantity =
                Number(item.quantity) || 1;

            const price =
                Number(
                    item.price ??
                    item.buyerPrice ??
                    item.amount ??
                    0
                );

            return (
                total +
                (price * quantity)
            );

        },
        0
    );
}


/* ==========================================================
   LOAD FIRESTORE SHIPPING DATA
   WHEN PAYMENT PAGE OPENS
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await refreshCartShippingData();

    }
);

/* ==========================================================
   PAYMENT.JS
   BATCH 4 OF 5

   DELIVERY UI
   + PAYMENT METHOD UI
   + PAYMENT SUMMARY
========================================================== */


/* ==========================================================
   RENDER DELIVERY SERVICES
========================================================== */

function renderDeliveryServices() {

    const state =
        document.getElementById(
            "deliveryState"
        )?.value?.trim();


    const container =
        document.getElementById(
            "deliveryServices"
        );


    const card =
        document.getElementById(
            "deliveryServicesCard"
        );


    if (!container || !card) {

        return;

    }


    if (!state) {

        container.innerHTML = "";

        card.style.display = "none";

        selectedDelivery = null;

        updatePaymentSummary();

        updatePayButton();

        return;

    }


    if (
        !Array.isArray(cartItems) ||
        !cartItems.length
    ) {

        container.innerHTML = `

            <div class="delivery-empty">

                Your cart is empty.

            </div>

        `;

        card.style.display = "block";

        return;

    }


    const options =
        getDeliveryOptions(
            state
        );


    container.innerHTML =
        options
            .map(
                function(service) {

                    return `

                        <label
                            class="delivery-option"
                            data-delivery-id="${escapeHTML(service.id)}"
                        >

                            <input
                                type="radio"
                                name="deliveryService"
                                value="${escapeHTML(service.id)}"
                            >

                            <div class="delivery-info">

                                <strong>
                                    ${escapeHTML(service.name)}
                                </strong>

                                <span>
                                    ${escapeHTML(service.description)}
                                </span>

                                <small>

                                    ${service.distance} km

                                    ·

                                    ${service.weight.toFixed(2)} kg

                                    ·

                                    Size ${service.size}

                                </small>

                            </div>


                            <strong
                                class="delivery-price"
                            >

                                ${formatNaira(
                                    service.price
                                )}

                            </strong>

                        </label>

                    `;

                }
            )
            .join("");


    card.style.display = "block";


    attachDeliverySelection();

}


/* ==========================================================
   DELIVERY SELECTION
========================================================== */

function attachDeliverySelection() {

    const inputs =
        document.querySelectorAll(
            'input[name="deliveryService"]'
        );


    inputs.forEach(
        function(input) {

            input.addEventListener(
                "change",
                function() {

                    const state =
                        document.getElementById(
                            "deliveryState"
                        )?.value?.trim();


                    if (!state) {

                        return;

                    }


                    const options =
                        getDeliveryOptions(
                            state
                        );


                    selectedDelivery =
                        options.find(
                            function(option) {

                                return (
                                    option.id ===
                                    this.value
                                );

                            }.bind(this)
                        ) || null;


                    /*
                     * Highlight selected
                     * delivery card.
                     */

                    document
                        .querySelectorAll(
                            ".delivery-option"
                        )
                        .forEach(
                            function(option) {

                                option.classList
                                    .remove(
                                        "selected"
                                    );

                            }
                        );


                    const selectedOption =
                        this.closest(
                            ".delivery-option"
                        );


                    if (selectedOption) {

                        selectedOption.classList
                            .add(
                                "selected"
                            );

                    }


                    updatePaymentSummary();

                    updatePayButton();

                }
            );

        }
    );

}


/* ==========================================================
   GET DELIVERY SERVICE AGAIN
========================================================== */

function getSelectedDeliveryService() {

    if (!selectedDelivery) {

        return null;

    }


    const state =
        document.getElementById(
            "deliveryState"
        )?.value?.trim();


    if (!state) {

        return null;

    }


    const options =
        getDeliveryOptions(
            state
        );


    return (
        options.find(
            function(option) {

                return (
                    option.id ===
                    selectedDelivery.id
                );

            }
        ) || null
    );

}


/* ==========================================================
   UPDATE DELIVERY AMOUNT
========================================================== */

function updateDeliveryAmount() {

    const element =
        document.getElementById(
            "delivery"
        );


    if (!element) {

        return;

    }


    const delivery =
        getSelectedDeliveryService();


    element.textContent =
        formatNaira(
            delivery
                ? delivery.price
                : 0
        );

}


/* ==========================================================
   UPDATE PRODUCT AMOUNT
========================================================== */

function updateProductSummary() {

    const element =
        document.getElementById(
            "items"
        );


    if (!element) {

        return;

    }


    const total =
        getProductsTotal();


    element.textContent =
        formatNaira(
            total
        );

}


/* ==========================================================
   UPDATE TOTAL
========================================================== */

function updateTotalAmount() {

    const element =
        document.getElementById(
            "total"
        );


    if (!element) {

        return;

    }


    const products =
        getProductsTotal();


    const delivery =
        getSelectedDeliveryService();


    const deliveryPrice =
        delivery
            ? delivery.price
            : 0;


    const total =
        products +
        deliveryPrice;


    element.textContent =
        formatNaira(
            total
        );

}


/* ==========================================================
   UPDATE COMPLETE PAYMENT SUMMARY
========================================================== */

function updatePaymentSummary() {

    updateProductSummary();

    updateDeliveryAmount();

    updateTotalAmount();

}


/* ==========================================================
   GET TOTAL PAYABLE
========================================================== */

function getTotalPayable() {

    const products =
        getProductsTotal();


    const delivery =
        getSelectedDeliveryService();


    const deliveryPrice =
        delivery
            ? delivery.price
            : 0;


    return (
        products +
        deliveryPrice
    );

}


/* ==========================================================
   FORMAT NAIRA
========================================================== */

function formatNaira(
    amount
) {

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(
        Number(amount) || 0
    );

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* ==========================================================
   SHOW STATUS
========================================================== */

function showStatus(
    message,
    type = "info"
) {

    const elements = [

        document.getElementById(
            "status"
        ),

        document.getElementById(
            "deliveryStatus"
        )

    ].filter(Boolean);


    elements.forEach(
        function(element) {

            element.textContent =
                message;


            element.className =
                `status ${type}`;

        }
    );

}


/* ==========================================================
   DELIVERY RATE BUTTON
========================================================== */

function initializeDeliveryRateButton() {

    const button =
        document.getElementById(
            "getDeliveryRates"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        async function() {

            if (
                !Array.isArray(cartItems) ||
                !cartItems.length
            ) {

                showStatus(
                    "Your cart is empty.",
                    "error"
                );

                return;

            }


            const state =
                document.getElementById(
                    "deliveryState"
                )?.value?.trim();


            if (!state) {

                showStatus(
                    "Please select your delivery state.",
                    "error"
                );

                return;

            }


            /*
             * Make sure the latest package
             * weight and size come from
             * Firestore before calculating.
             */

            button.disabled = true;

            button.textContent =
                "Calculating...";


            try {

                await refreshCartShippingData();


                renderDeliveryServices();


                updatePaymentSummary();


                showStatus(
                    "Delivery services calculated successfully.",
                    "success"
                );

            }

            catch(error) {

                console.error(
                    "Delivery calculation error:",
                    error
                );


                showStatus(
                    "Unable to calculate delivery services.",
                    "error"
                );

            }

            finally {

                button.disabled = false;

                button.textContent =
                    "Get available delivery services";

            }

        }
    );

}


/* ==========================================================
   STATE CHANGE
========================================================== */

function initializeStateListener() {

    const state =
        document.getElementById(
            "deliveryState"
        );


    if (!state) {

        return;

    }


    state.addEventListener(
        "change",
        function() {

            /*
             * A different buyer state means
             * the previous delivery price is
             * no longer valid.
             */

            selectedDelivery = null;


            const container =
                document.getElementById(
                    "deliveryServices"
                );


            const card =
                document.getElementById(
                    "deliveryServicesCard"
                );


            if (container) {

                container.innerHTML = "";

            }


            if (card) {

                card.style.display =
                    "none";

            }


            updatePaymentSummary();

            updatePayButton();

        }
    );

}


/* ==========================================================
   GET DELIVERY DETAILS
========================================================== */

function getDeliveryDetails() {

    return {

        name:
            document.getElementById(
                "buyerName"
            )?.value
            ?.trim() || "",


        phone:
            document.getElementById(
                "buyerPhone"
            )?.value
            ?.trim() || "",


        email:
            document.getElementById(
                "buyerEmail"
            )?.value
            ?.trim() || "",


        state:
            document.getElementById(
                "deliveryState"
            )?.value
            ?.trim() || "",


        city:
            document.getElementById(
                "deliveryCity"
            )?.value
            ?.trim() || "",


        area:
            document.getElementById(
                "deliveryArea"
            )?.value
            ?.trim() || "",


        postalCode:
            document.getElementById(
                "deliveryPostalCode"
            )?.value
            ?.trim() || "",


        address:
            document.getElementById(
                "deliveryAddress"
            )?.value
            ?.trim() || "",


        instructions:
            document.getElementById(
                "deliveryInstructions"
            )?.value
            ?.trim() || ""

    };

}


/* ==========================================================
   VALIDATE DELIVERY DETAILS
========================================================== */

function validateDeliveryDetails() {

    const details =
        getDeliveryDetails();


    if (!details.name) {

        showStatus(
            "Please enter your full name.",
            "error"
        );

        return false;

    }


    if (!details.phone) {

        showStatus(
            "Please enter your phone number.",
            "error"
        );

        return false;

    }


    if (!details.email) {

        showStatus(
            "Please enter your email address.",
            "error"
        );

        return false;

    }


    if (!details.state) {

        showStatus(
            "Please select your delivery state.",
            "error"
        );

        return false;

    }


    if (!details.city) {

        showStatus(
            "Please enter your city or town.",
            "error"
        );

        return false;

    }


    if (!details.area) {

        showStatus(
            "Please enter your area.",
            "error"
        );

        return false;

    }


    if (!details.address) {

        showStatus(
            "Please enter your full delivery address.",
            "error"
        );

        return false;

    }


    if (!selectedDelivery) {

        showStatus(
            "Please calculate and select a delivery service.",
            "error"
        );

        return false;

    }


    if (!selectedPaymentMethod) {

        showStatus(
            "Please select a payment method.",
            "error"
        );

        return false;

    }


    return true;

}


/* ==========================================================
   PAYMENT METHOD INITIALIZATION
========================================================== */

function initializePaymentMethods() {

    const options =
        document.querySelectorAll(
            ".option[data-method]"
        );


    options.forEach(
        function(option) {

            option.addEventListener(
                "click",
                function() {

                    const radio =
                        this.querySelector(
                            'input[type="radio"]'
                        );


                    if (
                        !radio ||
                        radio.disabled
                    ) {

                        return;

                    }


                    radio.checked = true;


                    selectedPaymentMethod =
                        radio.value;


                    document
                        .querySelectorAll(
                            ".option[data-method]"
                        )
                        .forEach(
                            function(item) {

                                item.classList
                                    .remove(
                                        "selected"
                                    );

                            }
                        );


                    this.classList.add(
                        "selected"
                    );


                    updatePaymentInterface();

                }
            );

        }
    );


    const radios =
        document.querySelectorAll(
            'input[name="method"]'
        );


    radios.forEach(
        function(radio) {

            radio.addEventListener(
                "change",
                function() {

                    if (this.disabled) {

                        return;

                    }


                    selectedPaymentMethod =
                        this.value;


                    updatePaymentInterface();

                }
            );

        }
    );

}


/* ==========================================================
   UPDATE PAYMENT INTERFACE
========================================================== */

function updatePaymentInterface() {

    const paypalContainer =
        document.getElementById(
            "paypal-button-container"
        );


    const payButton =
        document.getElementById(
            "pay"
        );


    if (
        selectedPaymentMethod ===
        "paypal"
    ) {

        if (paypalContainer) {

            paypalContainer.style.display =
                "block";

        }


        if (payButton) {

            payButton.style.display =
                "none";

        }

    }

    else {

        if (paypalContainer) {

            paypalContainer.style.display =
                "none";

        }


        if (payButton) {

            payButton.style.display =
                "block";

        }

    }


    updatePayButton();

}


/* ==========================================================
   UPDATE PAY BUTTON
========================================================== */

function updatePayButton() {

    const button =
        document.getElementById(
            "pay"
        );


    if (!button) {

        return;

    }


    if (!selectedDelivery) {

        button.disabled = true;

        button.textContent =
            "Select delivery service";

        return;

    }


    if (!selectedPaymentMethod) {

        button.disabled = true;

        button.textContent =
            "Select payment method";

        return;

    }


    const total =
        getTotalPayable();


    button.disabled =
        total <= 0;


    button.textContent =
        `Pay ${formatNaira(total)}`;

}


/* ==========================================================
   BATCH 4 INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeDeliveryRateButton();

        initializeStateListener();

        initializePaymentMethods();

        updatePaymentSummary();

        updatePayButton();

    }
);

/* ==========================================================
   PAYMENT.JS
   BATCH 5 OF 5

   ORDER CREATION
   + PAYSTACK
   + PAYPAL
   + ORDER COMPLETION
========================================================== */


/* ==========================================================
   CREATE ORDER ID
========================================================== */

function createOrderId() {

    const timestamp =
        Date.now().toString(36);

    const random =
        Math.random()
            .toString(36)
            .substring(2, 9)
            .toUpperCase();

    return (
        "ORD-" +
        timestamp +
        "-" +
        random
    );

}


/* ==========================================================
   CREATE ORDER
========================================================== */

function createOrder() {

    const delivery =
        getDeliveryDetails();


    const deliveryService =
        getSelectedDeliveryService();


    if (!deliveryService) {

        throw new Error(
            "Please select a delivery service."
        );

    }


    /*
     * Make sure the order uses the
     * latest Firestore shipping data.
     */

    const products =
        cartItems.map(
            function(item) {

                return {

                    id:
                        getCartProductId(
                            item
                        ),

                    productId:
                        getCartProductId(
                            item
                        ),

                    name:
                        item.name ||
                        "Product",

                    price:
                        Number(
                            item.price
                        ) || 0,

                    quantity:
                        Number(
                            item.quantity
                        ) || 1,

                    weightKg:
                        getFirestoreItemWeight(
                            item
                        ),

                    packageWeightKg:
                        Number(
                            item.packageWeightKg
                        ) || 0,

                    packageSize:
                        item.packageSize ||
                        "",

                    sizeValue:
                        getFirestoreItemSize(
                            item
                        ),

                    dimensions:
                        item.packageDimensions ||
                        null,

                    sellerId:
                        item.sellerId ||
                        "",

                    sellerState:
                        getSellerState(
                            item
                        )

                };

            }
        );


    return {

        id:
            createOrderId(),

        createdAt:
            new Date().toISOString(),

        status:
            "payment_pending",

        paymentStatus:
            "pending",

        paymentMethod:
            selectedPaymentMethod,


        /* ==================================================
           BUYER
        ================================================== */

        buyer: {

            name:
                delivery.name,

            phone:
                delivery.phone,

            email:
                delivery.email

        },


        /* ==================================================
           DELIVERY
        ================================================== */

        delivery: {

            state:
                delivery.state,

            city:
                delivery.city,

            area:
                delivery.area,

            postalCode:
                delivery.postalCode,

            address:
                delivery.address,

            instructions:
                delivery.instructions,


            distanceKm:
                calculateCartDistance(
                    delivery.state
                ),


            totalWeightKg:
                getTotalWeight(),


            totalSize:
                getTotalSize(),


            service: {

                id:
                    deliveryService.id,

                name:
                    deliveryService.name,

                description:
                    deliveryService.description,

                price:
                    deliveryService.price

            }

        },


        /* ==================================================
           PRODUCTS
        ================================================== */

        products:
            products,


        /* ==================================================
           AMOUNTS
        ================================================== */

        amount: {

            products:
                getProductsTotal(),

            delivery:
                deliveryService.price,

            total:
                getTotalPayable(),

            currency:
                "NGN"

        }

    };

}


/* ==========================================================
   SAVE ORDER LOCALLY
========================================================== */

function saveOrderLocally(
    order
) {

    try {

        const existing =
            JSON.parse(
                localStorage.getItem(
                    "adminOrders"
                ) || "[]"
            );


        const orders =
            Array.isArray(existing)
                ? existing
                : [];


        /*
         * Prevent duplicate order IDs.
         */

        const alreadyExists =
            orders.some(
                function(existingOrder) {

                    return (
                        existingOrder.id ===
                        order.id
                    );

                }
            );


        if (!alreadyExists) {

            orders.unshift(
                order
            );

        }


        localStorage.setItem(
            "adminOrders",
            JSON.stringify(
                orders
            )
        );


        localStorage.setItem(
            "lastOrder",
            JSON.stringify(
                order
            )
        );

    }

    catch(error) {

        console.error(
            "Unable to save order:",
            error
        );

    }

}


/* ==========================================================
   MARK ORDER AS PAID
========================================================== */

function markOrderPaid(
    order,
    reference,
    gateway
) {

    if (!order) {

        return;

    }


    order.status =
        "paid";


    order.paymentStatus =
        "paid";


    order.paymentReference =
        reference || "";


    order.paymentGateway =
        gateway || "";


    order.paidAt =
        new Date().toISOString();


    saveOrderLocally(
        order
    );

}


/* ==========================================================
   SAVE ADMIN NOTIFICATION
========================================================== */

function createAdminOrderNotification(
    order
) {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "adminNotifications"
                ) || "[]"
            );


        const notifications =
            Array.isArray(saved)
                ? saved
                : [];


        notifications.unshift({

            id:
                "NOT-" +
                Date.now(),

            type:
                "new_order",

            title:
                "New paid order",

            message:
                `${order.id} has been paid and is ready for processing.`,

            orderId:
                order.id,

            createdAt:
                new Date().toISOString(),

            read:
                false

        });


        localStorage.setItem(
            "adminNotifications",
            JSON.stringify(
                notifications
            )
        );

    }

    catch(error) {

        console.error(
            "Notification error:",
            error
        );

    }

}


/* ==========================================================
   COMPLETE ORDER
========================================================== */

function completeOrder(
    order
) {

    if (!order) {

        return;

    }


    /*
     * Save final order.
     */

    saveOrderLocally(
        order
    );


    /*
     * Create admin notification.
     */

    createAdminOrderNotification(
        order
    );


    /*
     * Keep a separate copy for
     * order-success.html
     */

    localStorage.setItem(
        "lastPaidOrder",
        JSON.stringify(
            order
        )
    );


    localStorage.setItem(
        "completedOrder",
        JSON.stringify(
            order
        )
    );


    /*
     * Clear the SAME cart key used
     * by the marketplace cart.
     */

    localStorage.removeItem(
        CART_STORAGE_KEY
    );


    /*
     * Also remove old cart key if
     * your previous cart.js used it.
     */

    localStorage.removeItem(
        "cart"
    );


    /*
     * Redirect to success page.
     */

    window.location.href =
        "order-success.html";

}


/* ==========================================================
   PAYSTACK PAYMENT
========================================================== */

function payWithPaystack() {

    if (
        typeof PaystackPop ===
        "undefined"
    ) {

        showStatus(
            "Paystack could not be loaded.",
            "error"
        );

        return;

    }


    if (
        !validateDeliveryDetails()
    ) {

        return;

    }


    try {

        currentOrder =
            createOrder();

    }

    catch(error) {

        console.error(
            error
        );

        showStatus(
            error.message ||
            "Unable to create order.",
            "error"
        );

        return;

    }


    const amountKobo =
        Math.round(
            currentOrder.amount.total *
            100
        );


    const handler =
        PaystackPop.setup({

            /*
             * Replace this with your
             * real Paystack PUBLIC key.
             */

            key:
                "pk_live_ae2ef39d24e2f001cbc716def10d3ede5148af5b",


            email:
                currentOrder.buyer.email,


            amount:
                amountKobo,


            currency:
                "NGN",


            ref:
                currentOrder.id,


            metadata: {

                orderId:
                    currentOrder.id,

                buyerName:
                    currentOrder.buyer.name,

                buyerPhone:
                    currentOrder.buyer.phone,

                deliveryState:
                    currentOrder.delivery.state,

                deliveryCity:
                    currentOrder.delivery.city,

                deliveryArea:
                    currentOrder.delivery.area,

                deliveryService:
                    currentOrder.delivery.service.name,

                deliveryFee:
                    currentOrder.delivery.service.price,

                deliveryDistance:
                    currentOrder.delivery.distanceKm,

                totalWeightKg:
                    currentOrder.delivery.totalWeightKg,

                totalSize:
                    currentOrder.delivery.totalSize

            },


            callback:
                function(response) {

                    markOrderPaid(

                        currentOrder,

                        response.reference,

                        "Paystack"

                    );


                    completeOrder(
                        currentOrder
                    );

                },


            onClose:
                function() {

                    showStatus(
                        "Payment window closed.",
                        "error"
                    );

                }

        });


    handler.openIframe();

}


/* ==========================================================
   PAYPAL NGN → USD
========================================================== */

function getPayPalAmount() {

    /*
     * This is only a display/payment
     * conversion for PayPal.

     * For production, use your
     * current exchange-rate strategy
     * rather than a hard-coded rate.
     */

    const NGN_PER_USD =
        1600;


    const total =
        getTotalPayable();


    return (
        Number(
            total
        ) /
        NGN_PER_USD
    ).toFixed(2);

}


/* ==========================================================
   INITIALIZE PAYPAL
========================================================== */

function initializePayPal() {

    const container =
        document.getElementById(
            "paypal-button-container"
        );


    if (!container) {

        return;

    }


    if (
        typeof paypal ===
        "undefined"
    ) {

        console.warn(
            "PayPal SDK is not loaded."
        );

        return;

    }


    /*
     * Prevent PayPal from being
     * rendered more than once.
     */

    if (
        container.dataset.rendered ===
        "true"
    ) {

        return;

    }


    container.dataset.rendered =
        "true";


    paypal.Buttons({

        /* ==================================================
           CREATE PAYPAL ORDER
        ================================================== */

        createOrder:
            function(
                data,
                actions
            ) {

                if (
                    !validateDeliveryDetails()
                ) {

                    return Promise.reject(
                        new Error(
                            "Please complete checkout information."
                        )
                    );

                }


                try {

                    currentOrder =
                        createOrder();

                }

                catch(error) {

                    showStatus(
                        error.message ||
                        "Unable to create order.",
                        "error"
                    );


                    return Promise.reject(
                        error
                    );

                }


                const usdAmount =
                    getPayPalAmount();


                return actions.order.create({

                    purchase_units: [

                        {

                            reference_id:
                                currentOrder.id,

                            description:
                                `Order ${currentOrder.id}`,

                            amount: {

                                currency_code:
                                    "USD",

                                value:
                                    usdAmount

                            }

                        }

                    ]

                });

            },


        /* ==================================================
           PAYPAL APPROVAL
        ================================================== */

        onApprove:
            async function(
                data,
                actions
            ) {

                try {

                    const details =
                        await actions.order.capture();


                    const reference =
                        details.id ||
                        data.orderID;


                    markOrderPaid(

                        currentOrder,

                        reference,

                        "PayPal"

                    );


                    completeOrder(
                        currentOrder
                    );

                }

                catch(error) {

                    console.error(
                        "PayPal capture error:",
                        error
                    );


                    showStatus(
                        "PayPal payment could not be completed.",
                        "error"
                    );

                }

            },


        /* ==================================================
           PAYPAL CANCEL
        ================================================== */

        onCancel:
            function() {

                showStatus(
                    "PayPal payment was cancelled.",
                    "error"
                );

            },


        /* ==================================================
           PAYPAL ERROR
        ================================================== */

        onError:
            function(error) {

                console.error(
                    "PayPal error:",
                    error
                );


                /*
                 * Allow PayPal to be
                 * initialized again if
                 * the container is recreated.
                 */

                container.dataset.rendered =
                    "false";


                showStatus(
                    "PayPal payment error occurred.",
                    "error"
                );

            }

    }).render(
        "#paypal-button-container"
    );

}


/* ==========================================================
   PAY BUTTON
========================================================== */

function initializePayButton() {

    const button =
        document.getElementById(
            "pay"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function() {

            if (
                !validateDeliveryDetails()
            ) {

                return;

            }


            if (
                !selectedDelivery
            ) {

                showStatus(
                    "Please select a delivery service.",
                    "error"
                );

                return;

            }


            if (
                selectedPaymentMethod ===
                "paystack"
            ) {

                payWithPaystack();

                return;

            }


            if (
                selectedPaymentMethod ===
                "paypal"
            ) {

                /*
                 * PayPal uses its own
                 * button, so this button
                 * should not normally be
                 * visible.
                 */

                return;

            }


            showStatus(
                "Please select a valid payment method.",
                "error"
            );

        }
    );

}


/* ==========================================================
   BACK BUTTON
========================================================== */

function initializeBackButton() {

    const button =
        document.getElementById(
            "back"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function() {

            if (
                window.history.length > 1
            ) {

                window.history.back();

            }

            else {

                window.location.href =
                    "cart.html";

            }

        }
    );

}


/* ==========================================================
   FINAL PAYMENT INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializePayButton();

        initializeBackButton();

        /*
         * Give the browser a moment to
         * load the PayPal SDK.
         */

        setTimeout(
            function() {

                initializePayPal();

            },
            500
        );

    }
);

