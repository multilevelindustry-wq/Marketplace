/* ==========================================================
   YOURSTORE HOME
   INITIAL HOME PAGE FUNCTIONS
========================================================== */


import {
    db
} from "./firebase.js";


import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



import {
    auth
} from "./firebase.js";


import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


/* ==========================================================
   BUYER AUTHENTICATION + HOME NAME
========================================================== */


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


onAuthStateChanged(
    auth,
    async function(user){

        console.log(
            "CURRENT FIREBASE USER:",
            user
        );

        if(!user){

            console.log(
                "NO USER IS CURRENTLY LOGGED IN"
            );

            return;
        }

        console.log(
            "USER UID:",
            user.uid
        );

        console.log(
            "USER EMAIL:",
            user.email
        );
        
        console.log(
            "HOME AUTH STATE:",
            user
        );


        updateHomeBuyerName(
            user
        );
        

    }
);



/* ==========================================================
   FIREBASE AUTH STATE
========================================================== */

   


const testBuyerName =
    document.getElementById("buyerFirstName");

console.log(
    "BUYER NAME ELEMENT:",
    testBuyerName
);




/* ==========================================================
   CATEGORY DATA
========================================================== */

const homeCategories = [

    {
        name: "Fashion",
        icon: "",
        description: "Clothing & Style",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQy9v7vjVcsPJvlIhNCFlwFXwQ7kWKDcxPaaUubi-H9XQ&s=10"
    },

    {
        name: "Electronics",
        icon: "",
        description: "Phones & Gadgets",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM9z442WlUHdv0flMP4Sy6ssn3kiQkmZ8S_sqLflfg1w&s=10"
    },

    {
        name: "Shoes",
        icon: "",
        description: "Shoes & Footwear",
        image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSUTqch2RygRPwrFi3q2X1Hyeiw8z-kjEqfbZzSz_Wp_cqvWwI5a-hAJzk0a1W9BVK18dt7VVrqV9ahxFKhTcZpTDiSkaDOrGRaoKSkAy55u3bwlJIswOXLpUw&usqp=CAc"
    },

    {
        name: "Beauty",
        icon: "",
        description: "Beauty & Care",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv53m1o8hihGKzMsAPLDBPc3wtDuZ2Ea1VZ5DTXlNZmQ&s=10"
    },

    {
        name: "Groceries",
        icon: "",
        description: "Food & Essentials",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNzYxkvAdTUM3VXbYOWFkBNMcyPZJVWw-U6W-Eto_CWw&s=10"
    },

    {
        name: "Home",
        icon: "",
        description: "Home & Living",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6"
    },

    {
        name: "Kids",
        icon: "",
        description: "Kids & Baby",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8f8OR4yEDxFnYu5R4hqdgFV-BrpbOfLDUnz7yKl6-kg&s=10"
    },

    {
        name: "Sports",
        icon: "",
        description: "Sports & Fitness",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7aJWWZbj5zMLgGPhhwyUDgsZTkLISv92rPLA-u8Er0A&s=10"
    },

    {
        name: "Computers",
        icon: "",
        description: "Computers & Accessories",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
    },

    {
        name: "Phones",
        icon: "",
        description: "Phones & Tablets",
        image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSgqyNHLpwLFE0WAnyzdhLV29o9afFlZRNyA9gHG3CKBXpitEsS-SGuPGBklfKNbEWner4UQY-F0t-YYhrLJc5lNEowJkdZXl7HJh1s2MhlFz4ZcHy5VJ4N&usqp=CAc"
    },

    {
        name: "Accessories",
        icon: "",
        description: "Bags & Accessories",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdM5wPwATuV91x9Pz17wCx9xLKwxSVvgd9NfFjrom8kw&s=10"
    },

    {
        name: "Appliances",
        icon: "",
        description: "Home Appliances",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6gwrYyQT9IJIkL3LA8UnEXGTKLErWNGnAiADROkfGMA&s=10"
    },

    {
        name: "Furniture",
        icon: "",
        description: "Furniture",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc"
    },

    {
        name: "Automotive",
        icon: "",
        description: "Cars & Accessories",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70"
    },

    {
        name: "Books",
        icon: "",
        description: "Books & Learning",
        image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d"
    },

    {
        name: "Toys",
        icon: "",
        description: "Toys & Games",
        image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65"
    }

];




/* ==========================================================
   INITIALIZE HOME CART COUNT
========================================================== */

function initializeHomeCartCount(){

    /* --------------------------------------------------
       UPDATE IMMEDIATELY
    -------------------------------------------------- */

    updateHomeCartCount();


    /* --------------------------------------------------
       CART CHANGED FROM ANOTHER TAB / WINDOW
    -------------------------------------------------- */

    window.addEventListener(
        "storage",
        function(event){

            if(
                event.key ===
                "yourStoreCart"
            ){

                updateHomeCartCount();

            }

        }
    );


    /* --------------------------------------------------
       CART CHANGED INSIDE CURRENT PAGE
    -------------------------------------------------- */

    window.addEventListener(
        "yourStoreCartCountUpdated",
        function(event){

            /*
             * Do not use event.detail.count
             * as the source of truth.
             *
             * Read the actual cart again.
             */

            updateHomeCartCount();

        }
    );


    /* --------------------------------------------------
       OPTIONAL: REFRESH WHEN PAGE BECOMES VISIBLE
    -------------------------------------------------- */

    document.addEventListener(
        "visibilitychange",
        function(){

            if(
                document.visibilityState ===
                "visible"
            ){

                updateHomeCartCount();

            }

        }
    );


    /* --------------------------------------------------
       OPTIONAL: REFRESH WHEN WINDOW GETS FOCUS
    -------------------------------------------------- */

    window.addEventListener(
        "focus",
        function(){

            updateHomeCartCount();

        }
    );

}


/* ==========================================================
   START HOME CART COUNT
========================================================== */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initializeHomeCartCount
    );

}else{

    initializeHomeCartCount();

}








/* ==========================================================
   LOAD HOME PRODUCTS FROM FIRESTORE
========================================================== */

async function loadHomeProducts(){

    const grid =
        document.getElementById(
            "productGrid"
        );


    if(!grid){

        return;

    }


    /* ------------------------------------------------------
       SHOW LOADING
    ------------------------------------------------------ */

    grid.innerHTML = `

        <div class="products-loading">

            <div class="products-loading-spinner"></div>

            <p>
                Loading products...
            </p>

        </div>

    `;


    try {


        /* --------------------------------------------------
           FIRESTORE PRODUCTS
        -------------------------------------------------- */

        const productsReference =
            collection(
                db,
                "products"
            );


        const productsQuery =
            query(
                productsReference,
                orderBy(
                    "createdAt",
                    "desc"
                ),
                limit(30)
            );


        const snapshot =
            await getDocs(
                productsQuery
            );


        const products = [];


        snapshot.forEach(
            documentSnapshot => {

                products.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        /* --------------------------------------------------
           NO PRODUCTS
        -------------------------------------------------- */

        if(
            products.length === 0
        ){

            grid.innerHTML = `

                <div class="no-products">

                    <p>
                        No products available.
                    </p>

                </div>

            `;

            return;

        }


        /* --------------------------------------------------
           DISPLAY PRODUCTS
        -------------------------------------------------- */

        grid.innerHTML =
            products
                .map(
                    product =>
                        createHomeProductCard(
                            product
                        )
                )
                .join("");


    } catch(error){

        console.error(
            "Unable to load home products:",
            error
        );


        /* --------------------------------------------------
           FALLBACK IF createdAt IS MISSING
        -------------------------------------------------- */

        try {

            const productsReference =
                collection(
                    db,
                    "products"
                );


            const snapshot =
                await getDocs(
                    productsReference
                );


            const products = [];


            snapshot.forEach(
                documentSnapshot => {

                    products.push({

                        id:
                            documentSnapshot.id,

                        ...documentSnapshot.data()

                    });

                }
            );


            if(
                products.length === 0
            ){

                grid.innerHTML = `

                    <div class="no-products">

                        <p>
                            No products available.
                        </p>

                    </div>

                `;

                return;

            }


            /* ----------------------------------------------
               LIMIT TO 30 PRODUCTS
            ---------------------------------------------- */

            const limitedProducts =
                products.slice(
                    0,
                    30
                );


            grid.innerHTML =
                limitedProducts
                    .map(
                        product =>
                            createHomeProductCard(
                                product
                            )
                    )
                    .join("");


        } catch(fallbackError){

            console.error(
                "Fallback product loading error:",
                fallbackError
            );


            grid.innerHTML = `

                <div class="no-products">

                    <p>
                        Unable to load products.
                    </p>

                </div>

            `;

        }

    }

}








function createHomeProductCard(product){

    const productId =
        product.id;


    const productName =
        product.name ||
        product.productName ||
        "Product";


    /* ======================================================
       PRODUCT IMAGE
    ====================================================== */

    const image =
        product.mainImage ||
        product.image ||
        (
            Array.isArray(product.images)
                ? product.images[0]
                : ""
        ) ||
        "images/product-placeholder.jpg";


    /* ======================================================
       CURRENT PRICE
    ====================================================== */

    const price =
        Number(
            product.buyerPrice ??
            product.price ??
            0
        );


    /* ======================================================
       AUTOMATIC OLD PRICE
       
       Old price is automatically 20% higher.
       
       Example:
       ₦100,000 current price
       ₦120,000 old price
    ====================================================== */

    const oldPrice =
        price > 0
            ? Math.round(price * 1.20)
            : 0;


    /* ======================================================
       RATING
       
       ALWAYS SHOW RATING
       
       If no ratings yet:
       ★ 0.0 (0)
    ====================================================== */

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


    /* ======================================================
       AUTOMATIC BADGE
    ====================================================== */

    const badge =
        getAutomaticProductBadge(
            product
        );


    return `

        <article
            class="product-card"
            data-product-id="${escapeProductAttribute(
                productId
            )}"
        >


            <!-- ==================================================
                 PRODUCT IMAGE
            ================================================== -->

            <a
                href="product.html?id=${encodeURIComponent(
                    productId
                )}"
                class="product-image"
            >

                ${
                    badge
                        ? `
                            <span class="product-badge">

                                ${escapeProductAttribute(
                                    badge.text
                                )}

                            </span>
                          `
                        : ""
                }


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


            <!-- ==================================================
                 PRODUCT INFORMATION
            ================================================== -->

            <div class="product-info">


                <!-- CATEGORY -->

                <div class="product-category">

                    ${escapeProductAttribute(
                        product.category ||
                        "General"
                    )}

                </div>


                <!-- PRODUCT NAME -->

                <div class="product-name">

                    ${escapeProductAttribute(
                        productName
                    )}

                </div>


                <!-- ==================================================
                     PRICE
                ================================================== -->

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


                <!-- ==================================================
                     RATING
                     
                     ALWAYS DISPLAYED
                ================================================== -->

                <div class="product-rating">

                    <span class="rating-stars">

                        ★

                    </span>

                    <span class="rating-number">

                        ${rating.toFixed(1)}

                    </span>

                    <span class="rating-reviews">

                        (${reviews.toLocaleString()})

                    </span>

                </div>


            </div>

        </article>

    `;

}





/* ==========================================================
   AUTOMATIC PRODUCT BADGE SYSTEM
========================================================== */

function getAutomaticProductBadge(product){

    const views =
        Number(
            product.views ?? 0
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


    /* ======================================================
       SELLER-MANUALLY-DEFINED BADGE
       
       If you later want sellers/admin to control badges,
       product.badge will take priority.
    ====================================================== */

    if(product.badge){

        return {

            text:
                product.badge

        };

    }


    /* ======================================================
       TRENDING
       
       Products receiving many views.
    ====================================================== */

    if(views >= 100){

        return {

            text:
                "Trending"

        };

    }


    /* ======================================================
       POPULAR
       
       Products with many reviews.
    ====================================================== */

    if(reviews >= 20){

        return {

            text:
                "Popular"

        };

    }


    /* ======================================================
       TOP RATED
       
       Products with strong ratings.
    ====================================================== */

    if(
        rating >= 4.5 &&
        reviews >= 5
    ){

        return {

            text:
                "Top Rated"

        };

    }


    /* ======================================================
       BEST SELLER
       
       If your product has a sales field.
    ====================================================== */

    const sales =
        Number(
            product.sales ??
            product.sold ??
            product.orders ??
            0
        );


    if(sales >= 20){

        return {

            text:
                "Best Seller"

        };

    }


    /* ======================================================
       HOT DEAL
       
       Product with an active discount.
    ====================================================== */

    if(
        product.price &&
        product.oldPrice
    ){

        const currentPrice =
            Number(
                product.price
            );


        const sellerOldPrice =
            Number(
                product.oldPrice
            );


        if(
            sellerOldPrice > currentPrice
        ){

            return {

                text:
                    "Hot Deal"

            };

        }

    }


    /* ======================================================
       NEW ARRIVAL
       
       Products created recently.
    ====================================================== */

    if(product.createdAt){

        let createdDate = null;


        if(
            product.createdAt?.toDate
        ){

            createdDate =
                product.createdAt.toDate();

        }else if(
            product.createdAt instanceof Date
        ){

            createdDate =
                product.createdAt;

        }else if(
            typeof product.createdAt === "string" ||
            typeof product.createdAt === "number"
        ){

            createdDate =
                new Date(
                    product.createdAt
                );

        }


        if(
            createdDate &&
            !isNaN(
                createdDate.getTime()
            )
        ){

            const ageInDays =
                (
                    Date.now() -
                    createdDate.getTime()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                );


            if(ageInDays <= 14){

                return {

                    text:
                        "New Arrival"

                };

            }

        }

    }


    /* ======================================================
       NO BADGE
    ====================================================== */

    return null;

}






/* ==========================================================
   ESCAPE PRODUCT ATTRIBUTE
========================================================== */

function escapeProductAttribute(value){

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    );

}







/* ==========================================================
   CATEGORY SLIDER
========================================================== */

function loadCategorySlider(){

    const track =
        document.getElementById(
            "categoryTrack"
        );

    if(!track){

        return;

    }


    const categories = [
        ...homeCategories,
        ...homeCategories
    ];


    track.innerHTML =
        categories.map(
            category => `

                <a
                    href="category.html?category=${encodeURIComponent(category.name)}"
                    class="category-card"
                >

                    <div class="category-image">

                        <img
                            src="${category.image}"
                            alt="${category.name}"
                            loading="lazy"
                        >

                    </div>

                    <div class="category-card-content">

                        <strong>
                            ${category.name}
                        </strong>

                        <small>
                            ${category.description}
                        </small>

                    </div>

                </a>

            `
        ).join("");

}


/* ==========================================================
   FEATURED CATEGORIES
========================================================== */

function loadFeaturedCategories(){

    const container =
        document.getElementById(
            "featuredCategoryGrid"
        );


    if(!container){

        return;

    }


    container.innerHTML =
        homeCategories
            .slice(0, 12)
            .map(
                category => `

                    <a
                        href="category.html?category=${encodeURIComponent(
                            category.name
                        )}"
                        class="featured-category-card"
                    >

                        <!-- CATEGORY IMAGE -->

                        <div class="featured-category-image">

                            <img
                                src="${escapeProductAttribute(
                                    category.image
                                )}"
                                alt="${escapeProductAttribute(
                                    category.name
                                )}"
                                loading="lazy"
                            >

                        </div>


                        <!-- CATEGORY INFORMATION -->

                        <div class="featured-category-content">

                            <span class="featured-category-icon">

                                ${category.icon || "🛍️"}

                            </span>


                            <div class="featured-category-text">

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

                        </div>

                    </a>

                `
            )
            .join("");

}


        
        
        
        
        
        
        


/* ==========================================================
   UPDATE HOME BUYER NAME
========================================================== */

async function updateHomeBuyerName(user){

    const nameElement =
        document.getElementById(
            "buyerFirstName"
        );

    const accountButton =
        document.getElementById(
            "accountButton"
        );


    console.log(
        "HOME NAME ELEMENT:",
        nameElement
    );


    if(!nameElement){

        console.error(
            "buyerFirstName element not found"
        );

        return;

    }


    /* ------------------------------------------------------
       USER IS NOT LOGGED IN
    ------------------------------------------------------ */

    if(!user){

        nameElement.textContent =
            "Sign In";


        if(accountButton){

            accountButton.href =
                "buyer.html";

        }


        return;

    }


    console.log(
        "HOME AUTH USER:",
        user.uid
    );


    try {

        /* --------------------------------------------------
           LOAD BUYER DOCUMENT
        -------------------------------------------------- */

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


        let firstName = "";


        if(
            buyerSnapshot.exists()
        ){

            const buyerData =
                buyerSnapshot.data();


            console.log(
                "HOME BUYER DATA:",
                buyerData
            );


            firstName =
                buyerData.firstName ||
                buyerData.first_name ||
                buyerData.name ||
                "";

        }


        /* --------------------------------------------------
           FALLBACK TO FIREBASE AUTH
        -------------------------------------------------- */

        if(!firstName){

            firstName =
                user.displayName ||
                "";

        }


        /* --------------------------------------------------
           FALLBACK TO EMAIL
        -------------------------------------------------- */

        if(!firstName){

            firstName =
                user.email
                    ? user.email.split("@")[0]
                    : "Account";

        }


        /* --------------------------------------------------
           DISPLAY NAME
        -------------------------------------------------- */

        nameElement.textContent =
            firstName;


        /* --------------------------------------------------
           ACCOUNT LINK
        -------------------------------------------------- */

        if(accountButton){

            accountButton.href =
                "buyer.html";

        }


        console.log(
            "HOME FIRST NAME DISPLAYED:",
            firstName
        );


    } catch(error){

        console.error(
            "HOME BUYER NAME ERROR:",
            error
        );


        /*
         * Even if Firestore fails,
         * don't leave the user with
         * a blank account button.
         */

        const fallbackName =
            user.displayName ||
            (
                user.email
                    ? user.email.split("@")[0]
                    : "Account"
            );


        nameElement.textContent =
            fallbackName;

    }

}



                        






/* ==========================================================
   CART COUNT
========================================================== */

/* ==========================================================
   HOME CART COUNT
   USES THE REAL YOURSTORE CART
========================================================== */

function updateHomeCartCount(){

    const countElement =
        document.getElementById(
            "cartCount"
        );


    if(!countElement){

        return;

    }


    let cart = [];


    /* --------------------------------------------------
       READ REAL CART
    -------------------------------------------------- */

    try{

        const savedCart =
            localStorage.getItem(
                "yourStoreCart"
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
            "HOME CART COUNT ERROR:",
            error
        );

        cart = [];

    }


    /* --------------------------------------------------
       CALCULATE TOTAL QUANTITY
    -------------------------------------------------- */

    const totalQuantity =
        cart.reduce(
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


                return total + quantity;

            },
            0
        );


    /* --------------------------------------------------
       DISPLAY COUNT
    -------------------------------------------------- */

    countElement.textContent =
        totalQuantity > 99
            ? "99+"
            : String(
                totalQuantity
            );


    /* --------------------------------------------------
       BADGE STATE
    -------------------------------------------------- */

    if(totalQuantity > 0){

        countElement.classList.add(
            "has-items"
        );

    }else{

        countElement.classList.remove(
            "has-items"
        );

    }


    /* --------------------------------------------------
       GLOBAL CART COUNT
    -------------------------------------------------- */

    window.yourStoreCartCount =
        totalQuantity;


    return totalQuantity;

}


/* ==========================================================
   INITIALIZE HOME
========================================================== */

function initializeHome(){

    loadCategorySlider();

    loadFeaturedCategories();

    loadHomeProducts();

    initializeHomeCartCount();

}


if(
    document.readyState === "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initializeHome,
        {
            once: true
        }
    );

}
else {

    initializeHome();

}


/* ==========================================================
   HOME PAGE PRODUCT SEARCH
   Searches products across ALL categories
========================================================== */


/* ==========================================================
   SEARCH ELEMENTS
========================================================== */

const homeSearchInput =
    document.getElementById(
        "homeSearch"
    );

const homeSearchButton =
    document.getElementById(
        "searchButton"
    );


/* ==========================================================
   PERFORM HOME PRODUCT SEARCH
========================================================== */

async function searchHomeProducts(){

    if(!homeSearchInput){

        return;

    }


    const searchTerm =
        homeSearchInput.value
            .trim();


    /*
       Do not search empty text.
    */

    if(!searchTerm){

        return;

    }


    /*
       Send the search term to a dedicated
       search results page.

       Example:

       search.html?q=iphone
    */

    window.location.href =
        "search.html?q=" +
        encodeURIComponent(
            searchTerm
        );

}


/* ==========================================================
   SEARCH BUTTON
========================================================== */

if(homeSearchButton){

    homeSearchButton.addEventListener(
        "click",
        function(){

            searchHomeProducts();

        }
    );

}


/* ==========================================================
   ENTER KEY
========================================================== */

if(homeSearchInput){

    homeSearchInput.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                event.preventDefault();

                searchHomeProducts();

            }

        }
    );

}

