// =====================================
// VERITEXT STUDENT AUTHENTICATION
// =====================================


// =====================================
// GET ALL STUDENTS
// =====================================

function getStudents() {

    try {

        const storedStudents =
            localStorage.getItem(
                "veritext_students"
            );


        if (!storedStudents) {

            return [];

        }


        const students =
            JSON.parse(
                storedStudents
            );


        if (!Array.isArray(students)) {

            return [];

        }


        return students;

    }

    catch (error) {

        console.error(
            "Could not load student accounts:",
            error
        );

        return [];

    }

}


// =====================================
// SAVE ALL STUDENTS
// =====================================

function saveStudents(students) {

    localStorage.setItem(
        "veritext_students",
        JSON.stringify(students)
    );

}


// =====================================
// SHOW MESSAGE
// =====================================

function showStudentMessage(
    element,
    message,
    type = ""
) {

    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.className =
        "auth-message " + type;

}



// =====================================
// STUDENT SIGNUP ELEMENTS
// =====================================

const studentSignupForm =
    document.getElementById(
        "studentSignupForm"
    );


if (studentSignupForm) {


    const studentSignupName =
        document.getElementById(
            "studentSignupName"
        );


    const studentSignupId =
        document.getElementById(
            "studentSignupId"
        );


    const studentSignupEmail =
        document.getElementById(
            "studentSignupEmail"
        );


    const studentSignupPassword =
        document.getElementById(
            "studentSignupPassword"
        );


    const studentConfirmPassword =
        document.getElementById(
            "studentConfirmPassword"
        );


    const studentSignupError =
        document.getElementById(
            "studentSignupError"
        );



    // =================================
    // STUDENT SIGNUP
    // =================================

    studentSignupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // CLEAR MESSAGE

            showStudentMessage(
                studentSignupError,
                ""
            );


            // GET VALUES

            const name =
                studentSignupName.value
                    .trim();


            const studentId =
                studentSignupId.value
                    .trim()
                    .toUpperCase();


            const email =
                studentSignupEmail.value
                    .trim()
                    .toLowerCase();


            const password =
                studentSignupPassword.value;


            const confirmPassword =
                studentConfirmPassword.value;



            // =================================
            // NAME VALIDATION
            // =================================

            if (name === "") {

                showStudentMessage(
                    studentSignupError,
                    "Please enter your full name.",
                    "error"
                );

                return;

            }



            // =================================
            // STUDENT ID VALIDATION
            // =================================

            if (studentId === "") {

                showStudentMessage(
                    studentSignupError,
                    "Please enter your student ID.",
                    "error"
                );

                return;

            }



            // =================================
            // EMAIL VALIDATION
            // =================================

            if (email === "") {

                showStudentMessage(
                    studentSignupError,
                    "Please enter your email address.",
                    "error"
                );

                return;

            }



            // =================================
            // PASSWORD VALIDATION
            // =================================

            if (password.length < 6) {

                showStudentMessage(
                    studentSignupError,
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;

            }



            // =================================
            // CONFIRM PASSWORD
            // =================================

            if (
                password !== confirmPassword
            ) {

                showStudentMessage(
                    studentSignupError,
                    "Passwords do not match.",
                    "error"
                );

                return;

            }



            // =================================
            // GET EXISTING STUDENTS
            // =================================

            const students =
                getStudents();



            // =================================
            // CHECK DUPLICATE EMAIL
            // =================================

            const existingEmail =
                students.find(
                    function (student) {

                        return (
                            String(
                                student.email || ""
                            )
                                .trim()
                                .toLowerCase() ===
                            email
                        );

                    }
                );


            if (existingEmail) {

                showStudentMessage(
                    studentSignupError,
                    "An account with this email already exists. Please log in.",
                    "error"
                );

                return;

            }



            // =================================
            // CHECK DUPLICATE STUDENT ID
            // =================================

            const existingStudentId =
                students.find(
                    function (student) {

                        return (
                            String(
                                student.studentId || ""
                            )
                                .trim()
                                .toUpperCase() ===
                            studentId
                        );

                    }
                );


            if (existingStudentId) {

                showStudentMessage(
                    studentSignupError,
                    "This student ID is already registered.",
                    "error"
                );

                return;

            }



            // =================================
            // CREATE UNIQUE ID
            // =================================

            const studentUniqueId =
                Date.now().toString() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 8);



            // =================================
            // CREATE STUDENT OBJECT
            // =================================

            const student = {

                id:
                    studentUniqueId,

                name:
                    name,

                studentId:
                    studentId,

                email:
                    email,

                password:
                    password,

                role:
                    "student",

                createdAt:
                    new Date().toISOString()

            };



            // =================================
            // ADD STUDENT
            // =================================

            students.push(
                student
            );



            // =================================
            // SAVE STUDENTS
            // =================================

            saveStudents(
                students
            );



            // =================================
            // SUCCESS
            // =================================

            showStudentMessage(
                studentSignupError,
                "Account created successfully! Redirecting...",
                "success"
            );



            // =================================
            // REDIRECT TO LOGIN
            // =================================

            setTimeout(
                function () {

                    window.location.href =
                        "student-login.html";

                },
                700
            );

        }
    );

}



// =====================================
// STUDENT LOGIN ELEMENTS
// =====================================

const studentLoginForm =
    document.getElementById(
        "studentLoginForm"
    );


if (studentLoginForm) {


    const studentLoginEmail =
        document.getElementById(
            "studentLoginEmail"
        );


    const studentLoginPassword =
        document.getElementById(
            "studentLoginPassword"
        );


    const studentLoginError =
        document.getElementById(
            "studentLoginError"
        );



    // =================================
    // STUDENT LOGIN
    // =================================

    studentLoginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // CLEAR MESSAGE

            showStudentMessage(
                studentLoginError,
                ""
            );


            // GET VALUES

            const email =
                studentLoginEmail.value
                    .trim()
                    .toLowerCase();


            const password =
                studentLoginPassword.value;



            // =================================
            // VALIDATION
            // =================================

            if (email === "") {

                showStudentMessage(
                    studentLoginError,
                    "Please enter your email.",
                    "error"
                );

                return;

            }


            if (password === "") {

                showStudentMessage(
                    studentLoginError,
                    "Please enter your password.",
                    "error"
                );

                return;

            }



            // =================================
            // GET STUDENTS
            // =================================

            const students =
                getStudents();



            // =================================
            // NO ACCOUNTS
            // =================================

            if (students.length === 0) {

                showStudentMessage(
                    studentLoginError,
                    "No student account found. Please create an account first.",
                    "error"
                );

                return;

            }



            // =================================
            // FIND STUDENT
            // =================================

            const student =
                students.find(
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
                            "student";


                        return (
                            storedEmail === email &&
                            storedPassword === password &&
                            role === "student"
                        );

                    }
                );



            // =================================
            // INVALID LOGIN
            // =================================

            if (!student) {

                showStudentMessage(
                    studentLoginError,
                    "Incorrect email or password.",
                    "error"
                );

                return;

            }



            // =================================
            // CREATE STUDENT SESSION
            // =================================

            localStorage.setItem(
                "veritext_student_logged_in",
                "true"
            );



            // =================================
            // SAVE CURRENT STUDENT
            // =================================

            const currentStudent = {

                id:
                    student.id,

                name:
                    student.name,

                studentId:
                    student.studentId,

                email:
                    student.email,

                role:
                    "student"

            };


            localStorage.setItem(
                "veritext_current_student",
                JSON.stringify(
                    currentStudent
                )
            );



            // =================================
            // SUCCESS MESSAGE
            // =================================

            showStudentMessage(
                studentLoginError,
                "Login successful! Redirecting...",
                "success"
            );



            // =================================
            // REDIRECT
            // =================================

            setTimeout(
                function () {

                    window.location.href =
                        "student.html";

                },
                500
            );

        }
    );

}