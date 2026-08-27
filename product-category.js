/* ==========================================================
   PRODUCT PAGE CATEGORY ROLLERS
========================================================== */


/*
   ROLLER 1
*/

const categoryRoller1Categories = [

    "Fashion",
    "Electronics",
    "Shoes",
    "Beauty",
    "Groceries",
    "Home"

];


/*
   ROLLER 2
*/

const categoryRoller2Categories = [

    "Kids",
    "Accessories",
    "Phones",
    "Fashion",
    "Shoes",
    "Beauty"

];


/*
   ROLLER 3
*/

const categoryRoller3Categories = [

    "Home",
    "Appliances",
    "Furniture",
    "Groceries",
    "Electronics",
    "Accessories"

];


/*
   ROLLER 4
*/

const categoryRoller4Categories = [

    "Automotive",
    "Books",
    "Toys",
    "Sports",
    "Computers",
    "Phones"

];



/* ==========================================================
   FIND CATEGORY
========================================================== */

function findHomeCategory(categoryName){

    return homeCategories.find(

        category =>
            category.name.toLowerCase() ===
            categoryName.toLowerCase()

    );

}



/* ==========================================================
   CREATE CATEGORY CARD
========================================================== */

function createProductCategoryCard(category){

    if(!category){

        return null;

    }


    const card =
        document.createElement("a");


    card.className =
        "product-category-card";


    /*
       Category page

       Change this later if your category
       page uses another URL structure.
    */

    card.href =
        "category.html?category=" +
        encodeURIComponent(
            category.name
        );


    card.innerHTML = `

        <div class="product-category-image">

            <img
                src="${category.image}"
                alt="${category.name}"
                loading="lazy"
            >

            <span class="product-category-icon">
                ${category.icon || "🛍️"}
            </span>

        </div>


        <div class="product-category-content">

            <h3>
                ${category.name}
            </h3>

            <p>
                ${category.description || ""}
            </p>

        </div>


        <span class="product-category-arrow">
            →
        </span>

    `;


    return card;

}



/* ==========================================================
   RENDER CATEGORY ROLLER
========================================================== */

function renderProductCategoryRoller(
    rollerId,
    categoryNames
){

    const roller =
        document.getElementById(
            rollerId
        );


    if(!roller){

        return;

    }


    roller.innerHTML = "";


    categoryNames.forEach(
        categoryName => {

            const category =
                findHomeCategory(
                    categoryName
                );


            if(!category){

                return;

            }


            const card =
                createProductCategoryCard(
                    category
                );


            if(card){

                roller.appendChild(
                    card
                );

            }

        }
    );

}



/* ==========================================================
   INITIALIZE ALL CATEGORY ROLLERS
========================================================== */

function initializeProductCategoryRollers(){

    renderProductCategoryRoller(
        "categoryRoller1",
        categoryRoller1Categories
    );


    renderProductCategoryRoller(
        "categoryRoller2",
        categoryRoller2Categories
    );


    renderProductCategoryRoller(
        "categoryRoller3",
        categoryRoller3Categories
    );


    renderProductCategoryRoller(
        "categoryRoller4",
        categoryRoller4Categories
    );

}



/* ==========================================================
   ROLLER ARROWS
========================================================== */

function initializeCategoryRollerButtons(){

    const buttons =
        document.querySelectorAll(
            ".roller-arrow"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    const targetId =
                        this.dataset.target;


                    const roller =
                        document.getElementById(
                            targetId
                        );


                    if(!roller){

                        return;

                    }


                    const direction =
                        this.classList.contains(
                            "roller-arrow-left"
                        )
                            ? -1
                            : 1;


                    roller.scrollBy({

                        left:
                            direction * 430,

                        behavior:
                            "smooth"

                    });

                }
            );

        }
    );

}



/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeProductCategoryRollers();

        initializeCategoryRollerButtons();

    }
);

