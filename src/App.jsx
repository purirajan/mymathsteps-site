import { useMemo, useState } from 'react'
import './App.css'

const questions = [
  {
    id: 'q1',
    topic: 'Fractions',
    prompt: 'Which fraction is greater?',
    options: ['3/4', '2/3', '1/2', '1/5'],
    correct: '3/4',
    explanation: '3/4 = 0.75, which is greater than 2/3 ≈ 0.67 and the other values.',
  },
  {
    id: 'q2',
    topic: 'Decimals',
    prompt: 'What is 0.72 + 0.18?',
    options: ['0.79', '0.82', '0.9', '0.98'],
    correct: '0.9',
    explanation: 'Adding decimals uses place value: 0.72 + 0.18 = 0.90.',
  },
  {
    id: 'q3',
    topic: 'Ratios',
    prompt: 'If 3 notebooks cost $9, what is the price per notebook?',
    options: ['$2', '$3', '$4', '$6'],
    correct: '$3',
    explanation: 'Divide the total price by the number of notebooks: 9 ÷ 3 = 3.',
  },
  {
    id: 'q4',
    topic: 'Equations',
    prompt: 'Solve for x: 3x + 5 = 20',
    options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
    correct: 'x = 5',
    explanation: 'Subtract 5 from both sides, then divide by 3: 3x = 15, so x = 5.',
  },
  {
    id: 'q5',
    topic: 'Order of Operations',
    prompt: 'Evaluate: 6 + 3 × (4 - 1)',
    options: ['9', '15', '21', '27'],
    correct: '15',
    explanation: 'Compute parentheses first: 4 - 1 = 3. Then multiply: 3 × 3 = 9. Finally add 6 + 9 = 15.',
  },
]

const getTopicStatus = (score) => {
  if (score >= 80) return 'Strong'
  if (score >= 60) return 'On track'
  if (score >= 40) return 'Needs practice'
  return 'Priority review'
}

function App() {
  const [student, setStudent] = useState({ name: 'Ava', grade: 'Grade 7' })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length

  const results = useMemo(() => {
    const topicScores = {}

    questions.forEach((question) => {
      const topic = question.topic
      const selectedAnswer = answers[question.id]
      if (!topicScores[topic]) {
        topicScores[topic] = { correct: 0, total: 0 }
      }
      topicScores[topic].total += 1
      if (selectedAnswer === question.correct) {
        topicScores[topic].correct += 1
      }
    })

    const topicSummary = Object.entries(topicScores).map(([topic, data]) => {
      const mastery = Math.round((data.correct / data.total) * 100)
      return {
        topic,
        mastery,
        status: getTopicStatus(mastery),
        prompt:
          mastery >= 80
            ? 'Skill appears secure.'
            : mastery >= 60
              ? 'A quick review will strengthen this concept.'
              : 'Needs targeted practice and concept support.',
      }
    })

    const totalCorrect = questions.reduce(
      (sum, question) => sum + (answers[question.id] === question.correct ? 1 : 0),
      0,
    )

    const overallScore = Math.round((totalCorrect / questions.length) * 100)
    const priorityTopics = [...topicSummary].sort((a, b) => a.mastery - b.mastery).slice(0, 2)

    return { overallScore, topicSummary, priorityTopics, totalCorrect }
  }, [answers])

  const handleAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }))

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1)
      return
    }

    setShowResults(true)
  }

  const resetAssessment = () => {
    setCurrentIndex(0)
    setAnswers({})
    setShowResults(false)
  }

  const progress = showResults ? 100 : Math.round((answeredCount / questions.length) * 100)

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">M</div>
          <div>
            <p className="eyebrow">MyMathSteps.com</p>
            <strong>Learning gap portal</strong>
          </div>
        </div>

        <nav className="topnav" aria-label="Main navigation">
          <a href="#platform">Platform</a>
          <a href="#dashboard">Parent dashboard</a>
          <a href="#results">Progress</a>
        </nav>
      </header>

      <main className="content">
        <section className="hero-card">
          <div className="hero-copy">
            <span className="pill">Middle school math readiness</span>
            <h1>MyMathSteps helps families spot the exact skill gaps that matter.</h1>
            <p>
              The MyMathSteps portal helps parents understand a student's strengths, identify the precise skills that need attention,
              and turn assessment results into a personalized improvement plan.
            </p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => setCurrentIndex(0)}>
                Start assessment
              </button>
              <button type="button" className="secondary-button" onClick={() => setShowResults(true)}>
                View sample report
              </button>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-box accent">
              <span className="stat-label">Students tracked</span>
              <strong>12,400</strong>
            </div>
            <div className="stat-box">
              <span className="stat-label">Skills mapped</span>
              <strong>70+</strong>
            </div>
            <div className="stat-box">
              <span className="stat-label">Avg. follow-up gain</span>
              <strong>+18%</strong>
            </div>
          </div>
        </section>

        <section id="platform" className="assessment-grid">
          <div className="assessment-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Student assessment</p>
                <h2>{student.name}</h2>
              </div>
              <span className="badge">{student.grade}</span>
            </div>

            <label className="input-label">
              Student name
              <input
                value={student.name}
                onChange={(event) => setStudent((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>

            <div className="progress-bar" aria-label="Assessment progress">
              <span style={{ width: `${progress}%` }} />
            </div>

            {!showResults ? (
              <>
                <div className="question-meta">
                  <span>Question {currentIndex + 1}</span>
                  <span>{currentQuestion.topic}</span>
                </div>

                <h3>{currentQuestion.prompt}</h3>

                <div className="options-grid">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="option-button"
                      onClick={() => handleAnswer(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="question-footer">
                  <span>{currentIndex + 1} / {questions.length}</span>
                  <button type="button" className="text-button" onClick={resetAssessment}>
                    Reset
                  </button>
                </div>
              </>
            ) : (
              <div className="results-panel" id="results">
                <p className="eyebrow">Assessment complete</p>
                <h3>{student.name}'s overall score: {results.overallScore}%</h3>
                <p>
                  This profile suggests the strongest area is {results.topicSummary.filter((topic) => topic.mastery >= 70)[0]?.topic || 'algebra readiness'},
                  while the highest-priority review areas are {results.priorityTopics.map((item) => item.topic).join(' and ')}.
                </p>

                <div className="result-stack">
                  {results.topicSummary.map((item) => (
                    <div key={item.topic} className="mini-score">
                      <div className="score-line">
                        <span>{item.topic}</span>
                        <strong>{item.mastery}%</strong>
                      </div>
                      <div className="mini-meter">
                        <span style={{ width: `${item.mastery}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside id="dashboard" className="dashboard-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Parent dashboard</p>
                <h2>Math progress</h2>
              </div>
              <span className="badge success">Live</span>
            </div>

            <div className="summary-grid">
              <div>
                <span className="summary-label">Overall performance</span>
                <strong>{showResults ? `${results.overallScore}%` : '—'}</strong>
              </div>
              <div>
                <span className="summary-label">Target skill</span>
                <strong>{showResults ? results.priorityTopics[0]?.topic : 'Fractions'}</strong>
              </div>
            </div>

            <div className="skill-list">
              {(showResults ? results.topicSummary : [
                { topic: 'Fractions', mastery: 52, status: 'Needs practice', prompt: 'Review equivalent fractions and common denominators.' },
                { topic: 'Ratios', mastery: 64, status: 'On track', prompt: 'Use proportional reasoning with real-world examples.' },
                { topic: 'Equations', mastery: 47, status: 'Priority review', prompt: 'Practice inverse operations and balancing equations.' },
              ]).map((item) => (
                <div key={item.topic} className="skill-item">
                  <div className="skill-top-row">
                    <span>{item.topic}</span>
                    <span className={`status ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </div>
                  <strong>{item.mastery}%</strong>
                  <p>{item.prompt}</p>
                </div>
              ))}
            </div>

            <div className="plan-box">
              <p className="eyebrow">Suggested next step</p>
              <h3>{showResults ? results.priorityTopics[0]?.topic : 'Fractions & equivalence'}</h3>
              <ul>
                <li>Complete 6 guided starter problems</li>
                <li>Watch a 3-minute worked example</li>
                <li>Retake a short follow-up quiz in 3 days</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default App
