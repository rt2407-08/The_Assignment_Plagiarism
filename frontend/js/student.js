// =====================================
// VERITEXT STUDENT SUBMISSION
// =====================================

const API_BASE_URL =
    (typeof window !== "undefined" && window.localStorage && localStorage.getItem("veritext_api_url")) ||
    (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:")
        ? "http://127.0.0.1:5000/api"
        : "https://veritext-backend-oe56.onrender.com/api");


// =====================================
// STUDENT AUTHENTICATION
// =====================================

const studentLoggedIn =
    localStorage.getItem(
        "veritext_student_logged_in"
    );


if (
    studentLoggedIn !== "true"
) {

    window.location.href =
        "student-login.html";

    throw new Error(
        "Student is not logged in."
    );

}



// =====================================
// GET CURRENT STUDENT
// =====================================

let currentStudent = null;


try {

    currentStudent =
        JSON.parse(
            localStorage.getItem(
                "veritext_current_student"
            )
        );

}

catch (error) {

    console.error(
        "Could not load current student:",
        error
    );

}



// =====================================
// CHECK CURRENT STUDENT
// =====================================

if (!currentStudent) {

    localStorage.removeItem(
        "veritext_student_logged_in"
    );

    window.location.href =
        "student-login.html";

    throw new Error(
        "No student session found."
    );

}



// =====================================
// ELEMENTS
// =====================================

const assignmentCodeInput =
    document.getElementById(
        "assignmentCode"
    );


const questionsContainer =
    document.getElementById(
        "questionsContainer"
    );


const submissionForm =
    document.getElementById(
        "submissionForm"
    );


const studentNameInput =
    document.getElementById(
        "studentName"
    );


const studentIdInput =
    document.getElementById(
        "studentId"
    );


const studentLogout =
    document.getElementById(
        "studentLogout"
    );



// =====================================
// LOAD STUDENT DETAILS
// =====================================

if (currentStudent) {

    studentNameInput.value =
        currentStudent.name || "";

    studentIdInput.value =
        currentStudent.studentId || "";

}



// =====================================
// LOGOUT
// =====================================

if (studentLogout) {

    studentLogout.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            localStorage.removeItem(
                "veritext_student_logged_in"
            );


            localStorage.removeItem(
                "veritext_student_token"
            );


            localStorage.removeItem(
                "veritext_current_student"
            );


            window.location.href =
                "student-login.html";

        }
    );

}



// Assignments are fetched dynamically from MongoDB via /api/assignments/code/:code



// =====================================
// FIND ASSIGNMENT
// =====================================


async function findAssignment(code) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/assignments/code/${encodeURIComponent(code.trim())}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            return null;
        }

        return data.assignment;
    } catch (error) {
        console.error("Could not fetch assignment:", error);
        alert("Could not connect to the server. Please try again.");
        return null;
    }
}



// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text ?? "";


    return div.innerHTML;

}



// =====================================
// LANGUAGE NAME
// =====================================

function getLanguageName(
    language
) {

    const languages = {

        python:
            "Python",

        java:
            "Java",

        cpp:
            "C++",

        c:
            "C",

        javascript:
            "JavaScript"

    };


    return (
        languages[language] ||
        "Programming"
    );

}



// =====================================
// GET QUESTIONS
// =====================================

function getQuestions(
    assignment
) {

    // =================================
    // NEW FORMAT
    // =================================

    if (
        Array.isArray(
            assignment.questions
        ) &&
        assignment.questions.length > 0
    ) {

        return assignment.questions;

    }



    // =================================
    // OLD FORMAT
    // =================================

    if (
        assignment.question &&
        String(
            assignment.question
        ).trim() !== ""
    ) {

        return [

            {

                id:
                    1,

                type:
                    assignment.type ||
                    "text",

                language:
                    assignment.language ||
                    null,

                question:
                    assignment.question,

                minWords:
                    assignment.minWords,

                maxWords:
                    assignment.maxWords

            }

        ];

    }



    return [];

}



// =====================================
// CREATE TEXT QUESTION CARD
// =====================================

function createTextQuestionCard(
    question,
    index
) {

    const questionCard =
        document.createElement(
            "div"
        );


    questionCard.className =
        "student-question-card";



    const minWords =
        Number(
            question.minWords ?? 0
        );


    const maxWords =
        Number(
            question.maxWords ?? 10000
        );



    questionCard.innerHTML = `

        <!-- QUESTION HEADER -->

        <div class="student-question-header">

            <div class="question-number">
                ${String(
                    index + 1
                ).padStart(2, "0")}
            </div>

            <div>

                <span class="question-label">
                    TEXT QUESTION ${index + 1}
                </span>

                <h3>
                    Question ${index + 1}
                </h3>

            </div>

        </div>



        <!-- QUESTION -->

        <div class="question-box">

            <span class="question-label">
                ASSIGNMENT QUESTION
            </span>

            <p>
                ${escapeHTML(
                    question.question ||
                    question.text ||
                    ""
                )}
            </p>

            <small>

                Word limit:

                <strong>
                    ${minWords}–${maxWords} words
                </strong>

            </small>

        </div>



        <!-- ANSWER -->

        <div class="form-group">

            <label for="answer-${index}">
                Your answer
            </label>

            <textarea
                id="answer-${index}"
                class="student-answer"
                data-question-index="${index}"
                data-question-type="text"
                data-language=""
                data-min-words="${minWords}"
                data-max-words="${maxWords}"
                rows="10"
                placeholder="Write your answer here..."
                required
            ></textarea>


            <div class="answer-footer">

                <span id="wordCount-${index}">
                    0 words
                </span>

                <span id="characterCount-${index}">
                    0 characters
                </span>

            </div>

        </div>

    `;


    return questionCard;

}



// =====================================
// CREATE CODING QUESTION CARD
// =====================================

function createCodingQuestionCard(
    question,
    index
) {

    const questionCard =
        document.createElement(
            "div"
        );


    questionCard.className =
        "student-question-card coding-question-card";



    const language =
        question.language ||
        "";


    const languageName =
        getLanguageName(
            language
        );



    questionCard.innerHTML = `

        <!-- QUESTION HEADER -->

        <div class="student-question-header">

            <div class="question-number">
                ${String(
                    index + 1
                ).padStart(2, "0")}
            </div>

            <div>

                <span class="question-label">
                    CODING QUESTION ${index + 1}
                </span>

                <h3>
                    Question ${index + 1}
                </h3>

            </div>

        </div>



        <!-- LANGUAGE -->

        <div
            class="coding-language-badge"
            style="
                display:inline-flex;
                align-items:center;
                gap:8px;
                padding:8px 14px;
                margin-bottom:16px;
                border-radius:8px;
                background:#EFF6FF;
                color:#1E3A8A;
                font-weight:700;
                font-size:14px;
            "
        >

            <span>
                CODE
            </span>

            <span>
                ${escapeHTML(
                    languageName
                )}
            </span>

        </div>



        <!-- QUESTION -->

        <div class="question-box">

            <span class="question-label">
                CODING QUESTION
            </span>

            <p>
                ${escapeHTML(
                    question.question ||
                    question.text ||
                    ""
                )}
            </p>

        </div>



        <!-- CODE ANSWER -->

        <div class="form-group">

            <label for="answer-${index}">
                Your code
            </label>


            <textarea
                id="answer-${index}"
                class="student-answer code-answer"
                data-question-index="${index}"
                data-question-type="code"
                data-language="${escapeHTML(
                    language
                )}"
                data-min-words="0"
                data-max-words="100000"
                rows="16"
                placeholder="Write your ${escapeHTML(
                    languageName
                )} code here..."
                spellcheck="false"
                required
                style="
                    font-family:monospace;
                    line-height:1.6;
                    tab-size:4;
                "
            ></textarea>


            <div class="answer-footer">

                <span id="wordCount-${index}">
                    0 words
                </span>

                <span id="characterCount-${index}">
                    0 characters
                </span>

            </div>

        </div>

    `;


    return questionCard;

}



// =====================================
// CREATE QUESTION CARD
// =====================================

function createQuestionCard(
    question,
    index
) {

    const type =
        question.type === "code"
            ? "code"
            : "text";


    if (type === "code") {

        return createCodingQuestionCard(
            question,
            index
        );

    }


    return createTextQuestionCard(
        question,
        index
    );

}



// =====================================
// SHOW ASSIGNMENT
// =====================================

function showAssignment(
    assignment
) {

    questionsContainer.innerHTML =
        "";



    // =================================
    // ASSIGNMENT HEADER
    // =================================

    const title =
        document.createElement(
            "div"
        );


    title.className =
        "loaded-assignment-title";


    title.innerHTML = `

        <span class="section-tag">
            ASSIGNMENT
        </span>

        <h2>
            ${escapeHTML(
                assignment.title
            )}
        </h2>

        <p>
            Answer all questions below.
        </p>

    `;


    questionsContainer.appendChild(
        title
    );



    // =================================
    // GET QUESTIONS
    // =================================

    const questions =
        getQuestions(
            assignment
        );



    // =================================
    // NO QUESTIONS
    // =================================

    if (
        questions.length === 0
    ) {

        questionsContainer.innerHTML += `

            <div class="question-box">

                <span class="question-label">
                    ERROR
                </span>

                <p style="color:#DC2626;">
                    This assignment does not contain
                    any questions.
                </p>

            </div>

        `;


        return;

    }



    // =================================
    // CREATE QUESTIONS
    // =================================

    questions.forEach(
        function (
            question,
            index
        ) {

            const card =
                createQuestionCard(
                    question,
                    index
                );


            questionsContainer.appendChild(
                card
            );

        }
    );



    // =================================
    // ADD INPUT LISTENERS
    // =================================

    const answerInputs =
        questionsContainer.querySelectorAll(
            ".student-answer"
        );


    answerInputs.forEach(
        function (input) {

            input.addEventListener(
                "input",
                function () {

                    updateQuestionCount(
                        input
                    );

                }
            );

        }
    );

}



// =====================================
// SHOW ENTER CODE MESSAGE
// =====================================

function showEnterCodeMessage() {

    questionsContainer.innerHTML = `

        <div class="question-box">

            <span class="question-label">
                ASSIGNMENT QUESTIONS
            </span>

            <p>
                Enter your assignment code
                to view the questions.
            </p>

        </div>

    `;

}



// =====================================
// SHOW NOT FOUND
// =====================================

function showNotFoundMessage() {

    questionsContainer.innerHTML = `

        <div class="question-box">

            <span class="question-label">
                ASSIGNMENT
            </span>

            <p style="color:#DC2626;">
                Assignment not found.
            </p>

            <small>
                Please check the assignment code
                and try again.
            </small>

        </div>

    `;

}



// =====================================
// ASSIGNMENT CODE INPUT
// =====================================


let lastLoadedCode = "";
let assignmentLoading = false;

async function loadAssignmentByCode() {
    const code = assignmentCodeInput.value.trim().toUpperCase();

    if (code === "") {
        lastLoadedCode = "";
        showEnterCodeMessage();
        return;
    }

    // Avoid repeated requests for the same code.
    if (code === lastLoadedCode || assignmentLoading) {
        return;
    }

    assignmentLoading = true;

    try {
        const assignment = await findAssignment(code);

        if (assignment) {
            lastLoadedCode = code;
            showAssignment(assignment);
        } else {
            lastLoadedCode = "";
            showNotFoundMessage();
        }
    } finally {
        assignmentLoading = false;
    }
}

assignmentCodeInput.addEventListener("change", loadAssignmentByCode);

assignmentCodeInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        loadAssignmentByCode();
    }
});




// =====================================
// UPDATE QUESTION COUNT
// =====================================

function updateQuestionCount(
    textarea
) {

    const index =
        textarea.dataset.questionIndex;


    const wordCountElement =
        document.getElementById(
            `wordCount-${index}`
        );


    const characterCountElement =
        document.getElementById(
            `characterCount-${index}`
        );


    const text =
        textarea.value.trim();



    // =================================
    // EMPTY
    // =================================

    if (
        text === ""
    ) {

        wordCountElement.textContent =
            "0 words";


        characterCountElement.textContent =
            "0 characters";


        return;

    }



    // =================================
    // WORD COUNT
    // =================================

    const words =
        text.split(/\s+/).length;



    // =================================
    // CHARACTER COUNT
    // =================================

    const characters =
        textarea.value.length;



    wordCountElement.textContent =
        words +
        (
            words === 1
                ? " word"
                : " words"
        );


    characterCountElement.textContent =
        characters +
        (
            characters === 1
                ? " character"
                : " characters"
        );

}



// =====================================
// GET WORD COUNT
// =====================================

function getWordCount(
    text
) {

    const cleanedText =
        String(
            text || ""
        ).trim();


    if (
        cleanedText === ""
    ) {

        return 0;

    }


    return cleanedText
        .split(/\s+/)
        .length;

}



// =====================================
// SUBMIT ASSIGNMENT
// =====================================


submissionForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const studentName = studentNameInput.value.trim();
    const studentId = studentIdInput.value.trim();
    const assignmentCode = assignmentCodeInput.value.trim().toUpperCase();

    const loggedStudent = JSON.parse(
        localStorage.getItem("veritext_current_student") || "null"
    );

    if (!loggedStudent) {
        alert("Your student session has expired. Please log in again.");
        localStorage.removeItem("veritext_student_logged_in");
        window.location.href = "student-login.html";
        return;
    }

    if (
        String(loggedStudent.studentId).toLowerCase() !==
        studentId.toLowerCase()
    ) {
        alert("Student identity does not match the logged-in account.");
        return;
    }

    if (!studentName || !studentId || !assignmentCode) {
        alert("Please enter your name, student ID, and assignment code.");
        return;
    }

    // Fetch the current assignment from MongoDB.
    const assignment = await findAssignment(assignmentCode);

    if (!assignment) {
        alert("Assignment not found. Please check the assignment code.");
        return;
    }

    const questions = getQuestions(assignment);

    if (!questions.length) {
        alert("This assignment does not contain any questions.");
        return;
    }

    const answerInputs = questionsContainer.querySelectorAll(".student-answer");

    if (answerInputs.length !== questions.length) {
        alert("Please load the assignment questions again.");
        return;
    }

    const combinedAnswers = [];

    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const answerInput = answerInputs[i];
        const answerText = answerInput.value.trim();

        const type = question.type === "code" ? "code" : "text";
        const language = type === "code" ? question.language || "" : null;

        if (!answerText) {
            alert(`Please answer Question ${i + 1}.`);
            answerInput.focus();
            return;
        }

        if (type === "text") {
            const wordCount = getWordCount(answerText);
            const minWords = 0;
            const maxWords = Number(question.maxWords ?? 10000);

            if (wordCount < minWords) {
                alert(`Question ${i + 1}: Minimum ${minWords} words required.`);
                answerInput.focus();
                return;
            }

            if (wordCount > maxWords) {
                alert(`Question ${i + 1}: Maximum ${maxWords} words allowed.`);
                answerInput.focus();
                return;
            }
        }

        if (type === "code" && !language) {
            alert(`Programming language is missing for Question ${i + 1}.`);
            return;
        }

        combinedAnswers.push(
            `Question ${i + 1} (${type === "code" ? getLanguageName(language) : "Text"}):\n` +
            `Question: ${question.question || question.text || ""}\n` +
            `Answer:\n${answerText}`
        );
    }

    if (!assignment._id) {
        alert("Assignment ID is missing. Please reload the assignment.");
        return;
    }

    // Prevent accidental double-click submissions.
    const submitButton = submissionForm.querySelector('[type="submit"]');

    if (submitButton) submitButton.disabled = true;

    try {
        const fileInput = document.getElementById("submissionFileInput");
        const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
        const studentToken = localStorage.getItem("veritext_student_token");

        let response;
        if (hasFile) {
            const formData = new FormData();
            formData.append("assignmentId", assignment._id);
            formData.append("studentName", studentName);
            formData.append("studentId", studentId);
            formData.append("content", combinedAnswers.join("\n\n"));
            formData.append("file", fileInput.files[0]);

            const headers = {};
            if (studentToken) headers["Authorization"] = `Bearer ${studentToken}`;

            response = await fetch(`${API_BASE_URL}/submissions`, {
                method: "POST",
                headers: headers,
                body: formData
            });
        } else {
            const headers = { "Content-Type": "application/json" };
            if (studentToken) headers["Authorization"] = `Bearer ${studentToken}`;

            response = await fetch(`${API_BASE_URL}/submissions`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    assignmentId: assignment._id,
                    studentName,
                    studentId,
                    content: combinedAnswers.join("\n\n")
                })
            });
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
            alert(result.message || "Submission failed. Please try again.");
            return;
        }

        // Automatically log out student upon successful submission
        localStorage.removeItem("veritext_student_logged_in");
        localStorage.removeItem("veritext_student_token");
        localStorage.removeItem("veritext_current_student");

        alert("Assignment submitted successfully! You have been logged out.");
        window.location.href = "../index.html";

    } catch (error) {
        console.error("Submission error:", error);
        alert("Could not connect to the server. Please check your backend.");
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});

// =====================================
// INITIAL STATE
// =====================================

showEnterCodeMessage();