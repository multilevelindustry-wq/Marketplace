/* ==========================================================
   YOURSTORE ORDER TRACKING
========================================================== */

import {
    db
} from "./firebase.js";


import {
    collection,
    query,
    where,
    getDocs,
    limit
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";



/* ==========================================================
   ELEMENTS
========================================================== */

const codeInput =
    document.getElementById(
        "deliveryCodeInput"
    );


const trackButton =
    document.getElementById(
        "trackButton"
    );


const searchMessage =
    document.getElementById(
        "trackingSearchMessage"
    );


const result =
    document.getElementById(
        "trackingResult"
    );


const orderIdElement =
    document.getElementById(
        "trackingOrderId"
    );


const statusElement =
    document.getElementById(
        "trackingStatus"
    );


const courierElement =
    document.getElementById(
        "trackingCourier"
    );


const trackingElement =
    document.getElementById(
        "trackingNumber"
    );


const paymentElement =
    document.getElementById(
        "trackingPaymentId"
    );



/* ==========================================================
   TRACK
========================================================== */

trackButton.addEventListener(
    "click",
    trackOrder
);



async function trackOrder(){

    const code =
        codeInput.value.trim();


    if(!code){

        showMessage(
            "Enter your delivery code."
        );

        return;

    }


    trackButton.disabled =
        true;


    trackButton.textContent =
        "Searching...";


    try{

        const ordersRef =
            collection(
                db,
                "orders"
            );


        const orderQuery =
            query(
                ordersRef,
                where(
                    "deliveryCode",
                    "==",
                    code
                ),
                limit(1)
            );


        const snapshot =
            await getDocs(
                orderQuery
            );


        if(snapshot.empty){

            result.style.display =
                "none";


            showMessage(
                "No order was found for this delivery code."
            );

            return;

        }


        const orderDoc =
            snapshot.docs[0];


        const order = {

            id:
                orderDoc.id,

            ...orderDoc.data()

        };


        displayTracking(
            order
        );


    }
    catch(error){

        console.error(
            "TRACKING ERROR:",
            error
        );


        showMessage(
            "Unable to check this delivery right now."
        );

    }
    finally{

        trackButton.disabled =
            false;


        trackButton.textContent =
            "Track Order";

    }

}



/* ==========================================================
   DISPLAY TRACKING
========================================================== */

function displayTracking(
    order
){

    result.style.display =
        "block";


    searchMessage.textContent =
        "";


    orderIdElement.textContent =
        order.id;


    statusElement.textContent =
        formatStatus(
            order.status
        );


    courierElement.textContent =
        order.courierName ||
        "Not assigned";


    trackingElement.textContent =
        order.trackingNumber ||
        "Not assigned";


    paymentElement.textContent =
        order.paymentId ||
        "Not confirmed";


    updateProgress(
        order.status
    );

}



/* ==========================================================
   UPDATE PROGRESS
========================================================== */

function updateProgress(
    status
){

    const steps =
        document.querySelectorAll(
            ".tracking-step"
        );


    const order = [

        "pending",

        "paid",

        "awaiting_pickup",

        "picked_up",

        "in_transit",

        "out_for_delivery",

        "delivered",

        "completed"

    ];


    const currentIndex =
        order.indexOf(
            status
        );


    steps.forEach(
        function(step){

            const stepStatus =
                step.dataset.status;


            const stepIndex =
                order.indexOf(
                    stepStatus
                );


            step.classList.remove(
                "completed"
            );


            step.classList.remove(
                "current"
            );


            if(
                stepIndex <
                currentIndex
            ){

                step.classList.add(
                    "completed"
                );

            }


            if(
                stepStatus ===
                status
            ){

                step.classList.add(
                    "current"
                );

            }

        }
    );

}



/* ==========================================================
   FORMAT STATUS
========================================================== */

function formatStatus(
    status
){

    if(!status){

        return "Pending";

    }


    return status
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}



/* ==========================================================
   MESSAGE
========================================================== */

function showMessage(
    message
){

    searchMessage.textContent =
        message;

}



/* ==========================================================
   URL DELIVERY CODE
========================================================== */

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const urlCode =
    urlParams.get(
        "code"
    );


if(urlCode){

    codeInput.value =
        urlCode;

    trackOrder();

}

