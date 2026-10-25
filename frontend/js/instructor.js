// =====================================
// VERITEXT INSTRUCTOR DASHBOARD
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        // =====================================
        // AUTHENTICATION
        // =====================================

        function getCurrentInstructor() {

            try {

                return JSON.parse(
                    localStorage.getItem(
                        "veritext_current_user"
                    )
                );

            }

            catch (error) {

                console.error(
                    "Could not load current instructor:",
                    error
                );

                return null;

            }

        }


        const currentInstructor =
            getCurrentInstructor();


        // =====================================
        // CHECK LOGIN
        // =====================================

        if (
            !currentInstructor ||
            !currentInstructor.id
        ) {

            window.location.href =
                "login.html";

            return;

        }


        // =====================================
        // SHOW INSTRUCTOR NAME
        // =====================================

        const instructorName =
            document.getElementById(
                "instructorName"
            );


        if (instructorName) {

            instructorName.textContent =
                currentInstructor.name ||
                "Instructor";

        }



        // =====================================
        // ELEMENTS
        // =====================================

        const createModal =
            document.getElementById(
                "createModal"
            );


        const successModal =
            document.getElementById(
                "successModal"
            );


        const openCreateBtn =
            document.getElementById(
                "openCreateBtn"
            );


        const openCreateBtn2 =
            document.getElementById(
                "openCreateBtn2"
            );


        const emptyCreateBtn =
            document.getElementById(
                "emptyCreateBtn"
            );


        const closeModalBtn =
            document.getElementById(
                "closeModalBtn"
            );


        const cancelBtn =
            document.getElementById(
                "cancelBtn"
            );


        const successDoneBtn =
            document.getElementById(
                "successDoneBtn"
            );


        const assignmentForm =
            document.getElementById(
                "assignmentForm"
            );


        const assignmentList =
            document.getElementById(
                "assignmentList"
            );


        const emptyState =
            document.getElementById(
                "emptyState"
            );


        const assignmentCount =
            document.getElementById(
                "assignmentCount"
            );


        const submissionCount =
            document.getElementById(
                "submissionCount"
            );


        const flaggedCount =
            document.getElementById(
                "flaggedCount"
            );


        const generatedCode =
            document.getElementById(
                "generatedCode"
            );


        const questionCount =
            document.getElementById(
                "questionCount"
            );


        const questionsContainer =
            document.getElementById(
                "questionsContainer"
            );



        // =====================================
        // GET ALL ASSIGNMENTS
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
                    "Could not read assignments:",
                    error
                );

                return [];

            }

        }



        // =====================================
        // SAVE ALL ASSIGNMENTS
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
        // GET CURRENT INSTRUCTOR'S ASSIGNMENTS
        // =====================================

        function getMyAssignments() {

            const assignments =
                getAssignments();


            return assignments.filter(
                function (assignment) {

                    return (
                        String(
                            assignment.instructorId
                        ) ===
                        String(
                            currentInstructor.id
                        )
                    );

                }
            );

        }



        // =====================================
        // GENERATE ASSIGNMENT CODE
        // =====================================

        function generateCode() {

            const characters =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


            let code = "";


            for (
                let i = 0;
                i < 6;
                i++
            ) {

                const randomIndex =
                    Math.floor(
                        Math.random() *
                        characters.length
                    );


                code +=
                    characters[
                        randomIndex
                    ];

            }


            return "VT-" + code;

        }



        // =====================================
        // LANGUAGE NAMES
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
                "Unknown"
            );

        }



        // =====================================
        // CREATE QUESTION FIELD
        // =====================================

        function createQuestionField(
            questionNumber,
            oldQuestion = null
        ) {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "question-field";


            wrapper.style.marginTop =
                "20px";


            wrapper.style.padding =
                "20px";


            wrapper.style.border =
                "1px solid #E2E8F0";


            wrapper.style.borderRadius =
                "12px";


            wrapper.style.background =
                "#F8FAFC";



            // =================================
            // QUESTION HEADER
            // =================================

            const heading =
                document.createElement(
                    "h3"
                );


            heading.textContent =
                "Question " +
                questionNumber;


            heading.style.marginBottom =
                "16px";


            wrapper.appendChild(
                heading
            );



            // =================================
            // TYPE GROUP
            // =================================

            const typeGroup =
                document.createElement(
                    "div"
                );


            typeGroup.className =
                "form-group";


            const typeLabel =
                document.createElement(
                    "label"
                );


            typeLabel.textContent =
                "Question type";


            const typeSelect =
                document.createElement(
                    "select"
                );


            typeSelect.className =
                "question-type";


            typeSelect.innerHTML = `

                <option value="text">
                    Text-based
                </option>

                <option value="code">
                    Coding
                </option>

            `;


            typeSelect.value =
                oldQuestion &&
                oldQuestion.type === "code"
                    ? "code"
                    : "text";


            typeGroup.appendChild(
                typeLabel
            );


            typeGroup.appendChild(
                typeSelect
            );


            wrapper.appendChild(
                typeGroup
            );



            // =================================
            // LANGUAGE GROUP
            // =================================

            const languageGroup =
                document.createElement(
                    "div"
                );


            languageGroup.className =
                "form-group question-language-group";


            languageGroup.style.display =
                typeSelect.value === "code"
                    ? "block"
                    : "none";


            const languageLabel =
                document.createElement(
                    "label"
                );


            languageLabel.textContent =
                "Programming language";


            const languageSelect =
                document.createElement(
                    "select"
                );


            languageSelect.className =
                "question-language";


            languageSelect.innerHTML = `

                <option value="">
                    Select language
                </option>

                <option value="python">
                    Python
                </option>

                <option value="java">
                    Java
                </option>

                <option value="cpp">
                    C++
                </option>

                <option value="c">
                    C
                </option>

                <option value="javascript">
                    JavaScript
                </option>

            `;


            if (
                oldQuestion &&
                oldQuestion.language
            ) {

                languageSelect.value =
                    oldQuestion.language;

            }


            languageGroup.appendChild(
                languageLabel
            );


            languageGroup.appendChild(
                languageSelect
            );


            wrapper.appendChild(
                languageGroup
            );



            // =================================
            // QUESTION TEXT
            // =================================

            const questionGroup =
                document.createElement(
                    "div"
                );


            questionGroup.className =
                "form-group";


            const questionLabel =
                document.createElement(
                    "label"
                );


            questionLabel.textContent =
                "Question";


            const questionTextarea =
                document.createElement(
                    "textarea"
                );


            questionTextarea.className =
                "assignment-question-input";


            questionTextarea.rows =
                4;


            questionTextarea.placeholder =
                "Enter Question " +
                questionNumber +
                "...";


            questionTextarea.required =
                true;


            if (
                oldQuestion &&
                oldQuestion.question
            ) {

                questionTextarea.value =
                    oldQuestion.question;

            }


            questionGroup.appendChild(
                questionLabel
            );


            questionGroup.appendChild(
                questionTextarea
            );


            wrapper.appendChild(
                questionGroup
            );



            // =================================
            // TYPE CHANGE
            // =================================

            typeSelect.addEventListener(
                "change",
                function () {

                    if (
                        typeSelect.value ===
                        "code"
                    ) {

                        languageGroup.style.display =
                            "block";

                        languageSelect.required =
                            true;

                    }

                    else {

                        languageGroup.style.display =
                            "none";

                        languageSelect.required =
                            false;

                        languageSelect.value =
                            "";

                    }

                }
            );


            return wrapper;

        }



        // =====================================
        // GENERATE ALL QUESTIONS
        // =====================================

        function generateQuestionFields() {

            if (
                !questionCount ||
                !questionsContainer
            ) {

                return;

            }


            let count =
                Number(
                    questionCount.value
                );


            // Minimum

            if (
                !Number.isInteger(count) ||
                count < 1
            ) {

                count = 1;

                questionCount.value =
                    1;

            }


            // Maximum

            if (count > 100) {

                count = 100;

                questionCount.value =
                    100;

            }


            // =================================
            // SAVE OLD QUESTION VALUES
            // =================================

            const oldQuestionWrappers =
                Array.from(
                    questionsContainer
                        .querySelectorAll(
                            ".question-field"
                        )
                );


            const oldQuestions =
                oldQuestionWrappers.map(
                    function (wrapper) {

                        const typeSelect =
                            wrapper.querySelector(
                                ".question-type"
                            );


                        const languageSelect =
                            wrapper.querySelector(
                                ".question-language"
                            );


                        const questionInput =
                            wrapper.querySelector(
                                ".assignment-question-input"
                            );


                        return {

                            type:
                                typeSelect
                                    ? typeSelect.value
                                    : "text",

                            language:
                                languageSelect
                                    ? languageSelect.value
                                    : "",

                            question:
                                questionInput
                                    ? questionInput.value
                                    : ""

                        };

                    }
                );



            // =================================
            // CLEAR
            // =================================

            questionsContainer.innerHTML =
                "";



            // =================================
            // CREATE QUESTIONS
            // =================================

            for (
                let i = 1;
                i <= count;
                i++
            ) {

                const oldQuestion =
                    oldQuestions[
                        i - 1
                    ] || null;


                const questionField =
                    createQuestionField(
                        i,
                        oldQuestion
                    );


                questionsContainer.appendChild(
                    questionField
                );

            }

        }



        // =====================================
        // QUESTION COUNT EVENT
        // =====================================

        if (questionCount) {

            questionCount.addEventListener(
                "input",
                generateQuestionFields
            );

        }



        // =====================================
        // OPEN MODAL
        // =====================================

        function openCreateModal() {

            if (!createModal) {

                return;

            }


            createModal.style.display =
                "flex";

            createModal.style.visibility =
                "visible";

            createModal.style.opacity =
                "1";

            createModal.style.pointerEvents =
                "auto";


            createModal.classList.add(
                "active"
            );


            document.body.style.overflow =
                "hidden";


            generateQuestionFields();

        }



        // =====================================
        // CLOSE MODAL
        // =====================================

        function closeCreateModal() {

            if (!createModal) {

                return;

            }


            createModal.style.display =
                "none";

            createModal.style.visibility =
                "hidden";

            createModal.style.opacity =
                "0";

            createModal.style.pointerEvents =
                "none";


            createModal.classList.remove(
                "active"
            );


            document.body.style.overflow =
                "";

        }



        // =====================================
        // CLOSE SUCCESS
        // =====================================

        function closeSuccessModal() {

            if (!successModal) {

                return;

            }


            successModal.style.display =
                "none";

            successModal.style.visibility =
                "hidden";

            successModal.style.opacity =
                "0";

            successModal.style.pointerEvents =
                "none";


            successModal.classList.remove(
                "active"
            );


            document.body.style.overflow =
                "";

        }



        // =====================================
        // INITIAL MODAL STATE
        // =====================================

        closeCreateModal();

        closeSuccessModal();


        generateQuestionFields();



        // =====================================
        // CREATE BUTTONS
        // =====================================

        if (openCreateBtn) {

            openCreateBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openCreateModal();

                }
            );

        }


        if (openCreateBtn2) {

            openCreateBtn2.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openCreateModal();

                }
            );

        }


        if (emptyCreateBtn) {

            emptyCreateBtn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    openCreateModal();

                }
            );

        }



        // =====================================
        // CLOSE BUTTONS
        // =====================================

        if (closeModalBtn) {

            closeModalBtn.addEventListener(
                "click",
                closeCreateModal
            );

        }


        if (cancelBtn) {

            cancelBtn.addEventListener(
                "click",
                closeCreateModal
            );

        }


        if (successDoneBtn) {

            successDoneBtn.addEventListener(
                "click",
                closeSuccessModal
            );

        }



        // =====================================
        // CLICK OUTSIDE MODAL
        // =====================================

        if (createModal) {

            createModal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        createModal
                    ) {

                        closeCreateModal();

                    }

                }
            );

        }



        // =====================================
        // CREATE ASSIGNMENT
        // =====================================

        if (assignmentForm) {

            assignmentForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();


                    // =================================
                    // TITLE
                    // =================================

                    const title =
                        document
                            .getElementById(
                                "assignmentTitle"
                            )
                            .value
                            .trim();


                    // =================================
                    // QUESTION COUNT
                    // =================================

                    const totalQuestions =
                        Number(
                            questionCount.value
                        );


                    // =================================
                    // WORD LIMITS
                    // =================================

                    const minWords =
                        Number(
                            document
                                .getElementById(
                                    "minWords"
                                )
                                .value
                        );


                    const maxWords =
                        Number(
                            document
                                .getElementById(
                                    "maxWords"
                                )
                                .value
                        );



                    // =================================
                    // TITLE VALIDATION
                    // =================================

                    if (title === "") {

                        alert(
                            "Please enter an assignment title."
                        );

                        return;

                    }



                    // =================================
                    // QUESTION COUNT VALIDATION
                    // =================================

                    if (
                        !Number.isInteger(
                            totalQuestions
                        ) ||
                        totalQuestions < 1
                    ) {

                        alert(
                            "Please enter at least 1 question."
                        );

                        return;

                    }


                    if (
                        totalQuestions > 100
                    ) {

                        alert(
                            "You can add a maximum of 100 questions."
                        );

                        return;

                    }



                    // =================================
                    // GET QUESTION FIELDS
                    // =================================

                    const questionWrappers =
                        questionsContainer
                            .querySelectorAll(
                                ".question-field"
                            );


                    const questions =
                        [];



                    // =================================
                    // COLLECT QUESTIONS
                    // =================================

                    for (
                        let i = 0;
                        i < questionWrappers.length;
                        i++
                    ) {

                        const wrapper =
                            questionWrappers[
                                i
                            ];


                        const typeSelect =
                            wrapper.querySelector(
                                ".question-type"
                            );


                        const languageSelect =
                            wrapper.querySelector(
                                ".question-language"
                            );


                        const questionInput =
                            wrapper.querySelector(
                                ".assignment-question-input"
                            );


                        const type =
                            typeSelect
                                ? typeSelect.value
                                : "text";


                        const language =
                            languageSelect
                                ? languageSelect.value
                                : "";


                        const questionText =
                            questionInput
                                ? questionInput.value.trim()
                                : "";



                        // =========================
                        // QUESTION VALIDATION
                        // =========================

                        if (
                            questionText === ""
                        ) {

                            alert(
                                "Please enter Question " +
                                (i + 1) +
                                "."
                            );


                            if (questionInput) {

                                questionInput.focus();

                            }


                            return;

                        }



                        // =========================
                        // TYPE VALIDATION
                        // =========================

                        if (
                            type !== "text" &&
                            type !== "code"
                        ) {

                            alert(
                                "Please select a valid type for Question " +
                                (i + 1) +
                                "."
                            );

                            return;

                        }



                        // =========================
                        // LANGUAGE VALIDATION
                        // =========================

                        if (
                            type === "code" &&
                            language === ""
                        ) {

                            alert(
                                "Please select a programming language for Question " +
                                (i + 1) +
                                "."
                            );

                            return;

                        }



                        // =========================
                        // ADD QUESTION
                        // =========================

                        questions.push({

                            id:
                                i + 1,

                            type:
                                type,

                            language:
                                type === "code"
                                    ? language
                                    : null,

                            question:
                                questionText

                        });

                    }



                    // =================================
                    // QUESTION COUNT CHECK
                    // =================================

                    if (
                        questions.length !==
                        totalQuestions
                    ) {

                        alert(
                            "Please make sure all questions are filled."
                        );

                        return;

                    }



                    // =================================
                    // WORD LIMIT VALIDATION
                    // =================================

                    if (
                        minWords < 0 ||
                        maxWords < 0
                    ) {

                        alert(
                            "Limits cannot be negative."
                        );

                        return;

                    }


                    if (
                        minWords > 10000 ||
                        maxWords > 10000
                    ) {

                        alert(
                            "Limits cannot exceed 10,000."
                        );

                        return;

                    }


                    if (
                        maxWords <= 0
                    ) {

                        alert(
                            "Maximum limit must be greater than 0."
                        );

                        return;

                    }


                    if (
                        minWords >= maxWords
                    ) {

                        alert(
                            "Maximum limit must be greater than minimum limit."
                        );

                        return;

                    }



                    // =================================
                    // GET ALL ASSIGNMENTS
                    // =================================

                    const assignments =
                        getAssignments();



                    // =================================
                    // UNIQUE CODE
                    // =================================

                    let code =
                        generateCode();


                    while (
                        assignments.some(
                            function (
                                assignment
                            ) {

                                return (
                                    assignment.code ===
                                    code
                                );

                            }
                        )
                    ) {

                        code =
                            generateCode();

                    }



                    // =================================
                    // CREATE ASSIGNMENT
                    // =================================

                    const newAssignment = {

                        id:
                            Date.now(),

                        // OWNER

                        instructorId:
                            currentInstructor.id,

                        instructorName:
                            currentInstructor.name,

                        instructorEmail:
                            currentInstructor.email,


                        // ASSIGNMENT

                        code:
                            code,

                        title:
                            title,


                        // QUESTIONS

                        questions:
                            questions,

                        questionCount:
                            questions.length,


                        // GENERAL LIMITS

                        minWords:
                            minWords,

                        maxWords:
                            maxWords,


                        // DATE

                        createdAt:
                            new Date()
                                .toISOString(),


                        // SUBMISSIONS

                        submissions:
                            []

                    };



                    // =================================
                    // SAVE
                    // =================================

                    assignments.push(
                        newAssignment
                    );


                    saveAssignments(
                        assignments
                    );



                    // =================================
                    // RESET FORM
                    // =================================

                    assignmentForm.reset();


                    questionCount.value =
                        1;


                    generateQuestionFields();



                    // =================================
                    // CLOSE CREATE MODAL
                    // =================================

                    closeCreateModal();



                    // =================================
                    // SHOW CODE
                    // =================================

                    if (generatedCode) {

                        generatedCode.textContent =
                            code;

                    }


                    // =================================
                    // SUCCESS MODAL
                    // =================================

                    if (successModal) {

                        successModal.style.display =
                            "flex";

                        successModal.style.visibility =
                            "visible";

                        successModal.style.opacity =
                            "1";

                        successModal.style.pointerEvents =
                            "auto";

                        successModal.classList.add(
                            "active"
                        );

                    }


                    document.body.style.overflow =
                        "hidden";



                    // =================================
                    // REFRESH DASHBOARD
                    // =================================

                    renderAssignments();

                    updateStats();

                }
            );

        }



        // =====================================
        // RENDER ASSIGNMENTS
        // =====================================

        function renderAssignments() {

            if (!assignmentList) {

                return;

            }


            const assignments =
                getMyAssignments();


            assignmentList.innerHTML =
                "";



            // =================================
            // EMPTY STATE
            // =================================

            if (
                assignments.length === 0
            ) {

                if (emptyState) {

                    emptyState.style.display =
                        "flex";

                }

                return;

            }



            // =================================
            // HIDE EMPTY STATE
            // =================================

            if (emptyState) {

                emptyState.style.display =
                    "none";

            }



            // =================================
            // CARDS
            // =================================

            assignments.forEach(
                function (assignment) {


                    // Safety

                    if (
                        !Array.isArray(
                            assignment.submissions
                        )
                    ) {

                        assignment.submissions =
                            [];

                    }



                    // =================================
                    // QUESTIONS
                    // =================================

                    let questions =
                        [];


                    if (
                        Array.isArray(
                            assignment.questions
                        )
                    ) {

                        questions =
                            assignment.questions;

                    }

                    else if (
                        assignment.question
                    ) {

                        questions = [

                            {

                                id: 1,

                                type:
                                    assignment.type ||
                                    "text",

                                language:
                                    assignment.language ||
                                    null,

                                question:
                                    assignment.question

                            }

                        ];

                    }



                    // =================================
                    // COUNT QUESTION TYPES
                    // =================================

                    let textQuestions =
                        0;


                    let codingQuestions =
                        0;


                    questions.forEach(
                        function (question) {

                            if (
                                question.type ===
                                "code"
                            ) {

                                codingQuestions++;

                            }

                            else {

                                textQuestions++;

                            }

                        }
                    );



                    // =================================
                    // CREATE CARD
                    // =================================

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "assignment-card";


                    card.innerHTML = `

                        <div class="assignment-info">

                            <h3>
                                ${escapeHTML(
                                    assignment.title
                                )}
                            </h3>


                            <div class="assignment-meta">

                                <span class="assignment-code">
                                    ${escapeHTML(
                                        assignment.code
                                    )}
                                </span>


                                <span>
                                    ${questions.length}
                                    ${
                                        questions.length === 1
                                            ? " question"
                                            : " questions"
                                    }
                                </span>


                                ${
                                    textQuestions > 0
                                        ? `
                                            <span>
                                                ${textQuestions} text
                                            </span>
                                          `
                                        : ""
                                }


                                ${
                                    codingQuestions > 0
                                        ? `
                                            <span>
                                                ${codingQuestions} coding
                                            </span>
                                          `
                                        : ""
                                }


                                <span>
                                    ${assignment.submissions.length}
                                    submissions
                                </span>

                            </div>

                        </div>


                        <div class="assignment-actions">

                            <button
                                type="button"
                                class="view-report-btn"
                            >
                                View Report →
                            </button>


                            <button
                                type="button"
                                class="delete-assignment-btn"
                            >
                                Delete
                            </button>

                        </div>

                    `;



                    // =================================
                    // VIEW REPORT
                    // =================================

                    const viewButton =
                        card.querySelector(
                            ".view-report-btn"
                        );


                    if (viewButton) {

                        viewButton.addEventListener(
                            "click",
                            function () {

                                viewReport(
                                    assignment.code
                                );

                            }
                        );

                    }



                    // =================================
                    // DELETE
                    // =================================

                    const deleteButton =
                        card.querySelector(
                            ".delete-assignment-btn"
                        );


                    if (deleteButton) {

                        deleteButton.addEventListener(
                            "click",
                            function () {

                                deleteAssignment(
                                    assignment.code
                                );

                            }
                        );

                    }



                    assignmentList.appendChild(
                        card
                    );

                }
            );

        }



        // =====================================
        // ESCAPE HTML
        // =====================================

        function escapeHTML(
            value
        ) {

            return String(value)
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );

        }



        // =====================================
        // UPDATE DASHBOARD STATS
        // =====================================

        function updateStats() {

            const assignments =
                getMyAssignments();


            // =================================
            // ASSIGNMENT COUNT
            // =================================

            if (assignmentCount) {

                assignmentCount.textContent =
                    assignments.length;

            }


            let totalSubmissions =
                0;


            let totalFlagged =
                0;



            // =================================
            // LOOP ASSIGNMENTS
            // =================================

            assignments.forEach(
                function (assignment) {


                    if (
                        !Array.isArray(
                            assignment.submissions
                        )
                    ) {

                        assignment.submissions =
                            [];

                    }


                    totalSubmissions +=
                        assignment.submissions.length;



                    // =================================
                    // SIMILARITY
                    // =================================

                    if (
                        assignment.submissions.length >= 2 &&
                        typeof compareAllSubmissions ===
                        "function"
                    ) {

                        const results =
                            compareAllSubmissions(
                                assignment.submissions
                            );


                        results.forEach(
                            function (result) {

                                if (
                                    result.percentage >=
                                    80
                                ) {

                                    totalFlagged++;

                                }

                            }
                        );

                    }

                }
            );



            // =================================
            // DISPLAY
            // =================================

            if (submissionCount) {

                submissionCount.textContent =
                    totalSubmissions;

            }


            if (flaggedCount) {

                flaggedCount.textContent =
                    totalFlagged;

            }

        }



        // =====================================
        // VIEW REPORT
        // =====================================

        function viewReport(
            code
        ) {

            const assignments =
                getMyAssignments();


            const assignment =
                assignments.find(
                    function (item) {

                        return (
                            item.code ===
                            code
                        );

                    }
                );


            // =================================
            // OWNERSHIP CHECK
            // =================================

            if (!assignment) {

                alert(
                    "You are not authorized to view this assignment."
                );

                return;

            }


            window.location.href =
                "report.html?code=" +
                encodeURIComponent(
                    code
                );

        }



        // =====================================
        // DELETE ASSIGNMENT
        // =====================================

        function deleteAssignment(
            code
        ) {

            const assignments =
                getAssignments();


            const assignment =
                assignments.find(
                    function (item) {

                        return (
                            item.code ===
                            code &&
                            String(
                                item.instructorId
                            ) ===
                            String(
                                currentInstructor.id
                            )
                        );

                    }
                );


            // =================================
            // OWNERSHIP CHECK
            // =================================

            if (!assignment) {

                alert(
                    "You are not authorized to delete this assignment."
                );

                return;

            }



            // =================================
            // CONFIRM
            // =================================

            const confirmed =
                confirm(
                    `Are you sure you want to delete "${assignment.title}"?\n\n` +
                    `This will also remove all student submissions for this assignment.`
                );


            if (!confirmed) {

                return;

            }



            // =================================
            // REMOVE ONLY OWN ASSIGNMENT
            // =================================

            const updatedAssignments =
                assignments.filter(
                    function (item) {

                        return !(
                            item.code ===
                            code &&

                            String(
                                item.instructorId
                            ) ===
                            String(
                                currentInstructor.id
                            )
                        );

                    }
                );



            // =================================
            // SAVE
            // =================================

            saveAssignments(
                updatedAssignments
            );


            renderAssignments();

            updateStats();

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


                    localStorage.removeItem(
                        "veritext_logged_in"
                    );


                    localStorage.removeItem(
                        "veritext_current_user"
                    );


                    localStorage.removeItem(
                        "veritext_current_instructor"
                    );


                    window.location.href =
                        "login.html";

                }
            );

        }



        // =====================================
        // INITIAL LOAD
        // =====================================

        renderAssignments();

        updateStats();


    }
);