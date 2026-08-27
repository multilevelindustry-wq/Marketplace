/* ==========================================================
   BUYER REGISTER
   FIREBASE AUTHENTICATION + FIRESTORE
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
   ELEMENTS
========================================================== */

const form =
    document.getElementById(
        "buyerRegisterForm"
    );


const firstNameInput =
    document.getElementById(
        "buyerFirstName"
    );


const lastNameInput =
    document.getElementById(
        "buyerLastName"
    );


const emailInput =
    document.getElementById(
        "buyerEmail"
    );


const phoneInput =
    document.getElementById(
        "buyerPhone"
    );


const passwordInput =
    document.getElementById(
        "buyerPassword"
    );


const confirmPasswordInput =
    document.getElementById(
        "buyerConfirmPassword"
    );


const termsInput =
    document.getElementById(
        "buyerTerms"
    );


const registerButton =
    document.getElementById(
        "buyerRegisterButton"
    );


const registerButtonText =
    document.getElementById(
        "buyerRegisterButtonText"
    );


const registerLoader =
    document.getElementById(
        "buyerRegisterLoader"
    );


const errorMessage =
    document.getElementById(
        "buyerRegisterError"
    );


const successMessage =
    document.getElementById(
        "buyerRegisterSuccess"
    );



/* ==========================================================
   YEAR
========================================================== */

const yearElement =
    document.getElementById(
        "buyerRegisterYear"
    );


if(yearElement){

    yearElement.textContent =
        new Date().getFullYear();

}



/* ==========================================================
   SHOW / HIDE PASSWORD
========================================================== */

const togglePassword =
    document.getElementById(
        "toggleBuyerPassword"
    );


if(togglePassword){

    togglePassword.addEventListener(
        "click",
        function(){

            const isPassword =
                passwordInput.type ===
                "password";


            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            this.textContent =
                isPassword
                    ? "🙈"
                    : "👁️";


            this.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        }
    );

}



/* ==========================================================
   SHOW / HIDE CONFIRM PASSWORD
========================================================== */

const toggleConfirmPassword =
    document.getElementById(
        "toggleBuyerConfirmPassword"
    );


if(toggleConfirmPassword){

    toggleConfirmPassword.addEventListener(
        "click",
        function(){

            const isPassword =
                confirmPasswordInput.type ===
                "password";


            confirmPasswordInput.type =
                isPassword
                    ? "text"
                    : "password";


            this.textContent =
                isPassword
                    ? "🙈"
                    : "👁️";


            this.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        }
    );

}



/* ==========================================================
   MESSAGE HELPERS
========================================================== */

function showError(message){

    if(!errorMessage){

        return;

    }


    errorMessage.textContent =
        message;


    errorMessage.classList.add(
        "show"
    );


    if(successMessage){

        successMessage.classList.remove(
            "show"
        );

        successMessage.textContent =
            "";

    }

}


function showSuccess(message){

    if(!successMessage){

        return;

    }


    successMessage.textContent =
        message;


    successMessage.classList.add(
        "show"
    );


    if(errorMessage){

        errorMessage.classList.remove(
            "show"
        );

        errorMessage.textContent =
            "";

    }

}


function clearMessages(){

    if(errorMessage){

        errorMessage.textContent =
            "";

        errorMessage.classList.remove(
            "show"
        );

    }


    if(successMessage){

        successMessage.textContent =
            "";

        successMessage.classList.remove(
            "show"
        );

    }

}



/* ==========================================================
   FIELD ERROR
========================================================== */

function setFieldError(
    input,
    errorId,
    message
){

    if(input){

        input.classList.add(
            "invalid"
        );

        input.classList.remove(
            "valid"
        );

    }


    const error =
        document.getElementById(
            errorId
        );


    if(error){

        error.textContent =
            message;

    }

}


function clearFieldError(
    input,
    errorId
){

    if(input){

        input.classList.remove(
            "invalid"
        );

    }


    const error =
        document.getElementById(
            errorId
        );


    if(error){

        error.textContent =
            "";

    }

}



/* ==========================================================
   CLEAR ALL FIELD ERRORS
========================================================== */

function clearAllFieldErrors(){

    clearFieldError(
        firstNameInput,
        "buyerFirstNameError"
    );


    clearFieldError(
        lastNameInput,
        "buyerLastNameError"
    );


    clearFieldError(
        emailInput,
        "buyerEmailError"
    );


    clearFieldError(
        phoneInput,
        "buyerPhoneError"
    );


    clearFieldError(
        passwordInput,
        "buyerPasswordError"
    );


    clearFieldError(
        confirmPasswordInput,
        "buyerConfirmPasswordError"
    );


    clearFieldError(
        termsInput,
        "buyerTermsError"
    );

}



/* ==========================================================
   VALIDATE FORM
========================================================== */

function validateForm(){

    let valid =
        true;


    clearAllFieldErrors();


    const firstName =
        firstNameInput.value.trim();


    const lastName =
        lastNameInput.value.trim();


    const email =
        emailInput.value.trim();


    const phone =
        phoneInput.value.trim();


    const password =
        passwordInput.value;


    const confirmPassword =
        confirmPasswordInput.value;



    /* ------------------------------------------------------
       FIRST NAME
    ------------------------------------------------------ */

    if(firstName.length < 2){

        setFieldError(
            firstNameInput,
            "buyerFirstNameError",
            "Enter your first name."
        );

        valid =
            false;

    }



    /* ------------------------------------------------------
       LAST NAME
    ------------------------------------------------------ */

    if(lastName.length < 2){

        setFieldError(
            lastNameInput,
            "buyerLastNameError",
            "Enter your last name."
        );

        valid =
            false;

    }



    /* ------------------------------------------------------
       EMAIL
    ------------------------------------------------------ */

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if(
        !emailPattern.test(
            email
        )
    ){

        setFieldError(
            emailInput,
            "buyerEmailError",
            "Enter a valid email address."
        );

        valid =
            false;

    }



    /* ------------------------------------------------------
       PHONE
    ------------------------------------------------------ */

    const phoneDigits =
        phone.replace(
            /\D/g,
            ""
        );


    if(phoneDigits.length < 10){

        setFieldError(
            phoneInput,
            "buyerPhoneError",
            "Enter a valid phone number."
        );

        valid =
            false;

    }



    /* ------------------------------------------------------
       PASSWORD
    ------------------------------------------------------ */

    if(password.length < 6){

        setFieldError(
            passwordInput,
            "buyerPasswordError",
            "Password must contain at least 6 characters."
        );

        valid =
            false;

    }



    /* ------------------------------------------------------
       CONFIRM PASSWORD
    ------------------------------------------------------ */

    if(
        confirmPassword !==
        password
    ){

        setFieldError(
            confirmPasswordInput,
            "buyerConfirmPasswordError",
            "Passwords do not match."
        );

        valid =
            false;

    }



    /* ------------------------------------------------------
       TERMS
    ------------------------------------------------------ */

    if(
        !termsInput.checked
    ){

        setFieldError(
            termsInput,
            "buyerTermsError",
            "Please accept the Terms & Conditions."
        );

        valid =
            false;

    }


    return valid;

}



/* ==========================================================
   LOADING STATE
========================================================== */

function setLoading(
    loading
){

    if(!registerButton){

        return;

    }


    registerButton.disabled =
        loading;


    if(loading){

        registerButton.classList.add(
            "loading"
        );


        if(registerButtonText){

            registerButtonText.textContent =
                "Creating account...";
        }


        if(registerLoader){

            registerLoader.classList.add(
                "show"
            );

        }

    }else{

        registerButton.classList.remove(
            "loading"
        );


        if(registerButtonText){

            registerButtonText.textContent =
                "Create Buyer Account";

        }


        if(registerLoader){

            registerLoader.classList.remove(
                "show"
            );

        }

    }

}



/* ==========================================================
   FIREBASE ERROR MESSAGE
========================================================== */

function getFirebaseErrorMessage(
    error
){

    if(!error){

        return "Unable to create your account.";

    }


    switch(error.code){

        case "auth/email-already-in-use":

            return "An account already exists with this email address.";

        case "auth/invalid-email":

            return "Please enter a valid email address.";

        case "auth/weak-password":

            return "Your password is too weak. Please use at least 6 characters.";

        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";

        case "auth/too-many-requests":

            return "Too many attempts. Please wait a moment and try again.";

        case "auth/operation-not-allowed":

            return "Email and password registration is currently disabled.";

        default:

            console.error(
                "Firebase registration error:",
                error
            );

            return (
                error.message ||
                "Unable to create your account. Please try again."
            );

    }

}



/* ==========================================================
   SAVE BUYER TO FIRESTORE
========================================================== */

async function saveBuyerProfile(
    user,
    buyerData
){

    const buyerReference =
        doc(
            db,
            "users",
            user.uid
        );


    await setDoc(
        buyerReference,
        {

            uid:
                user.uid,

            firstName:
                buyerData.firstName,

            lastName:
                buyerData.lastName,

            fullName:
                buyerData.firstName +
                " " +
                buyerData.lastName,

            email:
                buyerData.email,

            phone:
                buyerData.phone,

            role:
                "buyer",

            accountType:
                "buyer",

            photoURL:
                user.photoURL ||
                "",

            balance:
                0,

            cartCount:
                0,

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp(),

            status:
                "active"

        },
        {
            merge: true
        }
    );

}



/* ==========================================================
   CREATE BUYER ACCOUNT
========================================================== */

async function registerBuyer(){

    if(!validateForm()){

        showError(
            "Please correct the highlighted fields."
        );

        return;

    }


    clearMessages();


    const firstName =
        firstNameInput.value.trim();


    const lastName =
        lastNameInput.value.trim();


    const email =
        emailInput.value
            .trim()
            .toLowerCase();


    const phone =
        phoneInput.value.trim();


    const password =
        passwordInput.value;


    try {

        setLoading(
            true
        );


        /*
         * Create Firebase Authentication account.
         */

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            credential.user;


        /*
         * Set Firebase display name.
         */

        await updateProfile(
            user,
            {
                displayName:
                    firstName +
                    " " +
                    lastName
            }
        );


        /*
         * Save buyer profile in Firestore.
         */

        await saveBuyerProfile(
            user,
            {
                firstName,
                lastName,
                email,
                phone
            }
        );


        /*
         * Save buyer name locally
         * for the homepage.
         */

        localStorage.setItem(
            "buyerFirstName",
            firstName
        );


        localStorage.setItem(
            "buyerFirstNameTime",
            Date.now().toString()
        );


        localStorage.setItem(
            "buyerAccountType",
            "buyer"
        );


        localStorage.setItem(
            "buyerUid",
            user.uid
        );


        showSuccess(
            "Your buyer account has been created successfully."
        );


        /*
         * Redirect to buyer dashboard.
         */

        setTimeout(
            function(){

                window.location.href =
                    "buyer.html";

            },
            1200
        );


    } catch(error){

        console.error(
            "Buyer registration error:",
            error
        );


        showError(
            getFirebaseErrorMessage(
                error
            )
        );


        setLoading(
            false
        );

    }

}



/* ==========================================================
   FORM SUBMISSION
========================================================== */

if(form){

    form.addEventListener(
        "submit",
        function(event){

            event.preventDefault();

            registerBuyer();

        }
    );

}



/* ==========================================================
   LIVE VALIDATION
========================================================== */

if(firstNameInput){

    firstNameInput.addEventListener(
        "input",
        function(){

            if(
                this.value.trim().length >= 2
            ){

                clearFieldError(
                    this,
                    "buyerFirstNameError"
                );

            }

        }
    );

}


if(lastNameInput){

    lastNameInput.addEventListener(
        "input",
        function(){

            if(
                this.value.trim().length >= 2
            ){

                clearFieldError(
                    this,
                    "buyerLastNameError"
                );

            }

        }
    );

}


if(emailInput){

    emailInput.addEventListener(
        "input",
        function(){

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if(
                emailPattern.test(
                    this.value.trim()
                )
            ){

                clearFieldError(
                    this,
                    "buyerEmailError"
                );

            }

        }
    );

}


if(phoneInput){

    phoneInput.addEventListener(
        "input",
        function(){

            const digits =
                this.value.replace(
                    /\D/g,
                    ""
                );


            if(digits.length >= 10){

                clearFieldError(
                    this,
                    "buyerPhoneError"
                );

            }

        }
    );

}


if(passwordInput){

    passwordInput.addEventListener(
        "input",
        function(){

            if(
                this.value.length >= 6
            ){

                clearFieldError(
                    this,
                    "buyerPasswordError"
                );

            }


            if(
                confirmPasswordInput.value &&
                confirmPasswordInput.value ===
                this.value
            ){

                clearFieldError(
                    confirmPasswordInput,
                    "buyerConfirmPasswordError"
                );

            }

        }
    );

}


if(confirmPasswordInput){

    confirmPasswordInput.addEventListener(
        "input",
        function(){

            if(
                this.value ===
                passwordInput.value
            ){

                clearFieldError(
                    this,
                    "buyerConfirmPasswordError"
                );

            }

        }
    );

}


if(termsInput){

    termsInput.addEventListener(
        "change",
        function(){

            if(this.checked){

                clearFieldError(
                    this,
                    "buyerTermsError"
                );

            }

        }
    );

}



/* ==========================================================
   PREVENT ACCIDENTAL DOUBLE SUBMISSION
========================================================== */

let registrationStarted =
    false;


if(form){

    form.addEventListener(
        "submit",
        function(){

            if(registrationStarted){

                return;

            }

            registrationStarted =
                true;

        }
    );

}


