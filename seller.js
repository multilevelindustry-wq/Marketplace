import {
    auth,
    db,
    uploadToCloudinary
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



let currentUser = null;

/* ==========================================================
   SELLER REALTIME DASHBOARD
========================================================== */

let sellerOrdersUnsubscribe = null;


/* ==========================================================
   START SELLER DASHBOARD LISTENER
========================================================== */

function startSellerDashboardListener(){

    if(!currentUser){

        return;

    }


    /*
       Remove previous listener if one exists.
    */

    if(sellerOrdersUnsubscribe){

        sellerOrdersUnsubscribe();

        sellerOrdersUnsubscribe = null;

    }


    /*
       Listen to every order belonging to this seller.
    */

    const ordersReference =
        collection(
            db,
            "orders"
        );


    const sellerOrdersQuery =
        query(
            ordersReference,

            where(
                "sellerId",
                "==",
                currentUser.uid
            )
        );


    sellerOrdersUnsubscribe =
        onSnapshot(

            sellerOrdersQuery,

            function(snapshot){

                const sellerOrders =
                    snapshot.docs.map(
                        function(orderDocument){

                            return {

                                id:
                                    orderDocument.id,

                                ...orderDocument.data()

                            };

                        }
                    );


                /*
                   Update all seller dashboard
                   statistics immediately.
                */

                calculateSellerDashboardStats(
                    sellerOrders
                );


                /*
                   Update recent orders.
                */

                renderSellerRecentOrders(
                    sellerOrders
                );


                /*
                   Update order counters.
                */

                updateSellerOrderCounters(
                    sellerOrders
                );

            },

            function(error){

                console.error(
                    "Seller orders realtime error:",
                    error
                );

            }
        );

}


/* ==========================================================
   SELLER STORE PHOTO ELEMENTS
========================================================== */

const sellerProfileButton =
    document.getElementById(
        "sellerProfileButton"
    );

const sellerPhotoPanel =
    document.getElementById(
        "sellerPhotoPanel"
    );

const sellerStorePhotoInput =
    document.getElementById(
        "sellerStorePhotoInput"
    );

const addStorePhotoButton =
    document.getElementById(
        "addStorePhotoButton"
    );

const editStorePhotoButton =
    document.getElementById(
        "editStorePhotoButton"
    );

const sellerStorePhotoPreview =
    document.getElementById(
        "sellerStorePhotoPreview"
    );

const storePhotoUploadStatus =
    document.getElementById(
        "storePhotoUploadStatus"
    );

const headerSellerPhoto =
    document.getElementById(
        "headerSellerPhoto"
    );

const pageLoader =
    document.getElementById(
        "pageLoader"
    );

const sellerMain =
    document.getElementById(
        "sellerMain"
    );



/* ==========================================================
   FIREBASE AUTH STATE
========================================================== */

onAuthStateChanged(

    auth,

    async function(user){

        /* ==================================================
           USER NOT LOGGED IN
        ================================================== */

        if(!user){

            currentUser = null;


            window.location.href =
                "login.html";


            return;

        }


        /* ==================================================
           SAVE CURRENT USER
        ================================================== */

        currentUser = user;


startSellerNotificationCount(
            user
        );
        
        startSellerDashboardListener();
        
        
        /* ==================================================
           LOAD SELLER FIRESTORE DATA
        ================================================== */

        try {

            const sellerRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const sellerSnapshot =
                await getDoc(
                    sellerRef
                );


            let sellerData = {};



            /* ==================================================
               GET SELLER DATA
            ================================================== */

            if(
                sellerSnapshot.exists()
            ){

                sellerData =
                    sellerSnapshot.data();

            }



            /* ==================================================
               DISPLAY REGISTRATION DATA
            ================================================== */

            loadSellerData(
                sellerData,
                user
            );



            /* ==================================================
               LOAD STORE PHOTO
            ================================================== */

            await loadSellerStorePhoto();



            /* ==================================================
               OPEN SELLER PAGE
            ================================================== */

            showSellerPage();


        }

        catch(error){

            console.error(
                "Seller loading error:",
                error
            );


            /*
               Even if Firestore data cannot
               be loaded, do not leave the
               seller stuck on the loading screen.
            */

            loadSellerData(
                {},
                user
            );


            /*
               Try loading the store photo
               independently.
            */

            try {

                await loadSellerStorePhoto();

            }

            catch(photoError){

                console.error(
                    "Seller store photo loading error:",
                    photoError
                );

            }


            showSellerPage();

        }

    }

);



/* ==========================================================
   CALCULATE SELLER DASHBOARD STATISTICS
========================================================== */

function calculateSellerDashboardStats(
    orders
){

    if(!Array.isArray(orders)){

        orders = [];

    }


    let revenue =
        0;

    let orderCount =
        orders.length;

    let completedOrders =
        0;

    let pendingOrders =
        0;

    let cancelledOrders =
        0;

    let totalCompletedValue =
        0;

    let customerIds =
        new Set();


    orders.forEach(
        function(order){

            const status =
                getSellerOrderStatus(
                    order
                );


            const amount =
                getSellerOrderAmount(
                    order
                );


            /*
               CUSTOMER COUNT
            */

            const customerId =
                order.buyerId ||
                order.buyerUID ||
                order.buyerUid ||
                order.userId ||
                order.buyerEmail;


            if(customerId){

                customerIds.add(
                    customerId
                );

            }


            /*
               COMPLETED
            */

            if(
                status ===
                "completed" ||

                status ===
                "delivered"
            ){

                completedOrders++;


                totalCompletedValue +=
                    amount;

            }


            /*
               CANCELLED
            */

            else if(
                status ===
                "cancelled"
            ){

                cancelledOrders++;

            }


            /*
               PENDING / ACTIVE
            */

            else {

                pendingOrders++;

            }

        }
    );


    /*
       Revenue generated.

       Only released/completed seller
       sales are counted as generated
       seller revenue.
    */

    orders.forEach(
        function(order){

            const status =
                getSellerOrderStatus(
                    order
                );


            if(
                status === "completed" ||

                status === "delivered"
            ){

                revenue +=
                    getSellerOrderAmount(
                        order
                    );

            }

        }
    );


    /*
       AVERAGE ORDER VALUE
    */

    const averageOrderValue =
        completedOrders > 0

            ? totalCompletedValue /
              completedOrders

            : 0;


    /*
       PRODUCT VIEWS

       If your product documents already
       contain views, this can later be
       connected to those records.

       For now, use the order's recorded
       productViews where available.
    */

    let productViews =
        0;


    orders.forEach(
        function(order){

            productViews +=
                Number(
                    order.productViews ||
                    0
                );

        }
    );


    /*
       CONVERSION RATE
    */

    const conversionRate =
        productViews > 0

            ? (
                completedOrders /
                productViews
            ) * 100

            : 0;


    /*
       UPDATE SCREEN
    */

    setSellerDashboardValue(
        [
            "sellerRevenueGenerated",
            "revenueGenerated",
            "sellerRevenue"
        ],
        formatSellerCurrency(
            revenue
        )
    );


    setSellerDashboardValue(
        [
            "sellerOrdersReceived",
            "ordersReceived",
            "sellerOrderCount"
        ],
        orderCount
    );


    setSellerDashboardValue(
        [
            "sellerCompletedOrders",
            "completedOrders"
        ],
        completedOrders
    );


    setSellerDashboardValue(
        [
            "sellerPendingOrders",
            "pendingOrders"
        ],
        pendingOrders
    );


    setSellerDashboardValue(
        [
            "sellerCancelledOrders",
            "cancelledOrders"
        ],
        cancelledOrders
    );


    setSellerDashboardValue(
        [
            "sellerAverageOrderValue",
            "averageOrderValue"
        ],
        formatSellerCurrency(
            averageOrderValue
        )
    );


    setSellerDashboardValue(
        [
            "sellerProductViews",
            "productViews"
        ],
        productViews
    );


    setSellerDashboardValue(
        [
            "sellerConversionRate",
            "conversionRate"
        ],
        conversionRate.toFixed(1) + "%"
    );


    setSellerDashboardValue(
        [
            "sellerCustomers",
            "customerCount"
        ],
        customerIds.size
    );


    /*
       Monthly statistics.
    */

    calculateSellerMonthlyStats(
        orders
    );

}


/* ==========================================================
   SELLER ORDER STATUS
========================================================== */

function getSellerOrderStatus(
    order
){

    const status =
        String(
            order.status ||
            order.orderStatus ||
            order.deliveryStatus ||
            ""
        )
        .toLowerCase()
        .trim();


    if(
        order.fundsReleased === true &&
        !status
    ){

        return "completed";

    }


    if(
        status === "delivered" &&
        order.fundsReleased === true
    ){

        return "completed";

    }


    if(
        status === "completed"
    ){

        return "completed";

    }


    if(
        status === "cancelled" ||
        status === "canceled"
    ){

        return "cancelled";

    }


    return status || "pending";

}


/* ==========================================================
   SELLER ORDER AMOUNT
========================================================== */

function getSellerOrderAmount(
    order
){

    return Number(
        order.sellerAmount ||

        order.sellerPayout ||

        order.payoutAmount ||

        order.sellerPayable ||

        order.amount ||

        order.total ||

        order.price ||

        0
    );

}


/* ==========================================================
   SELLER CURRENCY
========================================================== */

function formatSellerCurrency(
    amount
){

    return "₦" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

}

/* ==========================================================
   UPDATE SELLER DASHBOARD VALUE
========================================================== */

function setSellerDashboardValue(
    ids,
    value
){

    if(!Array.isArray(ids)){

        ids = [ids];

    }


    ids.forEach(
        function(id){

            const element =
                document.getElementById(
                    id
                );


            if(element){

                element.textContent =
                    value;

            }

        }
    );

}


/* ==========================================================
   SELLER MONTHLY STATISTICS
========================================================== */

function calculateSellerMonthlyStats(
    orders
){

    const now =
        new Date();


    const currentMonth =
        now.getMonth();


    const currentYear =
        now.getFullYear();


    let monthlySales =
        0;

    let monthlyOrders =
        0;


    orders.forEach(
        function(order){

            const status =
                getSellerOrderStatus(
                    order
                );


            if(
                status !== "completed" &&
                status !== "delivered"
            ){

                return;

            }


            let orderDate = null;


            if(
                order.createdAt?.toDate
            ){

                orderDate =
                    order.createdAt.toDate();

            }

            else if(
                order.createdAt
            ){

                orderDate =
                    new Date(
                        order.createdAt
                    );

            }

            else if(
                order.updatedAt?.toDate
            ){

                orderDate =
                    order.updatedAt.toDate();

            }


            if(!orderDate){

                return;

            }


            if(
                orderDate.getMonth() ===
                currentMonth &&

                orderDate.getFullYear() ===
                currentYear
            ){

                monthlySales +=
                    getSellerOrderAmount(
                        order
                    );


                monthlyOrders++;

            }

        }
    );


    setSellerDashboardValue(
        [
            "sellerMonthlySales",
            "monthlySales"
        ],
        formatSellerCurrency(
            monthlySales
        )
    );


    setSellerDashboardValue(
        [
            "sellerMonthlyOrders",
            "monthlyOrders"
        ],
        monthlyOrders
    );

}


/* ==========================================================
   SELLER RECENT ORDERS
========================================================== */

function renderSellerRecentOrders(
    orders
){

    const container =
        document.getElementById(
            "sellerRecentOrders"
        );


    if(!container){

        return;

    }


    if(!orders.length){

        container.innerHTML = `

            <div class="seller-no-orders">

                No recent orders available.

            </div>

        `;

        return;

    }


    const sortedOrders =
        [...orders]
        .sort(
            function(a,b){

                return getOrderTime(b) -
                       getOrderTime(a);

            }
        )
        .slice(0,10);


    container.innerHTML =
        sortedOrders
        .map(
            function(order){

                const status =
                    getSellerOrderStatus(
                        order
                    );


                const amount =
                    getSellerOrderAmount(
                        order
                    );


                const orderId =
                    order.orderNumber ||
                    order.id;


                return `

                    <div class="seller-order-row">

                        <div>

                            <strong>
                                ${escapeSellerHTML(
                                    orderId
                                )}
                            </strong>

                            <span>
                                ${escapeSellerHTML(
                                    order.productName ||
                                    order.productTitle ||
                                    "Product order"
                                )}
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${formatSellerCurrency(
                                    amount
                                )}
                            </strong>

                            <span class="
                                seller-order-status
                                ${status}
                            ">
                                ${escapeSellerHTML(
                                    status
                                )}
                            </span>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* ==========================================================
   ORDER DATE
========================================================== */

function getOrderTime(
    order
){

    if(
        order.createdAt?.toDate
    ){

        return order.createdAt
            .toDate()
            .getTime();

    }


    if(order.createdAt){

        const date =
            new Date(
                order.createdAt
            );


        if(!isNaN(date.getTime())){

            return date.getTime();

        }

    }


    return 0;

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeSellerHTML(
    value
){

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
   SELLER ORDER COUNTERS
========================================================== */

function updateSellerOrderCounters(
    orders
){

    let pending =
        0;

    let completed =
        0;

    let cancelled =
        0;


    orders.forEach(
        function(order){

            const status =
                getSellerOrderStatus(
                    order
                );


            if(
                status ===
                "completed"
            ){

                completed++;

            }

            else if(
                status ===
                "cancelled"
            ){

                cancelled++;

            }

            else {

                pending++;

            }

        }
    );


    setSellerDashboardValue(
        "sellerCompletedOrders",
        completed
    );


    setSellerDashboardValue(
        "sellerPendingOrders",
        pending
    );


    setSellerDashboardValue(
        "sellerCancelledOrders",
        cancelled
    );

}




/* ==========================================================
   LOAD SELLER STORE PHOTO
========================================================== */

async function loadSellerStorePhoto(){

    if(!currentUser){

        console.warn(
            "Cannot load store photo: seller is not logged in."
        );

        return;

    }


    try {

        const sellerRef =
            doc(
                db,
                "users",
                currentUser.uid
            );


        const sellerSnapshot =
            await getDoc(
                sellerRef
            );


        let storePhoto = "";


        if(
            sellerSnapshot.exists()
        ){

            const sellerData =
                sellerSnapshot.data();


            /*
               Check the possible store-photo
               fields used by the application.
            */

            storePhoto =
                sellerData.storePhoto ||
                sellerData.storeImage ||
                sellerData.storePhotoURL ||
                sellerData.storeImageURL ||
                "";

        }


        /*
           Default image when seller has
           not uploaded a store photo.
        */

        if(!storePhoto){

            storePhoto =
                "default-avatar.png";

        }


        /*
           Header photo
        */

        const headerPhoto =
            document.getElementById(
                "headerSellerPhoto"
            );


        if(headerPhoto){

            headerPhoto.src =
                storePhoto;


            headerPhoto.onerror =
                function(){

                    this.onerror = null;

                    this.src =
                        "default-avatar.png";

                };

        }


        /*
           Store-photo management preview
        */

        const storePhotoPreview =
            document.getElementById(
                "sellerStorePhotoPreview"
            );


        if(storePhotoPreview){

            storePhotoPreview.src =
                storePhoto;


            storePhotoPreview.onerror =
                function(){

                    this.onerror = null;

                    this.src =
                        "default-avatar.png";

                };

        }


        /*
           Add / Edit button
        */

        const addButton =
            document.getElementById(
                "addStorePhotoButton"
            );


        const editButton =
            document.getElementById(
                "editStorePhotoButton"
            );


        /*
           If a real store photo exists,
           show EDIT.
        */

        const hasStorePhoto =
            storePhoto &&
            storePhoto !==
            "default-avatar.png";


        if(addButton){

            addButton.style.display =
                hasStorePhoto
                    ? "none"
                    : "block";

        }


        if(editButton){

            editButton.style.display =
                hasStorePhoto
                    ? "block"
                    : "none";

        }


        console.log(
            "Seller store photo loaded:",
            storePhoto
        );

    }
    catch(error){

        console.error(
            "Seller store photo loading error:",
            error
        );


        /*
           Keep default image if
           loading fails.
        */

        const headerPhoto =
            document.getElementById(
                "headerSellerPhoto"
            );


        const storePhotoPreview =
            document.getElementById(
                "sellerStorePhotoPreview"
            );


        if(headerPhoto){

            headerPhoto.src =
                "default-avatar.png";

        }


        if(storePhotoPreview){

            storePhotoPreview.src =
                "default-avatar.png";

        }

    }

}


/* ==========================================================
   CREATE SELLER NOTIFICATION
========================================================== */

async function createSellerNotification({

    sellerId,

    type = "account",

    title = "Seller notification",

    message = "",

    link = "seller.html",

    icon = "🔔"

}){

    if(!sellerId){

        console.error(
            "Cannot create notification: sellerId missing"
        );

        return;

    }


    try{

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {

                sellerId: sellerId,

                type: type,

                title: title,

                message: message,

                link: link,

                icon: icon,

                read: false,

                createdAt:
                    serverTimestamp()

            }
        );


        console.log(
            "Seller notification created."
        );


    }
    catch(error){

        console.error(
            "Seller notification error:",
            error
        );

    }

}


/* ==========================================================
   SELLER SOCIAL MEDIA
========================================================== */

function renderSellerSocialMedia(
    seller
){

    /*
       Support both:

       seller.socialMedia.instagram

       and older/direct fields such as:

       seller.instagram
    */

    const social =
        seller.socialMedia ||
        {};


    const platforms = {

        instagram:
            social.instagram ||
            seller.instagram ||
            seller.instagramUrl ||
            "",

        tiktok:
            social.tiktok ||
            seller.tiktok ||
            seller.tiktokUrl ||
            "",

        youtube:
            social.youtube ||
            seller.youtube ||
            seller.youtubeUrl ||
            "",

        facebook:
            social.facebook ||
            seller.facebook ||
            seller.facebookUrl ||
            "",

        x:
            social.x ||
            social.twitter ||
            seller.x ||
            seller.twitter ||
            seller.xUrl ||
            "",

        telegram:
            social.telegram ||
            seller.telegram ||
            seller.telegramUrl ||
            "",

        whatsapp:
            social.whatsapp ||
            seller.whatsapp ||
            seller.whatsappUrl ||
            "",

        website:
            social.website ||
            seller.website ||
            seller.websiteUrl ||
            ""

    };


    /*
       Find the social media container.
    */

    const container =
        document.getElementById(
            "sellerSocialMedia"
        );


    if(!container){

        console.warn(
            "sellerSocialMedia container not found."
        );

        return;

    }


    /*
       Only display platforms that
       actually contain a link.
    */

    const availablePlatforms =
        Object.entries(
            platforms
        )
        .filter(
            function([platform, url]){

                return (
                    typeof url === "string" &&
                    url.trim() !== ""
                );

            }
        );


    /*
       Nothing connected.
    */

    if(!availablePlatforms.length){

        container.innerHTML = `

            <div class="seller-social-empty">

                <span>
                    No social media accounts connected.
                </span>

            </div>

        `;

        return;

    }


    /*
       Platform information.
    */

    const platformInfo = {

        instagram: {
            name: "Instagram",
            icon: "📷"
        },

        tiktok: {
            name: "TikTok",
            icon: "🎵"
        },

        youtube: {
            name: "YouTube",
            icon: "▶️"
        },

        facebook: {
            name: "Facebook",
            icon: "f"
        },

        x: {
            name: "X",
            icon: "𝕏"
        },

        telegram: {
            name: "Telegram",
            icon: "✈️"
        },

        whatsapp: {
            name: "WhatsApp",
            icon: "💬"
        },

        website: {
            name: "Website",
            icon: "🌐"
        }

    };


    /*
       Render connected accounts.
    */

    container.innerHTML =
        availablePlatforms
        .map(
            function([platform, url]){

                const information =
                    platformInfo[
                        platform
                    ];


                if(!information){

                    return "";

                }


                const safeURL =
                    normalizeSocialURL(
                        url
                    );


                if(!safeURL){

                    return "";

                }


                return `

                    <a
                        href="${escapeSellerHTML(
                            safeURL
                        )}"
                        class="seller-social-link seller-social-${platform}"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="${information.name}"
                    >

                        <span
                            class="seller-social-icon"
                        >
                            ${information.icon}
                        </span>


                        <span
                            class="seller-social-name"
                        >
                            ${information.name}
                        </span>

                    </a>

                `;

            }
        )
        .join("");

}


/* ==========================================================
   NORMALIZE SOCIAL URL
========================================================== */

function normalizeSocialURL(
    url
){

    if(
        !url ||
        typeof url !== "string"
    ){

        return "";

    }


    let value =
        url.trim();


    if(!value){

        return "";

    }


    /*
       WhatsApp phone number.
    */

    if(
        /^(\+?\d[\d\s\-()]{7,})$/.test(
            value
        )
    ){

        const phone =
            value.replace(
                /[^\d+]/g,
                ""
            );


        return (
            "https://wa.me/" +
            phone.replace(
                "+",
                ""
            )
        );

    }


    /*
       Add HTTPS when the seller
       entered only the domain/path.
    */

    if(
        !/^https?:\/\//i.test(
            value
        )
    ){

        value =
            "https://" +
            value;

    }


    /*
       Verify it is a valid URL.
    */

    try{

        const parsed =
            new URL(
                value
            );


        if(
            parsed.protocol !==
                "http:" &&

            parsed.protocol !==
                "https:"
        ){

            return "";

        }


        return parsed.href;

    }
    catch(error){

        console.warn(
            "Invalid social URL:",
            url
        );

        return "";

    }

}


/* ==========================================================
   LOAD SELLER REGISTRATION DATA
========================================================== */

function loadSellerData(
    seller,
    user
) {

    const name =
        seller.name ||
        seller.fullName ||
        seller.displayName ||
        user.displayName ||
        "Seller";


    const email =
        seller.email ||
        user.email ||
        "—";


    const country =
        seller.country ||
        "—";


    const location =
        seller.location ||
        seller.city ||
        "—";


    const phone =
        seller.phone ||
        seller.phoneNumber ||
        "—";


    const sellerId =
        seller.sellerId ||
        user.uid;
        
        
        /* ==============================================
   SOCIAL MEDIA
============================================== */

renderSellerSocialMedia(
    seller
);


    /* ==============================================
       HEADER
    ============================================== */

    setText(
        "headerSellerName",
        name
    );


    setImage(
        "headerSellerPhoto",
        seller.photo ||
        seller.photoURL ||
        seller.profilePhoto
    );


    /* ==============================================
       SIDEBAR
    ============================================== */

    setText(
        "sidebarSellerName",
        name
    );


    setText(
        "sidebarSellerCountry",
        country
    );


    setImage(
        "sidebarSellerPhoto",
        seller.photo ||
        seller.photoURL ||
        seller.profilePhoto
    );


    /* ==============================================
       WELCOME
    ============================================== */

    setText(
        "welcomeSellerName",
        name
    );


    /* ==============================================
       VERIFICATION
    ============================================== */

    setText(
        "verificationMessage",
        "Your seller account is active."
    );


    setText(
        "verificationStatus",
        "Verified"
    );


    /* ==============================================
       PROFILE
    ============================================== */

    setText(
        "profileSellerName",
        name
    );


    setText(
        "profileSellerEmail",
        email
    );


    setText(
        "sellerFullName",
        name
    );


    setText(
        "sellerEmail",
        email
    );


    setText(
        "sellerCountry",
        country
    );


    setText(
        "sellerLocation",
        location
    );


    setText(
        "sellerPhone",
        phone
    );


    setText(
        "sellerId",
        sellerId
    );


    setImage(
        "sellerPhoto",
        seller.photo ||
        seller.photoURL ||
        seller.profilePhoto
    );


    /* ==============================================
       ACCOUNT STATUS
    ============================================== */

    setText(
        "sellerAccountStatus",
        "Active Seller"
    );

}


/* ==========================================================
   SET TEXT
========================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =
        value || "—";

}


/* ==========================================================
   SET IMAGE
========================================================== */

function setImage(
    id,
    imageUrl
) {

    const image =
        document.getElementById(
            id
        );


    if (!image) {

        return;

    }


    if (!imageUrl) {

        return;

    }


    image.src =
        imageUrl;


    image.onerror =
        () => {

            image.src =
                "default-avatar.png";

        };

}


/* ==========================================================
   SHOW SELLER PAGE
========================================================== */

function showSellerPage() {

    if (sellerMain) {

        sellerMain.style.display =
            "block";

    }


    if (pageLoader) {

        pageLoader.classList.add(
            "hidden"
        );

        pageLoader.style.display =
            "none";

    }

}



/* ==========================================================
   STORE PHOTO PANEL
========================================================== */

if (sellerProfileButton) {

    sellerProfileButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            if (!sellerPhotoPanel) {

                return;

            }

            sellerPhotoPanel.classList.toggle(
                "open"
            );

        }
    );

}


document.addEventListener(
    "click",
    function(event) {

        if (!sellerPhotoPanel) {

            return;

        }

        if (
            !sellerPhotoPanel.contains(event.target) &&
            !sellerProfileButton?.contains(event.target)
        ) {

            sellerPhotoPanel.classList.remove(
                "open"
            );

        }

    }
);



/* ==========================================================
   STORE PHOTO SELECTOR
========================================================== */

if (addStorePhotoButton) {

    addStorePhotoButton.addEventListener(
        "click",
        function() {

            sellerStorePhotoInput?.click();

        }
    );

}


/* ==========================================================
   SELLER STORE PHOTO UPLOAD
========================================================== */

if (sellerStorePhotoInput) {

    sellerStorePhotoInput.addEventListener(
        "change",
        async function() {

            const file =
                this.files?.[0];

            if (!file) {

                return;

            }


            await uploadSellerStorePhoto(
                file
            );


            this.value = "";

        }
    );

}

/* ==========================================================
   UPLOAD SELLER STORE PHOTO
========================================================== */

/* ==========================================================
   UPLOAD SELLER STORE PHOTO
========================================================== */

async function uploadSellerStorePhoto(file){

    if(!file){

        return;

    }


    if(!currentUser){

        console.error(
            "No authenticated seller found."
        );

        return;

    }


    try {

        if(storePhotoUploadStatus){

            storePhotoUploadStatus.textContent =
                "Uploading store photo...";

        }


        /*
           USE THE EXISTING CLOUDINARY FUNCTION
           FROM firebase.js
        */

        const cloudinaryResult =
            await uploadToCloudinary(
                file
            );


        console.log(
            "Cloudinary upload result:",
            cloudinaryResult
        );


        /*
           CLOUDINARY FUNCTIONS MAY RETURN:

           1. A URL directly
           2. { url: "..." }
           3. { secure_url: "..." }
           4. { data: { secure_url: "..." } }
        */

        let imageURL = "";


        if(
            typeof cloudinaryResult ===
            "string"
        ){

            imageURL =
                cloudinaryResult;

        }


        else if(
            cloudinaryResult?.secure_url
        ){

            imageURL =
                cloudinaryResult.secure_url;

        }


        else if(
            cloudinaryResult?.url
        ){

            imageURL =
                cloudinaryResult.url;

        }


        else if(
            cloudinaryResult?.data?.secure_url
        ){

            imageURL =
                cloudinaryResult
                    .data
                    .secure_url;

        }


        else if(
            cloudinaryResult?.data?.url
        ){

            imageURL =
                cloudinaryResult
                    .data
                    .url;

        }


        /*
           Make sure we actually received
           a usable image URL.
        */

        if(
            !imageURL ||
            typeof imageURL !==
            "string"
        ){

            console.error(
                "Invalid Cloudinary response:",
                cloudinaryResult
            );

            throw new Error(
                "Cloudinary upload completed but no image URL was returned."
            );

        }


        /*
           Save Cloudinary URL to seller.
        */

        await setDoc(

            doc(
                db,
                "users",
                currentUser.uid
            ),

            {

                storePhoto:
                    imageURL,

                updatedAt:
                    new Date()

            },

            {
                merge:
                    true
            }

        );


        /*
           Update header photo.
        */

        if(headerSellerPhoto){

            headerSellerPhoto.src =
                imageURL;

        }


        /*
           Update preview.
        */

        if(sellerStorePhotoPreview){

            sellerStorePhotoPreview.src =
                imageURL;

        }


        /*
           Change ADD PHOTO
           to EDIT PHOTO.
        */

        if(addStorePhotoButton){

            addStorePhotoButton.style.display =
                "none";

        }


        if(editStorePhotoButton){

            editStorePhotoButton.style.display =
                "block";

        }


        if(storePhotoUploadStatus){

            storePhotoUploadStatus.textContent =
                "Store photo updated successfully.";

        }


        console.log(
            "Seller store photo saved:",
            imageURL
        );


    }
    catch(error){

        console.error(
            "Store photo upload error:",
            error
        );


        if(storePhotoUploadStatus){

            storePhotoUploadStatus.textContent =
                "Unable to upload store photo. Please try again.";

        }

    }

}




/* ==========================================================
   STORE PHOTO STATUS
========================================================== */

function setStorePhotoStatus(
    message,
    type = ""
) {

    if (!storePhotoUploadStatus) {

        return;

    }


    storePhotoUploadStatus.textContent =
        message;


    storePhotoUploadStatus.className =
        "store-photo-upload-status";


    if (type) {

        storePhotoUploadStatus.classList.add(
            type
        );

    }

}


/* ==========================================================
   SELLER HEADER NOTIFICATION COUNT
========================================================== */



function startSellerNotificationCount(
    user
){

    if(!user){

        return;

    }


    const notificationCount =
        document.getElementById(
            "notificationCount"
        );


    if(!notificationCount){

        return;

    }


    const notificationsReference =
        collection(
            db,
            "notifications"
        );


    const notificationsQuery =
        query(
            notificationsReference,

            where(
                "sellerId",
                "==",
                user.uid
            ),

            where(
                "read",
                "==",
                false
            )
        );


    onSnapshot(
        notificationsQuery,
        function(snapshot){

            const count =
                snapshot.size;


            notificationCount.textContent =
                count > 99
                    ? "99+"
                    : count;

        },

        function(error){

            console.error(
                "Notification count error:",
                error
            );

        }
    );

}

const notificationButton =
    document.getElementById(
        "notificationButton"
    );


if(notificationButton){

    notificationButton.addEventListener(
        "click",
        function(){

            window.location.href =
                "notification.html";

        }
    );

}


/* ==========================================================
   SELLER BANK DETAILS
========================================================== */



/* ==========================================================
   SAVE SELLER BANK DETAILS
========================================================== */

async function saveSellerBankDetails(event) {

    event.preventDefault();

    const user =
        auth.currentUser;

    if (!user) {

        showBankStatus(
            "Please login first.",
            "error"
        );

        return;

    }


    const bankName =
        document
            .getElementById("bankName")
            ?.value
            .trim() || "";


    const accountName =
        document
            .getElementById("accountName")
            ?.value
            .trim() || "";


    const accountNumber =
        document
            .getElementById("accountNumber")
            ?.value
            .trim() || "";


    if (!bankName) {

        showBankStatus(
            "Please enter your bank name.",
            "error"
        );

        return;

    }


    if (!accountName) {

        showBankStatus(
            "Please enter the account name.",
            "error"
        );

        return;

    }


    if (!/^\d{10}$/.test(accountNumber)) {

        showBankStatus(
            "Account number must contain exactly 10 digits.",
            "error"
        );

        return;

    }


    const button =
        document.getElementById(
            "saveBankDetails"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Saving...";

    }


    try {

        await setDoc(

            doc(
                db,
                "users",
                user.uid
            ),

            {

                bankDetails: {

                    bankName:
                        bankName,

                    accountName:
                        accountName,

                    accountNumber:
                        accountNumber,

                    updatedAt:
                        serverTimestamp()

                }

            },

            {

                merge: true

            }

        );


        showBankStatus(
            "✓ Bank details saved successfully.",
            "success"
        );


    }

    catch(error) {

        console.error(
            "BANK DETAILS ERROR:",
            error
        );


        showBankStatus(
            "Unable to save bank details.",
            "error"
        );

    }


    finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Save Bank Details";

        }

    }

}


/* ==========================================================
   STATUS
========================================================== */

function showBankStatus(
    message,
    type
) {

    const element =
        document.getElementById(
            "bankDetailsStatus"
        );

    if (!element) return;

    element.textContent =
        message;

    element.className =
        `bank-details-status ${type}`;

}


/* ==========================================================
   LOAD EXISTING BANK DETAILS
========================================================== */

async function loadSellerBankDetails() {

    const user =
        auth.currentUser;

    if (!user) return;


    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "users",
                    user.uid
                )
            );


        if (!snapshot.exists()) {

            return;

        }


        const data =
            snapshot.data();


        const bank =
            data.bankDetails;


        if (!bank) {

            return;

        }


        const bankName =
            document.getElementById(
                "bankName"
            );

        const accountName =
            document.getElementById(
                "accountName"
            );

        const accountNumber =
            document.getElementById(
                "accountNumber"
            );


        if (bankName) {

            bankName.value =
                bank.bankName || "";

        }


        if (accountName) {

            accountName.value =
                bank.accountName || "";

        }


        if (accountNumber) {

            accountNumber.value =
                bank.accountNumber || "";

        }

    }

    catch(error) {

        console.error(
            "Unable to load bank details:",
            error
        );

    }

}


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const form =
            document.getElementById(
                "sellerBankForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                saveSellerBankDetails
            );

        }


        onAuthStateChanged(
            auth,
            function(user) {

                if (user) {

                    loadSellerBankDetails();

                }

            }
        );

    }
);



