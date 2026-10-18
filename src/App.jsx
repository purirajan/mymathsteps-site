import { useEffect, useState } from 'react'
import './App.css'

const navItems = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'For parents', href: '#for-parents' },
  { label: 'Our approach', href: '#our-approach' },
]

const benefits = [
  {
    title: 'Spot skill gaps',
    description: 'Understand which math skills your child may need to practice before gaps get bigger.',
    icon: '✦',
  },
  {
    title: 'Find the next step',
    description: 'Get recommendations for what to work on next instead of a single score with no direction.',
    icon: '→',
  },
  {
    title: 'Track progress',
    description: 'Revisit skills over time and see how confidence and understanding change with practice.',
    icon: '✓',
  },
]

const steps = [
  {
    number: '1',
    title: 'Check in',
    description: 'The student completes a short math skills assessment built around grade-level concepts.',
  },
  {
    number: '2',
    title: 'Get their path',
    description: 'MyMathSteps sorts results by skill area and highlights the topics that need attention next.',
  },
  {
    number: '3',
    title: 'Celebrate progress',
    description: 'Students practice with focused activities and can revisit the skill with a follow-up check-in.',
  },
]

const sampleSkills = [
  { name: 'Fractions', state: 'Ready to practice', tone: 'ready' },
  { name: 'Ratios and rates', state: 'Building confidence', tone: 'waiting' },
  { name: 'Expressions', state: 'Strong foundation', tone: 'strong' },
]

const footerLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'For parents', href: '#for-parents' },
  { label: 'Our approach', href: '#our-approach' },
  { label: 'Privacy', href: '#privacy-policy' },
  { label: 'Terms', href: '#terms-of-service' },
]

function Brand({ footer = false }) {
  return (
    <a className={`brand${footer ? ' footer-brand' : ''}`} href="/" aria-label="MyMathSteps home">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-step step-one" />
        <span className="brand-step step-two" />
        <span className="brand-step step-three" />
        <span className="brand-star" />
      </span>
      <span className="brand-text">MyMathSteps</span>
    </a>
  )
}

function AssessmentEntry() {
  useEffect(() => {
    document.title = 'Free Math Check-in | MyMathSteps'
  }, [])

  return (
    <div className="home-page entry-page" id="top">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <a className="secondary-button" href="/">Back to home</a>
        </div>
      </header>
      <main className="container assessment-entry" id="main-content">
        <span className="eyebrow">Free math check-in</span>
        <h1>Your next step starts with a check-in.</h1>
        <p>
          The MyMathSteps homepage is ready, and the interactive check-in is still being developed. This preview does not ask for or store a student’s personal information.
        </p>
        <div className="entry-note">
          <strong>What to expect</strong>
          <p>When the check-in is available, students will review grade-level math skills and receive clear suggestions for what to practice next.</p>
        </div>
        <a className="primary-button" href="/#how-it-works">See how MyMathSteps works</a>
      </main>
    </div>
  )
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileMenuOpen])

  if (window.location.pathname.replace(/\/$/, '') === '/assessment') {
    return <AssessmentEntry />
  }

  return (
    <div className="home-page" id="top">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />

          <button
            className="menu-toggle"
            type="button"
            aria-controls="site-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav id="site-navigation" className={`site-nav${mobileMenuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className="header-cta" href="/assessment/">
            Try a free check-in
          </a>
        </div>
      </header>

      <main id="main-content" tabIndex="-1">
        <section className="hero-section">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Middle school math readiness</span>
              <h1>Every student can take the next step in math.</h1>
              <p>
                Find the skills your child knows, spot potential gaps, and get a personalized plan to build confidence—one step at a time.
              </p>

              <div className="hero-actions">
                <a className="primary-button" href="/assessment/">
                  Try a free math check-in
                </a>
                <a className="secondary-button" href="#how-it-works">
                  See how it works
                </a>
              </div>
            </div>

            <div className="hero-visual" role="img" aria-label="Illustrative preview of a math skills summary">
              <div className="dashboard-card">
                <div className="dashboard-top">
                  <span className="tiny-pill">Illustrative skills preview</span>
                </div>

                <div className="student-card">
                  <div className="avatar">A</div>
                  <div>
                    <strong>Sample learner</strong>
                    <small>Grade 7</small>
                  </div>
                </div>

                <div className="progress-stack">
                  <div className="progress-line">
                    <span>Fractions</span>
                    <strong>Ready</strong>
                  </div>
                  <div className="meter">
                    <span style={{ width: '78%' }} />
                  </div>

                  <div className="progress-line">
                    <span>Ratios</span>
                    <strong>Practice</strong>
                  </div>
                  <div className="meter accent">
                    <span style={{ width: '58%' }} />
                  </div>
                </div>
              </div>

              <div className="floating-tag tag-one">Skills to practice</div>
              <div className="floating-tag tag-two">Building confidence</div>
              <div className="floating-tag tag-three">Next step</div>
            </div>
          </div>
        </section>

        <section className="benefits-section section-spacing">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Why parents choose MyMathSteps</span>
              <h2>Clear answers. Clear next steps.</h2>
            </div>

            <div className="feature-grid">
              {benefits.map((benefit) => (
                <article key={benefit.title} className="feature-card">
                  <div className="icon-bubble" aria-hidden="true">{benefit.icon}</div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="how-it-works section-spacing">
          <div className="container">
            <div className="section-heading center">
              <span className="eyebrow">How it works</span>
              <h2>Three simple steps to a better math plan.</h2>
            </div>

            <div className="steps-grid">
              {steps.map((step) => (
                <div key={step.number} className="step-card">
                  <div className="step-number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="sample-report" className="report-section section-spacing">
          <div className="container report-grid">
            <div className="report-card">
              <div className="section-heading left-align">
                <span className="eyebrow">Sample parent report</span>
                <h2>Helpful insight without the overwhelm.</h2>
              </div>

              <div className="report-body">
                <div className="report-header-row">
                  <div>
                    <strong>Student profile</strong>
                    <p>Illustrative student • Grade 7</p>
                  </div>
                  <span className="report-badge">Sample only</span>
                </div>

                <div className="skill-list">
                  {sampleSkills.map((skill) => (
                    <div key={skill.name} className="skill-row">
                      <div className="skill-name">
                        <span>{skill.name}</span>
                        <small>{skill.state}</small>
                      </div>
                      <span className={`signal signal-${skill.tone}`}>{skill.state}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="next-steps-card">
              <span className="eyebrow">Your next steps</span>
              <h3>Focused practice that matches the skill gap.</h3>
              <ul>
                <li>Review equivalent fractions.</li>
                <li>Practice unit rates with real-world examples.</li>
                <li>Revisit evaluating expressions with clear examples.</li>
              </ul>
              <p className="note">Sample report only. This is an illustrative example and not a real student result.</p>
            </aside>
          </div>
        </section>

        <section id="for-parents" className="reassurance-section section-spacing">
          <div className="container reassurance-box" id="our-approach">
            <div className="reassurance-copy">
              <span className="eyebrow">For parents</span>
              <h2>Know what to work on next—not just what went wrong.</h2>
              <p>
                MyMathSteps is designed to help families turn math results into practical next steps. The goal is to make learning more understandable, focused, and encouraging.
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section section-spacing">
          <div className="container cta-box">
            <div>
              <span className="eyebrow">Ready when you are</span>
              <h2>Ready to find your child’s next step?</h2>
              <p>Start with a math check-in and discover the skills to build on.</p>
            </div>
            <a className="primary-button large" href="/assessment/">
              Try a free math check-in
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Brand footer />
            <p className="footer-copy">A friendly, parent-first math learning platform for middle school students.</p>
          </div>

          <div className="footer-links">
            {footerLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="footer-meta">
            <span>© 2026 MyMathSteps</span>
            <a href="#top">Back to top</a>
          </div>

          <section className="footer-legal" id="privacy-policy" aria-labelledby="privacy-heading">
            <h2 id="privacy-heading">Privacy</h2>
            <p>This homepage does not request or store student information and does not include marketing analytics. A reviewed privacy policy will be needed before collecting personal information.</p>
          </section>

          <section className="footer-legal" id="terms-of-service" aria-labelledby="terms-heading">
            <h2 id="terms-heading">Terms</h2>
            <p>MyMathSteps is an early product preview. The sample report is illustrative, and this website is not a diagnostic or standardized assessment.</p>
          </section>
        </div>
      </footer>
    </div>
  )
}

export default App
