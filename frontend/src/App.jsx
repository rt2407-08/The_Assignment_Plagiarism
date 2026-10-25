
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import {
  getAssignments,
  getSubmissions,
  getSimilarityReports,
} from './services/api';


function prepareSubmission(submission, questions = []) {
  const content = submission.content || "";

  // Split content wherever a new question heading starts.
  const blocks = content.split(
    /(?=Question\s+\d+\s*\([^)]*\)\s*:)/i
  );

  const answers = blocks
    .map((block) => {
      const headingMatch = block.match(
        /Question\s+(\d+)\s*\(([^)]*)\)\s*:/i
      );

      if (!headingMatch) return null;

      const questionNumber = Number(headingMatch[1]);
      const typeText = headingMatch[2].trim().toLowerCase();

      const questionMatch = block.match(
        /Question\s*:\s*([\s\S]*?)(?=\n\s*Answer\s*:|$)/i
      );

      const answerMatch = block.match(
        /Answer\s*:\s*([\s\S]*)/i
      );

      const assignmentQuestion = questions.find(
        (q, index) =>
          Number(q.questionNumber ?? index + 1) === questionNumber
      );

      return {
        questionNumber,
        questionId:
          assignmentQuestion?._id ||
          assignmentQuestion?.id ||
          String(questionNumber),
        question:
          questionMatch?.[1]?.trim() ||
          assignmentQuestion?.question ||
          "",
        answer: answerMatch?.[1]?.trim() || "",
        type: typeText.includes("code") || typeText.includes("python")
          ? "code"
          : "text",
        language: typeText.includes("python") ? "python" : ""
      };
    })
    .filter(Boolean);

  return {
    ...submission,
    answers
  };
}


function App() {
  console.log(
    'Similarity algorithm:',
    typeof window.compareAllSubmissions
  );

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reports, setReports] = useState([]);

  const [threshold, setThreshold] = useState(0);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All reports');
  const [activePage, setActivePage] = useState('Overview');
  const [selectedReport, setSelectedReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('veritext_current_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse current user:', e);
    }
    return null;
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const instructorName = currentUser?.name || 'Instructor';
  const instructorEmail = currentUser?.email || '';
  const avatarLetter = (instructorName.charAt(0) || 'I').toUpperCase();

  function handleLogout() {
    localStorage.removeItem('veritext_logged_in');
    localStorage.removeItem('veritext_token');
    localStorage.removeItem('veritext_current_user');
    localStorage.removeItem('veritext_current_instructor');
    window.location.href = '/index.html';
  }

  // Keep the rest of your existing App.jsx code below this point.


  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const instructorParams = {};
        try {
          const stored = localStorage.getItem('veritext_current_user');
          if (stored) {
            const user = JSON.parse(stored);
            if (user) {
              if (user.id || user._id) {
                instructorParams.instructorId = String(user.id || user._id);
              }
              if (user.email) {
                instructorParams.instructorEmail = user.email.trim().toLowerCase();
              }
            }
          }
        } catch (e) {
          console.error('Failed to parse current instructor user:', e);
        }

        const [assignmentData, submissionData, reportData] =
          await Promise.all([
            getAssignments(instructorParams),
            getSubmissions(),
            getSimilarityReports(),
          ]);

        const rawAssignments = Array.isArray(assignmentData) ? assignmentData : assignmentData.assignments || [];
        const currentEmail = instructorParams.instructorEmail;
        const currentId = instructorParams.instructorId;

        const filteredAssignments = (currentId || currentEmail)
          ? rawAssignments.filter((a) => {
              const aId = String(a.instructorId?._id || a.instructorId || '');
              const idMatch = aId && aId === currentId;
              const aEmail = (a.instructorEmail || '').trim().toLowerCase();
              const emailMatch = aEmail && currentEmail && aEmail === currentEmail;
              return Boolean(idMatch || emailMatch);
            })
          : rawAssignments;

        setAssignments(filteredAssignments);
        setSubmissions(Array.isArray(submissionData) ? submissionData : submissionData.submissions || []);
        setReports(Array.isArray(reportData) ? reportData : reportData.reports || []);
      } catch (err) {
        console.error('Dashboard loading failed:', err);
        setError(
          'Could not load dashboard data. Check that the backend is running.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // Calculate pairwise similarity only among submissions for the same assignment.
  const calculatedPairs = useMemo(() => {
    if (typeof window.compareAllSubmissions !== 'function') {
      return [];
    }

    const pairs = [];

    assignments.forEach((assignment) => {
      const assignmentId = String(assignment._id || assignment.id || '');

      const assignmentSubmissions = submissions
        .filter((submission) => {
          const submissionAssignmentId = String(
            submission.assignmentId?._id || submission.assignmentId || ''
          );
          return submissionAssignmentId === assignmentId;
        })
        .map((submission, index) => ({
          ...prepareSubmission(submission, assignment.questions || []),
          // Unique position within this assignment's submissions.
          submissionIndex: index,
        }));

      if (assignmentSubmissions.length < 2) return;

      const results = window.compareAllSubmissions(assignmentSubmissions);

      results.forEach((result, index) => {
        const percentage = Number.isFinite(Number(result.percentage))
          ? Number(result.percentage)
          : Math.round(Number(result.similarity || 0) * 100);


          // Match the exact original submissions using the indices carried
          // through compareSubmissions(). Names and student IDs may be duplicated.
          const submissionA = Number.isInteger(result.submissionIndexA)
            ? assignmentSubmissions[result.submissionIndexA] || null
            : null;

          const submissionB = Number.isInteger(result.submissionIndexB)
            ? assignmentSubmissions[result.submissionIndexB] || null
            : null;

        pairs.push({
          ...result,

          // Prefer identity fields from the exact indexed source submissions.
          studentA: submissionA?.studentName ?? result.studentA,
          studentB: submissionB?.studentName ?? result.studentB,
          studentIdA: submissionA?.studentId ?? result.studentIdA,
          studentIdB: submissionB?.studentId ?? result.studentIdB,

          pairKey: `${assignmentId}-${submissionA?._id || submissionA?.id || result.submissionIndexA || result.studentIdA || result.studentA}-${submissionB?._id || submissionB?.id || result.submissionIndexB || result.studentIdB || result.studentB}-${index}`,
          assignmentId,
          assignmentTitle: assignment.title || 'Untitled assignment',
          similarity: percentage,
        
          // Preserve both students' submissions for the detail page
          submissionA: submissionA || null,
          submissionB: submissionB || null,
        
          submittedAt:
            submissionA?.submittedAt ||
            submissionA?.createdAt ||
            submissionB?.submittedAt ||
            submissionB?.createdAt ||
            null,
        });


      });
    });

    return pairs;
  }, [assignments, submissions]);

  // Use calculated pairwise scores in the dashboard table and threshold filter.
  const dashboardReports = useMemo(
    () =>
      calculatedPairs.map((pair) => ({
        ...pair,
        studentName: `${pair.studentA || 'Unknown student'} vs ${pair.studentB || 'Unknown student'}`,
        studentId: `${pair.studentIdA || 'N/A'} / ${pair.studentIdB || 'N/A'}`,
        assignmentName: pair.assignmentTitle,
        _id: pair.pairKey,
        createdAt: pair.submittedAt,
      })),
    [calculatedPairs]
  );

  const filteredReports = useMemo(() => {
    return dashboardReports.filter((report) => {
      const matchesThreshold = report.similarity >= threshold;
      const searchText = search.toLowerCase();

      const matchesSearch =
        report.studentName.toLowerCase().includes(searchText) ||
        report.studentId.toLowerCase().includes(searchText) ||
        report.assignmentName.toLowerCase().includes(searchText) ||
        String(report._id || '').toLowerCase().includes(searchText);

      const matchesTab =
        activeTab === 'All reports' ||
        (activeTab === 'Flagged pairs' && report.similarity >= 80) ||
        (activeTab === 'Needs review' &&
          report.similarity >= 60 &&
          report.similarity < 80);

      return matchesThreshold && matchesSearch && matchesTab;
    });
  }, [dashboardReports, threshold, search, activeTab]);

  const flaggedCount = dashboardReports.filter(
    (report) => report.similarity >= 80
  ).length;

  const reviewCount = dashboardReports.filter(
    (report) => report.similarity >= 60 && report.similarity < 80
  ).length;

  const averageSimilarity = dashboardReports.length
    ? Math.round(
        dashboardReports.reduce((total, report) => total + report.similarity, 0) /
          dashboardReports.length
      )
    : 0;

  function getStatus(similarity) {
    if (similarity >= 80) return 'High similarity';
    if (similarity >= 60) return 'Review needed';
    return 'Lower similarity';
  }

  function formatDate(date) {
    if (!date) return 'N/A';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return 'N/A';

    return parsedDate.toLocaleDateString();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">V</div>
          <div>
            <h2>VeriText</h2>
            <p>Instructor workspace</p>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button
            className={activePage === 'Overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              setActivePage('Overview');
              setActiveTab('All reports');
            }}
          >
            <span>▦</span> Overview
          </button>

          <button
            className={
              activePage === 'Flagged pairs' ? 'nav-item active' : 'nav-item'
            }
            onClick={() => {
              setActivePage('Flagged pairs');
              setActiveTab('Flagged pairs');
            }}
          >
            <span>⚑</span> Flagged pairs
          </button>

          <button
            className={
              activePage === 'Needs review' ? 'nav-item active' : 'nav-item'
            }
            onClick={() => {
              setActivePage('Needs review');
              setActiveTab('Needs review');
            }}
          >
            <span>◷</span> Needs review
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

          <a
            href="/instructor.html"
            className="nav-item"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <span>✏️</span> Create Assignment
          </a>

          <button
            type="button"
            className="nav-item"
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              color: 'inherit',
              font: 'inherit'
            }}
          >
            <span>🚪</span> Logout
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-label">SYSTEM STATUS</div>
          <div className="system-status">
            <span className="status-dot" />
            <span>Dashboard connected</span>
          </div>
          <p className="sidebar-version">VeriText · Phase 2</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / {activePage}</p>
            <h1>Instructor dashboard</h1>
          </div>

          <div
            className="profile"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            style={{ cursor: 'pointer', position: 'relative' }}
            title={instructorName}
          >
            <div className="profile-avatar">{avatarLetter}</div>
            <div>
              <strong>{instructorName}</strong>
              <p>{instructorEmail || 'Assignment reviewer'}</p>
            </div>

            {showProfileMenu && (
              <div
                className="profile-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="profile-dropdown-name">{instructorName}</div>
                {instructorEmail && (
                  <div className="profile-dropdown-email">{instructorEmail}</div>
                )}
                <span className="profile-dropdown-role">Instructor</span>
                <div className="profile-dropdown-divider" />
                <button
                  type="button"
                  className="profile-dropdown-logout"
                  onClick={handleLogout}
                >
                  <span>🚪</span> Log out
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <h2>
                {activePage === 'Overview'
                  ? 'Overview'
                  : activePage}
              </h2>
              <p>
                Monitor assignment submissions and review similarity reports.
              </p>
            </div>

            <div>
              <button
                className="refresh-button"
                onClick={() => window.location.reload()}
              >
                ↻ Refresh data
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <p>
                Make sure your Express server is running on port 5000.
              </p>
            </div>
          )}

          {loading ? (
            <div className="loading-message">
              Loading your dashboard...
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Total assignments</span>
                    <span className="stat-icon">▤</span>
                  </div>
                  <h3>{assignments.length}</h3>
                  <p>Assignments in the database</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Total submissions</span>
                    <span className="stat-icon">⇧</span>
                  </div>
                  <h3>{submissions.length}</h3>
                  <p>Student submissions received</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Flagged reports</span>
                    <span className="stat-icon warning">⚑</span>
                  </div>
                  <h3>{flaggedCount}</h3>
                  <p>Reports with similarity of 80% or higher</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Average similarity</span>
                    <span className="stat-icon">％</span>
                  </div>
                  <h3>{averageSimilarity}%</h3>
                  <p>Across calculated submission pairs</p>
                </div>
              </div>

              {activePage === 'Report Details' && selectedReport ? (
                <section className="reports-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Detailed Similarity Report</h3>
                      <p>{selectedReport.assignmentName}</p>
                    </div>
                    <button
                      className="refresh-button"
                      onClick={() => setActivePage('Similarity reports')}
                    >
                      ← Back to reports
                    </button>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-heading">Student A</div>
                      <h3>{selectedReport.studentA || 'Unknown student'}</h3>
                      <p>{selectedReport.studentIdA || 'N/A'}</p>
                    </div>
                    <div className="stat-card">
                      <div className="stat-heading">Student B</div>
                      <h3>{selectedReport.studentB || 'Unknown student'}</h3>
                      <p>{selectedReport.studentIdB || 'N/A'}</p>
                    </div>
                    <div className="stat-card">
                      <div className="stat-heading">Similarity score</div>
                      <h3>{selectedReport.similarity}%</h3>
                      <p>{getStatus(selectedReport.similarity)}</p>
                    </div>
                    </div>
                    
<div style={{ padding: '20px 0' }}>
  <h3>Question-wise comparison</h3>

  {Array.isArray(selectedReport.questionResults) &&
  selectedReport.questionResults.length > 0 ? (
    selectedReport.questionResults.map((result, index) => {
      const answersA = selectedReport.submissionA?.answers || [];
      const answersB = selectedReport.submissionB?.answers || [];

      const questionNumber =
        result.questionNumber || result.questionIndex || index + 1;

      const answerA = answersA.find(
        (answer) =>
          Number(answer.questionNumber) === Number(questionNumber)
      );

      const answerB = answersB.find(
        (answer) =>
          Number(answer.questionNumber) === Number(questionNumber)
      );

      return (
        <div
          key={index}
          className="stat-card"
          style={{ marginTop: '16px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 6px' }}>
                Question {questionNumber}
              </h4>
              <p style={{ margin: 0, color: '#718581', fontSize: '13px' }}>
                {result.type === 'code'
                  ? 'Code similarity analysis'
                  : 'Text similarity analysis'}
                {result.language ? ` · ${result.language}` : ''}
              </p>
            </div>

            {Number.isFinite(Number(result.percentage)) && (
              <span
                className={`status-badge ${
                  Number(result.percentage) >= 80
                    ? 'high'
                    : Number(result.percentage) >= 60
                    ? 'review'
                    : 'low'
                }`}
              >
                {Number(result.percentage)}% similarity
              </span>
            )}
          </div>

          {/* Existing similarity metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
              marginTop: '18px',
            }}
          >
            {Object.entries(result)
              .filter(
                ([key, value]) =>
                  typeof value === 'number' &&
                  key !== 'questionNumber' &&
                  key !== 'questionIndex' &&
                  key !== 'percentage' &&
                  (key.toLowerCase().includes('similarity') ||
                    key.toLowerCase().includes('score'))
              )
              .map(([key, value]) => {
                const percent =
                  Math.abs(value) <= 1
                    ? Math.round(value * 100)
                    : Math.round(value);

                const safePercent = Math.min(100, Math.max(0, percent));

                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (letter) => letter.toUpperCase())
                  .replace(/Similarity/i, ' similarity');

                return (
                  <div
                    key={key}
                    style={{
                      border: '1px solid #e2ece9',
                      borderRadius: '10px',
                      padding: '14px',
                      background: '#f8fbfa',
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 8px',
                        color: '#718581',
                        fontSize: '12px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {label}
                    </p>

                    <strong style={{ fontSize: '20px', color: '#203a35' }}>
                      {safePercent}%
                    </strong>

                    <div
                      style={{
                        height: '5px',
                        background: '#e2ece9',
                        borderRadius: '99px',
                        marginTop: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${safePercent}%`,
                          background:
                            safePercent >= 80
                              ? '#e05d4f'
                              : safePercent >= 60
                              ? '#d6a23d'
                              : '#168779',
                          borderRadius: '99px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Actual submitted answers */}
          <h4 style={{ marginTop: '24px' }}>Submitted answers</h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              marginTop: '12px',
            }}
          >
            {[
              {
                name: selectedReport.studentA || 'Student A',
                answer: answerA,
              },
              {
                name: selectedReport.studentB || 'Student B',
                answer: answerB,
              },
            ].map((student, studentIndex) => (
              <div
                key={studentIndex}
                style={{
                  border: '1px solid #e2ece9',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#ffffff',
                  minWidth: 0,
                }}
              >
                <h4 style={{ marginTop: 0 }}>{student.name}</h4>

                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    marginBottom: 0,
                  }}
                >
                  {student.answer?.answer ||
                    'No answer available for this question.'}
                </pre>
              </div>
            ))}
          </div>

          {Number.isFinite(Number(result.tokenCountA)) &&
            Number.isFinite(Number(result.tokenCountB)) && (
              <p
                style={{
                  margin: '16px 0 0',
                  color: '#718581',
                  fontSize: '13px',
                }}
              >
                Token counts · Student A: {result.tokenCountA} · Student B:{' '}
                {result.tokenCountB}
              </p>
            )}
        </div>
      );
    })
  ) : (
    <p>No question-wise comparison details are available for this report.</p>
  )}
</div>

                </section>
              ) : (
                <section className="reports-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Similarity reports</h3>
                    <p>
                      Review calculated similarity between submissions for the same assignment.
                    </p>
                  </div>

                  <div className="search-box">
                    <span>⌕</span>
                    <input
                      type="search"
                      placeholder="Search students or assignments..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                </div>

                <div className="report-tabs">
                  {['All reports', 'Flagged pairs', 'Needs review'].map(
                    (tab) => (
                      <button
                        key={tab}
                        className={activeTab === tab ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab}
                        {tab === 'Flagged pairs' && flaggedCount > 0 && (
                          <span className="tab-count">{flaggedCount}</span>
                        )}
                        {tab === 'Needs review' && reviewCount > 0 && (
                          <span className="tab-count">{reviewCount}</span>
                        )}
                      </button>
                    )
                  )}
                </div>

                <div className="threshold-row">
                  <div>
                    <strong>Similarity threshold</strong>
                    <p>Show reports at or above this percentage.</p>
                  </div>

                  <div className="threshold-control">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={threshold}
                      onChange={(event) =>
                        setThreshold(Number(event.target.value))
                      }
                    />
                    <span>{threshold}%</span>
                  </div>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>STUDENT</th>
                        <th>ASSIGNMENT</th>
                        <th>SIMILARITY</th>
                        <th>STATUS</th>
                        <th>SUBMITTED</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredReports.map((report) => (
                        <tr
                          key={report._id}
                          onClick={() => {
                            setSelectedReport(report);
                            setActivePage('Report Details');
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>
                            <div className="student-cell">
                              <div className="student-avatar">
                                {report.studentName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong>{report.studentName}</strong>
                                <p>{report.studentId}</p>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="assignment-cell">
                              <strong>{report.assignmentName}</strong>
                              <p>Submission report</p>
                            </div>
                          </td>

                          <td>
                            <div className="similarity-cell">
                              <strong>{report.similarity}%</strong>
                              <div className="similarity-track">
                                <div
                                  className="similarity-fill"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(0, report.similarity)
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                report.similarity >= 80
                                  ? 'high'
                                  : report.similarity >= 60
                                  ? 'review'
                                  : 'low'
                              }`}
                            >
                              {getStatus(report.similarity)}
                            </span>
                          </td>

                          <td>{formatDate(report.createdAt || report.submittedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredReports.length === 0 && (
                    <div className="empty-state">
                      <h4>No reports found</h4>
                      <p>
                        Try lowering the similarity threshold or changing
                        your search and selected tab.
                      </p>
                    </div>
                  )}
                </div>

                <div className="table-footer">
                  Showing {filteredReports.length} of {dashboardReports.length}{' '}
                  reports
                </div>
                </section>
              )}

              <p className="dashboard-note">
                Similarity scores are calculated from submitted answers using your existing algorithm. A high
                similarity score is a review signal, not proof of plagiarism.
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
