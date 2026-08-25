// =====================================
// VERITEXT INSTRUCTOR SIGNUP
// =====================================


// =====================================
// SIGNUP ELEMENTS
// =====================================

const signupForm =
    document.getElementById("signupForm");

const signupName =
    document.getElementById("signupName");

const signupEmail =
    document.getElementById("signupEmail");

const signupPassword =
    document.getElementById("signupPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const signupError =
    document.getElementById("signupError");


// =====================================
// GET ALL INSTRUCTORS
// =====================================

function getInstructors() {

    try {

        const stored =
            localStorage.getItem(
                "veritext_instructors"
            );


        if (!stored) {

            return [];

        }


        const instructors =
            JSON.parse(stored);


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
// SAVE ALL INSTRUCTORS
// =====================================

function saveInstructors(
    instructors
) {

    localStorage.setItem(
        "veritext_instructors",
        JSON.stringify(
            instructors
        )
    );

}


// =====================================
// SHOW MESSAGE
// =====================================

function showSignupMessage(
    message,
    type
) {

    signupError.textContent =
        message;


    signupError.className =
        "auth-message " +
        type;

}


// =====================================
// SIGNUP
// =====================================

signupForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        // =================================
        // CLEAR OLD MESSAGE
        // =================================

        signupError.textContent = "";

        signupError.className =
            "auth-message";


        // =================================
        // GET FORM VALUES
        // =================================

        const name =
            signupName.value.trim();


        const email =
            signupEmail.value
                .trim()
                .toLowerCase();


        const password =
            signupPassword.value;


        const confirm =
            confirmPassword.value;


        // =================================
        // NAME VALIDATION
        // =================================

        if (name === "") {

            showSignupMessage(
                "Please enter your full name.",
                "error"
            );

            return;

        }


        // =================================
        // EMAIL VALIDATION
        // =================================

        if (email === "") {

            showSignupMessage(
                "Please enter your email address.",
                "error"
            );

            return;

        }


        // =================================
        // PASSWORD VALIDATION
        // =================================

        if (
            password.length < 6
        ) {

            showSignupMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;

        }


        // =================================
        // CONFIRM PASSWORD
        // =================================

        if (
            password !== confirm
        ) {

            showSignupMessage(
                "Passwords do not match.",
                "error"
            );

            return;

        }


        // =================================
        // GET EXISTING INSTRUCTORS
        // =================================

        const instructors =
            getInstructors();


        // =================================
        // CHECK DUPLICATE EMAIL
        // =================================

        const existingInstructor =
            instructors.find(
                function (instructor) {

                    return (
                        String(
                            instructor.email
                        )
                            .toLowerCase() ===
                        email
                    );

                }
            );


        if (
            existingInstructor
        ) {

            showSignupMessage(
                "An account with this email already exists. Please log in.",
                "error"
            );

            return;

        }


        // =================================
        // CREATE UNIQUE INSTRUCTOR ID
        // =================================

        const instructorId =
            Date.now().toString() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8);


        // =================================
        // CREATE INSTRUCTOR OBJECT
        // =================================

        const instructor = {

            id:
                instructorId,

            name:
                name,

            email:
                email,

            password:
                password,

            role:
                "instructor",

            createdAt:
                new Date().toISOString()

        };


        // =================================
        // ADD NEW INSTRUCTOR
        // =================================

        instructors.push(
            instructor
        );


        // =================================
        // SAVE INSTRUCTORS
        // =================================

        saveInstructors(
            instructors
        );


        // =================================
        // CREATE LOGIN SESSION
        // =================================

        localStorage.setItem(
            "veritext_logged_in",
            "true"
        );


        // =================================
        // SAVE CURRENT USER
        // =================================

        localStorage.setItem(
            "veritext_current_user",
            JSON.stringify(
                {

                    id:
                        instructor.id,

                    name:
                        instructor.name,

                    email:
                        instructor.email,

                    role:
                        instructor.role

                }
            )
        );


        // =================================
        // SUCCESS MESSAGE
        // =================================

        showSignupMessage(
            "Account created successfully! Redirecting...",
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
            700
        );

    }
);