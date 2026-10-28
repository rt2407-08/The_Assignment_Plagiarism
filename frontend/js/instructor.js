// =====================================
// VERITEXT INSTRUCTOR DASHBOARD (MONGODB)
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const API_BASE_URL =
            (typeof window !== "undefined" && window.localStorage && localStorage.getItem("veritext_api_url")) ||
            (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:")
                ? "http://127.0.0.1:5000/api"
                : "https://veritext-backend-oe56.onrender.com/api");

        // =====================================
        // AUTHENTICATION
        // =====================================

        function getCurrentInstructor() {
            try {
                const stored = localStorage.getItem("veritext_current_user");
                if (!stored) return null;

                const user = JSON.parse(stored);
                if (!user) return null;

                if (!user.id && user._id) {
                    user.id = user._id;
                }

                return user;
            } catch (error) {
                console.error("Could not load current instructor:", error);
                return null;
            }
        }

        const currentInstructor = getCurrentInstructor();

        if (
            !currentInstructor ||
            !(currentInstructor.id || currentInstructor._id)
        ) {
            window.location.href = "login.html";
            return;
        }

        const currentInstructorId =
            String(currentInstructor.id || currentInstructor._id);
        const currentInstructorEmail =
            (currentInstructor.email || "").trim().toLowerCase();

        // =====================================
        // SHOW INSTRUCTOR NAME
        // =====================================

        const instructorName =
            document.getElementById("instructorName");

        if (instructorName) {
            instructorName.textContent =
                currentInstructor.name || "Instructor";
        }

        // =====================================
        // ELEMENTS
        // =====================================

        const createModal =
            document.getElementById("createModal");

        const successModal =
            document.getElementById("successModal");

        const openCreateBtn =
            document.getElementById("openCreateBtn");

        const openCreateBtn2 =
            document.getElementById("openCreateBtn2");

        const emptyCreateBtn =
            document.getElementById("emptyCreateBtn");

        const closeModalBtn =
            document.getElementById("closeModalBtn");

        const cancelBtn =
            document.getElementById("cancelBtn");

        const successDoneBtn =
            document.getElementById("successDoneBtn");

        const assignmentForm =
            document.getElementById("assignmentForm");

        const assignmentList =
            document.getElementById("assignmentList");

        const emptyState =
            document.getElementById("emptyState");

        const assignmentCount =
            document.getElementById("assignmentCount");

        const submissionCount =
            document.getElementById("submissionCount");

        const flaggedCount =
            document.getElementById("flaggedCount");

        const avgSimilarityCount =
            document.getElementById("avgSimilarityCount");

        const generatedCode =
            document.getElementById("generatedCode");

        const questionCount =
            document.getElementById("questionCount");

        const questionsContainer =
            document.getElementById("questionsContainer");

        // State
        let loadedAssignments = [];

        // =====================================
        // PARSE SUBMISSION HELPER
        // =====================================

        function prepareSubmission(submission, questions = []) {
            if (Array.isArray(submission.answers)) {
                return submission;
            }

            const content = submission.content || "";
            const blocks = content.split(/(?=Question\s+\d+\s*\([^)]*\)\s*:)/i);

            const answers = blocks
                .map((block) => {
                    const headingMatch = block.match(
                        /Question\s+(\d+)\s*\(([^)]*)\)\s*:/i
                    );
                    if (!headingMatch) return null;

                    const questionNumber = Number(headingMatch[1]);
                    const headingType = headingMatch[2].trim().toLowerCase();

                    const questionTextMatch = block.match(
                        /Question:\s*([\s\S]*?)(?=\nAnswer:)/i
                    );
                    const answerMatch = block.match(
                        /Answer:\s*([\s\S]*)/i
                    );

                    const questionInfo =
                        questions.find((q, i) =>
                            Number(q.questionNumber ?? q.number ?? i + 1) === questionNumber
                        ) || questions[questionNumber - 1] || {};

                    return {
                        questionNumber,
                        questionId: questionInfo._id || questionNumber,
                        question:
                            questionTextMatch?.[1]?.trim() ||
                            questionInfo.question ||
                            questionInfo.text ||
                            `Question ${questionNumber}`,
                        answer: answerMatch?.[1]?.trim() || "",
                        type: questionInfo.type ||
                            (headingType.includes("python") ||
                             headingType.includes("code") ? "code" : "text"),
                        language: questionInfo.language || "Python"
                    };
                })
                .filter(Boolean);

            return {
                ...submission,
                answers
            };
        }

        // =====================================
        // GENERATE ASSIGNMENT CODE
        // =====================================

        function generateCode() {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let code = "";
            for (let i = 0; i < 6; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                code += characters[randomIndex];
            }
            return "VT-" + code;
        }

        // =====================================
        // CREATE QUESTION FIELD
        // =====================================

        function createQuestionField(questionNumber, oldQuestion = null) {
            const wrapper = document.createElement("div");
            wrapper.className = "question-field";
            wrapper.dataset.index = questionNumber;

            const heading = document.createElement("h4");
            heading.textContent = "Question " + questionNumber;
            heading.style.marginTop = "0";
            heading.style.marginBottom = "16px";
            wrapper.appendChild(heading);

            // Type
            const typeGroup = document.createElement("div");
            typeGroup.className = "form-group";

            const typeLabel = document.createElement("label");
            typeLabel.textContent = "Question type";

            const typeSelect = document.createElement("select");
            typeSelect.className = "question-type";
            typeSelect.innerHTML = `
                <option value="text">Text-based</option>
                <option value="code">Coding</option>
            `;
            typeSelect.value =
                oldQuestion && oldQuestion.type === "code" ? "code" : "text";

            typeGroup.appendChild(typeLabel);
            typeGroup.appendChild(typeSelect);
            wrapper.appendChild(typeGroup);

            // Language
            const languageGroup = document.createElement("div");
            languageGroup.className = "form-group question-language-group";
            languageGroup.style.display =
                typeSelect.value === "code" ? "block" : "none";

            const languageLabel = document.createElement("label");
            languageLabel.textContent = "Programming language";

            const languageSelect = document.createElement("select");
            languageSelect.className = "question-language";
            languageSelect.innerHTML = `
                <option value="">Select language</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="javascript">JavaScript</option>
            `;
            if (oldQuestion && oldQuestion.language) {
                languageSelect.value = oldQuestion.language;
            }

            languageGroup.appendChild(languageLabel);
            languageGroup.appendChild(languageSelect);
            wrapper.appendChild(languageGroup);

            // Question text
            const questionGroup = document.createElement("div");
            questionGroup.className = "form-group";

            const questionLabel = document.createElement("label");
            questionLabel.textContent = "Question";

            const questionTextarea = document.createElement("textarea");
            questionTextarea.className = "assignment-question-input";
            questionTextarea.rows = 4;
            questionTextarea.placeholder =
                "Enter Question " + questionNumber + "...";
            questionTextarea.required = true;

            if (oldQuestion && oldQuestion.question) {
                questionTextarea.value = oldQuestion.question;
            }

            questionGroup.appendChild(questionLabel);
            questionGroup.appendChild(questionTextarea);
            wrapper.appendChild(questionGroup);

            // Change event
            typeSelect.addEventListener("change", function () {
                if (typeSelect.value === "code") {
                    languageGroup.style.display = "block";
                    languageSelect.required = true;
                } else {
                    languageGroup.style.display = "none";
                    languageSelect.required = false;
                    languageSelect.value = "";
                }
            });

            return wrapper;
        }

        // =====================================
        // GENERATE QUESTION FIELDS
        // =====================================

        function generateQuestionFields() {
            if (!questionCount || !questionsContainer) return;

            let count = Number(questionCount.value);
            if (!Number.isInteger(count) || count < 1) {
                count = 1;
                questionCount.value = 1;
            }
            if (count > 100) {
                count = 100;
                questionCount.value = 100;
            }

            const oldQuestionWrappers = Array.from(
                questionsContainer.querySelectorAll(".question-field")
            );

            const oldQuestions = oldQuestionWrappers.map(function (wrapper) {
                const typeSelect = wrapper.querySelector(".question-type");
                const languageSelect = wrapper.querySelector(".question-language");
                const questionInput = wrapper.querySelector(".assignment-question-input");

                return {
                    type: typeSelect ? typeSelect.value : "text",
                    language: languageSelect ? languageSelect.value : "",
                    question: questionInput ? questionInput.value : ""
                };
            });

            questionsContainer.innerHTML = "";

            for (let i = 1; i <= count; i++) {
                const oldQuestion = oldQuestions[i - 1] || null;
                const questionField = createQuestionField(i, oldQuestion);
                questionsContainer.appendChild(questionField);
            }
        }

        if (questionCount) {
            questionCount.addEventListener("input", generateQuestionFields);
        }

        // =====================================
        // MODALS
        // =====================================

        function openCreateModal() {
            if (!createModal) return;

            createModal.style.display = "flex";
            createModal.style.visibility = "visible";
            createModal.style.opacity = "1";
            createModal.style.pointerEvents = "auto";
            createModal.classList.add("active");
            document.body.style.overflow = "hidden";

            generateQuestionFields();
        }

        function closeCreateModal() {
            if (!createModal) return;

            createModal.style.display = "none";
            createModal.style.visibility = "hidden";
            createModal.style.opacity = "0";
            createModal.style.pointerEvents = "none";
            createModal.classList.remove("active");
            document.body.style.overflow = "";
        }

        function closeSuccessModal() {
            if (!successModal) return;

            successModal.style.display = "none";
            successModal.style.visibility = "hidden";
            successModal.style.opacity = "0";
            successModal.style.pointerEvents = "none";
            successModal.classList.remove("active");
            document.body.style.overflow = "";
        }

        closeCreateModal();
        closeSuccessModal();
        generateQuestionFields();

        if (openCreateBtn) openCreateBtn.addEventListener("click", openCreateModal);
        if (openCreateBtn2) openCreateBtn2.addEventListener("click", openCreateModal);
        if (emptyCreateBtn) emptyCreateBtn.addEventListener("click", openCreateModal);
        if (closeModalBtn) closeModalBtn.addEventListener("click", closeCreateModal);
        if (cancelBtn) cancelBtn.addEventListener("click", closeCreateModal);
        if (successDoneBtn) successDoneBtn.addEventListener("click", closeSuccessModal);

        if (createModal) {
            createModal.addEventListener("click", function (event) {
                if (event.target === createModal) {
                    closeCreateModal();
                }
            });
        }

        // =====================================
        // FETCH ASSIGNMENTS & SUBMISSIONS (MONGODB)
        // =====================================

        async function fetchAssignments() {
            try {
                const params = new URLSearchParams();
                if (currentInstructorId && currentInstructorId !== "undefined") {
                    params.append("instructorId", currentInstructorId);
                }
                if (currentInstructorEmail) {
                    params.append("instructorEmail", currentInstructorEmail);
                }
                const queryString = params.toString() ? `?${params.toString()}` : "";

                const [assignmentsRes, submissionsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/assignments${queryString}`),
                    fetch(`${API_BASE_URL}/submissions`)
                ]);

                const assignmentsData = await assignmentsRes.json();
                const submissionsData = await submissionsRes.json();

                const rawAssignments =
                    assignmentsData.assignments || (Array.isArray(assignmentsData) ? assignmentsData : []);
                const rawSubmissions =
                    submissionsData.submissions || (Array.isArray(submissionsData) ? submissionsData : []);

                // Filter assignments strictly for current instructor
                const filtered = rawAssignments.filter((a) => {
                    const assignInstructorId = String(
                        a.instructorId?._id || a.instructorId || ""
                    );
                    const idMatch =
                        assignInstructorId &&
                        assignInstructorId === currentInstructorId;

                    const assignEmail = (a.instructorEmail || "").trim().toLowerCase();
                    const emailMatch =
                        assignEmail &&
                        currentInstructorEmail &&
                        assignEmail === currentInstructorEmail;

                    return Boolean(idMatch || emailMatch);
                });

                // Associate submissions with each assignment
                loadedAssignments = filtered.map((assignment) => {
                    const code =
                        assignment.assignmentCode || assignment.code || "";
                    const idStr = String(assignment._id || assignment.id || "");

                    const matchedSubmissions = rawSubmissions.filter((sub) => {
                        const subAssignId = String(
                            sub.assignmentId?._id || sub.assignmentId || ""
                        );
                        return subAssignId === idStr;
                    });

                    return {
                        ...assignment,
                        code: code,
                        assignmentCode: code,
                        submissions: matchedSubmissions
                    };
                });

                renderAssignments();
                updateStats();
            } catch (error) {
                console.error("Failed to load assignments from MongoDB:", error);
                loadedAssignments = [];
                renderAssignments();
                updateStats();
            }
        }

        // =====================================
        // ESCAPE HTML
        // =====================================

        function escapeHTML(value) {
            return String(value ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        // =====================================
        // RENDER ASSIGNMENTS
        // =====================================

        function renderAssignments() {
            if (!assignmentList) return;

            assignmentList.innerHTML = "";

            if (!loadedAssignments || loadedAssignments.length === 0) {
                if (emptyState) {
                    emptyState.style.display = "flex";
                }
                return;
            }

            if (emptyState) {
                emptyState.style.display = "none";
            }

            loadedAssignments.forEach(function (assignment) {
                const questions = Array.isArray(assignment.questions)
                    ? assignment.questions
                    : [];

                let textCount = 0;
                let codeCount = 0;

                questions.forEach(function (q) {
                    if (q.type === "code") {
                        codeCount++;
                    } else {
                        textCount++;
                    }
                });

                const submissions = Array.isArray(assignment.submissions)
                    ? assignment.submissions
                    : [];

                const card = document.createElement("div");
                card.className = "assignment-card";

                const code = assignment.code || assignment.assignmentCode || "VT-XXXXXX";

                card.innerHTML = `
                    <div class="assignment-info">
                        <h3>${escapeHTML(assignment.title || "Untitled Assignment")}</h3>
                        <div class="assignment-meta">
                            <span class="assignment-code" title="Click to copy code" style="cursor: pointer;">
                                ${escapeHTML(code)} 📋
                            </span>
                            <span>
                                ${questions.length} ${questions.length === 1 ? "question" : "questions"}
                            </span>
                            ${textCount > 0 ? `<span>${textCount} text</span>` : ""}
                            ${codeCount > 0 ? `<span>${codeCount} coding</span>` : ""}
                            <span>${submissions.length} submissions</span>
                        </div>
                    </div>
                    <div class="assignment-actions">
                        <button type="button" class="primary-btn view-report-btn" style="padding: 9px 18px; font-size: 13px; font-weight: 700; border-radius: 8px;">
                            Similarity Report →
                        </button>
                        <button type="button" class="delete-assignment-btn">
                            Delete
                        </button>
                    </div>
                `;

                // Copy code on click
                const codeSpan = card.querySelector(".assignment-code");
                if (codeSpan) {
                    codeSpan.addEventListener("click", function () {
                        navigator.clipboard.writeText(code).then(() => {
                            const originalText = codeSpan.innerHTML;
                            codeSpan.innerHTML = `${escapeHTML(code)} ✓ Copied!`;
                            setTimeout(() => {
                                codeSpan.innerHTML = originalText;
                            }, 1500);
                        }).catch(() => {
                            prompt("Assignment code:", code);
                        });
                    });
                }

                // Open dedicated similarity report page
                const viewBtn = card.querySelector(".view-report-btn");
                if (viewBtn) {
                    viewBtn.addEventListener("click", function () {
                        window.location.href =
                            "report.html?code=" + encodeURIComponent(code);
                    });
                }

                // Delete
                const deleteBtn = card.querySelector(".delete-assignment-btn");
                if (deleteBtn) {
                    deleteBtn.addEventListener("click", function () {
                        deleteAssignment(assignment._id || code, assignment.title);
                    });
                }

                assignmentList.appendChild(card);
            });
        }

        // =====================================
        // UPDATE DASHBOARD STATS
        // =====================================

        function updateStats() {
            if (assignmentCount) {
                assignmentCount.textContent = loadedAssignments.length;
            }

            let totalSubmissions = 0;
            let totalFlagged = 0;
            let allPairs = [];

            loadedAssignments.forEach(function (assignment) {
                const subs = assignment.submissions || [];
                totalSubmissions += subs.length;

                if (subs.length >= 2 && typeof compareAllSubmissions === "function") {
                    try {
                        const preparedSubs = subs.map((s, index) => {
                            const prep = prepareSubmission(s, assignment.questions || []);
                            return {
                                ...prep,
                                submissionIndex: index
                            };
                        });

                        const results = compareAllSubmissions(preparedSubs);

                        results.forEach(function (res) {
                            const percentage = Number.isFinite(Number(res.percentage))
                                ? Number(res.percentage)
                                : Math.round(Number(res.similarity || 0) * 100);

                            if (percentage >= 60) {
                                totalFlagged++;
                            }
                            allPairs.push(percentage);
                        });
                    } catch (e) {
                        console.error("Similarity calculation error for assignment:", assignment.title, e);
                    }
                }
            });

            if (submissionCount) {
                submissionCount.textContent = totalSubmissions;
            }

            if (flaggedCount) {
                flaggedCount.textContent = totalFlagged;
            }

            if (avgSimilarityCount) {
                if (allPairs.length > 0) {
                    const avg = Math.round(
                        allPairs.reduce((sum, p) => sum + p, 0) / allPairs.length
                    );
                    avgSimilarityCount.textContent = avg + "%";
                } else {
                    avgSimilarityCount.textContent = "0%";
                }
            }
        }

        // =====================================
        // CREATE ASSIGNMENT (POST TO MONGODB)
        // =====================================

        if (assignmentForm) {
            assignmentForm.addEventListener("submit", async function (event) {
                event.preventDefault();

                const titleInput = document.getElementById("assignmentTitle");
                const minWordsInput = document.getElementById("minWords");
                const maxWordsInput = document.getElementById("maxWords");

                const title = titleInput ? titleInput.value.trim() : "";
                const totalQuestions = Number(questionCount.value);
                const minWords = minWordsInput ? Number(minWordsInput.value) : 0;
                const maxWords = maxWordsInput ? Number(maxWordsInput.value) : 1000;

                if (!title) {
                    alert("Please enter an assignment title.");
                    return;
                }

                if (!Number.isInteger(totalQuestions) || totalQuestions < 1) {
                    alert("Please enter at least 1 question.");
                    return;
                }

                const questionWrappers = questionsContainer.querySelectorAll(".question-field");
                const questions = [];

                for (let i = 0; i < questionWrappers.length; i++) {
                    const wrapper = questionWrappers[i];
                    const typeSelect = wrapper.querySelector(".question-type");
                    const languageSelect = wrapper.querySelector(".question-language");
                    const questionInput = wrapper.querySelector(".assignment-question-input");

                    const type = typeSelect ? typeSelect.value : "text";
                    const language = languageSelect ? languageSelect.value : "";
                    const questionText = questionInput ? questionInput.value.trim() : "";

                    if (!questionText) {
                        alert("Please enter Question " + (i + 1) + ".");
                        if (questionInput) questionInput.focus();
                        return;
                    }

                    if (type === "code" && !language) {
                        alert("Please select a programming language for Question " + (i + 1) + ".");
                        return;
                    }

                    questions.push({
                        id: i + 1,
                        type: type,
                        language: type === "code" ? language : null,
                        question: questionText,
                        minWords: minWords,
                        maxWords: maxWords
                    });
                }

                if (questions.length !== totalQuestions) {
                    alert("Please make sure all questions are filled.");
                    return;
                }

                if (minWords < 0 || maxWords < 0) {
                    alert("Limits cannot be negative.");
                    return;
                }

                if (maxWords <= 0) {
                    alert("Maximum limit must be greater than 0.");
                    return;
                }

                if (minWords >= maxWords) {
                    alert("Maximum limit must be greater than minimum limit.");
                    return;
                }

                const code = generateCode();

                const submitBtn = assignmentForm.querySelector('[type="submit"]');
                if (submitBtn) submitBtn.disabled = true;

                try {
                    const payload = {
                        title: title,
                        assignmentCode: code,
                        questions: questions,
                        minWords: minWords,
                        maxWords: maxWords,
                        instructorId: currentInstructorId,
                        instructorName: currentInstructor.name || "Instructor",
                        instructorEmail: currentInstructorEmail || (currentInstructor.email || "").trim().toLowerCase(),
                        similarityThreshold: 30
                    };

                    const response = await fetch(`${API_BASE_URL}/assignments`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        alert(data.message || "Failed to create assignment.");
                        return;
                    }

                    // Reset form
                    assignmentForm.reset();
                    questionCount.value = 1;
                    generateQuestionFields();

                    // Close create modal
                    closeCreateModal();

                    // Show success modal with code
                    if (generatedCode) {
                        generatedCode.textContent = code;
                    }

                    if (successModal) {
                        successModal.style.display = "flex";
                        successModal.style.visibility = "visible";
                        successModal.style.opacity = "1";
                        successModal.style.pointerEvents = "auto";
                        successModal.classList.add("active");
                    }

                    document.body.style.overflow = "hidden";

                    // Re-fetch assignments from MongoDB
                    await fetchAssignments();

                } catch (error) {
                    console.error("Error creating assignment in MongoDB:", error);
                    alert("Could not connect to the backend server. Please make sure the backend is running.");
                } finally {
                    if (submitBtn) submitBtn.disabled = false;
                }
            });
        }

        // =====================================
        // DELETE ASSIGNMENT (MONGODB)
        // =====================================

        async function deleteAssignment(idOrCode, title = "this assignment") {
            const confirmed = confirm(
                `Are you sure you want to delete "${title}"?\n\n` +
                `This will also remove all student submissions for this assignment.`
            );

            if (!confirmed) return;

            try {
                const response = await fetch(
                    `${API_BASE_URL}/assignments/${encodeURIComponent(idOrCode)}`,
                    {
                        method: "DELETE"
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    alert(data.message || "Could not delete assignment.");
                    return;
                }

                await fetchAssignments();

            } catch (error) {
                console.error("Error deleting assignment:", error);
                alert("Failed to delete assignment from the server.");
            }
        }

        // =====================================
        // LOGOUT
        // =====================================

        const logoutBtn = document.getElementById("logoutBtn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                localStorage.removeItem("veritext_logged_in");
                localStorage.removeItem("veritext_token");
                localStorage.removeItem("veritext_current_user");
                localStorage.removeItem("veritext_current_instructor");
                window.location.href = "login.html";
            });
        }

        // Initial fetch
        fetchAssignments();

    }
);
