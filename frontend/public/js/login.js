// =====================================
// VERITEXT INSTRUCTOR LOGIN (MONGODB)
// =====================================

const API_BASE_URL = "https://veritext-backend-oe56.onrender.com/api";

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
// SHOW MESSAGE
// =====================================

function showLoginMessage(
    message,
    type = "error"
) {

    if (!loginError) return;

    loginError.textContent =
        message;

    loginError.className =
        "auth-message " +
        type;

}


// =====================================
// LOGIN SUBMIT
// =====================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            // Clear old message
            showLoginMessage("", "");

            const email =
                loginEmail
                    ? loginEmail.value.trim().toLowerCase()
                    : "";

            const password =
                loginPassword ? loginPassword.value : "";

            if (email === "") {
                showLoginMessage(
                    "Please enter your email.",
                    "error"
                );
                return;
            }

            if (password === "") {
                showLoginMessage(
                    "Please enter your password.",
                    "error"
                );
                return;
            }

            const submitBtn = loginForm.querySelector('[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            try {
                const response = await fetch(`${API_BASE_URL}/instructors/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    showLoginMessage(
                        result.message || "Incorrect email or password.",
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

                showLoginMessage(
                    "Login successful! Redirecting...",
                    "success"
                );

                // Redirect to instructor dashboard
                setTimeout(function () {
                    window.location.href = "instructor.html";
                }, 500);

            } catch (error) {
                console.error("Login network error:", error);
                showLoginMessage(
                    "Could not connect to the backend server. Please make sure it is running.",
                    "error"
                );
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }

        }
    );

}
