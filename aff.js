/* ==========================================================
   AFF.JS
   SHARED AFFILIATE SYSTEM
========================================================== */

import {
    db
} from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   AFFILIATE CONFIGURATION
========================================================== */

const AFFILIATE_STORAGE_KEY =
    "marketplaceAffiliateReferral";


const AFFILIATE_COOKIE_DAYS =
    30;


const AFFILIATE_BASE_URL =
    window.location.origin +
    window.location.pathname;


/* ==========================================================
   CATEGORY COMMISSION RATES
========================================================== */

export const AFFILIATE_COMMISSION_RATES = {

    fashion: 0.05,

    electronics: 0.08,

    phones: 0.08,

    computers: 0.08,

    beauty: 0.06,

    health: 0.07,

    supplements: 0.06,

    food: 0.04,

    groceries: 0.04,

    home: 0.05,

    furniture: 0.05,

    sports: 0.05,

    automotive: 0.04,

    books: 0.03,

    toys: 0.05,

    jewelry: 0.07,

    shoes: 0.05,

    bags: 0.05,

    appliances: 0.07,

    other: 0.03

};


/* ==========================================================
   NORMALIZE CATEGORY
========================================================== */

export function normalizeAffiliateCategory(
    category
) {

    return String(
        category ||
        "other"
    )
    .trim()
    .toLowerCase()
    .replace(
        /[\s_-]+/g,
        ""
    );

}


/* ==========================================================
   GET COMMISSION RATE
========================================================== */

export function getAffiliateCommissionRate(
    category
) {

    const normalized =
        normalizeAffiliateCategory(
            category
        );


    return (
        AFFILIATE_COMMISSION_RATES[
            normalized
        ] ||
        AFFILIATE_COMMISSION_RATES.other
    );

}


/* ==========================================================
   CALCULATE COMMISSION
   IMPORTANT:
   sellerPrice is used, NOT buyer price.
========================================================== */

export function calculateAffiliateCommission(
    sellerPrice,
    category
) {

    const amount =
        Number(
            sellerPrice
        ) || 0;


    const rate =
        getAffiliateCommissionRate(
            category
        );


    const commission =
        amount * rate;


    return {

        sellerPrice:
            amount,

        rate:
            rate,

        commission:
            Number(
                commission.toFixed(2)
            )

    };

}


/* ==========================================================
   GENERATE AFFILIATE CODE
========================================================== */

export function generateAffiliateCode() {

    const randomPart =
        Math.random()
            .toString(36)
            .substring(
                2,
                8
            )
            .toUpperCase();


    return (
        "AFF-" +
        randomPart
    );

}


/* ==========================================================
   GENERATE AFFILIATE LINK
========================================================== */

export function generateAffiliateLink(
    affiliateCode
) {

    if (
        !affiliateCode
    ) {

        return "";

    }


    const baseURL =
        window.location.origin;


    return (
        baseURL +
        "/?ref=" +
        encodeURIComponent(
            affiliateCode
        )
    );

}


/* ==========================================================
   READ REFERRAL FROM URL
========================================================== */

export function getAffiliateReferralFromURL() {

    const parameters =
        new URLSearchParams(
            window.location.search
        );


    const referral =
        parameters.get(
            "ref"
        );


    if (
        !referral
    ) {

        return "";

    }


    return referral.trim();

}


/* ==========================================================
   SAVE REFERRAL LOCALLY
========================================================== */

export function saveAffiliateReferral(
    affiliateCode
) {

    if (
        !affiliateCode
    ) {

        return false;

    }


    const referralData = {

        affiliateCode:
            String(
                affiliateCode
            )
            .trim(),

        savedAt:
            Date.now()

    };


    try {

        localStorage.setItem(
            AFFILIATE_STORAGE_KEY,
            JSON.stringify(
                referralData
            )
        );


        return true;

    }

    catch(error) {

        console.error(
            "AFFILIATE REFERRAL SAVE ERROR:",
            error
        );


        return false;

    }

}


/* ==========================================================
   GET SAVED REFERRAL
========================================================== */

export function getSavedAffiliateReferral() {

    try {

        const stored =
            localStorage.getItem(
                AFFILIATE_STORAGE_KEY
            );


        if (
            !stored
        ) {

            return "";

        }


        const data =
            JSON.parse(
                stored
            );


        if (
            !data ||
            !data.affiliateCode
        ) {

            return "";

        }


        const age =
            Date.now() -
            Number(
                data.savedAt || 0
            );


        const maxAge =
            AFFILIATE_COOKIE_DAYS *
            24 *
            60 *
            60 *
            1000;


        if (
            age > maxAge
        ) {

            localStorage.removeItem(
                AFFILIATE_STORAGE_KEY
            );


            return "";

        }


        return String(
            data.affiliateCode
        );

    }

    catch(error) {

        console.error(
            "AFFILIATE REFERRAL READ ERROR:",
            error
        );


        return "";

    }

}


/* ==========================================================
   CLEAR SAVED REFERRAL
========================================================== */

export function clearAffiliateReferral() {

    try {

        localStorage.removeItem(
            AFFILIATE_STORAGE_KEY
        );

        return true;

    }

    catch(error) {

        console.error(
            "AFFILIATE REFERRAL CLEAR ERROR:",
            error
        );


        return false;

    }

}


/* ==========================================================
   FIND AFFILIATE BY CODE
========================================================== */

export async function findAffiliateByCode(
    affiliateCode
) {

    if (
        !affiliateCode
    ) {

        return null;

    }


    try {

        const reference =
            doc(
                db,
                "affiliateCodes",
                String(
                    affiliateCode
                )
                .trim()
                .toUpperCase()
            );


        const snapshot =
            await getDoc(
                reference
            );


        if (
            !snapshot.exists()
        ) {

            return null;

        }


        return {

            id:
                snapshot.id,

            ...snapshot.data()

        };

    }

    catch(error) {

        console.error(
            "FIND AFFILIATE ERROR:",
            error
        );


        return null;

    }

}


/* ==========================================================
   RECORD AFFILIATE CLICK
========================================================== */

export async function recordAffiliateVisit(
    affiliateCode
) {

    if (
        !affiliateCode
    ) {

        return null;

    }


    try {

        const affiliate =
            await findAffiliateByCode(
                affiliateCode
            );


        if (
            !affiliate ||
            !affiliate.userId
        ) {

            return null;

        }


        const affiliateReference =
            doc(
                db,
                "affiliates",
                affiliate.userId
            );


        await updateDoc(
            affiliateReference,
            {

                clicks:
                    increment(1),

                updatedAt:
                    serverTimestamp()

            }
        );


        return affiliate.userId;

    }

    catch(error) {

        console.error(
            "AFFILIATE CLICK ERROR:",
            error
        );


        return null;

    }

}


/* ==========================================================
   PROCESS REFERRAL FROM CURRENT URL
========================================================== */

export async function processAffiliateReferral() {

    const referral =
        getAffiliateReferralFromURL();


    if (
        !referral
    ) {

        return "";

    }


    const normalized =
        referral
            .trim()
            .toUpperCase();


    const affiliate =
        await findAffiliateByCode(
            normalized
        );


    if (
        !affiliate ||
        !affiliate.userId
    ) {

        console.warn(
            "Invalid affiliate referral:",
            normalized
        );


        return "";

    }


    saveAffiliateReferral(
        normalized
    );


    const alreadyCounted =
        sessionStorage.getItem(
            "affiliateVisitCounted:" +
            normalized
        );


    if (
        !alreadyCounted
    ) {

        await recordAffiliateVisit(
            normalized
        );


        sessionStorage.setItem(
            "affiliateVisitCounted:" +
            normalized,
            "true"
        );

    }


    return normalized;

}


/* ==========================================================
   GET CURRENT AFFILIATE
========================================================== */

export async function getCurrentAffiliate() {

    const code =
        getSavedAffiliateReferral();


    if (
        !code
    ) {

        return null;

    }


    return findAffiliateByCode(
        code
    );

}


/* ==========================================================
   ATTACH AFFILIATE TO ORDER DATA
========================================================== */

export function getAffiliateOrderData() {

    const code =
        getSavedAffiliateReferral();


    if (
        !code
    ) {

        return {

            affiliateCode:
                null,

            affiliateId:
                null

        };

    }


    return {

        affiliateCode:
            code,

        affiliateId:
            null

    };

}


/* ==========================================================
   INITIALIZE AFFILIATE REFERRAL
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        processAffiliateReferral();

    }
);

