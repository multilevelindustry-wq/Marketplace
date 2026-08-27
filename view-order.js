/* ==========================================================
   VIEW ORDER - ADMIN
========================================================== */

import {
    auth,
    db
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



/* ==========================================================
   ADMIN CONFIGURATION
========================================================== */

const ADMIN_EMAIL =
    "Administrative987654321@gmail.com";


/* ==========================================================
   STATE
========================================================== */

let currentUser = null;

let currentOrder = null;

let currentOrderId = null;

let selectedStatus = null;



/* ==========================================================
   ELEMENTS
========================================================== */

const loader =
    document.getElementById(
        "viewOrderLoader"
    );


const orderIdDisplay =
    document.getElementById(
        "orderIdDisplay"
    );


const orderStatusBadge =
    document.getElementById(
        "orderStatusBadge"
    );


const buyerName =
    document.getElementById(
        "buyerName"
    );


const sellerName =
    document.getElementById(
        "sellerName"
    );


const orderAmount =
    document.getElementById(
        "orderAmount"
    );


const paymentStatus =
    document.getElementById(
        "paymentStatus"
    );


const orderItems =
    document.getElementById(
        "orderItems"
    );


const paymentProvider =
    document.getElementById(
        "paymentProvider"
    );


const paymentId =
    document.getElementById(
        "paymentId"
    );


const courierName =
    document.getElementById(
        "courierName"
    );


const trackingNumber =
    document.getElementById(
        "trackingNumber"
    );


const deliveryCode =
    document.getElementById(
        "deliveryCode"
    );


const currentCourier =
    document.getElementById(
        "currentCourier"
    );


const currentTracking =
    document.getElementById(
        "currentTracking"
    );


const currentDeliveryCode =
    document.getElementById(
        "currentDeliveryCode"
    );


const currentPosition =
    document.getElementById(
        "currentPosition"
    );



/* ==========================================================
   VIEW ORDER - FIREBASE
========================================================== */




/* ==========================================================
   GET ELEMENTS
========================================================== */

const pageLoader =
    document.getElementById(
        "viewOrderLoader"
    );

const pageContent =
    document.getElementById(
        "viewOrderApp"
    );


/* ==========================================================
   SHOW / HIDE LOADER
========================================================== */

function showLoader(){

    if(pageLoader){

        pageLoader.style.display =
            "flex";

    }

}


function hideLoader(){

    if(pageLoader){

        pageLoader.style.display =
            "none";

    }

}


function showPage(){

    if(pageContent){

        pageContent.style.display =
            "block";

    }

}


/* ==========================================================
   GET ORDER ID FROM URL
========================================================== */

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const orderId =
    urlParams.get(
        "orderId"
    );


console.log(
    "VIEW ORDER ID:",
    orderId
);


/* ==========================================================
   DISPLAY ERROR
========================================================== */

function showOrderError(message){

    hideLoader();

    if(pageContent){

        pageContent.style.display =
            "block";


        pageContent.innerHTML = `

            <section class="view-order-error">

                <div class="view-order-error-icon">
                    ⚠️
                </div>

                <h2>
                    Unable to load order
                </h2>

                <p>
                    ${message}
                </p>

                <button
                    type="button"
                    onclick="history.back()"
                    class="view-order-back-button"
                >
                    ← Go Back
                </button>

            </section>

        `;

    }

}


/* ==========================================================
   LOAD ORDER
========================================================== */

async function loadAdminOrder(){

    showLoader();


    /* ------------------------------------------------------
       CHECK ORDER ID
    ------------------------------------------------------ */

    if(!orderId){

        console.error(
            "No orderId found in URL."
        );


        showOrderError(
            "No order ID was provided."
        );


        return;

    }


    try{

        console.log(
            "Loading order:",
            orderId
        );


        /* --------------------------------------------------
           FIRESTORE ORDER REFERENCE
        -------------------------------------------------- */

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );


        /* --------------------------------------------------
           GET ORDER
        -------------------------------------------------- */

        const orderSnapshot =
            await getDoc(
                orderRef
            );


        console.log(
            "Order snapshot:",
            orderSnapshot
        );


        /* --------------------------------------------------
           ORDER DOES NOT EXIST
        -------------------------------------------------- */

        if(!orderSnapshot.exists()){

            console.error(
                "Order does not exist:",
                orderId
            );


            showOrderError(
                `Order ${orderId} could not be found.`
            );


            return;

        }


        /* --------------------------------------------------
           GET DATA
        -------------------------------------------------- */

        const order =
            orderSnapshot.data();


        console.log(
            "ORDER DATA:",
            order
        );


        /* --------------------------------------------------
           DISPLAY ORDER
        -------------------------------------------------- */

        displayAdminOrder(
            order,
            orderId
        );


        /* --------------------------------------------------
           SHOW PAGE
        -------------------------------------------------- */

        showPage();

        hideLoader();


    }catch(error){

        console.error(
            "VIEW ORDER FIREBASE ERROR:",
            error
        );


        showOrderError(
            error.message ||
            "An unexpected error occurred while loading this order."
        );

    }

}


/* ==========================================================
   DISPLAY ORDER
========================================================== */

function displayAdminOrder(
    order,
    orderId
){

    const orderIdElement =
        document.getElementById(
            "viewOrderId"
        );


    const statusElement =
        document.getElementById(
            "viewOrderStatus"
        );


    const buyerElement =
        document.getElementById(
            "viewOrderBuyer"
        );


    const amountElement =
        document.getElementById(
            "viewOrderAmount"
        );


    const trackingElement =
        document.getElementById(
            "viewOrderTracking"
        );


    const paymentElement =
        document.getElementById(
            "viewOrderPayment"
        );


    /* ------------------------------------------------------
       ORDER ID
    ------------------------------------------------------ */

    if(orderIdElement){

        orderIdElement.textContent =
            orderId;

    }


    /* ------------------------------------------------------
       STATUS
    ------------------------------------------------------ */

    if(statusElement){

        statusElement.textContent =
            order.status ||
            "Pending";

    }


    /* ------------------------------------------------------
       BUYER
    ------------------------------------------------------ */

    if(buyerElement){

        buyerElement.textContent =
            order.buyerName ||
            order.buyerEmail ||
            "Buyer";

    }


    /* ------------------------------------------------------
       AMOUNT
    ------------------------------------------------------ */

    if(amountElement){

        const amount =
            Number(
                order.amount ||
                order.total ||
                order.totalAmount ||
                0
            );


        amountElement.textContent =
            `₦${amount.toLocaleString()}`;

    }


    /* ------------------------------------------------------
       TRACKING
    ------------------------------------------------------ */

    if(trackingElement){

        trackingElement.textContent =
            order.trackingNumber ||
            "Not assigned";

    }


    /* ------------------------------------------------------
       PAYMENT
    ------------------------------------------------------ */

    if(paymentElement){

        paymentElement.textContent =
            order.paymentId ||
            order.transactionId ||
            "Not available";

    }

}


/* ==========================================================
   AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    async function(user){

        try{

            if(!user){

                showOrderError(
                    "You must be logged in to access this order."
                );

                return;

            }


            console.log(
                "Admin user:",
                user.email
            );


            await loadAdminOrder();


        }catch(error){

            console.error(
                "VIEW ORDER INITIALIZATION ERROR:",
                error
            );


            showOrderError(
                error.message ||
                "Unable to initialize the order page."
            );

        }

    }
);



/* ==========================================================
   GET ORDER ID
========================================================== */

function getOrderId(){

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get(
        "orderId"
    );

}



/* ==========================================================
   FORMAT MONEY
========================================================== */

function formatMoney(
    amount,
    currency = "NGN"
){

    const number =
        Number(amount || 0);


    if(currency === "NGN"){

        return "₦" +
            number.toLocaleString(
                "en-NG",
                {
                    minimumFractionDigits: 2
                }
            );

    }


    return number.toLocaleString(
        undefined,
        {
            style: "currency",
            currency
        }
    );

}



/* ==========================================================
   FORMAT STATUS
========================================================== */

function formatStatus(
    status
){

    if(!status){

        return "Pending";

    }


    return status
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}



/* ==========================================================
   AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    async function(user){

        if(!user){

            window.location.href =
                "admin-login.html";

            return;

        }


        if(
            user.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ){

            await auth.signOut();

            window.location.href =
                "admin-login.html";

            return;

        }


        currentUser =
            user;


        currentOrderId =
            getOrderId();


        if(!currentOrderId){

            alert(
                "Order ID is missing."
            );

            window.location.href =
                "admin.html";

            return;

        }


        await loadOrder();

    }
);



/* ==========================================================
   LOAD ORDER
========================================================== */

async function loadOrder(){

    try{

        const orderRef =
            doc(
                db,
                "orders",
                currentOrderId
            );


        const snapshot =
            await getDoc(
                orderRef
            );


        if(!snapshot.exists()){

            alert(
                "Order was not found."
            );

            window.location.href =
                "admin.html";

            return;

        }


        currentOrder = {

            id:
                snapshot.id,

            ...snapshot.data()

        };


        populateOrder();


        hideLoader();

    }
    catch(error){

        console.error(
            "LOAD ORDER ERROR:",
            error
        );


        alert(
            "Unable to load this order."
        );

    }

}



/* ==========================================================
   POPULATE ORDER
========================================================== */

function populateOrder(){

    const order =
        currentOrder;


    orderIdDisplay.textContent =
        order.id;


    buyerName.textContent =
        order.buyerName ||
        order.buyerEmail ||
        "Buyer";


    sellerName.textContent =
        order.sellerName ||
        "Seller";


    orderAmount.textContent =
        formatMoney(
            order.totalAmount ??
            order.amount ??
            0,
            order.currency ||
            "NGN"
        );


    paymentStatus.textContent =
        order.paymentStatus ||
        "Unknown";


    orderStatusBadge.textContent =
        formatStatus(
            order.status
        );


    paymentProvider.value =
        order.paymentProvider ||
        "";


    paymentId.value =
        order.paymentId ||
        "";


    courierName.value =
        order.courierName ||
        "";


    trackingNumber.value =
        order.trackingNumber ||
        "";


    deliveryCode.value =
        order.deliveryCode ||
        "";


    currentCourier.textContent =
        order.courierName ||
        "Not assigned";


    currentTracking.textContent =
        order.trackingNumber ||
        "Not assigned";


    currentDeliveryCode.textContent =
        order.deliveryCode ||
        "Not assigned";


    currentPosition.textContent =
        formatStatus(
            order.status
        );


    renderItems(
        order.items || []
    );

}



/* ==========================================================
   RENDER ITEMS
========================================================== */

function renderItems(
    items
){

    orderItems.innerHTML = "";


    if(!items.length){

        orderItems.innerHTML = `
            <div class="empty-items">
                No item information available.
            </div>
        `;

        return;

    }


    items.forEach(
        function(item){

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "order-item";


            const image =
                item.image ||
                item.productImage ||
                "default-product.png";


            const name =
                item.name ||
                item.productName ||
                "Product";


            const quantity =
                item.quantity ||
                1;


            const price =
                item.price ||
                0;


            div.innerHTML = `

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                >

                <div>

                    <strong>
                        ${escapeHTML(name)}
                    </strong>

                    <span>
                        Quantity: ${quantity}
                    </span>

                </div>

                <strong>
                    ${formatMoney(
                        price,
                        currentOrder.currency ||
                        "NGN"
                    )}
                </strong>

            `;


            orderItems.appendChild(
                div
            );

        }
    );

}



/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(
    value
){

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}



/* ==========================================================
   CONFIRM PAYMENT
========================================================== */

document
    .getElementById(
        "confirmPaymentButton"
    )
    .addEventListener(
        "click",
        confirmPayment
    );



async function confirmPayment(){

    const provider =
        paymentProvider.value.trim();


    const reference =
        paymentId.value.trim();


    if(!provider){

        showMessage(
            "paymentMessage",
            "Select the payment provider."
        );

        return;

    }


    if(!reference){

        showMessage(
            "paymentMessage",
            "Enter the payment ID/reference."
        );

        return;

    }


    try{

        const orderRef =
            doc(
                db,
                "orders",
                currentOrderId
            );


        await updateDoc(
            orderRef,
            {

                paymentProvider:
                    provider,

                paymentId:
                    reference,

                paymentStatus:
                    "paid",

                status:
                    currentOrder.status ===
                    "pending"
                        ? "paid"
                        : currentOrder.status,

                paidAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }
        );


        await createOrderNotification(
            "payment_confirmed",
            "Payment confirmed",
            `Payment for order ${currentOrderId} has been confirmed.`,
            currentOrder.buyerId
        );


        await refreshOrder();


        showMessage(
            "paymentMessage",
            "Payment confirmed successfully.",
            true
        );

    }
    catch(error){

        console.error(
            "PAYMENT ERROR:",
            error
        );


        showMessage(
            "paymentMessage",
            "Unable to confirm payment."
        );

    }

}



/* ==========================================================
   ASSIGN TRACKING
========================================================== */

document
    .getElementById(
        "assignTrackingButton"
    )
    .addEventListener(
        "click",
        assignTracking
    );



async function assignTracking(){

    const courier =
        courierName.value.trim();


    const tracking =
        trackingNumber.value.trim();


    const code =
        deliveryCode.value.trim();


    if(!tracking){

        showMessage(
            "trackingMessage",
            "Enter the courier tracking number."
        );

        return;

    }


    if(!code){

        showMessage(
            "trackingMessage",
            "Enter a delivery code."
        );

        return;

    }


    try{

        const orderRef =
            doc(
                db,
                "orders",
                currentOrderId
            );


        await updateDoc(
            orderRef,
            {

                courierName:
                    courier,

                trackingNumber:
                    tracking,

                deliveryCode:
                    code,

                trackingAssignedAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp(),

                status:
                    currentOrder.status ===
                    "pending"
                        ? "awaiting_pickup"
                        : currentOrder.status

            }
        );


        /*
         * Notify buyer
         */

        if(currentOrder.buyerId){

            await createOrderNotification(
                "tracking_assigned",
                "Tracking number assigned",
                `Your order ${currentOrderId} has been assigned tracking number ${tracking}.`,
                currentOrder.buyerId
            );

        }


        /*
         * Notify seller(s)
         */

        const sellerIds =
            getSellerIds(
                currentOrder
            );


        for(
            const sellerId
            of sellerIds
        ){

            await createOrderNotification(
                "tracking_assigned",
                "Courier pickup arranged",
                `Order ${currentOrderId} has been assigned courier tracking number ${tracking}. Please prepare the item for pickup.`,
                sellerId
            );

        }


        await refreshOrder();


        showMessage(
            "trackingMessage",
            "Tracking information assigned and notifications created.",
            true
        );

    }
    catch(error){

        console.error(
            "TRACKING ERROR:",
            error
        );


        showMessage(
            "trackingMessage",
            "Unable to assign tracking."
        );

    }

}



/* ==========================================================
   SELLER IDS
========================================================== */

function getSellerIds(
    order
){

    const ids = [];


    if(
        Array.isArray(
            order.sellerIds
        )
    ){

        order.sellerIds.forEach(
            id => {

                if(
                    id &&
                    !ids.includes(id)
                ){

                    ids.push(id);

                }

            }
        );

    }


    if(
        order.sellerId &&
        !ids.includes(
            order.sellerId
        )
    ){

        ids.push(
            order.sellerId
        );

    }


    /*
     * Also check sellers stored
     * on individual products.
     */

    if(
        Array.isArray(
            order.items
        )
    ){

        order.items.forEach(
            item => {

                const id =
                    item.sellerId;


                if(
                    id &&
                    !ids.includes(id)
                ){

                    ids.push(id);

                }

            }
        );

    }


    return ids;

}



/* ==========================================================
   STATUS SELECTION
========================================================== */

document
    .querySelectorAll(
        ".status-option"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    document
                        .querySelectorAll(
                            ".status-option"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );


                    this.classList.add(
                        "selected"
                    );


                    selectedStatus =
                        this.dataset.status;

                }
            );

        }
    );



/* ==========================================================
   UPDATE STATUS
========================================================== */

document
    .getElementById(
        "updateStatusButton"
    )
    .addEventListener(
        "click",
        updateOrderStatus
    );



async function updateOrderStatus(){

    if(!selectedStatus){

        showMessage(
            "statusMessage",
            "Select an order status first."
        );

        return;

    }


    try{

        const orderRef =
            doc(
                db,
                "orders",
                currentOrderId
            );


        const updateData = {

            status:
                selectedStatus,

            updatedAt:
                serverTimestamp()

        };


        /*
         * Record important
         * delivery milestones.
         */

        if(
            selectedStatus ===
            "picked_up"
        ){

            updateData.pickedUpAt =
                serverTimestamp();

        }


        if(
            selectedStatus ===
            "in_transit"
        ){

            updateData.inTransitAt =
                serverTimestamp();

        }


        if(
            selectedStatus ===
            "out_for_delivery"
        ){

            updateData.outForDeliveryAt =
                serverTimestamp();

        }


        if(
            selectedStatus ===
            "delivered"
        ){

            updateData.deliveredAt =
                serverTimestamp();

        }


        if(
            selectedStatus ===
            "completed"
        ){

            updateData.completedAt =
                serverTimestamp();

        }


        await updateDoc(
            orderRef,
            updateData
        );


        /*
         * Buyer notification
         */

        if(currentOrder.buyerId){

            await createOrderNotification(
                "order_status",
                `Order ${formatStatus(selectedStatus)}`,
                `Your order ${currentOrderId} is now ${formatStatus(selectedStatus)}.`,
                currentOrder.buyerId
            );

        }


        /*
         * Seller notifications
         */

        const sellerIds =
            getSellerIds(
                currentOrder
            );


        for(
            const sellerId
            of sellerIds
        ){

            await createOrderNotification(
                "order_status",
                `Order ${formatStatus(selectedStatus)}`,
                `Order ${currentOrderId} is now ${formatStatus(selectedStatus)}.`,
                sellerId
            );

        }


        await refreshOrder();


        showMessage(
            "statusMessage",
            "Order status updated successfully.",
            true
        );

    }
    catch(error){

        console.error(
            "STATUS ERROR:",
            error
        );


        showMessage(
            "statusMessage",
            "Unable to update order status."
        );

    }

}



/* ==========================================================
   CREATE NOTIFICATION
========================================================== */

async function createOrderNotification(
    type,
    title,
    message,
    userId
){

    if(!userId){

        return;

    }


    try{

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {

                userId:
                    userId,

                orderId:
                    currentOrderId,

                type:
                    type,

                title:
                    title,

                message:
                    message,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            }
        );

    }
    catch(error){

        console.error(
            "NOTIFICATION ERROR:",
            error
        );

    }

}



/* ==========================================================
   REFRESH
========================================================== */

async function refreshOrder(){

    const orderRef =
        doc(
            db,
            "orders",
            currentOrderId
        );


    const snapshot =
        await getDoc(
            orderRef
        );


    if(
        snapshot.exists()
    ){

        currentOrder = {

            id:
                snapshot.id,

            ...snapshot.data()

        };


        populateOrder();

    }

}



/* ==========================================================
   MESSAGE
========================================================== */

function showMessage(
    elementId,
    message,
    success = false
){

    const element =
        document.getElementById(
            elementId
        );


    if(!element){

        return;

    }


    element.textContent =
        message;


    element.classList.toggle(
        "success",
        success
    );

}




/* ==========================================================
   BACK
========================================================== */

document
    .getElementById(
        "backButton"
    )
    .addEventListener(
        "click",
        function(){

            window.location.href =
                "admin.html";

        }
    );
    

