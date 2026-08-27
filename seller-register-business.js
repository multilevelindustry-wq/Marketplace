/* ==========================================================
   SELLER BUSINESS REGISTRATION
========================================================== */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   FORM REFERENCES
========================================================== */

const businessForm =
    document.getElementById(
        "sellerBusinessForm"
    );

const businessMessage =
    document.getElementById(
        "businessMessage"
    );


/* ==========================================================
   CURRENT SELLER
========================================================== */

let currentSeller = null;


/* ==========================================================
   AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        currentSeller = user;

    }
);


/* ==========================================================
   FORM SUBMISSION
========================================================== */

businessForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentSeller) {

            showBusinessMessage(
                "Your session has expired. Please sign in again.",
                "error"
            );

            return;

        }


        const formData =
            new FormData(
                businessForm
            );


        const storeName =
            formData
                .get("storeName")
                ?.trim();


        const businessType =
            formData.get(
                "businessType"
            );


        const businessCategory =
            formData.get(
                "businessCategory"
            );


        const storeDescription =
            formData
                .get("storeDescription")
                ?.trim();


        const website =
            formData
                .get("website")
                ?.trim();


        const instagram =
            formData
                .get("instagram")
                ?.trim();


        const facebook =
            formData
                .get("facebook")
                ?.trim();


        const tiktok =
            formData
                .get("tiktok")
                ?.trim();


        if (
            !storeName ||
            !businessType ||
            !businessCategory ||
            !storeDescription
        ) {

            showBusinessMessage(
                "Please complete all required business fields.",
                "error"
            );

            return;

        }


        setBusinessLoading(true);


        try {

            /* ==============================================
               UPDATE EXISTING SELLER DOCUMENT
            =============================================== */

            await updateDoc(
                doc(
                    db,
                    "users",
                    currentSeller.uid
                ),
                {

                    storeName:
                        storeName,

                    businessType:
                        businessType,

                    businessCategory:
                        businessCategory,

                    storeDescription:
                        storeDescription,

                    website:
                        website || "",

                    socials: {

                        facebook:
                            facebook || "",

                        instagram:
                            instagram || "",

                        tiktok:
                            tiktok || "",

                        youtube: "",

                        x: "",

                        telegram: "",

                        whatsapp: "",

                        website:
                            website || ""

                    },

                    registrationCompleted:
                        true,

                    updatedAt:
                        serverTimestamp()

                }
            );


            showBusinessMessage(
                "Business information saved successfully.",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "seller-register-complete.html";

                },
                900
            );


        } catch (error) {

            console.error(
                "Business registration error:",
                error
            );


            showBusinessMessage(
                "We could not save your business information. Please try again.",
                "error"
            );


            setBusinessLoading(
                false
            );

        }

    }
);


/* ==========================================================
   MESSAGE
========================================================== */

function showBusinessMessage(
    message,
    type
) {

    if (!businessMessage) {

        return;

    }


    businessMessage.textContent =
        message;


    businessMessage.className =
        `registration-message ${type}`;

}


/* ==========================================================
   LOADING STATE
========================================================== */

function setBusinessLoading(
    loading
) {

    const button =
        businessForm?.querySelector(
            ".primary-button"
        );


    if (!button) {

        return;

    }


    button.disabled =
        loading;


    button.innerHTML =
        loading
            ? "Saving..."
            : 'Continue <span>→</span>';

}


/* ==========================================================
   PAGE LOADER
========================================================== */

window.addEventListener(
    "load",
    () => {

        document
            .getElementById(
                "businessLoader"
            )
            ?.classList.add(
                "hidden"
            );

    }
);


