/* ==========================================================
   PAYMENT CONFIGURATION
========================================================== */

const PAYSTACK_PUBLIC_KEY =
    "pk_live_ae2ef39d24e2f001cbc716def10d3ede5148af5b";


const PAYPAL_CLIENT_ID =
    "AQlOKE6idiCDIoGFPx9VxLHVO_dgeqaA5WDsqnmVoMYUD4poj43MGDXeBYTfcRgMWsBMd9ylaCN447qR";


/* ==========================================================
   PAYPAL CONVERSION
========================================================== */

const NGN_PER_USD = 1600;


/* ==========================================================
   SHIPBUBBLE CONFIGURATION
========================================================== */

/*
   IMPORTANT:

   Do NOT put your Shipbubble secret API key here.

   This URL should point to your secure backend /
   Firebase Cloud Function / server endpoint.

   The endpoint should:

   1. Receive buyer delivery address.
   2. Receive seller pickup location.
   3. Receive parcel information.
   4. Call Shipbubble securely.
   5. Return available delivery services and prices.
*/

const SHIPBUBBLE_API_ENDPOINT =
    "https://yourstore-shipping.multilevelindustry.workers.dev/";


/*
   Change this to your own secure endpoint later.

   Example:

   https://your-domain.com/api/shipping/rates
*/



/* ==========================================================
   PAYMENT VARIABLES
========================================================== */

let paymentData = null;

let paymentItemsTotal = 0;

let paymentDeliveryFee = 0;

let paymentTotal = 0;

let selectedPaymentMethod = "";

let selectedDeliveryService = null;

let deliveryRates = [];


/* ==========================================================
   PAGE ELEMENTS
========================================================== */

const status =
    document.getElementById(
        "status"
    );


const pay =
    document.getElementById(
        "pay"
    );


const itemsElement =
    document.getElementById(
        "items"
    );


const deliveryElement =
    document.getElementById(
        "delivery"
    );


const totalElement =
    document.getElementById(
        "total"
    );


const paypalContainer =
    document.getElementById(
        "paypal-button-container"
    );


const deliveryStatus =
    document.getElementById(
        "deliveryStatus"
    );


const deliveryServicesCard =
    document.getElementById(
        "deliveryServicesCard"
    );


const deliveryServices =
    document.getElementById(
        "deliveryServices"
    );


const getDeliveryRatesButton =
    document.getElementById(
        "getDeliveryRates"
    );


/* ==========================================================
   MONEY FORMATTER
========================================================== */

const money = amount => {

    return (
        "₦" +
        (
            Number(amount) || 0
        ).toLocaleString(
            "en-NG"
        )
    );

};


/* ==========================================================
   SHOW PAYMENT MESSAGE
========================================================== */

function showPaymentMessage(
    text,
    type = "info"
) {

    if (!status) {

        return;

    }


    status.textContent =
        text;


    status.className =
        "status show " +
        type;

}


/* ==========================================================
   SHOW DELIVERY MESSAGE
========================================================== */

function showDeliveryMessage(
    text,
    type = "info"
) {

    if (!deliveryStatus) {

        return;

    }


    deliveryStatus.textContent =
        text;


    deliveryStatus.className =
        "status show " +
        type;

}


/* ==========================================================
   READ REVIEW DATA
========================================================== */

function getReviewData() {

    const storageNames = [

        "deliveryReviewData",

        "confirmedDeliveryData",

        "paymentCheckoutData"

    ];


    for (
        const storageName of storageNames
    ) {

        try {

            const sessionValue =
                sessionStorage.getItem(
                    storageName
                );


            if (sessionValue) {

                const parsed =
                    JSON.parse(
                        sessionValue
                    );


                if (
                    parsed &&
                    typeof parsed === "object"
                ) {

                    return parsed;

                }

            }

        }

        catch (error) {

            console.warn(
                "Could not read session storage:",
                storageName,
                error
            );

        }


        try {

            const localValue =
                localStorage.getItem(
                    storageName
                );


            if (localValue) {

                const parsed =
                    JSON.parse(
                        localValue
                    );


                if (
                    parsed &&
                    typeof parsed === "object"
                ) {

                    return parsed;

                }

            }

        }

        catch (error) {

            console.warn(
                "Could not read local storage:",
                storageName,
                error
            );

        }

    }


    return null;

}


/* ==========================================================
   GET REAL CART
========================================================== */

function getCart() {

    const CART_STORAGE_KEY =
        "yourStoreCart";


    let cart = [];


    try {

        const storedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if (storedCart) {

            const parsedCart =
                JSON.parse(
                    storedCart
                );


            if (Array.isArray(parsedCart)) {

                cart =
                    parsedCart;

            }

            else if (
                parsedCart &&
                Array.isArray(
                    parsedCart.items
                )
            ) {

                cart =
                    parsedCart.items;

            }

        }

    }

    catch (error) {

        console.error(
            "PAYMENT CART READ ERROR:",
            error
        );

    }


    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        try {

            const storedCart =
                sessionStorage.getItem(
                    CART_STORAGE_KEY
                );


            if (storedCart) {

                const parsedCart =
                    JSON.parse(
                        storedCart
                    );


                if (Array.isArray(parsedCart)) {

                    cart =
                        parsedCart;

                }

                else if (
                    parsedCart &&
                    Array.isArray(
                        parsedCart.items
                    )
                ) {

                    cart =
                        parsedCart.items;

                }

            }

        }

        catch (error) {

            console.error(
                "PAYMENT SESSION CART READ ERROR:",
                error
            );

        }

    }


    return cart;

}


/* ==========================================================
   GET PRODUCT TOTAL
========================================================== */

function getReviewProductsTotal() {

    const cart =
        getCart();


    if (
        !Array.isArray(cart) ||
        cart.length === 0
    ) {

        console.warn(
            "PAYMENT: yourStoreCart is empty."
        );


        return 0;

    }


    let total = 0;


    cart.forEach(
        function(item) {

            if (!item) {

                return;

            }


            const possiblePrices = [

                item.price,

                item.productPrice,

                item.unitPrice,

                item.salePrice,

                item.sellingPrice,

                item.currentPrice,

                item.finalPrice,

                item.product?.price,

                item.product?.productPrice,

                item.product?.unitPrice,

                item.product?.salePrice,

                item.data?.price,

                item.details?.price

            ];


            let price = 0;


            for (
                const value of possiblePrices
            ) {

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {

                    if (
                        typeof value === "number" &&
                        Number.isFinite(value)
                    ) {

                        price =
                            value;

                        break;

                    }


                    const cleaned =
                        String(value)
                            .replace(/₦/g, "")
                            .replace(/NGN/gi, "")
                            .replace(/,/g, "")
                            .replace(/\s/g, "")
                            .replace(
                                /[^0-9.-]/g,
                                ""
                            );


                    const parsedPrice =
                        Number(
                            cleaned
                        );


                    if (
                        Number.isFinite(
                            parsedPrice
                        ) &&
                        parsedPrice > 0
                    ) {

                        price =
                            parsedPrice;

                        break;

                    }

                }

            }


            const possibleQuantities = [

                item.quantity,

                item.qty,

                item.count,

                item.productQuantity

            ];


            let quantity = 1;


            for (
                const value of possibleQuantities
            ) {

                const parsedQuantity =
                    Number(value);


                if (
                    Number.isFinite(
                        parsedQuantity
                    ) &&
                    parsedQuantity > 0
                ) {

                    quantity =
                        parsedQuantity;

                    break;

                }

            }


            if (
                price > 0 &&
                quantity > 0
            ) {

                total +=
                    price *
                    quantity;

            }

        }
    );


    console.log(
        "PAYMENT REAL CART:",
        cart
    );


    console.log(
        "PAYMENT PRODUCTS TOTAL:",
        total
    );


    return total;

}


/* ==========================================================
   GET DELIVERY FEE FROM REVIEW
========================================================== */

function getReviewDeliveryFee() {

    if (!paymentData) {

        return 0;

    }


    const possibleValues = [

        paymentData?.deliveryService?.price,

        paymentData?.delivery?.price,

        paymentData?.selectedDelivery?.price,

        paymentData?.deliveryFee,

        paymentData?.orderSummary?.deliveryFee,

        paymentData?.summary?.deliveryFee,

        paymentData?.payment?.deliveryFee

    ];


    for (
        const value of possibleValues
    ) {

        const amount =
            Number(value);


        if (
            Number.isFinite(amount) &&
            amount >= 0
        ) {

            return amount;

        }

    }


    return 0;

}


/* ==========================================================
   GET FINAL TOTAL
========================================================== */

function getReviewFinalTotal() {

    if (!paymentData) {

        return 0;

    }


    const possibleValues = [

        paymentData?.orderTotal,

        paymentData?.total,

        paymentData?.finalTotal,

        paymentData?.orderSummary?.orderTotal,

        paymentData?.orderSummary?.total,

        paymentData?.summary?.orderTotal,

        paymentData?.summary?.total,

        paymentData?.payment?.total

    ];


    for (
        const value of possibleValues
    ) {

        const amount =
            Number(value);


        if (
            Number.isFinite(amount) &&
            amount >= 0
        ) {

            return amount;

        }

    }


    return (
        paymentItemsTotal +
        paymentDeliveryFee
    );

}


/* ==========================================================
   GET BUYER EMAIL
========================================================== */

function getBuyerEmail() {

    const reviewEmail =
        paymentData?.buyer?.email ||
        paymentData?.contact?.email ||
        paymentData?.customer?.email ||
        paymentData?.user?.email ||
        paymentData?.email;


    if (
        reviewEmail &&
        String(reviewEmail).includes("@")
    ) {

        return String(
            reviewEmail
        ).trim();

    }


    const possibleStorageKeys = [

        "currentUser",

        "user",

        "authUser",

        "loggedInUser",

        "buyer",

        "userData",

        "firebaseUser"

    ];


    for (
        const key of possibleStorageKeys
    ) {

        try {

            const value =
                localStorage.getItem(
                    key
                );


            if (!value) {

                continue;

            }


            const parsed =
                JSON.parse(
                    value
                );


            const email =
                parsed?.email;


            if (
                email &&
                String(email).includes("@")
            ) {

                return String(
                    email
                ).trim();

            }

        }

        catch (error) {

            console.warn(
                "Could not read user email:",
                key
            );

        }


        try {

            const value =
                sessionStorage.getItem(
                    key
                );


            if (!value) {

                continue;

            }


            const parsed =
                JSON.parse(
                    value
                );


            const email =
                parsed?.email;


            if (
                email &&
                String(email).includes("@")
            ) {

                return String(
                    email
                ).trim();

            }

        }

        catch (error) {

            console.warn(
                "Could not read session user:",
                key
            );

        }

    }


    if (
        typeof window.currentUser !==
        "undefined" &&
        window.currentUser?.email
    ) {

        return String(
            window.currentUser.email
        ).trim();

    }


    if (
        typeof window.firebaseUser !==
        "undefined" &&
        window.firebaseUser?.email
    ) {

        return String(
            window.firebaseUser.email
        ).trim();

    }


    return "";

}


/* ==========================================================
   GET SELLER PICKUP LOCATIONS FROM CART
========================================================== */

function getSellerPickupLocations() {

    const cart =
        getCart();


    const sellers = [];


    cart.forEach(
        function(item) {

            if (!item) {

                return;

            }


            const pickup =
                item.sellerPickupLocation ||
                item.pickupLocation ||
                item.seller?.pickupLocation ||
                item.seller?.pickup ||
                item.product?.sellerPickupLocation ||
                item.product?.pickupLocation ||
                item.product?.seller?.pickupLocation;


            if (!pickup) {

                return;

            }


            sellers.push({

                sellerId:
                    item.sellerId ||
                    item.seller?.id ||
                    item.product?.sellerId ||
                    null,

                sellerName:
                    item.sellerName ||
                    item.seller?.name ||
                    item.product?.sellerName ||
                    null,

                pickupLocation:
                    pickup

            });

        }
    );


    return sellers;

}


/* ==========================================================
   GET DELIVERY FORM
========================================================== */

function getDeliveryInformation() {

    return {

        fullName:
            document
                .getElementById(
                    "buyerName"
                )
                ?.value
                .trim(),

        phone:
            document
                .getElementById(
                    "buyerPhone"
                )
                ?.value
                .trim(),

        email:
            document
                .getElementById(
                    "buyerEmail"
                )
                ?.value
                .trim() ||
            getBuyerEmail(),

        state:
            document
                .getElementById(
                    "deliveryState"
                )
                ?.value
                .trim(),

        city:
            document
                .getElementById(
                    "deliveryCity"
                )
                ?.value
                .trim(),

        area:
            document
                .getElementById(
                    "deliveryArea"
                )
                ?.value
                .trim(),

        postalCode:
            document
                .getElementById(
                    "deliveryPostalCode"
                )
                ?.value
                .trim(),

        address:
            document
                .getElementById(
                    "deliveryAddress"
                )
                ?.value
                .trim(),

        instructions:
            document
                .getElementById(
                    "deliveryInstructions"
                )
                ?.value
                .trim()

    };

}


/* ==========================================================
   VALIDATE DELIVERY FORM
========================================================== */

function validateDeliveryInformation() {

    const delivery =
        getDeliveryInformation();


    if (!delivery.fullName) {

        return {
            valid:false,
            message:"Enter the buyer's full name."
        };

    }


    if (!delivery.phone) {

        return {
            valid:false,
            message:"Enter the buyer's phone number."
        };

    }


    if (!delivery.email) {

        return {
            valid:false,
            message:"Enter the buyer's email address."
        };

    }


    if (!delivery.state) {

        return {
            valid:false,
            message:"Select the delivery state."
        };

    }


    if (!delivery.city) {

        return {
            valid:false,
            message:"Enter the delivery city or town."
        };

    }


    if (!delivery.address) {

        return {
            valid:false,
            message:"Enter the full delivery address."
        };

    }


    return {

        valid:true,

        data:
            delivery

    };

}



/* ==========================================================
   GET DELIVERY RATES
========================================================== */

async function getDeliveryRatesFromShipbubble() {

    const validation =
        validateDeliveryInformation();


    if (!validation.valid) {

        showDeliveryMessage(
            validation.message,
            "error"
        );

        return;

    }


    const delivery =
        validation.data;


    const cart =
        getCart();


    if (
        !cart.length
    ) {

        showDeliveryMessage(
            "Your cart is empty.",
            "error"
        );

        return;

    }


    const pickupLocations =
        getSellerPickupLocations();


    /*
       Multiple sellers can exist in one cart.

       The backend should calculate the available
       shipping options based on the seller pickup
       location(s) and buyer destination.
    */

    const requestData = {

        customer: {

            name:
                delivery.fullName,

            phone:
                delivery.phone,

            email:
                delivery.email

        },


        destination: {

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
                delivery.instructions

        },


        sellers:
            pickupLocations,


        cart:
            cart,


        productsTotal:
            paymentItemsTotal

    };


    console.log(
        "SHIPBUBBLE RATE REQUEST:",
        requestData
    );


    if (getDeliveryRatesButton) {

        getDeliveryRatesButton.disabled =
            true;

        getDeliveryRatesButton.textContent =
            "Getting delivery rates...";

    }


    showDeliveryMessage(
        "Checking available delivery services...",
        "info"
    );


    try {

        /*
           Your secure backend receives this request
           and communicates with Shipbubble.

           NEVER expose your Shipbubble secret key
           in this browser file.
        */

        const response =
            await fetch(
                SHIPBUBBLE_API_ENDPOINT,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestData
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                "Shipping service returned HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "SHIPBUBBLE RATE RESPONSE:",
            result
        );


        const rates =
            result.rates ||
            result.data?.rates ||
            result.data ||
            [];


        if (
            !Array.isArray(rates) ||
            rates.length === 0
        ) {

            throw new Error(
                "No delivery services are available for this address."
            );

        }


        deliveryRates =
            rates;


        renderDeliveryServices(
            rates
        );


        showDeliveryMessage(
            "Delivery services loaded. Select one to continue.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "SHIPBUBBLE RATE ERROR:",
            error
        );


        showDeliveryMessage(
            error.message ||
            "Could not get delivery rates. Please try again.",
            "error"
        );

    }

    finally {

        if (getDeliveryRatesButton) {

            getDeliveryRatesButton.disabled =
                false;

            getDeliveryRatesButton.textContent =
                "Get available delivery services";

        }

    }

}


/* ==========================================================
   RENDER DELIVERY SERVICES
========================================================== */

function renderDeliveryServices(
    rates
) {

    if (!deliveryServices) {

        return;

    }


    deliveryServices.innerHTML =
        "";


    deliveryServicesCard.style.display =
        "block";


    rates.forEach(
        function(rate, index) {

            const price =
                Number(
                    rate.price ??
                    rate.amount ??
                    rate.rate ??
                    rate.shipping_fee ??
                    0
                );


            const name =
                rate.name ||
                rate.courier_name ||
                rate.courier ||
                rate.provider ||
                "Delivery service";


            const description =
                rate.description ||
                rate.service_name ||
                rate.service ||
                "Delivery service";


            const deliveryTime =
                rate.delivery_time ||
                rate.estimated_delivery ||
                rate.eta ||
                rate.duration ||
                "";


            const id =
                rate.id ||
                rate.rate_id ||
                rate.service_id ||
                (
                    "delivery-rate-" +
                    index
                );


            const wrapper =
                document.createElement(
                    "label"
                );


            wrapper.className =
                "delivery-service";


            wrapper.dataset.rateId =
                id;


            wrapper.innerHTML = `

                <input
                    type="radio"
                    name="deliveryService"
                    value="${escapeHtml(id)}"
                >

                <div class="delivery-service-info">

                    <div class="delivery-service-name">

                        ${escapeHtml(name)}

                    </div>

                    <div class="delivery-service-description">

                        ${escapeHtml(description)}

                    </div>

                </div>

                <div>

                    <div class="delivery-service-price">

                        ${money(price)}

                    </div>

                    <div class="delivery-service-time">

                        ${escapeHtml(deliveryTime)}

                    </div>

                </div>

            `;


            wrapper
                .querySelector(
                    "input"
                )
                .addEventListener(
                    "change",
                    function() {

                        selectDeliveryRate(
                            rate,
                            wrapper
                        );

                    }
                );


            deliveryServices.appendChild(
                wrapper
            );

        }
    );

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHtml(
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
   SELECT DELIVERY RATE
========================================================== */

function selectDeliveryRate(
    rate,
    wrapper
) {

    document
        .querySelectorAll(
            ".delivery-service"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "active"
                );

            }
        );


    wrapper.classList.add(
        "active"
    );


    const price =
        Number(
            rate.price ??
            rate.amount ??
            rate.rate ??
            rate.shipping_fee ??
            0
        );


    selectedDeliveryService = {

        ...rate,

        price:
            price

    };


    paymentDeliveryFee =
        price;


    paymentTotal =
        paymentItemsTotal +
        paymentDeliveryFee;


    updatePaymentSummary();


    updatePayButton();


    showDeliveryMessage(
        "Delivery service selected.",
        "success"
    );


    saveCheckoutInformation();

}


/* ==========================================================
   UPDATE PAYMENT SUMMARY
========================================================== */

function updatePaymentSummary() {

    if (itemsElement) {

        itemsElement.textContent =
            money(
                paymentItemsTotal
            );

    }


    if (deliveryElement) {

        deliveryElement.textContent =
            money(
                paymentDeliveryFee
            );

    }


    if (totalElement) {

        totalElement.textContent =
            money(
                paymentTotal
            );

    }

}


/* ==========================================================
   UPDATE PAY BUTTON
========================================================== */

function updatePayButton() {

    if (!pay) {

        return;

    }


    if (
        !selectedDeliveryService
    ) {

        pay.disabled =
            true;

        pay.textContent =
            "Select delivery and payment method";

        return;

    }


    if (
        !selectedPaymentMethod
    ) {

        pay.disabled =
            true;

        pay.textContent =
            "Select a payment method";

        return;

    }


    pay.disabled =
        false;


    pay.textContent =
        selectedPaymentMethod ===
        "paystack"

        ? "Pay with Paystack →"

        : "Pay with PayPal →";

}


/* ==========================================================
   SAVE CHECKOUT INFORMATION
========================================================== */

function saveCheckoutInformation() {

    const delivery =
        getDeliveryInformation();


    const checkoutData = {

        ...paymentData,


        deliveryInformation:
            delivery,


        sellerPickupLocations:
            getSellerPickupLocations(),


        cart:
            getCart(),


        payment: {

            productsTotal:
                paymentItemsTotal,

            deliveryFee:
                paymentDeliveryFee,

            total:
                paymentTotal,

            currency:
                "NGN",

            buyerEmail:
                delivery.email

        },


        selectedDeliveryService:
            selectedDeliveryService

    };


    paymentData =
        checkoutData;


    try {

        sessionStorage.setItem(

            "paymentCheckoutData",

            JSON.stringify(
                checkoutData
            )

        );


        localStorage.setItem(

            "paymentCheckoutData",

            JSON.stringify(
                checkoutData
            )

        );

    }

    catch (error) {

        console.error(
            "Could not save checkout data:",
            error
        );

    }

}


/* ==========================================================
   PREPARE PAYMENT
========================================================== */

function preparePaymentFromReview() {

    paymentItemsTotal =
        getReviewProductsTotal();


    paymentDeliveryFee =
        getReviewDeliveryFee();


    const reviewTotal =
        getReviewFinalTotal();


    paymentTotal =
        Number(reviewTotal) || 0;


    /*
       Since the buyer is now selecting delivery
       directly on this page, product total is
       authoritative.

       If an old delivery value exists from the
       previous page, it is used only until the
       buyer selects a new Shipbubble service.
    */

    if (
        paymentItemsTotal > 0
    ) {

        paymentTotal =
            paymentItemsTotal +
            paymentDeliveryFee;

    }


    updatePaymentSummary();

}


/* ==========================================================
   INITIALIZE PAGE
========================================================== */

function initializePaymentPage() {

    paymentData =
        getReviewData();


    if (!paymentData) {

        /*
           We still allow the page to continue because
           the cart is the authoritative product source.
        */

        paymentData = {};

    }


    preparePaymentFromReview();


    const buyerEmail =
        getBuyerEmail();


    const emailInput =
        document.getElementById(
            "buyerEmail"
        );


    if (
        emailInput &&
        buyerEmail
    ) {

        emailInput.value =
            buyerEmail;

    }


    if (
        paymentItemsTotal <= 0
    ) {

        showPaymentMessage(
            "Your cart is empty or the product prices could not be read.",
            "error"
        );

        if (pay) {

            pay.disabled =
                true;

        }

        return;

    }


    console.log(
        "PRODUCT TOTAL:",
        paymentItemsTotal
    );


    console.log(
        "INITIAL DELIVERY:",
        paymentDeliveryFee
    );


    console.log(
        "INITIAL TOTAL:",
        paymentTotal
    );


    console.log(
        "SELLER PICKUPS:",
        getSellerPickupLocations()
    );

}


/* ==========================================================
   DELIVERY RATE BUTTON
========================================================== */

if (getDeliveryRatesButton) {

    getDeliveryRatesButton.addEventListener(
        "click",
        function() {

            getDeliveryRatesFromShipbubble();

        }
    );

}


/* ==========================================================
   PAYMENT METHOD SELECTION
========================================================== */

document
    .querySelectorAll(
        'input[name="method"]'
    )
    .forEach(
        input => {

            input.addEventListener(
                "change",
                function() {

                    selectedPaymentMethod =
                        this.value;


                    document
                        .querySelectorAll(
                            ".option"
                        )
                        .forEach(
                            option => {

                                option.classList.remove(
                                    "active"
                                );

                            }
                        );


                    const selectedOption =
                        this.closest(
                            ".option"
                        );


                    if (
                        selectedOption
                    ) {

                        selectedOption.classList.add(
                            "active"
                        );

                    }


                    updatePayButton();

                }
            );

        }
    );


/* ==========================================================
   BACK
========================================================== */

const backButton =
    document.getElementById(
        "back"
    );


if (backButton) {

    backButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "review.html";

        }
    );

}


/* ==========================================================
   PAYMENT BUTTON
========================================================== */

if (pay) {

    pay.addEventListener(
        "click",
        function() {

            if (
                !selectedDeliveryService
            ) {

                showPaymentMessage(
                    "Please select a delivery service first.",
                    "error"
                );

                return;

            }


            saveCheckoutInformation();


            if (
                selectedPaymentMethod ===
                "paystack"
            ) {

                startPaystack();

                return;

            }


            if (
                selectedPaymentMethod ===
                "paypal"
            ) {

                startPayPal();

                return;

            }


            showPaymentMessage(
                "Please select a payment method first.",
                "error"
            );

        }
    );

}


/* ==========================================================
   START PAYSTACK
========================================================== */

function startPaystack() {

    if (
        PAYSTACK_PUBLIC_KEY ===
        "YOUR_PAYSTACK_PUBLIC_KEY"
    ) {

        showPaymentMessage(
            "Add your Paystack public key first.",
            "error"
        );

        return;

    }


    const buyerEmail =
        getBuyerEmail() ||
        document
            .getElementById(
                "buyerEmail"
            )
            ?.value
            .trim();


    if (!buyerEmail) {

        showPaymentMessage(
            "Buyer email was not found.",
            "error"
        );

        return;

    }


    if (
        paymentTotal <= 0
    ) {

        showPaymentMessage(
            "The order total is invalid.",
            "error"
        );

        return;

    }


    const amountInKobo =
        Math.round(
            paymentTotal * 100
        );


    const reference =
        "ORDER-" +
        Date.now();


    saveCheckoutInformation();


    showPaymentMessage(
        "Opening secure Paystack payment...",
        "info"
    );


    if (
        typeof PaystackPop ===
        "undefined"
    ) {

        showPaymentMessage(
            "Paystack is not loaded.",
            "error"
        );

        return;

    }


    const handler =
        PaystackPop.setup({

            key:
                PAYSTACK_PUBLIC_KEY,

            email:
                buyerEmail,

            amount:
                amountInKobo,

            currency:
                "NGN",

            ref:
                reference,


            metadata: {

                custom_fields: [

                    {

                        display_name:
                            "Products Total",

                        variable_name:
                            "products_total",

                        value:
                            paymentItemsTotal

                    },


                    {

                        display_name:
                            "Delivery Fee",

                        variable_name:
                            "delivery_fee",

                        value:
                            paymentDeliveryFee

                    },


                    {

                        display_name:
                            "Order Total",

                        variable_name:
                            "order_total",

                        value:
                            paymentTotal

                    },


                    {

                        display_name:
                            "Delivery Service",

                        variable_name:
                            "delivery_service",

                        value:
                            selectedDeliveryService?.name ||
                            selectedDeliveryService?.courier_name ||
                            ""

                    }

                ]

            },


            callback:
                function(response) {

                    saveSuccessfulPayment({

                        paymentMethod:
                            "paystack",

                        paymentStatus:
                            "SUCCESS",

                        reference:
                            response.reference,

                        buyerEmail:
                            buyerEmail,

                        productsTotal:
                            paymentItemsTotal,

                        deliveryFee:
                            paymentDeliveryFee,

                        total:
                            paymentTotal,

                        currency:
                            "NGN",

                        delivery:
                            getDeliveryInformation(),

                        sellerPickupLocations:
                            getSellerPickupLocations(),

                        selectedDeliveryService:
                            selectedDeliveryService,

                        paidAt:
                            new Date()
                                .toISOString()

                    });

                },


            onClose:
                function() {

                    showPaymentMessage(
                        "Paystack payment was cancelled.",
                        "info"
                    );

                }

        });


    handler.openIframe();

}


/* ==========================================================
   START PAYPAL
========================================================== */

async function startPayPal() {

    if (
        PAYPAL_CLIENT_ID ===
        "YOUR_PAYPAL_CLIENT_ID"
    ) {

        showPaymentMessage(
            "Add your PayPal client ID first.",
            "error"
        );

        return;

    }


    if (
        paymentTotal <= 0
    ) {

        showPaymentMessage(
            "The order total is invalid.",
            "error"
        );

        return;

    }


    const usdAmount =
        (
            paymentTotal /
            NGN_PER_USD
        ).toFixed(2);


    if (
        Number(usdAmount) <= 0
    ) {

        showPaymentMessage(
            "The PayPal amount is invalid.",
            "error"
        );

        return;

    }


    if (!paypalContainer) {

        showPaymentMessage(
            "PayPal container was not found.",
            "error"
        );

        return;

    }


    saveCheckoutInformation();


    pay.style.display =
        "none";


    paypalContainer.style.display =
        "block";


    showPaymentMessage(
        "Loading PayPal checkout...",
        "info"
    );


    try {

        if (
            typeof paypal ===
            "undefined"
        ) {

            throw new Error(
                "PayPal SDK is unavailable."
            );

        }


        if (
            paypalContainer.dataset.rendered ===
            "true"
        ) {

            return;

        }


        paypalContainer.dataset.rendered =
            "true";


        paypal.Buttons({

            style: {

                layout:
                    "vertical",

                color:
                    "gold",

                shape:
                    "rect",

                label:
                    "paypal",

                height:
                    50

            },


            createOrder:
                function(
                    paypalData,
                    actions
                ) {

                    return actions.order.create({

                        intent:
                            "CAPTURE",

                        purchase_units: [

                            {

                                description:
                                    "Online Store Order",

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


            onApprove:
                async function(
                    paypalData,
                    actions
                ) {

                    try {

                        showPaymentMessage(
                            "Payment approved. Completing your payment...",
                            "info"
                        );


                        const details =
                            await actions
                                .order
                                .capture();


                        const capture =
                            details
                                ?.purchase_units?.[0]
                                ?.payments
                                ?.captures?.[0];


                        if (
                            capture?.status !==
                            "COMPLETED"
                        ) {

                            showPaymentMessage(
                                "PayPal payment was not completed.",
                                "error"
                            );

                            return;

                        }


                        saveSuccessfulPayment({

                            paymentMethod:
                                "paypal",

                            paymentStatus:
                                "COMPLETED",

                            paypalOrderId:
                                paypalData.orderID,

                            paypalCaptureId:
                                capture.id,

                            buyerEmail:
                                getBuyerEmail(),

                            productsTotal:
                                paymentItemsTotal,

                            deliveryFee:
                                paymentDeliveryFee,

                            totalNaira:
                                paymentTotal,

                            paypalAmount:
                                usdAmount,

                            exchangeRate:
                                NGN_PER_USD,

                            currency:
                                "USD",

                            delivery:
                                getDeliveryInformation(),

                            sellerPickupLocations:
                                getSellerPickupLocations(),

                            selectedDeliveryService:
                                selectedDeliveryService,

                            payer:
                                details.payer ||
                                null,

                            paidAt:
                                new Date()
                                    .toISOString()

                        });

                    }

                    catch (error) {

                        console.error(
                            "PayPal capture error:",
                            error
                        );


                        showPaymentMessage(
                            "PayPal payment could not be completed. Please try again.",
                            "error"
                        );

                    }

                },


            onCancel:
                function() {

                    showPaymentMessage(
                        "PayPal payment was cancelled.",
                        "info"
                    );

                },


            onError:
                function(error) {

                    console.error(
                        "PayPal error:",
                        error
                    );


                    showPaymentMessage(
                        "PayPal checkout encountered an error.",
                        "error"
                    );

                }

        }).render(
            "#paypal-button-container"
        );

    }

    catch (error) {

        console.error(
            "PayPal error:",
            error
        );


        paypalContainer.style.display =
            "none";


        pay.style.display =
            "block";


        showPaymentMessage(
            "PayPal could not be loaded.",
            "error"
        );

    }

}


/* ==========================================================
   SAVE SUCCESSFUL PAYMENT
========================================================== */

function saveSuccessfulPayment(
    payment
) {

    /*
       Create one complete order object.

       This contains:

       - buyer
       - delivery address
       - seller pickup locations
       - cart
       - products total
       - delivery fee
       - final total
       - courier
       - payment provider
       - payment ID
       - payment status
    */

    const orderId =
        "ORDER-" +
        Date.now();


    const finalCheckoutData = {

        orderId:
            orderId,


        createdAt:
            new Date()
                .toISOString(),


        buyer: {

            name:
                getDeliveryInformation()
                    .fullName,

            phone:
                getDeliveryInformation()
                    .phone,

            email:
                getDeliveryInformation()
                    .email

        },


        delivery: {

            ...getDeliveryInformation()

        },


        sellerPickupLocations:
            getSellerPickupLocations(),


        cart:
            getCart(),


        deliveryService:
            selectedDeliveryService,


        payment: {

            ...payment

        },


        order: {

            productsTotal:
                paymentItemsTotal,

            deliveryFee:
                paymentDeliveryFee,

            total:
                paymentTotal,

            currency:
                "NGN"

        }

    };


    try {

        sessionStorage.setItem(

            "completedPayment",

            JSON.stringify(
                payment
            )

        );


        sessionStorage.setItem(

            "finalCheckoutData",

            JSON.stringify(
                finalCheckoutData
            )

        );


        localStorage.setItem(

            "completedPayment",

            JSON.stringify(
                payment
            )

        );


        localStorage.setItem(

            "finalCheckoutData",

            JSON.stringify(
                finalCheckoutData
            )

        );

console.log(
            "FINAL ORDER CREATED:",
            finalCheckoutData
        );


    }

    catch (error) {

        console.error(
            "Could not save successful payment:",
            error
        );

    }


    /*
       Continue to success page.
    */

    window.location.href =
        "success.html";

}


/* ==========================================================
   START
========================================================== */

initializePaymentPage();
