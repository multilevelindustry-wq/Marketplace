/* ==========================================================
   YOURSTORE ADMIN CENTER
   ADMIN.JS — PART 1
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
    updateDoc,
    setDoc,
    orderBy,
    getDocs,
    doc,
    getDoc,
    serverTimestamp,
    where
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



/* ==========================================================
   GLOBAL ADMIN STATE
========================================================== */

let currentAdmin = null;

let allAdminOrders = [];

let visibleAdminOrders = [];

let adminSearchTerm = "";

let adminIsLoading = false;



/* ==========================================================
   DOM ELEMENTS
========================================================== */

const adminPageLoader =
    document.getElementById(
        "adminPageLoader"
    );


const adminApp =
    document.getElementById(
        "adminApp"
    );


const adminSearchForm =
    document.getElementById(
        "adminSearchForm"
    );


const adminSearch =
    document.getElementById(
        "adminSearch"
    );


const adminOrdersList =
    document.getElementById(
        "adminOrdersList"
    );


const adminFundsList =
    document.getElementById(
        "adminFundsList"
    );


const adminTrackingList =
    document.getElementById(
        "adminTrackingList"
    );


const adminMessage =
    document.getElementById(
        "adminMessage"
    );


const adminNotificationCount =
    document.getElementById(
        "adminNotificationCount"
    );


const adminName =
    document.getElementById(
        "adminName"
    );


const adminPhoto =
    document.getElementById(
        "adminPhoto"
    );



/* ==========================================================
   PAGE INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeAdminPage();

    }
);



/* ==========================================================
   ADMIN AUTHENTICATION
========================================================== */

function initializeAdminPage(){

    onAuthStateChanged(
        auth,
        async function(user){

            if(!user){

                window.location.href =
                    "admin-login.html";

                return;

            }


            currentAdmin =
                user;


            try{

                await verifyAdminAccess(
                    user
                );


                await loadAdminOrders();


                updateAdminStatistics();


                renderAdminOrders();


                renderAdminFunds();


                renderAdminTracking();


                hideAdminPageLoader();
                


            }catch(error){

                console.error(
                    "ADMIN INITIALIZATION ERROR:",
                    error
                );


                showAdminMessage(
                    "Unable to load the admin dashboard."
                );


                hideAdminPageLoader();

            }

        }
    );

}



/* ==========================================================
   ADMIN USERS
========================================================== */


let allUsers = [];


/* ==========================================================
   ELEMENTS
========================================================== */

const usersList =
    document.getElementById(
        "adminUsersList"
    );

const usersLoading =
    document.getElementById(
        "usersLoading"
    );

const usersEmpty =
    document.getElementById(
        "usersEmpty"
    );

const totalUsers =
    document.getElementById(
        "totalUsers"
    );

const totalBuyers =
    document.getElementById(
        "totalBuyers"
    );

const totalSellers =
    document.getElementById(
        "totalSellers"
    );

const userSearch =
    document.getElementById(
        "userSearch"
    );

const userRoleFilter =
    document.getElementById(
        "userRoleFilter"
    );

const refreshUsers =
    document.getElementById(
        "refreshUsers"
    );


/* ==========================================================
   LOAD ALL USERS
========================================================== */

async function loadAllUsers() {

    try {

        showUsersLoading();


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        allUsers = [];


        snapshot.forEach(
            function(documentSnapshot) {

                const data =
                    documentSnapshot.data();


                allUsers.push({

                    id:
                        documentSnapshot.id,

                    ...data

                });

            }
        );


        console.log(
            "All users:",
            allUsers
        );


        updateUserStatistics();

        renderUsers(
            allUsers
        );


    }
    catch(error) {

        console.error(
            "ADMIN USERS ERROR:",
            error
        );


        if(usersLoading){

            usersLoading.textContent =
                "Unable to load users.";

        }

    }
    finally {

        if(usersLoading){

            usersLoading.style.display =
                "none";

        }

    }

}


/* ==========================================================
   UPDATE STATISTICS
========================================================== */

function updateUserStatistics() {

    const buyers =
        allUsers.filter(
            user =>
                String(
                    user.role || ""
                ).toLowerCase() ===
                "buyer"
        );


    const sellers =
        allUsers.filter(
            user =>
                String(
                    user.role || ""
                ).toLowerCase() ===
                "seller"
        );


    if(totalUsers){

        totalUsers.textContent =
            allUsers.length;

    }


    if(totalBuyers){

        totalBuyers.textContent =
            buyers.length;

    }


    if(totalSellers){

        totalSellers.textContent =
            sellers.length;

    }

}


/* ==========================================================
   RENDER USERS
========================================================== */

function renderUsers(
    users
) {

    if(!usersList){

        return;

    }


    usersList.innerHTML = "";


    if(!users.length){

        if(usersEmpty){

            usersEmpty.style.display =
                "block";

        }

        return;

    }


    if(usersEmpty){

        usersEmpty.style.display =
            "none";

    }


    users.forEach(
        function(user) {

            usersList.appendChild(
                createUserCard(
                    user
                )
            );

        }
    );

}


/* ==========================================================
   CREATE USER CARD
========================================================== */

function createUserCard(
    user
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "admin-user-card";


    const role =
        String(
            user.role ||
            "user"
        ).toLowerCase();


    const name =
        user.name ||
        user.displayName ||
        user.fullName ||
        "Unnamed User";


    const email =
        user.email ||
        "";


    const phone =
        user.phone ||
        user.phoneNumber ||
        "";


    const photo =
        user.photoURL ||
        user.photo ||
        "";


    const state =
        user.state ||
        user.deliveryState ||
        user.pickupState ||
        "";


    const city =
        user.city ||
        user.deliveryCity ||
        user.pickupCity ||
        "";


    const area =
        user.area ||
        user.deliveryArea ||
        user.pickupArea ||
        "";


    const created =
        formatUserDate(
            user.createdAt
        );


    const image =
        photo
            ? `
                <img
                    src="${escapeHTML(photo)}"
                    alt="${escapeHTML(name)}"
                >
              `
            : `
                <div class="user-avatar-placeholder">
                    ${escapeHTML(
                        name.charAt(0).toUpperCase()
                    )}
                </div>
              `;


    card.innerHTML = `

              <div class="admin-user-main">

            <div class="admin-user-avatar">

                ${image}

            </div>


            <div class="admin-user-info">

                <div class="admin-user-name-row">

                    <h3>
                        ${escapeHTML(name)}
                    </h3>

                    <span
                        class="user-role ${role}"
                    >
                        ${escapeHTML(
                            capitalize(role)
                        )}
                    </span>

                </div>


                <div class="admin-user-details">

                    ${
                        email
                            ? `
                                <span>
                                    ✉ ${escapeHTML(email)}
                                </span>
                              `
                            : ""
                    }


                    ${
                        phone
                            ? `
                                <span>
                                    ☎ ${escapeHTML(phone)}
                                </span>
                              `
                            : ""
                    }


                    ${
                        state
                            ? `
                                <span>
                                    📍 ${escapeHTML(
                                        [city, area, state]
                                            .filter(Boolean)
                                            .join(", ")
                                    )}
                                </span>
                              `
                            : ""
                    }


                    ${
                        created
                            ? `
                                <span>
                                    Joined:
                                    ${escapeHTML(created)}
                                </span>
                              `
                            : ""
                    }

                </div>


                <!-- ==================================================
                     SELLER BANK DETAILS
                =================================================== -->

                ${
                    role === "seller" &&
                    user.bankDetails
                        ? `

                            <div class="admin-user-bank-details">

                                <div class="admin-user-bank-title">
                                    🏦 Bank Account
                                </div>


                                ${
                                    user.bankDetails.bankName
                                        ? `
                                            <div class="admin-user-info-row">

                                                <span class="admin-user-info-label">
                                                    Bank
                                                </span>

                                                <span class="admin-user-info-value">
                                                    ${escapeHTML(
                                                        user.bankDetails.bankName
                                                    )}
                                                </span>

                                            </div>
                                          `
                                        : ""
                                }


                                ${
                                    user.bankDetails.accountName
                                        ? `
                                            <div class="admin-user-info-row">

                                                <span class="admin-user-info-label">
                                                    Account Name
                                                </span>

                                                <span class="admin-user-info-value">
                                                    ${escapeHTML(
                                                        user.bankDetails.accountName
                                                    )}
                                                </span>

                                            </div>
                                          `
                                        : ""
                                }


                                ${
                                    user.bankDetails.accountNumber
                                        ? `
                                            <div class="admin-user-info-row">

                                                <span class="admin-user-info-label">
                                                    Account Number
                                                </span>

                                                <span class="admin-user-info-value">
                                                    ${escapeHTML(
                                                        user.bankDetails.accountNumber
                                                    )}
                                                </span>

                                            </div>
                                          `
                                        : ""
                                }

                            </div>

                          `
                        : ""
                }

            </div>

        </div>


        <div class="admin-user-actions">

            <button
                type="button"
                class="view-user-button"
                data-user-id="${escapeHTML(user.id)}"
            >
                View Details
            </button>

        </div>

    `;


    const viewButton =
        card.querySelector(
            ".view-user-button"
        );


    if(viewButton){

        viewButton.addEventListener(
            "click",
            function() {

                showUserDetails(
                    user
                );

            }
        );

    }


    return card;

}


/* ==========================================================
   SEARCH USERS
========================================================== */

function filterUsers() {

    const search =
        String(
            userSearch?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const role =
        String(
            userRoleFilter?.value ||
            "all"
        )
        .toLowerCase();


    const filtered =
        allUsers.filter(
            function(user) {

                const userRole =
                    String(
                        user.role ||
                        ""
                    ).toLowerCase();


                if(
                    role !== "all" &&
                    userRole !== role
                ){

                    return false;

                }


                if(!search){

                    return true;

                }


                const searchable = [

                    user.name,

                    user.fullName,

                    user.displayName,

                    user.email,

                    user.phone,

                    user.phoneNumber,

                    user.state,

                    user.city,

                    user.area,

                    user.id

                ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


                return searchable.includes(
                    search
                );

            }
        );


    renderUsers(
        filtered
    );

}


/* ==========================================================
   USER DETAILS
========================================================== */

function showUserDetails(
    user
) {

    const details = [

        ["User ID", user.id],

        ["Role", user.role],

        ["Name",
            user.name ||
            user.fullName ||
            user.displayName
        ],

        ["Email", user.email],

        ["Phone",
            user.phone ||
            user.phoneNumber
        ],

        ["State",
            user.state ||
            user.deliveryState ||
            user.pickupState
        ],

        ["City",
            user.city ||
            user.deliveryCity ||
            user.pickupCity
        ],

        ["Area",
            user.area ||
            user.deliveryArea ||
            user.pickupArea
        ],

        ["Address",
            user.address ||
            user.deliveryAddress ||
            user.pickupAddress
        ]

    ];


    const text =
        details
            .filter(
                ([key, value]) =>
                    value !== undefined &&
                    value !== null &&
                    value !== ""
            )
            .map(
                ([key, value]) =>
                    `${key}: ${value}`
            )
            .join("\n");


    alert(
        text || "No user information available."
    );

}


/* ==========================================================
   LOADING
========================================================== */

function showUsersLoading() {

    if(usersLoading){

        usersLoading.style.display =
            "block";

        usersLoading.textContent =
            "Loading users...";

    }

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatUserDate(
    value
) {

    if(!value){

        return "";

    }


    try {

        let date;


        if(
            typeof value.toDate ===
            "function"
        ){

            date =
                value.toDate();

        }

        else if(
            value.seconds
        ){

            date =
                new Date(
                    value.seconds * 1000
                );

        }

        else {

            date =
                new Date(value);

        }


        if(
            Number.isNaN(
                date.getTime()
            )
        ){

            return "";

        }


        return date.toLocaleDateString(
            "en-NG",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    }
    catch(error){

        return "";

    }

}


/* ==========================================================
   CAPITALIZE
========================================================== */

function capitalize(
    value
) {

    return String(value)
        .charAt(0)
        .toUpperCase() +
        String(value)
            .slice(1);

}


function escapeHTML(value) {

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
   EVENTS
========================================================== */

if(userSearch){

    userSearch.addEventListener(
        "input",
        filterUsers
    );

}


if(userRoleFilter){

    userRoleFilter.addEventListener(
        "change",
        filterUsers
    );

}


if(refreshUsers){

    refreshUsers.addEventListener(
        "click",
        loadAllUsers
    );

}


/* ==========================================================
   START
========================================================== */

loadAllUsers();



/* ==========================================================
   VERIFY ADMIN ACCESS
========================================================== */

async function verifyAdminAccess(user){

    const userReference =
        doc(
            db,
            "users",
            user.uid
        );


    const userSnapshot =
        await getDoc(
            userReference
        );


    if(
        !userSnapshot.exists()
    ){

        console.error(
            "Admin user record not found."
        );


        window.location.href =
            "index.html";

        throw new Error(
            "Admin profile not found."
        );

    }


    const userData =
        userSnapshot.data();


    const role =
        String(
            userData.role ||
            userData.accountType ||
            userData.userType ||
            ""
        ).toLowerCase();


    const isAdmin =
        role === "admin" ||
        role === "administrator";


    if(!isAdmin){

        console.error(
            "Unauthorized admin access."
        );


        window.location.href =
            "index.html";

        throw new Error(
            "Unauthorized admin access."
        );

    }


    updateAdminProfile(
        userData,
        user
    );

}



/* ==========================================================
   UPDATE ADMIN PROFILE
========================================================== */

function updateAdminProfile(
    userData,
    user
){

    const name =
        userData.name ||
        userData.fullName ||
        userData.displayName ||
        user.displayName ||
        "Administrator";


    const photo =
        userData.photoURL ||
        userData.profilePhoto ||
        userData.photo ||
        user.photoURL ||
        "default-avatar.png";


    if(adminName){

        adminName.textContent =
            name;

    }


    if(adminPhoto){

        adminPhoto.src =
            photo;

    }

}



/* ==========================================================
   LOAD ALL ORDERS
========================================================== */

async function loadAdminOrders(){

    if(adminIsLoading){

        return;

    }


    adminIsLoading =
        true;


    try{

        const ordersReference =
            collection(
                db,
                "orders"
            );


        let ordersSnapshot;


        try{

            const ordersQuery =
                query(
                    ordersReference,
                    orderBy(
                        "createdAt",
                        "desc"
                    )
                );


            ordersSnapshot =
                await getDocs(
                    ordersQuery
                );


        }catch(orderQueryError){

            console.warn(
                "Ordered order query failed. Loading without ordering.",
                orderQueryError
            );


            ordersSnapshot =
                await getDocs(
                    ordersReference
                );

        }


        allAdminOrders = [];


        ordersSnapshot.forEach(
            function(orderDocument){

                const orderData =
                    orderDocument.data();


                allAdminOrders.push({

                    id:
                        orderDocument.id,

                    ...orderData

                });

            }
        );


        sortAdminOrders();


        visibleAdminOrders =
            [...allAdminOrders];


        updateAdminNotificationCount();


    }finally{

        adminIsLoading =
            false;

    }

}



/* ==========================================================
   SORT ADMIN ORDERS
========================================================== */

function sortAdminOrders(){

    allAdminOrders.sort(
        function(a,b){

            const dateA =
                getOrderTimestamp(
                    a.createdAt
                );


            const dateB =
                getOrderTimestamp(
                    b.createdAt
                );


            return dateB - dateA;

        }
    );

}



/* ==========================================================
   CONVERT FIREBASE TIMESTAMP
========================================================== */

function getOrderTimestamp(
    timestamp
){

    if(!timestamp){

        return 0;

    }


    if(
        typeof timestamp.toMillis ===
        "function"
    ){

        return timestamp.toMillis();

    }


    if(
        timestamp.seconds !==
        undefined
    ){

        return (
            Number(timestamp.seconds) *
            1000
        );

    }


    if(
        timestamp instanceof Date
    ){

        return timestamp.getTime();

    }


    const parsed =
        new Date(
            timestamp
        ).getTime();


    return Number.isNaN(parsed)
        ? 0
        : parsed;

}



/* ==========================================================
   NORMALIZE ORDER STATUS
========================================================== */

function getNormalizedOrderStatus(
    order
){

    const status =
        String(
            order.status ||
            order.orderStatus ||
            "pending"
        )
        .trim()
        .toLowerCase();


    return status;

}



/* ==========================================================
   NORMALIZE PAYMENT STATUS
========================================================== */

function getNormalizedPaymentStatus(
    order
){

    return String(
        order.paymentStatus ||
        order.payment_status ||
        ""
    )
    .trim()
    .toLowerCase();

}



/* ==========================================================
   UPDATE ADMIN STATISTICS
========================================================== */

function updateAdminStatistics(){

    const totalOrders =
        allAdminOrders.length;


    let paidOrders = 0;

    let awaitingPickup = 0;

    let inTransit = 0;

    let outForDelivery = 0;

    let deliveredOrders = 0;

    let completedOrders = 0;

    let fundsAwaiting = 0;


    allAdminOrders.forEach(
        function(order){

            const status =
                getNormalizedOrderStatus(
                    order
                );


            const paymentStatus =
                getNormalizedPaymentStatus(
                    order
                );


            if(
                paymentStatus ===
                    "paid" ||

                paymentStatus ===
                    "success" ||

                paymentStatus ===
                    "successful" ||

                order.paymentVerified === true
            ){

                paidOrders++;

            }


            if(
                status === "pending" ||
                status === "processing" ||
                status === "paid" ||
                status === "confirmed" ||
                status === "ready_for_pickup" ||
                status === "awaiting_pickup"
            ){

                awaitingPickup++;

            }


            if(
                status === "shipped" ||
                status === "picked_up" ||
                status === "in_transit"
            ){

                inTransit++;

            }


            if(
                status === "out_for_delivery"
            ){

                outForDelivery++;

            }


            if(
                status === "delivered"
            ){

                deliveredOrders++;

            }


            if(
                status === "completed"
            ){

                completedOrders++;

            }


            const fundsReleased =
                order.fundsReleased === true ||
                order.payoutReleased === true;


            if(
                status === "delivered" &&
                !fundsReleased
            ){

                fundsAwaiting +=
                    getSellerPayableAmount(
                        order
                    );

            }

        }
    );


    setElementText(
        "adminTotalOrders",
        totalOrders
    );


    setElementText(
        "adminPaidOrders",
        paidOrders
    );


    setElementText(
        "adminAwaitingPickup",
        awaitingPickup
    );


    setElementText(
        "adminInTransit",
        inTransit
    );


    setElementText(
        "adminOutForDelivery",
        outForDelivery
    );


    setElementText(
        "adminDeliveredOrders",
        deliveredOrders
    );


    setElementText(
        "adminCompletedOrders",
        completedOrders
    );


    setElementText(
        "adminFundsAwaiting",
        formatCurrency(
            fundsAwaiting
        )
    );

}



/* ==========================================================
   CALCULATE SELLER PAYABLE AMOUNT
========================================================== */

function getSellerPayableAmount(
    order
){

    if(
        typeof order.sellerPayout ===
        "number"
    ){

        return order.sellerPayout;

    }


    if(
        typeof order.sellerAmount ===
        "number"
    ){

        return order.sellerAmount;

    }


    if(
        typeof order.sellerTotal ===
        "number"
    ){

        return order.sellerTotal;

    }


    /*
       Multi-seller orders will be handled
       more precisely in the seller payout
       section in the next parts.
    */

    const total =
        Number(
            order.subtotal ||
            order.total ||
            0
        );


    const commission =
        Number(
            order.platformFee ||
            order.commission ||
            0
        );


    return Math.max(
        0,
        total - commission
    );

}



/* ==========================================================
   RENDER ADMIN ORDERS
========================================================== */

function renderAdminOrders(){

    if(!adminOrdersList){

        return;

    }


    if(
        !visibleAdminOrders.length
    ){

        adminOrdersList.innerHTML = `

            <div class="admin-content-loading">

                <p>
                    No orders found.
                </p>

            </div>

        `;

        return;

    }


    adminOrdersList.innerHTML =
        visibleAdminOrders
        .slice(0,20)
        .map(
            createAdminOrderCard
        )
        .join("");

}



/* ==========================================================
   CREATE ADMIN ORDER CARD
========================================================== */

function createAdminOrderCard(
    order
){

    const status =
        getNormalizedOrderStatus(
            order
        );


    const paymentStatus =
        getNormalizedPaymentStatus(
            order
        );


    const orderNumber =
        escapeHTML(
            order.orderNumber ||
            order.orderId ||
            order.id
        );


    const buyerName =
        escapeHTML(
            order.buyerName ||
            order.customerName ||
            "Buyer"
        );


    const total =
        Number(
            order.total ||
            order.amount ||
            0
        );


    const date =
        formatOrderDate(
            order.createdAt
        );


    const trackingNumber =
        escapeHTML(
            order.trackingNumber ||
            order.trackingId ||
            "Not assigned"
        );


    return `

        <article
            class="admin-order-card"
            data-order-id="${escapeHTML(order.id)}"
        >

            <div class="admin-order-card-main">

                <div>

                    <span>
                        ORDER
                    </span>

                    <strong>
                        ${orderNumber}
                    </strong>

                </div>


                <div>

                    <span>
                        BUYER
                    </span>

                    <strong>
                        ${buyerName}
                    </strong>

                </div>


                <div>

                    <span>
                        AMOUNT
                    </span>

                    <strong>
                        ${formatCurrency(total)}
                    </strong>

                </div>


                <div>

                    <span>
                        STATUS
                    </span>

                    <strong
                        class="admin-order-status ${getStatusClass(status)}"
                    >
                        ${formatStatus(status)}
                    </strong>

                </div>

            </div>


            <div class="admin-order-card-bottom">

                <span>
                    ${date}
                </span>


                <span>
                    Tracking:
                    <strong>
                        ${trackingNumber}
                    </strong>
                </span>


                <span>
                    Payment:
                    <strong>
                        ${formatPaymentStatus(paymentStatus)}
                    </strong>
                </span>


                <button
    type="button"
    class="admin-view-order-button"
    onclick="openAdminOrder('${order.id}')"
>
    View Order
</button>

            </div>

        </article>

    `;

}



/* ==========================================================
   RENDER SELLER FUNDS
========================================================== */

/* ==========================================================
   RENDER FUNDS AWAITING RELEASE
========================================================== */

function renderAdminFunds(){

    if(!adminFundsList){

        return;

    }


    const eligibleOrders =
        allAdminOrders.filter(
            function(order){

                return (

                    getNormalizedOrderStatus(
                        order
                    ) === "delivered"

                    &&

                    order.fundsReleased !== true

                    &&

                    order.payoutReleased !== true

                );

            }
        );


    if(
        !eligibleOrders.length
    ){

        adminFundsList.innerHTML = `

            <div class="admin-content-loading">

                <p>
                    No seller funds are currently awaiting release.
                </p>

            </div>

        `;

        return;

    }


    adminFundsList.innerHTML =

        eligibleOrders
        .slice(0,20)
        .map(
            function(order){

                const sellerName =
                    order.sellerName ||
                    order.seller?.name ||
                    "Seller";


                const sellerId =
                    order.sellerId ||
                    order.sellerUID ||
                    order.sellerUid ||
                    order.seller?.id ||
                    "Not available";


                const orderId =
                    order.id ||
                    order.orderId ||
                    "Unknown";


                const orderNumber =
                    order.orderNumber ||
                    orderId;


                const sellerAmount =
                    getSellerPayableAmount(
                        order
                    );


                return `

                    <div
                        class="admin-fund-item"
                        data-order-id="${escapeHTML(
                            orderId
                        )}"
                    >


                        <!-- =================================
                             SELLER INFORMATION
                        ================================== -->

                        <div class="admin-fund-seller">

                            <span class="admin-fund-label">
                                SELLER
                            </span>


                            <strong class="admin-fund-seller-name">

                                ${escapeHTML(
                                    sellerName
                                )}

                            </strong>


                            <span class="admin-fund-seller-id">

                                Seller ID:
                                ${escapeHTML(
                                    sellerId
                                )}

                            </span>

                        </div>



                        <!-- =================================
                             ORDER INFORMATION
                        ================================== -->

                        <div class="admin-fund-order">

                            <span class="admin-fund-label">
                                ORDER
                            </span>


                            <strong>

                                ${escapeHTML(
                                    orderNumber
                                )}

                            </strong>


                            <span>

                                Order ID:
                                ${escapeHTML(
                                    orderId
                                )}

                            </span>

                        </div>



                        <!-- =================================
                             SELLER PAYABLE
                        ================================== -->

                        <div class="admin-fund-amount">

                            <span class="admin-fund-label">
                                SELLER AMOUNT
                            </span>


                            <strong>

                                ${formatCurrency(
                                    sellerAmount
                                )}

                            </strong>

                        </div>



                        <!-- =================================
                             RELEASE BUTTON
                        ================================== -->

                        <button
                            type="button"
                            class="admin-release-funds-button"
                            data-order-id="${escapeHTML(
                                orderId
                            )}"
                            data-seller-id="${escapeHTML(
                                sellerId
                            )}"
                            data-amount="${sellerAmount}"
                        >

                            Release Funds

                        </button>


                    </div>

                `;

            }
        )
        .join("");

}



/* ==========================================================
   RENDER ACTIVE TRACKING
========================================================== */

function renderAdminTracking(){

    if(!adminTrackingList){

        return;

    }


    const activeDeliveries =
        allAdminOrders.filter(
            function(order){

                const status =
                    getNormalizedOrderStatus(
                        order
                    );


                return [
                    "awaiting_pickup",
                    "ready_for_pickup",
                    "picked_up",
                    "shipped",
                    "in_transit",
                    "out_for_delivery"
                ].includes(
                    status
                );

            }
        );

     if(
        !activeDeliveries.length
    ){

        adminTrackingList.innerHTML = `

            <div class="admin-content-loading">

                <p>
                    No active deliveries.
                </p>

            </div>

        `;

        return;

    }


    adminTrackingList.innerHTML =
        activeDeliveries
        .slice(0,20)
        .map(
            function(order){

                return `

                    <div
                        class="admin-tracking-item"
                        data-order-id="${escapeHTML(order.id)}"
                    >

                        <div>

                            <strong>
                                ${escapeHTML(
                                    order.orderNumber ||
                                    order.id
                                )}
                            </strong>

                            <span>
                                ${formatStatus(
                                    getNormalizedOrderStatus(
                                        order
                                    )
                                )}
                            </span>

                        </div>


                        <div>

                            <span>
                                Tracking
                            </span>

                            <strong>
                                ${escapeHTML(
                                    order.trackingNumber ||
                                    order.trackingId ||
                                    "Not assigned"
                                )}
                            </strong>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}



/* ==========================================================
   SEARCH ADMIN ORDERS
========================================================== */

function applyAdminSearch(){

    const term =
        adminSearchTerm
        .trim()
        .toLowerCase();


    if(!term){

        visibleAdminOrders =
            [...allAdminOrders];

        return;

    }


    visibleAdminOrders =
        allAdminOrders.filter(
            function(order){

                const searchableText = [

                    order.orderNumber,

                    order.id,

                    order.buyerName,

                    order.buyerEmail,

                    order.customerName,

                    order.customerEmail,

                    order.sellerName,

                    order.sellerEmail,

                    order.trackingNumber,

                    order.trackingId

                ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


                return searchableText.includes(
                    term
                );

            }
        );

}



/* ==========================================================
   SEARCH EVENTS
========================================================== */

if(adminSearchForm){

    adminSearchForm.addEventListener(
        "submit",
        function(event){

            event.preventDefault();


            adminSearchTerm =
                adminSearch
                    ? adminSearch.value
                    : "";


            applyAdminSearch();


            renderAdminOrders();


            showAdminMessage(
                visibleAdminOrders.length +
                " matching order(s) found."
            );

        }
    );

}



/* ==========================================================
   REFRESH ADMIN DATA
========================================================== */

const refreshAdminButton =
    document.getElementById(
        "refreshAdminButton"
    );


if(refreshAdminButton){

    refreshAdminButton.addEventListener(
        "click",
        async function(){

            if(!currentAdmin){

                return;

            }


            try{

                refreshAdminButton.disabled =
                    true;


                refreshAdminButton.textContent =
                    "Refreshing...";


                await loadAdminOrders();


                applyAdminSearch();


                updateAdminStatistics();


                renderAdminOrders();


                renderAdminFunds();


                renderAdminTracking();


                showAdminMessage(
                    "Admin data refreshed."
                );


            }catch(error){

                console.error(
                    "ADMIN REFRESH ERROR:",
                    error
                );


                showAdminMessage(
                    "Unable to refresh admin data."
                );


            }finally{

                refreshAdminButton.disabled =
                    false;


                refreshAdminButton.textContent =
                    "↻ Refresh";

            }

        }
    );

}



/* ==========================================================
   UPDATE ADMIN NOTIFICATION COUNT
========================================================== */

function updateAdminNotificationCount(){

    if(!adminNotificationCount){

        return;

    }


    const pendingNotifications =
        allAdminOrders.filter(
            function(order){

                const status =
                    getNormalizedOrderStatus(
                        order
                    );


                return (
                    status === "pending" ||
                    status === "paid" ||
                    status === "processing"
                );

            }
        ).length;


    adminNotificationCount.textContent =
        pendingNotifications > 99
            ? "99+"
            : String(
                pendingNotifications
            );

}



/* ==========================================================
   HIDE PAGE LOADER
========================================================== */

function hideAdminPageLoader(){

    if(adminPageLoader){

        adminPageLoader.classList.add(
            "hidden"
        );

    }


    if(adminApp){

        adminApp.classList.add(
            "ready"
        );

    }

}



/* ==========================================================
   ADMIN MESSAGE
========================================================== */

let adminMessageTimer = null;


function showAdminMessage(
    message
){

    if(!adminMessage){

        return;

    }


    adminMessage.textContent =
        message;


    adminMessage.classList.add(
        "show"
    );


    clearTimeout(
        adminMessageTimer
    );


    adminMessageTimer =
        setTimeout(
            function(){

                adminMessage.classList.remove(
                    "show"
                );

            },
            3500
        );

}



/* ==========================================================
   SET ELEMENT TEXT
========================================================== */

function setElementText(
    id,
    value
){

    const element =
        document.getElementById(
            id
        );


    if(element){

        element.textContent =
            value;

    }

}



/* ==========================================================
   FORMAT CURRENCY
========================================================== */

function formatCurrency(
    amount
){

    const numericAmount =
        Number(
            amount || 0
        );


    return new Intl.NumberFormat(
        "en-NG",
        {
            style:"currency",
            currency:"NGN",
            minimumFractionDigits:2
        }
    ).format(
        numericAmount
    );

}



/* ==========================================================
   FORMAT ORDER DATE
========================================================== */

function formatOrderDate(
    timestamp
){

    const milliseconds =
        getOrderTimestamp(
            timestamp
        );


    if(!milliseconds){

        return "Date unavailable";

    }


    return new Intl.DateTimeFormat(
        "en-NG",
        {
            dateStyle:"medium",
            timeStyle:"short"
        }
    ).format(
        new Date(
            milliseconds
        )
    );

}



/* ==========================================================
   FORMAT STATUS
========================================================== */

function formatStatus(
    status
){

    const normalized =
        String(
            status || "pending"
        )
        .replace(
            /_/g,
            " "
        );


    return normalized
        .replace(
            /\b\w/g,
            function(letter){

                return letter.toUpperCase();

            }
        );

}



/* ==========================================================
   STATUS CSS CLASS
========================================================== */

function getStatusClass(
    status
){

    return (
        "status-" +
        String(
            status || "pending"
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
    );

}



/* ==========================================================
   FORMAT PAYMENT STATUS
========================================================== */

function formatPaymentStatus(
    status
){

    if(!status){

        return "Unknown";

    }


    return status
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
   EXPORT ADMIN STATE FOR LATER PARTS
========================================================== */

export {

    currentAdmin,

    allAdminOrders,

    visibleAdminOrders,

    getNormalizedOrderStatus,

    getNormalizedPaymentStatus,

    getSellerPayableAmount,

    formatCurrency,

    escapeHTML,

    showAdminMessage

};


   function openAdminOrder(orderId){

    if(!orderId){
        console.error("Missing order ID.");
        return;
    }

    window.location.href =
        `view-order.html?orderId=${encodeURIComponent(orderId)}`;

}


window.openAdminOrder =
    openAdminOrder;
    
    
    /* ==========================================================
   RELEASE SELLER FUNDS
   SIMULATION ONLY
========================================================== */

/* ==========================================================
   ADMIN RELEASE SELLER FUNDS
   SIMULATED / ACCOUNTING ONLY
========================================================== */

async function releaseSellerFunds(
    orderId,
    sellerId,
    sellerAmount
){

    if(
        !orderId ||
        !sellerId
    ){

        return;

    }


    const amount =
        Number(
            sellerAmount || 0
        );


    if(amount <= 0){

        alert(
            "Invalid seller amount."
        );

        return;

    }


    try {

        /*
           SELLER USER DOCUMENT
        */

        const sellerReference =
            doc(
                db,
                "users",
                sellerId
            );


        const sellerSnapshot =
            await getDoc(
                sellerReference
            );


        if(
            !sellerSnapshot.exists()
        ){

            throw new Error(
                "Seller account was not found."
            );

        }


        const sellerData =
            sellerSnapshot.data();


        /*
           EXISTING VIRTUAL BALANCE
        */

        const oldBalance =
            Number(
                sellerData.balance ||
                sellerData.walletBalance ||
                sellerData.availableBalance ||
                0
            );


        const newBalance =
            oldBalance +
            amount;


        /*
           UPDATE SELLER ACCOUNT
        */

        await setDoc(

            sellerReference,

            {

                balance:
                    newBalance,

                walletBalance:
                    newBalance,

                availableBalance:
                    newBalance,

                updatedAt:
                    serverTimestamp()

            },

            {
                merge:
                    true
            }

        );


        /*
           UPDATE ORDER
        */

        await updateDoc(

            doc(
                db,
                "orders",
                orderId
            ),

            {

                fundsReleased:
                    true,

                payoutReleased:
                    true,

                payoutStatus:
                    "released",

                sellerPayout:
                    amount,

                completed:
                    true,

                completedAt:
                    serverTimestamp(),

                fundsReleasedAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }

        );


        /*
           CREATE SELLER PAYOUT HISTORY
        */

        await addDoc(

            collection(
                db,
                "sellerPayouts"
            ),

            {

                sellerId:
                    sellerId,

                orderId:
                    orderId,

                amount:
                    amount,

                type:
                    "simulated_release",

                status:
                    "released",

                releasedBy:
                    auth.currentUser?.uid ||
                    "admin",

                createdAt:
                    serverTimestamp()

            }

        );


        /*
           NOTIFY SELLER
        */

        await createSellerNotification({

            sellerId:
                sellerId,

            type:
                "payout",

            title:
                "Order funds released",

            message:
                `₦${amount.toLocaleString()} has been added to your seller account for order ${orderId}.`,

            link:
                "seller.html",

            icon:
                "💰"

        });


        console.log(
            "Seller funds released successfully."
        );


        alert(
            "Funds released to seller account."
        );


    }
    catch(error){

        console.error(
            "RELEASE FUNDS ERROR:",
            error
        );


        alert(
            "Unable to release seller funds."
        );

    }

}




function renderSellerPayouts(payouts){

    const container =
        document.getElementById(
            "sellerPayoutsList"
        );


    if(!container){

        console.error(
            "sellerPayoutsList not found."
        );

        return;

    }


    if(!payouts || payouts.length === 0){

        container.innerHTML = `

            <div class="seller-payout-empty">

                No seller funds are currently
                awaiting release.

            </div>

        `;

        return;

    }


    let html = "";


    payouts.forEach(
        function(payout){

            const sellerName =
                payout.sellerName ||
                "Seller";


            const sellerId =
                payout.sellerId ||
                payout.sellerUID ||
                payout.sellerUid ||
                "";


            const orderId =
                payout.orderId ||
                payout.id ||
                "";


            const sellerAmount =
                Number(
                    payout.sellerAmount ||
                    payout.sellerTotal ||
                    payout.amount ||
                    0
                );


            html += `

                <div class="seller-payout-card">

                    <div class="seller-payout-header">

                        <span
                            class="seller-payout-label"
                        >
                            SELLER
                        </span>


                        <strong>
                            ${sellerName}
                        </strong>

                    </div>


                    <div
                        class="seller-payout-details"
                    >

                        <div>

                            <span>
                                Seller ID
                            </span>

                            <strong>
                                ${sellerId}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Order ID
                            </span>

                            <strong>
                                ${orderId}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Seller Amount
                            </span>

                            <strong>
                                ₦${sellerAmount.toLocaleString()}
                            </strong>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="release-funds-button"
                        onclick="
                            releaseSellerFunds(
                                '${orderId}',
                                '${sellerId}',
                                ${sellerAmount}
                            )
                        "
                    >
                        Release Funds
                    </button>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}

