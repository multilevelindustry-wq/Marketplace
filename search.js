/* ==========================================================
   YOURSTORE SEARCH PAGE
   Search products across all categories
========================================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   PAGE STATE
========================================================== */

let allSearchProducts = [];

let filteredSearchProducts = [];

let displayedSearchProducts = [];

let currentSearchTerm = "";

let currentCategory = "all";

let currentSort = "relevance";

let currentPage = 1;

const PRODUCTS_PER_PAGE = 24;


/* ==========================================================
   PAGE ELEMENTS
========================================================== */

const searchPageInput =
    document.getElementById(
        "searchPageInput"
    );


const searchPageButton =
    document.getElementById(
        "searchPageButton"
    );


const searchPageForm =
    document.getElementById(
        "searchPageForm"
    );


const searchProductsGrid =
    document.getElementById(
        "searchProductsGrid"
    );


const searchResultCount =
    document.getElementById(
        "searchResultCount"
    );


const searchCategoryFilter =
    document.getElementById(
        "searchCategoryFilter"
    );


const searchSort =
    document.getElementById(
        "searchSort"
    );


const searchLoading =
    document.getElementById(
        "searchLoading"
    );


const searchEmptyState =
    document.getElementById(
        "searchEmptyState"
    );


const searchErrorState =
    document.getElementById(
        "searchErrorState"
    );


const searchLoadMoreButton =
    document.getElementById(
        "searchLoadMoreButton"
    );


const clearFiltersButton =
    document.getElementById(
        "clearFiltersButton"
    );


const searchFilterChips =
    document.getElementById(
        "activeSearchFilters"
    );


const mobileFilterButton =
    document.getElementById(
        "mobileFilterButton"
    );


const searchFilters =
    document.getElementById(
        "searchFilters"
    );


const filterOverlay =
    document.getElementById(
        "filterOverlay"
    );


const retrySearchButton =
    document.getElementById(
        "retrySearchButton"
    );


const emptySearchButton =
    document.getElementById(
        "emptySearchButton"
    );


/* ==========================================================
   UTILITY
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
   NORMALIZE PRODUCT FROM FIRESTORE
========================================================== */

function normalizeProduct(
    data,
    id
){

    const product = {

        id: id,

        ...data

    };


    /* ======================================================
       BASIC PRODUCT INFORMATION
    ====================================================== */

    product.name =
        product.name ||
        product.title ||
        product.productName ||
        "Unnamed Product";


    product.title =
        product.title ||
        product.name;


    product.category =
        product.category ||
        product.categoryName ||
        product.mainCategory ||
        "Other";


    product.description =
        product.description ||
        product.shortDescription ||
        "";


    product.sellerName =
        product.sellerName ||
        product.storeName ||
        product.shopName ||
        product.businessName ||
        "YOURSTORE Seller";


    /* ======================================================
       FIND PRODUCT PRICE
    ====================================================== */

    let detectedPrice = 0;


    /*
       DIRECT FIRESTORE PRICE
    */

    const directPriceFields = [

        product.price,

        product.productPrice,

        product.sellingPrice,

        product.salePrice,

        product.currentPrice,

        product.amount,

        product.unitPrice

    ];


    for(
        const value of directPriceFields
    ){

        const number =
            Number(
                String(
                    value ?? ""
                )
                .replace(/₦/g, "")
                .replace(/,/g, "")
                .trim()
            );


        if(
            value !== undefined &&
            value !== null &&
            value !== "" &&
            Number.isFinite(number) &&
            number > 0
        ){

            detectedPrice =
                number;

            break;

        }

    }


    /* ======================================================
       CHECK PRODUCT VARIATIONS
    ====================================================== */

    if(
        detectedPrice <= 0 &&
        Array.isArray(
            product.variations
        )
    ){

        const variationPrices =
            product.variations
                .map(
                    variation => {

                        if(
                            !variation
                        ){

                            return 0;

                        }


                        const possibleValues = [

                            variation.price,

                            variation.productPrice,

                            variation.sellingPrice,

                            variation.salePrice,

                            variation.currentPrice,

                            variation.amount,

                            variation.unitPrice

                        ];


                        for(
                            const value of possibleValues
                        ){

                            const number =
                                Number(
                                    String(
                                        value ?? ""
                                    )
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
                                value !== undefined &&
                                value !== null &&
                                value !== "" &&
                                Number.isFinite(number) &&
                                number > 0
                            ){

                                return number;

                            }

                        }


                        return 0;

                    }
                )
                .filter(
                    price =>
                        price > 0
                );


        /*
           Use the lowest variation price
           as the product starting price.
        */

        if(
            variationPrices.length
        ){

            detectedPrice =
                Math.min(
                    ...variationPrices
                );

        }

    }


    /* ======================================================
       CHECK OTHER POSSIBLE VARIATION STRUCTURES
    ====================================================== */

    if(
        detectedPrice <= 0 &&
        Array.isArray(
            product.options
        )
    ){

        const optionPrices = [];


        product.options.forEach(
            option => {

                if(
                    !option ||
                    typeof option !==
                    "object"
                ){

                    return;

                }


                [

                    option.price,

                    option.productPrice,

                    option.sellingPrice,

                    option.salePrice,

                    option.amount

                ]
                .forEach(
                    value => {

                        const number =
                            Number(
                                String(
                                    value ?? ""
                                )
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
                                number
                            ) &&
                            number > 0
                        ){

                            optionPrices.push(
                                number
                            );

                        }

                    }
                );

            }
        );


        if(
            optionPrices.length
        ){

            detectedPrice =
                Math.min(
                    ...optionPrices
                );

        }

    }


    /* ======================================================
       SAVE NORMALIZED PRICE
    ====================================================== */

    product.price =
    getSearchProductPrice(
        product
    );


    /* ======================================================
       OLD PRICE
    ====================================================== */

    let detectedOldPrice = 0;


    const oldPriceFields = [

        product.oldPrice,

        product.originalPrice,

        product.compareAtPrice,

        product.previousPrice

    ];


    for(
        const value of oldPriceFields
    ){

        const number =
            Number(
                String(
                    value ?? ""
                )
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
            value !== undefined &&
            value !== null &&
            value !== "" &&
            Number.isFinite(number) &&
            number > 0
        ){

            detectedOldPrice =
                number;

            break;

        }

    }


    product.oldPrice =
        detectedOldPrice;


    /* ======================================================
       IMAGES
    ====================================================== */

    let image = "";


    if(
        typeof product.image ===
        "string"
    ){

        image =
            product.image;

    }


    else if(
        typeof product.imageUrl ===
        "string"
    ){

        image =
            product.imageUrl;

    }


    else if(
        typeof product.photoURL ===
        "string"
    ){

        image =
            product.photoURL;

    }


    else if(
        typeof product.thumbnail ===
        "string"
    ){

        image =
            product.thumbnail;

    }


    else if(
        Array.isArray(
            product.images
        ) &&
        product.images.length
    ){

        const firstImage =
            product.images[0];


        if(
            typeof firstImage ===
            "string"
        ){

            image =
                firstImage;

        }

        else if(
            firstImage?.url
        ){

            image =
                firstImage.url;

        }

        else if(
            firstImage?.secure_url
        ){

            image =
                firstImage.secure_url;

        }

    }


    /*
       If the normal image is missing,
       try the first variation image.
    */

    if(
        !image &&
        Array.isArray(
            product.variations
        )
    ){

        for(
            const variation of
            product.variations
        ){

            if(
                typeof variation ===
                "object"
            ){

                if(
                    typeof variation.image ===
                    "string"
                ){

                    image =
                        variation.image;

                    break;

                }


                if(
                    typeof variation.imageUrl ===
                    "string"
                ){

                    image =
                        variation.imageUrl;

                    break;

                }

            }

        }

    }


    product.image =
        image ||
        "default-product.jpg";


    /* ======================================================
       SEARCH TEXT
    ====================================================== */

    product.searchText =
        [

            product.name,

            product.title,

            product.category,

            product.description,

            product.sellerName,

            product.brand,

            product.subcategory,

            product.tags

        ]
        .flat()
        .join(" ")
        .toLowerCase();


    /*
       DEBUG INFORMATION
    */

    console.log(
        "SEARCH PRODUCT:",
        product.name,
        "PRICE:",
        product.price,
        "VARIATIONS:",
        product.variations
    );


    return product;

}


/* ==========================================================
   LOAD PRODUCTS FROM FIRESTORE
========================================================== */

async function loadAllSearchProducts(){

    showSearchLoading();

    try{

        const productsSnapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        allSearchProducts = [];


        productsSnapshot.forEach(
            productDoc => {

                const rawData =
                    productDoc.data();


                console.log(
                    "================================"
                );

                console.log(
                    "PRODUCT ID:",
                    productDoc.id
                );

                console.log(
                    "RAW FIRESTORE PRODUCT:",
                    rawData
                );

                console.log(
                    "PRICE:",
                    rawData.price
                );

                console.log(
                    "SELLING PRICE:",
                    rawData.sellingPrice
                );

                console.log(
                    "VARIATIONS:",
                    rawData.variations
                );

                console.log(
                    "VARIANTS:",
                    rawData.variants
                );

                console.log(
                    "OPTIONS:",
                    rawData.options
                );

                console.log(
                    "================================"
                );


                const product =
                    normalizeProduct(
                        rawData,
                        productDoc.id
                    );


                if(
                    product.active === false ||
                    product.status === "inactive" ||
                    product.deleted === true
                ){

                    return;

                }


                allSearchProducts.push(
                    product
                );

            }
        );


        buildCategoryFilter();

        readSearchFromURL();

        applySearch();


    }
    catch(error){

        console.error(
            "SEARCH PRODUCT LOAD ERROR:",
            error
        );

        showSearchError();

    }

}


/* ==========================================================
   BUILD CATEGORY FILTER
========================================================== */

function buildCategoryFilter(){

    if(
        !searchCategoryFilter
    ){

        return;

    }


    const categories =
        [
            ...new Set(
                allSearchProducts
                    .map(
                        product =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a,b) =>
                String(a)
                    .localeCompare(
                        String(b)
                    )
        );


    searchCategoryFilter.innerHTML = `

        <option value="all">
            All Categories
        </option>

    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            searchCategoryFilter.appendChild(
                option
            );

        }
    );


    searchCategoryFilter.value =
        currentCategory;

}


/* ==========================================================
   READ URL SEARCH
========================================================== */

function readSearchFromURL(){

    const params =
        new URLSearchParams(
            window.location.search
        );


    const query =
        params.get("q") ||
        params.get("search") ||
        "";


    const category =
        params.get("category") ||
        "all";


    currentSearchTerm =
        query.trim();


    currentCategory =
        category;


    if(searchPageInput){

        searchPageInput.value =
            currentSearchTerm;

    }


    if(searchCategoryFilter){

        searchCategoryFilter.value =
            currentCategory;

    }

}


/* ==========================================================
   UPDATE URL
========================================================== */

function updateSearchURL(){

    const params =
        new URLSearchParams();


    if(
        currentSearchTerm
    ){

        params.set(
            "q",
            currentSearchTerm
        );

    }


    if(
        currentCategory &&
        currentCategory !== "all"
    ){

        params.set(
            "category",
            currentCategory
        );

    }


    const query =
        params.toString();


    const newURL =
        query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname;


    window.history.replaceState(
        {},
        "",
        newURL
    );

}


/* ==========================================================
   APPLY SEARCH
========================================================== */

function applySearch(){

    const term =
        currentSearchTerm
            .toLowerCase()
            .trim();


    filteredSearchProducts =
        allSearchProducts.filter(
            product => {

                /*
                   Category filter.
                */

                const categoryMatch =
                    currentCategory ===
                    "all" ||

                    String(
                        product.category
                    )
                    .toLowerCase() ===
                    String(
                        currentCategory
                    )
                    .toLowerCase();


                if(!categoryMatch){

                    return false;

                }


                /*
                   No search term means
                   show all products.
                */

                if(!term){

                    return true;

                }


                /*
                   Match product across
                   name, category, seller,
                   brand, description, tags.
                */

                return product.searchText
                    .includes(
                        term
                    );

            }
        );


    sortSearchProducts();


    currentPage = 1;


    renderSearchResults();


    updateSearchURL();


    renderActiveFilters();

}


/* ==========================================================
   SORT PRODUCTS
========================================================== */

function sortSearchProducts(){

    filteredSearchProducts.sort(
        (a,b) => {

            switch(
                currentSort
            ){

                case "price-low":

                    return (
                        a.price -
                        b.price
                    );


                case "price-high":

                    return (
                        b.price -
                        a.price
                    );


                case "newest":

                    return (
                        getTimestamp(
                            b.createdAt
                        ) -
                        getTimestamp(
                            a.createdAt
                        )
                    );


                case "name":

                    return String(
                        a.name
                    )
                    .localeCompare(
                        String(
                            b.name
                        )
                    );


                case "relevance":

                default:

                    return (
                        getRelevanceScore(
                            b,
                            currentSearchTerm
                        ) -
                        getRelevanceScore(
                            a,
                            currentSearchTerm
                        )
                    );

            }

        }
    );

}


/* ==========================================================
   RELEVANCE
========================================================== */

function getRelevanceScore(
    product,
    term
){

    if(!term){

        return 0;

    }


    const search =
        String(
            term
        )
        .toLowerCase()
        .trim();


    if(!search){

        return 0;

    }


    let score = 0;


    const name =
        String(
            product.name
        )
        .toLowerCase();


    const category =
        String(
            product.category
        )
        .toLowerCase();


    const brand =
        String(
            product.brand ||
            ""
        )
        .toLowerCase();


    if(
        name === search
    ){

        score += 100;

    }


    if(
        name.startsWith(
            search
        )
    ){

        score += 50;

    }


    if(
        name.includes(
            search
        )
    ){

        score += 30;

    }


    if(
        category.includes(
            search
        )
    ){

        score += 15;

    }


    if(
        brand.includes(
            search
        )
    ){

        score += 20;

    }


    score += Number(
        product.views ||
        product.viewCount ||
        0
    ) / 1000;


    return score;

}


/* ==========================================================
   TIMESTAMP
========================================================== */

function getTimestamp(
    value
){

    if(!value){

        return 0;

    }


    if(
        typeof value.toMillis ===
        "function"
    ){

        return value.toMillis();

    }


    if(
        value.seconds
    ){

        return (
            Number(
                value.seconds
            ) * 1000
        );

    }


    const date =
        new Date(
            value
        );


    return isNaN(
        date.getTime()
    )
        ? 0
        : date.getTime();

}


/* ==========================================================
   RENDER RESULTS
========================================================== */

function renderSearchResults(){

    if(!searchProductsGrid){

        return;

    }


    hideSearchStates();


    const end =
        currentPage *
        PRODUCTS_PER_PAGE;


    displayedSearchProducts =
        filteredSearchProducts.slice(
            0,
            end
        );


    if(
        searchResultCount
    ){

        searchResultCount.textContent =
            filteredSearchProducts.length;

    }


    if(
        !filteredSearchProducts.length
    ){

        showSearchEmpty();

        return;

    }


    searchProductsGrid.innerHTML =
        displayedSearchProducts
            .map(
                createSearchProductCard
            )
            .join("");


    /*
       Load more visibility.
    */

    if(
        searchLoadMoreButton
    ){

        searchLoadMoreButton.style.display =
            displayedSearchProducts.length <
            filteredSearchProducts.length
                ? "inline-flex"
                : "none";

    }

}


/* ==========================================================
   GET SEARCH PRODUCT PRICE
========================================================== */

function getSearchProductPrice(product){

    if(!product){

        return 0;

    }


    const possiblePrices = [

        product.buyerPrice,

        product.price,

        product.sellingPrice,

        product.salePrice,

        product.currentPrice,

        product.amount,

        product.unitPrice

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
   CREATE PRODUCT CARD
========================================================== */

function createSearchProductCard(
    product
){

    const productId =
        encodeURIComponent(
            product.id
        );


    const image =
        escapeHTML(
            product.image
        );


    const name =
        escapeHTML(
            product.name
        );


    const category =
        escapeHTML(
            product.category
        );


    const seller =
        escapeHTML(
            product.sellerName
        );


    const productPrice =
    getSearchProductPrice(
        product
    );


const price =
    formatCurrency(
        productPrice
    );


const oldPrice =
    Number(
        product.oldPrice
    ) || 0;


let oldPriceHTML = "";


if(
    oldPrice >
    productPrice &&
    productPrice > 0
){

    oldPriceHTML = `

        <span class="search-product-old-price">

            ${formatCurrency(
                oldPrice
            )}

        </span>

    `;

}


    let badgeHTML = "";


    if(
        product.badge
    ){

        badgeHTML = `

            <span class="search-product-badge">

                ${escapeHTML(
                    product.badge
                )}

            </span>

        `;

    }


    return `

        <a
            href="product.html?id=${productId}"
            class="search-product-card"
        >

            ${badgeHTML}


            <div
                class="search-product-image"
            >

                <img
                    src="${image}"
                    alt="${name}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='default-product.jpg';
                    "
                >

            </div>


            <div
                class="search-product-content"
            >

                <span
                    class="search-product-category"
                >
                    ${category}
                </span>


                <div
                    class="search-product-name"
                >
                    ${name}
                </div>


                <strong
                    class="search-product-price"
                >
                    ${price}

                    ${oldPriceHTML}

                </strong>


                <span
                    class="search-product-seller"
                >
                    Sold by ${seller}
                </span>

            </div>

        </a>

    `;

}


/* ==========================================================
   FORMAT CURRENCY
========================================================== */

function formatCurrency(
    amount
){

    const number =
        Number(
            amount
        ) || 0;


    return "₦" +
        number.toLocaleString(
            "en-NG",
            {
                minimumFractionDigits:2,
                maximumFractionDigits:2
            }
        );

}


/* ==========================================================
   SEARCH SUBMIT
========================================================== */

function performSearch(){

    if(searchPageInput){

        currentSearchTerm =
            searchPageInput.value
                .trim();

    }


    applySearch();

}


/* ==========================================================
   FORM
========================================================== */

if(searchPageForm){

    searchPageForm.addEventListener(
        "submit",
        function(event){

            event.preventDefault();

            performSearch();

        }
    );

}


if(searchPageButton){

    searchPageButton.addEventListener(
        "click",
        performSearch
    );

}


/* ==========================================================
   LIVE SEARCH
========================================================== */

if(searchPageInput){

    searchPageInput.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                event.preventDefault();

                performSearch();

            }

        }
    );

}


/* ==========================================================
   CATEGORY FILTER
========================================================== */

if(searchCategoryFilter){

    searchCategoryFilter.addEventListener(
        "change",
        function(){

            currentCategory =
                this.value ||
                "all";

            applySearch();

        }
    );

}


/* ==========================================================
   SORT
========================================================== */

if(searchSort){

    searchSort.addEventListener(
        "change",
        function(){

            currentSort =
                this.value ||
                "relevance";

            sortSearchProducts();

            currentPage = 1;

            renderSearchResults();

        }
    );

}


/* ==========================================================
   CLEAR FILTERS
========================================================== */

if(clearFiltersButton){

    clearFiltersButton.addEventListener(
        "click",
        function(){

            currentSearchTerm =
                "";

            currentCategory =
                "all";

            currentSort =
                "relevance";


            if(searchPageInput){

                searchPageInput.value =
                    "";

            }


            if(searchCategoryFilter){

                searchCategoryFilter.value =
                    "all";

            }


            if(searchSort){

                searchSort.value =
                    "relevance";

            }


            applySearch();

        }
    );

}


/* ==========================================================
   LOAD MORE
========================================================== */

if(searchLoadMoreButton){

    searchLoadMoreButton.addEventListener(
        "click",
        function(){

            currentPage++;

            renderSearchResults();

        }
    );

}


/* ==========================================================
   ACTIVE FILTER CHIPS
========================================================== */

function renderActiveFilters(){

    if(!searchFilterChips){

        return;

    }


    searchFilterChips.innerHTML =
        "";


    if(
        currentSearchTerm
    ){

        searchFilterChips.innerHTML += `

            <span class="search-filter-chip">

                Search:
                ${escapeHTML(
                    currentSearchTerm
                )}

                <button
                    type="button"
                    data-remove="search"
                    aria-label="Remove search"
                >
                    ×
                </button>

            </span>

        `;

    }


    if(
        currentCategory !==
        "all"
    ){

        searchFilterChips.innerHTML += `

            <span class="search-filter-chip">

                Category:
                ${escapeHTML(
                    currentCategory
                )}

                <button
                    type="button"
                    data-remove="category"
                    aria-label="Remove category"
                >
                    ×
                </button>

            </span>

        `;

    }


    searchFilterChips
        .querySelectorAll(
            "button[data-remove]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(){

                        const type =
                            this.dataset.remove;


                        if(
                            type ===
                            "search"
                        ){

                            currentSearchTerm =
                                "";

                            if(
                                searchPageInput
                            ){

                                searchPageInput.value =
                                    "";

                            }

                        }


                        if(
                            type ===
                            "category"
                        ){

                            currentCategory =
                                "all";

                            if(
                                searchCategoryFilter
                            ){

                                searchCategoryFilter.value =
                                    "all";

                            }

                        }


                        applySearch();

                    }
                );

            }
        );

}


/* ==========================================================
   MOBILE FILTER
========================================================== */

function openMobileFilters(){

    if(searchFilters){

        searchFilters.classList.add(
            "mobile-open"
        );

    }


    if(filterOverlay){

        filterOverlay.style.display =
            "block";

    }

}


function closeMobileFilters(){

    if(searchFilters){

        searchFilters.classList.remove(
            "mobile-open"
        );

    }


    if(filterOverlay){

        filterOverlay.style.display =
            "none";

    }

}


if(mobileFilterButton){

    mobileFilterButton.addEventListener(
        "click",
        openMobileFilters
    );

}


if(filterOverlay){

    filterOverlay.addEventListener(
        "click",
        closeMobileFilters
    );

}


/* ==========================================================
   SEARCH STATES
========================================================== */

function hideSearchStates(){

    if(searchLoading){

        searchLoading.style.display =
            "none";

    }


    if(searchEmptyState){

        searchEmptyState.style.display =
            "none";

    }


    if(searchErrorState){

        searchErrorState.style.display =
            "none";

    }

}


function showSearchLoading(){

    if(searchLoading){

        searchLoading.style.display =
            "flex";

    }


    if(searchProductsGrid){

        searchProductsGrid.innerHTML =
            "";

    }

}


function showSearchEmpty(){

    hideSearchStates();


    if(searchEmptyState){

        searchEmptyState.style.display =
            "flex";

    }


    if(searchLoadMoreButton){

        searchLoadMoreButton.style.display =
            "none";

    }

}


function showSearchError(){

    hideSearchStates();


    if(searchErrorState){

        searchErrorState.style.display =
            "flex";

    }

}


/* ==========================================================
   RETRY
========================================================== */

if(retrySearchButton){

    retrySearchButton.addEventListener(
        "click",
        function(){

            loadAllSearchProducts();

        }
    );

}


/* ==========================================================
   EMPTY SEARCH RESET
========================================================== */

if(emptySearchButton){

    emptySearchButton.addEventListener(
        "click",
        function(){

            currentSearchTerm =
                "";

            currentCategory =
                "all";


            if(searchPageInput){

                searchPageInput.value =
                    "";

            }


            if(searchCategoryFilter){

                searchCategoryFilter.value =
                    "all";

            }


            applySearch();

        }
    );

}


/* ==========================================================
   HOME PAGE SEARCH
   Connects the existing homeSearch input
   to search.html.
========================================================== */

const homeSearch =
    document.getElementById(
        "homeSearch"
    );


const homeSearchButton =
    document.getElementById(
        "searchButton"
    );


function openSearchPage(){

    if(!homeSearch){

        return;

    }


    const term =
        homeSearch.value.trim();


    if(term){

        window.location.href =
            "search.html?q=" +
            encodeURIComponent(
                term
            );

    }
    else{

        window.location.href =
            "search.html";

    }

}


if(homeSearch){

    homeSearch.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                event.preventDefault();

                openSearchPage();

            }

        }
    );

}


if(homeSearchButton){

    homeSearchButton.addEventListener(
        "click",
        openSearchPage
    );

}


/* ==========================================================
   CART COUNT
========================================================== */

function updateSearchCartCount(){

    const countElement =
        document.getElementById(
            "searchCartCount"
        );


    if(!countElement){

        return;

    }


    let count = 0;


    try{

        const savedCart =
            localStorage.getItem(
                "cart"
            );


        if(savedCart){

            const cart =
                JSON.parse(
                    savedCart
                );


            if(
                Array.isArray(cart)
            ){

                count =
                    cart.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            Number(
                                item.quantity ||
                                1
                            ),
                        0
                    );

            }

        }

    }
    catch(error){

        console.warn(
            "Unable to read cart:",
            error
        );

    }


    countElement.textContent =
        count > 99
            ? "99+"
            : count;

}


/* ==========================================================
   LOCAL STORAGE CART LISTENER
========================================================== */

window.addEventListener(
    "storage",
    function(event){

        if(
            event.key ===
            "cart"
        ){

            updateSearchCartCount();

        }

    }
);


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        updateSearchCartCount();

        loadAllSearchProducts();

    }
);


