import {
    auth,
    db,
    CLOUDINARY_UPLOAD_PRESET,
    CLOUDINARY_UPLOAD_URL
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    nigeriaLocations
} from "./nigeria-locations.js";


/* ==========================================================
   PRODUCT ELEMENTS
========================================================== */

const imageInput =
    document.getElementById("productImage");

const imagePreview =
    document.getElementById("imagePreview");

const productNameInput =
    document.getElementById("productName");

const categoryInput =
    document.getElementById("productCategory");

const priceInput =
    document.getElementById("productPrice");

const descriptionInput =
    document.getElementById("productDescription");

const variation1NameInput =
    document.getElementById("variation1Name");

const variation1OptionsInput =
    document.getElementById("variation1Options");

const variation2NameInput =
    document.getElementById("variation2Name");

const variation2OptionsInput =
    document.getElementById("variation2Options");


/* ==========================================================
   PRICE DISPLAY
========================================================== */

const sellerPriceDisplay =
    document.getElementById("sellerPriceDisplay");

const platformFeeDisplay =
    document.getElementById("platformFeeDisplay");

const buyerPriceDisplay =
    document.getElementById("buyerPriceDisplay");


/* ==========================================================
   UPLOAD ELEMENTS
========================================================== */

const uploadButton =
    document.getElementById("uploadProductButton");

const uploadStatus =
    document.getElementById("uploadStatus");


/* ==========================================================
   SHIPPING ELEMENTS
   THESE MATCH THE HTML EXACTLY
========================================================== */

const productWeightInput =
    document.getElementById("productWeight");

const productPackageSizeInput =
    document.getElementById("productPackageSize");

const packageLengthInput =
    document.getElementById("packageLength");

const packageWidthInput =
    document.getElementById("packageWidth");

const packageHeightInput =
    document.getElementById("packageHeight");

const freeShippingInput =
    document.getElementById("freeShipping");


/* ==========================================================
   PICKUP LOCATION ELEMENTS
   THESE MATCH THE HTML EXACTLY
========================================================== */

const sellerCountryInput =
    document.getElementById("sellerCountry");

const sellerStateInput =
    document.getElementById("sellerState");

const sellerLgaInput =
    document.getElementById("sellerLga");

const sellerCityInput =
    document.getElementById("sellerCity");

const sellerAreaInput =
    document.getElementById("sellerArea");

const sellerStreetInput =
    document.getElementById("sellerStreet");

const sellerHouseNumberInput =
    document.getElementById("sellerHouseNumber");

const sellerLandmarkInput =
    document.getElementById("sellerLandmark");

const sellerPickupInstructionsInput =
    document.getElementById("sellerPickupInstructions");

const sellerLocationTypeInput =
    document.getElementById("sellerLocationType");


/* ==========================================================
   GPS ELEMENTS
========================================================== */

const getSellerLocationButton =
    document.getElementById(
        "getSellerLocationButton"
    );

const sellerLocationStatus =
    document.getElementById(
        "sellerLocationStatus"
    );

const sellerLatitudeInput =
    document.getElementById(
        "sellerLatitude"
    );

const sellerLongitudeInput =
    document.getElementById(
        "sellerLongitude"
    );

const sellerLatitudeDisplay =
    document.getElementById(
        "sellerLatitudeDisplay"
    );

const sellerLongitudeDisplay =
    document.getElementById(
        "sellerLongitudeDisplay"
    );


/* ==========================================================
   APPLICATION STATE
========================================================== */

let currentSeller = null;

let selectedImage = null;

let sellerPickupLocation = {
    latitude: null,
    longitude: null,
    accuracy: null
};


/* ==========================================================
   AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    function(user) {

        if (!user) {

            currentSeller = null;

            window.location.href =
                "login.html";

            return;
        }

        currentSeller = user;

        console.log(
            "Seller authenticated:",
            user.uid
        );

    }
);


/* ==========================================================
   IMAGE SELECTION
========================================================== */

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function() {

            const file =
                this.files &&
                this.files[0];

            if (!file) {

                selectedImage = null;

                if (imagePreview) {
                    imagePreview.innerHTML = "";
                }

                return;
            }


            /* ------------------------------------------
               IMAGE TYPE
            ------------------------------------------ */

            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image file."
                );

                this.value = "";

                selectedImage = null;

                return;
            }


            /* ------------------------------------------
               IMAGE SIZE
            ------------------------------------------ */

            const maxSize =
                10 * 1024 * 1024;

            if (file.size > maxSize) {

                alert(
                    "Image must be smaller than 10MB."
                );

                this.value = "";

                selectedImage = null;

                return;
            }


            selectedImage = file;


            /* ------------------------------------------
               PREVIEW
            ------------------------------------------ */

            if (imagePreview) {

                imagePreview.innerHTML = "";

                const image =
                    document.createElement("img");

                image.src =
                    URL.createObjectURL(file);

                image.alt =
                    "Product preview";

                image.className =
                    "product-preview-image";

                imagePreview.appendChild(image);
            }

        }
    );

}


/* ==========================================================
   MONEY FORMAT
========================================================== */

function formatMoney(value) {

    const amount =
        Number(value) || 0;

    return "₦" +
        amount.toLocaleString(
            "en-NG",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );
}


/* ==========================================================
   PRICE CALCULATION
========================================================== */

function updatePrice() {

    const sellerPrice =
        Number(
            priceInput?.value
        ) || 0;

    const platformFee =
        Math.round(
            sellerPrice * 0.15
        );

    const buyerPrice =
        sellerPrice +
        platformFee;


    if (sellerPriceDisplay) {

        sellerPriceDisplay.textContent =
            formatMoney(
                sellerPrice
            );
    }


    if (platformFeeDisplay) {

        platformFeeDisplay.textContent =
            formatMoney(
                platformFee
            );
    }


    if (buyerPriceDisplay) {

        buyerPriceDisplay.textContent =
            formatMoney(
                buyerPrice
            );
    }

}


if (priceInput) {

    priceInput.addEventListener(
        "input",
        updatePrice
    );

}


updatePrice();


/* ==========================================================
   SELLER UPLOAD PRODUCT
   PART 2 / 5
   ----------------------------------------------------------
   - Countries
   - Nigeria states
   - State → LGA
   - Location database
   - Country change
========================================================== */


/* ==========================================================
   COUNTRY DATABASE
========================================================== */

const deliveryCountries = [

    {
        code: "NG",
        name: "Nigeria"
    },

    {
        code: "GH",
        name: "Ghana"
    },

    {
        code: "KE",
        name: "Kenya"
    },

    {
        code: "ZA",
        name: "South Africa"
    },

    {
        code: "UG",
        name: "Uganda"
    },

    {
        code: "TZ",
        name: "Tanzania"
    },

    {
        code: "RW",
        name: "Rwanda"
    },

    {
        code: "ZM",
        name: "Zambia"
    },

    {
        code: "ZW",
        name: "Zimbabwe"
    },

    {
        code: "ET",
        name: "Ethiopia"
    }

];


/* ==========================================================
   NIGERIA STATE NAMES
========================================================== */

const nigeriaStateNames = [

    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara"

];


/* ==========================================================
   NORMALIZE TEXT
========================================================== */

function normalizeLocationText(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        )
        .replace(
            /state$/i,
            ""
        )
        .trim();

}


/* ==========================================================
   FIND NIGERIA STATE
========================================================== */

function findNigeriaState(value) {

    const wanted =
        normalizeLocationText(
            value
        );

    if (!wanted) {
        return "";
    }


    /* ------------------------------------------
       EXACT STATE MATCH
    ------------------------------------------ */

    for (
        const state
        of nigeriaStateNames
    ) {

        if (
            normalizeLocationText(state) ===
            wanted
        ) {

            return state;
        }

    }


    /* ------------------------------------------
       DATABASE KEY MATCH
    ------------------------------------------ */

    const database =
        nigeriaLocations || {};

    for (
        const key
        of Object.keys(database)
    ) {

        if (
            normalizeLocationText(key) ===
            wanted
        ) {

            return key;
        }

    }


    /* ------------------------------------------
       COMMON FCT VARIATIONS
    ------------------------------------------ */

    if (
        wanted === "abuja" ||
        wanted === "federal capital territory" ||
        wanted === "fct"
    ) {

        return "FCT";
    }


    return "";
}


/* ==========================================================
   GET STATE DATABASE ENTRY
========================================================== */

function getStateLgas(stateName) {

    if (!stateName) {
        return [];
    }

    const database =
        nigeriaLocations || {};

    const exact =
        database[stateName];

    if (Array.isArray(exact)) {
        return exact;
    }


    const wanted =
        normalizeLocationText(
            stateName
        );


    for (
        const key
        of Object.keys(database)
    ) {

        if (
            normalizeLocationText(key) ===
            wanted
        ) {

            const value =
                database[key];

            if (Array.isArray(value)) {
                return value;
            }

        }

    }


    return [];
}


/* ==========================================================
   LOAD COUNTRIES
========================================================== */

function loadCountries() {

    if (!sellerCountryInput) {
        console.error(
            "sellerCountry element not found."
        );
        return;
    }


    sellerCountryInput.innerHTML =
        "";


    const defaultOption =
        document.createElement("option");

    defaultOption.value =
        "";

    defaultOption.textContent =
        "Select country";

    sellerCountryInput.appendChild(
        defaultOption
    );


    deliveryCountries.forEach(
        function(country) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                country.code;

            option.textContent =
                country.name;

            sellerCountryInput.appendChild(
                option
            );

        }
    );


    /*
       Nigeria is the default because
       the Nigerian state/LGA database
       is currently installed.
    */

    sellerCountryInput.value =
        "NG";


    loadNigeriaStates();

}


/* ==========================================================
   LOAD NIGERIA STATES
========================================================== */

function loadNigeriaStates(
    selectedState = ""
) {

    if (!sellerStateInput) {
        return;
    }


    sellerStateInput.innerHTML =
        "";


    const defaultOption =
        document.createElement("option");

    defaultOption.value =
        "";

    defaultOption.textContent =
        "Select state";

    sellerStateInput.appendChild(
        defaultOption
    );


    /*
       Use the database keys first.
       If the database is unavailable,
       fall back to the official state list.
    */

    let states =
        Object.keys(
            nigeriaLocations || {}
        );


    if (
        !states.length
    ) {

        states =
            [...nigeriaStateNames];

    }


    /*
       Make sure all normal Nigerian
       states are present.
    */

    nigeriaStateNames.forEach(
        function(state) {

            const exists =
                states.some(
                    function(existing) {

                        return (
                            normalizeLocationText(
                                existing
                            ) ===
                            normalizeLocationText(
                                state
                            )
                        );

                    }
                );


            if (!exists) {

                states.push(state);

            }

        }
    );


    /*
       Remove duplicates.
    */

    const uniqueStates =
        [];


    states.forEach(
        function(state) {

            const exists =
                uniqueStates.some(
                    function(existing) {

                        return (
                            normalizeLocationText(
                                existing
                            ) ===
                            normalizeLocationText(
                                state
                            )
                        );

                    }
                );


            if (!exists) {

                uniqueStates.push(
                    state
                );

            }

        }
    );


    uniqueStates.sort(
        function(a, b) {

            return String(a)
                .localeCompare(
                    String(b)
                );

        }
    );


    uniqueStates.forEach(
        function(state) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                state;

            option.textContent =
                state;

            sellerStateInput.appendChild(
                option
            );

        }
    );


    if (selectedState) {

        const realState =
            findNigeriaState(
                selectedState
            );

        if (realState) {

            sellerStateInput.value =
                realState;

        }

    }


    loadNigeriaLgas(
        sellerStateInput.value
    );

}


/* ==========================================================
   LOAD LGA
========================================================== */

function loadNigeriaLgas(
    stateName,
    selectedLga = ""
) {

    if (!sellerLgaInput) {
        return;
    }


    sellerLgaInput.innerHTML =
        "";


    const defaultOption =
        document.createElement(
            "option"
        );

    defaultOption.value =
        "";

    defaultOption.textContent =
        "Select LGA";

    sellerLgaInput.appendChild(
        defaultOption
    );


    if (!stateName) {
        return;
    }


    const lgas =
        getStateLgas(
            stateName
        );


    /*
       Remove duplicate LGA names.
    */

    const uniqueLgas =
        [];


    lgas.forEach(
        function(lga) {

            const name =
                String(lga || "")
                    .trim();

            if (!name) {
                return;
            }


            const exists =
                uniqueLgas.some(
                    function(existing) {

                        return (
                            normalizeLocationText(
                                existing
                            ) ===
                            normalizeLocationText(
                                name
                            )
                        );

                    }
                );


            if (!exists) {

                uniqueLgas.push(
                    name
                );

            }

        }
    );


    uniqueLgas.sort(
        function(a, b) {

            return a.localeCompare(b);

        }
    );


    uniqueLgas.forEach(
        function(lga) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                lga;

            option.textContent =
                lga;

            sellerLgaInput.appendChild(
                option
            );

        }
    );


    if (selectedLga) {

        const wanted =
            normalizeLocationText(
                selectedLga
            );


        const matchingLga =
            uniqueLgas.find(
                function(lga) {

                    return (
                        normalizeLocationText(
                            lga
                        ) ===
                        wanted
                    );

                }
            );


        if (matchingLga) {

            sellerLgaInput.value =
                matchingLga;

        }

    }

}


/* ==========================================================
   STATE CHANGE
========================================================== */

if (sellerStateInput) {

    sellerStateInput.addEventListener(
        "change",
        function() {

            loadNigeriaLgas(
                this.value
            );

        }
    );

}


/* ==========================================================
   COUNTRY CHANGE
========================================================== */

if (sellerCountryInput) {

    sellerCountryInput.addEventListener(
        "change",
        function() {

            const country =
                this.value;


            if (
                country === "NG"
            ) {

                loadNigeriaStates();

                return;
            }


            /*
               Other countries are available
               in the country selector.

               Their state/LGA databases can
               be added independently later.
            */

            if (sellerStateInput) {

                sellerStateInput.innerHTML =
                    `<option value="">
                        State / Province
                    </option>`;

            }


            if (sellerLgaInput) {

                sellerLgaInput.innerHTML =
                    `<option value="">
                        LGA / District
                    </option>`;

            }

        }
    );

}


/* ==========================================================
   INITIALIZE LOCATION SELECTS
========================================================== */

loadCountries();



/* ==========================================================
   SELLER UPLOAD PRODUCT
   PART 3 / 5
   ----------------------------------------------------------
   GPS + REVERSE GEOCODING
========================================================== */


/* ==========================================================
   LOCATION STATUS
========================================================== */

function showLocationStatus(
    message,
    type = ""
) {

    if (!sellerLocationStatus) {
        return;
    }


    sellerLocationStatus.textContent =
        message;


    sellerLocationStatus.className =
        "seller-location-status";


    if (type) {

        sellerLocationStatus.classList.add(
            type
        );

    }

}


/* ==========================================================
   SET GPS DISPLAY
========================================================== */

function setGpsCoordinates(
    latitude,
    longitude
) {

    if (sellerLatitudeInput) {

        sellerLatitudeInput.value =
            latitude;

    }


    if (sellerLongitudeInput) {

        sellerLongitudeInput.value =
            longitude;

    }


    if (sellerLatitudeDisplay) {

        sellerLatitudeDisplay.textContent =
            Number(latitude).toFixed(7);

    }


    if (sellerLongitudeDisplay) {

        sellerLongitudeDisplay.textContent =
            Number(longitude).toFixed(7);

    }

}


/* ==========================================================
   FIND BEST CITY
========================================================== */

function getBestCity(address) {

    return (
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.city_district ||
        address.suburb ||
        ""
    );

}


/* ==========================================================
   FIND BEST AREA
========================================================== */

function getBestArea(address) {

    return (
        address.suburb ||
        address.neighbourhood ||
        address.quarter ||
        address.residential ||
        address.city_district ||
        ""
    );

}


/* ==========================================================
   FIND BEST STREET
========================================================== */

function getBestStreet(address) {

    return (
        address.road ||
        address.pedestrian ||
        address.footway ||
        address.path ||
        ""
    );

}


/* ==========================================================
   FIND BEST LGA
========================================================== */

function getBestLga(address) {

    return (
        address.county ||
        address.municipality ||
        address.local_government ||
        address.city_district ||
        address.district ||
        ""
    );

}


/* ==========================================================
   REVERSE GEOCODE
========================================================== */

async function reverseGeocodeLocation(
    latitude,
    longitude
) {

    const url =
        "https://nominatim.openstreetmap.org/reverse" +
        "?format=json" +
        "&lat=" +
        encodeURIComponent(latitude) +
        "&lon=" +
        encodeURIComponent(longitude) +
        "&zoom=18" +
        "&addressdetails=1";


    const response =
        await fetch(
            url,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            "Address lookup failed."
        );

    }


    const data =
        await response.json();


    if (
        !data ||
        !data.address
    ) {

        throw new Error(
            "No address information was returned."
        );

    }


    const address =
        data.address;


    console.log(
        "GPS reverse-geocoded address:",
        address
    );


    /* ======================================================
       COUNTRY
    ====================================================== */

    const detectedCountry =
        String(
            address.country || ""
        ).trim();


    const detectedCountryCode =
        String(
            address.country_code || ""
        )
        .trim()
        .toUpperCase();


    if (
        detectedCountryCode === "NG" ||
        detectedCountry.toLowerCase() ===
            "nigeria"
    ) {

        if (sellerCountryInput) {

            sellerCountryInput.value =
                "NG";

        }

        /*
           Load states before trying
           to select the detected state.
        */

        loadNigeriaStates();

    }


    /* ======================================================
       STATE
    ====================================================== */

    const detectedState =
        address.state ||
        address.region ||
        address.province ||
        "";


    const matchedState =
        findNigeriaState(
            detectedState
        );


    if (matchedState) {

        if (sellerCountryInput) {

            sellerCountryInput.value =
                "NG";

        }


        loadNigeriaStates(
            matchedState
        );

    }


    /* ======================================================
       LGA
    ====================================================== */

    const detectedLga =
        getBestLga(
            address
        );


    if (
        matchedState
    ) {

        /*
           Populate LGA first.
        */

        loadNigeriaLgas(
            matchedState,
            detectedLga
        );

    }


    /* ======================================================
       CITY
    ====================================================== */

    const detectedCity =
        getBestCity(
            address
        );


    if (sellerCityInput) {

        sellerCityInput.value =
            detectedCity;

    }


    /* ======================================================
       AREA
    ====================================================== */

    const detectedArea =
        getBestArea(
            address
        );


    if (sellerAreaInput) {

        sellerAreaInput.value =
            detectedArea;

    }


    /* ======================================================
       STREET
    ====================================================== */

    const detectedStreet =
        getBestStreet(
            address
        );


    if (sellerStreetInput) {

        sellerStreetInput.value =
            detectedStreet;

    }


    /* ======================================================
       RETURN DATA
    ====================================================== */

    return {

        country:
            detectedCountry,

        countryCode:
            detectedCountryCode,

        state:
            matchedState ||
            detectedState,

        lga:
            detectedLga,

        city:
            detectedCity,

        area:
            detectedArea,

        street:
            detectedStreet,

        fullAddress:
            data.display_name || ""

    };

}


/* ==========================================================
   GPS DETECTION
========================================================== */

function getSellerPreciseLocation() {

    if (
        !navigator.geolocation
    ) {

        showLocationStatus(
            "GPS is not supported by this browser.",
            "error"
        );

        return;

    }


    if (getSellerLocationButton) {

        getSellerLocationButton.disabled =
            true;

        getSellerLocationButton.textContent =
            "📍 Detecting location...";

    }


    showLocationStatus(
        "Please allow location access...",
        "loading"
    );


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            try {

                const latitude =
                    Number(
                        position.coords.latitude
                    );

                const longitude =
                    Number(
                        position.coords.longitude
                    );

                const accuracy =
                    Number(
                        position.coords.accuracy
                    ) || null;


                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {

                    throw new Error(
                        "Invalid GPS coordinates."
                    );

                }


                /* --------------------------------------
                   SAVE LOCATION
                -------------------------------------- */

                sellerPickupLocation = {

                    latitude:
                        latitude,

                    longitude:
                        longitude,

                    accuracy:
                        accuracy

                };


                setGpsCoordinates(
                    latitude,
                    longitude
                );


                showLocationStatus(
                    "GPS detected. Finding your address...",
                    "loading"
                );


                /* --------------------------------------
                   REVERSE GEOCODING
                -------------------------------------- */

                const address =
                    await reverseGeocodeLocation(
                        latitude,
                        longitude
                    );


                console.log(
                    "Detected seller address:",
                    address
                );


                showLocationStatus(
                    "✓ Pickup location detected successfully.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "GPS address lookup error:",
                    error
                );


                /*
                   IMPORTANT:
                   GPS coordinates are still useful
                   even when address lookup fails.
                */

                if (
                    Number.isFinite(
                        position.coords.latitude
                    ) &&
                    Number.isFinite(
                        position.coords.longitude
                    )
                ) {

                    showLocationStatus(
                        "GPS captured, but automatic address lookup failed. Please select your State/LGA and enter the remaining address manually.",
                        "error"
                    );

                } else {

                    showLocationStatus(
                        "Location could not be determined.",
                        "error"
                    );

                }

            }


            if (getSellerLocationButton) {

                getSellerLocationButton.disabled =
                    false;

                getSellerLocationButton.textContent =
                    "📍 Update My Location";

            }

        },

        function(error) {

            console.error(
                "GPS error:",
                error
            );


            let message =
                "Unable to detect your location.";


            switch (error.code) {

                case error.PERMISSION_DENIED:

                    message =
                        "Location permission was denied. Please allow location access in your browser settings.";

                    break;


                case error.POSITION_UNAVAILABLE:

                    message =
                        "Your GPS location is unavailable. Turn on Location/GPS and try again.";

                    break;


                case error.TIMEOUT:

                    message =
                        "Location detection timed out. Please try again.";

                    break;

            }


            showLocationStatus(
                message,
                "error"
            );


            if (getSellerLocationButton) {

                getSellerLocationButton.disabled =
                    false;

                getSellerLocationButton.textContent =
                    "📍 Use My Current Location";

            }

        },

        {

            enableHighAccuracy:
                true,

            timeout:
                30000,

            maximumAge:
                0

        }

    );

}


/* ==========================================================
   GPS BUTTON
========================================================== */

if (
    getSellerLocationButton
) {

    getSellerLocationButton.addEventListener(
        "click",
        getSellerPreciseLocation
    );

}





/* ==========================================================
   GET VARIATIONS
========================================================== */

function getVariations() {

    const variations = [];


    /* ======================================================
       VARIATION 1
    ====================================================== */

    const name1 =
        variation1NameInput
            ?.value
            ?.trim() || "";


    const options1 =
        variation1OptionsInput
            ?.value
            ?.split(",")
            .map(
                function(value) {
                    return value.trim();
                }
            )
            .filter(Boolean) || [];


    if (
        name1 &&
        options1.length
    ) {

        variations.push({

            name:
                name1,

            options:
                options1

        });

    }


    /* ======================================================
       VARIATION 2
    ====================================================== */

    const name2 =
        variation2NameInput
            ?.value
            ?.trim() || "";


    const options2 =
        variation2OptionsInput
            ?.value
            ?.split(",")
            .map(
                function(value) {
                    return value.trim();
                }
            )
            .filter(Boolean) || [];


    if (
        name2 &&
        options2.length
    ) {

        variations.push({

            name:
                name2,

            options:
                options2

        });

    }


    return variations;

}


/* ==========================================================
   GET PACKAGE INFORMATION
========================================================== */

function getPackageInformation() {

    const weight =
        Number(
            productWeightInput?.value
        );


    const size =
        productPackageSizeInput
            ?.value
            ?.trim()
            .toLowerCase() || "";


    const length =
        Number(
            packageLengthInput?.value
        ) || 0;


    const width =
        Number(
            packageWidthInput?.value
        ) || 0;


    const height =
        Number(
            packageHeightInput?.value
        ) || 0;


    return {

        weight:
            weight,

        weightUnit:
            "kg",

        weightKg:
            weight,

        size:
            size,

        dimensions: {

            length:
                length,

            width:
                width,

            height:
                height,

            unit:
                "cm"

        }

    };

}


/* ==========================================================
   VALIDATE PACKAGE
========================================================== */

function validatePackageInformation(
    packageInformation
) {

    if (
        !packageInformation
    ) {

        throw new Error(
            "Package information is missing."
        );

    }


    if (
        !Number.isFinite(
            packageInformation.weight
        ) ||
        packageInformation.weight <= 0
    ) {

        throw new Error(
            "Please enter the product/package weight."
        );

    }


    const allowedSizes = [

        "small",
        "medium",
        "large"

    ];


    if (
        !allowedSizes.includes(
            packageInformation.size
        )
    ) {

        throw new Error(
            "Please select a package size."
        );

    }

}


/* ==========================================================
   PRODUCT SLUG
========================================================== */

function createSlug(name) {

    return String(name || "")

        .toLowerCase()

        .trim()

        .replace(
            /[^a-z0-9\s-]/g,
            ""
        )

        .replace(
            /\s+/g,
            "-"
        )

        .replace(
            /-+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );

}


/* ==========================================================
   UPLOAD STATUS
========================================================== */

function showStatus(
    message,
    type = ""
) {

    if (!uploadStatus) {
        return;
    }


    uploadStatus.textContent =
        message;


    uploadStatus.className =
        "upload-status";


    if (type) {

        uploadStatus.classList.add(
            type
        );

    }

}


/* ==========================================================
   CLOUDINARY UPLOAD
========================================================== */

async function uploadImageToCloudinary(
    file
) {

    if (!file) {

        throw new Error(
            "No product image selected."
        );

    }


    if (!CLOUDINARY_UPLOAD_URL) {

        throw new Error(
            "Cloudinary upload URL is missing."
        );

    }


    if (!CLOUDINARY_UPLOAD_PRESET) {

        throw new Error(
            "Cloudinary upload preset is missing."
        );

    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    showStatus(
        "Uploading product image...",
        "loading"
    );


    const response =
        await fetch(
            CLOUDINARY_UPLOAD_URL,
            {

                method:
                    "POST",

                body:
                    formData

            }
        );


    if (!response.ok) {

        let errorMessage =
            "Cloudinary upload failed.";


        try {

            const errorData =
                await response.json();

            console.error(
                "Cloudinary error:",
                errorData
            );

            if (
                errorData?.error?.message
            ) {

                errorMessage =
                    errorData.error.message;

            }

        } catch (_) {

            console.error(
                "Could not read Cloudinary error."
            );

        }


        throw new Error(
            errorMessage
        );

    }


    const data =
        await response.json();


    if (
        !data ||
        !data.secure_url
    ) {

        throw new Error(
            "Cloudinary did not return an image URL."
        );

    }


    return data.secure_url;

}


/* ==========================================================
   LOCAL STORAGE
========================================================== */

function saveProductLocally(
    productId,
    productData
) {

    try {

        const existing =
            JSON.parse(
                localStorage.getItem(
                    "sellerProducts"
                ) || "[]"
            );


        existing.push({

            id:
                productId,

            ...productData,

            createdAt:
                Date.now()

        });


        localStorage.setItem(
            "sellerProducts",
            JSON.stringify(
                existing
            )
        );


    } catch (error) {

        console.error(
            "Local product storage error:",
            error
        );

    }

}


/* ==========================================================
   COLLECT PICKUP LOCATION
========================================================== */

function getPickupLocationData() {

    return {

        country:
            sellerCountryInput
                ?.value
                ?.trim() || "",

        state:
            sellerStateInput
                ?.value
                ?.trim() || "",

        lga:
            sellerLgaInput
                ?.value
                ?.trim() || "",

        city:
            sellerCityInput
                ?.value
                ?.trim() || "",

        area:
            sellerAreaInput
                ?.value
                ?.trim() || "",

        street:
            sellerStreetInput
                ?.value
                ?.trim() || "",

        houseNumber:
            sellerHouseNumberInput
                ?.value
                ?.trim() || "",

        landmark:
            sellerLandmarkInput
                ?.value
                ?.trim() || "",

        pickupInstructions:
            sellerPickupInstructionsInput
                ?.value
                ?.trim() || "",

        areaType:
            sellerLocationTypeInput
                ?.value
                ?.trim() || "",

        latitude:
            Number(
                sellerPickupLocation?.latitude
            ),

        longitude:
            Number(
                sellerPickupLocation?.longitude
            ),

        accuracy:
            Number(
                sellerPickupLocation?.accuracy
            ) || null

    };

}


/* ==========================================================
   VALIDATE PICKUP LOCATION
========================================================== */

function validatePickupLocation(
    location
) {

    if (!location.country) {

        throw new Error(
            "Please select the pickup country."
        );

    }


    if (!location.state) {

        throw new Error(
            "Please select the pickup state."
        );

    }


    if (!location.lga) {

        throw new Error(
            "Please select the pickup LGA."
        );

    }


    if (!location.city) {

        throw new Error(
            "Please enter the pickup city or town."
        );

    }


    if (!location.street) {

        throw new Error(
            "Please enter the pickup street address."
        );

    }


    if (!location.houseNumber) {

        throw new Error(
            "Please enter the house/building number."
        );

    }


    if (!location.areaType) {

        throw new Error(
            "Please select whether the pickup area is urban or rural."
        );

    }


    if (
        !Number.isFinite(
            location.latitude
        ) ||
        !Number.isFinite(
            location.longitude
        )
    ) {

        throw new Error(
            "Please tap 'Use My Current Location' and capture your GPS location before uploading."
        );

    }

}


/* ==========================================================
   RESET UPLOAD BUTTON
========================================================== */

function resetUploadButton() {

    if (!uploadButton) {
        return;
    }


    uploadButton.disabled =
        false;

    uploadButton.textContent =
        "Upload Product";

}

/* ==========================================================
   SELLER UPLOAD PRODUCT
   PART 5 / 5
   ----------------------------------------------------------
   Complete product upload
   Firestore
   Seller pickup information
   GPS
   Shipping
========================================================== */


/* ==========================================================
   UPLOAD PRODUCT
========================================================== */

async function uploadProduct() {

    try {

        /* ======================================================
           AUTHENTICATION
        ====================================================== */

        const user =
            auth.currentUser;


        if (!user) {

            throw new Error(
                "Please login before uploading a product."
            );

        }


        currentSeller =
            user;


        /* ======================================================
           BASIC PRODUCT DATA
        ====================================================== */

        const productName =
            productNameInput
                ?.value
                ?.trim() || "";


        const category =
            categoryInput
                ?.value
                ?.trim() || "";


        const description =
            descriptionInput
                ?.value
                ?.trim() || "";


        const sellerPrice =
            Number(
                priceInput?.value
            );


        /* ======================================================
           BASIC VALIDATION
        ====================================================== */

        if (!productName) {

            throw new Error(
                "Please enter the product name."
            );

        }


        if (!category) {

            throw new Error(
                "Please select a product category."
            );

        }


        if (
            !Number.isFinite(
                sellerPrice
            ) ||
            sellerPrice <= 0
        ) {

            throw new Error(
                "Please enter a valid product price."
            );

        }


        if (!selectedImage) {

            throw new Error(
                "Please select a product image."
            );

        }


        /* ======================================================
           PICKUP INFORMATION
        ====================================================== */

        const pickup =
            getPickupLocationData();


        validatePickupLocation(
            pickup
        );


        /* ======================================================
           PACKAGE
        ====================================================== */

        const packageInformation =
            getPackageInformation();


        validatePackageInformation(
            packageInformation
        );


        /* ======================================================
           FREE SHIPPING
        ====================================================== */

        const freeShipping =
            Boolean(
                freeShippingInput?.checked
            );


        /* ======================================================
           PRICE
        ====================================================== */

        const platformMarkup =
            Math.round(
                sellerPrice * 0.05
            );


        const buyerPrice =
            sellerPrice +
            platformMarkup;


        /* ======================================================
           VARIATIONS
        ====================================================== */

        const variations =
            getVariations();


        /* ======================================================
           SELLER INFORMATION
        ====================================================== */

        const sellerName =
            user.displayName ||
            user.email
                ?.split("@")[0] ||
            "Seller";


        /* ======================================================
           DISABLE BUTTON
        ====================================================== */

        if (uploadButton) {

            uploadButton.disabled =
                true;

            uploadButton.textContent =
                "Uploading...";

        }


        /* ======================================================
           CLOUDINARY
        ====================================================== */

        const imageURL =
            await uploadImageToCloudinary(
                selectedImage
            );


        /* ======================================================
           PRODUCT DATA
        ====================================================== */

        const productData = {

            /* -----------------------------------------------
               PRODUCT
            ----------------------------------------------- */

            name:
                productName,

            slug:
                createSlug(
                    productName
                ),

            category:
                category,

            description:
                description,


            /* -----------------------------------------------
               IMAGES
            ----------------------------------------------- */

            image:
                imageURL,

            mainImage:
                imageURL,

            images: [
                imageURL
            ],


            /* -----------------------------------------------
               PRICE
            ----------------------------------------------- */

            sellerPrice:
                sellerPrice,

            platformFee:
                platformMarkup,

            platformMarkup:
                platformMarkup,

            buyerPrice:
                buyerPrice,


            /* -----------------------------------------------
               VARIATIONS
            ----------------------------------------------- */

            variations:
                variations,


            /* -----------------------------------------------
               SELLER
            ----------------------------------------------- */

            sellerId:
                user.uid,

            sellerEmail:
                user.email || "",

            sellerName:
                sellerName,


            /* -----------------------------------------------
               PICKUP COUNTRY
            ----------------------------------------------- */

            pickupCountry:
                pickup.country,


            /* -----------------------------------------------
               PICKUP STATE
            ----------------------------------------------- */

            pickupState:
                pickup.state,


            /* -----------------------------------------------
               PICKUP LGA
            ----------------------------------------------- */

            pickupLga:
                pickup.lga,


            /* -----------------------------------------------
               PICKUP CITY
            ----------------------------------------------- */

            pickupCity:
                pickup.city,


            /* -----------------------------------------------
               PICKUP AREA
            ----------------------------------------------- */

            pickupArea:
                pickup.area,


            /* -----------------------------------------------
               STREET
            ----------------------------------------------- */

            pickupStreet:
                pickup.street,


            /* -----------------------------------------------
               HOUSE NUMBER
            ----------------------------------------------- */

            pickupHouseNumber:
                pickup.houseNumber,


            /* -----------------------------------------------
               LANDMARK
            ----------------------------------------------- */

            pickupLandmark:
                pickup.landmark,


            /* -----------------------------------------------
               COURIER INSTRUCTIONS
            ----------------------------------------------- */

            pickupInstructions:
                pickup.pickupInstructions,


            /* -----------------------------------------------
               URBAN / RURAL
            ----------------------------------------------- */

            pickupAreaType:
                pickup.areaType,


            /* -----------------------------------------------
               GPS
            ----------------------------------------------- */

            sellerLatitude:
                pickup.latitude,

            sellerLongitude:
                pickup.longitude,

            sellerLocationAccuracy:
                pickup.accuracy,


            pickupLocation: {

                latitude:
                    pickup.latitude,

                longitude:
                    pickup.longitude,

                accuracy:
                    pickup.accuracy

            },


            /* -----------------------------------------------
               PACKAGE
            ----------------------------------------------- */

            packageWeight:
                packageInformation.weight,

            packageWeightUnit:
                packageInformation.weightUnit,

            packageWeightKg:
                packageInformation.weightKg,

            packageSize:
                packageInformation.size,

            packageDimensions:
                packageInformation.dimensions,


            /* -----------------------------------------------
               SHIPPING
            ----------------------------------------------- */

            freeShipping:
                freeShipping,

            shippingEnabled:
                true,

            shippingPaidBy:
                freeShipping
                    ? "seller"
                    : "buyer",

            shippingType:
                freeShipping
                    ? "free"
                    : "buyer-paid",


            /* -----------------------------------------------
               DELIVERY CALCULATION
            ----------------------------------------------- */

            deliveryCalculation: {

                enabled:
                    true,

                weightKg:
                    packageInformation.weightKg,

                packageSize:
                    packageInformation.size,

                dimensions:
                    packageInformation.dimensions,

                freeShipping:
                    freeShipping,

                pickupAreaType:
                    pickup.areaType,

                pickupCountry:
                    pickup.country,

                pickupState:
                    pickup.state,

                pickupLga:
                    pickup.lga,

                pickupCity:
                    pickup.city

            },


            /* -----------------------------------------------
               PRODUCT STATUS
            ----------------------------------------------- */

            status:
                "approved",

            approved:
                true,

            published:
                true,

            visible:
                true,

            searchable:
                true,

            homePage:
                true,

            categoryPage:
                true,

            searchEnabled:
                true,


            /* -----------------------------------------------
               STATISTICS
            ----------------------------------------------- */

            views:
                0,

            sales:
                0,

            reviewCount:
                0,

            rating:
                0,


            /* -----------------------------------------------
               TIMESTAMPS
            ----------------------------------------------- */

            createdAt:
                serverTimestamp(),

            updatedAt:
                serverTimestamp()

        };


        /* ======================================================
           SAVE TO FIRESTORE
        ====================================================== */

        showStatus(
            "Saving product...",
            "loading"
        );


        const productReference =
            await addDoc(
                collection(
                    db,
                    "products"
                ),
                productData
            );


        const productId =
            productReference.id;


        console.log(
            "Product uploaded:",
            productId
        );


        /* ======================================================
           LOCAL COPY
        ====================================================== */

        saveProductLocally(
            productId,
            {

                ...productData,

                createdAt:
                    Date.now()

            }
        );


        /* ======================================================
           SUCCESS
        ====================================================== */

        showStatus(
            "✓ Product uploaded successfully!",
            "success"
        );


        /* ======================================================
           REDIRECT
        ====================================================== */

        setTimeout(
            function() {

                window.location.href =
                    "seller-store.html";

            },
            1000
        );


    } catch (error) {

        console.error(
            "PRODUCT UPLOAD ERROR:",
            error
        );


        showStatus(
            error?.message ||
            "Product upload failed. Please try again.",
            "error"
        );


        resetUploadButton();

    }

}


/* ==========================================================
   UPLOAD BUTTON
========================================================== */

if (uploadButton) {

    uploadButton.addEventListener(
        "click",
        uploadProduct
    );

}


/* ==========================================================
   INITIALIZE PRICE
========================================================== */

updatePrice();


/* ==========================================================
   DEBUG INFORMATION
========================================================== */

console.log(
    "Seller upload system initialized."
);

console.log(
    "Country element:",
    sellerCountryInput
);

console.log(
    "State element:",
    sellerStateInput
);

console.log(
    "LGA element:",
    sellerLgaInput
);

console.log(
    "GPS button:",
    getSellerLocationButton
);


