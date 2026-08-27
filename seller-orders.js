/* ==========================================================
   SELLER ORDERS — JAVASCRIPT
   PART 1
   Firebase + Authentication + Page State
========================================================== */


/* ==========================================================
   FIREBASE IMPORTS
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
    getDocs,
    doc,
    getDoc,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   SELLER ORDER PAGE STATE
========================================================== */

let currentSeller = null;

let sellerOrders = [];

let filteredSellerOrders = [];

let activeOrderStatus = "all";

let currentSearchTerm = "";

let currentSort = "newest";

let isLoadingOrders = false;


/* ==========================================================
   DOM ELEMENTS
========================================================== */


/* PAGE */

const sellerOrdersApp =
    document.getElementById(
        "sellerOrdersApp"
    );


const sellerOrdersLoader =
    document.getElementById(
        "sellerOrdersLoader"
    );


const sellerOrdersContentLoader =
    document.getElementById(
        "sellerOrdersContentLoader"
    );


/* SELLER PROFILE */

const sellerOrdersPhoto =
    document.getElementById(
        "sellerOrdersPhoto"
    );


const sellerOrdersName =
    document.getElementById(
        "sellerOrdersName"
    );


/* SEARCH */

const sellerOrderSearch =
    document.getElementById(
        "sellerOrderSearch"
    );


const sellerOrderSearchButton =
    document.getElementById(
        "sellerOrderSearchButton"
    );


/* SORT */

const sellerOrderSort =
    document.getElementById(
        "sellerOrderSort"
    );


/* FILTER BUTTONS */

const sellerOrderFilters =
    document.querySelectorAll(
        ".seller-order-filter"
    );


/* ORDERS */

const sellerOrdersList =
    document.getElementById(
        "sellerOrdersList"
    );


const visibleOrdersCount =
    document.getElementById(
        "visibleOrdersCount"
    );


/* EMPTY STATES */

const sellerOrdersEmpty =
    document.getElementById(
        "sellerOrdersEmpty"
    );


const sellerOrdersSearchEmpty =
    document.getElementById(
        "sellerOrdersSearchEmpty"
    );


/* ==========================================================
   ORDER SUMMARY ELEMENTS
========================================================== */

const allOrdersCount =
    document.getElementById(
        "allOrdersCount"
    );


const pendingOrdersCount =
    document.getElementById(
        "pendingOrdersCount"
    );


const processingOrdersCount =
    document.getElementById(
        "processingOrdersCount"
    );


const shippedOrdersCount =
    document.getElementById(
        "shippedOrdersCount"
    );


const deliveredOrdersCount =
    document.getElementById(
        "deliveredOrdersCount"
    );


const completedOrdersCount =
    document.getElementById(
        "completedOrdersCount"
    );


/* ==========================================================
   AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    async function(user){

        try {

            /* ==============================================
               USER NOT LOGGED IN
            ============================================== */

            if(!user){

                currentSeller = null;

                window.location.href =
                    "login.html";

                return;

            }


            /* ==============================================
               SAVE CURRENT SELLER
            ============================================== */

            currentSeller = user;


            /* ==============================================
               LOAD SELLER PROFILE
            ============================================== */

            await loadSellerProfile(
                user
            );


            /* ==============================================
               LOAD SELLER ORDERS
            ============================================== */

            await loadSellerOrders();


            /* ==============================================
               SHOW APPLICATION
            ============================================== */

            showSellerOrdersApp();

        }
        catch(error){

            console.error(
                "Seller orders initialization error:",
                error
            );

            showSellerOrdersError(
                "Unable to load your seller orders."
            );

        }
        finally {

            hideSellerOrdersLoader();

        }

    }
);


/* ==========================================================
   SHOW SELLER ORDERS APPLICATION
========================================================== */

function showSellerOrdersApp(){

    if(!sellerOrdersApp){

        return;

    }


    sellerOrdersApp.style.display =
        "block";


    sellerOrdersApp.classList.add(
        "ready"
    );

}


/* ==========================================================
   HIDE PAGE LOADER
========================================================== */

function hideSellerOrdersLoader(){

    if(!sellerOrdersLoader){

        return;

    }


    sellerOrdersLoader.classList.add(
        "hidden"
    );


    setTimeout(
        function(){

            sellerOrdersLoader.style.display =
                "none";

        },
        300
    );

}


/* ==========================================================
   SHOW CONTENT LOADER
========================================================== */

function showOrdersContentLoader(){

    if(!sellerOrdersContentLoader){

        return;

    }


    sellerOrdersContentLoader.style.display =
        "flex";

}


/* ==========================================================
   HIDE CONTENT LOADER
========================================================== */

function hideOrdersContentLoader(){

    if(!sellerOrdersContentLoader){

        return;

    }


    sellerOrdersContentLoader.style.display =
        "none";

}


/* ==========================================================
   SHOW PAGE ERROR
========================================================== */

function showSellerOrdersError(
    message
){

    if(!sellerOrdersList){

        return;

    }


    sellerOrdersList.innerHTML = `

        <div class="seller-orders-error">

            <div class="seller-orders-error-icon">
                ⚠️
            </div>

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeSellerOrderHTML(
                    message
                )}
            </p>

            <button
                type="button"
                id="retrySellerOrders"
                class="seller-orders-retry"
            >
                Try Again
            </button>

        </div>

    `;


    const retryButton =
        document.getElementById(
            "retrySellerOrders"
        );


    if(retryButton){

        retryButton.addEventListener(
            "click",
            function(){

                loadSellerOrders();

            }
        );

    }

}

/* ==========================================================
   SELLER PROFILE
========================================================== */

async function loadSellerProfile(user){

    if(!user){

        return;

    }


    try {

        /* ==============================================
           DEFAULT AUTH INFORMATION
        ============================================== */

        let sellerName =
            user.displayName ||
            "Seller";


        let sellerPhoto =
            user.photoURL ||
            "default-avatar.png";


        /* ==============================================
           LOAD SELLER DOCUMENT
        ============================================== */

        const sellerReference =
            doc(
                db,
                "users",
                user.uid
            );


        const sellerSnapshot =
            await getDoc(
                sellerReference
            );


        if(
            sellerSnapshot.exists()
        ){

            const sellerData =
                sellerSnapshot.data();


            /* ==========================================
               SELLER NAME
            ========================================== */

            sellerName =
                sellerData.storeName ||
                sellerData.sellerName ||
                sellerData.businessName ||
                sellerData.fullName ||
                sellerData.name ||
                sellerData.firstName ||
                sellerName;


            /* ==========================================
               SELLER PHOTO
            ========================================== */

            sellerPhoto =
                sellerData.storePhoto ||
                sellerData.storeImage ||
                sellerData.sellerPhoto ||
                sellerData.profilePhoto ||
                sellerData.photoURL ||
                sellerData.photo ||
                sellerPhoto;

        }


        /* ==============================================
           DISPLAY SELLER NAME
        ============================================== */

        if(sellerOrdersName){

            sellerOrdersName.textContent =
                sellerName;

        }


        /* ==============================================
           DISPLAY SELLER PHOTO
        ============================================== */

        if(sellerOrdersPhoto){

            sellerOrdersPhoto.src =
                sellerPhoto;


            sellerOrdersPhoto.onerror =
                function(){

                    this.onerror = null;

                    this.src =
                        "default-avatar.png";

                };

        }

    }
    catch(error){

        console.error(
            "Seller profile loading error:",
            error
        );


        /*
           Do not stop the order page
           if profile information fails.
        */

        if(sellerOrdersName){

            sellerOrdersName.textContent =
                user.displayName ||
                "Seller";

        }


        if(sellerOrdersPhoto){

            sellerOrdersPhoto.src =
                user.photoURL ||
                "default-avatar.png";

        }

    }

}


/* ==========================================================
   LOAD SELLER ORDERS
========================================================== */

async function loadSellerOrders(){

    if(!currentSeller){

        return;

    }


    if(isLoadingOrders){

        return;

    }


    isLoadingOrders = true;


    showOrdersContentLoader();


    try {

        /* ==============================================
           CLEAR OLD DATA
        ============================================== */

        sellerOrders = [];


        filteredSellerOrders = [];


        /* ==============================================
           ORDERS COLLECTION
        ============================================== */

        const ordersReference =
            collection(
                db,
                "orders"
            );


        let snapshot = null;


        /* ==============================================
           METHOD 1
           sellerId
        ============================================== */

        try {

            const sellerQuery =
                query(
                    ordersReference,
                    where(
                        "sellerId",
                        "==",
                        currentSeller.uid
                    )
                );


            snapshot =
                await getDocs(
                    sellerQuery
                );

        }
        catch(error){

            console.warn(
                "sellerId order query failed:",
                error
            );

        }


        /* ==============================================
           METHOD 2
           sellerUID
        ============================================== */

        if(
            !snapshot ||
            snapshot.empty
        ){

            try {

                const sellerUIDQuery =
                    query(
                        ordersReference,
                        where(
                            "sellerUID",
                            "==",
                            currentSeller.uid
                        )
                    );


                snapshot =
                    await getDocs(
                        sellerUIDQuery
                    );

            }
            catch(error){

                console.warn(
                    "sellerUID order query failed:",
                    error
                );

            }

        }


        /* ==============================================
           METHOD 3
           sellerUid
        ============================================== */

        if(
            !snapshot ||
            snapshot.empty
        ){

            try {

                const sellerUidQuery =
                    query(
                        ordersReference,
                        where(
                            "sellerUid",
                            "==",
                            currentSeller.uid
                        )
                    );


                snapshot =
                    await getDocs(
                        sellerUidQuery
                    );

            }
            catch(error){

                console.warn(
                    "sellerUid order query failed:",
                    error
                );

            }

        }


        /* ==============================================
           NO ORDERS FOUND
        ============================================== */

        if(
            !snapshot ||
            snapshot.empty
        ){

            sellerOrders = [];

            updateOrderSummary();

            applyOrderFilters();

            return;

        }


        /* ==============================================
           READ ORDERS
        ============================================== */

        snapshot.forEach(
            function(orderDocument){

                const orderData =
                    orderDocument.data();


                sellerOrders.push({

                    id:
                        orderDocument.id,

                    ...orderData

                });

            }
        );


        /* ==============================================
           REMOVE DUPLICATE ORDERS
        ============================================== */

        const uniqueOrders =
            new Map();


        sellerOrders.forEach(
            function(order){

                uniqueOrders.set(
                    order.id,
                    order
                );

            }
        );


        sellerOrders =
            Array.from(
                uniqueOrders.values()
            );


        /* ==============================================
           UPDATE SUMMARY
        ============================================== */

        updateOrderSummary();


        /* ==============================================
           APPLY FILTERS
        ============================================== */

        applyOrderFilters();

    }
    catch(error){

        console.error(
            "Seller orders loading error:",
            error
        );


        sellerOrders = [];

        filteredSellerOrders = [];


        if(sellerOrdersList){

            sellerOrdersList.innerHTML = `

                <div class="seller-orders-error">

                    <div class="seller-orders-error-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load orders
                    </h3>

                    <p>
                        We could not retrieve your orders.
                        Please try again.
                    </p>

                    <button
                        type="button"
                        id="retrySellerOrdersButton"
                        class="seller-orders-retry"
                    >
                        Try Again
                    </button>

                </div>

            `;


            const retryButton =
                document.getElementById(
                    "retrySellerOrdersButton"
                );


            if(retryButton){

                retryButton.addEventListener(
                    "click",
                    function(){

                        loadSellerOrders();

                    }
                );

            }

        }

    }
    finally {

        isLoadingOrders = false;

        hideOrdersContentLoader();

    }

}

/* ==========================================================
   NORMALIZE SELLER ORDER
========================================================== */

function normalizeSellerOrder(order){

    if(!order){

        return null;

    }


    /*
       Create a clean order object so the rest
       of the application can work even when
       different field names are used.
    */

    const normalizedOrder = {

        ...order,

        id:
            order.id ||
            order.orderId ||
            "",


        orderNumber:
            order.orderNumber ||
            order.orderNo ||
            order.orderID ||
            order.orderId ||
            order.id ||
            "Order",


        status:
            normalizeOrderStatus(
                order.status ||
                order.orderStatus ||
                order.deliveryStatus ||
                "pending"
            ),


        paymentStatus:
            normalizePaymentStatus(
                order.paymentStatus ||
                order.payment_status ||
                "pending"
            ),


        createdAt:
            order.createdAt ||
            order.date ||
            order.orderDate ||
            order.timestamp ||
            null,


        buyerName:
            order.buyerName ||
            order.customerName ||
            order.customer ||
            order.userName ||
            order.name ||
            "Customer",


        buyerEmail:
            order.buyerEmail ||
            order.customerEmail ||
            order.email ||
            "",


        buyerPhone:
            order.buyerPhone ||
            order.customerPhone ||
            order.phone ||
            order.phoneNumber ||
            "",


        deliveryAddress:
            order.deliveryAddress ||
            order.shippingAddress ||
            order.address ||
            order.deliveryAddressText ||
            "",


        paymentMethod:
            order.paymentMethod ||
            order.payment_type ||
            order.paymentType ||
            "Not specified",


        currency:
            order.currency ||
            "NGN"

    };


    /*
       Find products belonging to this seller.
    */

    normalizedOrder.sellerItems =
        getSellerOrderItems(
            order
        );


    /*
       Calculate seller-specific amount.
    */

    normalizedOrder.sellerSubtotal =
        calculateSellerSubtotal(
            normalizedOrder.sellerItems
        );


    /*
       If there are no identifiable seller items,
       fall back to the order total.
    */

    if(
        normalizedOrder.sellerItems.length === 0
    ){

        normalizedOrder.sellerSubtotal =
            getOrderTotal(
                order
            );

    }


    return normalizedOrder;

}


/* ==========================================================
   NORMALIZE ALL LOADED ORDERS
========================================================== */

function normalizeAllSellerOrders(){

    sellerOrders =
        sellerOrders
            .map(
                function(order){

                    return normalizeSellerOrder(
                        order
                    );

                }
            )
            .filter(
                function(order){

                    return order !== null;

                }
            );

}


/* ==========================================================
   NORMALIZE ORDER STATUS
========================================================== */

function normalizeOrderStatus(status){

    if(status === undefined || status === null){

        return "pending";

    }


    const value =
        String(status)
            .trim()
            .toLowerCase();


    /*
       Pending
    */

    if(
        value === "pending" ||
        value === "new" ||
        value === "placed" ||
        value === "order placed" ||
        value === "awaiting confirmation"
    ){

        return "pending";

    }


    /*
       Processing
    */

    if(
        value === "processing" ||
        value === "confirmed" ||
        value === "accepted" ||
        value === "preparing" ||
        value === "ready"
    ){

        return "processing";

    }


    /*
       Shipped
    */

    if(
        value === "shipped" ||
        value === "in transit" ||
        value === "dispatched" ||
        value === "out for delivery"
    ){

        return "shipped";

    }


    /*
       Delivered
    */

    if(
        value === "delivered" ||
        value === "received"
    ){

        return "delivered";

    }


    /*
       Completed
    */

    if(
        value === "completed" ||
        value === "complete" ||
        value === "closed"
    ){

        return "completed";

    }


    /*
       Cancelled
    */

    if(
        value === "cancelled" ||
        value === "canceled" ||
        value === "rejected"
    ){

        return "cancelled";

    }


    return value || "pending";

}


/* ==========================================================
   NORMALIZE PAYMENT STATUS
========================================================== */

function normalizePaymentStatus(status){

    if(status === undefined || status === null){

        return "pending";

    }


    const value =
        String(status)
            .trim()
            .toLowerCase();


    if(
        value === "paid" ||
        value === "successful" ||
        value === "success" ||
        value === "completed"
    ){

        return "paid";

    }


    if(
        value === "failed" ||
        value === "failure"
    ){

        return "failed";

    }


    if(
        value === "refunded" ||
        value === "refund"
    ){

        return "refunded";

    }


    return "pending";

}


/* ==========================================================
   GET SELLER ORDER ITEMS
========================================================== */

function getSellerOrderItems(order){

    if(!order){

        return [];

    }


    /*
       Possible item containers.
    */

    let items =
        order.items ||
        order.products ||
        order.orderItems ||
        order.cartItems ||
        order.order_items ||
        [];


    /*
       Make sure items are an array.
    */

    if(!Array.isArray(items)){

        /*
           Some systems store a single product
           as an object.
        */

        if(
            typeof items === "object" &&
            items !== null
        ){

            items = [
                items
            ];

        }
        else {

            items = [];

        }

    }


    /*
       Filter items that belong to the
       current seller.
    */

    const sellerItems =
        items.filter(
            function(item){

                return isSellerProduct(
                    item
                );

            }
        );


    return sellerItems.map(
        function(item){

            return normalizeOrderItem(
                item
            );

        }
    );

}


/* ==========================================================
   CHECK WHETHER ITEM BELONGS TO SELLER
========================================================== */

function isSellerProduct(item){

    if(!item){

        return false;

    }


    /*
       If the order item explicitly contains
       seller information, use it.
    */

    const itemSellerId =
        item.sellerId ||
        item.sellerUID ||
        item.sellerUid ||
        item.sellerID ||
        item.ownerId ||
        item.ownerUID;


    if(
        itemSellerId &&
        currentSeller
    ){

        return String(
            itemSellerId
        ) === String(
            currentSeller.uid
        );

    }


    /*
       Some systems store seller information
       inside a nested seller object.
    */

    if(
        item.seller &&
        typeof item.seller === "object"
    ){

        const nestedSellerId =
            item.seller.uid ||
            item.seller.id ||
            item.seller.sellerId;


        if(
            nestedSellerId &&
            currentSeller
        ){

            return String(
                nestedSellerId
            ) === String(
                currentSeller.uid
            );

        }

    }


    /*
       If the parent order belongs directly
       to this seller, accept the item.
    */

    if(
        currentSeller &&
        (
            orderBelongsToCurrentSeller(
                item
            )
        )
    ){

        return true;

    }


    /*
       If no seller information exists inside
       the item, do not incorrectly hide it
       when the whole order is already a seller
       order.

       The parent order is handled separately
       below by getSellerOrderItemsFallback().
    */

    return false;

}


/* ==========================================================
   CHECK PARENT-LEVEL SELLER OWNERSHIP
========================================================== */

function orderBelongsToCurrentSeller(order){

    if(
        !order ||
        !currentSeller
    ){

        return false;

    }


    const sellerId =
        order.sellerId ||
        order.sellerUID ||
        order.sellerUid ||
        order.sellerID ||
        order.ownerId ||
        order.ownerUID;


    if(!sellerId){

        return false;

    }


    return String(
        sellerId
    ) === String(
        currentSeller.uid
    );

}


/* ==========================================================
   NORMALIZE ORDER ITEM
========================================================== */

function normalizeOrderItem(item){

    if(!item){

        return {

            id: "",

            name: "Product",

            image:
                "images/product-placeholder.jpg",

            price: 0,

            quantity: 1,

            total: 0

        };

    }


    const price =
        Number(
            item.price ||
            item.unitPrice ||
            item.sellingPrice ||
            item.buyerPrice ||
            0
        );


    const quantity =
        Math.max(
            1,
            Number(
                item.quantity ||
                item.qty ||
                1
            )
        );


    const explicitTotal =
        Number(
            item.total ||
            item.itemTotal ||
            item.subtotal ||
            0
        );


    const total =
        explicitTotal > 0
            ? explicitTotal
            : price * quantity;


    return {

        ...item,


        id:
            item.id ||
            item.productId ||
            item.productID ||
            "",


        name:
            item.name ||
            item.productName ||
            item.title ||
            "Product",


        image:
            item.image ||
            item.mainImage ||
            (
                Array.isArray(item.images)
                    ? item.images[0]
                    : ""
            ) ||
            "images/product-placeholder.jpg",


        price:
            price,


        quantity:
            quantity,


        total:
            total

    };

}


/* ==========================================================
   CALCULATE SELLER SUBTOTAL
========================================================== */

function calculateSellerSubtotal(items){

    if(
        !Array.isArray(items) ||
        items.length === 0
    ){

        return 0;

    }


    return items.reduce(
        function(total, item){

            const itemTotal =
                Number(
                    item.total ||
                    0
                );


            return total + itemTotal;

        },
        0
    );

}


/* ==========================================================
   GET ORDER TOTAL
========================================================== */

function getOrderTotal(order){

    if(!order){

        return 0;

    }


    const possibleTotals = [

        order.total,

        order.orderTotal,

        order.grandTotal,

        order.amount,

        order.totalAmount,

        order.finalTotal,

        order.subtotal

    ];


    for(
        let i = 0;
        i < possibleTotals.length;
        i++
    ){

        const value =
            Number(
                possibleTotals[i]
            );


        if(
            Number.isFinite(value) &&
            value > 0
        ){

            return value;

        }

    }


    return 0;

}


/* ==========================================================
   GET SELLER ITEMS FALLBACK
========================================================== */

function getSellerOrderItemsFallback(order){

    if(!order){

        return [];

    }


    /*
       If the entire order belongs to the current
       seller and the items don't contain seller IDs,
       all order items can safely be treated as
       this seller's items.
    */

    if(
        orderBelongsToCurrentSeller(
            order
        )
    ){

        let items =
            order.items ||
            order.products ||
            order.orderItems ||
            order.cartItems ||
            [];


        if(!Array.isArray(items)){

            if(
                items &&
                typeof items === "object"
            ){

                items = [
                    items
                ];

            }
            else {

                items = [];

            }

        }


        return items.map(
            function(item){

                return normalizeOrderItem(
                    item
                );

            }
        );

    }


    return [];

}


/* ==========================================================
   GET FINAL SELLER ITEMS
========================================================== */

function getFinalSellerOrderItems(order){

    let items =
        getSellerOrderItems(
            order
        );


    /*
       If seller-specific filtering did not find
       any items, try parent-level ownership.
    */

    if(
        items.length === 0
    ){

        items =
            getSellerOrderItemsFallback(
                order
            );

    }


    return items;

}

/* ==========================================================
   UPDATE ORDER SUMMARY
========================================================== */

function updateOrderSummary(){

    const allOrdersCount =
        document.getElementById(
            "allOrdersCount"
        );

    const pendingOrdersCount =
        document.getElementById(
            "pendingOrdersCount"
        );

    const processingOrdersCount =
        document.getElementById(
            "processingOrdersCount"
        );

    const shippedOrdersCount =
        document.getElementById(
            "shippedOrdersCount"
        );

    const deliveredOrdersCount =
        document.getElementById(
            "deliveredOrdersCount"
        );

    const completedOrdersCount =
        document.getElementById(
            "completedOrdersCount"
        );


    /*
     * Make sure we have an array.
     */

    if(
        !Array.isArray(sellerOrders)
    ){

        sellerOrders = [];

    }


    /*
     * Normalize status before counting.
     */

    function getOrderStatus(order){

        return String(
            order.status ||
            order.orderStatus ||
            "pending"
        )
        .trim()
        .toLowerCase();

    }


    /*
     * Count orders.
     */

    const all =
        sellerOrders.length;


    const pending =
        sellerOrders.filter(
            order =>
                getOrderStatus(order) ===
                "pending"
        ).length;


    const processing =
        sellerOrders.filter(
            order =>
                getOrderStatus(order) ===
                "processing"
        ).length;


    const shipped =
        sellerOrders.filter(
            order =>
                getOrderStatus(order) ===
                "shipped"
        ).length;


    const delivered =
        sellerOrders.filter(
            order =>
                getOrderStatus(order) ===
                "delivered"
        ).length;


    const completed =
        sellerOrders.filter(
            order =>
                getOrderStatus(order) ===
                "completed"
        ).length;


    /*
     * Update dashboard counters.
     */

    if(allOrdersCount){

        allOrdersCount.textContent =
            all;

    }


    if(pendingOrdersCount){

        pendingOrdersCount.textContent =
            pending;

    }


    if(processingOrdersCount){

        processingOrdersCount.textContent =
            processing;

    }


    if(shippedOrdersCount){

        shippedOrdersCount.textContent =
            shipped;

    }


    if(deliveredOrdersCount){

        deliveredOrdersCount.textContent =
            delivered;

    }


    if(completedOrdersCount){

        completedOrdersCount.textContent =
            completed;

    }

}

/* ==========================================================
   APPLY ORDER FILTERS
========================================================== */

function applyOrderFilters(){

    if(!Array.isArray(sellerOrders)){

        sellerOrders = [];

    }


    /*
     * Get the currently selected filter.
     */

    const activeFilter =
        document.querySelector(
            ".seller-order-filter.active"
        );


    const selectedStatus =
        activeFilter
            ? String(
                activeFilter.dataset.status ||
                "all"
            ).toLowerCase()
            : "all";


    /*
     * Get search text.
     */

    const searchInput =
        document.getElementById(
            "sellerOrderSearch"
        );


    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    /*
     * Filter orders.
     */

    const filteredOrders =
        sellerOrders.filter(
            function(order){

                /*
                 * Normalize order status.
                 */

                const status =
                    String(
                        order.status ||
                        order.orderStatus ||
                        "pending"
                    )
                    .trim()
                    .toLowerCase();


                /*
                 * Status filter.
                 */

                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                if(!matchesStatus){

                    return false;

                }


                /*
                 * Search through useful
                 * order information.
                 */

                if(!searchTerm){

                    return true;

                }


                const searchableText = [

                    order.id,

                    order.orderId,

                    order.orderNumber,

                    order.productName,

                    order.buyerName,

                    order.customerName,

                    order.buyerEmail,

                    order.customerEmail,

                    order.phone,

                    order.shippingAddress,

                    order.address

                ]
                .filter(
                    value =>
                        value !== undefined &&
                        value !== null
                )
                .join(" ")
                .toLowerCase();


                return searchableText.includes(
                    searchTerm
                );

            }
        );


    /*
     * Apply sorting.
     */

    const sortSelect =
        document.getElementById(
            "sellerOrderSort"
        );


    const sortType =
        sortSelect
            ? sortSelect.value
            : "newest";


    filteredOrders.sort(
        function(a, b){

            if(
                sortType === "highest" ||
                sortType === "lowest"
            ){

                const amountA =
                    Number(
                        a.total ||
                        a.totalAmount ||
                        a.amount ||
                        a.orderTotal ||
                        0
                    );


                const amountB =
                    Number(
                        b.total ||
                        b.totalAmount ||
                        b.amount ||
                        b.orderTotal ||
                        0
                    );


                return sortType === "highest"
                    ? amountB - amountA
                    : amountA - amountB;

            }


            const dateA =
                getSellerOrderDate(
                    a
                );


            const dateB =
                getSellerOrderDate(
                    b
                );


            return sortType === "oldest"
                ? dateA - dateB
                : dateB - dateA;

        }
    );


    /*
     * Store the filtered result globally.
     */

    filteredSellerOrders =
        filteredOrders;


    /*
     * Render the results.
     */

    renderSellerOrders(
        filteredOrders
    );


    /*
     * Update visible count.
     */

    updateVisibleOrdersCount(
        filteredOrders.length
    );


    /*
     * Show the correct empty state.
     */

    updateSellerOrderEmptyStates(
        filteredOrders.length,
        sellerOrders.length,
        searchTerm
    );

}

/* ==========================================================
   RENDER SELLER ORDERS
========================================================== */

function renderSellerOrders(orders){

    const ordersList =
        document.getElementById(
            "sellerOrdersList"
        );


    if(!ordersList){

        return;

    }


    /*
     * Clear previous orders.
     */

    ordersList.innerHTML = "";


    /*
     * Make sure orders is an array.
     */

    if(!Array.isArray(orders)){

        orders = [];

    }


    /*
     * Nothing to render.
     */

    if(orders.length === 0){

        return;

    }


    /*
     * Create each order card.
     */

    orders.forEach(
        function(order){

            const orderCard =
                createSellerOrderCard(
                    order
                );


            if(orderCard){

                ordersList.appendChild(
                    orderCard
                );

            }

        }
    );

}


/* ==========================================================
   UPDATE VISIBLE ORDERS COUNT
========================================================== */

function updateVisibleOrdersCount(count){

    const element =
        document.getElementById(
            "visibleOrdersCount"
        );


    if(!element){

        return;

    }


    const total =
        Number(count) || 0;


    element.textContent =
        total === 1
            ? "1 order"
            : `${total} orders`;

}


/* ==========================================================
   UPDATE SELLER ORDER EMPTY STATES
========================================================== */

function updateSellerOrderEmptyStates(
    visibleCount,
    totalCount,
    searchTerm
){

    const normalEmpty =
        document.getElementById(
            "sellerOrdersEmpty"
        );

    const searchEmpty =
        document.getElementById(
            "sellerOrdersSearchEmpty"
        );

    const contentLoader =
        document.getElementById(
            "sellerOrdersContentLoader"
        );


    /*
     * Hide both empty states first.
     */

    if(normalEmpty){

        normalEmpty.style.display =
            "none";

    }


    if(searchEmpty){

        searchEmpty.style.display =
            "none";

    }


    /*
     * Loading is finished when this
     * function is called.
     */

    if(contentLoader){

        contentLoader.style.display =
            "none";

    }


    /*
     * Orders are available.
     */

    if(visibleCount > 0){

        return;

    }


    /*
     * There are orders, but the current
     * search/filter found nothing.
     */

    if(
        searchTerm ||
        totalCount > 0
    ){

        if(searchEmpty){

            searchEmpty.style.display =
                "block";

        }

        return;

    }


    /*
     * There are no seller orders at all.
     */

    if(normalEmpty){

        normalEmpty.style.display =
            "block";

    }

}
