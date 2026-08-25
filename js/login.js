// =====================================
// VERITEXT INSTRUCTOR LOGIN
// =====================================


// =====================================
// LOGIN ELEMENTS
// =====================================

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginError =
    document.getElementById("loginError");


// =====================================
// GET ALL INSTRUCTORS
// =====================================

function getInstructors() {

    try {

        const storedInstructors =
            localStorage.getItem(
                "veritext_instructors"
            );


        if (!storedInstructors) {

            return [];

        }


        const instructors =
            JSON.parse(
                storedInstructors
            );


        // Safety check

        if (
            !Array.isArray(instructors)
        ) {

            return [];

        }


        return instructors;

    }

    catch (error) {

        console.error(
            "Could not load instructor accounts:",
            error
        );

        return [];

    }

}


// =====================================
// SHOW MESSAGE
// =====================================

function showLoginMessage(
    message,
    type = "error"
) {

    loginError.textContent =
        message;

    loginError.className =
        "auth-message " +
        type;

}


// =====================================
// LOGIN
// =====================================

loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // =================================
        // CLEAR OLD MESSAGE
        // =================================

        showLoginMessage(
            "",
            ""
        );


        // =================================
        // GET VALUES
        // =================================

        const email =
            loginEmail.value
                .trim()
                .toLowerCase();


        const password =
            loginPassword.value;


        // =================================
        // BASIC VALIDATION
        // =================================

        if (email === "") {

            showLoginMessage(
                "Please enter your email."
            );

            return;

        }


        if (password === "") {

            showLoginMessage(
                "Please enter your password."
            );

            return;

        }


        // =================================
        // GET ALL INSTRUCTORS
        // =================================

        const instructors =
            getInstructors();


        // =================================
        // CHECK ACCOUNTS
        // =================================

        if (
            instructors.length === 0
        ) {

            showLoginMessage(
                "No instructor account found. Please create an account first."
            );

            return;

        }


        // =================================
        // FIND INSTRUCTOR
        // =================================

        const instructor =
            instructors.find(
                function (user) {

                    if (!user) {

                        return false;

                    }


                    const storedEmail =
                        String(
                            user.email || ""
                        )
                        .trim()
                        .toLowerCase();


                    const storedPassword =
                        String(
                            user.password || ""
                        );


                    const role =
                        user.role ||
                        "instructor";


                    return (
                        storedEmail === email &&
                        storedPassword === password &&
                        role === "instructor"
                    );

                }
            );


        // =================================
        // INVALID LOGIN
        // =================================

        if (!instructor) {

            showLoginMessage(
                "Incorrect email or password."
            );

            return;

        }


        // =================================
        // LOGIN SUCCESS
        // =================================

        localStorage.setItem(
            "veritext_logged_in",
            "true"
        );


        // =================================
        // SAVE CURRENT USER
        // =================================

        const currentUser = {

            id:
                instructor.id,

            name:
                instructor.name,

            email:
                instructor.email,

            role:
                instructor.role ||
                "instructor"

        };


        localStorage.setItem(
            "veritext_current_user",
            JSON.stringify(
                currentUser
            )
        );


        // =================================
        // SUCCESS MESSAGE
        // =================================

        showLoginMessage(
            "Login successful! Redirecting...",
            "success"
        );


        // =================================
        // REDIRECT
        // =================================

        setTimeout(
            function () {

                window.location.href =
                    "instructor.html";

            },
            500
        );

    }
);