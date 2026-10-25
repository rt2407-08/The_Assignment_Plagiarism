
const API_BASE_URL = "http://127.0.0.1:5000/api";

// =====================================
// SHOW MESSAGE
// =====================================

function showStudentMessage(element, message, type = "") {
  if (!element) return;

  element.textContent = message;
  element.className = "auth-message " + type;
}

// =====================================
// STUDENT SIGNUP
// =====================================

const studentSignupForm =
  document.getElementById("studentSignupForm");

if (studentSignupForm) {
  const nameInput = document.getElementById("studentSignupName");
  const idInput = document.getElementById("studentSignupId");
  const emailInput = document.getElementById("studentSignupEmail");
  const passwordInput = document.getElementById("studentSignupPassword");
  const confirmInput = document.getElementById("studentConfirmPassword");
  const errorElement = document.getElementById("studentSignupError");

  studentSignupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showStudentMessage(errorElement, "");

    const name = nameInput.value.trim();
    const studentId = idInput.value.trim().toUpperCase();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (!name) {
      showStudentMessage(errorElement, "Please enter your full name.", "error");
      return;
    }

    if (!studentId) {
      showStudentMessage(errorElement, "Please enter your student ID.", "error");
      return;
    }

    if (!email) {
      showStudentMessage(errorElement, "Please enter your email address.", "error");
      return;
    }

    if (password.length < 6) {
      showStudentMessage(
        errorElement,
        "Password must contain at least 6 characters.",
        "error"
      );
      return;
    }

    if (password !== confirmPassword) {
      showStudentMessage(errorElement, "Passwords do not match.", "error");
      return;
    }

    const submitButton = studentSignupForm.querySelector(
      'button[type="submit"]'
    );

    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/students/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, studentId, email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showStudentMessage(
          errorElement,
          data.message || "Registration failed. Please try again.",
          "error"
        );
        return;
      }

      showStudentMessage(
        errorElement,
        "Account created successfully! Redirecting...",
        "success"
      );

      setTimeout(() => {
        window.location.href = "student-login.html";
      }, 700);
    } catch (error) {
      console.error("Student signup error:", error);
      showStudentMessage(
        errorElement,
        "Cannot connect to the server. Please try again.",
        "error"
      );
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

// =====================================
// STUDENT LOGIN
// =====================================

const studentLoginForm =
  document.getElementById("studentLoginForm");

if (studentLoginForm) {
  const emailInput = document.getElementById("studentLoginEmail");
  const passwordInput = document.getElementById("studentLoginPassword");
  const errorElement = document.getElementById("studentLoginError");

  studentLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    showStudentMessage(errorElement, "");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email) {
      showStudentMessage(errorElement, "Please enter your email.", "error");
      return;
    }

    if (!password) {
      showStudentMessage(errorElement, "Please enter your password.", "error");
      return;
    }

    const submitButton = studentLoginForm.querySelector(
      'button[type="submit"]'
    );

    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/students/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        showStudentMessage(
          errorElement,
          data.message || "Incorrect email or password.",
          "error"
        );
        return;
      }

      const student = data.student;

      // Save student session and JWT token
      localStorage.setItem("veritext_student_logged_in", "true");
      if (data.token) {
        localStorage.setItem("veritext_student_token", data.token);
      }
      localStorage.setItem(
        "veritext_current_student",
        JSON.stringify({
          id: student.id,
          name: student.name,
          studentId: student.studentId,
          email: student.email,
          role: "student"
        })
      );

      showStudentMessage(
        errorElement,
        "Login successful! Redirecting...",
        "success"
      );

      setTimeout(() => {
        window.location.href = "student.html";
      }, 500);
    } catch (error) {
      console.error("Student login error:", error);
      showStudentMessage(
        errorElement,
        "Cannot connect to the server. Please try again.",
        "error"
      );
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
