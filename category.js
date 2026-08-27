/* ==========================================================
   CATEGORY.JS
   FIREBASE CATEGORY PAGE
   CART + AUTH + SEARCH + SORT
========================================================== */

import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


/* ==========================================================
   GLOBAL STATE
========================================================== */

let selectedCategory = "";

let categoryProducts = [];

let filteredCategoryProducts = [];

let currentUser = null;


/* ==========================================================
   CART STORAGE KEY
========================================================== */

const CART_STORAGE_KEY =
    "yourStoreCart";


/* ==========================================================
   PAGE INITIALIZATION
========================================================== */

async function initializeCategoryPage(){

    console.log(
        "===== CATEGORY PAGE START ====="
    );


    try{

        /* --------------------------------------------------
           GET CATEGORY
        -------------------------------------------------- */

        selectedCategory =
            getSelectedCategory();


        if(!selectedCategory){

            showCategoryMessage(
                "No category selected."
            );

            return;

        }


        /* --------------------------------------------------
           UPDATE CATEGORY TITLE
        -------------------------------------------------- */

        updateCategoryTitle();


        /* --------------------------------------------------
           AUTHENTICATION
        -------------------------------------------------- */

        initializeCategoryAuthentication();


        /* --------------------------------------------------
           CART
        -------------------------------------------------- */

        initializeCategoryCart();


        /* --------------------------------------------------
           LOAD PRODUCTS
        -------------------------------------------------- */

        await loadCategoryProducts();
        
        loadCategoryProducts();
        initializeCategoryCartListeners();


        /* --------------------------------------------------
           SEARCH
        -------------------------------------------------- */

        initializeCategorySearch();


        /* --------------------------------------------------
           SORT
        -------------------------------------------------- */

        initializeCategorySort();


        /* --------------------------------------------------
           FOOTER
        -------------------------------------------------- */

        initializeCategoryFooter();


        console.log(
            "===== CATEGORY PAGE READY ====="
        );


    }catch(error){

        console.error(
            "CATEGORY PAGE INITIALIZATION ERROR:",
            error
        );


        showCategoryMessage(
            "Unable to load category products."
        );

    }

}


/* ==========================================================
   GET CATEGORY FROM URL
========================================================== */

function getSelectedCategory(){

    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("category") ||
        ""
    ).trim();

}


/* ==========================================================
   LOAD CATEGORY PRODUCTS FROM FIREBASE
========================================================== */

async function loadCategoryProducts(){

    const grid =
        document.getElementById(
            "categoryProductGrid"
        );


    if(!grid){

        return;

    }


    /* --------------------------------------------------
       SHOW LOADING
    -------------------------------------------------- */

    grid.innerHTML = `

        <div class="category-loading">

            <div class="category-spinner"></div>

            <p>
                Loading products...
            </p>

        </div>

    `;


    try{

        const productsReference =
            collection(
                db,
                "products"
            );


        /*
         * We intentionally load the products
         * and filter locally.
         *
         * This works even if some products have
         * slightly different category capitalization.
         */

        const snapshot =
            await getDocs(
                productsReference
            );


        const products = [];


        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                const product = {

                    id:
                        documentSnapshot.id,

                    ...data

                };


                const productCategory =
                    String(
                        product.category ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                const requestedCategory =
                    String(
                        selectedCategory
                    )
                    .trim()
                    .toLowerCase();


                if(
                    productCategory ===
                    requestedCategory
                ){

                    products.push(
                        product
                    );

                }

            }
        );


        categoryProducts =
            products;


        filteredCategoryProducts =
            [
                ...categoryProducts
            ];


        updateProductCount();


        updateCategoryDescription();


        renderCategoryProducts();


    }catch(error){

        console.error(
            "LOAD CATEGORY PRODUCTS ERROR:",
            error
        );


        categoryProducts = [];

        filteredCategoryProducts = [];


        showCategoryMessage(
            "Products could not be loaded."
        );

    }

}


/* ==========================================================
   UPDATE CATEGORY TITLE
========================================================== */

function updateCategoryTitle(){

    const title =
        document.getElementById(
            "categoryTitle"
        );


    if(title){

        title.textContent =
            selectedCategory;

    }


    const heading =
        document.getElementById(
            "categoryHeading"
        );


    if(heading){

        heading.textContent =
            selectedCategory;

    }


    document.title =
        `${selectedCategory} | YourStore`;

}


/* ==========================================================
   CATEGORY DESCRIPTION
========================================================== */

function updateCategoryDescription(){

    const description =
        document.getElementById(
            "categoryDescription"
        );


    if(description){

        description.textContent =
            `Explore ${selectedCategory} products available on YourStore.`;

    }


    const resultText =
        document.getElementById(
            "categoryResultText"
        );


    if(resultText){

        resultText.textContent =
            categoryProducts.length
                ? "Available now"
                : "No products available";

    }

}


/* ==========================================================
   PRODUCT COUNT
========================================================== */

function updateProductCount(){

    const element =
        document.getElementById(
            "productCount"
        );


    if(!element){

        return;

    }


    const count =
        filteredCategoryProducts.length;


    element.textContent =
        `${count.toLocaleString()} ${
            count === 1
                ? "Product"
                : "Products"
        }`;

}


/* ==========================================================
   RENDER CATEGORY PRODUCTS
========================================================== */

function renderCategoryProducts(){

    const grid =
        document.getElementById(
            "categoryProductGrid"
        );


    const empty =
        document.getElementById(
            "categoryEmpty"
        );


    if(!grid){

        return;

    }


    if(
        !filteredCategoryProducts.length
    ){

        grid.innerHTML = "";


        if(empty){

            empty.hidden = false;

        }


        updateProductCount();

        return;

    }


    if(empty){

        empty.hidden = true;

    }


    grid.innerHTML =
        filteredCategoryProducts
            .map(
                product =>
                    createCategoryProductCard(
                        product
                    )
            )
            .join("");


    updateProductCount();


    initializeCategoryProductLinks();

}


/* ==========================================================
   CREATE CATEGORY PRODUCT CARD
========================================================== */

function createCategoryProductCard(product){

    const id =
        product.id;


    const name =
        product.name ||
        product.productName ||
        "Product";


    /* ======================================================
       PRODUCT IMAGE
    ====================================================== */

    const image =
        product.image ||
        product.mainImage ||
        (
            Array.isArray(product.images)
                ? product.images[0]
                : ""
        ) ||
        "images/product-placeholder.jpg";


    /* ======================================================
       PRODUCT PRICE
    ====================================================== */

    const price =
        getProductPrice(
            product
        );


    /* ======================================================
       OLD PRICE
    ====================================================== */

    const oldPrice =
        Number(
            product.oldPrice ||
            product.buyerOldPrice ||
            getAutomaticOldPrice(
                price
            )
        );


    /* ======================================================
       RATING
    ====================================================== */

    const rating =
        Number(
            product.rating || 0
        );


    /* ======================================================
       REVIEWS
    ====================================================== */

    const reviews =
        Number(
            product.reviewCount ??
            product.reviews ??
            0
        );


    /* ======================================================
       PRODUCT BADGE
    ====================================================== */

    const badge =
        product.badge ||
        (
            Array.isArray(
                product.badges
            )
                ? product.badges[0]
                : ""
        );


    /* ======================================================
       CREATE CARD
    ====================================================== */

    return `

        <article
            class="product-card"
            data-product-id="${escapeHTML(id)}"
        >


            <!-- ==============================================
                 PRODUCT IMAGE
            =============================================== -->

            <a
                href="product.html?id=${encodeURIComponent(id)}"
                class="product-image"
            >

                ${
                    badge
                        ? `
                            <span class="product-badge">

                                ${escapeHTML(badge)}

                            </span>
                          `
                        : ""
                }


                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='images/product-placeholder.jpg';
                    "
                >

            </a>


            <!-- ==============================================
                 PRODUCT INFORMATION
            =============================================== -->

            <div class="product-info">


                <!-- PRODUCT NAME -->

                <a
                    href="product.html?id=${encodeURIComponent(id)}"
                    class="product-name"
                >

                    ${escapeHTML(name)}

                </a>


                <!-- PRODUCT PRICE -->

                <div class="product-price">

                    <span class="product-current-price">

                        ₦${price.toLocaleString("en-NG")}

                    </span>


                    ${
                        oldPrice > price
                            ? `
                                <span
                                    class="product-old-price"
                                >

                                    ₦${oldPrice.toLocaleString(
                                        "en-NG"
                                    )}

                                </span>
                              `
                            : ""
                    }

                </div>


                <!-- PRODUCT RATING -->

                <div class="product-rating">

                    <span class="rating-stars">
                        ★
                    </span>

                    <span class="rating-number">

                        ${rating.toFixed(1)}

                    </span>


                    ${
                        reviews > 0
                            ? `
                                <span class="rating-reviews">

                                    (${reviews.toLocaleString()})

                                </span>
                              `
                            : `
                                <span class="rating-reviews">

                                    (0)

                                </span>
                              `
                    }

                </div>


                <!-- ==========================================
                     ADD TO CART
                =========================================== -->

                <button
                    type="button"
                    class="add-to-cart-button"
                    data-product-id="${escapeHTML(id)}"
                >

                    Add to Cart

                </button>


            </div>

        </article>

    `;

}


/* ==========================================================
   GET PRODUCT PRICE
========================================================== */

function getProductPrice(product){

    if(!product){

        return 0;

    }


    const values = [

        product.buyerPrice,

        product.price,

        product.sellingPrice,

        product.salePrice,

        product.currentPrice

    ];


    for(const value of values){

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
   PRODUCT CARD EVENTS
========================================================== */

/* ==========================================================
   CATEGORY ADD TO CART LISTENER
========================================================== */

function initializeCategoryCartListener(){

    document.addEventListener(
        "click",
        function(event){

            /*
             * Find the Add to Cart button.
             */

            const button =
                event.target.closest(
                    ".add-to-cart-button"
                );


            /*
             * Click was not on an Add to Cart button.
             */

            if(!button){

                return;

            }


            /*
             * Get the SAME attribute used
             * by createCategoryProductCard().
             *
             * HTML:
             *
             * data-product-id="123"
             *
             * JavaScript:
             *
             * button.dataset.productId
             */

            const productId =
                button.dataset.productId;


            /*
             * Make sure we received an ID.
             */

            if(!productId){

                console.error(
                    "ADD TO CART ERROR: Product ID missing."
                );

                return;

            }


            console.log(
                "CATEGORY PRODUCT ID:",
                productId
            );


            /*
             * Find the product inside
             * categoryProducts.
             */

            const product =
                categoryProducts.find(
                    function(item){

                        return String(
                            item.id
                        ) === String(
                            productId
                        );

                    }
                );


            /*
             * Product was not found.
             */

            if(!product){

                console.error(
                    "ADD TO CART ERROR: Product not found.",
                    productId
                );

                return;

            }


            /*
             * Add the product to cart.
             */

            addCategoryProductToCart(
                product,
                button
            );

        }
    );

}






/* ==========================================================
   INITIALIZE CATEGORY PRODUCT LINKS
========================================================== */

function initializeCategoryProductLinks(){

    const grid =
        document.getElementById(
            "categoryProductGrid"
        );


    if(!grid){

        return;

    }


    /* --------------------------------------------------
       PRODUCT CARD LINKS
    -------------------------------------------------- */

    grid.addEventListener(
        "click",
        function(event){

            const link =
                event.target.closest(
                    'a[href*="product.html?id="]'
                );


            if(!link){

                return;

            }


            /*
             * Do not interfere with buttons,
             * cart actions, or other controls.
             */

            if(
                event.target.closest(
                    ".add-to-cart-button"
                )
            ){

                return;

            }


            const productId =
                link
                    .getAttribute("href")
                    ?.split("id=")[1];


            if(!productId){

                return;

            }


            /*
             * Decode and normalize ID.
             */

            try{

                const decodedId =
                    decodeURIComponent(
                        productId
                    );


                link.dataset.productId =
                    decodedId;

            }catch(error){

                console.warn(
                    "PRODUCT LINK ID ERROR:",
                    error
                );

            }

        }
    );


    /* --------------------------------------------------
       PRODUCT IMAGE / NAME LINKS
       SUPPORT DYNAMICALLY RENDERED CARDS
    -------------------------------------------------- */

    grid.querySelectorAll(
        'a[href*="product.html?id="]'
    )
    .forEach(
        function(link){

            const href =
                link.getAttribute(
                    "href"
                );


            if(!href){

                return;

            }


            const parts =
                href.split(
                    "id="
                );


            if(parts.length < 2){

                return;

            }


            try{

                link.dataset.productId =
                    decodeURIComponent(
                        parts[1]
                    );

            }catch(error){

                console.warn(
                    "PRODUCT LINK INITIALIZATION ERROR:",
                    error
                );

            }

        }
    );

}





/* ==========================================================
   INITIALIZE CART
========================================================== */

/* ==========================================================
   CATEGORY PAGE — ADD TO CART
========================================================== */

function initializeCategoryCart(){

    const grid =
        document.getElementById(
            "categoryProductGrid"
        );


    if(!grid){

        return;

    }


    /*
     * Event delegation.
     *
     * This works even though product cards
     * are created dynamically.
     */

    grid.addEventListener(
        "click",
        function(event){

            const button =
                event.target.closest(
                    ".add-to-cart-button"
                );


            if(!button){

                return;

            }


            event.preventDefault();
            event.stopPropagation();


            const productId =
                button.dataset.productId;


            if(!productId){

                console.error(
                    "CATEGORY CART ERROR: Product ID missing."
                );

                return;

            }


            /*
             * Find the actual product.
             */

            const product =
                categoryProducts.find(
                    item =>
                        String(item.id) ===
                        String(productId)
                );


            if(!product){

                console.error(
                    "CATEGORY CART ERROR: Product not found:",
                    productId
                );

                return;

            }


            addCategoryProductToCart(
                product,
                button
            );

        }
    );

}


/* ==========================================================
   ADD CATEGORY PRODUCT TO CART
========================================================== */

function addCategoryProductToCart(
    product,
    button
){

    const CART_KEY =
        "yourStoreCart";


    let cart = [];


    /* --------------------------------------------------
       READ EXISTING CART
    -------------------------------------------------- */

    try{

        const savedCart =
            localStorage.getItem(
                CART_KEY
            );


        if(savedCart){

            cart =
                JSON.parse(
                    savedCart
                );

        }


        if(!Array.isArray(cart)){

            cart = [];

        }

    }catch(error){

        console.error(
            "CATEGORY CART READ ERROR:",
            error
        );

        cart = [];

    }


    /* --------------------------------------------------
       NORMALIZE PRODUCT
    -------------------------------------------------- */

    const productId =
        String(
            product.id
        );


    const productName =
        product.name ||
        product.productName ||
        "Product";


    const productImage =
        product.mainImage ||
        product.image ||
        (
            Array.isArray(product.images)
                ? product.images[0]
                : ""
        ) ||
        "images/product-placeholder.jpg";


    const productPrice =
        Number(
            product.buyerPrice ??
            product.price ??
            0
        );


    /* --------------------------------------------------
       CHECK IF PRODUCT ALREADY EXISTS
    -------------------------------------------------- */

    const existingProduct =
        cart.find(
            item =>
                String(item.id) ===
                productId
        );


    if(existingProduct){

        existingProduct.quantity =
            Number(
                existingProduct.quantity || 0
            ) + 1;

    }else{

        cart.push({

            id:
                productId,

            name:
                productName,

            image:
                productImage,

            price:
                productPrice,

            quantity:
                1

        });

    }


    /* --------------------------------------------------
       SAVE CART
    -------------------------------------------------- */

    try{

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );

    }catch(error){

        console.error(
            "CATEGORY CART SAVE ERROR:",
            error
        );

        return;

    }


    /* --------------------------------------------------
       CALCULATE REAL CART COUNT
    -------------------------------------------------- */

    const totalQuantity =
        cart.reduce(
            function(total, item){

                return total +
                    Math.max(
                        0,
                        Number(
                            item.quantity || 0
                        )
                    );

            },
            0
        );


    /* --------------------------------------------------
       UPDATE CATEGORY CART BADGE
    -------------------------------------------------- */

    updateCategoryCartCount(
        totalQuantity
    );


    /* --------------------------------------------------
       UPDATE GLOBAL CART COUNT
    -------------------------------------------------- */

    window.yourStoreCartCount =
        totalQuantity;


    /* --------------------------------------------------
       NOTIFY OTHER PAGES / COMPONENTS
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


    /* --------------------------------------------------
       BUTTON FEEDBACK
    -------------------------------------------------- */

    if(button){

        const originalText =
            button.textContent;


        button.textContent =
            "Added ✓";


        button.classList.add(
            "added"
        );


        setTimeout(
            function(){

                button.textContent =
                    originalText;


                button.classList.remove(
                    "added"
                );

            },
            1200
        );

    }


    console.log(
        "PRODUCT ADDED TO CART:",
        product
    );

}


/* ==========================================================
   UPDATE CATEGORY CART COUNT
========================================================== */

function updateCategoryCartCount(
    totalQuantity = null
){

    const cartCount =
        document.getElementById(
            "cartCount"
        );


    /*
     * If a count wasn't supplied,
     * calculate it from the real cart.
     */

    if(totalQuantity === null){

        let cart = [];


        try{

            cart =
                JSON.parse(
                    localStorage.getItem(
                        "yourStoreCart"
                    )
                ) || [];

        }catch(error){

            cart = [];

        }


        if(!Array.isArray(cart)){

            cart = [];

        }


        totalQuantity =
            cart.reduce(
                function(total, item){

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


    if(!cartCount){

        return;

    }


    cartCount.textContent =
        totalQuantity > 99
            ? "99+"
            : String(
                totalQuantity
            );


    if(totalQuantity > 0){

        cartCount.classList.add(
            "has-items"
        );

    }else{

        cartCount.classList.remove(
            "has-items"
        );

    }

}


/* ==========================================================
   CATEGORY CART LISTENERS
========================================================== */

function initializeCategoryCartListeners(){

    /*
     * Initial count
     */

    updateCategoryCartCount();


    /*
     * Cart changed in another tab/window
     */

    window.addEventListener(
        "storage",
        function(event){

            if(
                event.key ===
                "yourStoreCart"
            ){

                updateCategoryCartCount();

            }

        }
    );


    /*
     * Cart changed by another
     * YourStore component.
     */

    window.addEventListener(
        "yourStoreCartCountUpdated",
        function(){

            updateCategoryCartCount();

        }
    );

}



/* ==========================================================
   AUTHENTICATION
========================================================== */

function initializeCategoryAuthentication(){

    onAuthStateChanged(
        auth,
        user => {

            currentUser =
                user || null;


            updateCategoryLoginStatus(
                currentUser
            );

        }
    );

}


/* ==========================================================
   UPDATE LOGIN STATUS
========================================================== */

function updateCategoryLoginStatus(
    user
){

    const signupLink =
        document.getElementById(
            "signupLink"
        );


    const buyerName =
        document.getElementById(
            "buyerName"
        );


    if(!signupLink){

        return;

    }


    if(user){

        const name =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Account";


        if(buyerName){

            buyerName.textContent =
                name;

        }


        signupLink.href =
            "buyer.html";


        signupLink.title =
            "Open your account";

    }else{

        if(buyerName){

            buyerName.textContent =
                "Sign Up";

        }


        signupLink.href =
            "signup.html";


        signupLink.title =
            "Create an account";

    }

}


/* ==========================================================
   CATEGORY SEARCH
========================================================== */

function initializeCategorySearch(){

    const input =
        document.getElementById(
            "categorySearch"
        );


    const button =
        document.getElementById(
            "categorySearchButton"
        );


    if(!input){

        return;

    }


    function performSearch(){

        const search =
            input.value
                .trim();


        if(!search){

            filteredCategoryProducts =
                [
                    ...categoryProducts
                ];

            renderCategoryProducts();

            return;

        }


        const term =
            search.toLowerCase();


        filteredCategoryProducts =
            categoryProducts.filter(
                product => {

                    const name =
                        String(
                            product.name ||
                            product.productName ||
                            ""
                        )
                        .toLowerCase();


                    const description =
                        String(
                            product.description ||
                            ""
                        )
                        .toLowerCase();


                    return (
                        name.includes(term) ||
                        description.includes(term)
                    );

                }
            );


        renderCategoryProducts();

    }


    input.addEventListener(
        "input",
        performSearch
    );


    if(button){

        button.addEventListener(
            "click",
            performSearch
        );

    }

}


/* ==========================================================
   SORT PRODUCTS
========================================================== */

function initializeCategorySort(){

    const select =
        document.getElementById(
            "sortProducts"
        );


    if(!select){

        return;

    }


    select.addEventListener(
        "change",
        () => {

            const value =
                select.value;


            if(value === "low"){

                filteredCategoryProducts.sort(
                    (
                        a,
                        b
                    ) =>
                        getProductPrice(a) -
                        getProductPrice(b)
                );

            }else if(
                value === "high"
            ){

                filteredCategoryProducts.sort(
                    (
                        a,
                        b
                    ) =>
                        getProductPrice(b) -
                        getProductPrice(a)
                );

            }else if(
                value === "rating"
            ){

                filteredCategoryProducts.sort(
                    (
                        a,
                        b
                    ) =>
                        Number(
                            b.rating || 0
                        ) -
                        Number(
                            a.rating || 0
                        )
                );

            }else{

                filteredCategoryProducts =
                    [
                        ...categoryProducts
                    ];

            }


            renderCategoryProducts();

        }
    );

}


/* ==========================================================
   CATEGORY TOAST
========================================================== */

function showCategoryToast(message){

    let toast =
        document.getElementById(
            "categoryToast"
        );


    if(!toast){

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "categoryToast";


        toast.className =
            "category-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showCategoryToast.timer
    );


    showCategoryToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* ==========================================================
   CATEGORY EMPTY MESSAGE
========================================================== */

function showCategoryMessage(message){

    const grid =
        document.getElementById(
            "categoryProductGrid"
        );


    const empty =
        document.getElementById(
            "categoryEmpty"
        );


    if(grid){

        grid.innerHTML = "";

    }


    if(empty){

        empty.hidden = false;


        const heading =
            empty.querySelector(
                "h2"
            );


        if(heading){

            heading.textContent =
                message;

        }

    }else if(grid){

        grid.innerHTML = `

            <div class="category-empty">

                <div class="empty-icon">
                    🛍️
                </div>

                <h2>
                    ${escapeHTML(message)}
                </h2>

                <p>
                    Try another category or return
                    to the store.
                </p>

                <a
                    href="index.html"
                    class="back-home-button"
                >
                    Continue Shopping
                </a>

            </div>

        `;

    }

}


/* ==========================================================
   FOOTER YEAR
========================================================== */

function initializeCategoryFooter(){

    const year =
        document.getElementById(
            "footerYear"
        );


    if(year){

        year.textContent =
            new Date().getFullYear();

    }

}


/* ==========================================================
   ESCAPE HTML
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


/* ==========================================================
   START CATEGORY PAGE
========================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initializeCategoryPage,
        {
            once: true
        }
    );

}else{

    initializeCategoryPage();

}

