// =====================================
// VERITEXT REPORT PAGE
// =====================================


// =====================================
// GET CURRENT INSTRUCTOR
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


// =====================================
// CHECK LOGIN
// =====================================

const currentInstructor =
    getCurrentInstructor();


if (
    !currentInstructor ||
    !currentInstructor.id
) {

    window.location.href =
        "login.html";

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
// GET ASSIGNMENT CODE
// =====================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const assignmentCode =
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


const thresholdFilter =
    document.getElementById(
        "thresholdFilter"
    );


// =====================================
// CURRENT RESULTS
// =====================================

let similarityResults = [];


// =====================================
// GET ASSIGNMENT
// =====================================

function getAssignment() {

    const assignments =
        getAssignments();


    if (!assignmentCode) {

        return null;

    }


    return assignments.find(
        function (assignment) {

            const sameCode =
                String(
                    assignment.code
                ).toLowerCase() ===
                String(
                    assignmentCode
                ).toLowerCase();


            const sameInstructor =
                String(
                    assignment.instructorId
                ) ===
                String(
                    currentInstructor.id
                );


            return (
                sameCode &&
                sameInstructor
            );

        }
    );

}


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
// LOAD REPORT
// =====================================

function loadReport() {

    const assignment =
        getAssignment();


    // =================================
    // ACCESS DENIED
    // =================================

    if (!assignment) {

        reportTitle.textContent =
            "Access Denied";


        reportDescription.textContent =
            "This assignment does not exist or you are not authorized to view its report.";


        reportCode.textContent =
            "UNAUTHORIZED";


        reportSubmissionCount.textContent =
            "0";


        comparisonCount.textContent =
            "0";


        flaggedCount.textContent =
            "0";


        highestPercentage.textContent =
            "0%";


        highestStudentA.textContent =
            "—";


        highestStudentB.textContent =
            "—";


        highestStatus.textContent =
            "LOW";


        highestStatus.className =
            "similarity-status status-low";


        similarityResults = [];


        renderResults();


        return;

    }


    // =================================
    // BASIC INFORMATION
    // =================================

    reportTitle.textContent =
        assignment.title;


    reportDescription.textContent =
        "Review text and code similarity between student submissions.";


    reportCode.textContent =
        assignment.code;


    // =================================
    // SUBMISSIONS
    // =================================

    const submissions =
        Array.isArray(
            assignment.submissions
        )
            ? assignment.submissions
            : [];


    reportSubmissionCount.textContent =
        submissions.length;


    // =================================
    // NOT ENOUGH SUBMISSIONS
    // =================================

    if (
        submissions.length < 2
    ) {

        comparisonCount.textContent =
            "0";


        flaggedCount.textContent =
            "0";


        highestPercentage.textContent =
            "0%";


        highestStudentA.textContent =
            submissions.length === 1
                ? (
                    submissions[0].studentName ||
                    submissions[0].studentId ||
                    "Student A"
                )
                : "No submission yet";


        highestStudentB.textContent =
            submissions.length === 1
                ? "Waiting for another submission"
                : "Waiting for submissions";


        highestStatus.textContent =
            "WAITING";


        highestStatus.className =
            "similarity-status status-low";


        similarityResults =
            [];


        renderResults();


        return;

    }


    // =================================
    // CHECK SIMILARITY FUNCTION
    // =================================

    if (
        typeof compareAllSubmissions !==
        "function"
    ) {

        console.error(
            "compareAllSubmissions() not found. Check similarity.js."
        );

        return;

    }


    // =================================
    // RUN ANALYSIS
    // =================================

    similarityResults =
        compareAllSubmissions(
            submissions
        );


    // =================================
    // COMPARISON COUNT
    // =================================

    comparisonCount.textContent =
        similarityResults.length;


    // =================================
    // FLAGGED COUNT
    // =================================

    const flaggedResults =
        similarityResults.filter(
            function (result) {

                return (
                    result.percentage >= 60
                );

            }
        );


    flaggedCount.textContent =
        flaggedResults.length;


    // =================================
    // HIGHEST SIMILARITY
    // =================================

    if (
        similarityResults.length > 0
    ) {

        const highest =
            similarityResults[0];


        highestPercentage.textContent =
            highest.percentage +
            "%";


        highestStudentA.textContent =
            highest.studentA ||
            highest.studentIdA ||
            "Unknown student";


        highestStudentB.textContent =
            highest.studentB ||
            highest.studentIdB ||
            "Unknown student";


        const status =
            getSimilarityStatus(
                highest.percentage
            );


        highestStatus.textContent =
            status;


        highestStatus.className =
            "similarity-status " +
            getStatusClass(
                highest.percentage
            );

    }


    // =================================
    // DISPLAY
    // =================================

    renderResults();

}


// =====================================
// RENDER RESULTS
// =====================================

function renderResults() {

    if (
        !resultsTableBody
    ) {

        return;

    }


    resultsTableBody.innerHTML =
        "";


    const threshold =
        thresholdFilter
            ? Number(
                thresholdFilter.value
            )
            : 0;


    const filteredResults =
        similarityResults.filter(
            function (result) {

                return (
                    result.percentage >=
                    threshold
                );

            }
        );


    // =================================
    // NO RESULTS
    // =================================

    if (
        filteredResults.length === 0
    ) {

        if (noResults) {

            noResults.style.display =
                "block";

        }


        return;

    }


    if (noResults) {

        noResults.style.display =
            "none";

    }


    // =================================
    // CREATE RESULT ROWS
    // =================================

    filteredResults.forEach(
        function (result) {

            const row =
                document.createElement(
                    "tr"
                );


            const status =
                getSimilarityStatus(
                    result.percentage
                );


            const statusClass =
                getStatusClass(
                    result.percentage
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(
                            result.studentA
                        )}
                    </strong>

                </td>


                <td>

                    <strong>
                        ${escapeHTML(
                            result.studentB
                        )}
                    </strong>

                </td>


                <td>

                    <div class="percentage-cell">

                        <span>
                            ${result.percentage}%
                        </span>

                        <div class="percentage-bar">

                            <div
                                class="percentage-fill ${statusClass}"
                                style="width:${result.percentage}%"
                            ></div>

                        </div>

                    </div>

                </td>


                <td>

                    <span
                        class="result-status ${statusClass}"
                    >
                        ${status}
                    </span>

                </td>

            `;


            resultsTableBody.appendChild(
                row
            );


            // =================================
            // QUESTION DETAILS
            // =================================

            if (
                Array.isArray(
                    result.questionResults
                ) &&
                result.questionResults.length > 0
            ) {

                const detailsRow =
                    document.createElement(
                        "tr"
                    );


                const detailsCell =
                    document.createElement(
                        "td"
                    );


                detailsCell.colSpan =
                    4;


                detailsCell.className =
                    "question-details-cell";


                detailsCell.innerHTML =
                    createQuestionDetails(
                        result
                    );


                detailsRow.appendChild(
                    detailsCell
                );


                resultsTableBody.appendChild(
                    detailsRow
                );

            }

        }
    );

}


// =====================================
// CREATE QUESTION DETAILS
// =====================================

function createQuestionDetails(
    result
) {

    if (
        !Array.isArray(
            result.questionResults
        )
    ) {

        return "";

    }


    let html = `

        <div class="question-similarity-details">

            <div class="question-details-title">
                Question-wise similarity
            </div>

            <div class="question-results-list">

    `;


    result.questionResults.forEach(
        function (questionResult) {

            const percentage =
                Number(
                    questionResult.percentage
                ) || 0;


            const status =
                getSimilarityStatus(
                    percentage
                );


            const statusClass =
                getStatusClass(
                    percentage
                );


            const type =
                formatQuestionType(
                    questionResult
                );


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
                                    ? `
                                        <span class="code-language">
                                            ${escapeHTML(
                                                questionResult.language
                                            )}
                                        </span>
                                      `
                                    : ""
                            }

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
                                ${status} similarity
                            </div>

                        </div>

                    </div>

            `;


            // =================================
            // CODE BREAKDOWN
            // =================================

            if (
                questionResult.type ===
                "code"
            ) {

                html +=
                    createCodeBreakdown(
                        questionResult
                    );

            }


            // =================================
            // DIFFERENT LANGUAGE / TYPE NOTE
            // =================================

            if (
                questionResult.note
            ) {

                html += `

                    <div class="different-language">

                        ${escapeHTML(
                            questionResult.note
                        )}

                    </div>

                `;

            }


            html += `

                </div>

            `;

        }
    );


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
// FILTER
// =====================================

if (
    thresholdFilter
) {

    thresholdFilter.addEventListener(
        "change",
        function () {

            renderResults();

        }
    );

}


// =====================================
// INITIAL LOAD
// =====================================

loadReport();

