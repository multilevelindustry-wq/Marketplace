/* ==========================================================
   AUTHENTICATION SYSTEM
========================================================== */

import {
    auth
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


/* ==========================================================
   GLOBAL AUTH STATE
========================================================== */

let currentUser = null;

let authInitialized = false;

let authResolve;

const authReady =
    new Promise((resolve) => {

        authResolve = resolve;

    });


/* ==========================================================
   FIREBASE AUTH STATE LISTENER
========================================================== */

onAuthStateChanged(
    auth,
    (user) => {

        currentUser =
            user || null;

        authInitialized = true;

        authResolve(currentUser);

        window.dispatchEvent(
            new CustomEvent(
                "authStateReady",
                {
                    detail: {
                        user:
                            currentUser
                    }
                }
            )
        );

    }
);


/* ==========================================================
   WAIT FOR AUTH
========================================================== */

async function waitForAuth() {

    if (authInitialized) {

        return currentUser;

    }

    return await authReady;

}


/* ==========================================================
   GET CURRENT USER
========================================================== */

function getCurrentUser() {

    return currentUser;

}


/* ==========================================================
   CHECK LOGIN
========================================================== */

async function isUserLoggedIn() {

    const user =
        await waitForAuth();

    return !!user;

}


/* ==========================================================
   REQUIRE AUTHENTICATION
========================================================== */

async function requireLogin(
    redirectPage = "login.html"
) {

    const user =
        await waitForAuth();


    if (!user) {

        window.location.href =
            redirectPage;

        return null;

    }


    return user;

}


/* ==========================================================
   REQUIRE SELLER LOGIN
========================================================== */

async function requireSellerLogin() {

    const user =
        await waitForAuth();


    if (!user) {

        window.location.href =
            "login.html";

        return null;

    }


    return user;

}


/* ==========================================================
   LOGOUT
========================================================== */

async function logoutUser(
    redirectPage = "login.html"
) {

    try {

        await signOut(auth);

        currentUser = null;

        window.location.href =
            redirectPage;

    } catch (error) {

        console.error(
            "Logout failed:",
            error
        );

        throw error;

    }

}


/* ==========================================================
   AUTH ERROR MESSAGE
========================================================== */

function getAuthErrorMessage(
    error
) {

    if (!error) {

        return "An unknown authentication error occurred.";

    }


    switch (error.code) {

        case "auth/invalid-email":

            return "Please enter a valid email address.";


        case "auth/user-not-found":

            return "No account was found with this email.";


        case "auth/wrong-password":

            return "Incorrect password.";


        case "auth/invalid-credential":

            return "The email or password is incorrect.";


        case "auth/email-already-in-use":

            return "This email is already registered.";


        case "auth/weak-password":

            return "Your password is too weak.";


        case "auth/user-disabled":

            return "This account has been disabled.";


        case "auth/too-many-requests":

            return "Too many attempts. Please try again later.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";


        default:

            return (
                error.message ||
                "Authentication failed."
            );

    }

}


/* ==========================================================
   AUTH STATE HELPER
========================================================== */

function onUserChanged(
    callback
) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


/* ==========================================================
   EXPORT
========================================================== */

export {

    auth,

    currentUser,

    authReady,

    waitForAuth,

    getCurrentUser,

    isUserLoggedIn,

    requireLogin,

    requireSellerLogin,

    logoutUser,

    getAuthErrorMessage,

    onUserChanged

};



