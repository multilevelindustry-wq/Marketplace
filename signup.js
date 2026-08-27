/* ==========================================================
   SIGNUP ACCOUNT SELECTION
========================================================== */

const accountChoices =
    document.querySelectorAll(
        "[data-account-type]"
    );


/* ==========================================================
   ACCOUNT SELECTION
========================================================== */

accountChoices.forEach(
    (choice) => {

        choice.addEventListener(
            "click",
            () => {

                const accountType =
                    choice.dataset.accountType;


                accountChoices.forEach(
                    (item) => {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                choice.classList.add(
                    "selected"
                );


                sessionStorage.setItem(
                    "signupAccountType",
                    accountType
                );


                /*
                   Give the selected card
                   a short visual confirmation.
                */

                setTimeout(
                    () => {

                        if (
                            accountType ===
                            "seller"
                        ) {

                            window.location.href =
                                "seller-register.html";

                            return;

                        }


                        window.location.href =
                            "buyer-register.html";

                    },
                    180
                );

            }
        );

    }
);


/* ==========================================================
   PAGE LOADER
========================================================== */

window.addEventListener(
    "load",
    () => {

        const loader =
            document.getElementById(
                "signupLoader"
            );


        if (!loader) {

            return;

        }


        loader.classList.add(
            "hidden"
        );

    }
);