import {
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


/* ==========================================================
   FIREBASE CONFIG
========================================================== */

import {
    auth,
    db,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET
} from "./firebase.js";


/* ==========================================================
   FIRESTORE
========================================================== */

import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   CONSTANTS
========================================================== */

const CART_STORAGE_KEY =
    "yourStoreCart";


/* ==========================================================
   PAGE STATE
========================================================== */

let currentBuyer = null;

let buyerProducts = [];

let buyerChatUnsubscribe = null;

let buyerInitialized = false;


/* ==========================================================
   DOM ELEMENTS
========================================================== */

const buyerLoader =
    document.getElementById(
        "buyerPageLoader"
    );


const buyerApp =
    document.getElementById(
        "buyerApp"
    );


const buyerName =
    document.getElementById(
        "buyerName"
    );


const buyerEmail =
    document.getElementById(
        "buyerEmail"
    );


const buyerPhoto =
    document.getElementById(
        "buyerPhoto"
    );


const buyerAccountName =
    document.getElementById(
        "buyerAccountName"
    );


const buyerProductGrid =
    document.getElementById(
        "buyerProductGrid"
    );


const buyerCartCount =
    document.getElementById(
        "buyerCartCount"
    );


const buyerQuickCartCount =
    document.getElementById(
        "buyerQuickCartCount"
    );


const buyerPhotoInput =
    document.getElementById(
        "buyerPhotoInput"
    );


const buyerPhotoButton =
    document.getElementById(
        "buyerPhotoButton"
    );


const buyerPhotoStatus =
    document.getElementById(
        "buyerPhotoStatus"
    );


const buyerLogoutButton =
    document.getElementById(
        "buyerLogoutButton"
    );


/* ==========================================================
   AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    async function(user){

        currentBuyer =
            user || null;


        /*
         * User is not logged in.
         */

        if(!currentBuyer){

            window.location.href =
                "login.html";

            return;

        }


        /*
         * Prevent duplicate initialization.
         */

        if(buyerInitialized){

            return;

        }


        buyerInitialized =
            true;


        await initializeBuyerPage();
        

    }
);


/* ==========================================================
   INITIALIZE BUYER PAGE
========================================================== */

async function initializeBuyerPage(){

    try {

        showBuyerLoader();


        /*
         * Load buyer information.
         */

        loadBuyerInformation();


        /*
         * Load buyer photo.
         */

        loadBuyerPhoto();


        /*
         * Initialize cart.
         */

        updateBuyerCartCount();


        /*
         * Listen for cart changes.
         */

        initializeBuyerCartSync();


        /*
         * Load products.
         */

        await loadBuyerProducts();


        /*
         * Initialize chat notifications.
         */

        initializeBuyerChatNotifications();


        /*
         * Show application.
         */

        showBuyerApp();

    }
    catch(error){

        console.error(
            "BUYER PAGE INITIALIZATION ERROR:",
            error
        );


        showBuyerError(
            "Unable to load your buyer dashboard."
        );

    }
    finally {

        hideBuyerLoader();

    }

}


/* ==========================================================
   BUYER INFORMATION
========================================================== */

function loadBuyerInformation(){

    if(!currentBuyer){

        return;

    }


    const displayName =
        currentBuyer.displayName ||
        localStorage.getItem(
            "buyerFirstName"
        ) ||
        "Buyer";


    const email =
        currentBuyer.email ||
        "";


    if(buyerName){

        buyerName.textContent =
            displayName;

    }


    if(buyerAccountName){

        buyerAccountName.textContent =
            displayName;

    }


    if(buyerEmail){

        buyerEmail.textContent =
            email;

    }

}


/* ==========================================================
   BUYER PHOTO
========================================================== */

function loadBuyerPhoto(){

    if(!buyerPhoto){

        return;

    }


    const photoURL =
        currentBuyer?.photoURL ||
        "images/default-avatar.png";


    buyerPhoto.src =
        photoURL;


    buyerPhoto.alt =
        currentBuyer?.displayName ||
        "Buyer profile";


    buyerPhoto.onerror =
        function(){

            this.onerror =
                null;

            this.src =
                "images/default-avatar.png";

        };


    updateBuyerPhotoButton();

}


/* ==========================================================
   UPDATE PHOTO BUTTON
========================================================== */

function updateBuyerPhotoButton(){

    if(!buyerPhotoButton){

        return;

    }


    buyerPhotoButton.textContent =
        currentBuyer?.photoURL
            ? "Edit Photo"
            : "Add Photo";

}


/* ==========================================================
   PHOTO STATUS
========================================================== */

function setBuyerPhotoStatus(
    message,
    type = ""
){

    if(!buyerPhotoStatus){

        return;

    }


    buyerPhotoStatus.textContent =
        message;


    buyerPhotoStatus.className =
        "buyer-photo-status";


    if(type){

        buyerPhotoStatus.classList.add(
            type
        );

    }

}



/* ==========================================================
   CLOUDINARY PHOTO UPLOAD - DEBUG
========================================================== */

async function uploadBuyerPhotoToCloudinary(file) {

    console.log(
        "========== BUYER PHOTO UPLOAD =========="
    );


    console.log(
        "Selected file:",
        file
    );


    if (!file) {

        throw new Error(
            "No image selected."
        );

    }


    console.log(
        "File name:",
        file.name
    );

    console.log(
        "File type:",
        file.type
    );

    console.log(
        "File size:",
        file.size
    );


    console.log(
        "Cloud name:",
        CLOUDINARY_CLOUD_NAME
    );

    console.log(
        "Upload preset:",
        CLOUDINARY_UPLOAD_PRESET
    );


    if (!CLOUDINARY_CLOUD_NAME) {

        throw new Error(
            "❌ Cloudinary cloud name is missing."
        );

    }


    if (!CLOUDINARY_UPLOAD_PRESET) {

        throw new Error(
            "❌ Cloudinary upload preset is missing."
        );

    }


    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    console.log(
        "Uploading to:",
        uploadURL
    );


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    try {

        console.log(
            "Sending request to Cloudinary..."
        );


        const response =
            await fetch(
                uploadURL,
                {
                    method: "POST",
                    body: formData
                }
            );


        console.log(
            "Cloudinary response:",
            response
        );


        console.log(
            "HTTP status:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "Cloudinary response body:",
            responseText
        );


        if (!response.ok) {

            throw new Error(
                `Cloudinary HTTP ${response.status}: ${responseText}`
            );

        }


        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        }
        catch(error) {

            throw new Error(
                "Cloudinary returned an invalid response."
            );

        }


        console.log(
            "Cloudinary data:",
            data
        );


        if (!data.secure_url) {

            throw new Error(
                "Cloudinary uploaded the request but returned no secure_url."
            );

        }


        console.log(
            "✅ CLOUDINARY UPLOAD SUCCESS"
        );


        console.log(
            "Image URL:",
            data.secure_url
        );


        return data.secure_url;

    }

    catch(error) {

        console.error(
            "❌ CLOUDINARY FETCH ERROR:",
            error
        );


        console.error(
            "Upload URL:",
            uploadURL
        );


        throw error;

    }

}



/* ==========================================================
   PHOTO SELECTION
========================================================== */

async function handleBuyerPhotoSelection(
    event
){

    const file =
        event.target.files?.[0];


    if(!file){

        return;

    }


    if(
        !file.type.startsWith(
            "image/"
        )
    ){

        setBuyerPhotoStatus(
            "Please select an image file.",
            "error"
        );

        event.target.value =
            "";

        return;

    }


    if(
        file.size >
        5 * 1024 * 1024
    ){

        setBuyerPhotoStatus(
            "Photo must be 5 MB or smaller.",
            "error"
        );

        event.target.value =
            "";

        return;

    }


    try {

        if(!currentBuyer){

            throw new Error(
                "Buyer account was not found."
            );

        }


        if(buyerPhotoButton){

            buyerPhotoButton.disabled =
                true;

            buyerPhotoButton.textContent =
                "Uploading...";

        }


        setBuyerPhotoStatus(
            "Uploading photo...",
            "loading"
        );


        const photoURL =
            await uploadBuyerPhotoToCloudinary(
                file
            );


        await updateProfile(
            currentBuyer,
            {
                photoURL
            }
        );


        currentBuyer.photoURL =
            photoURL;


        if(buyerPhoto){

            buyerPhoto.src =
                photoURL;

        }


        updateBuyerPhotoButton();


        setBuyerPhotoStatus(
            "Photo updated successfully.",
            "success"
        );

    }
    catch(error){

        console.error(
            "BUYER PHOTO ERROR:",
            error
        );
        

        setBuyerPhotoStatus(
            error?.message ||
            "Unable to update your photo.",
            "error"
        );

    }
    finally {

        if(buyerPhotoButton){

            buyerPhotoButton.disabled =
                false;

            updateBuyerPhotoButton();

        }


        if(buyerPhotoInput){

            buyerPhotoInput.value =
                "";

        }

    }

}


/* ==========================================================
   PHOTO BUTTON
========================================================== */

if(buyerPhotoButton){

    buyerPhotoButton.addEventListener(
        "click",
        function(){

            if(buyerPhotoInput){

                buyerPhotoInput.click();

            }

        }
    );

}


/* ==========================================================
   PHOTO INPUT
========================================================== */

if(buyerPhotoInput){

    buyerPhotoInput.addEventListener(
        "change",
        handleBuyerPhotoSelection
    );

}


/* ==========================================================
   CLOUDINARY DEBUG TEST
========================================================== */

function testCloudinaryConfiguration() {

    console.log(
        "========== CLOUDINARY TEST =========="
    );

    console.log(
        "Cloud Name:",
        CLOUDINARY_CLOUD_NAME
    );

    console.log(
        "Upload Preset:",
        CLOUDINARY_UPLOAD_PRESET
    );


    if (!CLOUDINARY_CLOUD_NAME) {

        console.error(
            "❌ CLOUDINARY_CLOUD_NAME is missing."
        );

        return false;

    }


    if (!CLOUDINARY_UPLOAD_PRESET) {

        console.error(
            "❌ CLOUDINARY_UPLOAD_PRESET is missing."
        );

        return false;

    }


    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    console.log(
        "Cloudinary Upload URL:",
        uploadURL
    );


    console.log(
        "✅ Cloudinary configuration exists."
    );


    return true;

}


/* ==========================================================
   RUN TEST
========================================================== */

testCloudinaryConfiguration();


/* ==========================================================
   CART
========================================================== */

function getYourStoreCart(){

    try {

        const storedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if(!storedCart){

            return [];

        }


        const parsedCart =
            JSON.parse(
                storedCart
            );


        if(Array.isArray(parsedCart)){

            return parsedCart;

        }


        if(
            parsedCart &&
            Array.isArray(
                parsedCart.items
            )
        ){

            return parsedCart.items;

        }


        return [];

    }
    catch(error){

        console.error(
            "CART READ ERROR:",
            error
        );


        return [];

    }

}


/* ==========================================================
   CART COUNT
========================================================== */

function getYourStoreCartCount(){

    const cart =
        getYourStoreCart();


    return cart.reduce(
        function(total, item){

            if(!item){

                return total;

            }


            let quantity =
                Number(
                    item.quantity
                );


            if(
                !Number.isFinite(quantity)
            ){

                quantity =
                    Number(
                        item.qty
                    );

            }


            if(
                !Number.isFinite(quantity) ||
                quantity <= 0
            ){

                quantity =
                    1;

            }


            return (
                total +
                quantity
            );

        },
        0
    );

}


/* ==========================================================
   UPDATE CART COUNT
========================================================== */

function updateBuyerCartCount(){

    const count =
        getYourStoreCartCount();


    const displayCount =
        count > 99
            ? "99+"
            : String(count);


    if(buyerCartCount){

        buyerCartCount.textContent =
            displayCount;

    }


    if(buyerQuickCartCount){

        buyerQuickCartCount.textContent =
            displayCount;

    }

}


/* ==========================================================
   CART SYNC
========================================================== */

function initializeBuyerCartSync(){

    updateBuyerCartCount();


    /*
     * Other browser tabs.
     */

    window.addEventListener(
        "storage",
        function(event){

            if(
                event.key ===
                CART_STORAGE_KEY
            ){

                updateBuyerCartCount();

            }

        }
    );


    /*
     * Custom event from your
     * product/cart JavaScript.
     */

    window.addEventListener(
        "yourStoreCartUpdated",
        updateBuyerCartCount
    );


    /*
     * Returning to the page.
     */

    window.addEventListener(
        "pageshow",
        updateBuyerCartCount
    );


    /*
     * Browser focus.
     */

    window.addEventListener(
        "focus",
        updateBuyerCartCount
    );


    /*
     * Page becomes visible.
     */

    document.addEventListener(
        "visibilitychange",
        function(){

            if(
                document.visibilityState ===
                "visible"
            ){

                updateBuyerCartCount();

            }

        }
    );

}


/* ==========================================================
   LOAD PRODUCTS
========================================================== */

async function loadBuyerProducts(){

    if(!buyerProductGrid){

        return;

    }


    buyerProductGrid.innerHTML = `

        <div class="buyer-products-loading">
            Loading products...
        </div>

    `;


    try {

        const productsReference =
            collection(
                db,
                "products"
            );


        let snapshot;


        /*
         * Try newest products first.
         */

        try {

            const productsQuery =
                query(
                    productsReference,
                    orderBy(
                        "createdAt",
                        "desc"
                    ),
                    limit(40)
                );


            snapshot =
                await getDocs(
                    productsQuery
                );

        }
        catch(orderError){

            console.warn(
                "createdAt ordering unavailable.",
                orderError
            );


            const fallbackQuery =
                query(
                    productsReference,
                    limit(40)
                );


            snapshot =
                await getDocs(
                    fallbackQuery
                );

        }


        buyerProducts = [];


        snapshot.forEach(
            function(documentSnapshot){

                const data =
                    documentSnapshot.data();


                /*
                 * Hide inactive products.
                 */

                if(
                    data.status === "inactive" ||
                    data.status === "draft" ||
                    data.status === "deleted" ||
                    data.status === "rejected"
                ){

                    return;

                }


                buyerProducts.push({

                    id:
                        documentSnapshot.id,

                    ...data

                });

            }
        );


        renderBuyerProducts();

    }
    catch(error){

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        buyerProductGrid.innerHTML = `

            <div class="buyer-products-empty">

                <div class="buyer-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Products unavailable
                </h3>

                <p>
                    We couldn't load products right now.
                </p>

                <button
                    type="button"
                    id="retryBuyerProducts"
                >
                    Try Again
                </button>

            </div>

        `;


        const retryButton =
            document.getElementById(
                "retryBuyerProducts"
            );


        if(retryButton){

            retryButton.addEventListener(
                "click",
                loadBuyerProducts
            );

        }

    }

}


/* ==========================================================
   RENDER PRODUCTS
========================================================== */

function renderBuyerProducts(){

    if(!buyerProductGrid){

        return;

    }


    if(
        buyerProducts.length === 0
    ){

        buyerProductGrid.innerHTML = `

            <div class="buyer-products-empty">

                <div class="buyer-empty-icon">
                    🛒
                </div>

                <h3>
                    No products available
                </h3>

                <p>
                    New products will appear here
                    when sellers upload them.
                </p>

            </div>

        `;

        return;

    }


    buyerProductGrid.innerHTML =
        buyerProducts
            .map(
                createBuyerProductCard
            )
            .join("");

}


/* ==========================================================
   PRODUCT CARD
========================================================== */

function createBuyerProductCard(
    product
){

    const productId =
        product.id;


    const productName =
        product.name ||
        product.productName ||
        "Product";


    const image =
        product.image ||
        product.mainImage ||
        (
            Array.isArray(product.images)
                ? product.images[0]
                : ""
        ) ||
        "images/product-placeholder.jpg";


    const price =
        Number(
            product.price ||
            product.buyerPrice ||
            0
        );


    const oldPrice =
        Number(
            product.oldPrice ||
            0
        );


    const rating =
        Number(
            product.rating ||
            0
        );


    const reviewCount =
        Number(
            product.reviewCount ||
            product.reviews ||
            0
        );


    const category =
        product.category ||
        "Product";


    const badge =
        product.badge ||
        "";


    return `

        <article
            class="buyer-product-card"
            data-product-id="${escapeBuyerAttribute(
                productId
            )}"
        >

        <a
                href="product.html?id=${encodeURIComponent(
                    productId
                )}"
                class="buyer-product-image-link"
            >

                <div class="buyer-product-image">

                    ${
                        badge
                            ? `
                                <span class="buyer-product-badge">
                                    ${escapeBuyerHTML(
                                        badge
                                    )}
                                </span>
                            `
                            : ""
                    }

                    <img
                        src="${escapeBuyerAttribute(
                            image
                        )}"
                        alt="${escapeBuyerAttribute(
                            productName
                        )}"
                        loading="lazy"
                    >

                </div>

            </a>


            <div class="buyer-product-information">

                <div class="buyer-product-category">

                    ${escapeBuyerHTML(
                        category
                    )}

                </div>


                <a
                    href="product.html?id=${encodeURIComponent(
                        productId
                    )}"
                    class="buyer-product-name"
                >

                    ${escapeBuyerHTML(
                        productName
                    )}

                </a>


                <div class="buyer-product-price-row">

                    <strong
                        class="buyer-product-price"
                    >

                        ₦${price.toLocaleString(
                            "en-NG"
                        )}

                    </strong>


                    ${
                        oldPrice > price
                            ? `
                                <span class="buyer-product-old-price">
                                    ₦${oldPrice.toLocaleString(
                                        "en-NG"
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>


                ${
                    oldPrice > price
                        ? `
                            <span class="buyer-product-discount">
                                ${Math.round(
                                    (
                                        (
                                            oldPrice -
                                            price
                                        ) /
                                        oldPrice
                                    ) *
                                    100
                                )}% OFF
                            </span>
                        `
                        : ""
                }


                <div class="buyer-product-rating">

                    <span>
                        ★
                    </span>

                    ${
                        rating > 0
                            ? rating.toFixed(1)
                            : "New"
                    }

                    ${
                        reviewCount > 0
                            ? `
                                <small>
                                    (${reviewCount.toLocaleString()})
                                </small>
                            `
                            : ""
                    }

                </div>


                <div class="buyer-product-seller">

                    ${
                        product.sellerName
                            ? `
                                Sold by
                                <strong>
                                    ${escapeBuyerHTML(
                                        product.sellerName
                                    )}
                                </strong>
                            `
                            : "Marketplace Seller"
                    }

                </div>


                <a
                    href="product.html?id=${encodeURIComponent(
                        productId
                    )}"
                    class="buyer-product-view-button"
                >

                    View Product

                </a>

            </div>

        </article>

    `;

}


/* ==========================================================
   BUYER CHAT NOTIFICATIONS
========================================================== */

function initializeBuyerChatNotifications(){

    if(!currentBuyer){

        return;

    }


    /*
     * Remove previous listener.
     */

    if(buyerChatUnsubscribe){

        buyerChatUnsubscribe();

        buyerChatUnsubscribe =
            null;

    }


    listenToBuyerChats(
        currentBuyer.uid
    );

}


/* ==========================================================
   LISTEN TO BUYER CHATS
========================================================== */

function listenToBuyerChats(
    buyerUid
){

    if(!buyerUid){

        return;

    }


    const container =
        document.getElementById(
            "buyerChatNotificationsList"
        );


    if(!container){

        return;

    }


    const chatsReference =
        collection(
            db,
            "users",
            buyerUid,
            "chats"
        );


    const chatsQuery =
        query(
            chatsReference,
            orderBy(
                "updatedAt",
                "desc"
            ),
            limit(20)
        );


    buyerChatUnsubscribe =
        onSnapshot(
            chatsQuery,

            function(snapshot){

                const chats = [];


                snapshot.forEach(
                    function(documentSnapshot){

                        chats.push({

                            chatId:
                                documentSnapshot.id,

                            ...documentSnapshot.data()

                        });

                    }
                );


                renderBuyerChatNotifications(
                    chats
                );

            },

            function(error){

                console.error(
                    "BUYER CHAT LISTENER ERROR:",
                    error
                );


                /*
                 * If updatedAt is missing from
                 * some chat documents, show the
                 * empty state instead of crashing.
                 */

                renderBuyerChatNotifications(
                    []
                );

            }
        );

}


/* ==========================================================
   RENDER CHAT NOTIFICATIONS
========================================================== */

function renderBuyerChatNotifications(
    chats
){

    const container =
        document.getElementById(
            "buyerChatNotificationsList"
        );


    if(!container){

        return;

    }


    if(
        !Array.isArray(chats) ||
        chats.length === 0
    ){

        container.innerHTML = `

            <div class="buyer-chat-empty">

                <div class="buyer-chat-empty-icon">
                    💬
                </div>

                <div>

                    <strong>
                        No recent chats
                    </strong>

                    <p>
                        Your conversations with sellers
                        will appear here.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    container.innerHTML =
        chats
            .map(
                createBuyerChatNotification
            )
            .join("");

}


/* ==========================================================
   CREATE CHAT CARD
========================================================== */

function createBuyerChatNotification(
    chat
){

    if(!chat){

        return "";

    }


    const chatId =
        String(
            chat.chatId ||
            chat.id ||
            ""
        );


    if(!chatId){

        return "";

    }


    const sellerName =
        chat.sellerStoreName ||
        chat.sellerName ||
        chat.storeName ||
        "Seller";


    const sellerImage =
        chat.sellerPhoto ||
        chat.sellerImage ||
        chat.sellerAvatar ||
        chat.seller?.photoURL ||
        "";


    const lastMessage =
        chat.lastMessage ||
        chat.latestMessage ||
        chat.message ||
        "Start a conversation with this seller.";


    let productCount = 0;


    if(
        Array.isArray(chat.items)
    ){

        productCount =
            chat.items.length;

    }
    else if(
        Array.isArray(chat.products)
    ){

        productCount =
            chat.products.length;

    }
    else if(
        Array.isArray(chat.cartItems)
    ){

        productCount =
            chat.cartItems.length;

    }


    const unreadCount =
        Number(
            chat.unreadCount ||
            chat.buyerUnreadCount ||
            0
        );


    const unread =
        unreadCount > 0 ||
        chat.buyerHasUnread === true;


    const time =
        formatChatTime(
            chat.updatedAt ||
            chat.lastMessageAt
        );


    const imageHTML =
        sellerImage

            ?

            `
                <img
                    src="${escapeBuyerAttribute(
                        sellerImage
                    )}"
                    alt="${escapeBuyerAttribute(
                        sellerName
                    )}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.parentElement.innerHTML='🏪';
                    "
                >
            `

            :

            `🏪`;


    return `

        <a
            href="chat.html?chatId=${encodeURIComponent(
                chatId
            )}"
            class="
                buyer-chat-notification
                ${unread ? "unread" : ""}
            "
            data-chat-id="${escapeBuyerAttribute(
                chatId
            )}"
        >

            <div
                class="buyer-chat-notification-image"
            >

                ${imageHTML}

                ${
                    unread
                        ? `
                            <span
                                class="buyer-chat-unread-dot"
                            ></span>
                        `
                        : ""
                }

            </div>


            <div
                class="buyer-chat-notification-content"
            >

                <div
                    class="buyer-chat-notification-top"
                >

                    <span
                        class="buyer-chat-seller-name"
                    >
                        ${escapeBuyerHTML(
                            sellerName
                        )}
                    </span>


                    <span
                        class="buyer-chat-time"
                    >
                        ${escapeBuyerHTML(
                            time
                        )}
                    </span>

                </div>


                <div
                    class="buyer-chat-last-message"
                >

                    ${escapeBuyerHTML(
                        lastMessage
                    )}

                </div>


                <div
                    class="buyer-chat-product-summary"
                >

                    <strong>
                        ${productCount}
                    </strong>

                    ${
                        productCount === 1
                            ? "product"
                            : "products"
                    }


                    ${
                        unread
                            ? `
                                <span>•</span>

                                <strong>
                                    New message
                                </strong>
                            `
                            : ""
                    }

                </div>

            </div>


            ${
                unread

                    ?

                    `
                        <span
                            class="buyer-chat-unread-count"
                        >

                            ${
                                unreadCount > 99
                                    ? "99+"
                                    : unreadCount || "!"
                            }

                        </span>
                    `

                    :

                    `
                        <span
                            class="buyer-chat-arrow"
                        >
                            ›
                        </span>
                    `
            }

        </a>

    `;

}


/* ==========================================================
   CHAT TIME
========================================================== */

function formatChatTime(
    value
){

    if(!value){

        return "";

    }


    try {

        let date;


        if(
            value &&
            typeof value.toDate ===
            "function"
        ){

            date =
                value.toDate();

        }
        else if(
            value instanceof Date
        ){

            date =
                value;

        }
        else if(
            typeof value ===
            "number"
        ){

            date =
                new Date(
                    value
                );

        }
        else{

            date =
                new Date(
                    value
                );

        }


        if(
            Number.isNaN(
                date.getTime()
            )
        ){

            return "";

        }


        const now =
            new Date();


        const difference =
            now.getTime() -
            date.getTime();


        const minutes =
            Math.floor(
                difference /
                60000
            );


        if(minutes < 1){

            return "now";

        }


        if(minutes < 60){

            return `${minutes}m`;

        }


        const hours =
            Math.floor(
                minutes /
                60
            );


        if(hours < 24){

            return `${hours}h`;

        }


        const days =
            Math.floor(
                hours /
                24
            );


        if(days < 7){

            return `${days}d`;

        }


        return date.toLocaleDateString(
            "en-NG",
            {
                day: "numeric",
                month: "short"
            }
        );

    }
    catch(error){

        return "";

    }

}


/* ==========================================================
   LOGOUT
========================================================== */

if(buyerLogoutButton){

    buyerLogoutButton.addEventListener(
        "click",
        async function(){

            try {

                buyerLogoutButton.disabled =
                    true;


                buyerLogoutButton.textContent =
                    "Logging out...";


                await signOut(
                    auth
                );


                window.location.href =
                    "index.html";

            }
            catch(error){

                console.error(
                    "LOGOUT ERROR:",
                    error
                );


                buyerLogoutButton.disabled =
                    false;


                buyerLogoutButton.textContent =
                    "🚪 Logout";

            }

        }
    );

}


/* ==========================================================
   SHOW BUYER APP
========================================================== */

function showBuyerApp(){

    if(!buyerApp){

        return;

    }


    buyerApp.style.display =
        "block";


    buyerApp.classList.add(
        "ready"
    );

}


/* ==========================================================
   SHOW LOADER
========================================================== */

function showBuyerLoader(){

    if(!buyerLoader){

        return;

    }


    buyerLoader.style.display =
        "flex";

}


/* ==========================================================
   HIDE LOADER
========================================================== */

function hideBuyerLoader(){

    if(!buyerLoader){

        return;

    }


    buyerLoader.classList.add(
        "hidden"
    );


    setTimeout(
        function(){

            if(buyerLoader){

                buyerLoader.style.display =
                    "none";

            }

        },
        300
    );

}


/* ==========================================================
   BUYER ERROR
========================================================== */

function showBuyerError(
    message
){

    if(!buyerProductGrid){

        return;

    }


    buyerProductGrid.innerHTML = `

        <div class="buyer-products-empty">

            <div class="buyer-empty-icon">
                ⚠️
            </div>

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeBuyerHTML(
                    message
                )}
            </p>

        </div>

    `;

}


/* ==========================================================
   CHAT MESSAGE HELPER
   Prevents:
   "showChatMessage is not defined"
========================================================== */

function showChatMessage(
    message,
    type = "info"
){

    console.log(
        `[CHAT ${type.toUpperCase()}]`,
        message
    );

}


/* ==========================================================
   SAFE HTML
========================================================== */

function escapeBuyerHTML(
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
   SAFE ATTRIBUTE
========================================================== */

function escapeBuyerAttribute(
    value
){

    return escapeBuyerHTML(
        value
    );

}

