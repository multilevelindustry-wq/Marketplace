/* ==========================================================
   PRODUCT.JS
   CLEAN PRODUCT PAGE SYSTEM
   PART 1 OF 5
========================================================== */


/* ==========================================================
   FIREBASE
========================================================== */

import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


/* ==========================================================
   CART STORAGE
   IMPORTANT:
   This MUST match cart.js
========================================================== */

const CART_STORAGE_KEY = "yourStoreCart";


/* ==========================================================
   PRODUCT STATE
========================================================== */

let currentProduct = null;
let currentProductId = null;
let currentUser = null;

let productQuantity = 1;



/* ==========================================================
   LOAD SELLER INFORMATION
========================================================== */

async function loadNewSellerInformation(sellerId) {

    const sellerPhoto =
        document.getElementById(
            "newSellerPhoto"
        );

    const sellerName =
        document.getElementById(
            "newSellerName"
        );

    const sellerLocation =
        document.getElementById(
            "newSellerLocation"
        );

    const sellerButton =
        document.getElementById(
            "newSellerStoreButton"
        );

    const loading =
        document.getElementById(
            "newSellerLoading"
        );

    const errorBox =
        document.getElementById(
            "newSellerError"
        );


    if (!sellerId) {

        if (loading) {

            loading.style.display =
                "none";

        }

        if (errorBox) {

            errorBox.style.display =
                "block";

        }

        return;

    }


    try {

        const sellerRef =
            doc(
                db,
                "users",
                sellerId
            );


        const sellerSnapshot =
            await getDoc(
                sellerRef
            );


        if (!sellerSnapshot.exists()) {

            throw new Error(
                "Seller account not found."
            );

        }


        const sellerData =
            sellerSnapshot.data();


        /* ==================================================
           SELLER NAME
        ================================================== */

        const name =
            sellerData.storeName ||
            sellerData.name ||
            sellerData.fullName ||
            sellerData.displayName ||
            "Seller";


        /* ==================================================
           SELLER PHOTO
        ================================================== */

        const photo =
            sellerData.storePhoto ||
            sellerData.sellerStorePhoto ||
            sellerData.storeImage ||
            sellerData.photoURL ||
            sellerData.profilePhoto ||
            sellerData.image ||
            "images/default-avatar.png";


        /* ==================================================
           SELLER LOCATION
        ================================================== */

        const location =
            sellerData.location ||
            sellerData.storeLocation ||
            sellerData.address ||
            sellerData.city ||
            "Location unavailable";


        /* ==================================================
           DISPLAY NAME
        ================================================== */

        if (sellerName) {

            sellerName.textContent =
                name;

        }


        /* ==================================================
           DISPLAY PHOTO
        ================================================== */

        if (sellerPhoto) {

            sellerPhoto.src =
                photo;

            sellerPhoto.onerror =
                function() {

                    this.src =
                        "images/default-avatar.png";

                };

        }


        /* ==================================================
           DISPLAY LOCATION
        ================================================== */

        if (sellerLocation) {

            sellerLocation.textContent =
                "📍 " + location;

        }


        /* ==================================================
           STORE LINK
        ================================================== */

        if (sellerButton) {

            sellerButton.href =
                "shop.html?sellerId=" +
                encodeURIComponent(
                    sellerId
                );

        }


        /* ==================================================
           HIDE LOADING
        ================================================== */

        if (loading) {

            loading.style.display =
                "none";

        }


        if (errorBox) {

            errorBox.style.display =
                "none";

        }


    } catch (error) {

        console.error(
            "Seller information loading error:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        if (errorBox) {

            errorBox.style.display =
                "block";

        }

    }

}


/* ==========================================================
   WAIT FOR FIREBASE AUTHENTICATION
   SAFE VERSION
========================================================== */

function waitForAuthentication(){

    return new Promise(resolve => {

        let resolved = false;

        let unsubscribe = null;


        /* --------------------------------------------------
           FINISH ONLY ONCE
        -------------------------------------------------- */

        function finish(user){

            if(resolved){

                return;

            }


            resolved = true;


            if(
                typeof unsubscribe ===
                "function"
            ){

                try{

                    unsubscribe();

                }catch(error){

                    console.warn(
                        "AUTH UNSUBSCRIBE ERROR:",
                        error
                    );

                }

            }


            resolve(
                user || null
            );

        }


        /* --------------------------------------------------
           FIREBASE AUTH LISTENER
        -------------------------------------------------- */

        try{

            unsubscribe =
                onAuthStateChanged(
                    auth,
                    function(user){

                        console.log(
                            "FIREBASE AUTH READY"
                        );


                        finish(user);

                    }
                );


        }catch(error){

            console.error(
                "FIREBASE AUTH ERROR:",
                error
            );


            finish(null);

            return;

        }


        /* --------------------------------------------------
           SAFETY TIMEOUT
        -------------------------------------------------- */

        setTimeout(
            function(){

                if(!resolved){

                    console.warn(
                        "AUTH TIMEOUT - CONTINUING AS GUEST"
                    );


                    finish(null);

                }

            },
            5000
        );

    });

}


/* ==========================================================
   LOAD SELLER INFORMATION
========================================================== */

async function loadProductSellerInformation(
    sellerUid,
    sellerNameFromProduct = ""
){

    const sellerPhoto =
        document.getElementById(
            "productSellerPhoto"
        );

    const sellerName =
        document.getElementById(
            "productSellerName"
        );

    const sellerLocation =
        document.getElementById(
            "productSellerLocation"
        );

    const sellerStatus =
        document.getElementById(
            "productSellerStatus"
        );

    const sellerLink =
        document.getElementById(
            "productSellerLink"
        );


    /* ======================================================
       CHECK ELEMENTS
    ====================================================== */

    if(!sellerPhoto){

        console.error(
            "productSellerPhoto element not found."
        );

    }


    if(!sellerUid){

        console.error(
            "No seller UID was provided."
        );

        return;

    }


    try {

        /* ==================================================
           GET SELLER DOCUMENT
        ================================================== */

        const sellerRef =
            doc(
                db,
                "users",
                sellerUid
            );


        const sellerSnapshot =
            await getDoc(
                sellerRef
            );


        if(!sellerSnapshot.exists()){

            console.error(
                "Seller document does not exist:",
                sellerUid
            );

            return;

        }


        const sellerData =
            sellerSnapshot.data();


        console.log(
            "PRODUCT PAGE SELLER DATA:",
            sellerData
        );


        /* ==================================================
           SELLER NAME
        ================================================== */

        const name =
            sellerData.storeName ||
            sellerData.sellerStoreName ||
            sellerData.displayName ||
            sellerData.name ||
            sellerNameFromProduct ||
            "Seller";


        if(sellerName){

            sellerName.textContent =
                name;

        }


        /* ==================================================
           STORE PHOTO

           Try all possible photo fields.
        ================================================== */

        const storePhoto =
            sellerData.storePhoto ||
            sellerData.storePhotoURL ||
            sellerData.storeImage ||
            sellerData.storeImageURL ||
            sellerData.sellerPhoto ||
            sellerData.sellerPhotoURL ||
            sellerData.profilePhoto ||
            sellerData.profilePhotoURL ||
            sellerData.photoURL ||
            sellerData.image ||
            sellerData.imageURL ||
            "";


        console.log(
            "PRODUCT PAGE SELLER PHOTO:",
            storePhoto
        );


        /* ==================================================
           DISPLAY STORE PHOTO
        ================================================== */

        if(
            sellerPhoto &&
            storePhoto
        ){

            sellerPhoto.src =
                storePhoto;

            sellerPhoto.alt =
                name;

        }
        else{

            console.warn(
                "No seller/store photo URL found."
            );

            if(sellerPhoto){

                sellerPhoto.src =
                    "default-avatar.png";

            }

        }


        /* ==================================================
           PHOTO ERROR FALLBACK
        ================================================== */

        if(sellerPhoto){

            sellerPhoto.onerror =
                function(){

                    console.error(
                        "Seller image failed to load:",
                        this.src
                    );

                    this.onerror =
                        null;

                    this.src =
                        "default-avatar.png";

                };

        }


        /* ==================================================
           SELLER LOCATION
        ================================================== */

        const location =
            sellerData.location ||
            sellerData.storeLocation ||
            sellerData.storeAddress ||
            sellerData.address ||
            sellerData.city ||
            sellerData.state ||
            "";


        if(sellerLocation){

            if(location){

                sellerLocation.textContent =
                    "📍 " + location;

            }
            else{

                sellerLocation.textContent =
                    "📍 Location unavailable";

            }

        }


        /* ==================================================
           SELLER STATUS
        ================================================== */

        if(sellerStatus){

            if(
                sellerData.verified === true ||
                sellerData.isVerified === true ||
                sellerData.sellerVerified === true
            ){

                sellerStatus.textContent =
                    "Verified Seller";

            }
            else{

                sellerStatus.textContent =
                    "Seller";

            }

        }


        /* ==================================================
           VISIT STORE
        ================================================== */

        if(sellerLink){

            sellerLink.href =
                "shop.html?seller=" +
                encodeURIComponent(
                    sellerUid
                );

        }

    }
    catch(error){

        console.error(
            "Seller information loading error:",
            error
        );

    }

}



/* ==========================================================
   LOAD MORE PRODUCTS FROM THIS SELLER
========================================================== */

async function loadSellerProducts(){

    const section =
        document.getElementById(
            "sellerProductsSection"
        );


    const container =
        document.getElementById(
            "sellerProducts"
        );


    if(!section || !container){

        return;

    }


    /*
     * Hide initially.
     */

    section.style.display =
        "none";


    try{

        /*
         * Current product seller ID.
         *
         * Change this if your product uses
         * another seller field.
         */

        const sellerId =
            currentProduct?.sellerId ||
            currentProduct?.sellerUID ||
            currentProduct?.sellerUid ||
            currentProduct?.seller?.uid;


        if(!sellerId){

            container.innerHTML =
                "";

            return;

        }


        const productsReference =
            collection(
                db,
                "products"
            );


        const sellerQuery =
            query(
                productsReference,
                where(
                    "sellerId",
                    "==",
                    sellerId
                ),
                limit(12)
            );


        const snapshot =
            await getDocs(
                sellerQuery
            );


        const products = [];


        snapshot.forEach(
            function(documentSnapshot){

                /*
                 * Don't show the product
                 * currently being viewed.
                 */

                if(
                    currentProduct?.id ===
                    documentSnapshot.id
                ){

                    return;

                }


                products.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        /*
         * NO OTHER PRODUCTS FROM SELLER
         */

        if(!products.length){

            container.innerHTML =
                "";

            section.style.display =
                "none";

            return;

        }


        /*
         * RENDER SELLER PRODUCTS
         */

        container.innerHTML =
            products
                .map(
                    product =>
                        createViewedProductCard(
                            product
                        )
                )
                .join("");


        /*
         * SHOW ONLY AFTER
         * PRODUCTS EXIST.
         */

        section.style.display =
            "";


    }catch(error){

        console.error(
            "LOAD SELLER PRODUCTS ERROR:",
            error
        );


        container.innerHTML =
            "";

        section.style.display =
            "none";

    }

}




/* ==========================================================
   LOAD MOST VIEWED PRODUCTS
========================================================== */

async function loadMostViewedProducts(){

    /* --------------------------------------------------
       GET HTML ELEMENTS
    -------------------------------------------------- */

    const container =
        document.getElementById(
            "mostViewedProducts"
        );


    const section =
        document.getElementById(
            "mostViewedSection"
        );


    /* --------------------------------------------------
       SECTION DOES NOT EXIST
    -------------------------------------------------- */

    if(!container){

        return;

    }


    try{

        /* --------------------------------------------------
           GET TODAY'S DATE
        -------------------------------------------------- */

        const today =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


        /* --------------------------------------------------
           FIREBASE COLLECTION
        -------------------------------------------------- */

        const productsReference =
            collection(
                db,
                "dailyProductViews",
                today,
                "products"
            );


        /* --------------------------------------------------
           MOST VIEWED QUERY
        -------------------------------------------------- */

        const mostViewedQuery =
            query(
                productsReference,
                orderBy(
                    "views",
                    "desc"
                ),
                limit(12)
            );


        /* --------------------------------------------------
           GET FIREBASE DATA
        -------------------------------------------------- */

        const snapshot =
            await getDocs(
                mostViewedQuery
            );


        const products = [];


        /* --------------------------------------------------
           BUILD PRODUCT ARRAY
        -------------------------------------------------- */

        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                products.push({

                    id:
                        documentSnapshot.id,

                    ...data

                });

            }
        );


        /* --------------------------------------------------
           NO PRODUCTS
        -------------------------------------------------- */

        if(
            products.length === 0
        ){

            container.innerHTML =
                "";


            if(section){

                section.style.display =
                    "none";

            }


            return;

        }


        /* --------------------------------------------------
           SHOW SECTION
        -------------------------------------------------- */

        if(section){

            section.style.display =
                "";

        }


        /* --------------------------------------------------
           RENDER PRODUCTS
        -------------------------------------------------- */

        container.innerHTML =
            products
                .map(
                    product => {

                        return createMostViewedProductCard(
                            product
                        );

                    }
                )
                .join("");


        /* --------------------------------------------------
           UPDATE REFRESH TIMER
        -------------------------------------------------- */

        updateMostViewedRefreshText();


    }catch(error){

        console.error(
            "LOAD MOST VIEWED PRODUCTS ERROR:",
            error
        );


        /* --------------------------------------------------
           FAIL SAFELY
           This section must NEVER stop the
           product page from loading.
        -------------------------------------------------- */

        if(container){

            container.innerHTML =
                "";

        }


        if(section){

            section.style.display =
                "none";

        }

    }

}


/* ==========================================================
   CREATE MOST VIEWED PRODUCT CARD
========================================================== */

function createMostViewedProductCard(product){

    if(!product){

        return "";

    }


    const productId =
        product.productId ||
        product.id ||
        "";


    if(!productId){

        return "";

    }


    const name =
        product.productName ||
        product.name ||
        "Product";


    const image =
        product.image ||
        product.mainImage ||
        (
            Array.isArray(
                product.images
            )
                ? product.images[0]
                : ""
        ) ||
        "images/product-placeholder.jpg";


    const price =
        getProductPrice(
            product
        );


    const views =
        Math.max(
            0,
            Number(
                product.views || 0
            )
        );


    return `

        <article
            class="related-product-card"
            data-product-id="${escapeProductAttribute(
                productId
            )}"
        >

            <a
                href="product.html?id=${encodeURIComponent(
                    productId
                )}"
                class="related-product-image"
            >

                <img
                    src="${escapeProductAttribute(
                        image
                    )}"
                    alt="${escapeProductAttribute(
                        name
                    )}"
                    loading="lazy"
                >


                <span
                    class="related-product-badge"
                >
                    Trending
                </span>

            </a>


            <div
                class="related-product-info"
            >

                <div
                    class="related-product-name"
                >
                    ${escapeProductHTML(name)}
                </div>


                <div
                    class="related-product-price"
                >
                    ${formatNaira(price)}
                </div>


                <div
                    class="related-product-rating"
                >
                    ${views.toLocaleString()} views
                </div>

            </div>

        </article>

    `;

}


/* ==========================================================
   MOST VIEWED REFRESH TIMER
========================================================== */

function updateMostViewedRefreshText(){

    const element =
        document.getElementById(
            "mostViewedRefresh"
        );


    if(!element){

        return;

    }


    const tomorrow =
        new Date();


    tomorrow.setHours(
        24,
        0,
        0,
        0
    );


    const remaining =
        Math.max(
            0,
            tomorrow.getTime() -
            Date.now()
        );


    const hours =
        Math.floor(
            remaining /
            3600000
        );


    const minutes =
        Math.floor(
            (
                remaining %
                3600000
            ) /
            60000
        );


    element.textContent =
        `Refreshes in ${hours}h ${minutes}m`;

}



/* ==========================================================
   LOAD PRODUCT WITH TIMEOUT
========================================================== */

async function loadProductWithTimeout(
    timeout = 10000
){

    try{

        const result =
            await Promise.race([

                loadProduct(),

                new Promise(
                    resolve => {

                        setTimeout(
                            () => {

                                console.error(
                                    "PRODUCT LOAD TIMEOUT"
                                );


                                resolve(false);

                            },
                            timeout
                        );

                    }
                )

            ]);


        return result === true;


    }catch(error){

        console.error(
            "LOAD PRODUCT TIMEOUT ERROR:",
            error
        );


        return false;

    }

}








async function initializeProductPage(){

    console.log(
        "===== PRODUCT PAGE START ====="
    );


    try{

        const params =
            new URLSearchParams(
                window.location.search
            );


        currentProductId =
            params.get("id");


        if(!currentProductId){

            showProductNotFound();

            return;

        }


        /* ----------------------------------------------
           AUTH
        ---------------------------------------------- */

        currentUser =
            await waitForAuthentication();


        console.log(
            "PRODUCT USER:",
            currentUser
        );


        /* ----------------------------------------------
           PRODUCT
        ---------------------------------------------- */

        const loaded =
            await loadProduct();


        if(!loaded){

            return;

        }


        /* ----------------------------------------------
           CONTROLS
        ---------------------------------------------- */

        initializeProductQuantity();

        initializeProductPurchaseActions();

        initializeProductCartEvents();
        
        initializeProductBuyerAuthentication();
        
        


        /* ----------------------------------------------
           CART
        ---------------------------------------------- */

        updateProductCartCount();


        /* ----------------------------------------------
           OPTIONAL DATA
        ---------------------------------------------- */

        await recordProductView();

        await loadBuyerViewedProducts();

        await loadMostViewedProducts();


        console.log(
            "===== PRODUCT PAGE READY ====="
        );


    }catch(error){

        console.error(
            "PRODUCT PAGE ERROR:",
            error
        );


    }finally{

        hideProductPageLoader();

    }
    
    loadSponsoredProducts();

loadSellerProducts();

loadRelatedCategories();

setTimeout(
    function(){

        hideEmptyProductSections();

    },
    0
);

}




/* ==========================================================
   LOAD PRODUCT
========================================================== */

async function loadProduct(){

    if(!currentProductId){

        return false;

    }


    try {

        const productReference =
            doc(
                db,
                "products",
                currentProductId
            );


        const snapshot =
            await getDoc(
                productReference
            );


        if(!snapshot.exists()){

            console.error(
                "PRODUCT NOT FOUND:",
                currentProductId
            );


            showProductNotFound();

            return false;

        }


        currentProduct = {

            id:
                snapshot.id,

            ...snapshot.data()

        };


        console.log(
            "PRODUCT LOADED:",
            currentProduct
        );


        displayProductBasicInformation();


        return true;


    }catch(error){

        console.error(
            "PRODUCT LOAD ERROR:",
            error
        );


        showProductNotFound();


        return false;

    }

}


/* ==========================================================
   PRODUCT PRICE
========================================================== */

function getProductPrice(product){

    if(!product){

        return 0;

    }


    const possiblePrices = [

        product.buyerPrice,

        product.price,

        product.sellingPrice,

        product.salePrice,

        product.currentPrice

    ];


    for(
        const value of possiblePrices
    ){

        const number =
            Number(
                String(
                    value ?? ""
                )
                .replace(
                    /[₦,\s]/g,
                    ""
                )
            );


        if(
            Number.isFinite(number) &&
            number > 0
        ){

            return number;

        }

    }


    return 0;

}


/* ==========================================================
   AUTOMATIC OLD PRICE
========================================================== */

function getAutomaticOldPrice(price){

    const number =
        Number(price);


    if(
        !Number.isFinite(number) ||
        number <= 0
    ){

        return 0;

    }


    return Math.round(
        number * 1.20
    );

}


/* ==========================================================
   FORMAT NAIRA
========================================================== */

function formatNaira(amount){

    return "₦" +
        Number(
            amount || 0
        )
        .toLocaleString(
            "en-NG"
        );

}




/* ==========================================================
   LOAD BUYER VIEWED PRODUCTS
   SAFE VERSION
========================================================== */

async function loadBuyerViewedProducts(){

    const container =
        document.getElementById(
            "buyerViewedProducts"
        );

    const section =
        document.getElementById(
            "buyerViewedSection"
        );


    /* --------------------------------------------------
       CONTAINER DOES NOT EXIST
    -------------------------------------------------- */

    if(!container){

        return;

    }


    /* --------------------------------------------------
       GUEST USER
       No Firebase query needed.
    -------------------------------------------------- */

    if(!currentUser){

        container.innerHTML = "";

        if(section){

            section.style.display =
                "none";

        }

        return;

    }


    try{

        /* --------------------------------------------------
           FIREBASE COLLECTION
        -------------------------------------------------- */

        const viewedProductsReference =
            collection(
                db,
                "users",
                currentUser.uid,
                "viewedProducts"
            );


        /* --------------------------------------------------
           GET MOST RECENTLY VIEWED PRODUCTS
        -------------------------------------------------- */

        const viewedProductsQuery =
            query(
                viewedProductsReference,
                orderBy(
                    "viewedAt",
                    "desc"
                ),
                limit(12)
            );


        const snapshot =
            await getDocs(
                viewedProductsQuery
            );


        const products = [];


        /* --------------------------------------------------
           BUILD PRODUCT ARRAY
        -------------------------------------------------- */

        snapshot.forEach(
            documentSnapshot => {

                /*
                 * Don't show the product currently
                 * being viewed.
                 */

                if(
                    String(
                        documentSnapshot.id
                    ) ===
                    String(
                        currentProductId
                    )
                ){

                    return;

                }


                const data =
                    documentSnapshot.data();


                products.push({

                    id:
                        documentSnapshot.id,

                    ...data

                });

            }
        );


        /* --------------------------------------------------
           NO VIEW HISTORY
        -------------------------------------------------- */

        if(
            products.length === 0
        ){

            container.innerHTML = "";


            if(section){

                section.style.display =
                    "none";

            }


            return;

        }


        /* --------------------------------------------------
           SHOW SECTION
        -------------------------------------------------- */

        if(section){

            section.style.display =
                "";

        }


        /* --------------------------------------------------
           RENDER VIEWED PRODUCTS
        -------------------------------------------------- */

        container.innerHTML =
            products
                .map(
                    product =>
                        createViewedProductCard(
                            product
                        )
                )
                .join("");


    }catch(error){

        console.error(
            "LOAD BUYER VIEWED PRODUCTS ERROR:",
            error
        );


        /*
         * This section is optional.
         *
         * Never allow a Firebase query failure
         * to stop the main product page.
         */

        container.innerHTML = "";


        if(section){

            section.style.display =
                "none";

        }

    }

}




/* ==========================================================
   CREATE VIEWED PRODUCT CARD
========================================================== */

function createViewedProductCard(product){

    if(!product){

        return "";

    }


    /* --------------------------------------------------
       PRODUCT DATA
    -------------------------------------------------- */

    const productId =
        product.productId ||
        product.id ||
        "";

    if(!productId){

        return "";

    }


    const productName =
        product.productName ||
        product.name ||
        "Product";


    const image =
        product.image ||
        product.mainImage ||
        (
            Array.isArray(product.images)
                ? product.images[0] || ""
                : ""
        ) ||
        "images/product-placeholder.jpg";


    const price =
        getProductPrice(product);


    const rating =
        Number(
            product.rating || 0
        );


    const reviewCount =
        Number(
            product.reviewCount ??
            product.reviews ??
            0
        );


    /* --------------------------------------------------
       CARD
    -------------------------------------------------- */

    return `

        <article
            class="related-product-card viewed-product-card"
            data-product-id="${escapeProductAttribute(productId)}"
        >

            <!-- PRODUCT IMAGE -->

            <a
                href="product.html?id=${encodeURIComponent(productId)}"
                class="related-product-image"
                aria-label="View ${escapeProductAttribute(productName)}"
            >

                <img
                    src="${escapeProductAttribute(image)}"
                    alt="${escapeProductAttribute(productName)}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='images/product-placeholder.jpg';
                    "
                >

            </a>


            <!-- PRODUCT INFORMATION -->

            <div class="related-product-info">


                <!-- PRODUCT NAME -->

                <a
                    href="product.html?id=${encodeURIComponent(productId)}"
                    class="related-product-name"
                >

                    ${escapeProductHTML(productName)}

                </a>


                <!-- PRICE -->

                <div class="related-product-price">

                    ${formatNaira(price)}

                </div>


                <!-- RATING -->

                ${
                    rating > 0

                        ? `

                            <div class="related-product-rating">

                                <span class="rating-stars">
                                    ★
                                </span>

                                <span>
                                    ${rating.toFixed(1)}
                                </span>

                                ${
                                    reviewCount > 0

                                        ? `
                                            <span class="review-count">
                                                (${reviewCount.toLocaleString()})
                                            </span>
                                        `

                                        : ""
                                }

                            </div>

                        `

                        : ""
                }


            </div>

        </article>

    `;

}





/* ==========================================================
   GET PRODUCT IMAGE
========================================================== */

function getProductImage(product){

    if(!product){

        return "";

    }


    if(
        product.mainImage
    ){

        return product.mainImage;

    }


    if(
        product.image
    ){

        return product.image;

    }


    if(
        Array.isArray(
            product.images
        ) &&
        product.images.length
    ){

        return product.images[0];

    }


    return "images/product-placeholder.jpg";

}


/* ==========================================================
   DISPLAY PRODUCT BASIC INFORMATION
========================================================== */

function displayProductBasicInformation(){

    if(!currentProduct){

        return;

    }


    const product =
        currentProduct;


    const productName =
        product.name ||
        product.productName ||
        "Product";


    const category =
        product.category ||
        "Uncategorized";


    const price =
        getProductPrice(product);


    const oldPrice =
        Number(
            product.buyerOldPrice ??
            product.oldPrice ??
            getAutomaticOldPrice(price)
        );


    /* ------------------------------------------------------
       PAGE TITLE
    ------------------------------------------------------ */

    const title =
        document.getElementById(
            "productPageTitle"
        );


    if(title){

        title.textContent =
            productName;

    }


    /* ------------------------------------------------------
       META DESCRIPTION
    ------------------------------------------------------ */

    const meta =
        document.getElementById(
            "productMetaDescription"
        );


    if(meta){

        meta.content =
            product.shortDescription ||
            product.description ||
            `Buy ${productName} online.`;

    }


    /* ------------------------------------------------------
       PRODUCT NAME
    ------------------------------------------------------ */

    setText(
        "productName",
        productName
    );


    setText(
        "productBreadcrumbName",
        productName
    );


    /* ------------------------------------------------------
       CATEGORY
    ------------------------------------------------------ */

    setText(
        "productCategory",
        category
    );


    const categoryLink =
        document.getElementById(
            "productCategoryLink"
        );


    if(categoryLink){

        categoryLink.textContent =
            category;


        categoryLink.href =
            `category.html?category=${encodeURIComponent(
                category
            )}`;

    }


    /* ------------------------------------------------------
       PRICE
    ------------------------------------------------------ */

    setText(
        "productPrice",
        formatNaira(price)
    );


    /* ------------------------------------------------------
       OLD PRICE
    ------------------------------------------------------ */

    const oldPriceElement =
        document.getElementById(
            "productOldPrice"
        );


    if(oldPriceElement){

        if(
            oldPrice > price &&
            price > 0
        ){

            oldPriceElement.textContent =
                formatNaira(
                    oldPrice
                );


            oldPriceElement.style.display =
                "inline";

        }else{

            oldPriceElement.textContent =
                "";


            oldPriceElement.style.display =
                "none";

        }

    }


    /* ------------------------------------------------------
       DISCOUNT
    ------------------------------------------------------ */

    const discountElement =
        document.getElementById(
            "productDiscount"
        );


    if(discountElement){

        if(
            oldPrice > price &&
            oldPrice > 0
        ){

            const discount =
                Math.round(
                    (
                        (
                            oldPrice -
                            price
                        ) /
                        oldPrice
                    ) * 100
                );


            discountElement.textContent =
                `-${discount}%`;

        }else{

            discountElement.textContent =
                "";

        }

    }


    /* ------------------------------------------------------
       DESCRIPTION
    ------------------------------------------------------ */

    setText(
        "productShortDescription",
        product.shortDescription ||
        product.description ||
        "No short description available."
    );


    setText(
        "productDescription",
        product.description ||
        "No product description available."
    );


    /* ------------------------------------------------------
       RATING
    ------------------------------------------------------ */

    const rating =
        Number(
            product.rating || 0
        );


    setText(
        "productRating",
        `★ ${rating.toFixed(1)}`
    );


    /* ------------------------------------------------------
       REVIEWS
    ------------------------------------------------------ */

    const reviewCount =
        Number(
            product.reviewCount ??
            product.reviews ??
            0
        );


    setText(
        "productReviews",
        `(${reviewCount.toLocaleString()} ${
            reviewCount === 1
                ? "review"
                : "reviews"
        })`
    );


    setText(
        "productReviewSummary",
        `${reviewCount.toLocaleString()} ${
            reviewCount === 1
                ? "review"
                : "reviews"
        }`
    );


    /* ------------------------------------------------------
       VIEWS
    ------------------------------------------------------ */

    const views =
        Number(
            product.views || 0
        );


    setText(
        "productViews",
        `${views.toLocaleString()} ${
            views === 1
                ? "view"
                : "views"
        }`
    );


    /* ------------------------------------------------------
       SELLER
    ------------------------------------------------------ */

    setText(
        "productSellerName",
        product.sellerName ||
        "Seller"
    );


    setText(
        "productSellerLocation",
        product.sellerLocation ||
        product.location ||
        "Location unavailable"
    );


    setText(
        "productSellerStatus",
        product.sellerVerified === true
            ? "Verified Seller"
            : "Seller"
    );


    const sellerPhoto =
        document.getElementById(
            "productSellerPhoto"
        );


    if(sellerPhoto){

        sellerPhoto.src =
            product.sellerPhoto ||
            "default-avatar.png";

    }


    const sellerLink =
        document.getElementById(
            "productSellerLink"
        );


    if(sellerLink){

        sellerLink.href =
            product.sellerId
                ? `Shop.html?sellerId=${encodeURIComponent(
                    product.sellerId
                )}`
                : "Shop.html";

    }


    /* ------------------------------------------------------
       IMAGES
    ------------------------------------------------------ */

    loadProductImages(
        product
    );


    /* ------------------------------------------------------
       VARIATIONS
    ------------------------------------------------------ */

    loadProductVariations(
        product
    );


    /* ------------------------------------------------------
       BADGES
    ------------------------------------------------------ */

    displayProductBadges(
        product
    );

}


/* ==========================================================
   UPDATE PRODUCT LOGIN STATUS
========================================================== */

function updateProductLoginStatus(){

    const loginElement =
        document.getElementById(
            "productLoginStatus"
        );


    if(!loginElement){

        return;

    }


    if(currentUser){

        const name =
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "Account";


        loginElement.textContent =
            name;


        loginElement.classList.add(
            "logged-in"
        );


    }else{

        loginElement.textContent =
            "Sign In";


        loginElement.classList.remove(
            "logged-in"
        );

    }

}


/* ==========================================================
   CART COUNT
   SINGLE SOURCE OF TRUTH
========================================================== */

function getLocalProductCart(){

    try {

        const stored =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if(!stored){

            return [];

        }


        const cart =
            JSON.parse(
                stored
            );


        return Array.isArray(cart)
            ? cart
            : [];


    }catch(error){

        console.error(
            "PRODUCT CART READ ERROR:",
            error
        );


        return [];

    }

}


/* ==========================================================
   CALCULATE CART QUANTITY
========================================================== */

function getProductCartQuantity(){

    const cart =
        getLocalProductCart();


    return cart.reduce(
        (
            total,
            item
        ) => {

            return total +
                Math.max(
                    0,
                    Number(
                        item?.quantity || 0
                    )
                );

        },
        0
    );

}


/* ==========================================================
   UPDATE PRODUCT CART ICON
========================================================== */

function updateProductCartCount(){

    const count =
        getProductCartQuantity();


    /*
     * Support multiple possible IDs
     * so the product page can work with
     * your existing header.
     */

    const elements = [

        document.getElementById(
            "productCartCount"
        ),

        document.getElementById(
            "cartCount"
        ),

        document.getElementById(
            "cartBadge"
        )

    ];


    elements.forEach(
        element => {

            if(!element){

                return;

            }


            element.textContent =
                count > 99
                    ? "99+"
                    : String(count);


            element.style.display =
                count > 0
                    ? ""
                    : "none";

        }
    );


    /*
     * Make the count available to
     * other YourStore scripts.
     */

    window.yourStoreCartCount =
        count;


    /*
     * Notify the rest of the website.
     */

    window.dispatchEvent(
        new CustomEvent(
            "yourStoreCartUpdated",
            {
                detail: {
                    cart:
                        getLocalProductCart(),

                    count
                }
            }
        )
    );

}


/* ==========================================================
   LISTEN FOR CART CHANGES
========================================================== */

window.addEventListener(
    "yourStoreCartUpdated",
    () => {

        updateProductCartCount();

    }
);


/* ==========================================================
   CROSS-TAB CART UPDATE
========================================================== */

window.addEventListener(
    "storage",
    event => {

        if(
            event.key ===
            CART_STORAGE_KEY
        ){

            updateProductCartCount();

        }

    }
);


/* ==========================================================
   SET TEXT SAFELY
========================================================== */

function setText(
    id,
    value
){

    const element =
        document.getElementById(
            id
        );


    if(element){

        element.textContent =
            value ?? "";

    }

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeProductHTML(value){

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
   ESCAPE ATTRIBUTE
========================================================== */

function escapeProductAttribute(value){

    return escapeProductHTML(
        value
    );

}


/* ==========================================================
   PRODUCT NOT FOUND
========================================================== */

function showProductNotFound(){

    const main =
        document.querySelector(
            ".product-page-main"
        );


    if(!main){

        return;

    }


    main.innerHTML = `

        <section class="product-not-found">

            <h1>
                Product Not Found
            </h1>

            <p>
                This product may have been removed
                or is no longer available.
            </p>

            <a href="index.html">
                Return to Home
            </a>

        </section>

    `;

}


/* ==========================================================
   HIDE PRODUCT PAGE LOADER
========================================================== */

/* ==========================================================
   HIDE PRODUCT PAGE LOADER
   FORCE HIDE
========================================================== */

function hideProductPageLoader(){

    const loader =
        document.getElementById(
            "productPageLoader"
        );


    console.log(
        "HIDING PRODUCT LOADER:",
        loader
    );


    if(!loader){

        console.warn(
            "productPageLoader ELEMENT NOT FOUND"
        );

        return;

    }


    /*
     * Remove loading state.
     */

    loader.classList.add(
        "hidden"
    );


    /*
     * Force it completely invisible.
     */

    loader.style.display =
        "none";


    loader.style.visibility =
        "hidden";


    loader.style.opacity =
        "0";


    loader.style.pointerEvents =
        "none";


    /*
     * Prevent the loader from
     * covering the product page.
     */

    loader.setAttribute(
        "aria-hidden",
        "true"
    );


    console.log(
        "===== PRODUCT LOADER HIDDEN ====="
    );

}



/* ==========================================================
   PRODUCT.JS
   PART 2 OF 5

   IMAGES
   VARIATIONS
   QUANTITY
   CART CREATION
   CART STORAGE
========================================================== */


/* ==========================================================
   PRODUCT IMAGE GALLERY
========================================================== */

function loadProductImages(product){

    const thumbnailList =
        document.getElementById(
            "productThumbnailList"
        );

    const mainImage =
        document.getElementById(
            "productMainImage"
        );


    if(
        !thumbnailList ||
        !mainImage
    ){

        return;

    }


    let images = [];


    /* ------------------------------------------------------
       PRODUCT IMAGES ARRAY
    ------------------------------------------------------ */

    if(
        Array.isArray(
            product.images
        )
    ){

        images =
            product.images.filter(
                image =>
                    typeof image === "string" &&
                    image.trim() !== ""
            );

    }


    /* ------------------------------------------------------
       FALLBACK IMAGE
    ------------------------------------------------------ */

    if(
        images.length === 0 &&
        product.mainImage
    ){

        images.push(
            product.mainImage
        );

    }


    if(
        images.length === 0 &&
        product.image
    ){

        images.push(
            product.image
        );

    }


    /* ------------------------------------------------------
       PLACEHOLDER
    ------------------------------------------------------ */

    if(
        images.length === 0
    ){

        images.push(
            "images/product-placeholder.jpg"
        );

    }


    /* ------------------------------------------------------
       MAIN IMAGE
    ------------------------------------------------------ */

    mainImage.src =
        images[0];


    mainImage.alt =
        product.name ||
        product.productName ||
        "Product";


    /* ------------------------------------------------------
       THUMBNAILS
    ------------------------------------------------------ */

    thumbnailList.innerHTML =
        images
            .map(
                (
                    image,
                    index
                ) => `

                    <button
                        type="button"
                        class="product-thumbnail ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                        data-image="${escapeProductAttribute(
                            image
                        )}"
                    >

                        <img
                            src="${escapeProductAttribute(
                                image
                            )}"
                            alt="${escapeProductAttribute(
                                product.name ||
                                "Product"
                            )}"
                            loading="lazy"
                        >

                    </button>

                `
            )
            .join("");


    /* ------------------------------------------------------
       THUMBNAIL EVENTS
    ------------------------------------------------------ */

    thumbnailList
        .querySelectorAll(
            ".product-thumbnail"
        )
        .forEach(
            thumbnail => {

                thumbnail.addEventListener(
                    "click",
                    function(){

                        const image =
                            this.dataset.image;


                        if(!image){

                            return;

                        }


                        mainImage.src =
                            image;


                        thumbnailList
                            .querySelectorAll(
                                ".product-thumbnail"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        this.classList.add(
                            "active"
                        );

                    }
                );

            }
        );

}


/* ==========================================================
   PRODUCT VARIATIONS
========================================================== */

function loadProductVariations(product){

    const container =
        document.getElementById(
            "productVariations"
        );


    if(!container){

        return;

    }


    container.innerHTML =
        "";


    const variations =
        product.variations;


    if(
        !variations ||
        typeof variations !== "object" ||
        Array.isArray(variations)
    ){

        return;

    }


    Object.entries(
        variations
    ).forEach(
        (
            [
                name,
                values
            ]
        ) => {

            if(
                !Array.isArray(values) ||
                values.length === 0
            ){

                return;

            }


            const group =
                document.createElement(
                    "div"
                );


            group.className =
                "product-variation-group";


            const title =
                document.createElement(
                    "strong"
                );


            title.className =
                "product-variation-title";


            title.textContent =
                name;


            group.appendChild(
                title
            );


            const options =
                document.createElement(
                    "div"
                );


            options.className =
                "product-variation-options";


            values.forEach(
                (
                    value,
                    index
                ) => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "product-variation-option";


                    button.textContent =
                        value;


                    button.dataset.variation =
                        name;


                    button.dataset.value =
                        value;


                    if(index === 0){

                        button.classList.add(
                            "selected"
                        );

                    }


                    button.addEventListener(
                        "click",
                        function(){

                            options
                                .querySelectorAll(
                                    ".product-variation-option"
                                )
                                .forEach(
                                    item => {

                                        item.classList.remove(
                                            "selected"
                                        );

                                    }
                                );


                            this.classList.add(
                                "selected"
                            );

                        }
                    );


                    options.appendChild(
                        button
                    );

                }
            );


            group.appendChild(
                options
            );


            container.appendChild(
                group
            );

        }
    );

}


/* ==========================================================
   GET SELECTED PRODUCT VARIATIONS
========================================================== */

function getSelectedProductVariations(){

    const selected = {};


    document
        .querySelectorAll(
            ".product-variation-option.selected"
        )
        .forEach(
            option => {

                const variation =
                    option.dataset.variation;


                const value =
                    option.dataset.value;


                if(
                    variation &&
                    value
                ){

                    selected[variation] =
                        value;

                }

            }
        );


    return selected;

}


/* ==========================================================
   PRODUCT QUANTITY
========================================================== */

function initializeProductQuantity(){

    const display =
        document.getElementById(
            "productQuantity"
        );


    const decrease =
        document.getElementById(
            "decreaseQuantity"
        );


    const increase =
        document.getElementById(
            "increaseQuantity"
        );


    if(
        !display ||
        !decrease ||
        !increase
    ){

        return;

    }


    productQuantity =
        1;


    display.textContent =
        productQuantity;


    /* ------------------------------------------------------
       DECREASE
    ------------------------------------------------------ */

    decrease.addEventListener(
        "click",
        () => {

            if(
                productQuantity <= 1
            ){

                return;

            }


            productQuantity--;


            display.textContent =
                productQuantity;

        }
    );


    /* ------------------------------------------------------
       INCREASE
    ------------------------------------------------------ */

    increase.addEventListener(
        "click",
        () => {

            const stock =
                Number(
                    currentProduct?.stock
                );


            const maximum =
                Number.isFinite(stock) &&
                stock > 0

                    ? stock

                    : 999;


            if(
                productQuantity >=
                maximum
            ){

                showCartMessage(
                    `Only ${maximum} item${
                        maximum === 1
                            ? ""
                            : "s"
                    } available.`
                );

                return;

            }


            productQuantity++;


            display.textContent =
                productQuantity;

        }
    );

}


/* ==========================================================
   GET CART STORAGE KEY
========================================================== */

function getProductCartStorageKey(){

    /*
     * Keep this identical to cart.js.
     */

    return "yourStoreCart";

}


/* ==========================================================
   READ LOCAL CART
========================================================== */

function readProductCart(){

    const storageKey =
        getProductCartStorageKey();


    try {

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


    }catch(error){

        console.error(
            "READ PRODUCT CART ERROR:",
            error
        );


        return [];

    }

}


/* ==========================================================
   SAVE LOCAL CART
========================================================== */

function saveProductCart(cart){

    const storageKey =
        getProductCartStorageKey();


    try {

        localStorage.setItem(
            storageKey,
            JSON.stringify(
                Array.isArray(cart)
                    ? cart
                    : []
            )
        );


        return true;


    }catch(error){

        console.error(
            "SAVE PRODUCT CART ERROR:",
            error
        );


        return false;

    }

}



/* ==========================================================
   CREATE UNIQUE CART ITEM KEY
========================================================== */

function createProductCartItemKey(
    productId,
    variations = {}
){

    const variationString =
        Object.keys(
            variations
        )
        .sort()
        .map(
            key =>
                `${key}:${variations[key]}`
        )
        .join("|");


    return (
        String(
            productId || ""
        ) +
        "::" +
        variationString
    );

}


/* ==========================================================
   CREATE PRODUCT CART ITEM
========================================================== */

function createProductCartItem(){

    if(!currentProduct){

        return null;

    }


    const price =
        getProductPrice(
            currentProduct
        );


    if(
        !Number.isFinite(price) ||
        price <= 0
    ){

        console.error(
            "INVALID PRODUCT PRICE:",
            currentProduct
        );


        return null;

    }


    const oldPrice =
        Number(
            currentProduct.buyerOldPrice ??
            currentProduct.oldPrice ??
            getAutomaticOldPrice(
                price
            )
        );


    const variations =
        getSelectedProductVariations();


    const productId =
        currentProduct.id;


    const cartItemKey =
        createProductCartItemKey(
            productId,
            variations
        );


    return {

        /* --------------------------------------------------
           IDENTIFICATION
        -------------------------------------------------- */

        id:
            productId,

        productId:
            productId,

        cartItemKey:
            cartItemKey,


        /* --------------------------------------------------
           PRODUCT
        -------------------------------------------------- */

        name:
            currentProduct.name ||
            currentProduct.productName ||
            "Product",

        productName:
            currentProduct.name ||
            currentProduct.productName ||
            "Product",

        image:
            getProductImage(
                currentProduct
            ),


        /* --------------------------------------------------
           PRICE
        -------------------------------------------------- */

        price:
            price,

        buyerPrice:
            price,

        oldPrice:
            oldPrice,

        buyerOldPrice:
            oldPrice,


        /* --------------------------------------------------
           CATEGORY
        -------------------------------------------------- */

        category:
            currentProduct.category ||
            "",


        /* --------------------------------------------------
           SELLER
        -------------------------------------------------- */

        sellerId:
            currentProduct.sellerId ||
            currentProduct.sellerID ||
            currentProduct.vendorId ||
            "",

        sellerName:
            currentProduct.sellerName ||
            "Seller",

        sellerStoreName:
            currentProduct.sellerStoreName ||
            currentProduct.storeName ||
            currentProduct.shopName ||
            currentProduct.sellerName ||
            "Seller Store",

        sellerPhoto:
            currentProduct.sellerPhoto ||
            "",

        sellerLocation:
            currentProduct.sellerLocation ||
            currentProduct.location ||
            "",


        /* --------------------------------------------------
           DELIVERY
        -------------------------------------------------- */

        deliveryPrice:
            Number(
                currentProduct.deliveryPrice ??
                currentProduct.deliveryFee ??
                currentProduct.shippingFee ??
                0
            ),

        deliveryOptions:
            currentProduct.deliveryOptions ||
            currentProduct.deliveryLocations ||
            {},


        /* --------------------------------------------------
           QUANTITY
        -------------------------------------------------- */

        quantity:
            Math.max(
                1,
                Number(
                    productQuantity || 1
                )
            ),


        /* --------------------------------------------------
           VARIATIONS
        -------------------------------------------------- */

        variations:
            variations,


        /* --------------------------------------------------
           TIMESTAMP
        -------------------------------------------------- */

        addedAt:
            Date.now()

    };

}


/* ==========================================================
   CHECK WHETHER TWO CART ITEMS ARE THE SAME
========================================================== */

function areProductCartItemsSame(
    first,
    second
){

    if(!first || !second){

        return false;

    }


    const firstProductId =
        String(
            first.productId ||
            first.id ||
            ""
        );


    const secondProductId =
        String(
            second.productId ||
            second.id ||
            ""
        );


    if(
        !firstProductId ||
        !secondProductId
    ){

        return false;

    }


    if(
        firstProductId !==
        secondProductId
    ){

        return false;

    }


    /*
     * Compare variations too.
     *
     * This allows:
     *
     * Shirt / Red / Large
     *
     * and
     *
     * Shirt / Blue / Large
     *
     * to remain separate cart items.
     */

    const firstVariations =
        first.variations || {};


    const secondVariations =
        second.variations || {};


    const firstKeys =
        Object.keys(
            firstVariations
        ).sort();


    const secondKeys =
        Object.keys(
            secondVariations
        ).sort();


    if(
        firstKeys.length !==
        secondKeys.length
    ){

        return false;

    }


    for(
        const key of firstKeys
    ){

        if(
            String(
                firstVariations[key]
            ) !==
            String(
                secondVariations[key]
            )
        ){

            return false;

        }

    }


    return true;

}


/* ==========================================================
   GET CART QUANTITY
========================================================== */

function getProductCartTotalQuantity(
    cart
){

    if(
        !Array.isArray(cart)
    ){

        return 0;

    }


    return cart.reduce(
        (
            total,
            item
        ) => {

            const quantity =
                Number(
                    item?.quantity || 0
                );


            if(
                !Number.isFinite(
                    quantity
                ) ||
                quantity < 0
            ){

                return total;

            }


            return total +
                quantity;

        },
        0
    );

}


/* ==========================================================
   NOTIFY CART SYSTEM
========================================================== */

function notifyProductCartUpdated(
    cart
){

    const safeCart =
        Array.isArray(cart)
            ? cart
            : [];


    const count =
        getProductCartTotalQuantity(
            safeCart
        );


    window.yourStoreCartCount =
        count;


    window.dispatchEvent(
        new CustomEvent(
            "yourStoreCartUpdated",
            {
                detail: {

                    cart:
                        safeCart,

                    count:
                        count

                }
            }
        )
    );


    /*
     * Also notify using the browser storage event
     * indirectly through localStorage.
     *
     * The normal "storage" event does not fire in
     * the same tab, so the CustomEvent above is the
     * important one.
     */

}


/* ==========================================================
   UPDATE PRODUCT CART ICON
========================================================== */

function updateProductCartIcon(){

    const cart =
        readProductCart();


    const count =
        getProductCartTotalQuantity(
            cart
        );


    const selectors = [

        "#productCartCount",

        "#cartCount",

        "#cartBadge",

        ".cart-count",

        ".cart-badge",

        "[data-cart-count]"

    ];


    const elements =
        document.querySelectorAll(
            selectors.join(",")
        );


    elements.forEach(
        element => {

            element.textContent =
                count > 99
                    ? "99+"
                    : String(count);


            /*
             * Do not hide the badge if your CSS
             * expects a permanent cart badge.
             */

            if(
                element.dataset.hideWhenEmpty ===
                "true"
            ){

                element.style.display =
                    count > 0
                        ? ""
                        : "none";

            }

        }
    );


    window.yourStoreCartCount =
        count;

}


/* ==========================================================
   SAVE + NOTIFY CART
========================================================== */

function saveAndNotifyProductCart(
    cart
){

    const saved =
        saveProductCart(
            cart
        );


    if(!saved){

        return false;

    }


    notifyProductCartUpdated(
        cart
    );


    updateProductCartIcon();


    return true;

}



/* ==========================================================
   CART SYSTEM
   PRODUCT.JS — PART 3
========================================================== */


/* ==========================================================
   GET LOCAL CART
========================================================== */

function getProductCart(){

    try {

        const storedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if(!storedCart){

            return [];

        }


        const cart =
            JSON.parse(
                storedCart
            );


        return Array.isArray(cart)
            ? cart
            : [];


    }catch(error){

        console.error(
            "GET PRODUCT CART ERROR:",
            error
        );

        return [];

    }

}



/* ==========================================================
   UPDATE ALL CART ICONS
========================================================== */

function updateProductCartIcons(){

    const cart =
        getProductCart();


    const count =
        getProductCartQuantity(
            cart
        );


    /*
     * Store globally so other
     * YOURSTORE scripts can use it.
     */

    window.yourStoreCartCount =
        count;


    /*
     * Possible cart count IDs.
     */

    const selectors = [

        "#productCartCount",

        "#cartCount",

        "#headerCartCount",

        "#buyerCartCount",

        ".cart-count",

        ".cart-badge"

    ];


    const elements = [];


    selectors.forEach(
        selector => {

            document
                .querySelectorAll(
                    selector
                )
                .forEach(
                    element => {

                        if(
                            !elements.includes(
                                element
                            )
                        ){

                            elements.push(
                                element
                            );

                        }

                    }
                );

        }
    );


    elements.forEach(
        element => {

            element.textContent =
                count > 99
                    ? "99+"
                    : String(count);


            /*
             * Hide empty badge if the
             * element is being used
             * as a badge.
             */

            if(
                element.classList.contains(
                    "cart-count"
                ) ||
                element.classList.contains(
                    "cart-badge"
                )
            ){

                element.style.display =
                    count > 0
                        ? ""
                        : "none";

            }

        }
    );


    /*
     * Update elements that use
     * data-cart-count.
     */

    document
        .querySelectorAll(
            "[data-cart-count]"
        )
        .forEach(
            element => {

                element.textContent =
                    count > 99
                        ? "99+"
                        : String(count);

            }
        );


    return count;

}


/* ==========================================================
   FIND EXISTING CART PRODUCT
========================================================== */

function findProductCartItem(
    cart,
    productId,
    variations = {}
){

    if(!Array.isArray(cart)){

        return -1;

    }


    const normalizedProductId =
        String(
            productId
        );


    return cart.findIndex(
        item => {

            if(!item){

                return false;

            }


            const itemProductId =
                String(
                    item.productId ||
                    item.id ||
                    ""
                );


            if(
                itemProductId !==
                normalizedProductId
            ){

                return false;

            }


            /*
             * Products with different
             * variations are kept separate.
             */

            return areProductVariationsEqual(
                item.variations || {},
                variations || {}
            );

        }
    );

}


/* ==========================================================
   COMPARE PRODUCT VARIATIONS
========================================================== */

function areProductVariationsEqual(
    first,
    second
){

    if(
        !first ||
        typeof first !== "object"
    ){

        first = {};

    }


    if(
        !second ||
        typeof second !== "object"
    ){

        second = {};

    }


    const firstKeys =
        Object.keys(
            first
        ).sort();


    const secondKeys =
        Object.keys(
            second
        ).sort();


    if(
        firstKeys.length !==
        secondKeys.length
    ){

        return false;

    }


    for(
        let i = 0;
        i < firstKeys.length;
        i++
    ){

        const key =
            firstKeys[i];


        if(
            key !==
            secondKeys[i]
        ){

            return false;

        }


        if(
            String(
                first[key]
            ) !==
            String(
                second[key]
            )
        ){

            return false;

        }

    }


    return true;

}


/* ==========================================================
   NORMALIZE CART ITEM
========================================================== */

function normalizeProductCartItem(
    item
){

    if(!item){

        return null;

    }


    const productId =
        item.productId ||
        item.id ||
        "";


    if(!productId){

        return null;

    }


    const quantity =
        Number(
            item.quantity || 1
        );


    const price =
        Number(
            item.buyerPrice ??
            item.price ??
            0
        );


    const oldPrice =
        Number(
            item.buyerOldPrice ??
            item.oldPrice ??
            0
        );


    return {

        ...item,

        id:
            String(
                productId
            ),

        productId:
            String(
                productId
            ),

        name:
            item.name ||
            item.productName ||
            "Product",

        image:
            item.image ||
            item.mainImage ||
            "",

        price:
            Number.isFinite(price)
                ? price
                : 0,

        buyerPrice:
            Number.isFinite(price)
                ? price
                : 0,

        oldPrice:
            Number.isFinite(oldPrice)
                ? oldPrice
                : 0,

        buyerOldPrice:
            Number.isFinite(oldPrice)
                ? oldPrice
                : 0,

        quantity:
            Number.isFinite(quantity) &&
            quantity > 0
                ? Math.floor(quantity)
                : 1,

        variations:
            item.variations &&
            typeof item.variations === "object"
                ? item.variations
                : {},

        sellerId:
            item.sellerId ||
            "",

        sellerName:
            item.sellerName ||
            "Seller",

        sellerStoreName:
            item.sellerStoreName ||
            item.storeName ||
            item.sellerName ||
            "Seller Store",

        sellerPhoto:
            item.sellerPhoto ||
            "",

        sellerLocation:
            item.sellerLocation ||
            item.location ||
            "",

        deliveryPrice:
            Number(
                item.deliveryPrice ||
                item.deliveryFee ||
                0
            ),

        addedAt:
            item.addedAt ||
            Date.now()

    };

}


/* ==========================================================
   CREATE / UPDATE PRODUCT CART ITEM
========================================================== */

function addProductCartItemToLocalCart(
    cartItem
){

    if(!cartItem){

        return {
            cart: getProductCart(),
            index: -1,
            added: false
        };

    }


    const cart =
        getProductCart();


    const normalizedItem =
        normalizeProductCartItem(
            cartItem
        );


    if(!normalizedItem){

        return {
            cart,
            index: -1,
            added: false
        };

    }


    const existingIndex =
        findProductCartItem(
            cart,
            normalizedItem.productId,
            normalizedItem.variations
        );


    if(existingIndex >= 0){

        const existing =
            normalizeProductCartItem(
                cart[
                    existingIndex
                ]
            );


        existing.quantity =
            Number(
                existing.quantity || 0
            ) +
            Number(
                normalizedItem.quantity || 1
            );


        /*
         * Keep the latest product information.
         */

        existing.name =
            normalizedItem.name;

        existing.image =
            normalizedItem.image ||
            existing.image;

        existing.price =
            normalizedItem.price;

        existing.buyerPrice =
            normalizedItem.buyerPrice;

        existing.oldPrice =
            normalizedItem.oldPrice;

        existing.buyerOldPrice =
            normalizedItem.buyerOldPrice;

        existing.sellerId =
            normalizedItem.sellerId ||
            existing.sellerId;

        existing.sellerName =
            normalizedItem.sellerName ||
            existing.sellerName;

        existing.sellerStoreName =
            normalizedItem.sellerStoreName ||
            existing.sellerStoreName;

        existing.deliveryPrice =
            normalizedItem.deliveryPrice;


        cart[
            existingIndex
        ] = existing;


    }else{

        cart.push(
            normalizedItem
        );

    }


    saveProductCart(
        cart
    );


    updateProductCartIcons();


    return {

        cart,

        index:
            existingIndex >= 0
                ? existingIndex
                : cart.length - 1,

        added:
            true

    };

}


/* ==========================================================
   PRODUCT CART COUNT INITIALIZATION
========================================================== */

function initializeProductCartCount(){

    updateProductCartIcons();


    /*
     * Listen for updates coming from
     * cart.js, header.js or other pages.
     */

    window.addEventListener(
        "yourStoreCartUpdated",
        event => {

            const cart =
                event?.detail?.cart;


            if(
                Array.isArray(cart)
            ){

                const count =
                    getProductCartQuantity(
                        cart
                    );


                window.yourStoreCartCount =
                    count;


                updateProductCartIcons();

            }else{

                updateProductCartIcons();

            }

        }
    );


    /*
     * Listen for localStorage changes.
     */

    window.addEventListener(
        "storage",
        event => {

            if(
                event.key ===
                CART_STORAGE_KEY ||
                event.key === null
            ){

                updateProductCartIcons();

            }

        }
    );

}


/* ==========================================================
   CART ICON CLICK HANDLER
========================================================== */

function initializeProductCartLinks(){

    document
        .querySelectorAll(
            "[data-cart-link], .cart-link"
        )
        .forEach(
            link => {

                if(
                    link.dataset.cartInitialized ===
                    "true"
                ){

                    return;

                }


                link.dataset.cartInitialized =
                    "true";


                link.addEventListener(
                    "click",
                    function(event){

                        /*
                         * Only prevent default when
                         * no usable href exists.
                         */

                        const href =
                            this.getAttribute(
                                "href"
                            );


                        if(
                            !href ||
                            href === "#" ||
                            href === "javascript:void(0)"
                        ){

                            event.preventDefault();


                            window.location.href =
                                "cart.html";

                        }

                    }
                );

            }
        );

}


/* ==========================================================
   INITIAL CART UI
========================================================== */

function initializeProductCartSystem(){

    initializeProductCartCount();

    initializeProductCartLinks();

    updateProductCartIcons();

}


/* ==========================================================
   PRODUCT.JS — PART 4/5
   CART SYNCHRONIZATION + CART COUNT + PURCHASE ACTIONS
========================================================== */


/* ==========================================================
   GET LOCAL CART
========================================================== */

function getProductLocalCart(){

    try{

        const storedCart =
            localStorage.getItem(
                "yourStoreCart"
            );

        if(!storedCart){

            return [];

        }

        const parsedCart =
            JSON.parse(
                storedCart
            );

        return Array.isArray(parsedCart)
            ? parsedCart
            : [];

    }catch(error){

        console.error(
            "LOCAL CART READ ERROR:",
            error
        );

        return [];

    }

}


/* ==========================================================
   SAVE LOCAL CART
========================================================== */

function saveProductLocalCart(cart){

    if(!Array.isArray(cart)){

        cart = [];

    }

    try{

        localStorage.setItem(
            "yourStoreCart",
            JSON.stringify(cart)
        );

        /*
         * Notify cart page and header.
         */

        window.dispatchEvent(
            new CustomEvent(
                "yourStoreCartUpdated",
                {
                    detail:{
                        cart: cart
                    }
                }
            )
        );

        /*
         * Update product-page icon immediately.
         */

        updateProductCartCount();

        return true;

    }catch(error){

        console.error(
            "LOCAL CART SAVE ERROR:",
            error
        );

        return false;

    }

}


/* ==========================================================
   GET CART ITEM KEY
   ----------------------------------------------------------
   Product + variation combination gets its own cart item.
========================================================== */

function getProductCartItemKey(item){

    if(!item){

        return "";

    }

    const productId =
        String(
            item.productId ||
            item.id ||
            ""
        );

    let variations = {};

    if(
        item.variations &&
        typeof item.variations === "object"
    ){

        variations =
            item.variations;

    }

    const variationKey =
        Object.keys(variations)
            .sort()
            .map(
                key =>
                    `${key}:${variations[key]}`
            )
            .join("|");

    return (
        productId +
        "::" +
        variationKey
    );

}


/* ==========================================================
   MERGE CART ITEM
========================================================== */

function mergeProductCartItem(
    cart,
    newItem
){

    if(!Array.isArray(cart)){

        cart = [];

    }

    if(!newItem){

        return cart;

    }

    const newKey =
        getProductCartItemKey(
            newItem
        );

    const existingIndex =
        cart.findIndex(
            item =>
                getProductCartItemKey(
                    item
                ) === newKey
        );

    if(existingIndex >= 0){

        const existing =
            cart[existingIndex];

        existing.quantity =
            Number(
                existing.quantity || 0
            ) +
            Number(
                newItem.quantity || 1
            );

        /*
         * Keep latest product information.
         */

        existing.name =
            newItem.name ||
            existing.name ||
            "";

        existing.image =
            newItem.image ||
            existing.image ||
            "";

        existing.price =
            Number(
                newItem.price ??
                existing.price ??
                0
            );

        existing.buyerPrice =
            Number(
                newItem.buyerPrice ??
                existing.buyerPrice ??
                existing.price ??
                0
            );

        existing.oldPrice =
            Number(
                newItem.oldPrice ??
                existing.oldPrice ??
                0
            );

        existing.buyerOldPrice =
            Number(
                newItem.buyerOldPrice ??
                existing.buyerOldPrice ??
                existing.oldPrice ??
                0
            );

        existing.deliveryPrice =
            Number(
                newItem.deliveryPrice ??
                existing.deliveryPrice ??
                0
            );

        existing.updatedAt =
            Date.now();

    }else{

        cart.push({
            ...newItem,
            quantity:
                Math.max(
                    1,
                    Number(
                        newItem.quantity || 1
                    )
                ),
            addedAt:
                newItem.addedAt ||
                Date.now(),
            updatedAt:
                Date.now()
        });

    }

    return cart;

}



/* ==========================================================
   LOAD PRODUCT CART COUNT
========================================================== */

function loadProductCartCount(){

    updateProductCartCount();

}


/* ==========================================================
   ADD PRODUCT TO LOCAL CART
========================================================== */

async function addProductToCart(){

    if(!currentProduct){

        showCartMessage(
            "Product information is unavailable."
        );

        return;

    }

    const cartItem =
        createProductCartItem();

    if(!cartItem){

        showCartMessage(
            "Unable to create cart item."
        );

        return;

    }

    try{

        let cart =
            getProductLocalCart();

        cart =
            mergeProductCartItem(
                cart,
                cartItem
            );

        const saved =
            saveProductLocalCart(
                cart
            );

        if(!saved){

            showCartMessage(
                "Unable to save your cart."
            );

            return;

        }

        /*
         * Update icon immediately.
         */

        updateProductCartCount();

        showCartMessage(
            "Product added to cart."
        );

        /*
         * Synchronize logged-in buyer
         * with Firebase.
         */

        if(currentUser){

            await synchronizeProductCartWithFirebase();

        }

    }catch(error){

        console.error(
            "ADD TO CART ERROR:",
            error
        );

        showCartMessage(
            "Unable to add product to cart."
        );

    }

}


/* ==========================================================
   SYNCHRONIZE PRODUCT CART WITH FIREBASE
   ----------------------------------------------------------
   LocalStorage remains the immediate cart source.
   Firebase receives the same cart for logged-in users.
========================================================== */

async function synchronizeProductCartWithFirebase(){

    if(!currentUser){

        return false;

    }

    const cart =
        getProductLocalCart();

    try{

        const cartReference =
            doc(
                db,
                "users",
                currentUser.uid,
                "cart",
                "items"
            );

        await setDoc(
            cartReference,
            {
                items: cart,

                itemCount:
                    cart.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item?.quantity || 0
                            ),
                        0
                    ),

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );

        /*
         * Keep the user's cart count locally.
         */

        const count =
            cart.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item?.quantity || 0
                    ),
                0
            );

        localStorage.setItem(
            `cartCount_${currentUser.uid}`,
            String(count)
        );

        window.dispatchEvent(
            new CustomEvent(
                "yourStoreFirebaseCartUpdated",
                {
                    detail:{
                        cart: cart,
                        count: count
                    }
                }
            )
        );

        return true;

    }catch(error){

        console.error(
            "FIREBASE CART SYNCHRONIZATION ERROR:",
            error
        );

        /*
         * Do NOT clear the local cart if
         * Firebase synchronization fails.
         */

        return false;

    }

}


/* ==========================================================
   INITIALIZE CART EVENTS
========================================================== */

function initializeProductCartEvents(){

    /*
     * Update when another tab/window changes
     * the cart.
     */

    window.addEventListener(
        "storage",
        event => {

            if(
                event.key ===
                "yourStoreCart"
            ){

                updateProductCartCount();

            }

        }
    );

    /*
     * Custom count event.
     */

    window.addEventListener(
    "yourStoreCartCountUpdated",
    event => {

        const count =
            Number(
                event?.detail?.count || 0
            );


        window.yourStoreCartCount =
            count;

    }
);

 }
        
        
        
        /* ==========================================================
   BUY NOW
   ADD PRODUCT TO CART THEN REDIRECT TO DELIVERY
========================================================== */

/* ==========================================================
   BUY NOW
========================================================== */

async function buyProductNow(){

    if(!currentProduct){

        showCartMessage(
            "Product information is unavailable."
        );

        return;

    }

    if(!currentUser){

        showCartMessage(
            "Please sign in before purchasing."
        );

        redirectToLogin();

        return;

    }

    const cartItem =
        createProductCartItem();

    if(!cartItem){

        showCartMessage(
            "Unable to prepare this product."
        );

        return;

    }

    try{

        const buyNowReference =
            doc(
                db,
                "users",
                currentUser.uid,
                "buyNow",
                currentProduct.id
            );

        await setDoc(
            buyNowReference,
            {
                ...cartItem,

                updatedAt:
                    serverTimestamp()
            },
            {
                merge: true
            }
        );

        window.location.href =
            `buy.html?mode=buyNow&productId=${encodeURIComponent(
                currentProduct.id
            )}`;

    }catch(error){

        console.error(
            "BUY NOW ERROR:",
            error
        );

        showCartMessage(
            "Unable to continue with this purchase."
        );

    }

}




/* ==========================================================
   REDIRECT TO LOGIN
========================================================== */

function redirectToLogin(){

    const returnURL =
        window.location.href;

    setTimeout(
        () => {

            window.location.href =
                "login.html?redirect=" +
                encodeURIComponent(
                    returnURL
                );

        },
        700
    );

}




/* ==========================================================
   PURCHASE BUTTON EVENTS
========================================================== */

function initializeProductPurchaseActions(){

    const addButton =
        document.getElementById(
            "addToCartButton"
        );

    const buyButton =
        document.getElementById(
            "buyNowButton"
        );

    if(addButton){

        /*
         * Prevent duplicate listeners
         * if initialization is triggered again.
         */

        addButton.onclick =
            addProductToCart;

    }

    if(buyButton){

        buyButton.onclick =
            buyProductNow;

    }

}


/* ==========================================================
   CART MESSAGE
========================================================== */

function showCartMessage(message){

    const element =
        document.getElementById(
            "cartMessage"
        );

    if(!element){

        return;

    }

    element.textContent =
        String(
            message || ""
        );

    element.classList.add(
        "show"
    );

    clearTimeout(
        showCartMessage.timer
    );

    showCartMessage.timer =
        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* ==========================================================
   OPEN CART
   ----------------------------------------------------------
   Use this on the product-page cart icon.
========================================================== */

function openProductCart(){

    window.location.href =
        "cart.html";

}


/* ==========================================================
   INITIALIZE CART ICON
========================================================== */

function initializeProductCartButton(){

    const cartButton =
        document.getElementById(
            "productCartButton"
        );

    if(cartButton){

        cartButton.onclick =
            openProductCart;

    }

}



/* ==========================================================
   EXPOSE SAFE CART FUNCTIONS
   ----------------------------------------------------------
   Useful if cart.js or another page script needs
   to refresh the product-page cart badge.
========================================================== */

window.updateProductCartCount =
    updateProductCartCount;

window.getProductLocalCart =
    getProductLocalCart;

window.synchronizeProductCartWithFirebase =
    synchronizeProductCartWithFirebase;
    
    

/* ==========================================================
   UPDATE GLOBAL CART COUNT
========================================================== */

function updateGlobalCartCount(cart = null){

    /*
     * IMPORTANT:
     * Do NOT call updateGlobalCartCount() from inside
     * this function.
     */

    let currentCart = cart;


    /* --------------------------------------------------
       READ CART ONLY WHEN NOT PROVIDED
    -------------------------------------------------- */

    if(!Array.isArray(currentCart)){

        try{

            currentCart =
                JSON.parse(
                    localStorage.getItem(
                        "yourStoreCart"
                    )
                ) || [];

        }catch(error){

            console.warn(
                "CART COUNT READ ERROR:",
                error
            );

            currentCart = [];

        }

    }


    if(!Array.isArray(currentCart)){

        currentCart = [];

    }


    /* --------------------------------------------------
       CALCULATE TOTAL QUANTITY
    -------------------------------------------------- */

    const totalQuantity =
        currentCart.reduce(
            (
                total,
                item
            ) => {

                const quantity =
                    Number(
                        item?.quantity || 0
                    );


                if(
                    !Number.isFinite(
                        quantity
                    ) ||
                    quantity <= 0
                ){

                    return total;

                }


                return total + quantity;

            },
            0
        );


    /* --------------------------------------------------
       ALL CART BADGES
    -------------------------------------------------- */

    const selectors = [

        "#productCartCount",

        "#cartCount",

        ".cart-count",

        ".header-cart-count",

        "[data-cart-count]"

    ];


    const elements = [];


    selectors.forEach(
        selector => {

            document
                .querySelectorAll(
                    selector
                )
                .forEach(
                    element => {

                        if(
                            !elements.includes(
                                element
                            )
                        ){

                            elements.push(
                                element
                            );

                        }

                    }
                );

        }
    );


    /* --------------------------------------------------
       UPDATE BADGES
    -------------------------------------------------- */

    elements.forEach(
        element => {

            element.textContent =
                totalQuantity > 99
                    ? "99+"
                    : String(
                        totalQuantity
                    );


            if(
                totalQuantity > 0
            ){

                element.classList.add(
                    "has-items"
                );

                element.style.display =
                    "";

            }else{

                element.classList.remove(
                    "has-items"
                );

                if(
                    element.dataset.autoHide ===
                    "true"
                ){

                    element.style.display =
                        "none";

                }

            }

        }
    );


    /* --------------------------------------------------
       GLOBAL VALUE
    -------------------------------------------------- */

    window.yourStoreCartCount =
        totalQuantity;


    /* --------------------------------------------------
       NOTIFY OTHER COMPONENTS
       
       IMPORTANT:
       This event does NOT call this function again.
    -------------------------------------------------- */

    window.dispatchEvent(
        new CustomEvent(
            "yourStoreCartCountUpdated",
            {
                detail: {
                    count:
                        totalQuantity
                }
            }
        )
    );


    return totalQuantity;

}





/* ==========================================================
   UPDATE CART ICON AFTER LOCAL CART CHANGES
========================================================== */

function refreshProductCartIcon(){

    return updateProductCartIcon();

}


/* ==========================================================
   LISTEN FOR CART UPDATES FROM OTHER PAGES
========================================================== */

window.addEventListener(
    "yourStoreCartUpdated",
    event => {

        const cart =
            event?.detail?.cart;


        if(Array.isArray(cart)){

            updateProductCartIcon(
                cart
            );

        }else{

            updateProductCartIcon();

        }

    }
);


/* ==========================================================
   LISTEN FOR STORAGE CHANGES
========================================================== */

window.addEventListener(
    "storage",
    event => {

        if(
            event.key ===
            CART_STORAGE_KEY
        ){

            updateProductCartIcon();

        }

    }
);




/* ==========================================================
   DISPLAY PRODUCT BADGES
========================================================== */

function displayProductBadges(product){

    const badgeElement =
        document.getElementById(
            "productBadge"
        );


    /* ------------------------------------------------------
       NO BADGE CONTAINER
    ------------------------------------------------------ */

    if(!badgeElement){

        return;

    }


    /* ------------------------------------------------------
       CLEAR PREVIOUS BADGES
    ------------------------------------------------------ */

    badgeElement.innerHTML = "";

    badgeElement.style.display =
        "none";


    if(!product){

        return;

    }


    /* ------------------------------------------------------
       COLLECT BADGES
       
       Supports:
       
       badge: "Trending"

       badges: [
           "New Arrival",
           "Trending",
           "Popular"
       ]
    ------------------------------------------------------ */

    let badges = [];


    if(
        Array.isArray(
            product.badges
        )
    ){

        badges =
            product.badges
                .filter(
                    badge =>
                        badge !== null &&
                        badge !== undefined &&
                        String(
                            badge
                        ).trim() !== ""
                )
                .map(
                    badge =>
                        String(
                            badge
                        ).trim()
                );

    }


    /* ------------------------------------------------------
       SINGLE BADGE FALLBACK
    ------------------------------------------------------ */

    if(
        badges.length === 0 &&
        product.badge
    ){

        badges = [

            String(
                product.badge
            ).trim()

        ];

    }


    /* ------------------------------------------------------
       AUTOMATIC BADGES
       Only add these when they are explicitly enabled
    ------------------------------------------------------ */

    if(
        product.isNew === true &&
        !badges.some(
            badge =>
                badge.toLowerCase() ===
                "new"
        )
    ){

        badges.unshift(
            "New"
        );

    }


    if(
        product.trending === true &&
        !badges.some(
            badge =>
                badge.toLowerCase() ===
                "trending"
        )
    ){

        badges.push(
            "Trending"
        );

    }


    if(
        product.featured === true &&
        !badges.some(
            badge =>
                badge.toLowerCase() ===
                "featured"
        )
    ){

        badges.push(
            "Featured"
        );

    }


    /* ------------------------------------------------------
       REMOVE DUPLICATE BADGES
    ------------------------------------------------------ */

    badges =
        badges.filter(
            (
                badge,
                index,
                array
            ) => {

                return index ===
                    array.findIndex(
                        item =>
                            item.toLowerCase() ===
                            badge.toLowerCase()
                    );

            }
        );


    /* ------------------------------------------------------
       MAXIMUM 6 BADGES
    ------------------------------------------------------ */

    badges =
        badges.slice(
            0,
            6
        );


    /* ------------------------------------------------------
       NO BADGES
    ------------------------------------------------------ */

    if(
        badges.length === 0
    ){

        return;

    }


    /* ------------------------------------------------------
       CREATE BADGES SAFELY
    ------------------------------------------------------ */

    badges.forEach(
        badge => {

            const badgeItem =
                document.createElement(
                    "span"
                );


            badgeItem.className =
                "product-badge-item";


            badgeItem.textContent =
                badge;


            /* ----------------------------------------------
               OPTIONAL BADGE TYPE CLASS
            ---------------------------------------------- */

            const badgeClass =
                badge
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]+/g,
                        "-"
                    )
                    .replace(
                        /^-+|-+$/g,
                        ""
                    );


            if(badgeClass){

                badgeItem.classList.add(
                    `badge-${badgeClass}`
                );

            }


            badgeElement.appendChild(
                badgeItem
            );

        }
    );


    /* ------------------------------------------------------
       SHOW BADGE CONTAINER
    ------------------------------------------------------ */

    badgeElement.style.display =
        "flex";


    badgeElement.classList.add(
        "has-badges"
    );

}



/* ==========================================================
   RECORD PRODUCT VIEW
   SAFE VERSION
========================================================== */

async function recordProductView(){

    /*
     * Never allow view tracking to block
     * the product page.
     */

    if(!currentProductId){

        return;

    }


    /* ------------------------------------------------------
       PREVENT DUPLICATE VIEW IN SAME SESSION
    ------------------------------------------------------ */

    const sessionKey =
        `productViewed_${currentProductId}`;


    if(
        sessionStorage.getItem(
            sessionKey
        )
    ){

        return;

    }


    /*
     * Mark immediately.
     *
     * This prevents multiple calls if the
     * function is triggered more than once.
     */

    sessionStorage.setItem(
        sessionKey,
        "true"
    );


    try{

        /* --------------------------------------------------
           PRODUCT REFERENCE
        -------------------------------------------------- */

        const productReference =
            doc(
                db,
                "products",
                currentProductId
            );


        /* --------------------------------------------------
           INCREASE PRODUCT VIEW COUNT
        -------------------------------------------------- */

        await updateDoc(
            productReference,
            {
                views:
                    increment(1)
            }
        );


        /* --------------------------------------------------
           DAILY VIEW DOCUMENT
        -------------------------------------------------- */

        const today =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


        const dailyReference =
            doc(
                db,
                "dailyProductViews",
                today,
                "products",
                currentProductId
            );


        await setDoc(
            dailyReference,
            {

                productId:
                    currentProductId,

                productName:
                    currentProduct?.name ||
                    currentProduct?.productName ||
                    "",

                image:
                    getProductImage(
                        currentProduct
                    ),

                category:
                    currentProduct?.category ||
                    "",

                price:
                    getProductPrice(
                        currentProduct
                    ),

                views:
                    increment(1),

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        /* --------------------------------------------------
           BUYER VIEW HISTORY
        -------------------------------------------------- */

        if(currentUser){

            try{

                const buyerHistoryReference =
                    doc(
                        db,
                        "users",
                        currentUser.uid,
                        "viewedProducts",
                        currentProductId
                    );


                await setDoc(
                    buyerHistoryReference,
                    {

                        productId:
                            currentProductId,

                        productName:
                            currentProduct?.name ||
                            currentProduct?.productName ||
                            "",

                        image:
                            getProductImage(
                                currentProduct
                            ),

                        category:
                            currentProduct?.category ||
                            "",

                        price:
                            getProductPrice(
                                currentProduct
                            ),

                        viewedAt:
                            serverTimestamp()

                    },
                    {
                        merge: true
                    }
                );


            }catch(historyError){

                /*
                 * Buyer history failure should
                 * NEVER break product loading.
                 */

                console.warn(
                    "BUYER VIEW HISTORY ERROR:",
                    historyError
                );

            }

        }


        /* --------------------------------------------------
           UPDATE LOCAL PRODUCT VIEW COUNT
        -------------------------------------------------- */

        if(currentProduct){

            currentProduct.views =
                Number(
                    currentProduct.views || 0
                ) + 1;


            setText(
                "productViews",
                `${currentProduct.views.toLocaleString()} ${
                    currentProduct.views === 1
                        ? "view"
                        : "views"
                }`
            );

        }


    }catch(error){

        /*
         * IMPORTANT:
         *
         * Never throw this error.
         *
         * recordProductView() is secondary.
         * The product page must continue loading
         * even if Firestore rules/network fail.
         */

        console.warn(
            "PRODUCT VIEW TRACKING FAILED:",
            error
        );


    }

}






/* ==========================================================
   PRODUCT AUTHENTICATION UPDATE
========================================================== */

function initializeProductAuthentication(){

    onAuthStateChanged(
        auth,
        async user => {

            currentUser =
                user || null;


            /*
             * Always update local cart icon.
             */

            updateProductCartIcon();


            if(!currentUser){

                return;

            }


            /*
             * Synchronize once authentication
             * has been confirmed.
             */

            await synchronizeProductCartWithFirebase();

        }
    );

}


/* ==========================================================
   FINAL PRODUCT PAGE INITIALIZATION
========================================================== */

/* ==========================================================
   START PRODUCT PAGE
   ONLY ONCE
========================================================== */

let productPageStarted = false;


function startProductPage(){

    if(productPageStarted){

        console.warn(
            "PRODUCT PAGE ALREADY STARTED"
        );

        return;

    }


    productPageStarted = true;


    console.log(
        "STARTING PRODUCT PAGE..."
    );


    initializeProductPage();

}


/* ==========================================================
   DOM READY
========================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        startProductPage,
        {
            once: true
        }
    );

}else{

    startProductPage();

}



/* ==========================================================
   OPTIONAL GLOBAL FUNCTIONS
   Allows cart.js/header.js to refresh the icon.
========================================================== */

window.updateProductCartIcon =
    updateProductCartIcon;


window.refreshProductCartIcon =
    refreshProductCartIcon;


window.synchronizeProductCartWithFirebase =
    synchronizeProductCartWithFirebase;




/* ==========================================================
   EMERGENCY LOADER FAILSAFE
   NEVER ALLOW ENDLESS LOADING
========================================================== */

setTimeout(
    () => {

        const loader =
            document.getElementById(
                "productPageLoader"
            );


        if(
            loader &&
            loader.style.display !== "none"
        ){

            console.warn(
                "EMERGENCY: HIDING PRODUCT LOADER"
            );


            hideProductPageLoader();

        }

    },
    15000
);




/* ==========================================================
   PRODUCT.JS END
========================================================== */




/* ==========================================================
   PRODUCT RELATED SECTIONS
   SPONSORED / SELLER / RELATED CATEGORIES
========================================================== */


/* ==========================================================
   SECTION REFERENCES
========================================================== */

function getRelatedSectionElements(){

    return {

        sponsoredSection:
            document.getElementById(
                "sponsoredSection"
            ),

        sponsoredProducts:
            document.getElementById(
                "sponsoredProducts"
            ),

        sellerProductsSection:
            document.getElementById(
                "sellerProductsSection"
            ),

        sellerProducts:
            document.getElementById(
                "sellerProducts"
            ),

        relatedCategoriesSection:
            document.getElementById(
                "relatedCategoriesSection"
            ),

        relatedCategories:
            document.getElementById(
                "relatedCategories"
            )

    };

}


/* ==========================================================
   HIDE / SHOW SECTION
========================================================== */

function setProductSectionVisibility(
    section,
    container,
    hasItems
){

    if(!section){

        return;

    }


    if(
        container &&
        hasItems
    ){

        section.style.display = "";

        return;

    }


    section.style.display =
        "none";


    if(container){

        container.innerHTML =
            "";

    }

}


/* ==========================================================
   HIDE ALL OPTIONAL SECTIONS
   BEFORE DATA LOADS
========================================================== */

function hideOptionalProductSections(){

    const elements =
        getRelatedSectionElements();


    setProductSectionVisibility(
        elements.sponsoredSection,
        elements.sponsoredProducts,
        false
    );


    setProductSectionVisibility(
        elements.sellerProductsSection,
        elements.sellerProducts,
        false
    );


    setProductSectionVisibility(
        elements.relatedCategoriesSection,
        elements.relatedCategories,
        false
    );

}


/* ==========================================================
   MORE FROM THIS SELLER
========================================================== */

async function loadMoreFromThisSeller(
    currentProduct
){

    const elements =
        getRelatedSectionElements();


    if(
        !elements.sellerProductsSection ||
        !elements.sellerProducts
    ){

        return;

    }


    /*
     * Hide first.
     *
     * This prevents an empty heading from
     * appearing while Firebase is loading.
     */

    setProductSectionVisibility(
        elements.sellerProductsSection,
        elements.sellerProducts,
        false
    );


    if(!currentProduct){

        return;

    }


    /*
     * Try the common seller ID fields.
     */

    const sellerId =
        currentProduct.sellerId ||
        currentProduct.sellerUID ||
        currentProduct.sellerUid ||
        currentProduct.storeId ||
        currentProduct.merchantId ||
        currentProduct.vendorId ||
        "";


    if(!sellerId){

        return;

    }


    try{

        const productsReference =
            collection(
                db,
                "products"
            );


        const sellerQuery =
            query(
                productsReference,
                where(
                    "sellerId",
                    "==",
                    sellerId
                ),
                limit(20)
            );


        const snapshot =
            await getDocs(
                sellerQuery
            );


        const products = [];


        snapshot.forEach(
            documentSnapshot => {

                const product = {

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                };


                /*
                 * Never show the product currently
                 * being viewed.
                 */

                if(
                    product.id !==
                    currentProduct.id
                ){

                    products.push(
                        product
                    );

                }

            }
        );


        /*
         * No other products from this seller.
         */

        if(!products.length){

            return;

        }


        /*
         * Show section.
         */

        elements.sellerProducts.innerHTML =
            products
                .slice(0, 12)
                .map(
                    product =>
                        createRelatedProductCard(
                            product
                        )
                )
                .join("");


        setProductSectionVisibility(
            elements.sellerProductsSection,
            elements.sellerProducts,
            products.length > 0
        );


    }catch(error){

        console.error(
            "MORE FROM SELLER ERROR:",
            error
        );


        setProductSectionVisibility(
            elements.sellerProductsSection,
            elements.sellerProducts,
            false
        );

    }

}


/* ==========================================================
   SPONSORED PRODUCTS
========================================================== */

/* ==========================================================
   LOAD SPONSORED PRODUCTS
========================================================== */

async function loadSponsoredProducts(){

    const section =
        document.getElementById(
            "sponsoredSection"
        );


    const container =
        document.getElementById(
            "sponsoredProducts"
        );


    if(!section || !container){

        return;

    }


    /*
     * ALWAYS HIDE FIRST.
     */

    section.style.display =
        "none";


    container.innerHTML =
        "";


    try{

        /*
         * Only products that have
         * an active paid advertisement
         * should be returned here.
         *
         * Example fields:
         *
         * sponsored: true
         * adActive: true
         */

        const productsReference =
            collection(
                db,
                "products"
            );


        const sponsoredQuery =
            query(
                productsReference,
                where(
                    "sponsored",
                    "==",
                    true
                ),
                where(
                    "adActive",
                    "==",
                    true
                ),
                limit(12)
            );


        const snapshot =
            await getDocs(
                sponsoredQuery
            );


        const products = [];


        snapshot.forEach(
            function(documentSnapshot){

                products.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        /*
         * NO ACTIVE ADS
         */

        if(!products.length){

            section.style.display =
                "none";

            return;

        }


        /*
         * DISPLAY SPONSORED PRODUCTS
         */

        container.innerHTML =
            products
                .map(
                    product =>
                        createViewedProductCard(
                            product
                        )
                )
                .join("");


        /*
         * ONLY SHOW WHEN PRODUCTS
         * ACTUALLY EXIST.
         */

        section.style.display =
            "";


    }catch(error){

        console.error(
            "LOAD SPONSORED PRODUCTS ERROR:",
            error
        );


        container.innerHTML =
            "";

        section.style.display =
            "none";

    }

}



/* ==========================================================
   RELATED CATEGORY MAP
========================================================== */

const relatedCategoryMap = {

    Fashion: [
        "Fashion",
        "Clothing",
        "Shoes",
        "Footwear",
        "Accessories",
        "Jewelry",
        "Bags"
    ],

    Clothing: [
        "Fashion",
        "Clothing",
        "Shoes",
        "Footwear",
        "Accessories",
        "Jewelry"
    ],

    Shoes: [
        "Shoes",
        "Footwear",
        "Fashion",
        "Accessories",
        "Bags"
    ],

    Footwear: [
        "Footwear",
        "Shoes",
        "Fashion",
        "Accessories"
    ],

    Jewelry: [
        "Jewelry",
        "Accessories",
        "Fashion",
        "Beauty"
    ],

    Electronics: [
        "Electronics",
        "Phones",
        "Computers",
        "Accessories",
        "Appliances"
    ],

    Phones: [
        "Phones",
        "Electronics",
        "Accessories",
        "Computers"
    ],

    Computers: [
        "Computers",
        "Electronics",
        "Phones",
        "Accessories"
    ],

    Beauty: [
        "Beauty",
        "Fashion",
        "Accessories"
    ],

    Home: [
        "Home",
        "Furniture",
        "Appliances",
        "Home Decor"
    ],

    Furniture: [
        "Furniture",
        "Home",
        "Home Decor",
        "Appliances"
    ],

    Groceries: [
        "Groceries",
        "Food",
        "Beverages",
        "Home"
    ]

};


/* ==========================================================
   GET RELATED CATEGORIES
========================================================== */

function getRelatedCategories(
    currentCategory
){

    if(!currentCategory){

        return [];

    }


    const category =
        String(
            currentCategory
        ).trim();


    /*
     * Exact predefined relationship.
     */

    const mapped =
        relatedCategoryMap[
            category
        ];


    if(
        Array.isArray(mapped) &&
        mapped.length
    ){

        return mapped;

    }


    /*
     * Fallback:
     * show the current category itself.
     */

    return [
        category
    ];

}


/* ==========================================================
   LOAD RELATED CATEGORY PRODUCTS
========================================================== */

/* ==========================================================
   LOAD RELATED CATEGORIES
   WITH HOME CATEGORY IMAGES
========================================================== */

function loadRelatedCategories(productCategory){

    const container =
        document.getElementById(
            "relatedCategories"
        );

    const section =
        document.getElementById(
            "relatedCategoriesSection"
        );


    /*
     * Safety check
     */

    if(!container){

        return;

    }


    /* ======================================================
       RELATED CATEGORY MAP
    ====================================================== */

    const relatedMap = {

        Fashion: [
            "Shoes",
            "Accessories",
            "Beauty"
        ],

        Shoes: [
            "Fashion",
            "Accessories"
        ],

        Beauty: [
            "Fashion",
            "Accessories"
        ],

        Electronics: [
            "Phones",
            "Computers",
            "Appliances"
        ],

        Phones: [
            "Electronics",
            "Computers",
            "Accessories"
        ],

        Computers: [
            "Electronics",
            "Phones",
            "Accessories"
        ],

        Home: [
            "Furniture",
            "Appliances"
        ],

        Furniture: [
            "Home",
            "Appliances"
        ],

        Appliances: [
            "Home",
            "Electronics"
        ],

        Groceries: [
            "Home",
            "Beauty"
        ],

        Kids: [
            "Fashion",
            "Toys"
        ],

        Sports: [
            "Shoes",
            "Accessories"
        ],

        Automotive: [
            "Accessories",
            "Electronics"
        ],

        Books: [
            "Kids",
            "Electronics"
        ],

        Toys: [
            "Kids",
            "Books"
        ],

        Accessories: [
            "Fashion",
            "Shoes",
            "Beauty"
        ]

    };


    /* ======================================================
       GET RELATED CATEGORY NAMES
    ====================================================== */

    const relatedNames =
        relatedMap[productCategory] || [];


    /*
     * No related categories
     */

    if(!relatedNames.length){

        container.innerHTML = "";

        if(section){

            section.style.display =
                "none";

        }

        return;

    }


    /* ======================================================
       GET CATEGORY DATA FROM HOME CATEGORIES
    ====================================================== */

    const relatedCategories =
        relatedNames
            .map(function(categoryName){

                return homeCategories.find(
                    function(category){

                        return String(
                            category.name
                        ).toLowerCase() ===
                        String(
                            categoryName
                        ).toLowerCase();

                    }
                );

            })
            .filter(Boolean);


    /*
     * Nothing found
     */

    if(!relatedCategories.length){

        container.innerHTML = "";

        if(section){

            section.style.display =
                "none";

        }

        return;

    }


    /* ======================================================
       SHOW SECTION
    ====================================================== */

    if(section){

        section.style.display =
            "";

    }


    /* ======================================================
       RENDER RELATED CATEGORY CARDS
    ====================================================== */

    container.innerHTML =
        relatedCategories
            .map(function(category){

                return `

                    <a
                        href="category.html?category=${encodeURIComponent(
                            category.name
                        )}"
                        class="related-category-card"
                    >

                        <div
                            class="related-category-image"
                        >

                            <img
                                src="${escapeProductAttribute(
                                    category.image
                                )}"
                                alt="${escapeProductAttribute(
                                    category.name
                                )}"
                                loading="lazy"
                                onerror="
                                    this.style.display='none';
                                "
                            >

                        </div>


                        <div
                            class="related-category-content"
                        >

                            <span
                                class="related-category-icon"
                            >
                                ${
                                    category.icon ||
                                    "🛍️"
                                }
                            </span>


                            <strong>
                                ${escapeProductAttribute(
                                    category.name
                                )}
                            </strong>


                            <small>
                                ${escapeProductAttribute(
                                    category.description ||
                                    ""
                                )}
                            </small>

                        </div>

                    </a>

                `;

            })
            .join("");

}






/* ==========================================================
   RELATED PRODUCT CARD
========================================================== */

function createRelatedProductCard(
    product
){

    const productId =
        product.id || "";


    const productName =
        product.name ||
        product.productName ||
        "Product";


    const image =
        product.mainImage ||
        product.image ||
        (
            Array.isArray(product.images)
                ? product.images[0]
                : ""
        ) ||
        "images/product-placeholder.jpg";


    const price =
        Number(
            product.buyerPrice ??
            product.price ??
            0
        );


    const rating =
        Number(
            product.rating ?? 0
        );


    const reviews =
        Number(
            product.reviewCount ??
            product.reviews ??
            0
        );


    return `

        <article
            class="product-card related-product-card"
            data-product-id="${escapeProductAttribute(
                productId
            )}"
        >

            <a
                href="product.html?id=${encodeURIComponent(
                    productId
                )}"
                class="product-image"
            >

                <img
                    src="${escapeProductAttribute(
                        image
                    )}"
                    alt="${escapeProductAttribute(
                        productName
                    )}"
                    loading="lazy"
                    onerror="
                        this.src='images/product-placeholder.jpg';
                    "
                >

            </a>


            <div class="product-info">

                <div class="product-name">

                    ${escapeProductAttribute(
                        productName
                    )}

                </div>


                <div class="product-price">

                    ₦${price.toLocaleString(
                        "en-NG"
                    )}

                </div>


                <div class="product-rating">

                    <span>
                        ★
                    </span>

                    ${rating.toFixed(1)}

                    <span>
                        (${reviews.toLocaleString()})
                    </span>

                </div>

            </div>

        </article>

    `;

}


/* ==========================================================
   LOAD ALL OPTIONAL PRODUCT SECTIONS
========================================================== */

async function loadOptionalProductSections(
    currentProduct
){

    /*
     * Hide everything first.
     *
     * This guarantees that empty headings
     * never remain visible.
     */

    hideOptionalProductSections();


    /*
     * Run the three independent loaders.
     *
     * Promise.allSettled means one failed section
     * won't stop the others.
     */

    await Promise.allSettled([

        loadSponsoredProducts(
            currentProduct
        ),

        loadMoreFromThisSeller(
            currentProduct
        ),

        loadRelatedCategoryProducts(
            currentProduct
        )

    ]);

}



/* ==========================================================
   HIDE EMPTY RELATED PRODUCT SECTIONS
========================================================== */

function hideEmptyProductSections(){

    const sections = [

        {
            sectionId:
                "sponsoredSection",

            containerId:
                "sponsoredProducts"
        },

        {
            sectionId:
                "sellerProductsSection",

            containerId:
                "sellerProducts"
        },

        {
            sectionId:
                "relatedCategoriesSection",

            containerId:
                "relatedCategories"
        }

    ];


    sections.forEach(
        function(item){

            const section =
                document.getElementById(
                    item.sectionId
                );


            const container =
                document.getElementById(
                    item.containerId
                );


            /*
             * If the section itself
             * does not exist, skip it.
             */

            if(!section){

                return;

            }


            /*
             * If the container does not
             * exist, hide the section.
             */

            if(!container){

                section.style.display =
                    "none";

                return;

            }


            /*
             * Check whether the container
             * actually contains products/items.
             */

            const hasChildren =
                container.children.length > 0;


            const hasHTML =
                container.innerHTML
                    .trim()
                    .length > 0;


            const hasVisibleItems =
                hasChildren &&
                hasHTML;


            /*
             * SHOW / HIDE
             */

            if(hasVisibleItems){

                section.style.display =
                    "";

            }else{

                section.style.display =
                    "none";

            }

        }
    );

}



/* ==========================================================
   PRODUCT PAGE BUYER AUTHENTICATION
========================================================== */

function initializeProductBuyerAuthentication(){

    onAuthStateChanged(
        auth,
        async function(user){

            const nameElement =
                document.getElementById(
                    "productAccountName"
                );

            const accountLink =
                document.getElementById(
                    "productAccountLink"
                );


            /*
             * Make sure the elements exist.
             */

            if(!nameElement){

                console.warn(
                    "productAccountName not found."
                );

                return;

            }


            if(!accountLink){

                console.warn(
                    "productAccountLink not found."
                );

                return;

            }


            /* ==================================================
               USER NOT LOGGED IN
            ================================================== */

            if(!user){

                nameElement.textContent =
                    "Sign In";


                accountLink.href =
                    "login.html";


                return;

            }


            /* ==================================================
               USER IS LOGGED IN
            ================================================== */

            accountLink.href =
                "buyer.html";


            let firstName = "";


            try{

                /*
                 * Load buyer profile from Firestore.
                 */

                const buyerReference =
                    doc(
                        db,
                        "buyers",
                        user.uid
                    );


                const buyerSnapshot =
                    await getDoc(
                        buyerReference
                    );


                if(
                    buyerSnapshot.exists()
                ){

                    const buyerData =
                        buyerSnapshot.data();


                    firstName =
                        buyerData.firstName ||
                        buyerData.first_name ||
                        "";


                    /*
                     * If firstName is not available,
                     * try the full name.
                     */

                    if(!firstName){

                        firstName =
                            buyerData.name ||
                            buyerData.fullName ||
                            "";

                    }

                }


            }catch(error){

                console.error(
                    "PRODUCT BUYER PROFILE ERROR:",
                    error
                );

            }


            /* ==================================================
               FALLBACK TO FIREBASE AUTH
            ================================================== */

            if(!firstName){

                firstName =
                    user.displayName ||
                    "";

            }


            /* ==================================================
               FALLBACK TO EMAIL
            ================================================== */

            if(!firstName && user.email){

                firstName =
                    user.email
                        .split("@")[0];

            }


            /* ==================================================
               FINAL FALLBACK
            ================================================== */

            if(!firstName){

                firstName =
                    "Account";

            }


            /* ==================================================
               DISPLAY BUYER NAME
            ================================================== */

            nameElement.textContent =
                firstName;


            console.log(
                "PRODUCT PAGE BUYER:",
                firstName
            );

        }
    );

}



/* ==========================================================
   PRODUCT PAGE SUBCATEGORY ROLLERS
   Each main category has its own horizontal subcategories.
========================================================== */


/* ==========================================================
   SUBCATEGORY DATA
========================================================== */

const productSubcategories = {


    /* ======================================================
       FASHION
    ====================================================== */

    Fashion: [

        {
            name: "Men's Clothing",
            image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Women's Clothing",
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Kids' Clothing",
            image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Dresses",
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Shirts",
            image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Trousers",
            image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Jeans",
            image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Jackets",
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Underwear",
            image: "https://images.unsplash.com/photo-1583743814966-8936f37f4f7c?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Traditional Wear",
            image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Sportswear",
            image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Sleepwear",
            image: "https://images.unsplash.com/photo-1571513800374-df1bbe650e56?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Swimwear",
            image: "https://images.unsplash.com/photo-1506629905607-d9c297d7f4a5?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Workwear",
            image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       ELECTRONICS
    ====================================================== */

    Electronics: [

        {
            name: "Mobile Phones",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Laptops",
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Televisions",
            image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Cameras",
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Headphones",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Speakers",
            image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Gaming",
            image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Smart Watches",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Tablets",
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Computer Accessories",
            image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Power Banks",
            image: "https://images.unsplash.com/photo-1609592424851-5f9c5c5e9c7b?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Chargers",
            image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       SHOES
    ====================================================== */

    Shoes: [

        {
            name: "Men's Shoes",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Women's Shoes",
            image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Sneakers",
            image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Boots",
            image: "https://images.unsplash.com/photo-1542840410-3092f99611a3?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Sandals",
            image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Slippers",
            image: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Formal Shoes",
            image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Sports Shoes",
            image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       BEAUTY
    ====================================================== */

    Beauty: [

        {
            name: "Makeup",
            image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Skincare",
            image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Hair Care",
            image: "https://images.unsplash.com/photo-1527799820374-dcf8d2d9f9d8?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Perfumes",
            image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Body Care",
            image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Hair Extensions",
            image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Nail Care",
            image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Men's Grooming",
            image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       GROCERIES
    ====================================================== */

    Groceries: [

        {
            name: "Fresh Food",
            image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Fruits",
            image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Vegetables",
            image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Drinks",
            image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Snacks",
            image: "https://images.unsplash.com/photo-1621939514649-280e2aa2d9a1?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Breakfast",
            image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Cooking Essentials",
            image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Beverages",
            image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       HOME
    ====================================================== */

    Home: [

        {
            name: "Living Room",
            image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Bedroom",
            image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Kitchen",
            image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Bathroom",
            image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Home Decor",
            image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Lighting",
            image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Storage",
            image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Bedding",
            image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       KIDS
    ====================================================== */

    Kids: [

        {
            name: "Baby Clothing",
            image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Kids Clothing",
            image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Baby Shoes",
            image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Toys",
            image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Baby Care",
            image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "School Supplies",
            image: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       SPORTS
    ====================================================== */

    Sports: [

        {
            name: "Fitness",
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Running",
            image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Football",
            image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Basketball",
            image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Gym Equipment",
            image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Sports Clothing",
            image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       COMPUTERS
    ====================================================== */

    Computers: [

        {
            name: "Laptops",
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Desktop Computers",
            image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Monitors",
            image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Keyboards",
            image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Mice",
            image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Computer Accessories",
            image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       PHONES
    ====================================================== */

    Phones: [

        {
            name: "Android Phones",
            image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "iPhones",
            image: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Tablets",
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Phone Cases",
            image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Chargers",
            image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Screen Protectors",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       ACCESSORIES
    ====================================================== */

    Accessories: [

        {
            name: "Bags",
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Watches",
            image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Jewelry",
            image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Sunglasses",
            image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Belts",
            image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Wallets",
            image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Hats",
            image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       APPLIANCES
    ====================================================== */

    Appliances: [

        {
            name: "Refrigerators",
            image: "https://images.unsplash.com/photo-1571175443880-49e1d22b8f6f?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Washing Machines",
            image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Microwaves",
            image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Blenders",
            image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Electric Cookers",
            image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Air Conditioners",
            image: "https://images.unsplash.com/photo-1631545806609-7f4f1a8d9e91?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       FURNITURE
    ====================================================== */

    Furniture: [

        {
            name: "Sofas",
            image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Beds",
            image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Tables",
            image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Chairs",
            image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Wardrobes",
            image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Office Furniture",
            image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       AUTOMOTIVE
    ====================================================== */

    Automotive: [

        {
            name: "Cars",
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Motorcycles",
            image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Car Accessories",
            image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Car Electronics",
            image: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Tyres",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Car Care",
            image: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       BOOKS
    ====================================================== */

    Books: [

        {
            name: "Fiction",
            image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Education",
            image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Business",
            image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Children's Books",
            image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Religion",
            image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Self Development",
            image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=500&q=80"
        }

    ],



    /* ======================================================
       TOYS
    ====================================================== */

    Toys: [

        {
            name: "Action Figures",
            image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Board Games",
            image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Remote Control Toys",
            image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Dolls",
            image: "https://images.unsplash.com/photo-1599623560574-39d485900c95?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Educational Toys",
            image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80"
        },

        {
            name: "Outdoor Toys",
            image: "https://images.unsplash.com/photo-1560859251-d563a49f1b6f?auto=format&fit=crop&w=500&q=80"
        }

    ]

};



/* ==========================================================
   CREATE SUBCATEGORY CARD
========================================================== */

function createSubcategoryCard(
    mainCategory,
    subcategory
){

    const card =
        document.createElement("a");


    card.className =
        "product-subcategory-card";


    card.href =
        "category.html?category=" +
        encodeURIComponent(
            mainCategory
        ) +
        "&subcategory=" +
        encodeURIComponent(
            subcategory.name
        );


    card.innerHTML = `

        <div class="product-subcategory-image">

            <img
                src="${subcategory.image}"
                alt="${subcategory.name}"
                loading="lazy"
                draggable="false"
            >

        </div>


        <div class="product-subcategory-name">

            ${subcategory.name}

        </div>

    `;


    const image =
        card.querySelector("img");


    if(image){

        image.addEventListener(
            "error",
            function(){

                this.onerror = null;

                this.src =
                    "default-category.jpg";

            }
        );

    }


    return card;

}



/* ==========================================================
   RENDER ONE SUBCATEGORY ROLLER
========================================================== */

function renderSubcategoryRoller(
    rollerId,
    mainCategory
){

    const roller =
        document.getElementById(
            rollerId
        );


    if(!roller){

        return;

    }


    roller.innerHTML = "";


    const subcategories =
        productSubcategories[
            mainCategory
        ] || [];


    subcategories.forEach(
        subcategory => {

            const card =
                createSubcategoryCard(
                    mainCategory,
                    subcategory
                );


            roller.appendChild(
                card
            );

        }
    );

}



/* ==========================================================
   INITIALIZE ALL SUBCATEGORY ROLLERS
========================================================== */

function initializeSubcategoryRollers(){

    renderSubcategoryRoller(
        "fashionSubcategories",
        "Fashion"
    );


    renderSubcategoryRoller(
        "electronicsSubcategories",
        "Electronics"
    );


    renderSubcategoryRoller(
        "shoesSubcategories",
        "Shoes"
    );


    renderSubcategoryRoller(
        "beautySubcategories",
        "Beauty"
    );


    renderSubcategoryRoller(
        "groceriesSubcategories",
        "Groceries"
    );


    renderSubcategoryRoller(
        "homeSubcategories",
        "Home"
    );


    renderSubcategoryRoller(
        "kidsSubcategories",
        "Kids"
    );


    renderSubcategoryRoller(
        "sportsSubcategories",
        "Sports"
    );


    renderSubcategoryRoller(
        "computersSubcategories",
        "Computers"
    );


    renderSubcategoryRoller(
        "phonesSubcategories",
        "Phones"
    );


    renderSubcategoryRoller(
        "accessoriesSubcategories",
        "Accessories"
    );


    renderSubcategoryRoller(
        "appliancesSubcategories",
        "Appliances"
    );


    renderSubcategoryRoller(
        "furnitureSubcategories",
        "Furniture"
    );


    renderSubcategoryRoller(
        "automotiveSubcategories",
        "Automotive"
    );


    renderSubcategoryRoller(
        "booksSubcategories",
        "Books"
    );


    renderSubcategoryRoller(
        "toysSubcategories",
        "Toys"
    );

}



/* ==========================================================
   MOUSE / TOUCH DRAG SCROLL
========================================================== */

function enableSubcategoryDragging(){

    const rollers =
        document.querySelectorAll(
            ".product-subcategory-roller"
        );


    rollers.forEach(
        roller => {

            let isDragging = false;

            let startX = 0;

            let startScrollLeft = 0;


            roller.addEventListener(
                "mousedown",
                function(event){

                    isDragging = true;

                    startX =
                        event.pageX;

                    startScrollLeft =
                        roller.scrollLeft;

                    roller.classList.add(
                        "dragging"
                    );

                }
            );


            roller.addEventListener(
                "mousemove",
                function(event){

                    if(!isDragging){

                        return;

                    }


                    event.preventDefault();


                    const distance =
                        event.pageX -
                        startX;


                    roller.scrollLeft =
                        startScrollLeft -
                        distance;

                }
            );


            function stopDragging(){

                isDragging = false;

                roller.classList.remove(
                    "dragging"
                );

            }


            roller.addEventListener(
                "mouseup",
                stopDragging
            );


            roller.addEventListener(
                "mouseleave",
                stopDragging
            );


            /*
               Touch devices already support
               horizontal scrolling naturally.
            */

            roller.addEventListener(
                "touchstart",
                function(){

                    roller.classList.add(
                        "touching"
                    );

                },
                {
                    passive: true
                }
            );


            roller.addEventListener(
                "touchend",
                function(){

                    roller.classList.remove(
                        "touching"
                    );

                },
                {
                    passive: true
                }
            );

        }
    );

}



/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeSubcategoryRollers();

        enableSubcategoryDragging();

    }
);

