import { useEffect } from 'react'
import './ParentAccount.css'

function ParentAccount() {
  useEffect(() => {
    document.title = 'Parent portal | MyMathSteps'
  }, [])

  return (
    <div className="home-page family-page">
      <a className="skip-link" href="#family-main">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="/" aria-label="MyMathSteps home">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-step step-one" />
              <span className="brand-step step-two" />
              <span className="brand-step step-three" />
              <span className="brand-star" />
            </span>
            <span className="brand-text">MyMathSteps</span>
          </a>
          <a className="secondary-button" href="/">Back to home</a>
        </div>
      </header>

      <main id="family-main" className="container family-main" tabIndex="-1">
        <div className="family-heading">
          <span className="eyebrow">Parent portal</span>
          <h1>Free check-ins, no account required</h1>
          <p>We’re opening the Grade 6 and Grade 7 Math Readiness Check-ins to everyone during our launch period.</p>
        </div>

        <section className="family-card auth-card" aria-labelledby="family-title">
          <span className="eyebrow">Coming later</span>
          <h2 id="family-title">Parent accounts and saved family profiles</h2>
          <p className="family-muted">
            We’re keeping sign-up optional while we prepare secure parent-managed profiles and complete the privacy review. You can take a check-in now without entering a name, email, or other personal details.
          </p>
          <a className="primary-button" href="/assessment/">Start a free check-in</a>
          <p className="family-privacy-note">
            Check-in answers stay in this browser session and are not saved. The current check-in is a practice snapshot, not a diagnostic or standardized assessment.
          </p>
        </section>
      </main>
    </div>
  )
}

export default ParentAccount
