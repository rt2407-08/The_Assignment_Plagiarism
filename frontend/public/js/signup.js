// =====================================
// VERITEXT INSTRUCTOR SIGNUP (MONGODB)
// =====================================

const API_BASE_URL = "https://veritext-backend-oe56.onrender.com/api";

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
// SHOW MESSAGE
// =====================================

function showSignupMessage(
    message,
    type = "error"
) {

    if (!signupError) return;

    signupError.textContent =
        message;

    signupError.className =
        "auth-message " +
        type;

}


// =====================================
// SIGNUP SUBMIT
// =====================================

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            // Clear old message
            showSignupMessage("", "");

            const name =
                signupName ? signupName.value.trim() : "";

            const email =
                signupEmail
                    ? signupEmail.value.trim().toLowerCase()
                    : "";

            const password =
                signupPassword ? signupPassword.value : "";

            const confirm =
                confirmPassword ? confirmPassword.value : "";

            // Validation
            if (name === "") {
                showSignupMessage(
                    "Please enter your full name.",
                    "error"
                );
                return;
            }

            if (email === "") {
                showSignupMessage(
                    "Please enter your email address.",
                    "error"
                );
                return;
            }

            if (password.length < 6) {
                showSignupMessage(
                    "Password must contain at least 6 characters.",
                    "error"
                );
                return;
            }

            if (password !== confirm) {
                showSignupMessage(
                    "Passwords do not match.",
                    "error"
                );
                return;
            }

            const submitBtn = signupForm.querySelector('[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            try {
                const response = await fetch(`${API_BASE_URL}/instructors/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    showSignupMessage(
                        result.message || "Signup failed. Please try again.",
                        "error"
                    );
                    return;
                }

                // Save session and JWT token in localStorage
                localStorage.setItem(
                    "veritext_logged_in",
                    "true"
                );

                if (result.token) {
                    localStorage.setItem("veritext_token", result.token);
                }

                localStorage.setItem(
                    "veritext_current_user",
                    JSON.stringify(result.instructor)
                );

                showSignupMessage(
                    "Account created successfully! Redirecting...",
                    "success"
                );

                setTimeout(function () {
                    window.location.href = "instructor.html";
                }, 700);

            } catch (error) {
                console.error("Signup network error:", error);
                showSignupMessage(
                    "Could not connect to the backend server. Please make sure it is running.",
                    "error"
                );
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }

        }
    );

}
