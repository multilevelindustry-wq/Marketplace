/* =================================================
   MOBILE MENU
================================================= */

const menuButton =
    document.getElementById("menuButton");

const mobileNav =
    document.getElementById("mobileNav");


if (menuButton && mobileNav) {

    menuButton.addEventListener(
        "click",
        () => {

            mobileNav.classList.toggle(
                "active"
            );

        }
    );

}



/* =================================================
   AUTOMATIC AD SPACING
================================================= */

/*
   This automatically creates an ad after
   selected article sections.

   You can later replace the ad containers
   with Adsterra code.
*/

const articleContent =
    document.querySelector(".article-content");


if (articleContent) {

    const paragraphs =
        articleContent.querySelectorAll("p");

    paragraphs.forEach(
        (paragraph, index) => {

            /*
               Every 5th paragraph gets extra
               visual breathing room.
            */

            if (
                index > 0 &&
                (index + 1) % 5 === 0
            ) {

                paragraph.style.marginBottom =
                    "45px";

            }

        }
    );

}



/* =================================================
   IMAGE ERROR HANDLING
================================================= */

document
    .querySelectorAll("img")
    .forEach(image => {

        image.addEventListener(
            "error",
            () => {

                image.style.display =
                    "none";

            }
        );

    });

