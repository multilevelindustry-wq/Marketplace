/* ==========================================================
   ADS.JS
   SELLER MARKETPLACE ADVERTISEMENT SYSTEM

   FIRESTORE COLLECTION:
   ads

   Each ad belongs to a seller.
========================================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   COLLECTION
========================================================== */

const ADS_COLLECTION = "ads";


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeAdsHTML(value){

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ==========================================================
   CREATE RANDOM AD CODE
========================================================== */

function createAdCode(){

    return (
        "AD-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
            .toUpperCase()
    );

}


/* ==========================================================
   ADMIN STATUS
========================================================== */

function showAdminAdStatus(
    message,
    type
){

    const element =
        document.getElementById(
            "adminAdStatus"
        );

    if(!element){

        return;

    }

    element.textContent =
        message;

    element.className =
        "admin-ad-status " +
        (type || "");

}


/* ==========================================================
   CREATE SELLER AD
========================================================== */

async function createAdvertisement(){

    const sellerInput =
        document.getElementById(
            "adSellerId"
        );

    const codeInput =
        document.getElementById(
            "adCode"
        );

    const impressionsInput =
        document.getElementById(
            "adMaxImpressions"
        );

    const clicksInput =
        document.getElementById(
            "adMaxClicks"
        );


    const sellerId =
        sellerInput
            ?.value
            ?.trim() || "";


    const customAdCode =
        codeInput
            ?.value
            ?.trim() || "";


    const maxImpressions =
        Math.max(
            0,
            Number(
                impressionsInput?.value
            ) || 0
        );


    const maxClicks =
        Math.max(
            0,
            Number(
                clicksInput?.value
            ) || 0
        );


    /* ======================================================
       VALIDATION
    ====================================================== */

    if(!sellerId){

        showAdminAdStatus(
            "Please enter the seller ID.",
            "error"
        );

        return;

    }


    /*
     * At least one limit should normally be supplied.
     */

    if(
        maxImpressions === 0 &&
        maxClicks === 0
    ){

        const proceed =
            confirm(
                "Both limits are unlimited. Create this advertisement?"
            );

        if(!proceed){

            return;

        }

    }


    try{

        showAdminAdStatus(
            "Checking seller products...",
            "loading"
        );


        /* ==================================================
           CHECK SELLER PRODUCTS
        ================================================== */

        const productsSnapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        let sellerHasProduct =
            false;


        productsSnapshot.forEach(
            productDocument => {

                const product =
                    productDocument.data();


                const productSellerId =
                    String(
                        product.sellerId ||
                        ""
                    );


                if(
                    productSellerId ===
                    String(sellerId)
                ){

                    sellerHasProduct =
                        true;

                }

            }
        );


        if(!sellerHasProduct){

            showAdminAdStatus(
                "No products were found for this seller.",
                "error"
            );

            return;

        }


        /* ==================================================
           AD CODE
        ================================================== */

        const adCode =
            customAdCode ||
            createAdCode();


        /* ==================================================
           AD DATA

           IMPORTANT:
           Marketplace also uses this exact structure.
        ================================================== */

        const adData = {

            sellerId:
                sellerId,

            adCode:
                adCode,

            status:
                "active",

            maxImpressions:
                maxImpressions,

            maxClicks:
                maxClicks,

            impressions:
                0,

            clicks:
                0,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        /* ==================================================
           SAVE
        ================================================== */

        showAdminAdStatus(
            "Creating advertisement...",
            "loading"
        );


        const reference =
            await addDoc(
                collection(
                    db,
                    ADS_COLLECTION
                ),
                adData
            );


        console.log(
            "Advertisement created:",
            reference.id,
            adData
        );


        /* ==================================================
           CLEAR FORM
        ================================================== */

        if(sellerInput){

            sellerInput.value =
                "";

        }


        if(codeInput){

            codeInput.value =
                "";

        }


        if(impressionsInput){

            impressionsInput.value =
                "";

        }


        if(clicksInput){

            clicksInput.value =
                "";

        }


        showAdminAdStatus(
            "✓ Advertisement created successfully. Ad Code: " +
            adCode,
            "success"
        );


        loadAdminAdvertisements();


    }
    catch(error){

        console.error(
            "CREATE AD ERROR:",
            error
        );


        showAdminAdStatus(
            error?.message ||
            "Unable to create advertisement.",
            "error"
        );

    }

}


/* ==========================================================
   CHECK AD LIMIT
========================================================== */

function isAdvertisementActive(ad){

    if(!ad){

        return false;

    }


    if(
        String(
            ad.status || ""
        ).toLowerCase() !==
        "active"
    ){

        return false;

    }


    const impressions =
        Number(
            ad.impressions
        ) || 0;


    const clicks =
        Number(
            ad.clicks
        ) || 0;


    const maxImpressions =
        Number(
            ad.maxImpressions
        ) || 0;


    const maxClicks =
        Number(
            ad.maxClicks
        ) || 0;


    /* ======================================================
       IMPRESSION LIMIT
    ====================================================== */

    if(
        maxImpressions > 0 &&
        impressions >= maxImpressions
    ){

        return false;

    }


    /* ======================================================
       CLICK LIMIT
    ====================================================== */

    if(
        maxClicks > 0 &&
        clicks >= maxClicks
    ){

        return false;

    }


    return true;

}


/* ==========================================================
   GET ALL ADS
========================================================== */

async function getAllAdvertisements(){

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    ADS_COLLECTION
                )
            );


        const ads = [];


        snapshot.forEach(
            snapshotDocument => {

                const data =
                    snapshotDocument.data();


                if(!data){

                    return;

                }


                const sellerId =
                    String(
                        data.sellerId ||
                        ""
                    ).trim();


                if(!sellerId){

                    console.warn(
                        "Skipping ad without sellerId:",
                        snapshotDocument.id
                    );

                    return;

                }


                ads.push({

                    id:
                        snapshotDocument.id,

                    ...data,

                    sellerId:
                        sellerId

                });

            }
        );


        return ads;

    }
    catch(error){

        console.error(
            "GET ADS ERROR:",
            error
        );

        return [];

    }

}


/* ==========================================================
   GET ACTIVE MARKETPLACE ADS
========================================================== */

async function getActiveMarketplaceAds(){

    const allAds =
        await getAllAdvertisements();


    const activeAds =
        allAds.filter(
            function(ad){

                return isAdvertisementActive(
                    ad
                );

            }
        );


    console.log(
        "Valid marketplace ads:",
        activeAds
    );


    console.log(
        "Ads found:",
        activeAds.length
    );


    return activeAds;

}


/* ==========================================================
   SHUFFLE
========================================================== */

function shuffleMarketplaceAds(
    ads
){

    const result =
        [...ads];


    for(
        let i =
            result.length - 1;

        i > 0;

        i--
    ){

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];

    }


    return result;

}

/* ==========================================================
   GET SELLER PRODUCTS
========================================================== */

async function getSellerProducts(
    sellerId
){

    if(!sellerId){

        return [];

    }


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        const products = [];


        snapshot.forEach(
            productDocument => {

                const product =
                    productDocument.data();


                const productSellerId =
                    String(
                        product.sellerId ||
                        ""
                    ).trim();


                if(
                    productSellerId ===
                    String(sellerId).trim()
                ){

                    products.push({

                        id:
                            productDocument.id,

                        ...product

                    });

                }

            }
        );


        return products;

    }
    catch(error){

        console.error(
            "GET SELLER PRODUCTS ERROR:",
            error
        );


        return [];

    }

}


/* ==========================================================
   RANDOM PRODUCT
========================================================== */

function getRandomProduct(
    products
){

    if(
        !Array.isArray(products) ||
        !products.length
    ){

        return null;

    }


    const index =
        Math.floor(
            Math.random() *
            products.length
        );


    return products[index];

}


/* ==========================================================
   RECORD IMPRESSION
========================================================== */

async function recordAdImpression(
    adId
){

    if(!adId){

        return;

    }


    try{

        const reference =
            doc(
                db,
                ADS_COLLECTION,
                adId
            );


        await updateDoc(
            reference,
            {

                impressions:
                    increment(1),

                updatedAt:
                    serverTimestamp()

            }
        );


        console.log(
            "Ad impression recorded:",
            adId
        );


    }
    catch(error){

        console.error(
            "AD IMPRESSION ERROR:",
            error
        );

    }

}


/* ==========================================================
   RECORD CLICK
========================================================== */

async function recordAdClick(
    adId
){

    if(!adId){

        return false;

    }


    try{

        const reference =
            doc(
                db,
                ADS_COLLECTION,
                adId
            );


        await updateDoc(
            reference,
            {

                clicks:
                    increment(1),

                updatedAt:
                    serverTimestamp()

            }
        );


        console.log(
            "Ad click recorded:",
            adId
        );


        return true;

    }
    catch(error){

        console.error(
            "AD CLICK ERROR:",
            error
        );


        return false;

    }

}


/* ==========================================================
   SELLER STORE URL
========================================================== */

function getSellerStoreURL(
    sellerId
){

    return (
        "seller-store.html?sellerId=" +
        encodeURIComponent(
            sellerId
        )
    );

}


/* ==========================================================
   CREATE MARKETPLACE AD CARD
========================================================== */

function createMarketplaceAd(
    ad,
    product
){

    if(
        !ad ||
        !product
    ){

        return null;

    }


    const wrapper =
        document.createElement(
            "article"
        );


    wrapper.className =
        "marketplace-seller-ad";


    wrapper.dataset.adId =
        ad.id;


    wrapper.dataset.sellerId =
        ad.sellerId;


    /* ======================================================
       PRODUCT IMAGE
    ====================================================== */

    const image =
        product.image ||
        product.mainImage ||
        product.photoURL ||
        "";


    /* ======================================================
       PRODUCT NAME
    ====================================================== */

    const name =
        product.name ||
        product.title ||
        "Product";


    /* ======================================================
       DESCRIPTION
    ====================================================== */

    const rawDescription =
        product.description ||
        "";


    const description =
        String(
            rawDescription
        ).substring(
            0,
            100
        );


    /* ======================================================
       PRICE
    ====================================================== */

    const price =
        Number(
            product.buyerPrice ??
            product.price ??
            product.sellerPrice ??
            0
        ) || 0;


    /* ======================================================
       HTML
    ====================================================== */

    wrapper.innerHTML = `

        <div class="marketplace-ad-badge">
            Sponsored
        </div>


        <div class="marketplace-ad-image">

            ${
                image
                ?
                `
                    <img
                        src="${escapeAdsHTML(image)}"
                        alt="${escapeAdsHTML(name)}"
                        loading="lazy"
                    >
                `
                :
                `
                    <div class="marketplace-ad-no-image">
                        No Image
                    </div>
                `
            }

        </div>


        <div class="marketplace-ad-content">

            <h3>
                ${escapeAdsHTML(name)}
            </h3>


            ${
                description
                ?
                `
                    <p>
                        ${escapeAdsHTML(description)}
                    </p>
                `
                :
                ""
            }


            ${
                price > 0
                ?
                `
                    <strong class="marketplace-ad-price">
                        ₦${price.toLocaleString("en-NG")}
                    </strong>
                `
                :
                ""
            }


            <button
                type="button"
                class="marketplace-ad-action"
            >
                Buy Now
            </button>

        </div>

    `;


    /* ======================================================
       BUTTON
    ====================================================== */

    const button =
        wrapper.querySelector(
            ".marketplace-ad-action"
        );


    if(button){

        button.addEventListener(
            "click",
            async function(){

                button.disabled =
                    true;


                button.textContent =
                    "Opening...";


                /*
                 * Count click BEFORE opening
                 * seller store.
                 */

                await recordAdClick(
                    ad.id
                );


                window.location.href =
                    getSellerStoreURL(
                        ad.sellerId
                    );

            }
        );

    }


    return wrapper;

}


/* ==========================================================
   BUILD AD WITH SELLER PRODUCT
========================================================== */

async function buildMarketplaceAd(
    ad
){

    if(
        !ad ||
        !ad.sellerId
    ){

        return null;

    }


    const products =
        await getSellerProducts(
            ad.sellerId
        );


    if(
        !products.length
    ){

        console.warn(
            "No products for seller:",
            ad.sellerId
        );


        return null;

    }


    const product =
        getRandomProduct(
            products
        );


    return createMarketplaceAd(
        ad,
        product
    );

}

/* ==========================================================
   NUMBER OF ADS FOR SCREEN
========================================================== */

function getMarketplaceAdCount(){

    return window.innerWidth >= 768
        ? 2
        : 1;

}


/* ==========================================================
   SELECT RANDOM ACTIVE ADS
========================================================== */

async function selectMarketplaceAds(
    numberOfAds
){

    const activeAds =
        await getActiveMarketplaceAds();


    if(
        !activeAds.length
    ){

        console.log(
            "No active marketplace ads."
        );


        return [];

    }


    const shuffled =
        shuffleMarketplaceAds(
            activeAds
        );


    return shuffled.slice(
        0,
        Math.max(
            1,
            Number(numberOfAds) || 1
        )
    );

}


/* ==========================================================
   DISPLAY MARKETPLACE ADS
========================================================== */

async function displayMarketplaceAds(){

    const container =
        document.getElementById(
            "marketplaceAds"
        );


    if(!container){

        console.warn(
            "marketplaceAds container not found."
        );

        return;

    }


    try{

        container.innerHTML = "";


        const numberOfAds =
            getMarketplaceAdCount();


        const ads =
            await selectMarketplaceAds(
                numberOfAds
            );


        if(!ads.length){

            container.style.display =
                "none";


            console.log(
                "No active marketplace ads."
            );


            return;

        }


        const renderedAds = [];


        /* ==================================================
           BUILD EACH AD
        ================================================== */

        for(
            const ad of ads
        ){

            const element =
                await buildMarketplaceAd(
                    ad
                );


            if(element){

                container.appendChild(
                    element
                );


                renderedAds.push(
                    ad
                );

            }

        }


        if(!renderedAds.length){

            container.style.display =
                "none";


            console.log(
                "Active ads exist, but no seller products were available."
            );


            return;

        }


        container.style.display =
            "grid";


        /* ==================================================
           COUNT IMPRESSIONS ONCE

           IMPORTANT:
           Do NOT count impression inside
           createMarketplaceAd().
        ================================================== */

        renderedAds.forEach(
            function(ad){

                recordAdImpression(
                    ad.id
                );

            }
        );


    }
    catch(error){

        console.error(
            "DISPLAY MARKETPLACE ADS ERROR:",
            error
        );


        container.style.display =
            "none";

    }

}


/* ==========================================================
   LOAD MARKETPLACE ADS

   This is the function your marketplace page calls.
========================================================== */

async function loadMarketplaceAds(){

    await displayMarketplaceAds();

}


/* ==========================================================
   ADMIN LOAD ADS
========================================================== */

async function loadAdminAdvertisements(){

    const container =
        document.getElementById(
            "adminAdsList"
        );


    if(!container){

        return;

    }


    try{

        const ads =
            await getAllAdvertisements();


        container.innerHTML =
            "";


        let totalAds =
            0;

        let activeAds =
            0;

        let totalImpressions =
            0;

        let totalClicks =
            0;


        ads.forEach(
            function(ad){

                totalAds++;


                totalImpressions +=
                    Number(
                        ad.impressions
                    ) || 0;


                totalClicks +=
                    Number(
                        ad.clicks
                    ) || 0;


                const active =
                    isAdvertisementActive(
                        ad
                    );


                if(active){

                    activeAds++;

                }


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "admin-ad-card";


                card.innerHTML = `

                    <div>

                        <strong>
                            ${escapeAdsHTML(
                                ad.adCode ||
                                "Advertisement"
                            )}
                        </strong>

                        <p>
                            Seller:
                            ${escapeAdsHTML(
                                ad.sellerId
                            )}
                        </p>

                    </div>


                    <div>

                        Impressions:
                        <b>
                            ${Number(
                                ad.impressions || 0
                            ).toLocaleString()}
                        </b>

                        ${
                            Number(
                                ad.maxImpressions || 0
                            ) > 0
                            ?
                            `
                                /
                                ${Number(
                                    ad.maxImpressions
                                ).toLocaleString()}
                            `
                            :
                            " / Unlimited"
                        }

                    </div>


                    <div>

                        Clicks:
                        <b>
                            ${Number(
                                ad.clicks || 0
                            ).toLocaleString()}
                        </b>

                        ${
                            Number(
                                ad.maxClicks || 0
                            ) > 0
                            ?
                            `
                                /
                                ${Number(
                                    ad.maxClicks
                                ).toLocaleString()}
                            `
                            :
                            " / Unlimited"
                        }

                    </div>


                    <div>

                        Status:

                        <b>

                            ${
                                active
                                ?
                                "ACTIVE"
                                :
                                "COMPLETED"
                            }

                        </b>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


        updateAdminAdStatistics(
            totalAds,
            activeAds,
            totalImpressions,
            totalClicks
        );


        const empty =
            document.getElementById(
                "adminAdsEmpty"
            );


        if(empty){

            empty.style.display =
                ads.length
                ? "none"
                : "block";

        }

    }
    catch(error){

        console.error(
            "ADMIN ADS ERROR:",
            error
        );

    }

}


/* ==========================================================
   ADMIN STATISTICS
========================================================== */

function updateAdminAdStatistics(
    total,
    active,
    impressions,
    clicks
){

    const totalElement =
        document.getElementById(
            "adminTotalAds"
        );


    const activeElement =
        document.getElementById(
            "adminActiveAds"
        );


    const impressionsElement =
        document.getElementById(
            "adminTotalImpressions"
        );


    const clicksElement =
        document.getElementById(
            "adminTotalClicks"
        );


    if(totalElement){

        totalElement.textContent =
            Number(total)
                .toLocaleString();

    }


    if(activeElement){

        activeElement.textContent =
            Number(active)
                .toLocaleString();

    }


    if(impressionsElement){

        impressionsElement.textContent =
            Number(impressions)
                .toLocaleString();

    }


    if(clicksElement){

        clicksElement.textContent =
            Number(clicks)
                .toLocaleString();

    }

}


/* ==========================================================
   ADMIN INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        /* ==============================================
           CREATE AD BUTTON
        ============================================== */

        const createButton =
            document.getElementById(
                "createSellerAd"
            );


        if(createButton){

            createButton.addEventListener(
                "click",
                createAdvertisement
            );

        }


        /* ==============================================
           REFRESH
        ============================================== */

        const refreshButton =
            document.getElementById(
                "refreshAds"
            );


        if(refreshButton){

            refreshButton.addEventListener(
                "click",
                loadAdminAdvertisements
            );

        }


        /* ==============================================
           ADMIN ADS
        ============================================== */

        if(
            document.getElementById(
                "adminAdsList"
            )
        ){

            loadAdminAdvertisements();

        }


        /* ==============================================
           MARKETPLACE ADS
        ============================================== */

        if(
            document.getElementById(
                "marketplaceAds"
            )
        ){

            displayMarketplaceAds();

        }

    }
);


/* ==========================================================
   GLOBAL FUNCTIONS
========================================================== */

window.loadMarketplaceAds =
    loadMarketplaceAds;


window.displayMarketplaceAds =
    displayMarketplaceAds;
    
    