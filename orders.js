/* ==========================================================
   YOURSTORE — BUYER ORDERS PAGE
   Firebase Authentication + Firestore
========================================================== */

import {
    auth,
    db
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



/* ==========================================================
   CART STORAGE
========================================================== */

const CART_STORAGE_KEY =
    "yourStoreCart";



/* ==========================================================
   PAGE STATE
========================================================== */

let currentBuyer = null;

let buyerOrders = [];

let filteredOrders = [];

let currentStatusFilter = "all";

let currentSearch = "";

let currentSort = "newest";



/* ==========================================================
   DOM ELEMENTS
========================================================== */

const ordersPageLoader =
    document.getElementById(
        "ordersPageLoader"
    );


const ordersApp =
    document.getElementById(
        "ordersApp"
    );


const ordersList =
    document.getElementById(
        "ordersList"
    );


const ordersEmpty =
    document.getElementById(
        "ordersEmpty"
    );


const ordersError =
    document.getElementById(
        "ordersError"
    );


const ordersErrorMessage =
    document.getElementById(
        "ordersErrorMessage"
    );


const retryOrdersButton =
    document.getElementById(
        "retryOrdersButton"
    );


const ordersSearchForm =
    document.getElementById(
        "ordersSearchForm"
    );


const ordersSearchInput =
    document.getElementById(
        "ordersSearchInput"
    );


const ordersStatusFilter =
    document.getElementById(
        "ordersStatusFilter"
    );


const ordersSortFilter =
    document.getElementById(
        "ordersSortFilter"
    );


const refreshOrdersButton =
    document.getElementById(
        "refreshOrdersButton"
    );


const ordersCartCount =
    document.getElementById(
        "ordersCartCount"
    );



/* ==========================================================
   SUMMARY ELEMENTS
========================================================== */

const ordersTotalCount =
    document.getElementById(
        "ordersTotalCount"
    );


const ordersPendingCount =
    document.getElementById(
        "ordersPendingCount"
    );


const ordersProcessingCount =
    document.getElementById(
        "ordersProcessingCount"
    );


const ordersShippedCount =
    document.getElementById(
        "ordersShippedCount"
    );


const ordersDeliveredCount =
    document.getElementById(
        "ordersDeliveredCount"
    );


const ordersCancelledCount =
    document.getElementById(
        "ordersCancelledCount"
    );



/* ==========================================================
   AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    async function(user){

        if(!user){

            currentBuyer = null;

            redirectBuyerToLogin();

            return;

        }


        currentBuyer = user;


        await initializeOrdersPage();

    }
);



/* ==========================================================
   INITIALIZE PAGE
========================================================== */

async function initializeOrdersPage(){

    try {

        showOrdersLoader();


        hideOrdersError();


        updateOrdersCartCount();


        await loadBuyerOrders();


        updateOrderSummary();


        applyOrderFilters();


        showOrdersApp();

    }

    catch(error){

        console.error(
            "Orders page initialization error:",
            error
        );


        showOrdersError(
            "Unable to load your orders right now."
        );

    }

    finally {

        hideOrdersLoader();

    }

}



/* ==========================================================
   LOAD BUYER ORDERS
========================================================== */

async function loadBuyerOrders(){

    if(!currentBuyer){

        return;

    }


    if(!ordersList){

        return;

    }


    ordersList.innerHTML = `

        <div class="orders-loading-card">

            <div class="orders-loader-spinner"></div>

            <p>
                Loading your orders...
            </p>

        </div>

    `;


    try {

        const ordersReference =
            collection(
                db,
                "orders"
            );


        /*
         * IMPORTANT
         *
         * Orders are connected to the
         * Firebase Authentication UID.
         */

        const ordersQuery =
            query(
                ordersReference,
                where(
                    "buyerId",
                    "==",
                    currentBuyer.uid
                )
            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        buyerOrders = [];


        snapshot.forEach(
            function(orderDocument){

                const data =
                    orderDocument.data();


                buyerOrders.push({

                    id:
                        orderDocument.id,

                    ...data

                });

            }
        );


        /*
         * Sort locally.
         *
         * This avoids requiring a Firestore
         * composite index for buyerId + createdAt.
         */

        buyerOrders.sort(
            function(a,b){

                return (
                    getOrderTimestamp(b) -
                    getOrderTimestamp(a)
                );

            }
        );


        console.log(
            "Buyer orders loaded:",
            buyerOrders
        );

    }

    catch(error){

        console.error(
            "Firestore order loading error:",
            error
        );

        throw error;

    }

}



/* ==========================================================
   GET ORDER TIMESTAMP
========================================================== */

function getOrderTimestamp(order){

    if(!order){

        return 0;

    }


    const createdAt =
        order.createdAt;


    if(!createdAt){

        return 0;

    }


    /*
     * Firestore Timestamp
     */

    if(
        typeof createdAt.toMillis ===
        "function"
    ){

        return createdAt.toMillis();

    }


    /*
     * JavaScript Date
     */

    if(
        createdAt instanceof Date
    ){

        return createdAt.getTime();

    }


    /*
     * Numeric timestamp
     */

    if(
        typeof createdAt ===
        "number"
    ){

        return createdAt;

    }


    /*
     * ISO/string date
     */

    const parsed =
        new Date(
            createdAt
        ).getTime();


    return Number.isNaN(parsed)
        ? 0
        : parsed;

}



/* ==========================================================
   UPDATE ORDER SUMMARY
========================================================== */

function updateOrderSummary(){

    const total =
        buyerOrders.length;


    let pending = 0;

    let processing = 0;

    let shipped = 0;

    let delivered = 0;

    let cancelled = 0;


    buyerOrders.forEach(
        function(order){

            const status =
                normalizeOrderStatus(
                    order.status
                );


            if(status === "pending"){

                pending++;

            }


            if(status === "processing"){

                processing++;

            }


            if(status === "shipped"){

                shipped++;

            }


            if(status === "out_for_delivery"){

                shipped++;

            }


            if(status === "delivered"){

                delivered++;

            }


            if(status === "cancelled"){

                cancelled++;

            }

        }
    );


    setElementText(
        ordersTotalCount,
        total
    );


    setElementText(
        ordersPendingCount,
        pending
    );


    setElementText(
        ordersProcessingCount,
        processing
    );


    setElementText(
        ordersShippedCount,
        shipped
    );


    setElementText(
        ordersDeliveredCount,
        delivered
    );


    setElementText(
        ordersCancelledCount,
        cancelled
    );

}



/* ==========================================================
   APPLY FILTERS
========================================================== */

function applyOrderFilters(){

    let result =
        [...buyerOrders];


    /*
     * STATUS
     */

    if(
        currentStatusFilter !==
        "all"
    ){

        result =
            result.filter(
                function(order){

                    return (
                        normalizeOrderStatus(
                            order.status
                        ) ===
                        currentStatusFilter
                    );

                }
            );

    }


    /*
     * SEARCH
     */

    if(
        currentSearch.trim()
    ){

        const search =
            currentSearch
                .trim()
                .toLowerCase();


        result =
            result.filter(
                function(order){

                    const orderNumber =
                        String(
                            order.orderNumber ||
                            order.orderId ||
                            order.id ||
                            ""
                        )
                        .toLowerCase();


                    const buyerName =
                        String(
                            order.buyerName ||
                            ""
                        )
                        .toLowerCase();


                    const items =
                        getOrderItems(
                            order
                        );


                    const itemText =
                        items
                            .map(
                                function(item){

                                    return String(
                                        item.name ||
                                        item.productName ||
                                        ""
                                    )
                                    .toLowerCase();

                                }
                            )
                            .join(" ");


                    return (

                        orderNumber.includes(
                            search
                        )

                        ||

                        buyerName.includes(
                            search
                        )

                        ||

                        itemText.includes(
                            search
                        )

                    );

                }
            );

    }


    /*
     * SORT
     */

    result.sort(
        function(a,b){

            if(
                currentSort ===
                "oldest"
            ){

                return (
                    getOrderTimestamp(a) -
                    getOrderTimestamp(b)
                );

            }


            if(
                currentSort ===
                "highest"
            ){

                return (
                    getOrderTotal(b) -
                    getOrderTotal(a)
                );

            }


            if(
                currentSort ===
                "lowest"
            ){

                return (
                    getOrderTotal(a) -
                    getOrderTotal(b)
                );

            }


            return (
                getOrderTimestamp(b) -
                getOrderTimestamp(a)
            );

        }
    );


    filteredOrders =
        result;


    renderOrders();

}



/* ==========================================================
   RENDER ORDERS
========================================================== */

function renderOrders(){

    if(!ordersList){

        return;

    }


    if(
        !filteredOrders ||
        filteredOrders.length === 0
    ){

        ordersList.innerHTML = "";

        showOrdersEmpty();

        return;

    }


    hideOrdersEmpty();


    ordersList.innerHTML =
        filteredOrders
            .map(
                function(order){

                    return createOrderCard(
                        order
                    );

                }
            )
            .join("");


    attachOrderActionEvents();

}



/* ==========================================================
   CREATE ORDER CARD
========================================================== */

function createOrderCard(order){

    const orderId =
        order.orderNumber ||
        order.orderId ||
        order.id;


    const orderStatus =
        normalizeOrderStatus(
            order.status
        );


    const orderStatusLabel =
        getOrderStatusLabel(
            orderStatus
        );


    const paymentStatus =
        normalizePaymentStatus(
            order.paymentStatus
        );


    const paymentLabel =
        getPaymentStatusLabel(
            paymentStatus
        );


    const orderDate =
        formatOrderDate(
            order.createdAt
        );


    const items =
        getOrderItems(
            order
        );


    const subtotal =
        getOrderSubtotal(
            order,
            items
        );


    const deliveryFee =
        getOrderDeliveryFee(
            order
        );


    const discount =
        getOrderDiscount(
            order
        );


    const total =
        getOrderTotal(
            order
        );


    const itemsHTML =
        items
            .map(
                function(item){

                    return createOrderItem(
                        item
                    );

                }
            )
            .join("");


    const canCancel =
        canCancelOrder(
            orderStatus
        );


    return `

        <article
            class="order-card"
            data-order-id="${escapeHTML(order.id)}"
        >


            <!-- ==========================================
                 HEADER
            =========================================== -->

            <div
                class="order-card-header"
            >

                <div>

                    <div
                        class="order-number"
                    >

                        Order #

                        ${escapeHTML(
                            orderId
                        )}

                    </div>

                    <div
                        class="order-date"
                    >

                        ${escapeHTML(
                            orderDate
                        )}

                    </div>

                </div>


                <span
                    class="
                        order-status
                        ${escapeHTML(orderStatus)}
                    "
                >

                    ${escapeHTML(
                        orderStatusLabel
                    )}

                </span>

            </div>



            <!-- ==========================================
                 ITEMS
            =========================================== -->

            <div
                class="order-items"
            >

                ${
                    itemsHTML ||
                    `
                        <div class="order-item">

                            <div class="order-item-info">

                                <strong>
                                    Order items
                                </strong>

                                <div class="order-item-seller">
                                    Item details unavailable.
                                </div>

                            </div>

                        </div>
                    `
                }

            </div>



            <!-- ==========================================
                 TOTAL
            =========================================== -->

            <div
                class="order-summary"
            >

                <div
                    class="order-summary-row"
                >

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${formatNaira(subtotal)}
                    </strong>

                </div>


                <div
                    class="order-summary-row"
                >

                    <span>
                        Delivery
                    </span>

                    <strong>
                        ${formatNaira(deliveryFee)}
                    </strong>

                </div>


                ${
                    discount > 0
                    ?

                    `

                        <div
                            class="order-summary-row"
                        >

                            <span>
                                Discount
                            </span>

                            <strong>
                                -
                                ${formatNaira(discount)}
                            </strong>

                        </div>

                    `

                    :

                    ""
                }


                <div
                    class="
                        order-summary-row
                        total
                    "
                >

                    <span>
                        Total
                    </span>

                    <strong>
                        ${formatNaira(total)}
                    </strong>

                </div>

            </div>



              <!-- ==========================================
                 FOOTER
            =========================================== -->

            <div
                class="order-card-footer"
            >

                <div
                    class="order-payment-status"
                >

                    Payment:

                    <strong>
                        ${escapeHTML(
                            paymentLabel
                        )}
                    </strong>

                </div>


                <div
                    class="order-actions"
                >

                    <button
                        type="button"
                        class="order-action-button primary"
                        data-action="view"
                        data-order-id="${escapeHTML(order.id)}"
                    >

                        View Order

                    </button>


                    ${
                        canTrackOrder(orderStatus)

                        ?

                        `

                            <button
                                type="button"
                                class="order-action-button"
                                data-action="track"
                                data-order-id="${escapeHTML(order.id)}"
                            >

                                🚚 Track

                            </button>

                        `

                        :

                        ""
                    }


                    ${
                        orderStatus ===
                        "delivered"

                        ?

                        `

                            <button
                                type="button"
                                class="order-action-button"
                                data-action="reorder"
                                data-order-id="${escapeHTML(order.id)}"
                            >

                                Buy Again

                            </button>

                        `

                        :

                        ""
                    }


                    ${
                        canCancel

                        ?

                        `

                            <button
                                type="button"
                                class="
                                    order-action-button
                                    danger
                                "
                                data-action="cancel"
                                data-order-id="${escapeHTML(order.id)}"
                            >

                                Cancel

                            </button>

                        `

                        :

                        ""
                    }

                </div>

            </div>

        </article>

    `;

}



/* ==========================================================
   CREATE ORDER ITEM
========================================================== */

function createOrderItem(item){

    const name =
        item.name ||
        item.productName ||
        "Product";


    const image =
        item.image ||
        item.productImage ||
        item.mainImage ||
        (
            Array.isArray(item.images)
                ? item.images[0]
                : ""
        ) ||
        "images/product-placeholder.jpg";


    const quantity =
        Number(
            item.quantity ||
            1
        );


    const price =
        Number(
            item.price ||
            item.unitPrice ||
            item.buyerPrice ||
            0
        );


    const sellerName =
        item.sellerName ||
        "Marketplace Seller";


    return `

        <div
            class="order-item"
        >

            <div
                class="order-item-image"
            >

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                    onerror="
                        this.src='images/product-placeholder.jpg'
                    "
                >

            </div>


            <div
                class="order-item-info"
            >

                <a
                    href="product.html?id=${encodeURIComponent(
                        item.productId ||
                        item.id ||
                        ""
                    )}"
                    class="order-item-name"
                >

                    ${escapeHTML(name)}

                </a>


                <div
                    class="order-item-seller"
                >

                    Sold by

                    <strong>
                        ${escapeHTML(
                            sellerName
                        )}
                    </strong>

                </div>


                <div
                    class="order-item-quantity"
                >

                    Quantity:
                    ${quantity}

                </div>

            </div>


            <div
                class="order-item-price"
            >

                ${formatNaira(
                    price * quantity
                )}

            </div>

        </div>

    `;

}



/* ==========================================================
   GET ITEMS
========================================================== */

function getOrderItems(order){

    if(
        Array.isArray(order.items)
    ){

        return order.items;

    }


    if(
        Array.isArray(order.products)
    ){

        return order.products;

    }


    if(
        Array.isArray(order.cartItems)
    ){

        return order.cartItems;

    }


    return [];

}



/* ==========================================================
   GET SUBTOTAL
========================================================== */

function getOrderSubtotal(
    order,
    items
){

    const value =
        Number(
            order.subtotal
        );


    if(
        Number.isFinite(value) &&
        value >= 0
    ){

        return value;

    }


    return items.reduce(
        function(total,item){

            const price =
                Number(
                    item.price ||
                    item.unitPrice ||
                    item.buyerPrice ||
                    0
                );


            const quantity =
                Number(
                    item.quantity ||
                    1
                );


            return (
                total +
                (
                    price *
                    quantity
                )
            );

        },
        0
    );

}



/* ==========================================================
   DELIVERY FEE
========================================================== */

function getOrderDeliveryFee(order){

    return Math.max(
        0,
        Number(
            order.deliveryFee ||
            order.shippingFee ||
            order.deliveryCost ||
            0
        )
    );

}



/* ==========================================================
   DISCOUNT
========================================================== */

function getOrderDiscount(order){

    return Math.max(
        0,
        Number(
            order.discount ||
            order.discountAmount ||
            0
        )
    );

}



/* ==========================================================
   TOTAL
========================================================== */

function getOrderTotal(order){

    const explicitTotal =
        Number(
            order.total
        );


    if(
        Number.isFinite(
            explicitTotal
        ) &&
        explicitTotal >= 0
    ){

        return explicitTotal;

    }


    const items =
        getOrderItems(
            order
        );


    const subtotal =
        getOrderSubtotal(
            order,
            items
        );


    const delivery =
        getOrderDeliveryFee(
            order
        );


    const discount =
        getOrderDiscount(
            order
        );


    return Math.max(
        0,
        subtotal +
        delivery -
        discount
    );

}



/* ==========================================================
   ORDER STATUS NORMALIZATION
========================================================== */

function normalizeOrderStatus(status){

    const value =
        String(
            status ||
            "pending"
        )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            "_"
        )
        .replace(
            /-/g,
            "_"
        );


    if(
        value ===
        "pending_payment"
    ){

        return "pending";

    }


    if(
        value ===
        "paid"
    ){

        return "processing";

    }


    if(
        value ===
        "in_transit"
    ){

        return "shipped";

    }


    if(
        value ===
        "outfordelivery"
    ){

        return "out_for_delivery";

    }


    return value;

}



/* ==========================================================
   ORDER STATUS LABEL
========================================================== */

function getOrderStatusLabel(status){

    const labels = {

        pending:
            "Pending",

        processing:
            "Processing",

        shipped:
            "Shipped",

        out_for_delivery:
            "Out for Delivery",

        delivered:
            "Delivered",

        cancelled:
            "Cancelled"

    };


    return (
        labels[status] ||
        capitalizeWords(status)
    );

}


/* ==========================================================
   PAYMENT STATUS
========================================================== */

function normalizePaymentStatus(status){

    return String(
        status ||
        "pending"
    )
    .trim()
    .toLowerCase()
    .replace(
        /\s+/g,
        "_"
    );

}


function getPaymentStatusLabel(status){

    const labels = {

        paid:
            "Paid",

        successful:
            "Paid",

        completed:
            "Paid",

        pending:
            "Pending",

        failed:
            "Failed",

        refunded:
            "Refunded",

        partially_refunded:
            "Partially Refunded"

    };


    return (
        labels[status] ||
        capitalizeWords(status)
    );

}



/* ==========================================================
   CAN CANCEL
========================================================== */

function canCancelOrder(status){

    return (
        status === "pending" ||
        status === "processing"
    );

}



/* ==========================================================
   CAN TRACK
========================================================== */

function canTrackOrder(status){

    return (
        status === "shipped" ||
        status === "out_for_delivery"
    );

}



/* ==========================================================
   ORDER ACTION EVENTS
========================================================== */

function attachOrderActionEvents(){

    const buttons =
        document.querySelectorAll(
            "[data-action]"
        );


    buttons.forEach(
        function(button){

            button.addEventListener(
                "click",
                handleOrderAction
            );

        }
    );

}



/* ==========================================================
   HANDLE ORDER ACTION
========================================================== */

function handleOrderAction(event){

    const button =
        event.currentTarget;


    const action =
        button.dataset.action;


    const orderId =
        button.dataset.orderId;


    if(!orderId){

        return;

    }


    const order =
        buyerOrders.find(
            function(item){

                return (
                    item.id ===
                    orderId
                );

            }
        );


    if(!order){

        return;

    }


    if(
        action === "view"
    ){

        viewOrder(order);

        return;

    }


    if(
        action === "track"
    ){

        trackOrder(order);

        return;

    }


    if(
        action === "reorder"
    ){

        reorder(order);

        return;

    }


    if(
        action === "cancel"
    ){

        cancelOrder(order);

        return;

    }

}



/* ==========================================================
   VIEW ORDER
========================================================== */

function viewOrder(order){

    /*
     * We will create order-details.html
     * next.
     */

    const orderId =
        order.id;


    window.location.href =
        "order-details.html?id=" +
        encodeURIComponent(
            orderId
        );

}



/* ==========================================================
   TRACK ORDER
========================================================== */

function trackOrder(order){

    const orderId =
        order.id;


    window.location.href =
        "track-order.html?id=" +
        encodeURIComponent(
            orderId
        );

}



/* ==========================================================
   REORDER
========================================================== */

function reorder(order){

    const items =
        getOrderItems(
            order
        );


    if(
        items.length === 0
    ){

        alert(
            "The products from this order are unavailable."
        );

        return;

    }


    let cart = [];


    try {

        const savedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if(savedCart){

            const parsed =
                JSON.parse(
                    savedCart
                );


            if(
                Array.isArray(parsed)
            ){

                cart = parsed;

            }

        }

    }
    catch(error){

        console.error(
            "Unable to read cart:",
            error
        );

    }


    items.forEach(
        function(item){

            const productId =
                item.productId ||
                item.id;


            if(!productId){

                return;

            }


            const quantity =
                Number(
                    item.quantity ||
                    1
                );


            const existingIndex =
                cart.findIndex(
                    function(cartItem){

                        return (
                            String(
                                cartItem.productId ||
                                cartItem.id
                            ) ===
                            String(productId)
                        );

                    }
                );


            if(
                existingIndex >= 0
            ){

                cart[
                    existingIndex
                ].quantity =
                    Number(
                        cart[
                            existingIndex
                        ].quantity ||
                        0
                    ) +
                    quantity;

            }
            else {

                cart.push({

                    ...item,

                    productId:
                        productId,

                    quantity:
                        quantity

                });

            }

        }
    );


    localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(
            cart
        )
    );


    updateOrdersCartCount();


    alert(
        "The products have been added to your cart."
    );


    window.location.href =
        "cart.html";

}



/* ==========================================================
   CANCEL ORDER
========================================================== */

async function cancelOrder(order){

    const status =
        normalizeOrderStatus(
            order.status
        );


    if(
        !canCancelOrder(status)
    ){

        alert(
            "This order can no longer be cancelled."
        );

        return;

    }


    const confirmed =
        window.confirm(
            "Are you sure you want to cancel this order?"
        );


    if(!confirmed){

        return;

    }


    /*
     * IMPORTANT:
     *
     * We are intentionally NOT changing
     * the Firestore order here yet.
     *
     * Cancellation should be handled by
     * the secure backend/admin/payment
     * workflow.
     */

    alert(
        "Cancellation request received. The order cancellation workflow will be connected next."
    );

}



/* ==========================================================
   CART COUNT
   Uses yourStoreCart
========================================================== */

function updateOrdersCartCount(){

    if(!ordersCartCount){

        return;

    }


    let cart = [];


    try {

        const savedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if(savedCart){

            const parsed =
                JSON.parse(
                    savedCart
                );


            if(
                Array.isArray(parsed)
            ){

                cart = parsed;

            }

        }

    }
    catch(error){

        console.error(
            "Cart storage error:",
            error
        );

    }


    /*
     * IMPORTANT:
     *
     * This counts actual quantities,
     * not number of product records.
     *
     * Example:
     *
     * Product A quantity 2
     * Product B quantity 3
     *
     * Cart count = 5
     */

    const count =
        cart.reduce(
            function(total,item){

                return (
                    total +
                    Number(
                        item.quantity ||
                        1
                    )
                );

            },
            0
        );


    ordersCartCount.textContent =
        count > 99
            ? "99+"
            : String(count);

}



/* ==========================================================
   LISTEN FOR CART CHANGES
========================================================== */

window.addEventListener(
    "storage",
    function(event){

        if(
            event.key ===
            CART_STORAGE_KEY
        ){

            updateOrdersCartCount();

        }

    }
);



/* ==========================================================
   SEARCH
========================================================== */

if(ordersSearchForm){

    ordersSearchForm.addEventListener(
        "submit",
        function(event){

            event.preventDefault();


            currentSearch =
                ordersSearchInput
                    ? ordersSearchInput.value
                    : "";


            applyOrderFilters();

        }
    );

}



if(ordersSearchInput){

    ordersSearchInput.addEventListener(
        "input",
        function(){

            currentSearch =
                ordersSearchInput.value;


            applyOrderFilters();

        }
    );

}



/* ==========================================================
   STATUS FILTER
========================================================== */

if(ordersStatusFilter){

    ordersStatusFilter.addEventListener(
        "change",
        function(){

            currentStatusFilter =
                ordersStatusFilter.value;


            updateSummaryActiveState();


            applyOrderFilters();

        }
    );

}



/* ==========================================================
   SORT FILTER
========================================================== */

if(ordersSortFilter){

    ordersSortFilter.addEventListener(
        "change",
        function(){

            currentSort =
                ordersSortFilter.value;


            applyOrderFilters();

        }
    );

}



/* ==========================================================
   SUMMARY BUTTONS
========================================================== */

const summaryButtons =
    document.querySelectorAll(
        "[data-summary-status]"
    );


summaryButtons.forEach(
    function(button){

        button.addEventListener(
            "click",
            function(){

                const status =
                    button.dataset.summaryStatus;


                currentStatusFilter =
                    status;


                if(ordersStatusFilter){

                    ordersStatusFilter.value =
                        status;

                }


                updateSummaryActiveState();


                applyOrderFilters();

            }
        );

    }
);



/* ==========================================================
   SUMMARY ACTIVE STATE
========================================================== */

function updateSummaryActiveState(){

    summaryButtons.forEach(
        function(button){

            const status =
                button.dataset.summaryStatus;


            button.classList.toggle(
                "active",
                status ===
                currentStatusFilter
            );

        }
    );

}



/* ==========================================================
   REFRESH
========================================================== */

if(refreshOrdersButton){

    refreshOrdersButton.addEventListener(
        "click",
        async function(){

            try {

                refreshOrdersButton.disabled =
                    true;


                refreshOrdersButton.textContent =
                    "Refreshing...";


                await loadBuyerOrders();


                updateOrderSummary();


                applyOrderFilters();

            }

            catch(error){

                console.error(
                    "Refresh orders error:",
                    error
                );


                showOrdersError(
                    "Unable to refresh your orders."
                );

            }

            finally {

                refreshOrdersButton.disabled =
                    false;


                refreshOrdersButton.textContent =
                    "↻ Refresh";

            }

        }
    );

}


/* ==========================================================
   RETRY
========================================================== */

if(retryOrdersButton){

    retryOrdersButton.addEventListener(
        "click",
        async function(){

            hideOrdersError();


            try {

                await loadBuyerOrders();


                updateOrderSummary();


                applyOrderFilters();

            }

            catch(error){

                console.error(
                    error
                );


                showOrdersError(
                    "Unable to load your orders."
                );

            }

        }
    );

}



/* ==========================================================
   SHOW APP
========================================================== */

function showOrdersApp(){

    if(!ordersApp){

        return;

    }


    ordersApp.style.display =
        "block";


    ordersApp.classList.add(
        "ready"
    );

}



/* ==========================================================
   SHOW LOADER
========================================================== */

function showOrdersLoader(){

    if(!ordersPageLoader){

        return;

    }


    ordersPageLoader.classList.remove(
        "hidden"
    );


    ordersPageLoader.style.display =
        "flex";

}



/* ==========================================================
   HIDE LOADER
========================================================== */

function hideOrdersLoader(){

    if(!ordersPageLoader){

        return;

    }


    ordersPageLoader.classList.add(
        "hidden"
    );


    setTimeout(
        function(){

            ordersPageLoader.style.display =
                "none";

        },
        300
    );

}



/* ==========================================================
   EMPTY
========================================================== */

function showOrdersEmpty(){

    if(ordersEmpty){

        ordersEmpty.hidden =
            false;

    }

}


function hideOrdersEmpty(){

    if(ordersEmpty){

        ordersEmpty.hidden =
            true;

    }

}



/* ==========================================================
   ERROR
========================================================== */

function showOrdersError(message){

    if(ordersErrorMessage){

        ordersErrorMessage.textContent =
            message;

    }


    if(ordersError){

        ordersError.hidden =
            false;

    }

}


function hideOrdersError(){

    if(ordersError){

        ordersError.hidden =
            true;

    }

}



/* ==========================================================
   REDIRECT
========================================================== */

function redirectBuyerToLogin(){

    const currentURL =
        window.location.href;


    window.location.href =
        "login.html?redirect=" +
        encodeURIComponent(
            currentURL
        );

}



/* ==========================================================
   FORMAT NAIRA
========================================================== */

function formatNaira(amount){

    const value =
        Number(
            amount || 0
        );


    return (
        "₦" +
        value.toLocaleString(
            "en-NG",
            {
                minimumFractionDigits:0,
                maximumFractionDigits:2
            }
        )
    );

}



/* ==========================================================
   FORMAT DATE
========================================================== */

function formatOrderDate(createdAt){

    const timestamp =
        getOrderTimestampValue(
            createdAt
        );


    if(!timestamp){

        return "Date unavailable";

    }


    const date =
        new Date(
            timestamp
        );


    return date.toLocaleDateString(
        "en-NG",
        {
            day:"numeric",
            month:"short",
            year:"numeric"
        }
    );

}



/* ==========================================================
   TIMESTAMP VALUE
========================================================== */

function getOrderTimestampValue(value){

    if(!value){

        return 0;

    }


    if(
        typeof value.toMillis ===
        "function"
    ){

        return value.toMillis();

    }


    if(
        value instanceof Date
    ){

        return value.getTime();

    }


    if(
        typeof value ===
        "number"
    ){

        return value;

    }


    const parsed =
        new Date(
            value
        ).getTime();


    return Number.isNaN(parsed)
        ? 0
        : parsed;

}



/* ==========================================================
   SET ELEMENT TEXT
========================================================== */

function setElementText(
    element,
    value
){

    if(element){

        element.textContent =
            String(value);

    }

}



/* ==========================================================
   CAPITALIZE
========================================================== */

function capitalizeWords(value){

    return String(
        value || ""
    )
    .replace(
        /_/g,
        " "
    )
    .replace(
        /\b\w/g,
        function(letter){

            return letter.toUpperCase();

        }
    );

}



/* ==========================================================
   SAFE HTML
========================================================== */

function escapeHTML(value){

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

