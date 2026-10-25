// =====================================
// VERITEXT STUDENT SUBMISSION
// =====================================


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
                "veritext_current_student"
            );


            window.location.href =
                "student-login.html";

        }
    );

}



// =====================================
// GET ASSIGNMENTS
// =====================================

function getAssignments() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "veritext_assignments"
            )
        ) || [];

    }

    catch (error) {

        console.error(
            "Could not load assignments:",
            error
        );

        return [];

    }

}



// =====================================
// SAVE ASSIGNMENTS
// =====================================

function saveAssignments(
    assignments
) {

    localStorage.setItem(
        "veritext_assignments",
        JSON.stringify(
            assignments
        )
    );

}



// =====================================
// FIND ASSIGNMENT
// =====================================

function findAssignment(
    code
) {

    const assignments =
        getAssignments();


    return assignments.find(
        function (assignment) {

            return (
                String(
                    assignment.code
                ).toLowerCase() ===
                String(
                    code
                ).toLowerCase()
            );

        }
    );

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

assignmentCodeInput.addEventListener(
    "input",
    function () {

        const code =
            assignmentCodeInput.value.trim();


        // =================================
        // EMPTY
        // =================================

        if (code === "") {

            showEnterCodeMessage();

            return;

        }



        // =================================
        // FIND
        // =================================

        const assignment =
            findAssignment(
                code
            );



        // =================================
        // FOUND
        // =================================

        if (assignment) {

            showAssignment(
                assignment
            );

        }



        // =================================
        // NOT FOUND
        // =================================

        else {

            showNotFoundMessage();

        }

    }
);



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

submissionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();



        // =================================
        // STUDENT DETAILS
        // =================================

        const studentName =
            studentNameInput.value.trim();


        const studentId =
            studentIdInput.value.trim();


        const assignmentCode =
            assignmentCodeInput.value.trim();



        // =================================
        // CURRENT STUDENT
        // =================================

        const loggedStudent =
            JSON.parse(
                localStorage.getItem(
                    "veritext_current_student"
                )
            );


        if (!loggedStudent) {

            alert(
                "Your student session has expired. Please log in again."
            );


            localStorage.removeItem(
                "veritext_student_logged_in"
            );


            window.location.href =
                "student-login.html";


            return;

        }



        // =================================
        // IDENTITY CHECK
        // =================================

        if (
            String(
                loggedStudent.studentId
            ).toLowerCase() !==
            String(
                studentId
            ).toLowerCase()
        ) {

            alert(
                "Student identity does not match the logged-in account."
            );


            return;

        }



        // =================================
        // BASIC VALIDATION
        // =================================

        if (
            studentName === ""
        ) {

            alert(
                "Please enter your full name."
            );


            return;

        }


        if (
            studentId === ""
        ) {

            alert(
                "Please enter your student ID."
            );


            return;

        }


        if (
            assignmentCode === ""
        ) {

            alert(
                "Please enter the assignment code."
            );


            return;

        }



        // =================================
        // GET ASSIGNMENTS
        // =================================

        const assignments =
            getAssignments();



        // =================================
        // FIND ASSIGNMENT
        // =================================

        const assignmentIndex =
            assignments.findIndex(
                function (assignment) {

                    return (
                        String(
                            assignment.code
                        ).toLowerCase() ===
                        String(
                            assignmentCode
                        ).toLowerCase()
                    );

                }
            );


        if (
            assignmentIndex === -1
        ) {

            alert(
                "Assignment not found. Please check the code."
            );


            return;

        }



        // =================================
        // ASSIGNMENT
        // =================================

        const assignment =
            assignments[
                assignmentIndex
            ];



        // =================================
        // QUESTIONS
        // =================================

        const questions =
            getQuestions(
                assignment
            );


        if (
            questions.length === 0
        ) {

            alert(
                "This assignment does not contain any questions."
            );


            return;

        }



        // =================================
        // SUBMISSIONS ARRAY
        // =================================

        if (
            !Array.isArray(
                assignment.submissions
            )
        ) {

            assignment.submissions =
                [];

        }



        // =================================
        // DUPLICATE SUBMISSION
        // =================================

        const alreadySubmitted =
            assignment.submissions.some(
                function (submission) {

                    return (
                        String(
                            submission.studentId
                        ).toLowerCase() ===
                        String(
                            studentId
                        ).toLowerCase()
                    );

                }
            );


        if (
            alreadySubmitted
        ) {

            alert(
                "You have already submitted this assignment."
            );


            return;

        }



        // =================================
        // ANSWER BOXES
        // =================================

        const answerInputs =
            questionsContainer.querySelectorAll(
                ".student-answer"
            );


        if (
            answerInputs.length !==
            questions.length
        ) {

            alert(
                "Please enter the assignment code again so all questions can be loaded."
            );


            return;

        }



        // =================================
        // STORE ANSWERS
        // =================================

        const answers =
            [];


        const combinedAnswers =
            [];



        // =================================
        // VALIDATE EACH QUESTION
        // =================================

        for (
            let i = 0;
            i < questions.length;
            i++
        ) {

            const question =
                questions[i];


            const answerInput =
                answerInputs[i];


            const answerText =
                answerInput.value.trim();


            const type =
                question.type === "code"
                    ? "code"
                    : "text";


            const language =
                type === "code"
                    ? question.language || ""
                    : null;



            // =================================
            // EMPTY ANSWER
            // =================================

            if (
                answerText === ""
            ) {

                alert(
                    `Please answer Question ${i + 1}.`
                );


                answerInput.focus();


                return;

            }



            // =================================
            // TEXT WORD LIMIT
            // =================================

            if (
                type === "text"
            ) {

                const totalWords =
                    getWordCount(
                        answerText
                    );


                const minWords =
                    Number(
                        question.minWords ??
                        assignment.minWords ??
                        0
                    );


                const maxWords =
                    Number(
                        question.maxWords ??
                        assignment.maxWords ??
                        10000
                    );


                if (
                    totalWords <
                    minWords
                ) {

                    alert(
                        `Question ${i + 1}: Your answer contains ${totalWords} words.\n\n` +
                        `Minimum required: ${minWords} words.`
                    );


                    answerInput.focus();


                    return;

                }


                if (
                    totalWords >
                    maxWords
                ) {

                    alert(
                        `Question ${i + 1}: Your answer contains ${totalWords} words.\n\n` +
                        `Maximum allowed: ${maxWords} words.`
                    );


                    answerInput.focus();


                    return;

                }

            }



            // =================================
            // CODE QUESTION
            // =================================

            if (
                type === "code" &&
                language === ""
            ) {

                alert(
                    `Programming language is missing for Question ${i + 1}.`
                );


                return;

            }



            // =================================
            // WORD COUNT
            // =================================

            const wordCount =
                getWordCount(
                    answerText
                );



            // =================================
            // SAVE ANSWER
            // =================================

            answers.push({

                questionId:
                    question.id ??
                    i + 1,

                questionNumber:
                    i + 1,

                type:
                    type,

                language:
                    language,

                question:
                    question.question ||
                    question.text ||
                    "",

                answer:
                    answerText,

                wordCount:
                    wordCount,

                characterCount:
                    answerText.length

            });



            // =================================
            // COMBINED ANSWER
            // =================================

            combinedAnswers.push(

                `Question ${i + 1} ` +
                `(${type === "code"
                    ? getLanguageName(language)
                    : "Text"}):\n` +

                `Question: ` +

                (
                    question.question ||
                    question.text ||
                    ""
                ) +

                `\nAnswer:\n` +

                answerText

            );

        }



        // =====================================
        // CREATE SUBMISSION
        // =====================================

        const submission = {

            id:
                Date.now(),


            studentName:
                studentName,


            studentId:
                studentId,


            studentEmail:
                loggedStudent.email || "",


            assignmentCode:
                assignment.code,


            // =================================
            // QUESTION-BY-QUESTION ANSWERS
            // =================================

            answers:
                answers,


            // =================================
            // COMPATIBILITY ANSWER
            // =================================

            answer:
                combinedAnswers.join(
                    "\n\n"
                ),


            // =================================
            // TOTAL WORD COUNT
            // =================================

            wordCount:
                answers.reduce(
                    function (
                        total,
                        item
                    ) {

                        return (
                            total +
                            item.wordCount
                        );

                    },
                    0
                ),


            // =================================
            // SUBMISSION TIME
            // =================================

            submittedAt:
                new Date().toISOString()

        };



        // =====================================
        // ADD SUBMISSION
        // =====================================

        assignment.submissions.push(
            submission
        );



        // =====================================
        // UPDATE ASSIGNMENT
        // =====================================

        assignments[
            assignmentIndex
        ] =
            assignment;



        // =====================================
        // SAVE
        // =====================================

        saveAssignments(
            assignments
        );



        // =====================================
        // SUCCESS
        // =====================================

        alert(
            "Assignment submitted successfully!"
        );



        // =====================================
        // GO HOME
        // =====================================

        window.location.href =
            "index.html";

    }
);



// =====================================
// INITIAL STATE
// =====================================

showEnterCodeMessage();