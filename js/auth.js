// =====================================
// VERITEXT AUTHENTICATION
// =====================================


// =====================================
// CHECK IF INSTRUCTOR IS LOGGED IN
// =====================================

function isInstructorLoggedIn() {

    return (
        localStorage.getItem(
            "veritext_logged_in"
        ) === "true"
    );

}


// =====================================
// PROTECT INSTRUCTOR DASHBOARD
// =====================================

if (!isInstructorLoggedIn()) {

    window.location.href =
        "login.html";

}


// =====================================
// SHOW LOGGED-IN INSTRUCTOR NAME
// =====================================

const instructorName =
    document.getElementById(
        "instructorName"
    );


if (instructorName) {

    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "veritext_current_user"
            )
        );


    if (
        currentUser &&
        currentUser.name
    ) {

        instructorName.textContent =
            currentUser.name;

    }

}


// =====================================
// LOGOUT
// =====================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            // Remove login status

            localStorage.removeItem(
                "veritext_logged_in"
            );


            // Remove current instructor

            localStorage.removeItem(
                "veritext_current_user"
            );


            // Go back to login page

            window.location.href =
                "login.html";

        }
    );

}