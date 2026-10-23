import { useMemo, useState } from 'react'
import './App.css'

const samplePairs = [
  {
    id: 1,
    studentA: 'Aarav Sharma',
    studentB: 'Rohan Mehta',
    assignment: 'Python Programming',
    similarity: 92,
    type: 'Code',
  },
  {
    id: 2,
    studentA: 'Priya Singh',
    studentB: 'Ananya Gupta',
    assignment: 'Data Structures',
    similarity: 84,
    type: 'Code',
  },
  {
    id: 3,
    studentA: 'Kabir Verma',
    studentB: 'Ishita Kapoor',
    assignment: 'AI Fundamentals',
    similarity: 73,
    type: 'Text',
  },
  {
    id: 4,
    studentA: 'Meera Joshi',
    studentB: 'Dev Malhotra',
    assignment: 'Python Programming',
    similarity: 58,
    type: 'Code',
  },
]

function App() {
  const [threshold, setThreshold] = useState(70)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All reports')

  const filteredPairs = useMemo(() => {
    return samplePairs.filter((pair) => {
      const matchesThreshold = pair.similarity >= threshold
      const matchesSearch =
        `${pair.studentA} ${pair.studentB} ${pair.assignment}`
          .toLowerCase()
          .includes(search.toLowerCase())
      const matchesTab =
        activeTab === 'All reports' ||
        (activeTab === 'Flagged' && pair.similarity >= 80) ||
        (activeTab === 'Review' && pair.similarity < 80)

      return matchesThreshold && matchesSearch && matchesTab
    })
  }, [threshold, search, activeTab])

  const flaggedCount = samplePairs.filter((pair) => pair.similarity >= 80).length
  const averageSimilarity = Math.round(
    samplePairs.reduce((total, pair) => total + pair.similarity, 0) /
      samplePairs.length,
  )

  function getStatus(similarity) {
    if (similarity >= 80) return 'High similarity'
    if (similarity >= 60) return 'Review needed'
    return 'Lower similarity'
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="VeriText home">
          <span className="brand-mark">✓</span>
          <span>Veri<span>Text</span></span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav">
          <button className="nav-item active" type="button">
            <span>▦</span> Overview
          </button>
          <button className="nav-item" type="button" onClick={() => setActiveTab('All reports')}>
            <span>▤</span> Similarity reports
          </button>
          <button className="nav-item" type="button" onClick={() => setActiveTab('Flagged')}>
            <span>⚑</span> Flagged pairs
          </button>
          <button className="nav-item" type="button" onClick={() => setActiveTab('Review')}>
            <span>◷</span> Needs review
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="instructor-avatar">I</div>
          <div>
            <strong>Instructor</strong>
            <span>Academic reviewer</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / Overview</span>
            <h1>Instructor dashboard</h1>
          </div>
          <div className="topbar-right">
            <span className="status-dot" />
            <span>Review workspace</span>
            <div className="top-avatar">I</div>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <p className="eyebrow">ACADEMIC INTEGRITY WORKSPACE</p>
            <h2>Good to see you again.</h2>
            <p className="welcome-copy">
              Review submission similarities, identify patterns, and decide
              which cases need a closer look.
            </p>
          </div>
          <div className="welcome-icon">✓</div>
        </section>

        <section className="stats-grid" aria-label="Dashboard statistics">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total comparisons</span>
              <span className="stat-icon teal">▤</span>
            </div>
            <strong>{samplePairs.length}</strong>
            <p>Sample submission pairs</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Flagged pairs</span>
              <span className="stat-icon red">⚑</span>
            </div>
            <strong>{flaggedCount}</strong>
            <p>Similarity of 80% or above</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Average similarity</span>
              <span className="stat-icon purple">◉</span>
            </div>
            <strong>{averageSimilarity}%</strong>
            <p>Across sample comparisons</p>
          </article>
        </section>

        <section className="reports-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SUBMISSION ANALYSIS</p>
              <h2>Similarity reports</h2>
              <p>Filter pairs to focus on submissions that need attention.</p>
            </div>
            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search students or assignments"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className="filter-tabs" role="tablist" aria-label="Report filters">
            {['All reports', 'Flagged', 'Review'].map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={activeTab === tab ? 'filter-tab selected' : 'filter-tab'}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="threshold-panel">
            <div className="threshold-heading">
              <div>
                <strong>Similarity threshold</strong>
                <p>Show pairs at or above your selected percentage.</p>
              </div>
              <span className="threshold-value">{threshold}%</span>
            </div>
            <input
              className="threshold-slider"
              type="range"
              min="0"
              max="100"
              step="5"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              aria-label="Minimum similarity threshold"
              style={{ '--slider-progress': `${threshold}%` }}
            />
            <div className="slider-labels">
              <span>0% · Show all</span>
              <span>100% · Exact match</span>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>STUDENT PAIR</th>
                  <th>ASSIGNMENT</th>
                  <th>TYPE</th>
                  <th>SIMILARITY</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPairs.map((pair) => (
                  <tr key={pair.id}>
                    <td>
                      <div className="student-pair">
                        <div className="pair-avatars">
                          <span>{pair.studentA.charAt(0)}</span>
                          <span>{pair.studentB.charAt(0)}</span>
                        </div>
                        <div>
                          <strong>{pair.studentA}</strong>
                          <span>and {pair.studentB}</span>
                        </div>
                      </div>
                    </td>
                    <td>{pair.assignment}</td>
                    <td><span className="type-pill">{pair.type}</span></td>
                    <td>
                      <div className="similarity-cell">
                        <div className="similarity-track">
                          <div
                            className={
                              pair.similarity >= 80
                                ? 'similarity-fill high'
                                : 'similarity-fill'
                            }
                            style={{ width: `${pair.similarity}%` }}
                          />
                        </div>
                        <strong>{pair.similarity}%</strong>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          pair.similarity >= 80
                            ? 'status-high'
                            : pair.similarity >= 60
                              ? 'status-review'
                              : 'status-low'
                        }`}
                      >
                        {getStatus(pair.similarity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPairs.length === 0 && (
              <div className="empty-state">
                <span>⌕</span>
                <strong>No matching submissions</strong>
                <p>Try lowering the threshold or changing your search.</p>
                <button
                  type="button"
                  onClick={() => {
                    setThreshold(0)
                    setSearch('')
                    setActiveTab('All reports')
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          <div className="table-footer">
            <span>Showing {filteredPairs.length} of {samplePairs.length} sample pairs</span>
            <span>Similarity scores are for demonstration only.</span>
          </div>
        </section>

        <footer className="page-footer">
          <span>✓ VeriText</span>
          <span>Similarity supports review; it does not prove misconduct.</span>
        </footer>
      </main>
    </div>
  )
}

export default App