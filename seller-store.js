/* ==========================================================
   SELLER STORE
   Firebase product loading + search + filters + pagination
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
    where,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   DOM ELEMENTS
========================================================== */

const sellerStoreWelcomeText =
    document.getElementById(
        "sellerStoreWelcomeText"
    );

const sellerTotalProducts =
    document.getElementById(
        "sellerTotalProducts"
    );

const sellerActiveProducts =
    document.getElementById(
        "sellerActiveProducts"
    );

const sellerOutOfStock =
    document.getElementById(
        "sellerOutOfStock"
    );

const sellerPendingProducts =
    document.getElementById(
        "sellerPendingProducts"
    );

const sellerProductCount =
    document.getElementById(
        "sellerProductCount"
    );

const sellerProductSearch =
    document.getElementById(
        "sellerProductSearch"
    );

const sellerProductFilter =
    document.getElementById(
        "sellerProductFilter"
    );

const sellerProductsLoading =
    document.getElementById(
        "sellerProductsLoading"
    );

const sellerProductsGrid =
    document.getElementById(
        "sellerProductsGrid"
    );

const sellerProductsEmpty =
    document.getElementById(
        "sellerProductsEmpty"
    );

const sellerProductsNoResults =
    document.getElementById(
        "sellerProductsNoResults"
    );

const sellerProductPagination =
    document.getElementById(
        "sellerProductPagination"
    );

const sellerStoreMessage =
    document.getElementById(
        "sellerStoreMessage"
    );


/* ==========================================================
   SIDEBAR ELEMENTS
========================================================== */

const sellerStoreMenuButton =
    document.getElementById(
        "sellerStoreMenuButton"
    );

const sellerStoreSidebar =
    document.getElementById(
        "sellerStoreSidebar"
    );

const sellerStoreCloseMenu =
    document.getElementById(
        "sellerStoreCloseMenu"
    );

const sellerStoreOverlay =
    document.getElementById(
        "sellerStoreOverlay"
    );


/* ==========================================================
   SELLER STORE STATE
========================================================== */

let sellerStoreProducts = [];

let filteredSellerProducts = [];

let currentSellerPage = 1;

const SELLER_PRODUCTS_PER_PAGE = 12;

let sellerProductsListener = null;


/* ==========================================================
   SELLER AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            handleSellerStoreSignedOut();

            return;

        }


        await initializeSellerStore(
            user
        );

    }
);


/* ==========================================================
   INITIALIZE SELLER STORE
========================================================== */

async function initializeSellerStore(user) {

    showSellerStoreLoading();


    if (
        sellerStoreWelcomeText
    ) {

        const sellerName =
            user.displayName ||
            user.email ||
            "Seller";


        sellerStoreWelcomeText.textContent =
            `Welcome back, ${sellerName}. Manage your products and inventory.`;

    }


    loadSellerStoreProducts(
        user.uid
    );

}


/* ==========================================================
   LOAD SELLER PRODUCTS
========================================================== */

function loadSellerStoreProducts(
    sellerId
) {

    if (!sellerProductsGrid) {

        return;

    }


    const productsReference =
        collection(
            db,
            "products"
        );


    const sellerProductsQuery =
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


    sellerProductsListener =
        onSnapshot(

            sellerProductsQuery,

            (snapshot) => {

                sellerStoreProducts = [];


                snapshot.forEach(
                    (productDocument) => {

                        sellerStoreProducts.push({

                            id:
                                productDocument.id,

                            ...productDocument.data()

                        });

                    }
                );


                updateSellerStoreStatistics();


                applySellerProductFilters();


                hideSellerStoreLoading();

            },

            (error) => {

                console.error(
                    "Failed to load seller products:",
                    error
                );


                hideSellerStoreLoading();


                showSellerStoreMessage(
                    "Unable to load your products. Please try again."
                );

            }

        );

}


/* ==========================================================
   UPDATE STORE STATISTICS
========================================================== */

function updateSellerStoreStatistics() {

    const total =
        sellerStoreProducts.length;


    const active =
        sellerStoreProducts.filter(
            (product) => {

                return normalizeProductStatus(
                    product.status
                ) === "active";

            }
        ).length;


    const pending =
        sellerStoreProducts.filter(
            (product) => {

                return normalizeProductStatus(
                    product.status
                ) === "pending";

            }
        ).length;


    const outOfStock =
        sellerStoreProducts.filter(
            (product) => {

                return Number(
                    product.inventory || 0
                ) <= 0;

            }
        ).length;


    if (sellerTotalProducts) {

        sellerTotalProducts.textContent =
            total;

    }


    if (sellerActiveProducts) {

        sellerActiveProducts.textContent =
            active;

    }


    if (sellerOutOfStock) {

        sellerOutOfStock.textContent =
            outOfStock;

    }


    if (sellerPendingProducts) {

        sellerPendingProducts.textContent =
            pending;

    }

}


/* ==========================================================
   NORMALIZE PRODUCT STATUS
========================================================== */

function normalizeProductStatus(
    status
) {

    const normalized =
        String(
            status || ""
        )
        .trim()
        .toLowerCase();


    if (
        normalized === "approved" ||
        normalized === "published" ||
        normalized === "active"
    ) {

        return "active";

    }


    if (
        normalized === "pending" ||
        normalized === "pending approval"
    ) {

        return "pending";

    }


    if (
        normalized === "rejected"
    ) {

        return "rejected";

    }


    return normalized || "pending";

}


/* ==========================================================
   APPLY SEARCH AND FILTERS
========================================================== */

function applySellerProductFilters() {

    const searchTerm =
        sellerProductSearch
            ? sellerProductSearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedFilter =
        sellerProductFilter
            ? sellerProductFilter.value
            : "all";


    filteredSellerProducts =
        sellerStoreProducts.filter(
            (product) => {

                const productName =
                    String(
                        product.productName ||
                        product.name ||
                        ""
                    )
                    .toLowerCase();


                const category =
                    String(
                        product.category ||
                        ""
                    )
                    .toLowerCase();


                const subcategory =
                    String(
                        product.subcategory ||
                        ""
                    )
                    .toLowerCase();


                const matchesSearch =
                    !searchTerm ||
                    productName.includes(
                        searchTerm
                    ) ||
                    category.includes(
                        searchTerm
                    ) ||
                    subcategory.includes(
                        searchTerm
                    );


                const status =
                    normalizeProductStatus(
                        product.status
                    );


                const inventory =
                    Number(
                        product.inventory || 0
                    );


                let matchesFilter = true;


                if (
                    selectedFilter ===
                    "active"
                ) {

                    matchesFilter =
                        status === "active" &&
                        inventory > 0;

                }


                if (
                    selectedFilter ===
                    "pending"
                ) {

                    matchesFilter =
                        status === "pending";

                }


                if (
                    selectedFilter ===
                    "out-of-stock"
                ) {

                    matchesFilter =
                        inventory <= 0;

                }


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );


    currentSellerPage = 1;


    renderSellerStoreProducts();

}


/* ==========================================================
   RENDER PRODUCT GRID
========================================================== */

function renderSellerStoreProducts() {

    if (!sellerProductsGrid) {

        return;

    }


    sellerProductsGrid.innerHTML = "";


    if (
        !filteredSellerProducts.length
    ) {

        updateSellerProductCount(0);


        if (sellerProductsEmpty) {

            sellerProductsEmpty.hidden =
                sellerStoreProducts.length !== 0;

        }


        if (sellerProductsNoResults) {

            sellerProductsNoResults.hidden =
                sellerStoreProducts.length === 0;

        }


        if (sellerProductPagination) {

            sellerProductPagination.innerHTML =
                "";

        }


        return;

    }


    if (sellerProductsEmpty) {

        sellerProductsEmpty.hidden =
            true;

    }


    if (sellerProductsNoResults) {

        sellerProductsNoResults.hidden =
            true;

    }


    const startIndex =
        (
            currentSellerPage - 1
        ) *
        SELLER_PRODUCTS_PER_PAGE;


    const endIndex =
        startIndex +
        SELLER_PRODUCTS_PER_PAGE;


    const productsForPage =
        filteredSellerProducts.slice(
            startIndex,
            endIndex
        );


    productsForPage.forEach(
        (product) => {

            const card =
                createSellerProductCard(
                    product
                );


            sellerProductsGrid.appendChild(
                card
            );

        }
    );


    updateSellerProductCount(
        filteredSellerProducts.length
    );


    renderSellerPagination();

}


/* ==========================================================
   UPDATE PRODUCT COUNT
========================================================== */

function updateSellerProductCount(
    count
) {

    if (!sellerProductCount) {

        return;

    }


    sellerProductCount.textContent =
        `${count} product${count === 1 ? "" : "s"}`;

}





/* ==========================================================
   CREATE SELLER PRODUCT CARD
========================================================== */

/* ==========================================================
   CREATE SELLER PRODUCT CARD
========================================================== */

function createSellerProductCard(product) {

    const card =
        document.createElement("article");

    card.className =
        "seller-product-card";


    /* ======================================================
       PRODUCT ID
    ====================================================== */

    const productId =
        product.id || "";


    /* ======================================================
       PRODUCT NAME
    ====================================================== */

    const productName =
        product.productName ||
        product.name ||
        "Unnamed Product";


    /* ======================================================
       PRODUCT IMAGE
    ====================================================== */

    const images =
        Array.isArray(product.images)
            ? product.images
            : [];

    const image =
        product.mainImage ||
        product.image ||
        images[0] ||
        "";


    /* ======================================================
       PRICES
    ====================================================== */

    const sellerPrice =
        Number(
            product.sellerPrice ||
            0
        );


    const buyerPrice =
        Number(
            product.buyerPrice ??
            product.price ??
            sellerPrice * 1.05
        );


    const oldPrice =
        Number(
            product.oldPrice ||
            0
        );


    /* ======================================================
       STOCK
    ====================================================== */

    const inventory =
        Number(
            product.inventory ??
            product.stock ??
            0
        );


    /* ======================================================
       CATEGORY
    ====================================================== */

    const category =
        product.category ||
        "General";


    /* ======================================================
       STATUS
    ====================================================== */

    const status =
        normalizeProductStatus(
            product.status
        );


    const statusLabel =
        getSellerStatusLabel(
            status
        );


    /* ======================================================
       IMAGE HTML
    ====================================================== */

    const imageHTML = image
        ? `
            <img
                src="${escapeSellerStoreValue(image)}"
                alt="${escapeSellerStoreValue(productName)}"
                loading="lazy"
                onerror="
                    this.style.display='none';
                    this.parentElement.classList.add('no-image');
                "
            >
        `
        : `
            <div class="no-image">
                No image
            </div>
        `;


    /* ======================================================
       PRODUCT CARD
    ====================================================== */

    card.innerHTML = `

    <!-- PRODUCT IMAGE -->

    <div class="seller-product-image">

        ${imageHTML}

        <span
            class="seller-product-status ${escapeSellerStoreValue(status)}"
        >
            ${escapeSellerStoreValue(statusLabel)}
        </span>

    </div>


    <!-- PRODUCT INFORMATION -->

    <div class="seller-product-info">

        <!-- CATEGORY -->

        <span class="seller-product-category">
            ${escapeSellerStoreValue(category)}
        </span>


        <!-- PRODUCT NAME -->

        <h3 class="seller-product-name">
            ${escapeSellerStoreValue(productName)}
        </h3>


        <!-- BUYER PRICE -->

        <div class="seller-product-price">

            ₦${formatSellerStorePrice(buyerPrice)}

            ${
                oldPrice > buyerPrice
                    ? `
                        <span class="seller-product-old-price">

                            ₦${formatSellerStorePrice(oldPrice)}

                        </span>
                    `
                    : ""
            }

        </div>


        <!-- SELLER PRICE -->

        <div class="seller-product-seller-price">

            Your price:
            ₦${formatSellerStorePrice(sellerPrice)}

        </div>


        <!-- STOCK -->

        <div
            class="
                seller-product-stock
                ${
                    inventory > 0
                        ? "in-stock"
                        : "out-of-stock"
                }
            "
        >

            ${
                inventory > 0
                    ? `Stock: ${inventory}`
                    : "Stock: 0"
            }

        </div>


        <!-- ACTIONS -->

        <div class="seller-product-actions">

            <a
                href="product.html?id=${encodeURIComponent(productId)}"
                class="seller-product-view"
            >
                View
            </a>


            <a
                href="edit-product.html?id=${encodeURIComponent(productId)}"
                class="seller-product-edit"
            >
                Edit
            </a>

        </div>

    </div>

`;

return card;

}


/* ==========================================================
   SELLER STATUS LABEL
========================================================== */

function getSellerStatusLabel(
    status
) {

    if (
        status === "active"
    ) {

        return "Active";

    }


    if (
        status === "pending"
    ) {

        return "Pending";

    }


    if (
        status === "rejected"
    ) {

        return "Rejected";

    }


    return "Pending";

}


/* ==========================================================
   PAGINATION
========================================================== */

function renderSellerPagination() {

    if (!sellerProductPagination) {

        return;

    }


    sellerProductPagination.innerHTML =
        "";


    const totalPages =
        Math.ceil(
            filteredSellerProducts.length /
            SELLER_PRODUCTS_PER_PAGE
        );


    if (
        totalPages <= 1
    ) {

        return;

    }


    const previousButton =
        document.createElement(
            "button"
        );


    previousButton.type =
        "button";


    previousButton.className =
        "seller-pagination-button";


    previousButton.textContent =
        "←";


    previousButton.disabled =
        currentSellerPage === 1;


    previousButton.addEventListener(
        "click",
        () => {

            if (
                currentSellerPage > 1
            ) {

                currentSellerPage--;

                renderSellerStoreProducts();

                scrollToSellerProducts();

            }

        }
    );


    sellerProductPagination.appendChild(
        previousButton
    );


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            document.createElement(
                "button"
            );


        pageButton.type =
            "button";


        pageButton.className =
            "seller-pagination-button";


        if (
            page === currentSellerPage
        ) {

            pageButton.classList.add(
                "active"
            );

        }


        pageButton.textContent =
            page;


        pageButton.addEventListener(
            "click",
            () => {

                currentSellerPage =
                    page;

                renderSellerStoreProducts();

                scrollToSellerProducts();

            }
        );


        sellerProductPagination.appendChild(
            pageButton
        );

    }


    const nextButton =
        document.createElement(
            "button"
        );


    nextButton.type =
        "button";


    nextButton.className =
        "seller-pagination-button";


    nextButton.textContent =
        "→";


    nextButton.disabled =
        currentSellerPage === totalPages;


    nextButton.addEventListener(
        "click",
        () => {

            if (
                currentSellerPage <
                totalPages
            ) {

                currentSellerPage++;

                renderSellerStoreProducts();

                scrollToSellerProducts();

            }

        }
    );


    sellerProductPagination.appendChild(
        nextButton
    );

}


/* ==========================================================
   SEARCH EVENT
========================================================== */

if (sellerProductSearch) {

    sellerProductSearch.addEventListener(
        "input",
        () => {

            applySellerProductFilters();

        }
    );

}


/* ==========================================================
   FILTER EVENT
========================================================== */

if (sellerProductFilter) {

    sellerProductFilter.addEventListener(
        "change",
        () => {

            applySellerProductFilters();

        }
    );

}


/* ==========================================================
   SIDEBAR OPEN
========================================================== */

if (sellerStoreMenuButton) {

    sellerStoreMenuButton.addEventListener(
        "click",
        () => {

            openSellerStoreSidebar();

        }
    );

}


/* ==========================================================
   SIDEBAR CLOSE
========================================================== */

if (sellerStoreCloseMenu) {

    sellerStoreCloseMenu.addEventListener(
        "click",
        () => {

            closeSellerStoreSidebar();

        }
    );

}


if (sellerStoreOverlay) {

    sellerStoreOverlay.addEventListener(
        "click",
        () => {

            closeSellerStoreSidebar();

        }
    );

}


/* ==========================================================
   OPEN SIDEBAR
========================================================== */

function openSellerStoreSidebar() {

    if (sellerStoreSidebar) {

        sellerStoreSidebar.hidden =
            false;

    }


    if (sellerStoreOverlay) {

        sellerStoreOverlay.hidden =
            false;

    }


    document.body.classList.add(
        "seller-sidebar-open"
    );

}


/* ==========================================================
   CLOSE SIDEBAR
========================================================== */

function closeSellerStoreSidebar() {

    if (sellerStoreSidebar) {

        sellerStoreSidebar.hidden =
            true;

    }


    if (sellerStoreOverlay) {

        sellerStoreOverlay.hidden =
            true;

    }


    document.body.classList.remove(
        "seller-sidebar-open"
    );

}


/* ==========================================================
   LOADING STATE
========================================================== */

function showSellerStoreLoading() {

    if (sellerProductsLoading) {

        sellerProductsLoading.hidden =
            false;

    }


    if (sellerProductsGrid) {

        sellerProductsGrid.innerHTML =
            "";

    }


    if (sellerProductsEmpty) {

        sellerProductsEmpty.hidden =
            true;

    }


    if (sellerProductsNoResults) {

        sellerProductsNoResults.hidden =
            true;

    }

}


/* ==========================================================
   HIDE LOADING STATE
========================================================== */

function hideSellerStoreLoading() {

    if (sellerProductsLoading) {

        sellerProductsLoading.hidden =
            true;

    }

}


/* ==========================================================
   SIGNED OUT STATE
========================================================== */

function handleSellerStoreSignedOut() {

    hideSellerStoreLoading();


    if (sellerProductsGrid) {

        sellerProductsGrid.innerHTML =
            "";

    }


    if (sellerProductsEmpty) {

        sellerProductsEmpty.hidden =
            true;

    }


    if (sellerProductsNoResults) {

        sellerProductsNoResults.hidden =
            true;

    }


    if (sellerStoreMessage) {

        sellerStoreMessage.textContent =
            "Please sign in to access your seller store.";

    }


    sellerStoreProducts = [];

    filteredSellerProducts = [];

}


/* ==========================================================
   STORE MESSAGE
========================================================== */

function showSellerStoreMessage(
    message
) {

    if (!sellerStoreMessage) {

        return;

    }


    sellerStoreMessage.textContent =
        message;


    sellerStoreMessage.classList.add(
        "show"
    );


    window.setTimeout(
        () => {

            sellerStoreMessage.classList.remove(
                "show"
            );

        },
        4000
    );

}


/* ==========================================================
   PRICE FORMAT
========================================================== */

function formatSellerStorePrice(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-NG",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }
    );

}


/* ==========================================================
   ESCAPE HTML VALUES
========================================================== */

function escapeSellerStoreValue(
    value
) {

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
   SCROLL TO PRODUCTS
========================================================== */

function scrollToSellerProducts() {

    const section =
        document.getElementById(
            "sellerProductsSection"
        );


    if (!section) {

        return;

    }


    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* ==========================================================
   CLEAN FIRESTORE LISTENER
========================================================== */

window.addEventListener(
    "beforeunload",
    () => {

        if (
            sellerProductsListener
        ) {

            sellerProductsListener();

            sellerProductsListener =
                null;

        }

    }
);




