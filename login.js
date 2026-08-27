import {
    auth,
    db
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   ELEMENTS
========================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const rememberAccount =
    document.getElementById(
        "rememberAccount"
    );

const loginLoader =
    document.getElementById(
        "loginLoader"
    );


/* ==========================================================
   PASSWORD VISIBILITY
========================================================== */

togglePassword?.addEventListener(
    "click",
    () => {

        const hidden =
            loginPassword.type ===
            "password";


        loginPassword.type =
            hidden
                ? "text"
                : "password";


        togglePassword.textContent =
            hidden
                ? "Hide"
                : "Show";

    }
);


/* ==========================================================
   LOGIN
========================================================== */

loginForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            loginEmail.value
                .trim()
                .toLowerCase();


        const password =
            loginPassword.value;


        if (!email || !password) {

            showLoginMessage(
                "Enter your email and password.",
                "error"
            );

            return;

        }


        setLoginLoading(true);


        try {

            /* ==============================================
               REMEMBER LOGIN
            =============================================== */

            await setPersistence(
                auth,
                rememberAccount?.checked
                    ? browserLocalPersistence
                    : browserSessionPersistence
            );


            /* ==============================================
               FIREBASE AUTHENTICATION
            =============================================== */

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            /* ==============================================
               LOAD USER PROFILE
            =============================================== */

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(
                    userRef
                );


            if (!userSnapshot.exists()) {

                showLoginMessage(
                    "Your account profile could not be found.",
                    "error"
                );

                setLoginLoading(false);

                return;

            }


            const profile =
                userSnapshot.data();


            /* ==============================================
               IDENTIFY ACCOUNT
            =============================================== */

            const accountType =
                profile.accountType ||
                profile.role;


            if (
                accountType ===
                "seller"
            ) {

                showLoginMessage(
                    "Seller account verified. Opening dashboard...",
                    "success"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "seller.html";

                    },
                    500
                );


                return;

            }


            if (
                accountType ===
                "buyer"
            ) {

                showLoginMessage(
                    "Welcome back. Opening your account...",
                    "success"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "index.html";

                    },
                    500
                );


                return;

            }


            /* ==============================================
               UNKNOWN ACCOUNT TYPE
            =============================================== */

            showLoginMessage(
                "Your account type could not be identified. Please contact support.",
                "error"
            );


            setLoginLoading(false);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            showLoginMessage(
                getLoginError(
                    error
                ),
                "error"
            );


            setLoginLoading(false);

        }

    }
);


/* ==========================================================
   LOGIN MESSAGE
========================================================== */

function showLoginMessage(
    message,
    type
) {

    if (!loginMessage) {

        return;

    }


    loginMessage.textContent =
        message;


    loginMessage.className =
        `login-message ${type}`;

}


/* ==========================================================
   LOADING STATE
========================================================== */

function setLoginLoading(
    loading
) {

    if (!loginButton) {

        return;

    }


    loginButton.disabled =
        loading;


    loginButton.innerHTML =
        loading
            ? "Signing in..."
            : `
                <span>Sign in</span>
                <span class="button-arrow">→</span>
              `;

}


/* ==========================================================
   FIREBASE LOGIN ERRORS
========================================================== */

function getLoginError(
    error
) {

    switch (error.code) {

        case "auth/invalid-credential":

        case "auth/wrong-password":

        case "auth/user-not-found":

            return "Incorrect email or password.";

        case "auth/invalid-email":

            return "Please enter a valid email address.";

        case "auth/user-disabled":

            return "This account has been disabled.";

        case "auth/too-many-requests":

            return "Too many login attempts. Please try again later.";

        case "auth/network-request-failed":

            return "Network error. Check your internet connection.";

        default:

            return (
                error.message ||
                "Unable to sign in. Please try again."
            );

    }

}


/* ==========================================================
   PAGE LOADER
========================================================== */

window.addEventListener(
    "load",
    () => {

        loginLoader?.classList.add(
            "hidden"
        );

    }
);

