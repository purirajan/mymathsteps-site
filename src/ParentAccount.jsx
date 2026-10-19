import { useCallback, useEffect, useState } from 'react'
import {
  addChildProfile,
  completeAuthRedirect,
  createParentAccount,
  getChildProfiles,
  getCurrentParent,
  getTestEntitlements,
  isFamilyBackendConfigured,
  removeChildProfile,
  signInParent,
  signOutParent,
} from './familyApi.js'
import PayPalCheckout from './PayPalCheckout.jsx'
import './ParentAccount.css'

function ParentAccount() {
  const [parent, setParent] = useState(getCurrentParent())
  const [children, setChildren] = useState([])
  const [entitlements, setEntitlements] = useState([])
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [grade, setGrade] = useState('6')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const fetchFamily = useCallback(async () => {
    if (!parent) return { profiles: [], purchases: [] }
    const [profiles, purchases] = await Promise.all([getChildProfiles(), getTestEntitlements()])
    return { profiles: profiles || [], purchases: purchases || [] }
  }, [parent])

  const loadFamily = useCallback(async () => {
    try {
      const [profiles, purchases] = await Promise.all([getChildProfiles(), getTestEntitlements()])
      setChildren(profiles || [])
      setEntitlements(purchases || [])
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [])

  useEffect(() => {
    document.title = 'Parent account | MyMathSteps'
    if (!parent) return undefined
    let active = true
    fetchFamily()
      .then(({ profiles, purchases }) => {
        if (!active) return
        setChildren(profiles)
        setEntitlements(purchases)
        setError('')
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    return () => {
      active = false
    }
  }, [fetchFamily, parent])

  useEffect(() => {
    let active = true
    completeAuthRedirect()
      .then((confirmedParent) => {
        if (active && confirmedParent) {
          setParent(confirmedParent)
          setNotice('Your parent email is confirmed. Your account is ready.')
        }
      })
      .catch((redirectError) => {
        if (active) setError(redirectError.message)
      })
    return () => {
      active = false
    }
  }, [])

  const handleAuth = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const authResult = mode === 'signup'
        ? await createParentAccount(email.trim(), password)
        : await signInParent(email.trim(), password)
      if (authResult.access_token) {
        setParent(authResult.user || getCurrentParent())
        setNotice(mode === 'signup' ? 'Your parent account is ready.' : 'You are signed in.')
      } else {
        setParent(null)
        setNotice('Check your email to confirm the parent account, then return here to sign in.')
      }
      setPassword('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  const handleAddChild = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const safeNickname = nickname.trim() || `Learner ${children.length + 1}`
      await addChildProfile({ nickname: safeNickname, grade })
      setNickname('')
      setNotice(`${safeNickname} was added to your family profiles.`)
      await loadFamily()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  const handleRemoveChild = async (child) => {
    if (!window.confirm(`Remove ${child.nickname} and the profile's saved test access?`)) return
    setBusy(true)
    setError('')
    try {
      await removeChildProfile(child.id)
      setNotice(`${child.nickname} was removed.`)
      await loadFamily()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = async () => {
    await signOutParent()
    setParent(null)
    setChildren([])
    setEntitlements([])
    setNotice('You have signed out.')
    setError('')
  }

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
          <h1>{parent ? 'Your family profiles' : 'Create your parent account'}</h1>
          <p>Parents manage family profiles. Children do not need separate accounts.</p>
        </div>

        {!isFamilyBackendConfigured && (
          <div className="family-alert setup-alert" role="status">
            <strong>Account service is not connected yet.</strong>
            <span>Set the Supabase project URL and public anon key in the local environment, then run the included database migration before enabling account registration.</span>
          </div>
        )}
        {notice && <p className="family-alert success-alert" role="status">{notice}</p>}
        {error && <p className="family-alert error-alert" role="alert">{error}</p>}

        {!parent ? (
          <section className="family-card auth-card" aria-labelledby="auth-title">
            <div className="auth-tabs" role="tablist" aria-label="Parent account options">
              <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); setNotice('') }}>
                Create account
              </button>
              <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setNotice('') }}>
                Log in
              </button>
            </div>
            <h2 id="auth-title">{mode === 'signup' ? 'A parent account keeps the family together.' : 'Welcome back.'}</h2>
            <p className="family-muted">Use the parent or guardian’s email. Child profiles are managed inside this account.</p>
            <form className="family-form" onSubmit={handleAuth}>
              <label htmlFor="parent-email">Parent email</label>
              <input id="parent-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              <label htmlFor="parent-password">Password</label>
              <input id="parent-password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
              <button className="primary-button" type="submit" disabled={busy || !isFamilyBackendConfigured}>
                {busy ? 'Please wait…' : mode === 'signup' ? 'Create parent account' : 'Log in'}
              </button>
            </form>
            <p className="family-privacy-note">Do not use a child’s email to register. Child profile labels should be nicknames; do not enter a full name, birth date, school, or contact details.</p>
          </section>
        ) : (
          <div className="family-dashboard">
            <section className="family-card account-summary">
              <div>
                <span className="eyebrow">Signed in as parent</span>
                <strong>{parent.email}</strong>
              </div>
              <button className="secondary-button" type="button" onClick={handleSignOut}>Log out</button>
            </section>

            <section className="family-card add-child-card" aria-labelledby="add-child-title">
              <span className="eyebrow">Family profiles</span>
              <h2 id="add-child-title">Add a child profile</h2>
              <p className="family-muted">Use a nickname only. No child login is created.</p>
              <form className="family-form child-form" onSubmit={handleAddChild}>
                <div>
                  <label htmlFor="child-nickname">Nickname (optional)</label>
                  <input id="child-nickname" type="text" maxLength={32} autoComplete="off" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder={`Learner ${children.length + 1}`} />
                </div>
                <div>
                  <label htmlFor="child-grade">Current grade</label>
                  <select id="child-grade" value={grade} onChange={(event) => setGrade(event.target.value)}>
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                  </select>
                </div>
                <button className="primary-button" type="submit" disabled={busy || !isFamilyBackendConfigured}>Add profile</button>
              </form>
            </section>

            <section className="children-grid" aria-label="Child profiles">
              {children.length === 0 ? (
                <div className="family-card empty-family">
                  <h2>No profiles yet</h2>
                  <p>Add a child profile to manage grade-specific check-ins from your parent account.</p>
                </div>
              ) : children.map((child) => {
                const hasGradeAccess = entitlements.some((item) => item.child_profile_id === child.id && item.grade === child.grade)
                const gradeSupported = child.grade === 6 || child.grade === 7
                return (
                  <article className="family-card child-card" key={child.id}>
                    <div className="child-card-heading">
                      <div className="avatar" aria-hidden="true">{child.nickname.charAt(0).toUpperCase()}</div>
                      <div>
                        <h2>{child.nickname}</h2>
                        <p>Grade {child.grade}</p>
                      </div>
                    </div>
                    <div className="test-offer">
                      <strong>Math Readiness Check-in</strong>
                      {hasGradeAccess ? (
                        <p className="entitlement-state">Paid access active · retakes included</p>
                      ) : (
                        <p>$4.99 once for this child and grade. Retakes included after purchase.</p>
                      )}
                      {!gradeSupported && <p className="family-muted">The Grade {child.grade} syllabus is not available yet.</p>}
                      {!hasGradeAccess && gradeSupported && (
                        <PayPalCheckout child={child} onComplete={loadFamily} />
                      )}
                      {hasGradeAccess && gradeSupported && <a className="primary-button" href={`/assessment/?child=${encodeURIComponent(child.id)}&grade=${child.grade}`}>Start check-in</a>}
                    </div>
                    <button className="remove-child" type="button" disabled={busy} onClick={() => handleRemoveChild(child)}>Remove profile</button>
                  </article>
                )
              })}
            </section>
            <p className="family-privacy-note">Profiles are private to this parent account. Production use requires an accurate privacy notice and appropriate parental consent. The check-in is not a validated standardized assessment.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default ParentAccount
