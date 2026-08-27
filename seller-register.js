/* ==========================================================
   SELLER REGISTRATION
========================================================== */

import {
    auth,
    db
} from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   REGISTRATION FORM
========================================================== */

const registrationForm =
    document.getElementById(
        "sellerRegistrationForm"
    );


/* ==========================================================
   REGISTRATION MESSAGE
========================================================== */

const registrationMessage =
    document.getElementById(
        "registrationMessage"
    );


/* ==========================================================
   FORM SUBMISSION
========================================================== */

registrationForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const formData =
            new FormData(
                registrationForm
            );


        const name =
            formData.get("name")
                ?.trim();


        const email =
            formData.get("email")
                ?.trim()
                .toLowerCase();


        const password =
            formData.get("password");


        const phone =
            formData.get("phone")
                ?.trim();


        const country =
            formData.get("country");


        const location =
            formData.get("location")
                ?.trim();


        if (
            !name ||
            !email ||
            !password ||
            !phone ||
            !country ||
            !location
        ) {

            showRegistrationMessage(
                "Please complete all required fields.",
                "error"
            );

            return;

        }


        if (password.length < 8) {

            showRegistrationMessage(
                "Password must contain at least 8 characters.",
                "error"
            );

            return;

        }


        setRegistrationLoading(true);


        try {

            /* ==============================================
               CREATE FIREBASE AUTH ACCOUNT
            =============================================== */

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            /* ==============================================
               SAVE DISPLAY NAME
            =============================================== */

            await updateProfile(
                user,
                {
                    displayName: name
                }
            );


            /* ==============================================
               CREATE SELLER PROFILE
            =============================================== */

            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {

                    uid:
                        user.uid,

                    accountType:
                        "seller",

                    role:
                        "seller",

                    name:
                        name,

                    email:
                        email,

                    phone:
                        phone,

                    country:
                        country,

                    location:
                        location,

                    photo:
                        "",

                    website:
                        "",

                    socials: {

                        facebook: "",

                        instagram: "",

                        tiktok: "",

                        youtube: "",

                        x: "",

                        telegram: "",

                        whatsapp: "",

                        website: ""

                    },

                    discount:
                        0,

                    promoCodes:
                        [],

                    statistics: {

                        monthly: {}

                    },

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            showRegistrationMessage(
                "Account created successfully.",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "seller-register-business.html";

                },
                900
            );


        } catch (error) {

            console.error(
                "Seller registration error:",
                error
            );


            showRegistrationMessage(
                getRegistrationError(error),
                "error"
            );


            setRegistrationLoading(
                false
            );

        }

    }
);


/* ==========================================================
   REGISTRATION MESSAGE
========================================================== */

function showRegistrationMessage(
    message,
    type
) {

    if (!registrationMessage) {

        return;

    }


    registrationMessage.textContent =
        message;


    registrationMessage.className =
        `registration-message ${type}`;

}


/* ==========================================================
   FORM LOADING STATE
========================================================== */

function setRegistrationLoading(
    loading
) {

    const button =
        registrationForm?.querySelector(
            ".primary-button"
        );


    if (!button) {

        return;

    }


    button.disabled =
        loading;


    button.innerHTML =
        loading
            ? "Creating account..."
            : 'Continue <span>→</span>';

}


/* ==========================================================
   FIREBASE ERROR MESSAGE
========================================================== */

function getRegistrationError(
    error
) {

    switch (error.code) {

        case "auth/email-already-in-use":

            return "An account with this email already exists.";

        case "auth/invalid-email":

            return "Please enter a valid email address.";

        case "auth/weak-password":

            return "Please choose a stronger password.";

        case "auth/network-request-failed":

            return "Network error. Please check your connection.";

        default:

            return (
                error.message ||
                "Registration could not be completed."
            );

    }

}


/* ==========================================================
   PAGE LOADER
========================================================== */

window.addEventListener(
    "load",
    () => {

        const loader =
            document.getElementById(
                "registerLoader"
            );


        loader?.classList.add(
            "hidden"
        );

    }
);

