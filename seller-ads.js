/* ==========================================================
   SELLER ADS PERFORMANCE
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
    getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

/* ==========================================================
   COLLECTION
========================================================== */

const SELLER_ADS_COLLECTION = "ads";


/* ==========================================================
   INITIALIZE SELLER ADS
========================================================== */

onAuthStateChanged(
    auth,
    async function(user) {

        if (!user) {

            console.warn(
                "SELLER ADS: No authenticated seller."
            );

            return;

        }


        const sellerId =
            user.uid;


        console.log(
            "SELLER ADS SELLER ID:",
            sellerId
        );


        await loadSellerAdsPerformance(
            sellerId
        );

    }
);


/* ==========================================================
   ESCAPE HTML
   SELLER ADS PERFORMANCE
========================================================== */

function escapeAdsHTML(value) {

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
   REFRESH SELLER ADS
========================================================== */

const refreshSellerAds =
    document.getElementById(
        "refreshSellerAds"
    );


if (refreshSellerAds) {

    refreshSellerAds.addEventListener(
        "click",
        function() {

            if (
                auth.currentUser &&
                auth.currentUser.uid
            ) {

                loadSellerAdsPerformance(
                    auth.currentUser.uid
                );

            }

        }
    );

}


/* ==========================================================
   LOAD SELLER ADS PERFORMANCE
========================================================== */

async function loadSellerAdsPerformance(
    sellerId
) {

    if (!sellerId) {

        console.error(
            "SELLER ADS: Seller ID not found."
        );

        return;

    }


    const loading =
        document.getElementById(
            "sellerAdsLoading"
        );


    const list =
        document.getElementById(
            "sellerAdsList"
        );


    const empty =
        document.getElementById(
            "sellerAdsEmpty"
        );


    const totalAds =
        document.getElementById(
            "sellerTotalAds"
        );


    const activeAds =
        document.getElementById(
            "sellerActiveAds"
        );


    const totalImpressions =
        document.getElementById(
            "sellerTotalImpressions"
        );


    const totalClicks =
        document.getElementById(
            "sellerTotalClicks"
        );


    try {

        if (loading) {

            loading.style.display =
                "block";

            loading.textContent =
                "Loading advertising performance...";

        }


        if (list) {

            list.innerHTML =
                "";

        }


        if (empty) {

            empty.style.display =
                "none";

        }


        /* ==================================================
           GET SELLER ADS
        ================================================== */

        const adsQuery =
            query(
                collection(
                    db,
                    "ads"
                ),
                where(
                    "sellerId",
                    "==",
                    sellerId
                )
            );


        const snapshot =
            await getDocs(
                adsQuery
            );


        console.log(
            "SELLER ADS FOUND:",
            snapshot.size
        );


        let ads =
            [];


        /* ==================================================
           READ FIRESTORE DOCUMENTS
        ================================================== */

        snapshot.forEach(
            function(docSnapshot) {

                const data =
                    docSnapshot.data();


                if (!data) {

                    return;

                }


                console.log(
                    "SELLER AD DATA:",
                    data
                );


                ads.push({

                    id:
                        docSnapshot.id,

                    ...data

                });

            }
        );


        /* ==================================================
           NO ADS
        ================================================== */

        if (!ads.length) {

            if (loading) {

                loading.style.display =
                    "none";

            }


            if (empty) {

                empty.style.display =
                    "block";

                empty.textContent =
                    "You do not have any advertising campaigns yet.";

            }


            if (totalAds) {

                totalAds.textContent =
                    "0";

            }


            if (activeAds) {

                activeAds.textContent =
                    "0";

            }


            if (totalImpressions) {

                totalImpressions.textContent =
                    "0";

            }


            if (totalClicks) {

                totalClicks.textContent =
                    "0";

            }


            return;

        }


        /* ==================================================
           TOTAL STATISTICS
        ================================================== */

        let totalImpressionCount =
            0;


        let totalClickCount =
            0;


        let activeCount =
            0;


        ads.forEach(
            function(ad) {

                /*
                 * Support the exact fields used
                 * by your admin ads system.
                 */

                const impressions =
                    Number(
                        ad.impressions ??
                        ad.impressionCount ??
                        ad.views ??
                        0
                    );


                const clicks =
                    Number(
                        ad.clicks ??
                        ad.clickCount ??
                        0
                    );


                const maxImpressions =
                    Number(
                        ad.maxImpressions ??
                        0
                    );


                const maxClicks =
                    Number(
                        ad.maxClicks ??
                        0
                    );


                totalImpressionCount +=
                    impressions;


                totalClickCount +=
                    clicks;


                let active =
                    String(
                        ad.status ||
                        ""
                    ).toLowerCase()
                    ===
                    "active";


                if (
                    maxImpressions > 0 &&
                    impressions >=
                        maxImpressions
                ) {

                    active =
                        false;

                }


                if (
                    maxClicks > 0 &&
                    clicks >=
                        maxClicks
                ) {

                    active =
                        false;

                }


                if (active) {

                    activeCount++;

                }

            }
        );


        /* ==================================================
           UPDATE TOP STATISTICS
        ================================================== */

        if (totalAds) {

            totalAds.textContent =
                ads.length.toLocaleString();

        }


        if (activeAds) {

            activeAds.textContent =
                activeCount.toLocaleString();

        }


        if (totalImpressions) {

            totalImpressions.textContent =
                totalImpressionCount.toLocaleString();

        }


        if (totalClicks) {

            totalClicks.textContent =
                totalClickCount.toLocaleString();

        }


        /* ==================================================
           CREATE EACH AD CARD
        ================================================== */

        ads.forEach(
            function(ad) {

                const impressions =
                    Number(
                        ad.impressions ??
                        ad.impressionCount ??
                        ad.views ??
                        0
                    );


                const clicks =
                    Number(
                        ad.clicks ??
                        ad.clickCount ??
                        0
                    );


                const maxImpressions =
                    Number(
                        ad.maxImpressions ??
                        0
                    );


                const maxClicks =
                    Number(
                        ad.maxClicks ??
                        0
                    );


                /* ------------------------------------------
                   CLICK RATE
                ------------------------------------------ */

                const clickRate =
                    impressions > 0
                        ? (
                            clicks /
                            impressions
                        ) *
                        100
                        : 0;


                /* ------------------------------------------
                   STATUS
                ------------------------------------------ */

                let status =
                    String(
                        ad.status ||
                        "active"
                    ).toLowerCase();


                if (
                    maxImpressions > 0 &&
                    impressions >=
                        maxImpressions
                ) {

                    status =
                        "completed";

                }


                if (
                    maxClicks > 0 &&
                    clicks >=
                        maxClicks
                ) {

                    status =
                        "completed";

                }


                /* ------------------------------------------
                   IMPRESSION PROGRESS
                ------------------------------------------ */

                let impressionProgress =
                    0;


                if (
                    maxImpressions > 0
                ) {

                    impressionProgress =
                        Math.min(
                            100,
                            (
                                impressions /
                                maxImpressions
                            ) *
                            100
                        );

                }


                /* ------------------------------------------
                   CLICK PROGRESS
                ------------------------------------------ */

                let clickProgress =
                    0;


                if (
                    maxClicks > 0
                ) {

                    clickProgress =
                        Math.min(
                            100,
                            (
                                clicks /
                                maxClicks
                            ) *
                            100
                        );

                }


                /* ------------------------------------------
                   CARD
                ------------------------------------------ */

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "seller-ad-performance-card";


                card.innerHTML = `

                    <div class="seller-ad-performance-top">

                        <div>

                            <span class="seller-ad-code">

                                ${escapeAdsHTML(
                                    ad.adCode ||
                                    "ADVERTISEMENT"
                                )}

                            </span>


                            <h3>
                                Advertising Campaign
                            </h3>

                        </div>


                        <span
                            class="
                                seller-ad-status
                                ${escapeAdsHTML(status)}
                            "
                        >

                            ${escapeAdsHTML(
                                status.toUpperCase()
                            )}

                        </span>

                    </div>


                    <!-- =====================================
                         PERFORMANCE METRICS
                    ====================================== -->

                    <div class="seller-ad-metrics">


                        <!-- IMPRESSIONS -->

                        <div class="seller-ad-metric">

                            <span>
                                Impressions
                            </span>


                            <strong>
                                ${impressions.toLocaleString()}
                            </strong>


                            <small>

                                ${
                                    maxImpressions > 0

                                    ? `
                                        of
                                        ${maxImpressions.toLocaleString()}
                                      `

                                    : `
                                        Unlimited
                                      `
                                }

                            </small>

                        </div>


                        <!-- CLICKS -->

                        <div class="seller-ad-metric">

                            <span>
                                Clicks
                            </span>


                            <strong>
                                ${clicks.toLocaleString()}
                            </strong>


                            <small>

                                ${
                                    maxClicks > 0

                                    ? `
                                        of
                                        ${maxClicks.toLocaleString()}
                                      `

                                    : `
                                        Unlimited
                                      `
                                }

                            </small>

                        </div>


                        <!-- CLICK RATE -->

                        <div class="seller-ad-metric">

                            <span>
                                Click Rate
                            </span>


                            <strong>
                                ${clickRate.toFixed(2)}%
                            </strong>


                            <small>
                                Clicks ÷ Impressions
                            </small>

                        </div>


                    </div>


                    <!-- =====================================
                         IMPRESSION PROGRESS
                    ====================================== -->

                    ${
                        maxImpressions > 0

                        ? `

                            <div class="seller-ad-progress-area">

                                <div class="seller-ad-progress-label">

                                    <span>
                                        Impression Progress
                                    </span>

                                    <span>
                                        ${impressionProgress.toFixed(1)}%
                                    </span>

                                </div>


                                <div class="seller-ad-progress">

                                    <div
                                        class="seller-ad-progress-bar"
                                        style="
                                            width:
                                            ${impressionProgress}%;
                                        "
                                    ></div>

                                </div>

                            </div>

                          `

                        : ""
                    }


                    <!-- =====================================
                         CLICK PROGRESS
                    ====================================== -->

                    ${
                        maxClicks > 0

                        ? `

                            <div class="seller-ad-progress-area">

                                <div class="seller-ad-progress-label">

                                    <span>
                                        Click Progress
                                    </span>

                                    <span>
                                        ${clickProgress.toFixed(1)}%
                                    </span>

                                </div>


                                <div class="seller-ad-progress">

                                    <div
                                        class="seller-ad-progress-bar"
                                        style="
                                            width:
                                            ${clickProgress}%;
                                        "
                                    ></div>

                                </div>

                            </div>

                          `

                        : ""
                    }

                `;


                if (list) {

                    list.appendChild(
                        card
                    );

                }

            }
        );


        /* ==================================================
           HIDE LOADING
        ================================================== */

        if (loading) {

            loading.style.display =
                "none";

        }


        console.log(
            "SELLER ADS PERFORMANCE LOADED",
            {
                ads:
                    ads.length,

                impressions:
                    totalImpressionCount,

                clicks:
                    totalClickCount,

                clickRate:
                    totalImpressionCount > 0
                        ? (
                            totalClickCount /
                            totalImpressionCount
                        ) *
                        100
                        : 0
            }
        );

    }

    catch(error) {

        console.error(
            "SELLER ADS PERFORMANCE ERROR:",
            error
        );


        if (loading) {

            loading.style.display =
                "none";

        }


        if (empty) {

            empty.style.display =
                "block";

            empty.textContent =
                "Unable to load advertising performance.";

        }

    }

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeSellerAdsHTML(value){

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
   GET CURRENT SELLER
========================================================== */

function getCurrentSellerId(){

    const sellerId =
        localStorage.getItem(
            "sellerId"
        );

    if(sellerId){

        return sellerId;

    }


    const user =
        localStorage.getItem(
            "user"
        );

    if(user){

        try{

            const parsed =
                JSON.parse(
                    user
                );

            return (
                parsed.uid ||
                parsed.id ||
                parsed.sellerId ||
                ""
            );

        }
        catch(error){

            console.error(
                "SELLER USER PARSE ERROR:",
                error
            );

        }

    }


    return "";

}


/* ==========================================================
   CHECK AD STATUS
========================================================== */

function sellerAdIsActive(ad){

    if(
        ad.status !== "active"
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


    if(
        maxImpressions > 0 &&
        impressions >= maxImpressions
    ){

        return false;

    }


    if(
        maxClicks > 0 &&
        clicks >= maxClicks
    ){

        return false;

    }


    return true;

}


/* ==========================================================
   GET LOGGED-IN SELLER ID
========================================================== */

function getLoggedInSellerId() {

    /*
     * Firebase Authentication is the primary source.
     */

    if (
        typeof auth !== "undefined" &&
        auth.currentUser &&
        auth.currentUser.uid
    ) {

        return auth.currentUser.uid;

    }


    /*
     * Check common localStorage values
     * used by the marketplace.
     */

    const possibleKeys = [

        "sellerId",
        "sellerID",
        "seller_id",
        "currentSellerId",
        "currentSellerID",
        "userId",
        "userID"

    ];


    for (
        const key of possibleKeys
    ) {

        const value =
            localStorage.getItem(key);


        if (
            value &&
            value.trim()
        ) {

            return value.trim();

        }

    }


    /*
     * Check stored user objects.
     */

    const possibleUserKeys = [

        "user",
        "currentUser",
        "seller",
        "currentSeller"

    ];


    for (
        const key of possibleUserKeys
    ) {

        try {

            const stored =
                localStorage.getItem(key);


            if (!stored) {

                continue;

            }


            const user =
                JSON.parse(stored);


            if (
                user &&
                user.uid
            ) {

                return user.uid;

            }


            if (
                user &&
                user.id
            ) {

                return user.id;

            }


            if (
                user &&
                user.sellerId
            ) {

                return user.sellerId;

            }

        }

        catch(error) {

            console.warn(
                "Unable to read stored user:",
                key,
                error
            );

        }

    }


    return null;

}


/* ==========================================================
   UPDATE STATISTICS
========================================================== */

function updateSellerAdStatistics(
    ads
){

    let totalImpressions =
        0;

    let totalClicks =
        0;

    let activeAds =
        0;


    ads.forEach(
        ad => {

            totalImpressions +=
                Number(
                    ad.impressions
                ) || 0;


            totalClicks +=
                Number(
                    ad.clicks
                ) || 0;


            if(
                sellerAdIsActive(
                    ad
                )
            ){

                activeAds++;

            }

        }
    );


    const ctr =
        totalImpressions > 0
            ? (
                totalClicks /
                totalImpressions
            ) * 100
            : 0;


    const total =
        document.getElementById(
            "sellerTotalAds"
        );


    const active =
        document.getElementById(
            "sellerActiveAds"
        );


    const impressions =
        document.getElementById(
            "sellerAdImpressions"
        );


    const clicks =
        document.getElementById(
            "sellerAdClicks"
        );


    const ctrElement =
        document.getElementById(
            "sellerAdCTR"
        );


    if(total){

        total.textContent =
            ads.length.toLocaleString();

    }


    if(active){

        active.textContent =
            activeAds.toLocaleString();

    }


    if(impressions){

        impressions.textContent =
            totalImpressions.toLocaleString();

    }


    if(clicks){

        clicks.textContent =
            totalClicks.toLocaleString();

    }


    if(ctrElement){

        ctrElement.textContent =
            ctr.toFixed(2) + "%";

    }

}


/* ==========================================================
   CREATE PERFORMANCE CARD
========================================================== */

function createSellerAdPerformanceCard(
    ad
){

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "seller-ad-performance-card";


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


    const ctr =
        impressions > 0
            ? (
                clicks /
                impressions
            ) * 100
            : 0;


    const active =
        sellerAdIsActive(
            ad
        );


    let impressionProgress =
        0;


    if(maxImpressions > 0){

        impressionProgress =
            Math.min(
                100,
                (
                    impressions /
                    maxImpressions
                ) * 100
            );

    }


    let clickProgress =
        0;


    if(maxClicks > 0){

        clickProgress =
            Math.min(
                100,
                (
                    clicks /
                    maxClicks
                ) * 100
            );

    }


    const status =
        active
            ? "ACTIVE"
            : "COMPLETED";


    const statusClass =
        active
            ? "active"
            : "completed";


    card.innerHTML = `

        <div class="seller-ad-performance-top">

            <div>

                <span class="seller-ad-code">
                    ${escapeSellerAdsHTML(
                        ad.adCode ||
                        "Advertisement"
                    )}
                </span>

                <h3>
                    Advertising Campaign
                </h3>

            </div>


            <span
                class="seller-ad-status ${statusClass}"
            >
                ${status}
            </span>

        </div>


        <div class="seller-ad-metrics">

            <div>

                <span>
                    Impressions
                </span>

                <strong>
                    ${impressions.toLocaleString()}
                </strong>

            </div>


            <div>

                <span>
                    Clicks
                </span>

                <strong>
                    ${clicks.toLocaleString()}
                </strong>

            </div>


            <div>

                <span>
                    CTR
                </span>

                <strong>
                    ${ctr.toFixed(2)}%
                </strong>

            </div>

        </div>


        ${
            maxImpressions > 0
                ? `

                    <div class="seller-ad-progress">

                        <div class="seller-ad-progress-heading">

                            <span>
                                Impression Progress
                            </span>

                            <strong>
                                ${impressions.toLocaleString()}
                                /
                                ${maxImpressions.toLocaleString()}
                            </strong>

                        </div>


                        <div class="seller-ad-progress-bar">

                            <span
                                style="width:${impressionProgress}%"
                            ></span>

                        </div>

                    </div>

                  `
                : `

                    <div class="seller-ad-unlimited">
                        Impression limit: Unlimited
                    </div>

                  `
        }


        ${
            maxClicks > 0
                ? `

                    <div class="seller-ad-progress">

                        <div class="seller-ad-progress-heading">

                            <span>
                                Click Progress
                            </span>

                            <strong>
                                ${clicks.toLocaleString()}
                                /
                                ${maxClicks.toLocaleString()}
                            </strong>

                        </div>


                        <div class="seller-ad-progress-bar">

                            <span
                                style="width:${clickProgress}%"
                            ></span>

                        </div>

                    </div>

                  `
                : `

                    <div class="seller-ad-unlimited">
                        Click limit: Unlimited
                    </div>

                  `
        }

    `;


    return card;

}


/* ==========================================================
   REFRESH BUTTON
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const refresh =
            document.getElementById(
                "refreshSellerAds"
            );


        if(refresh){

            refresh.addEventListener(
                "click",
                loadSellerAdsPerformance
            );

        }


        loadSellerAdsPerformance();

    }
);

