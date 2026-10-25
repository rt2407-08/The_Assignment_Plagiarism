// =====================================
// VERITEXT REPORT PAGE
// =====================================


// =====================================
// GET CURRENT INSTRUCTOR
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
}





// =====================================
// GET ASSIGNMENT CODE
// =====================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


let assignmentCode =
    urlParams.get("code");


// =====================================
// ELEMENTS
// =====================================

const reportTitle =
    document.getElementById(
        "reportTitle"
    );


const reportDescription =
    document.getElementById(
        "reportDescription"
    );


const reportCode =
    document.getElementById(
        "reportCode"
    );


const reportSubmissionCount =
    document.getElementById(
        "reportSubmissionCount"
    );


const comparisonCount =
    document.getElementById(
        "comparisonCount"
    );


const flaggedCount =
    document.getElementById(
        "flaggedCount"
    );


const avgSimilarityCount =
    document.getElementById(
        "avgSimilarityCount"
    );


const highestPercentage =
    document.getElementById(
        "highestPercentage"
    );


const highestStudentA =
    document.getElementById(
        "highestStudentA"
    );


const highestStudentB =
    document.getElementById(
        "highestStudentB"
    );


const highestStatus =
    document.getElementById(
        "highestStatus"
    );


const resultsTableBody =
    document.getElementById(
        "resultsTableBody"
    );


const noResults =
    document.getElementById(
        "noResults"
    );


const similarityThresholdSlider =
    document.getElementById(
        "similarityThresholdSlider"
    );


const thresholdBadge =
    document.getElementById(
        "thresholdBadge"
    );


const resetThresholdBtn =
    document.getElementById(
        "resetThresholdBtn"
    );


const reportTabs =
    document.getElementById(
        "reportTabs"
    );


const tabCountAll =
    document.getElementById(
        "tabCountAll"
    );


const tabCountFlagged =
    document.getElementById(
        "tabCountFlagged"
    );


const tabCountReview =
    document.getElementById(
        "tabCountReview"
    );


// =====================================
// STATE
// =====================================

let similarityResults = [];
let currentThreshold = 0;
let currentTab = "all";





// =====================================
// GET STATUS
// =====================================

function getSimilarityStatus(
    percentage
) {

    if (
        percentage >= 60
    ) {

        return "HIGH";

    }


    if (
        percentage >= 30
    ) {

        return "MODERATE";

    }


    return "LOW";

}


// =====================================
// GET STATUS CLASS
// =====================================

function getStatusClass(
    percentage
) {

    if (
        percentage >= 60
    ) {

        return "status-high";

    }


    if (
        percentage >= 30
    ) {

        return "status-moderate";

    }


    return "status-low";

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
// FORMAT TYPE
// =====================================

function formatQuestionType(
    result
) {

    if (
        result.type === "code"
    ) {

        return (
            result.language ||
            "CODE"
        ).toUpperCase();

    }


    return "TEXT";

}
// =====================================
// PREPARE SUBMISSION FOR SIMILARITY ANALYSIS
// =====================================


function prepareSubmission(submission, questions = []) {
    if (Array.isArray(submission.answers) && submission.answers.length > 0) {
        return submission;
    }

    const content = submission.content || "";

    const blocks = content.split(
        /(?=Question\s+\d+\s*\([^)]*\)\s*:)/i
    );

    let answers = blocks.map((block) => {
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
                Number(q.questionNumber ?? q.number ?? i + 1)
                === questionNumber
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
    }).filter(Boolean);

    // Fallback if no question heading blocks matched (treat entire content as Question 1 answer)
    if (answers.length === 0 && content.trim()) {
        answers = [{
            questionNumber: 1,
            questionId: 1,
            question: (questions[0] && (questions[0].question || questions[0].text)) || "Full Submission Answer",
            answer: content.trim(),
            type: (questions[0] && questions[0].type) || "text",
            language: (questions[0] && questions[0].language) || null
        }];
    }

    return {
        ...submission,
        answers
    };
}







// =====================================
// LOAD REPORT
// =====================================

async function loadReport() {
    try {
        if (!assignmentCode) {
            // Find the instructor's latest assignment
            const instParams = new URLSearchParams();
            if (currentInstructor.id || currentInstructor._id) {
                instParams.append("instructorId", String(currentInstructor.id || currentInstructor._id));
            }
            if (currentInstructor.email) {
                instParams.append("instructorEmail", currentInstructor.email.trim().toLowerCase());
            }
            const asgRes = await fetch(`https://veritext-backend-oe56.onrender.com/api/assignments?${instParams.toString()}`);
            const asgData = await asgRes.json();
            const assignments = asgData.assignments || (Array.isArray(asgData) ? asgData : []);
            if (assignments.length > 0) {
                assignmentCode = assignments[0].assignmentCode || assignments[0].code;
            } else {
                throw new Error("No assignments found. Please create an assignment first from the Dashboard.");
            }
        }

        // Fetch assignment from MongoDB
        const assignmentResponse = await fetch(
            `https://veritext-backend-oe56.onrender.com/api/assignments/code/${encodeURIComponent(assignmentCode)}`
        );

        const assignmentData = await assignmentResponse.json();

        if (!assignmentResponse.ok || !assignmentData.success) {
            throw new Error(assignmentData.message || "Assignment not found.");
        }

        const assignment = assignmentData.assignment;

        if (!assignment || !assignment._id) {
            throw new Error("Assignment not found.");
        }

        // Verify this instructor owns the assignment
        const currentInstId = String(currentInstructor.id || currentInstructor._id || "");
        const currentInstEmail = (currentInstructor.email || "").trim().toLowerCase();
        const assignInstId = String(assignment.instructorId?._id || assignment.instructorId || "");
        const assignInstEmail = (assignment.instructorEmail || "").trim().toLowerCase();

        const isOwner =
            (!assignInstId && !assignInstEmail) ||
            (assignInstId && assignInstId === currentInstId) ||
            (assignInstEmail && currentInstEmail && assignInstEmail === currentInstEmail);

        if (!isOwner) {
            if (reportTitle) reportTitle.textContent = "Access Denied";
            if (reportDescription) reportDescription.textContent =
                "You are not authorized to view this assignment report.";
            if (reportCode) reportCode.textContent = "UNAUTHORIZED";
            if (reportSubmissionCount) reportSubmissionCount.textContent = "0";
            if (comparisonCount) comparisonCount.textContent = "0";
            if (flaggedCount) flaggedCount.textContent = "0";
            if (avgSimilarityCount) avgSimilarityCount.textContent = "0%";
            if (highestPercentage) highestPercentage.textContent = "0%";
            if (highestStudentA) highestStudentA.textContent = "—";
            if (highestStudentB) highestStudentB.textContent = "—";
            if (highestStatus) {
                highestStatus.textContent = "DENIED";
                highestStatus.className = "similarity-status status-low";
            }
            similarityResults = [];
            renderResults();
            return;
        }

        reportTitle.textContent = assignment.title || "Assignment Report";
        reportDescription.textContent = assignment.description ||
            "Review text and code similarity between student submissions.";
        reportCode.textContent = assignment.assignmentCode || assignmentCode;

        // Fetch submissions from MongoDB
        const submissionsResponse = await fetch(
            "https://veritext-backend-oe56.onrender.com/api/submissions"
        );

        const submissionsData = await submissionsResponse.json();

        if (!submissionsResponse.ok || !submissionsData.success) {
            throw new Error(submissionsData.message || "Could not load submissions.");
        }

        // Keep only submissions for this assignment and map with index
        const submissions = (submissionsData.submissions || [])
            .filter(submission =>
                String(submission.assignmentId?._id || submission.assignmentId) === String(assignment._id)
            )
            .map((submission, index) => ({
                ...prepareSubmission(submission, assignment.questions || []),
                submissionIndex: index
            }));

        reportSubmissionCount.textContent = submissions.length;

        if (submissions.length < 2) {
            comparisonCount.textContent = "0";
            flaggedCount.textContent = "0";
            if (avgSimilarityCount) avgSimilarityCount.textContent = "0%";
            highestPercentage.textContent = "0%";
            highestStudentA.textContent = submissions.length === 1
                ? submissions[0].studentName || submissions[0].studentId
                : "No submission yet";
            highestStudentB.textContent = submissions.length === 1
                ? "Waiting for another submission"
                : "Waiting for submissions";
            highestStatus.textContent = "WAITING";
            highestStatus.className = "similarity-status status-low";
            similarityResults = [];
            renderResults();
            return;
        }

        if (typeof compareAllSubmissions !== "function") {
            throw new Error("compareAllSubmissions() not found. Check similarity.js.");
        }

        // Run the similarity algorithm
        const rawResults = compareAllSubmissions(submissions);

        similarityResults = rawResults.map((result) => {
            const subA = Number.isInteger(result.submissionIndexA)
                ? submissions[result.submissionIndexA]
                : null;
            const subB = Number.isInteger(result.submissionIndexB)
                ? submissions[result.submissionIndexB]
                : null;

            const percentage = Number.isFinite(Number(result.percentage))
                ? Number(result.percentage)
                : Math.round(Number(result.similarity || 0) * 100);

            return {
                ...result,
                percentage: percentage,
                studentA: subA?.studentName || result.studentA || "Student A",
                studentB: subB?.studentName || result.studentB || "Student B",
                studentIdA: subA?.studentId || result.studentIdA || "N/A",
                studentIdB: subB?.studentId || result.studentIdB || "N/A",
                submissionA: subA,
                submissionB: subB,
                assignmentQuestions: assignment.questions || []
            };
        });

        comparisonCount.textContent = similarityResults.length;

        const flaggedResults = similarityResults.filter(
            result => result.percentage >= 60
        );
        flaggedCount.textContent = flaggedResults.length;

        // Average similarity across all pairs
        if (avgSimilarityCount) {
            if (similarityResults.length > 0) {
                const avg = Math.round(
                    similarityResults.reduce((sum, r) => sum + r.percentage, 0) /
                    similarityResults.length
                );
                avgSimilarityCount.textContent = avg + "%";
            } else {
                avgSimilarityCount.textContent = "0%";
            }
        }

        if (similarityResults.length > 0) {
            const highest = similarityResults[0];

            highestPercentage.textContent = highest.percentage + "%";
            highestStudentA.textContent =
                `${highest.studentA} (${highest.studentIdA})`;
            highestStudentB.textContent =
                `${highest.studentB} (${highest.studentIdB})`;

            highestStatus.textContent = getSimilarityStatus(highest.percentage);
            highestStatus.className =
                "similarity-status " + getStatusClass(highest.percentage);
        } else {
            highestPercentage.textContent = "0%";
            highestStudentA.textContent = "—";
            highestStudentB.textContent = "—";
            highestStatus.textContent = "LOW";
            highestStatus.className = "similarity-status status-low";
        }

        renderResults();

    } catch (error) {
        console.error("Error loading similarity report:", error);
        reportTitle.textContent = "Unable to Load Report";
        reportDescription.textContent = error.message;
        similarityResults = [];
        renderResults();
    }
}



// =====================================
// GLOBAL TOGGLE COMPARISON HANDLER
// =====================================

let lastToggleTime = 0;
let lastToggleIndex = -1;

window.toggleComparison = function (index, btn) {
    const now = Date.now();
    if (lastToggleIndex === index && now - lastToggleTime < 150) {
        return; // Prevent accidental duplicate toggle on same event
    }
    lastToggleTime = now;
    lastToggleIndex = index;

    const detailsRow = document.getElementById(`details-row-${index}`);
    if (!detailsRow) return;

    const isVisible = detailsRow.style.display !== "none";
    if (isVisible) {
        detailsRow.style.display = "none";
        if (btn) btn.textContent = "View Answers Comparison ↓";
    } else {
        detailsRow.style.display = "";
        if (btn) btn.textContent = "Hide Answers Comparison ↑";
    }
};



// =====================================
// RENDER RESULTS
// =====================================

function renderResults() {
    if (!resultsTableBody) {
        return;
    }

    // Update tab badges
    const totalPairsCount = similarityResults.length;
    const flaggedPairsCount = similarityResults.filter(r => r.percentage >= 60).length;
    const reviewPairsCount = similarityResults.filter(r => r.percentage >= 30 && r.percentage < 60).length;

    if (tabCountAll) tabCountAll.textContent = totalPairsCount;
    if (tabCountFlagged) tabCountFlagged.textContent = flaggedPairsCount;
    if (tabCountReview) tabCountReview.textContent = reviewPairsCount;

    resultsTableBody.innerHTML = "";

    const filteredResults = similarityResults.filter(function (result) {
        // 1. Threshold slider filter ("threshold wala feature")
        if (result.percentage < currentThreshold) {
            return false;
        }

        // 2. Tab filter
        if (currentTab === "flagged" && result.percentage < 60) {
            return false;
        }
        if (currentTab === "review" && (result.percentage < 30 || result.percentage >= 60)) {
            return false;
        }

        return true;
    });

    // =================================
    // NO RESULTS
    // =================================

    if (filteredResults.length === 0) {
        if (noResults) {
            noResults.style.display = "block";
            const noResText = noResults.querySelector("p");
            if (noResText) {
                if (currentThreshold > 0) {
                    noResText.textContent = `No submission pairs have similarity ≥ ${currentThreshold}%. Try lowering the threshold slider.`;
                } else {
                    noResText.textContent = "No submission pairs meet the selected filter.";
                }
            }
        }
        return;
    }

    if (noResults) {
        noResults.style.display = "none";
    }

    // =================================
    // CREATE RESULT ROWS
    // =================================

    filteredResults.forEach(function (result, index) {
        const row = document.createElement("tr");
        row.className = "result-summary-row";
        row.dataset.index = index;

        const status = getSimilarityStatus(result.percentage);
        const statusClass = getStatusClass(result.percentage);

        row.innerHTML = `
            <td>
                <strong>${escapeHTML(result.studentA)}</strong>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">ID: ${escapeHTML(result.studentIdA)}</div>
            </td>

            <td>
                <strong>${escapeHTML(result.studentB)}</strong>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">ID: ${escapeHTML(result.studentIdB)}</div>
            </td>

            <td>
                <div class="percentage-cell">
                    <span style="font-weight: 800; min-width: 42px;">${result.percentage}%</span>
                    <div class="percentage-bar">
                        <div
                            class="percentage-fill ${statusClass}"
                            style="width:${result.percentage}%"
                        ></div>
                    </div>
                </div>
            </td>

            <td>
                <span class="result-status ${statusClass}">
                    ${status}
                </span>
            </td>

            <td style="text-align: right;">
                <button type="button" class="toggle-comparison-btn" onclick="event.stopPropagation(); toggleComparison(${index}, this); return false;">
                    ${index === 0 ? "Hide Answers Comparison ↑" : "View Answers Comparison ↓"}
                </button>
            </td>
        `;

        resultsTableBody.appendChild(row);

        // =================================
        // QUESTION DETAILS & SIDE-BY-SIDE COMPARISON ROW
        // =================================

        const detailsRow = document.createElement("tr");
        detailsRow.className = "question-details-row";
        detailsRow.id = `details-row-${index}`;
        // Expand first row by default, others collapsed
        if (index !== 0) {
            detailsRow.style.display = "none";
        } else {
            detailsRow.style.display = "";
        }

        const detailsCell = document.createElement("td");
        detailsCell.colSpan = 5;
        detailsCell.className = "question-details-cell";
        detailsCell.innerHTML = createQuestionDetails(result);

        detailsRow.appendChild(detailsCell);
        resultsTableBody.appendChild(detailsRow);
    });
}


// Delegated listener for comparison toggle buttons on table body
if (resultsTableBody) {
    resultsTableBody.addEventListener("click", function (e) {
        const btn = e.target.closest(".toggle-comparison-btn");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        const row = btn.closest("tr.result-summary-row");
        if (!row) return;
        const index = row.dataset.index;
        window.toggleComparison(index, btn);
    });
}



// =====================================
// CREATE QUESTION DETAILS (WITH SIDE-BY-SIDE ANSWERS)
// =====================================

function createQuestionDetails(result) {
    const rawContentA = result.submissionA?.content || "No submission content recorded.";
    const rawContentB = result.submissionB?.content || "No submission content recorded.";

    if (!Array.isArray(result.questionResults) || result.questionResults.length === 0) {
        return `
            <div class="question-similarity-details">
                <div class="question-details-title">
                    Side-by-Side Comparison (${escapeHTML(result.studentA)} vs ${escapeHTML(result.studentB)})
                </div>
                <div class="side-by-side-answers" style="margin-top: 12px;">
                    <div class="answer-column">
                        <h5 style="color: #0f2747;">👤 Student A (${escapeHTML(result.studentA)}):</h5>
                        <pre class="answer-pre">${escapeHTML(rawContentA)}</pre>
                    </div>
                    <div class="answer-column">
                        <h5 style="color: #b45309;">👤 Student B (${escapeHTML(result.studentB)}):</h5>
                        <pre class="answer-pre">${escapeHTML(rawContentB)}</pre>
                    </div>
                </div>
            </div>
        `;
    }

    let html = `
        <div class="question-similarity-details">
            <div class="question-details-title">
                Question-Wise Side-by-Side Comparison (${escapeHTML(result.studentA)} vs ${escapeHTML(result.studentB)})
            </div>
            <div class="question-results-list">
    `;

    const answersA = result.submissionA?.answers || [];
    const answersB = result.submissionB?.answers || [];

    result.questionResults.forEach(function (questionResult) {
        const percentage = Number(questionResult.percentage) || 0;
        const status = getSimilarityStatus(percentage);
        const statusClass = getStatusClass(percentage);
        const type = formatQuestionType(questionResult);

        const qNum = questionResult.questionNumber;
        const ansA = answersA.find(a => Number(a.questionNumber) === Number(qNum));
        const ansB = answersB.find(b => Number(b.questionNumber) === Number(qNum));
        const promptText = ansA?.question || ansB?.question || `Question ${qNum}`;

        html += `
            <div class="question-result-item">
                <div class="question-result-top">
                    <div class="question-result-name">
                        <span class="question-number-badge">
                            Q${questionResult.questionNumber}
                        </span>
                        <span class="question-type-badge">
                            ${escapeHTML(type)}
                        </span>
                        ${
                            questionResult.language
                                ? `<span class="code-language">${escapeHTML(questionResult.language)}</span>`
                                : ""
                        }
                        <strong style="margin-left: 8px; font-size: 13px; color: #0f2747;">
                            ${escapeHTML(promptText)}
                        </strong>
                    </div>

                    <div class="question-score">
                        ${percentage}%
                    </div>
                </div>

                <div class="question-result-main">
                    <div class="question-progress">
                        <div class="question-progress-track">
                            <div
                                class="question-progress-fill ${statusClass}"
                                style="width:${percentage}%"
                            ></div>
                        </div>
                        <div class="question-status ${statusClass}">
                            ${status} similarity (${percentage}%)
                        </div>
                    </div>
                </div>

                <!-- SIDE-BY-SIDE ANSWERS COMPARISON ("AND COMPARISON") -->
                <div class="side-by-side-answers">
                    <div class="answer-column">
                        <h5 style="color: #0f2747;">
                            <span>👤</span> Student A (${escapeHTML(result.studentA)}):
                        </h5>
                        <pre class="answer-pre">${escapeHTML(ansA?.answer || rawContentA || "No answer submitted.")}</pre>
                    </div>

                    <div class="answer-column">
                        <h5 style="color: #b45309;">
                            <span>👤</span> Student B (${escapeHTML(result.studentB)}):
                        </h5>
                        <pre class="answer-pre">${escapeHTML(ansB?.answer || rawContentB || "No answer submitted.")}</pre>
                    </div>
                </div>
        `;

        // Code breakdown metrics
        if (questionResult.type === "code") {
            html += createCodeBreakdown(questionResult);
        }

        // Different language or note
        if (questionResult.note) {
            html += `
                <div class="different-language">
                    ${escapeHTML(questionResult.note)}
                </div>
            `;
        }

        html += `</div>`;
    });

    html += `
            </div>
        </div>
    `;

    return html;
}


// =====================================
// CREATE CODE BREAKDOWN
// =====================================

function createCodeBreakdown(
    result
) {

    const metrics = [

        {
            name:
                "Token sequence",

            value:
                result.sequenceSimilarity

        },

        {
            name:
                "Keywords",

            value:
                result.keywordSimilarity

        },

        {
            name:
                "Variable names",

            value:
                result.identifierSimilarity

        },

        {
            name:
                "Operators",

            value:
                result.operatorSimilarity

        },

        {
            name:
                "Literals",

            value:
                result.literalSimilarity

        },

        {
            name:
                "Comments",

            value:
                result.commentSimilarity

        }

    ];


    let html = `

        <div class="code-analysis">

            <div class="code-analysis-title">

                Code analysis breakdown

            </div>


            <div class="code-analysis-grid">

    `;


    metrics.forEach(
        function (metric) {

            const percentage =
                Math.round(
                    (
                        Number(
                            metric.value
                        ) || 0
                    ) * 100
                );


            html += `

                <div class="code-analysis-item">

                    <div class="code-analysis-label">

                        <span>
                            ${metric.name}
                        </span>

                        <strong>
                            ${percentage}%
                        </strong>

                    </div>


                    <div class="code-analysis-track">

                        <div
                            class="code-analysis-fill"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                </div>

            `;

        }
    );


    html += `

            </div>

    `;


    // =================================
    // TOKEN COUNTS
    // =================================

    if (
        result.tokenCountA !== undefined &&
        result.tokenCountB !== undefined
    ) {

        html += `

            <div
                style="
                    margin-top:14px;
                    font-size:11px;
                    color:#64748b;
                "
            >

                Tokens analyzed:

                Student A:
                <strong>
                    ${result.tokenCountA}
                </strong>

                &nbsp; | &nbsp;

                Student B:
                <strong>
                    ${result.tokenCountB}
                </strong>

            </div>

        `;

    }


    html += `

        </div>

    `;


    return html;

}


// =====================================
// FILTER & SEARCH LISTENERS
// =====================================

if (similarityThresholdSlider) {
    similarityThresholdSlider.addEventListener("input", function (e) {
        currentThreshold = Number(e.target.value);
        if (thresholdBadge) {
            thresholdBadge.textContent = currentThreshold + "%";
        }
        renderResults();
    });
}

if (resetThresholdBtn) {
    resetThresholdBtn.addEventListener("click", function () {
        currentThreshold = 0;
        if (similarityThresholdSlider) {
            similarityThresholdSlider.value = 0;
        }
        if (thresholdBadge) {
            thresholdBadge.textContent = "0%";
        }
        renderResults();
    });
}

if (reportTabs) {
    const tabs = reportTabs.querySelectorAll(".report-tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentTab = tab.dataset.tab || "all";
            renderResults();
        });
    });
}


// =====================================
// INITIAL LOAD
// =====================================

loadReport();

