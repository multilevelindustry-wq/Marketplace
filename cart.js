import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


/* ==========================================================
   FIREBASE CONFIGURATION
========================================================== */

import {
    auth,
    db
} from "./firebase.js";


/* ==========================================================
   CART STORAGE KEY
========================================================== */

const CART_STORAGE_KEY =
    "yourStoreCart";


/* ==========================================================
   CHECKOUT STORAGE KEYS
========================================================== */

const CHECKOUT_DATA_KEY =
    "pendingCheckout";

const CHECKOUT_RETURN_KEY =
    "checkoutReturnUrl";


/* ==========================================================
   PAGE STATE
========================================================== */

let currentUser = null;

let authReady = false;

let pageInitialized = false;


/* ==========================================================
   GET CART
   USE EXISTING PRODUCT CART STORAGE
========================================================== */

function getCart(){

   
    const storageKey =
        "yourStoreCart";


    try{

        const stored =
            localStorage.getItem(
                storageKey
            );


        /*
         * No cart has been created yet.
         */

        if(!stored){

            return [];

        }


        const parsed =
            JSON.parse(
                stored
            );


        /*
         * Normal cart format:
         *
         * [
         *     {...},
         *     {...}
         * ]
         */

        if(
            Array.isArray(
                parsed
            )
        ){

            return parsed;

        }


        /*
         * Also support:
         *
         * {
         *     items: [...]
         * }
         */

        if(
            parsed &&
            Array.isArray(
                parsed.items
            )
        ){

            return parsed.items;

        }


        return [];


    }
    catch(error){

        console.error(
            "GET CART ERROR:",
            error
        );


        return [];

    }

}



/* ==========================================================
   SAVE CART
   USE EXISTING PRODUCT CART STORAGE
========================================================== */

function saveCart(cart){

    try{

        localStorage.setItem(
            "yourStoreCart",
            JSON.stringify(
                Array.isArray(cart)
                    ? cart
                    : []
            )
        );


        /*
         * Notify the rest of the website.
         */

        window.dispatchEvent(
            new CustomEvent(
                "yourStoreCartUpdated",
                {
                    detail: {
                        cart:
                            Array.isArray(cart)
                                ? cart
                                : []
                    }
                }
            )
        );


        return true;


    }
    catch(error){

        console.error(
            "SAVE CART ERROR:",
            error
        );


        return false;

    }

}



/* ==========================================================
   INITIALIZE PAGE
========================================================== */

/*
   IMPORTANT:

   We do NOT wait for Firebase before
   displaying the guest cart.

   The cart is local first.

   Firebase authentication runs separately.
*/

async function initializePage(){

    if(pageInitialized){

        return;

    }


    pageInitialized = true;


    console.log(
        "Initializing cart page..."
    );


    try{

        /*
           Start Firebase authentication.

           This does NOT block the cart.
        */

        initializeAuth();


        /*
           Immediately load the local cart.
        */

        renderCart();


        /*
           Immediately update the cart count.
        */

        updateGlobalCartCount();


        /*
           Update buyer/header state.
        */

        updateBuyerHeader();

        updateLoginStatus();


        /*
           Hide the loader.

           We don't need to wait for Firebase.
        */

        hideCartLoader();


        console.log(
            "Cart page initialized."
        );

    }
    catch(error){

        console.error(
            "Cart page initialization failed:",
            error
        );


        hideCartLoader();

    }

}


/* ==========================================================
   INITIALIZE AUTHENTICATION
========================================================== */

function initializeAuth(){

    /*
       Make sure Firebase Auth exists.
    */

    if(!auth){

        console.warn(
            "Firebase Auth is not available."
        );


        authReady = true;

        updateBuyerHeader();

        updateLoginStatus();

        return;

    }


    /*
       Listen for authentication changes.

       This does NOT redirect the buyer.

       Guests remain on cart.html.
    */

    onAuthStateChanged(
        auth,
        handleAuthStateChanged
    );

}


/* ==========================================================
   AUTH STATE CHANGED
========================================================== */

async function handleAuthStateChanged(user){

    console.log(
        "Authentication state:",
        user
            ? "Signed in"
            : "Guest"
    );


    /*
       Save current user.
    */

    currentUser =
        user || null;


    /*
       Firebase authentication is now ready.
    */

    authReady = true;


    /*
       Update account/header.
    */

    updateBuyerHeader();

    updateLoginStatus();


    /*
       Update checkout button text.

       The function will be created
       in Part 5.
    */

    if(
        typeof updateCheckoutButton ===
        "function"
    ){

        updateCheckoutButton();

    }


    /*
       IMPORTANT:

       If user just logged in,
       we will synchronize the local
       guest cart with Firebase.

       The function will be created
       in Part 6.
    */

    if(
        currentUser &&
        typeof synchronizeCartWithFirebase ===
        "function"
    ){

        try{

            await synchronizeCartWithFirebase();

        }
        catch(error){

            console.error(
                "Cart Firebase synchronization failed:",
                error
            );

        }

    }


    /*
       Re-render after authentication.

       This is safe because the local cart
       remains the source for immediate display.
    */

    if(
        typeof renderCart ===
        "function"
    ){

        renderCart();

    }


    /*
       Update global cart counter.
    */

    if(
        typeof updateGlobalCartCount ===
        "function"
    ){

        updateGlobalCartCount();

    }

}


/* ==========================================================
   UPDATE BUYER HEADER
========================================================== */

function updateBuyerHeader(){

    const accountName =
        document.getElementById(
            "cartAccountName"
        );


    const accountLink =
        document.getElementById(
            "cartAccountLink"
        );


    /*
       Header elements may not exist
       on every page.

       That is completely okay.
    */

    if(!accountName){

        return;

    }


    /*
       LOGGED IN
    */

    if(currentUser){

        const buyerName =
            currentUser.displayName ||
            (
                currentUser.email
                    ? currentUser.email.split("@")[0]
                    : ""
            ) ||
            "My Account";


        accountName.textContent =
            buyerName;


        if(accountLink){

            accountLink.href =
                "buyer.html";


            accountLink.setAttribute(
                "aria-label",
                "Open your account"
            );

        }


        return;

    }


    /*
       GUEST
    */

    accountName.textContent =
        "Sign In";


    if(accountLink){

        accountLink.href =
            "login.html";


        accountLink.setAttribute(
            "aria-label",
            "Sign in to your account"
        );

    }

}


/* ==========================================================
   UPDATE LOGIN STATUS
========================================================== */

function updateLoginStatus(){

    const status =
        document.getElementById(
            "cartLoginStatus"
        );


    if(!status){

        return;

    }


    /*
       LOGGED IN
    */

    if(currentUser){

        const buyerName =
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "Buyer";


        status.classList.add(
            "logged-in"
        );


        status.textContent =
            `Signed in as ${buyerName}`;


        status.setAttribute(
            "aria-label",
            `Signed in as ${buyerName}`
        );


        return;

    }


    /*
       GUEST
    */

    status.classList.remove(
        "logged-in"
    );


    status.textContent =
        "You can shop as a guest. Login is required at checkout.";


    status.setAttribute(
        "aria-label",
        "Guest shopping. Login is required at checkout."
    );

}


/* ==========================================================
   HIDE CART PAGE LOADER
========================================================== */

function hideCartLoader(){

    const loader =
        document.getElementById(
            "cartPageLoader"
        );


    if(!loader){

        return;

    }


    loader.classList.add(
        "hidden"
    );


    loader.style.display =
        "none";

}


/* ==========================================================
   PAGE START
========================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initializePage,
        {
            once: true
        }
    );

}
else{

    initializePage();

}

/* ==========================================================
   CART.JS
   PART 2
   PRODUCT NORMALIZATION + CART COUNT + CART EVENTS
========================================================== */


/* ==========================================================
   NORMALIZE CART PRODUCT — FIXED
========================================================== */

function normalizeCartProduct(product){

    if(!product || typeof product !== "object"){

        return null;

    }


    /* ======================================================
       PRODUCT ID
    ====================================================== */

    const productId =
        getProductId(product);


    /*
     * A cart item MUST have a real product ID.
     */

    if(!productId){

        console.warn(
            "Invalid cart product skipped:",
            product
        );

        return null;

    }


    /* ======================================================
       PRODUCT NAME
    ====================================================== */

    const name =
        getProductName(product);


    /* ======================================================
       PRODUCT IMAGE
    ====================================================== */

    const image =
        getProductImage(product);


    /* ======================================================
       PRODUCT PRICE
    ====================================================== */

    const price =
        getProductPrice(product);


    /* ======================================================
       QUANTITY
    ====================================================== */

    const quantity =
        Math.max(
            1,
            Number(
                product.quantity ??
                product.qty ??
                1
            ) || 1
        );


    /* ======================================================
       SELLER
    ====================================================== */

    const sellerId =
        String(
            product.sellerId ??
            product.sellerID ??
            product.vendorId ??
            product.vendorID ??
            product.seller?.id ??
            product.seller?.uid ??
            "unknown-seller"
        );


    const sellerName =
        product.sellerName ??
        product.vendorName ??
        product.seller?.name ??
        product.seller?.displayName ??
        "Seller";


    const sellerStoreName =
        product.sellerStoreName ??
        product.storeName ??
        product.shopName ??
        product.shop ??
        product.seller?.storeName ??
        product.seller?.shopName ??
        sellerName;


    const sellerPhoto =
        product.sellerPhoto ??
        product.sellerImage ??
        product.sellerAvatar ??
        product.seller?.photoURL ??
        product.seller?.image ??
        "";


    const sellerLocation =
        product.sellerLocation ??
        product.location ??
        product.seller?.location ??
        "";


    /* ======================================================
       DELIVERY
    ====================================================== */

    const deliveryPrice =
        Number(
            product.deliveryPrice ??
            product.deliveryFee ??
            product.shippingFee ??
            product.sellerDeliveryPrice ??
            0
        ) || 0;


    const deliveryOptions =
        product.deliveryOptions ??
        product.deliveryLocations ??
        product.shippingOptions ??
        {};


    /* ======================================================
       PRODUCT URL
    ====================================================== */

    const productUrl =
        getProductUrl(
            productId,
            product
        );


    /* ======================================================
       RETURN CLEAN PRODUCT
    ====================================================== */

    return {

        ...product,

        id:
            String(
                productId
            ),

        productId:
            String(
                productId
            ),

        name:
            name,

        productName:
            name,

        title:
            name,

        image:
            image,

        mainImage:
            image,

        price:
            price,

        quantity:
            quantity,

        sellerId:
            sellerId,

        sellerName:
            sellerName,

        sellerStoreName:
            sellerStoreName,

        sellerPhoto:
            sellerPhoto,

        sellerLocation:
            sellerLocation,

        deliveryPrice:
            deliveryPrice,

        deliveryOptions:
            deliveryOptions,

        productUrl:
            productUrl

    };

}

/* ==========================================================
   GET PRODUCT ID
========================================================== */

function getProductId(product){

    if(!product){

        return "";

    }


    /*
     * IMPORTANT:
     *
     * Do NOT use buyer/user uid as a product ID.
     */

    const possibleIds = [

        product.productId,

        product.productID,

        product.id,

        product.product?.id,

        product.product?.productId,

        product.firestoreId,

        product.documentId,

        product.docId

    ];


    for(
        const value
        of possibleIds
    ){

        if(
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ){

            return String(
                value
            ).trim();

        }

    }


    return "";

}


/* ==========================================================
   GET PRODUCT NAME
========================================================== */

function getProductName(product){

    if(!product){

        return "Product";

    }


    const possibleNames = [

        product.name,

        product.productName,

        product.title,

        product.productTitle,

        product.product?.name,

        product.product?.productName,

        product.product?.title

    ];


    for(
        const value
        of possibleNames
    ){

        if(
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ){

            return String(
                value
            ).trim();

        }

    }


    /*
     * Do not allow an invalid blank product
     * to silently become a fake product.
     */

    return "Product";

}


/* ==========================================================
   GET PRODUCT IMAGE
========================================================== */

function getProductImage(product){

    if(!product){

        return "images/product-placeholder.jpg";

    }


    const possibleImages = [

        product.mainImage,

        product.image,

        product.imageUrl,

        product.imageURL,

        product.productImage,

        product.thumbnail,

        product.thumbnailUrl,

        product.photoURL,

        product.product?.mainImage,

        product.product?.image,

        product.product?.imageUrl,

        product.product?.imageURL,

        product.product?.thumbnail

    ];


    /*
     * Check normal image fields.
     */

    for(
        const value
        of possibleImages
    ){

        if(
            typeof value === "string" &&
            value.trim() !== ""
        ){

            return value.trim();

        }

    }


    /*
     * Check images array.
     */

    if(
        Array.isArray(
            product.images
        )
    ){

        for(
            const image
            of product.images
        ){

            if(
                typeof image === "string" &&
                image.trim() !== ""
            ){

                return image.trim();

            }


            /*
             * Some products store images as objects.
             */

            if(
                image &&
                typeof image === "object"
            ){

                const imageUrl =
                    image.url ??
                    image.src ??
                    image.imageUrl;


                if(
                    imageUrl
                ){

                    return String(
                        imageUrl
                    );

                }

            }

        }

    }


    /*
     * Nested product images.
     */

    if(
        product.product &&
        Array.isArray(
            product.product.images
        )
    ){

        for(
            const image
            of product.product.images
        ){

            if(
                typeof image === "string" &&
                image.trim() !== ""
            ){

                return image.trim();

            }

        }

    }


    /*
     * Safe fallback.
     */

    return "images/product-placeholder.jpg";

}


/* ==========================================================
   GET PRODUCT PRICE
========================================================== */

function getProductPrice(product){

    if(!product){

        return 0;

    }


    const possiblePrices = [

        product.buyerPrice,

        product.sellingPrice,

        product.salePrice,

        product.price,

        product.unitPrice,

        product.productPrice,

        product.product?.buyerPrice,

        product.product?.sellingPrice,

        product.product?.salePrice,

        product.product?.price

    ];


    for(
        const value
        of possiblePrices
    ){

        if(
            value !== undefined &&
            value !== null &&
            value !== ""
        ){

            const numericValue =
                Number(
                    String(value)
                        .replace(
                            /₦/g,
                            ""
                        )
                        .replace(
                            /,/g,
                            ""
                        )
                        .trim()
                );


            if(
                Number.isFinite(
                    numericValue
                )
            ){

                return Math.max(
                    0,
                    numericValue
                );

            }

        }

    }


    return 0;

}


/* ==========================================================
   GET PRODUCT URL
========================================================== */

function getProductUrl(
    productId,
    product
){

    /*
     * If the original product already has
     * a product URL, preserve it.
     */

    if(
        product &&
        typeof product.productUrl === "string" &&
        product.productUrl.trim() !== ""
    ){

        return product.productUrl;

    }


    if(
        product &&
        typeof product.url === "string" &&
        product.url.trim() !== "" &&
        product.url.includes("product")
    ){

        return product.url;

    }


    /*
     * Standard YOURSTORE product page.
     */

    return (
        "product.html?id=" +
        encodeURIComponent(
            productId
        )
    );

}


/* ==========================================================
   GET NORMALIZED CART
========================================================== */

/*
   Always use this when working with cart products.

   Invalid products are automatically removed
   from the returned array.
*/

function getNormalizedCart(){

    const cart =
        getCart();


    if(
        !Array.isArray(cart)
    ){

        return [];

    }


    return cart
        .map(
            normalizeCartProduct
        )
        .filter(
            product =>
                product &&
                product.id
        );

}


/* ==========================================================
   GET TOTAL CART ITEM COUNT
========================================================== */

/*
   Example:

   Product A quantity = 2
   Product B quantity = 3

   Cart count = 5
*/

function getCartItemCount(){

    const cart =
        getNormalizedCart();


    return cart.reduce(
        function(
            total,
            product
        ){

            const quantity =
                Number(
                    product.quantity || 0
                );


            if(
                !Number.isFinite(
                    quantity
                )
            ){

                return total;

            }


            return total +
                Math.max(
                    0,
                    quantity
                );

        },
        0
    );

}


/* ==========================================================
   UPDATE GLOBAL CART COUNT
========================================================== */

/*
   Updates all cart counters found in the page.

   Supported:

   .cart-count
   #cartCount
   #headerCartCount
   #cartHeaderCount
   #productCartCount
   [data-cart-count]
*/

function updateGlobalCartCount(){

    try{

        const count =
            getCartItemCount();


        const selectors = [

            ".cart-count",

            "#cartCount",

            "#headerCartCount",

            "#cartHeaderCount",

            "#productCartCount",

            ".product-cart-count",

            "[data-cart-count]"

        ];


        const elements =
            document.querySelectorAll(
                selectors.join(",")
            );


        elements.forEach(
            function(element){

                element.textContent =
                    String(
                        count
                    );


                /*
                   Hide the badge when cart is empty.
                */

                if(count <= 0){

                    element.hidden =
                        true;

                    element.classList.add(
                        "cart-count-empty"
                    );

                }
                else{

                    element.hidden =
                        false;

                    element.classList.remove(
                        "cart-count-empty"
                    );

                }

            }
        );


    }
    catch(error){

        console.error(
            "Global cart count update failed:",
            error
        );

    }

}


/* ==========================================================
   LISTEN FOR CART CHANGES
========================================================== */

/*
   If another page/script adds something to the cart,
   this page updates automatically.

   We also listen for the browser's storage event
   so another browser tab can update the cart count.
*/

window.addEventListener(
    "yourStoreCartUpdated",
    function(){

        updateGlobalCartCount();


        /*
           Re-render only if the cart container
           exists on the current page.
        */

        if(
            document.getElementById(
                "cartItems"
            )
        ){

            if(
                typeof renderCart ===
                "function"
            ){

                renderCart();

            }

        }

    }
);


window.addEventListener(
    "storage",
    function(event){

        if(
            event.key !==
            CART_STORAGE_KEY
        ){

            return;

        }


        updateGlobalCartCount();


        if(
            document.getElementById(
                "cartItems"
            )
        ){

            if(
                typeof renderCart ===
                "function"
            ){

                renderCart();

            }

        }

    }
);


/* ==========================================================
   CART EVENTS
========================================================== */

/*
   Event delegation is used.

   This means we do NOT need to attach separate
   listeners to every product button.

   It also works after renderCart() replaces
   the cart HTML.
*/

function setupCartEvents(){

    /*
       Prevent duplicate event listeners.
    */

    if(
        document.body.dataset.cartEventsReady ===
        "true"
    ){

        return;

    }


    document.body.dataset.cartEventsReady =
        "true";


    /* ======================================================
       QUANTITY + REMOVE
    ====================================================== */

    document.addEventListener(
        "click",
        function(event){

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if(!button){

                return;

            }


            const action =
                button.dataset.action;


            const productId =
                button.dataset.productId;


            if(!action){

                return;

            }


            if(!productId){

                return;

            }


            /*
               INCREASE
            */

            if(
                action ===
                "increase"
            ){

                event.preventDefault();


                changeQuantity(
                    productId,
                    1
                );


                return;

            }


            /*
               DECREASE
            */

            if(
                action ===
                "decrease"
            ){

                event.preventDefault();


                changeQuantity(
                    productId,
                    -1
                );


                return;

            }


            /*
               REMOVE
            */

            if(
                action ===
                "remove"
            ){

                event.preventDefault();


                removeCartItem(
                    productId
                );


                return;

            }

        }
    );


    /* ======================================================
       CLEAR CART
    ====================================================== */

    document.addEventListener(
        "click",
        function(event){

            const clearButton =
                event.target.closest(
                    "#clearCartButton"
                );


            if(!clearButton){

                return;

            }


            event.preventDefault();


            clearCart();

        }
    );


    /* ======================================================
       CHECKOUT
    ====================================================== */

    document.addEventListener(
        "click",
        function(event){

            const checkoutButton =
                event.target.closest(
                    "#checkoutButton, #mobileCheckoutButton"
                );


            if(!checkoutButton){

                return;

            }


            event.preventDefault();


            /*
               startCheckout() will be created
               in Part 5.

               We check that it exists first so
               Part 2 can safely coexist while
               we build the file.
            */

            if(
                typeof startCheckout ===
                "function"
            ){

                startCheckout();

            }

        }
    );

}


/* ==========================================================
   CHANGE CART QUANTITY
========================================================== */

function changeQuantity(
    productId,
    amount
){

    const cart =
        getNormalizedCart();


    const product =
        cart.find(
            function(item){

                return String(
                    item.id
                ) ===
                String(
                    productId
                );

            }
        );


    if(!product){

        console.warn(
            "Cart product not found:",
            productId
        );

        return;

    }


    const oldQuantity =
        Math.max(
            1,
            Number(
                product.quantity || 1
            )
        );


    const change =
        Number(
            amount || 0
        );


    let newQuantity =
        oldQuantity +
        change;


    /*
       Quantity cannot be less than 1.
    */

    newQuantity =
        Math.max(
            1,
            newQuantity
        );


    product.quantity =
        newQuantity;


    /*
       Save immediately.
    */

    saveCart(
        cart
    );


    /*
       Update counter immediately.
    */

    updateGlobalCartCount();


    /*
       Re-render cart if renderCart exists.
    */

    if(
        typeof renderCart ===
        "function"
    ){

        renderCart();

    }


    /*
       Optional message.
    */

    if(
        typeof showCartMessage ===
        "function"
    ){

        showCartMessage(
            "Cart quantity updated."
        );

    }

}


/* ==========================================================
   REMOVE CART ITEM
========================================================== */

function removeCartItem(
    productId
){

    const cart =
        getNormalizedCart();


    const newCart =
        cart.filter(
            function(product){

                return String(
                    product.id
                ) !==
                String(
                    productId
                );

            }
        );


    /*
       Product did not exist.
    */

    if(
        newCart.length ===
        cart.length
    ){

        return;

    }


    /*
       Save new cart.
    */

    saveCart(
        newCart
    );


    /*
       Update count.
    */

    updateGlobalCartCount();


    /*
       Re-render.
    */

    if(
        typeof renderCart ===
        "function"
    ){

        renderCart();

    }


    /*
       Show message if available.
    */

    if(
        typeof showCartMessage ===
        "function"
    ){

        showCartMessage(
            "Product removed from cart."
        );

    }

}


/* ==========================================================
   CLEAR CART
========================================================== */

function clearCart(){

    /*
       Save an empty cart.

       Do NOT only use removeItem() because
       other scripts need the cart-updated event.
    */

    saveCart(
        []
    );


    /*
       Update global counter.
    */

    updateGlobalCartCount();


    /*
       Re-render.
    */

    if(
        typeof renderCart ===
        "function"
    ){

        renderCart();

    }


    /*
       Show message.
    */

    if(
        typeof showCartMessage ===
        "function"
    ){

        showCartMessage(
            "Cart cleared."
        );

    }

}


/* ==========================================================
   START CART EVENTS
========================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            setupCartEvents();

            updateGlobalCartCount();

        },
        {
            once: true
        }
    );

}
else{

    setupCartEvents();

    updateGlobalCartCount();

}



/* ==========================================================
   CART.JS
   PART 3
   SELLER GROUPS + TOTALS + CART HTML
========================================================== */


/* ==========================================================
   GROUP CART PRODUCTS BY SELLER
========================================================== */

/*
   A buyer can purchase products from multiple sellers.

   Example:

   Seller A
      Product 1
      Product 2

   Seller B
      Product 3

   Each seller gets their own group.
*/

function groupCartBySeller(){

    const cart =
        getNormalizedCart();


    const groups = {};


    cart.forEach(
        function(product){

            const sellerId =
                product.sellerId ||
                "unknown-seller";


            /*
               Create seller group if it
               does not already exist.
            */

            if(!groups[sellerId]){

                groups[sellerId] = {

                    sellerId:
                        String(
                            sellerId
                        ),

                    sellerName:
                        product.sellerName ||
                        "Seller",

                    sellerStoreName:
                        product.sellerStoreName ||
                        product.sellerName ||
                        "Seller Store",

                    sellerPhoto:
                        product.sellerPhoto ||
                        "",

                    sellerLocation:
                        product.sellerLocation ||
                        "",

                    deliveryOptions:
                        product.deliveryOptions ||
                        {},

                    items: [],

                    subtotal: 0,

                    delivery: 0,

                    total: 0

                };

            }


            /*
               Add product to seller.
            */

            groups[sellerId]
                .items
                .push(
                    product
                );


            /*
               Product subtotal.
            */

            const price =
                Number(
                    product.price || 0
                );


            const quantity =
                Math.max(
                    1,
                    Number(
                        product.quantity || 1
                    )
                );


            groups[sellerId]
                .subtotal +=
                    price *
                    quantity;


            /*
               Delivery is charged once
               per seller.

               If several products from
               the same seller have delivery
               fees, use the highest one.
            */

            const productDelivery =
                Number(
                    product.deliveryPrice || 0
                );


            groups[sellerId]
                .delivery =
                Math.max(
                    groups[sellerId].delivery,
                    Number.isFinite(
                        productDelivery
                    )
                        ? productDelivery
                        : 0
                );

        }
    );


    /*
       Calculate seller totals.
    */

    Object.values(
        groups
    ).forEach(
        function(group){

            group.total =
                Number(
                    group.subtotal || 0
                ) +
                Number(
                    group.delivery || 0
                );

        }
    );


    return Object.values(
        groups
    );

}


/* ==========================================================
   CALCULATE CART TOTALS
========================================================== */

function calculateCartTotals(){

    const sellerGroups =
        groupCartBySeller();


    let subtotal = 0;

    let delivery = 0;


    sellerGroups.forEach(
        function(sellerGroup){

            subtotal +=
                Number(
                    sellerGroup.subtotal || 0
                );


            delivery +=
                Number(
                    sellerGroup.delivery || 0
                );

        }
    );


    return {

        sellerGroups:

            sellerGroups,

        subtotal:

            subtotal,

        delivery:

            delivery,

        total:

            subtotal +
            delivery

    };

}


/* ==========================================================
   CREATE SELLER GROUP HTML
========================================================== */

function createSellerGroup(
    sellerGroup,
    sellerIndex
){

    if(!sellerGroup){

        return "";

    }


    /*
       Create every product belonging
       to this seller.
    */

    const itemsHTML =
        Array.isArray(
            sellerGroup.items
        )
            ? sellerGroup.items
                .map(
                    function(product){

                        return createCartItem(
                            product
                        );

                    }
                )
                .join("")
            : "";


    /*
       Seller photo.
    */

    const sellerPhoto =
        sellerGroup.sellerPhoto ||
        "";


    /*
       Seller store name.
    */

    const storeName =
        sellerGroup.sellerStoreName ||
        sellerGroup.sellerName ||
        "Seller Store";


    /*
       Seller location.
    */

    const sellerLocation =
        sellerGroup.sellerLocation ||
        "";


    return `

        <section
            class="cart-seller-group"
            data-seller-id="${escapeHTML(
                sellerGroup.sellerId
            )}"
        >


            <!-- ======================================
                 SELLER HEADER
            ======================================= -->

            <div
                class="cart-seller-header"
            >


                <div
                    class="cart-seller-information"
                >


                    ${
                        sellerPhoto
                            ?

                            `

                                <img
                                    src="${escapeHTML(
                                        sellerPhoto
                                    )}"
                                    class="cart-seller-photo"
                                    alt="${escapeHTML(
                                        storeName
                                    )}"
                                    loading="lazy"
                                >

                            `

                            :

                            `

                                <div
                                    class="cart-seller-photo-placeholder"
                                    aria-hidden="true"
                                >
                                    🏪
                                </div>

                            `
                    }


                    <div
                        class="cart-seller-text"
                    >


                        <span
                            class="cart-seller-label"
                        >
                            SOLD BY
                        </span>


                        <h3>
                            ${escapeHTML(
                                storeName
                            )}
                        </h3>


                        ${
                            sellerLocation

                                ?

                                `

                                    <small>
                                        ${escapeHTML(
                                            sellerLocation
                                        )}
                                    </small>

                                `

                                :

                                ""
                        }


                    </div>


                </div>


                <span
                    class="seller-order-number"
                >
                    Seller ${sellerIndex + 1}
                </span>


            </div>


            <!-- ======================================
                 SELLER PRODUCTS
            ======================================= -->

            <div
                class="cart-seller-items"
            >

                ${itemsHTML}

            </div>


            <!-- ======================================
                 SELLER SUMMARY
            ======================================= -->

            <div
                class="cart-seller-summary"
            >


                <div>

                    <span>
                        Seller subtotal
                    </span>

                    <strong>
                        ₦${formatMoney(
                            sellerGroup.subtotal
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        
                    </span>

                    <strong>

                        ${
                            Number(
                                sellerGroup.delivery || 0
                            ) > 0

                                ?

                                `₦${formatMoney(
                                    sellerGroup.delivery
                                )}`

                                :

                                " "
                        }

                    </strong>

                </div>


                <div
                    class="seller-total-row"
                >

                    <span>
                        Seller total
                    </span>

                    <strong>
                        ₦${formatMoney(
                            sellerGroup.total
                        )}
                    </strong>

                </div>


            </div>


        </section>

    `;

}


/* ==========================================================
   CREATE CART ITEM — FIXED
========================================================== */

function createCartItem(
    product
){

    const itemTotal =
        Number(
            product.price || 0
        ) *
        Number(
            product.quantity || 1
        );


    const productId =
        String(
            product.id || ""
        );


    const productUrl =
        product.productUrl ||
        getProductUrl(
            productId,
            product
        );


    const productImage =
        product.image ||
        getProductImage(
            product
        );


    const productName =
        product.name ||
        getProductName(
            product
        );


    return `

        <article
            class="cart-item"
            data-product-id="${escapeHTML(
                productId
            )}"
        >

            <a
                href="${escapeHTML(
                    productUrl
                )}"
                class="cart-item-image-link"
            >

                <img
                    src="${escapeHTML(
                        productImage
                    )}"
                    alt="${escapeHTML(
                        productName
                    )}"
                    class="cart-item-image"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='images/product-placeholder.jpg';
                    "
                >

            </a>


            <div
                class="cart-item-details"
            >

                <a
                    href="${escapeHTML(
                        productUrl
                    )}"
                    class="cart-item-name"
                >

                    ${escapeHTML(
                        productName
                    )}

                </a>


                ${
                    product.variant
                        ? `

                            <div
                                class="cart-item-variant"
                            >

                                ${escapeHTML(
                                    product.variant
                                )}

                            </div>

                          `
                        : ""
                }


                <div
                    class="cart-item-unit-price"
                >

                    ₦${formatMoney(
                        product.price
                    )}

                </div>


                <div
                    class="cart-item-bottom"
                >

                    <div
                        class="cart-quantity-control"
                    >

                        <button
                            type="button"
                            class="cart-quantity-button"
                            data-action="decrease"
                            data-product-id="${escapeHTML(
                                productId
                            )}"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>


                        <span
                            class="cart-quantity"
                        >
                            ${product.quantity}
                        </span>


                        <button
                            type="button"
                            class="cart-quantity-button"
                            data-action="increase"
                            data-product-id="${escapeHTML(
                                productId
                            )}"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>


                    <strong
                        class="cart-item-total"
                    >

                        ₦${formatMoney(
                            itemTotal
                        )}

                    </strong>

                </div>


                <button
                    type="button"
                    class="remove-cart-item"
                    data-action="remove"
                    data-product-id="${escapeHTML(
                        productId
                    )}"
                >

                    Remove

                </button>

            </div>

        </article>

    `;

}



/* ==========================================================
   PART 7A
   EXISTING PRODUCT CART STORAGE BRIDGE
========================================================== */


/* ==========================================================
   READ EXISTING PRODUCT CART
========================================================== */

function readExistingProductCart(){

    try{

        /*
         * IMPORTANT:
         *
         * Use the SAME storage key that the
         * existing product page uses.
         */

        const storageKey =
            getProductCartStorageKey();


        if(!storageKey){

            console.error(
                "Product cart storage key was not found."
            );

            return [];

        }


        const stored =
            localStorage.getItem(
                storageKey
            );


        if(!stored){

            return [];

        }


        const cart =
            JSON.parse(
                stored
            );


        if(
            !Array.isArray(cart)
        ){

            return [];

        }


        return cart;


    }
    catch(error){

        console.error(
            "READ EXISTING PRODUCT CART ERROR:",
            error
        );


        return [];

    }

}


/* ==========================================================
   WRITE EXISTING PRODUCT CART
========================================================== */

function writeExistingProductCart(cart){

    try{

        const storageKey =
            getProductCartStorageKey();


        if(!storageKey){

            console.error(
                "Product cart storage key was not found."
            );

            return false;

        }


        localStorage.setItem(
            storageKey,
            JSON.stringify(
                Array.isArray(cart)
                    ? cart
                    : []
            )
        );


        return true;


    }
    catch(error){

        console.error(
            "WRITE EXISTING PRODUCT CART ERROR:",
            error
        );


        return false;

    }

}


/* ==========================================================
   SYNCHRONIZE CART.JS WITH EXISTING PRODUCT CART
========================================================== */

function syncCartFromProductStorage(){

    const existingCart =
        readExistingProductCart();


    if(
        !Array.isArray(
            existingCart
        )
    ){

        return [];

    }


    /*
     * Keep the existing cart exactly as
     * the product page created it.
     */

    return existingCart;

}


/* ==========================================================
   FORMAT MONEY
========================================================== */

function formatMoney(
    amount
){

    const value =
        Number(
            amount
        );


    if(
        !Number.isFinite(
            value
        )
    ){

        return "0";

    }


    return value.toLocaleString(
        "en-NG",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


/* ==========================================================
   FORMAT CART MONEY
========================================================== */

function formatCartMoney(
    amount
){

    return formatMoney(
        amount
    );

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

/*
   Prevent product names, seller names,
   image URLs, etc. from breaking the
   generated cart HTML.
*/

function escapeHTML(
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
   UPDATE CART SUMMARY
========================================================== */

function updateCartSummary(
    totals
){

    if(!totals){

        return;

    }


    const subtotalElement =
        document.getElementById(
            "cartSubtotal"
        );


    const deliveryElement =
        document.getElementById(
            "cartDeliveryTotal"
        );


    const totalElement =
        document.getElementById(
            "cartGrandTotal"
        );


    const mobileGrandTotal =
        document.getElementById(
            "mobileGrandTotal"
        );


    const sellerCountElement =
        document.getElementById(
            "cartSellerCount"
        );


    const summaryItemCount =
        document.getElementById(
            "summaryItemCount"
        );


    const cartItemSummary =
        document.getElementById(
            "cartItemSummary"
        );


    /*
     * Get current cart.
     */

    const cart =
        getNormalizedCart();


    /*
     * Count total quantities.
     */

    const itemCount =
        cart.reduce(
            function(total, item){

                return total +
                    Math.max(
                        0,
                        Number(
                            item.quantity
                        ) || 0
                    );

            },
            0
        );


    /*
     * SUBTOTAL
     */

    if(subtotalElement){

        subtotalElement.textContent =
            `₦${formatMoney(
                totals.subtotal || 0
            )}`;

    }


    /*
     * DELIVERY
     */

    if(deliveryElement){

        const delivery =
            Number(
                totals.delivery
            ) || 0;


        deliveryElement.textContent =
            delivery > 0
                ? `₦${formatMoney(
                    delivery
                )}`
                : "";

    }


    /*
     * GRAND TOTAL
     */

    if(totalElement){

        totalElement.textContent =
            `₦${formatMoney(
                totals.total || 0
            )}`;

    }


    /*
     * MOBILE TOTAL
     */

    if(mobileGrandTotal){

        mobileGrandTotal.textContent =
            `₦${formatMoney(
                totals.total || 0
            )}`;

    }


    /*
     * SELLER COUNT
     */

    if(sellerCountElement){

        sellerCountElement.textContent =
            String(
                Array.isArray(
                    totals.sellerGroups
                )
                    ? totals.sellerGroups.length
                    : 0
            );

    }


    /*
     * SUMMARY ITEM COUNT
     */

    const itemText =
        `${itemCount} ${
            itemCount === 1
                ? "item"
                : "items"
        }`;


    if(summaryItemCount){

        summaryItemCount.textContent =
            itemText;

    }


    /*
     * PAGE ITEM COUNT
     */

    if(cartItemSummary){

        cartItemSummary.textContent =
            itemText;

    }

}


/* ==========================================================
   UPDATE CHECKOUT BUTTON
========================================================== */

function updateCheckoutButton(){

    const buttons = [

        document.getElementById(
            "checkoutButton"
        ),

        document.getElementById(
            "mobileCheckoutButton"
        ),

        ...document.querySelectorAll(
            ".checkout-button"
        )

    ];


    /*
     * Remove duplicate elements.
     */

    const uniqueButtons =
        [
            ...new Set(
                buttons.filter(
                    Boolean
                )
            )
        ];


    const cart =
        getNormalizedCart();


    const isEmpty =
        cart.length === 0;


    uniqueButtons.forEach(
        function(button){

            /*
             * Empty cart.
             */

            if(isEmpty){

                button.disabled =
                    true;

                button.textContent =
                    "Cart is Empty";

                return;

            }


            /*
             * Cart has products.
             *
             * NEVER disable checkout simply
             * because the buyer is a guest.
             */

            button.disabled =
                false;


            /*
             * Logged-in buyer.
             */

            if(currentUser){

                button.textContent =
                    "Proceed to Checkout";

            }


            /*
             * Guest buyer.
             */

            else{

                button.textContent =
                    "Login to Checkout";

            }

        }
    );

}


/* ==========================================================
   START CHECKOUT / ORDER NOW
========================================================== */

function startCheckout(){

    try{

        /*
         * Get the latest cart.
         */

        const cart =
            getNormalizedCart();


        /*
         * Empty cart protection.
         */

        if(
            !Array.isArray(cart) ||
            cart.length === 0
        ){

            showCartMessage(
                "Your cart is empty.",
                "error"
            );

            return;

        }


        /*
         * Calculate seller groups and totals.
         */

        const totals =
            calculateCartTotals();


        if(
            !Array.isArray(
                totals.sellerGroups
            ) ||
            totals.sellerGroups.length === 0
        ){

            showCartMessage(
                "Unable to prepare your order.",
                "error"
            );

            return;

        }


        /*
         * Create unique order ID.
         */

        const orderId =
            "ORD-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();


        /*
         * Create order/chat data.
         */

        const orderData = {

            orderId:
                orderId,

            orderType:
                "product_order",

            status:
                "awaiting_seller_chat",


            /*
             * Buyer information.
             */

            buyerId:
                currentUser
                    ? currentUser.uid
                    : null,

            buyerName:
                currentUser
                    ? (
                        currentUser.displayName ||
                        currentUser.email?.split("@")[0] ||
                        "Buyer"
                    )
                    : "",

            buyerEmail:
                currentUser
                    ? (
                        currentUser.email ||
                        ""
                    )
                    : "",


            /*
             * Complete cart snapshot.
             */

            items:
                cart,


            /*
             * Products grouped by seller.
             */

            sellerGroups:
                totals.sellerGroups,


            /*
             * Financial totals.
             */

            subtotal:
                Number(
                    totals.subtotal || 0
                ),

            delivery:
                Number(
                    totals.delivery || 0
                ),

            total:
                Number(
                    totals.total || 0
                ),


            /*
             * Timestamps.
             */

            createdAt:
                Date.now(),

            updatedAt:
                Date.now()

        };


        /*
         * Save order for chat.html.
         */

        sessionStorage.setItem(
            "pendingOrderChat",
            JSON.stringify(
                orderData
            )
        );


        /*
         * Keep compatibility with the
         * existing checkout system.
         */

        sessionStorage.setItem(
            CHECKOUT_DATA_KEY,
            JSON.stringify(
                orderData
            )
        );


        /*
         * ==================================================
         * BUYER NOT LOGGED IN
         * ==================================================
         */

        if(!currentUser){

            const returnUrl =
                window.location.pathname +
                window.location.search +
                window.location.hash;


            sessionStorage.setItem(
                CHECKOUT_RETURN_KEY,
                returnUrl
            );


            sessionStorage.setItem(
                "afterLoginAction",
                "orderChat"
            );


            window.location.href =
                "login.html?returnTo=order-chat";


            return;

        }


        /*
         * ==================================================
         * BUYER IS LOGGED IN
         * ==================================================
         *
         * No proceedToCheckout() call anymore.
         */

        startOrderChat();

    }
    catch(error){

        console.error(
            "START ORDER ERROR:",
            error
        );


        showCartMessage(
            "Unable to start your order. Please try again.",
            "error"
        );

    }

}




/* ==========================================================
   START ORDER CHAT
========================================================== */

function startOrderChat(){

    try{

        /*
         * Buyer must be authenticated.
         */

        if(!currentUser){

            sessionStorage.setItem(
                "afterLoginAction",
                "orderChat"
            );


            window.location.href =
                "login.html?returnTo=order-chat";


            return;

        }


        /*
         * Get the latest cart.
         */

        const cart =
            getNormalizedCart();


        if(
            !Array.isArray(cart) ||
            cart.length === 0
        ){

            showCartMessage(
                "Your cart is empty.",
                "error"
            );

            return;

        }


        /*
         * Calculate seller groups.
         */

        const totals =
            calculateCartTotals();


        if(
            !Array.isArray(
                totals.sellerGroups
            ) ||
            totals.sellerGroups.length === 0
        ){

            showCartMessage(
                "No seller products were found.",
                "error"
            );

            return;

        }


        let orderData = null;


        try{

            const stored =
                sessionStorage.getItem(
                    "pendingOrderChat"
                );


            if(stored){

                orderData =
                    JSON.parse(
                        stored
                    );

            }

        }
        catch(error){

            console.warn(
                "Unable to read pending order:",
                error
            );

        }


        /*
         * If there is no pending order,
         * create one now.
         */

        if(
            !orderData ||
            typeof orderData !== "object"
        ){

            const orderId =
                "ORD-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();


            orderData = {

                orderId:
                    orderId,

                orderType:
                    "product_order",

                status:
                    "awaiting_seller_chat",

                buyerId:
                    currentUser.uid,

                buyerName:
                    currentUser.displayName ||
                    currentUser.email?.split("@")[0] ||
                    "Buyer",

                buyerEmail:
                    currentUser.email ||
                    "",

                items:
                    cart,

                sellerGroups:
                    totals.sellerGroups,

                subtotal:
                    Number(
                        totals.subtotal || 0
                    ),

                delivery:
                    Number(
                        totals.delivery || 0
                    ),

                total:
                    Number(
                        totals.total || 0
                    ),

                createdAt:
                    Date.now(),

                updatedAt:
                    Date.now()

            };


            sessionStorage.setItem(
                "pendingOrderChat",
                JSON.stringify(
                    orderData
                )
            );

        }


        /*
         * Make absolutely sure the current
         * buyer ID is attached.
         */

        orderData.buyerId =
            currentUser.uid;


        orderData.buyerName =
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "Buyer";


        orderData.buyerEmail =
            currentUser.email ||
            "";


        /*
         * Save the updated order.
         */

        sessionStorage.setItem(
            "pendingOrderChat",
            JSON.stringify(
                orderData
            )
        );


        /*
         * Remove login continuation flag.
         */

        sessionStorage.removeItem(
            "afterLoginAction"
        );


        /*
         * Open chat.
         */

        window.location.href =
            "payment.html";


    }
    catch(error){

        console.error(
            "START ORDER CHAT ERROR:",
            error
        );


        showCartMessage(
            "Unable to open order chat. Please try again.",
            "error"
        );

    }

}


/* ==========================================================
   GET CHECKOUT RETURN URL
========================================================== */

function getCheckoutReturnUrl(){

    try{

        return (
            sessionStorage.getItem(
                CHECKOUT_RETURN_KEY
            ) ||
            "cart.html"
        );

    }
    catch(error){

        console.error(
            "Unable to read checkout return URL:",
            error
        );


        return "cart.html";

    }

}


function getPendingCheckout(){

    try{

        const stored =
            sessionStorage.getItem(
                CHECKOUT_DATA_KEY
            );


        if(!stored){

            return null;

        }


        const data =
            JSON.parse(
                stored
            );


        if(
            !data ||
            typeof data !== "object"
        ){

            return null;

        }


        return data;

    }
    catch(error){

        console.error(
            "Unable to read pending checkout:",
            error
        );


        return null;

    }

}


/* ==========================================================
   CLEAR PENDING CHECKOUT
========================================================== */

function clearPendingCheckout(){

    try{

        sessionStorage.removeItem(
            CHECKOUT_DATA_KEY
        );

    }
    catch(error){

        console.error(
            "Unable to clear pending checkout:",
            error
        );

    }

}


/* ==========================================================
   INITIALIZE CART EVENTS
========================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            setupCartEvents();

        },
        {
            once: true
        }
    );

}
else{

    setupCartEvents();

}


function renderCart(){

    try{

        const container =
            document.getElementById(
                "cartItems"
            );


        /*
         * Cart page may not contain the
         * cart container.
         *
         * This is not an error.
         */

        if(!container){

            updateGlobalCartCount();

            return;

        }


        /*
         * Get seller groups.
         */

        const sellerGroups =
            groupCartBySeller();


        /*
         * EMPTY CART
         */

        if(
            !Array.isArray(sellerGroups) ||
            sellerGroups.length === 0
        ){

            container.innerHTML = `

                <div class="empty-cart">

                    <div
                        class="empty-cart-icon"
                        aria-hidden="true"
                    >
                        🛒
                    </div>


                    <h2>
                        Your cart is empty
                    </h2>


                    <p>
                        Add products to your cart
                        to see them here.
                    </p>


                    <a
                        href="index.html"
                        class="continue-shopping"
                    >
                        Continue Shopping
                    </a>

                </div>

            `;


            /*
             * Reset totals.
             */

            updateCartSummary({

                sellerGroups: [],

                subtotal: 0,

                delivery: 0,

                total: 0

            });


            /*
             * Disable checkout.
             */

            updateCheckoutButton();


            /*
             * Update header count.
             */

            updateGlobalCartCount();


            /*
             * Update page state.
             */

            document.body.classList.add(
                "cart-is-empty"
            );

            document.body.classList.remove(
                "cart-has-items"
            );


            hideCartLoader();


            return;

        }


        /*
         * BUILD SELLER SECTIONS
         */

        const html =
            sellerGroups
                .map(
                    function(
                        sellerGroup,
                        sellerIndex
                    ){

                        return createSellerGroup(
                            sellerGroup,
                            sellerIndex
                        );

                    }
                )
                .join("");


        /*
         * Display products.
         */

        container.innerHTML =
            html;


        /*
         * Calculate totals.
         */

        const totals =
            calculateCartTotals();


        /*
         * Update totals on page.
         */

        updateCartSummary(
            totals
        );


        /*
         * Update checkout state.
         */

        updateCheckoutButton();


        /*
         * Update header count.
         */

        updateGlobalCartCount();


        /*
         * Update body classes.
         */

        document.body.classList.remove(
            "cart-is-empty"
        );

        document.body.classList.add(
            "cart-has-items"
        );


        /*
         * Update buyer information.
         */

        updateBuyerHeader();

        updateLoginStatus();


        /*
         * Hide loader only after
         * cart content is ready.
         */

        hideCartLoader();


        return totals;

    }
    catch(error){

        console.error(
            "Cart render failed:",
            error
        );


        showCartError();


        updateGlobalCartCount();


        hideCartLoader();


        return null;

    }

}



/* ==========================================================
   SYNCHRONIZE PRODUCT CART WITH FIREBASE
========================================================== */

async function synchronizeProductCartWithFirebase(){

   
    if(!currentUser){

        return false;

    }


    /*
     * Make sure Firestore is available.
     */

    if(!db){

        console.warn(
            "Firebase database is unavailable."
        );

        return false;

    }


    const localCart =
        getNormalizedCart();


    /*
     * No products to synchronize.
     */

    if(
        !Array.isArray(localCart) ||
        localCart.length === 0
    ){

        return true;

    }


    try{

        const {
            doc,
            getDoc,
            setDoc
        } = await import(
            "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js"
        );


        /*
         * Synchronize every product.
         */

        for(
            const product
            of localCart
        ){

            if(
                !product ||
                !product.id
            ){

                continue;

            }


            const cartReference =
                doc(
                    db,
                    "users",
                    currentUser.uid,
                    "cart",
                    String(
                        product.id
                    )
                );


            const snapshot =
                await getDoc(
                    cartReference
                );


            /*
             * Existing Firebase product.
             */

            if(snapshot.exists()){

                const firebaseData =
                    snapshot.data();


                const firebaseQuantity =
                    Math.max(
                        1,
                        Number(
                            firebaseData.quantity
                        ) || 1
                    );


                const localQuantity =
                    Math.max(
                        1,
                        Number(
                            product.quantity
                        ) || 1
                    );


                /*
                 * Do not duplicate quantities
                 * when authentication fires again.
                 */

                const finalQuantity =
                    Math.max(
                        firebaseQuantity,
                        localQuantity
                    );


                await setDoc(
                    cartReference,
                    {

                        ...product,

                        id:
                            String(
                                product.id
                            ),

                        quantity:
                            finalQuantity,

                        buyerId:
                            currentUser.uid,

                        updatedAt:
                            Date.now(),

                        syncedAt:
                            Date.now()

                    },
                    {
                        merge: true
                    }
                );

            }


            /*
             * New Firebase product.
             */

            else{

                await setDoc(
                    cartReference,
                    {

                        ...product,

                        id:
                            String(
                                product.id
                            ),

                        quantity:
                            Math.max(
                                1,
                                Number(
                                    product.quantity
                                ) || 1
                            ),

                        buyerId:
                            currentUser.uid,

                        createdAt:
                            Date.now(),

                        updatedAt:
                            Date.now(),

                        syncedAt:
                            Date.now()

                    },
                    {
                        merge: true
                    }
                );

            }

        }


        console.log(
            "Cart synchronized with Firebase."
        );


        return true;

    }
    catch(error){

        console.error(
            "Cart Firebase synchronization failed:",
            error
        );


        return false;

    }

}


function showCartMessage(
    message,
    type = "success"
){

    try{

        const oldMessage =
            document.querySelector(
                ".cart-message"
            );


        if(oldMessage){

            oldMessage.remove();

        }


        const element =
            document.createElement(
                "div"
            );


        element.className =
            `cart-message cart-message-${type}`;


        element.textContent =
            String(
                message || ""
            );


        Object.assign(
            element.style,
            {

                position:
                    "fixed",

                left:
                    "50%",

                bottom:
                    "80px",

                transform:
                    "translateX(-50%)",

                zIndex:
                    "99999",

                padding:
                    "12px 18px",

                borderRadius:
                    "8px",

                background:
                    type === "error"
                        ? "#dc2626"
                        : "#16a34a",

                color:
                    "#ffffff",

                fontSize:
                    "14px",

                fontWeight:
                    "600",

                boxShadow:
                    "0 4px 15px rgba(0,0,0,0.2)",

                maxWidth:
                    "90%",

                textAlign:
                    "center",

                opacity:
                    "0",

                transition:
                    "opacity 0.25s ease"

            }
        );


        document.body.appendChild(
            element
        );


        requestAnimationFrame(
            function(){

                element.style.opacity =
                    "1";

            }
        );


        setTimeout(
            function(){

                element.style.opacity =
                    "0";


                setTimeout(
                    function(){

                        if(
                            element.parentNode
                        ){

                            element.remove();

                        }

                    },
                    300
                );

            },
            3000
        );

    }
    catch(error){

        console.error(
            "Unable to show cart message:",
            error
        );

    }

}


async function initializeFinalCartPage(){

    try{

        
        renderCart();


        updateGlobalCartCount();


        /*
         * Update guest/login header.
         */

        updateBuyerHeader();

        updateLoginStatus();


        
        if(
            authReady &&
            currentUser
        ){

            await synchronizeProductCartWithFirebase();

        }


        /*
         * Cart can now be displayed.
         */

        hideCartLoader();

    }
    catch(error){

        console.error(
            "Final cart initialization failed:",
            error
        );


        /*
         * Even if Firebase fails,
         * the guest cart should remain usable.
         */

        renderCart();

        updateGlobalCartCount();

        hideCartLoader();

    }

}


/* ==========================================================
   CART STORAGE CHANGE LISTENER
========================================================== */

window.addEventListener(
    "yourStoreCartUpdated",
    function(){

        /*
         * Refresh only the visual cart count.
         *
         * Avoid recursive full rendering.
         */

        updateGlobalCartCount();

    }
);


/* ==========================================================
   CROSS-TAB CART UPDATE
========================================================== */

window.addEventListener(
    "storage",
    function(event){

        if(
            event.key !==
            CART_STORAGE_KEY
        ){

            return;

        }


        /*
         * Another browser tab changed
         * the cart.
         */

        updateGlobalCartCount();


        /*
         * If this is the cart page,
         * refresh the displayed products.
         */

        if(
            document.getElementById(
                "cartItems"
            )
        ){

            renderCart();

        }

    }
);


/* ==========================================================
   START FINAL CART PAGE
========================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            initializeFinalCartPage();

        },
        {
            once: true
        }
    );

}
else{

    initializeFinalCartPage();

}
         
