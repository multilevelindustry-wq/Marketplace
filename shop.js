/* ==========================================================
   YOURSTORE PUBLIC SHOP
   Public Seller Store
   No authentication required
========================================================== */

import { db } from "./firebase.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy
} from
"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



/* ==========================================================
   CART STORAGE
========================================================== */

const CART_STORAGE_KEY =
    "yourStoreCart";



/* ==========================================================
   PAGE STATE
========================================================== */

let sellerId = null;

let sellerData = null;

let storeProducts = [];

let filteredProducts = [];



/* ==========================================================
   DOM ELEMENTS
========================================================== */

const shopLoader =
    document.getElementById(
        "shopPageLoader"
    );


const storeName =
    document.getElementById(
        "storeName"
    );


const storePhoto =
    document.getElementById(
        "storePhoto"
    );


const storeDescription =
    document.getElementById(
        "storeDescription"
    );


const storeLocation =
    document.getElementById(
        "storeLocation"
    );


const storeProductCount =
    document.getElementById(
        "storeProductCount"
    );


const storeRating =
    document.getElementById(
        "storeRating"
    );


const storeProductGrid =
    document.getElementById(
        "storeProductGrid"
    );


const storeProductSearch =
    document.getElementById(
        "storeProductSearch"
    );


const shopCartCount =
    document.getElementById(
        "shopCartCount"
    );


const shareStoreButton =
    document.getElementById(
        "shareStoreButton"
    );


const shareStoreModal =
    document.getElementById(
        "shareStoreModal"
    );


const closeShareStore =
    document.getElementById(
        "closeShareStore"
    );


const storeShareUrl =
    document.getElementById(
        "storeShareUrl"
    );


const copyStoreLink =
    document.getElementById(
        "copyStoreLink"
    );


const nativeShareButton =
    document.getElementById(
        "nativeShareButton"
    );


const shopSearchForm =
    document.getElementById(
        "shopSearchForm"
    );


const shopSearch =
    document.getElementById(
        "shopSearch"
    );



/* ==========================================================
   START
========================================================== */

initializeShop();



/* ==========================================================
   INITIALIZE SHOP
========================================================== */

async function initializeShop(){

    try {

        showShopLoader();


        sellerId =
            getSellerIdFromURL();


        if(!sellerId){

            showShopError(
                "This store could not be found."
            );

            return;

        }


        await loadSeller();


        await loadSellerProducts();


        updateCartCount();


        setupStoreSearch();


        setupStoreSharing();


        setupGlobalSearch();


    }
    catch(error){

        console.error(
            "Shop initialization error:",
            error
        );


        showShopError(
            "Unable to load this store."
        );

    }
    finally {

        hideShopLoader();

    }

}



/* ==========================================================
   GET SELLER ID
========================================================== */

function getSellerIdFromURL(){

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get(
            "sellerId"
        ) ||
        params.get(
            "seller"
        ) ||
        params.get(
            "uid"
        )
    );

}



/* ==========================================================
   LOAD SELLER
========================================================== */

async function loadSeller(){

    /*
       We first try:

       sellers/{sellerId}

       Then:

       users/{sellerId}

       This allows the public shop to work
       with either seller structure.
    */


    let sellerSnapshot = null;


    const sellerReference =
        doc(
            db,
            "sellers",
            sellerId
        );


    sellerSnapshot =
        await getDoc(
            sellerReference
        );


    if(
        sellerSnapshot.exists()
    ){

        sellerData =
            sellerSnapshot.data();

    }
    else {

        const userReference =
            doc(
                db,
                "users",
                sellerId
            );


        const userSnapshot =
            await getDoc(
                userReference
            );


        if(
            !userSnapshot.exists()
        ){

            throw new Error(
                "Seller does not exist."
            );

        }


        sellerData =
            userSnapshot.data();

    }


    renderSeller();


    updatePageSEO();

}



/* ==========================================================
   RENDER SELLER
========================================================== */

function renderSeller(){

    if(!sellerData){

        return;

    }


    const publicStoreName =
        sellerData.storeName ||
        sellerData.shopName ||
        sellerData.sellerStoreName ||
        sellerData.businessName ||
        sellerData.name ||
        sellerData.displayName ||
        "ZONGO Seller";


    const publicStorePhoto =
        sellerData.storePhoto ||
        sellerData.storeImage ||
        sellerData.shopPhoto ||
        sellerData.shopImage ||
        sellerData.photo ||
        sellerData.photoURL ||
        "images/default-store.png";


    const publicDescription =
        sellerData.storeDescription ||
        sellerData.shopDescription ||
        sellerData.description ||
        "Welcome to our store.";


    const location =
        sellerData.location ||
        sellerData.storeLocation ||
        sellerData.shopLocation ||
        formatSellerLocation(
            sellerData
        );


    if(storeName){

        storeName.textContent =
            publicStoreName;

    }


    if(storePhoto){

        storePhoto.src =
            publicStorePhoto;

        storePhoto.alt =
            publicStoreName;


        storePhoto.onerror =
            function(){

                this.src =
                    "images/default-store.png";

            };

    }


    if(storeDescription){

        storeDescription.textContent =
            publicDescription;

    }


    if(storeLocation){

        storeLocation.textContent =
            location
                ? `📍 ${location}`
                : "📍 Location not provided";

    }


    /*
       IMPORTANT:

       We intentionally DO NOT display:

       sellerData.email
       sellerData.password
       private phone
       payment information
       bank information
       wallet information
       private account data
    */

}



/* ==========================================================
   SELLER LOCATION
========================================================== */

function formatSellerLocation(data){

    const parts = [];


    if(data.address){

        parts.push(
            data.address
        );

    }


    if(data.city){

        parts.push(
            data.city
        );

    }


    if(data.state){

        parts.push(
            data.state
        );

    }


    if(data.country){

        parts.push(
            data.country
        );

    }


    return parts.join(
        ", "
    );

}



/* ==========================================================
   LOAD SELLER PRODUCTS
========================================================== */

async function loadSellerProducts(){

    if(!storeProductGrid){

        return;

    }


    storeProductGrid.innerHTML = `

        <div class="store-products-loading">

            Loading products...

        </div>

    `;


    try {

        const productsReference =
            collection(
                db,
                "products"
            );


        /*
           Primary seller relationship:

           sellerId

           This should be the Firebase UID
           of the seller.
        */


        let productsSnapshot;


        try {

            const productsQuery =
                query(
                    productsReference,
                    where(
                        "sellerId",
                        "==",
                        sellerId
                    ),
                    orderBy(
                        "createdAt",
                        "desc"
                    )
                );


            productsSnapshot =
                await getDocs(
                    productsQuery
                );

        }
        catch(orderError){

            console.warn(
                "Ordered seller query failed. Trying without ordering.",
                orderError
            );


            const productsQuery =
                query(
                    productsReference,
                    where(
                        "sellerId",
                        "==",
                        sellerId
                    )
                );


            productsSnapshot =
                await getDocs(
                    productsQuery
                );

        }


        storeProducts = [];


        productsSnapshot.forEach(
            documentSnapshot => {

                const product =
                    documentSnapshot.data();


                /*
                   Don't show inactive products.
                */

                if(
                    product.status &&
                    (
                        product.status ===
                            "inactive" ||

                        product.status ===
                            "draft" ||

                        product.status ===
                            "deleted" ||

                        product.status ===
                            "rejected"
                    )
                ){

                    return;

                }


                storeProducts.push({

                    id:
                        documentSnapshot.id,

                    ...product

                });

            }
        );


        filteredProducts =
            [
                ...storeProducts
            ];

renderStoreProducts();


        if(storeProductCount){

            storeProductCount.textContent =
                storeProducts.length;

        }


        calculateStoreRating();

    }
    catch(error){

        console.error(
            "Seller products error:",
            error
        );


        storeProductGrid.innerHTML = `

            <div class="store-products-error">

                <div>
                    ⚠️
                </div>

                <h3>
                    Products unavailable
                </h3>

                <p>
                    We couldn't load this store's products.
                </p>

            </div>

        `;

    }

}



/* ==========================================================
   RENDER PRODUCTS
========================================================== */

function renderStoreProducts(){

    if(!storeProductGrid){

        return;

    }


    if(
        !filteredProducts ||
        filteredProducts.length === 0
    ){

        storeProductGrid.innerHTML = "";

        const noProducts =
            document.getElementById(
                "storeNoProducts"
            );


        if(noProducts){

            noProducts.style.display =
                "block";

        }


        return;

    }


    const noProducts =
        document.getElementById(
            "storeNoProducts"
        );


    if(noProducts){

        noProducts.style.display =
            "none";

    }


    storeProductGrid.innerHTML =
        filteredProducts
            .map(
                product =>
                    createStoreProductCard(
                        product
                    )
            )
            .join("");

}



/* ==========================================================
   CREATE PRODUCT CARD
========================================================== */

function createStoreProductCard(product){

    const productId =
        product.id;


    const productName =
        product.name ||
        product.productName ||
        product.title ||
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
            class="store-product-card"
        >


            <a
                href="product.html?id=${encodeURIComponent(
                    productId
                )}"
                class="store-product-image-link"
            >

                <div
                    class="store-product-image"
                >

                    ${
                        badge
                            ? `

                                <span
                                    class="store-product-badge"
                                >
                                    ${escapeHTML(
                                        badge
                                    )}
                                </span>

                            `
                            : ""
                    }


                    <img
                        src="${escapeAttribute(
                            image
                        )}"
                        alt="${escapeAttribute(
                            productName
                        )}"
                        loading="lazy"
                    >

                </div>

            </a>



            <div
                class="store-product-information"
            >


                <div
                    class="store-product-category"
                >
                    ${escapeHTML(
                        category
                    )}
                </div>


                <a
                    href="product.html?id=${encodeURIComponent(
                        productId
                    )}"
                    class="store-product-name"
                >
                    ${escapeHTML(
                        productName
                    )}
                </a>


                <div
                    class="store-product-price-row"
                >

                    <strong
                        class="store-product-price"
                    >
                        ₦${price.toLocaleString(
                            "en-NG"
                        )}
                    </strong>


                    ${
                        oldPrice > price
                            ? `

                                <span
                                    class="store-product-old-price"
                                >
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

                            <span
                                class="store-product-discount"
                            >
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


                <div
                    class="store-product-rating"
                >

                    ★

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


                <a
                    href="product.html?id=${encodeURIComponent(
                        productId
                    )}"
                    class="store-view-product"
                >
                    View Product
                </a>


            </div>

        </article>

    `;

}



/* ==========================================================
   SEARCH PRODUCTS
========================================================== */

function setupStoreSearch(){

    if(!storeProductSearch){

        return;

    }


    storeProductSearch.addEventListener(
        "input",
        function(){

            const searchTerm =
                this.value
                    .trim()
                    .toLowerCase();


            if(!searchTerm){

                filteredProducts =
                    [
                        ...storeProducts
                    ];

            }
            else {

                filteredProducts =
                    storeProducts.filter(
                        product => {

                            const name =
                                (
                                    product.name ||
                                    product.productName ||
                                    product.title ||
                                    ""
                                )
                                .toLowerCase();


                            const category =
                                (
                                    product.category ||
                                    ""
                                )
                                .toLowerCase();


                            const description =
                                (
                                    product.description ||
                                    ""
                                )
                                .toLowerCase();


                            return (

                                name.includes(
                                    searchTerm
                                ) ||

                                category.includes(
                                    searchTerm
                                ) ||

                                description.includes(
                                    searchTerm
                                )

                            );

                        }
                    );

            }


            renderStoreProducts();

        }
    );

}



/* ==========================================================
   STORE SHARING
========================================================== */

function setupStoreSharing(){

    if(!shareStoreButton){

        return;

    }


    shareStoreButton.addEventListener(
        "click",
        openShareStore
    );


    if(closeShareStore){

        closeShareStore.addEventListener(
            "click",
            closeShareStoreModal
        );

    }


    if(copyStoreLink){

        copyStoreLink.addEventListener(
            "click",
            copyStoreURL
        );

    }


    if(nativeShareButton){

        nativeShareButton.addEventListener(
            "click",
            shareStoreNative
        );

    }


    if(shareStoreModal){

        shareStoreModal.addEventListener(
            "click",
            function(event){

                if(
                    event.target ===
                    shareStoreModal
                ){

                    closeShareStoreModal();

                }

            }
        );

    }

}



/* ==========================================================
   OPEN SHARE MODAL
========================================================== */

function openShareStore(){

    if(!shareStoreModal){

        return;

    }


    const url =
        window.location.href;


    if(storeShareUrl){

        storeShareUrl.value =
            url;

    }


    shareStoreModal.classList.add(
        "open"
    );

}



/* ==========================================================
   CLOSE SHARE MODAL
========================================================== */

function closeShareStoreModal(){

    if(!shareStoreModal){

        return;

    }


    shareStoreModal.classList.remove(
        "open"
    );

}

/* ==========================================================
   COPY STORE URL
========================================================== */

async function copyStoreURL(){

    const url =
        window.location.href;


    try {

        await navigator.clipboard.writeText(
            url
        );


        if(copyStoreLink){

            copyStoreLink.textContent =
                "Copied!";

            setTimeout(
                function(){

                    copyStoreLink.textContent =
                        "Copy";

                },
                1500
            );

        }

    }
    catch(error){

        console.error(
            "Copy store URL error:",
            error
        );


        if(storeShareUrl){

            storeShareUrl.select();

            document.execCommand(
                "copy"
            );

        }

    }

}



/* ==========================================================
   NATIVE SHARE
========================================================== */

async function shareStoreNative(){

    const url =
        window.location.href;


    const name =
        storeName
            ? storeName.textContent
            : "Store";


    if(
        navigator.share
    ){

        try {

            await navigator.share({

                title:
                    name +
                    " | ZONGO",

                text:
                    "Visit " +
                    name +
                    " on ZONGO.",

                url:
                    url

            });

        }
        catch(error){

            console.log(
                "Share cancelled."
            );

        }

    }
    else {

        await copyStoreURL();

    }

}



/* ==========================================================
   CALCULATE STORE RATING
========================================================== */

function calculateStoreRating(){

    if(!storeRating){

        return;

    }


    const ratedProducts =
        storeProducts.filter(
            product =>
                Number(
                    product.rating || 0
                ) > 0
        );


    if(
        ratedProducts.length === 0
    ){

        storeRating.textContent =
            "New";

        return;

    }


    let total =
        0;


    ratedProducts.forEach(
        product => {

            total +=
                Number(
                    product.rating
                );

        }
    );


    const average =
        total /
        ratedProducts.length;


    storeRating.textContent =
        average.toFixed(1) +
        " ★";

}



/* ==========================================================
   CART COUNT
========================================================== */

function updateCartCount(){

    if(!shopCartCount){

        return;

    }


    let cart = [];


    try {

        const storedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if(storedCart){

            cart =
                JSON.parse(
                    storedCart
                );

        }

    }
    catch(error){

        console.error(
            "Unable to read cart:",
            error
        );


        cart = [];

    }


    if(!Array.isArray(cart)){

        cart = [];

    }


    /*
       IMPORTANT:

       Count actual cart quantities,
       not simply number of products.
    */

    const totalItems =
        cart.reduce(
            function(total, item){

                const quantity =
                    Number(
                        item.quantity ||
                        item.qty ||
                        1
                    );


                return (
                    total +
                    quantity
                );

            },
            0
        );


    shopCartCount.textContent =
        totalItems > 99
            ? "99+"
            : totalItems;

}



/* ==========================================================
   UPDATE CART WHEN STORAGE CHANGES
========================================================== */

window.addEventListener(
    "storage",
    function(event){

        if(
            event.key ===
            CART_STORAGE_KEY
        ){

            updateCartCount();

        }

    }
);



/* ==========================================================
   UPDATE CART WHEN PAGE BECOMES ACTIVE
========================================================== */

window.addEventListener(
    "pageshow",
    function(){

        updateCartCount();

    }
);


document.addEventListener(
    "visibilitychange",
    function(){

        if(
            document.visibilityState ===
            "visible"
        ){

            updateCartCount();

        }

    }
);



/* ==========================================================
   GLOBAL SEARCH
========================================================== */

function setupGlobalSearch(){

    if(!shopSearchForm){

        return;

    }


    shopSearchForm.addEventListener(
        "submit",
        function(event){

            event.preventDefault();


            const term =
                shopSearch
                    ? shopSearch.value.trim()
                    : "";


            if(!term){

                return;

            }


            window.location.href =
                "categories.html?search=" +
                encodeURIComponent(
                    term
                );

        }
    );

}



/* ==========================================================
   SEO
========================================================== */

function updatePageSEO(){

    if(!sellerData){

        return;

    }


    const name =
        sellerData.storeName ||
        sellerData.shopName ||
        sellerData.sellerStoreName ||
        sellerData.businessName ||
        sellerData.name ||
        sellerData.displayName ||
        "Store";


    document.title =
        name +
        " | ZONGO";


    const description =
        sellerData.storeDescription ||
        sellerData.shopDescription ||
        sellerData.description ||
        "Visit this store on ZONGO.";


    const meta =
        document.getElementById(
            "shopMetaDescription"
        );


    if(meta){

        meta.setAttribute(
            "content",
            description
        );

    }

}



/* ==========================================================
   ERROR
========================================================== */

function showShopError(message){

    if(!storeProductGrid){

        return;

    }


    storeProductGrid.innerHTML = `

        <div class="store-products-error">

            <div>
                ⚠️
            </div>

            <h3>
                Store unavailable
            </h3>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

            <a
                href="index.html"
                class="store-error-button"
            >
                Continue Shopping
            </a>

        </div>

    `;

}



/* ==========================================================
   LOADER
========================================================== */

function showShopLoader(){

    if(shopLoader){

        shopLoader.style.display =
            "flex";

    }

}


function hideShopLoader(){

    if(!shopLoader){

        return;

    }


    shopLoader.classList.add(
        "hidden"
    );


    setTimeout(
        function(){

            shopLoader.style.display =
                "none";

        },
        300
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


function escapeAttribute(value){

    return escapeHTML(
        value
    );

}

