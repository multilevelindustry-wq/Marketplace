/* ==========================================================
   SELLER REGISTRATION COMPLETION
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
    getDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   ELEMENTS
========================================================== */

const sellerEmail =
    document.getElementById(
        "sellerEmail"
    );

const completeLoader =
    document.getElementById(
        "completeLoader"
    );


/* ==========================================================
   VERIFY SELLER ACCOUNT
========================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        try {

            const sellerRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const sellerSnapshot =
                await getDoc(
                    sellerRef
                );


            if (!sellerSnapshot.exists()) {

                window.location.href =
                    "signup.html";

                return;

            }


            const seller =
                sellerSnapshot.data();


            if (
                seller.accountType !==
                "seller"
            ) {

                window.location.href =
                    "index.html";

                return;

            }


            if (sellerEmail) {

                sellerEmail.textContent =
                    seller.email ||
                    user.email ||
                    "";

            }


            completeLoader?.classList.add(
                "hidden"
            );


        } catch (error) {

            console.error(
                "Seller verification failed:",
                error
            );


            window.location.href =
                "login.html";

        }

    }
);


