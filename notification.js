/* ==========================================================
   SELLER NOTIFICATION SYSTEM
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
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

/* ==========================================================
   STATE
========================================================== */

let currentSeller = null;

let sellerNotifications = [];

let activeNotificationFilter =
    "all";



/* ==========================================================
   DOM
========================================================== */

const notificationsList =
    document.getElementById(
        "notificationsList"
    );


const notificationsEmpty =
    document.getElementById(
        "notificationsEmpty"
    );


const allNotificationsCount =
    document.getElementById(
        "allNotificationsCount"
    );


const unreadNotificationsCount =
    document.getElementById(
        "unreadNotificationsCount"
    );


const markAllButton =
    document.getElementById(
        "markAllNotificationsRead"
    );



/* ==========================================================
   AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    function(user){

        if(!user){

            window.location.href =
                "login.html";

            return;

        }


        currentSeller =
            user;


        startNotificationListener();

    }
);


/* ==========================================================
   HIDE NOTIFICATION PAGE LOADER
========================================================== */

function hideNotificationPageLoader(){

    const loader =
        document.getElementById(
            "notificationPageLoader"
        );


    if(!loader){

        return;

    }


    loader.style.display =
        "none";

}

/* ==========================================================
   START NOTIFICATION LISTENER
========================================================== */

function startNotificationListener(){

    if(!currentSeller){

        return;

    }


    const notificationsReference =
        collection(
            db,
            "notifications"
        );


    const notificationsQuery =
        query(
            notificationsReference,

            where(
                "sellerId",
                "==",
                currentSeller.uid
            ),

            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(
        notificationsQuery,
        function(snapshot){

            sellerNotifications = [];


            snapshot.forEach(
                function(notificationSnapshot){

                    sellerNotifications.push({

                        id:
                            notificationSnapshot.id,

                        ...notificationSnapshot.data()

                    });

                }
            );


            updateNotificationSummary();


            renderNotifications();
            
            hideNotificationPageLoader();

        },

        function(error){

            console.error(
                "Notification listener error:",
                error
            );

        }
    );

}



/* ==========================================================
   RENDER NOTIFICATIONS
========================================================== */

function renderNotifications(){

    if(!notificationsList){

        return;

    }


    let notifications =
        [...sellerNotifications];


    /*
     * Apply filter.
     */

    if(
        activeNotificationFilter ===
        "unread"
    ){

        notifications =
            notifications.filter(
                notification =>
                    notification.read !== true
            );

    }


    else if(
        activeNotificationFilter !==
        "all"
    ){

        notifications =
            notifications.filter(
                notification =>
                    notification.type ===
                    activeNotificationFilter
            );

    }


    notificationsList.innerHTML =
        "";


    if(
        notifications.length ===
        0
    ){

        if(notificationsEmpty){

            notificationsEmpty.style.display =
                "block";

        }

        return;

    }


    if(notificationsEmpty){

        notificationsEmpty.style.display =
            "none";

    }


    notifications.forEach(
        function(notification){

            const card =
                createNotificationCard(
                    notification
                );


            notificationsList.appendChild(
                card
            );

        }
    );

}

/* ==========================================================
   CREATE NOTIFICATION CARD
========================================================== */

function createNotificationCard(
    notification
){

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "seller-notification-card";


    if(
        notification.read !== true
    ){

        article.classList.add(
            "unread"
        );

    }


    const icon =
        notification.icon ||
        getNotificationIcon(
            notification.type
        );


    const title =
        notification.title ||
        "Store notification";


    const message =
        notification.message ||
        "";


    const date =
        formatNotificationDate(
            notification.createdAt
        );


    article.innerHTML = `

        <div class="seller-notification-icon">

            ${escapeNotificationHTML(icon)}

        </div>


        <div class="seller-notification-content">

            <div class="seller-notification-top">

                <h3>

                    ${escapeNotificationHTML(
                        title
                    )}

                </h3>

                ${
                    notification.read !== true
                        ? `
                            <span
                                class="notification-unread-dot"
                            ></span>
                          `
                        : ""
                }

            </div>


            <p>

                ${escapeNotificationHTML(
                    message
                )}

            </p>


            <time>

                ${escapeNotificationHTML(
                    date
                )}

            </time>

        </div>

    `;


    article.addEventListener(
        "click",
        function(){

            markNotificationAsRead(
                notification.id
            );


            if(
                notification.link
            ){

                window.location.href =
                    notification.link;

            }

        }
    );


    return article;

}

/* ==========================================================
   UPDATE NOTIFICATION SUMMARY
========================================================== */

function updateNotificationSummary(){

    const total =
        sellerNotifications.length;


    const unread =
        sellerNotifications.filter(
            notification =>
                notification.read !== true
        ).length;


    if(allNotificationsCount){

        allNotificationsCount.textContent =
            total;

    }


    if(unreadNotificationsCount){

        unreadNotificationsCount.textContent =
            unread;

    }

}

/* ==========================================================
   MARK NOTIFICATION AS READ
========================================================== */

async function markNotificationAsRead(
    notificationId
){

    try{

        const notificationReference =
            doc(
                db,
                "notifications",
                notificationId
            );


        await updateDoc(
            notificationReference,
            {
                read: true
            }
        );

    }
    catch(error){

        console.error(
            "Unable to mark notification as read:",
            error
        );

    }

}

/* ==========================================================
   MARK ALL NOTIFICATIONS AS READ
========================================================== */

if(markAllButton){

    markAllButton.addEventListener(
        "click",
        async function(){

            if(!currentSeller){

                return;

            }


            const unread =
                sellerNotifications.filter(
                    notification =>
                        notification.read !== true
                );


            if(unread.length === 0){

                return;

            }


            try{

                markAllButton.disabled =
                    true;


                const batch =
                    writeBatch(db);


                unread.forEach(
                    function(notification){

                        const reference =
                            doc(
                                db,
                                "notifications",
                                notification.id
                            );


                        batch.update(
                            reference,
                            {
                                read: true
                            }
                        );

                    }
                );


                await batch.commit();

            }
            catch(error){

                console.error(
                    "Unable to mark all notifications as read:",
                    error
                );

            }
            finally{

                markAllButton.disabled =
                    false;

            }

        }
    );

}

/* ==========================================================
   NOTIFICATION FILTERS
========================================================== */

document
    .querySelectorAll(
        ".notification-filter"
    )
    .forEach(
        function(button){

            button.addEventListener(
                "click",
                function(){

                    document
                        .querySelectorAll(
                            ".notification-filter"
                        )
                        .forEach(
                            function(item){

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    activeNotificationFilter =
                        button.dataset.filter ||
                        "all";


                    renderNotifications();

                }
            );

        }
    );
    
    
    /* ==========================================================
   NOTIFICATION ICON
========================================================== */

function getNotificationIcon(
    type
){

    switch(type){

        case "orders":
            return "📦";

        case "store":
            return "🏪";

        case "account":
            return "👤";

        default:
            return "🔔";

    }

}



/* ==========================================================
   FORMAT NOTIFICATION DATE
========================================================== */

function formatNotificationDate(
    value
){

    if(!value){

        return "Date unavailable";

    }


    let date;


    if(
        value &&
        typeof value.toDate ===
        "function"
    ){

        date =
            value.toDate();

    }
    else{

        date =
            new Date(value);

    }


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return "Date unavailable";

    }


    return date.toLocaleString(
        "en-NG",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}



/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeNotificationHTML(
    value
){

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
   CREATE SELLER NOTIFICATION
========================================================== */

async function createSellerNotification({

    sellerId,

    type = "account",

    title = "Seller notification",

    message = "",

    link = "seller.html",

    icon = "🔔"

}){

    if(!sellerId){

        console.error(
            "Cannot create notification: sellerId missing"
        );

        return;

    }


    try{

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {

                sellerId: sellerId,

                type: type,

                title: title,

                message: message,

                link: link,

                icon: icon,

                read: false,

                createdAt:
                    serverTimestamp()

            }
        );


        console.log(
            "Seller notification created."
        );


    }
    catch(error){

        console.error(
            "Seller notification error:",
            error
        );

    }

}