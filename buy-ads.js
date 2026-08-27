/* ==========================================================
   BUY-ADS.JS
   SELLER ADVERTISING PURCHASE SYSTEM
   PART 1 OF 3
========================================================== */


/* ==========================================================
   FIREBASE
========================================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   PAYSTACK CONFIGURATION
========================================================== */

/*
 * Put your Paystack PUBLIC KEY here.
 *
 * Example:
 *
 * const PAYSTACK_PUBLIC_KEY =
 *     "pk_test_xxxxxxxxxxxxxxxxx";
 *
 * For live payment use:
 *
 * pk_live_xxxxxxxxxxxxxxxxx
 *
 * Do NOT put your Paystack SECRET KEY here.
 */

const PAYSTACK_PUBLIC_KEY =
    "pk_live_ae2ef39d24e2f001cbc716def10d3ede5148af5b";


/* ==========================================================
   COLLECTION
========================================================== */

const AD_PAYMENT_COLLECTION =
    "adPayments";


/* ==========================================================
   SELECTED PLAN
========================================================== */

let selectedAdvertisingPlan =
    null;


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeBuyAdsHTML(
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
   FORMAT MONEY
========================================================== */

function formatAdsMoney(
    amount
) {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-NG"
    );

}


/* ==========================================================
   GET PLAN INFORMATION
========================================================== */

function getAdvertisingPlan(
    planName
) {

    const plans = {

        starter: {

            name:
                "Product Discovery",

            label:
                "STARTER",

            price:
                2500,

            impressions:
                5000,

            clicks:
                0

        },


        growth: {

            name:
                "Store Growth",

            label:
                "GROWTH",

            price:
                5000,

            impressions:
                15000,

            clicks:
                0

        },


        premium: {

            name:
                "Maximum Reach",

            label:
                "PREMIUM",

            price:
                10000,

            impressions:
                40000,

            clicks:
                0

        }

    };


    return plans[
        planName
    ] || null;

}


/* ==========================================================
   SELECT ADVERTISING PLAN
========================================================== */

function selectAdvertisingPlan(
    button
) {

    const planName =
        button.dataset.plan;


    const plan =
        getAdvertisingPlan(
            planName
        );


    if (!plan) {

        setAdsPaymentStatus(
            "The selected advertising plan could not be found.",
            "error"
        );

        return;

    }


    selectedAdvertisingPlan =
        plan;


    selectedAdvertisingPlan.planId =
        planName;


    updateSelectedPlanDisplay();


    const campaignSection =
        document.getElementById(
            "campaignSection"
        );


    if (campaignSection) {

        campaignSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* ==========================================================
   UPDATE SELECTED PLAN DISPLAY
========================================================== */

function updateSelectedPlanDisplay() {

    const planNameElement =
        document.getElementById(
            "selectedPlanName"
        );


    const planDetailsElement =
        document.getElementById(
            "selectedPlanDetails"
        );


    const summaryPlan =
        document.getElementById(
            "summaryPlan"
        );


    const summaryImpressions =
        document.getElementById(
            "summaryImpressions"
        );


    const summaryPrice =
        document.getElementById(
            "summaryPrice"
        );


    const paymentButton =
        document.getElementById(
            "payForAds"
        );


    if (
        !selectedAdvertisingPlan
    ) {

        if (planNameElement) {

            planNameElement.textContent =
                "No plan selected";

        }


        if (planDetailsElement) {

            planDetailsElement.textContent =
                "Select an advertising plan above.";

        }


        if (summaryPlan) {

            summaryPlan.textContent =
                "Not selected";

        }


        if (summaryImpressions) {

            summaryImpressions.textContent =
                "0";

        }


        if (summaryPrice) {

            summaryPrice.textContent =
                "₦0";

        }


        if (paymentButton) {

            paymentButton.disabled =
                true;

            paymentButton.textContent =
                "Select an Advertising Plan";

        }


        return;

    }


    if (planNameElement) {

        planNameElement.textContent =
            selectedAdvertisingPlan.name;

    }


    if (planDetailsElement) {

        planDetailsElement.textContent =
            `${formatAdsMoney(
                selectedAdvertisingPlan.impressions
            )} impressions`;

    }


    if (summaryPlan) {

        summaryPlan.textContent =
            selectedAdvertisingPlan.name;

    }


    if (summaryImpressions) {

        summaryImpressions.textContent =
            formatAdsMoney(
                selectedAdvertisingPlan.impressions
            );

    }


    if (summaryPrice) {

        summaryPrice.textContent =
            `₦${formatAdsMoney(
                selectedAdvertisingPlan.price
            )}`;

    }


    if (paymentButton) {

        paymentButton.disabled =
            false;

        paymentButton.textContent =
            `Pay ₦${formatAdsMoney(
                selectedAdvertisingPlan.price
            )} for Advertising`;

    }

}


/* ==========================================================
   PAYMENT STATUS
========================================================== */

function setAdsPaymentStatus(
    message,
    type = ""
) {

    const status =
        document.getElementById(
            "adsPaymentStatus"
        );


    if (!status) {

        return;

    }


    status.textContent =
        message;


    status.className =
        "ads-payment-status";


    if (type) {

        status.classList.add(
            type
        );

    }

}


/* ==========================================================
   READ CAMPAIGN FORM
========================================================== */

function getCampaignFormData() {

    const sellerId =
        document.getElementById(
            "sellerId"
        )?.value
        ?.trim() || "";


    const sellerName =
        document.getElementById(
            "sellerName"
        )?.value
        ?.trim() || "";


    const sellerEmail =
        document.getElementById(
            "sellerEmail"
        )?.value
        ?.trim() || "";


    const sellerPhone =
        document.getElementById(
            "sellerPhone"
        )?.value
        ?.trim() || "";


    const campaignTitle =
        document.getElementById(
            "campaignTitle"
        )?.value
        ?.trim() || "";


    const adMessage =
        document.getElementById(
            "adMessage"
        )?.value
        ?.trim() || "";


    return {

        sellerId,

        sellerName,

        sellerEmail,

        sellerPhone,

        campaignTitle,

        adMessage

    };

}


/* ==========================================================
   VALIDATE CAMPAIGN FORM
========================================================== */

function validateCampaignForm() {

    if (
        !selectedAdvertisingPlan
    ) {

        setAdsPaymentStatus(
            "Please select an advertising plan first.",
            "error"
        );

        return false;

    }


    const data =
        getCampaignFormData();


    if (!data.sellerId) {

        setAdsPaymentStatus(
            "Please enter your Seller ID.",
            "error"
        );

        return false;

    }


    if (!data.sellerName) {

        setAdsPaymentStatus(
            "Please enter your seller or store name.",
            "error"
        );

        return false;

    }


    if (!data.sellerEmail) {

        setAdsPaymentStatus(
            "Please enter your email address.",
            "error"
        );

        return false;

    }


    if (!data.sellerPhone) {

        setAdsPaymentStatus(
            "Please enter your phone number.",
            "error"
        );

        return false;

    }


    return true;

}


/* ==========================================================
   PLAN BUTTON EVENTS
========================================================== */

function initializePlanButtons() {

    const buttons =
        document.querySelectorAll(
            ".select-plan"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    selectAdvertisingPlan(
                        button
                    );

                }
            );

        }
    );

}


/* ==========================================================
   INITIAL PLAN DISPLAY
========================================================== */

function initializeAdvertisingPage() {

    updateSelectedPlanDisplay();

    initializePlanButtons();

}


/* ==========================================================
   BUY-ADS.JS
   PART 2 OF 3
========================================================== */


/* ==========================================================
   LOAD PAYSTACK SCRIPT
========================================================== */

function loadPaystackScript() {

    return new Promise(
        function(resolve, reject) {

            if (
                typeof PaystackPop !==
                "undefined"
            ) {

                resolve();

                return;

            }


            const existingScript =
                document.querySelector(
                    'script[src*="paystack"]'
                );


            if (existingScript) {

                existingScript.addEventListener(
                    "load",
                    function() {

                        resolve();

                    }
                );


                existingScript.addEventListener(
                    "error",
                    function() {

                        reject(
                            new Error(
                                "Paystack could not be loaded."
                            )
                        );

                    }
                );


                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://js.paystack.co/v2/inline.js";


            script.async =
                true;


            script.onload =
                function() {

                    resolve();

                };


            script.onerror =
                function() {

                    reject(
                        new Error(
                            "Unable to load Paystack."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


/* ==========================================================
   CREATE PAYMENT RECORD
========================================================== */

async function saveAdvertisingPayment(
    campaignData,
    paymentData
) {

    const paymentRecord = {

        /* ================================================
           SELLER INFORMATION
        ================================================= */

        sellerId:
            campaignData.sellerId,

        sellerName:
            campaignData.sellerName,

        sellerEmail:
            campaignData.sellerEmail,

        sellerPhone:
            campaignData.sellerPhone,


        /* ================================================
           CAMPAIGN INFORMATION
        ================================================= */

        campaignTitle:
            campaignData.campaignTitle,

        adMessage:
            campaignData.adMessage,


        /* ================================================
           PLAN INFORMATION
        ================================================= */

        planId:
            selectedAdvertisingPlan.planId,

        planName:
            selectedAdvertisingPlan.name,

        planLabel:
            selectedAdvertisingPlan.label,

        price:
            selectedAdvertisingPlan.price,

        maxImpressions:
            selectedAdvertisingPlan.impressions,

        maxClicks:
            selectedAdvertisingPlan.clicks,


        /* ================================================
           PAYMENT INFORMATION
        ================================================= */

        paymentReference:
            paymentData.reference,

        paymentStatus:
            "paid",

        paymentGateway:
            "paystack",

        amountPaid:
            selectedAdvertisingPlan.price,

        currency:
            "NGN",


        /* ================================================
           ADMIN STATUS
        ================================================= */

        adminStatus:
            "pending",

        adStatus:
            "awaiting_admin_placement",

        adminReviewed:
            false,


        /* ================================================
           AD INFORMATION
        ================================================= */

        adCode:
            "",

        adDocumentId:
            "",


        /* ================================================
           STATISTICS
        ================================================= */

        impressions:
            0,

        clicks:
            0,


        /* ================================================
           TIMESTAMPS
        ================================================= */

        createdAt:
            serverTimestamp(),

        updatedAt:
            serverTimestamp()

    };


    const reference =
        await addDoc(
            collection(
                db,
                AD_PAYMENT_COLLECTION
            ),
            paymentRecord
        );


    return reference.id;

}


/* ==========================================================
   START PAYSTACK PAYMENT
========================================================== */

async function startAdvertisingPayment() {

    if (
        !validateCampaignForm()
    ) {

        return;

    }


    if (
        !PAYSTACK_PUBLIC_KEY
    ) {

        setAdsPaymentStatus(
            "Paystack public key is not configured.",
            "error"
        );

        console.error(
            "PAYSTACK PUBLIC KEY IS MISSING."
        );

        return;

    }


    const campaignData =
        getCampaignFormData();


    const paymentButton =
        document.getElementById(
            "payForAds"
        );


    if (paymentButton) {

        paymentButton.disabled =
            true;

        paymentButton.textContent =
            "Opening Payment...";

    }


    setAdsPaymentStatus(
        "Preparing secure payment...",
        "loading"
    );


    try {

        await loadPaystackScript();


        if (
            typeof PaystackPop ===
            "undefined"
        ) {

            throw new Error(
                "Paystack payment system is unavailable."
            );

        }


        const paystack =
            new PaystackPop();


        paystack.newTransaction({

            key:
                PAYSTACK_PUBLIC_KEY,

            email:
                campaignData.sellerEmail,

            amount:
                selectedAdvertisingPlan.price *
                100,

            currency:
                "NGN",


            metadata: {

                sellerId:
                    campaignData.sellerId,

                sellerName:
                    campaignData.sellerName,

                sellerPhone:
                    campaignData.sellerPhone,

                campaignTitle:
                    campaignData.campaignTitle,

                planId:
                    selectedAdvertisingPlan.planId,

                planName:
                    selectedAdvertisingPlan.name,

                adMessage:
                    campaignData.adMessage

            },


            onSuccess:
                async function(transaction) {

                    await handleAdvertisingPaymentSuccess(
                        transaction,
                        campaignData
                    );

                },


            onCancel:
                function() {

                    if (paymentButton) {

                        paymentButton.disabled =
                            false;

                        paymentButton.textContent =
                            `Pay ₦${formatAdsMoney(
                                selectedAdvertisingPlan.price
                            )} for Advertising`;

                    }


                    setAdsPaymentStatus(
                        "Payment was cancelled.",
                        "error"
                    );

                }

        });

    }
    catch(error) {

        console.error(
            "AD PAYMENT ERROR:",
            error
        );


        if (paymentButton) {

            paymentButton.disabled =
                false;

            paymentButton.textContent =
                `Pay ₦${formatAdsMoney(
                    selectedAdvertisingPlan.price
                )} for Advertising`;

        }


        setAdsPaymentStatus(
            error?.message ||
            "Unable to start payment.",
            "error"
        );

    }

}


/* ==========================================================
   HANDLE SUCCESSFUL PAYMENT
========================================================== */

async function handleAdvertisingPaymentSuccess(
    transaction,
    campaignData
) {

    const paymentButton =
        document.getElementById(
            "payForAds"
        );


    if (paymentButton) {

        paymentButton.disabled =
            true;

        paymentButton.textContent =
            "Saving Campaign...";

    }


    setAdsPaymentStatus(
        "Payment successful. Saving your advertising request...",
        "loading"
    );


    try {

        const reference =
            transaction?.reference;


        if (!reference) {

            throw new Error(
                "Payment reference was not returned."
            );

        }


        const paymentId =
            await saveAdvertisingPayment(
                campaignData,
                {
                    reference
                }
            );


        setAdsPaymentStatus(
            "Payment successful! Your advertising campaign has been sent to the admin for placement.",
            "success"
        );


        showAdvertisingSuccessMessage(
            reference,
            paymentId
        );


        resetAdvertisingForm();

    }
    catch(error) {

        console.error(
            "SAVE AD PAYMENT ERROR:",
            error
        );


        setAdsPaymentStatus(
            "Payment was successful, but the campaign information could not be saved. Please contact the administrator and provide your payment reference: " +
            (
                transaction?.reference ||
                "Unavailable"
            ),
            "error"
        );


        if (paymentButton) {

            paymentButton.disabled =
                false;

            paymentButton.textContent =
                "Payment Completed";

        }

    }

}


/* ==========================================================
   SUCCESS MESSAGE
========================================================== */

function showAdvertisingSuccessMessage(
    paymentReference,
    paymentId
) {

    const campaignSection =
        document.getElementById(
            "campaignSection"
        );


    if (!campaignSection) {

        return;

    }


    const oldMessage =
        document.getElementById(
            "advertisingSuccessBox"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    const message =
        document.createElement(
            "div"
        );


    message.id =
        "advertisingSuccessBox";


    message.className =
        "advertising-success-box";


    message.innerHTML = `

        <strong>
            Advertising Request Submitted
        </strong>

        <p>
            Your payment has been received successfully.
            Your campaign has been sent to the admin for
            advertising placement.
        </p>

        <div>

            Payment Reference:
            <b>
                ${escapeBuyAdsHTML(
                    paymentReference
                )}
            </b>

        </div>

        <div>

            Campaign ID:
            <b>
                ${escapeBuyAdsHTML(
                    paymentId
                )}
            </b>

        </div>

        <p>
            Keep your payment reference for your records.
        </p>

    `;


    campaignSection
        .prepend(
            message
        );


    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* ==========================================================
   RESET FORM AFTER PAYMENT
========================================================== */

function resetAdvertisingForm() {

    const form =
        document.getElementById(
            "adsPurchaseForm"
        );


    if (form) {

        form.reset();

    }


    selectedAdvertisingPlan =
        null;


    updateSelectedPlanDisplay();

}

/* ==========================================================
   BUY-ADS.JS
   PART 3 OF 3
========================================================== */


/* ==========================================================
   AUTO-FILL SELLER INFORMATION
========================================================== */

function loadSavedSellerInformation() {

    try {

        const savedSeller =
            localStorage.getItem(
                "seller"
            );


        if (!savedSeller) {

            return;

        }


        const seller =
            JSON.parse(
                savedSeller
            );


        const sellerId =
            document.getElementById(
                "sellerId"
            );


        const sellerName =
            document.getElementById(
                "sellerName"
            );


        const sellerEmail =
            document.getElementById(
                "sellerEmail"
            );


        const sellerPhone =
            document.getElementById(
                "sellerPhone"
            );


        if (
            sellerId &&
            !sellerId.value
        ) {

            sellerId.value =
                seller.id ||
                seller.uid ||
                seller.sellerId ||
                "";

        }


        if (
            sellerName &&
            !sellerName.value
        ) {

            sellerName.value =
                seller.storeName ||
                seller.shopName ||
                seller.name ||
                seller.displayName ||
                "";

        }


        if (
            sellerEmail &&
            !sellerEmail.value
        ) {

            sellerEmail.value =
                seller.email ||
                "";

        }


        if (
            sellerPhone &&
            !sellerPhone.value
        ) {

            sellerPhone.value =
                seller.phone ||
                seller.phoneNumber ||
                "";

        }

    }
    catch(error) {

        console.warn(
            "Could not load saved seller information:",
            error
        );

    }

}


/* ==========================================================
   ALSO CHECK COMMON LOCAL STORAGE KEYS
========================================================== */

function loadSellerDetailsFromStorage() {

    const possibleKeys = [

        "currentSeller",

        "currentUser",

        "user",

        "sellerData",

        "loggedInUser"

    ];


    for (
        const key of possibleKeys
    ) {

        try {

            const raw =
                localStorage.getItem(
                    key
                );


            if (!raw) {

                continue;

            }


            const seller =
                JSON.parse(
                    raw
                );


            if (
                !seller ||
                typeof seller !==
                "object"
            ) {

                continue;

            }


            const sellerId =
                document.getElementById(
                    "sellerId"
                );


            const sellerName =
                document.getElementById(
                    "sellerName"
                );


            const sellerEmail =
                document.getElementById(
                    "sellerEmail"
                );


            const sellerPhone =
                document.getElementById(
                    "sellerPhone"
                );


            if (
                sellerId &&
                !sellerId.value
            ) {

                sellerId.value =
                    seller.id ||
                    seller.uid ||
                    seller.sellerId ||
                    "";

            }


            if (
                sellerName &&
                !sellerName.value
            ) {

                sellerName.value =
                    seller.storeName ||
                    seller.shopName ||
                    seller.name ||
                    seller.displayName ||
                    "";

            }


            if (
                sellerEmail &&
                !sellerEmail.value
            ) {

                sellerEmail.value =
                    seller.email ||
                    "";

            }


            if (
                sellerPhone &&
                !sellerPhone.value
            ) {

                sellerPhone.value =
                    seller.phone ||
                    seller.phoneNumber ||
                    "";

            }


            break;

        }
        catch(error) {

            console.warn(
                `Invalid seller data in ${key}`,
                error
            );

        }

    }

}


/* ==========================================================
   PHONE INPUT CLEANUP
========================================================== */

function initializePhoneInput() {

    const input =
        document.getElementById(
            "sellerPhone"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function() {

            this.value =
                this.value.replace(
                    /[^0-9+ ]/g,
                    ""
                );

        }
    );

}


/* ==========================================================
   EMAIL INPUT NORMALIZATION
========================================================== */

function initializeEmailInput() {

    const input =
        document.getElementById(
            "sellerEmail"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "blur",
        function() {

            this.value =
                this.value.trim()
                .toLowerCase();

        }
    );

}


/* ==========================================================
   CAMPAIGN MESSAGE LIMIT
========================================================== */

function initializeMessageCounter() {

    const textarea =
        document.getElementById(
            "adMessage"
        );


    if (!textarea) {

        return;

    }


    const counter =
        document.createElement(
            "small"
        );


    counter.className =
        "ad-message-counter";


    textarea.parentElement.appendChild(
        counter
    );


    function updateCounter() {

        counter.textContent =
            `${textarea.value.length}/180`;

    }


    textarea.addEventListener(
        "input",
        updateCounter
    );


    updateCounter();

}


/* ==========================================================
   PAYMENT FORM SUBMISSION
========================================================== */

function initializePaymentForm() {

    const form =
        document.getElementById(
            "adsPurchaseForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            startAdvertisingPayment();

        }
    );

}


/* ==========================================================
   PLAN BUTTON VISUAL STATE
========================================================== */

function initializePlanVisualState() {

    const buttons =
        document.querySelectorAll(
            ".select-plan"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    buttons.forEach(
                        function(item) {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );

                }
            );

        }
    );

}


/* ==========================================================
   ADVERTISING PAGE INITIALIZATION
========================================================== */

function initializeBuyAdsPage() {

    initializeAdvertisingPage();

    initializePaymentForm();

    initializePlanVisualState();

    initializePhoneInput();

    initializeEmailInput();

    initializeMessageCounter();

    loadSavedSellerInformation();

    loadSellerDetailsFromStorage();

}


/* ==========================================================
   START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeBuyAdsPage();

    }
);

