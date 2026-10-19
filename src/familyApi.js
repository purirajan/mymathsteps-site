const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const SESSION_KEY = 'mymathsteps-parent-session'

export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || ''

export const isFamilyBackendConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

function saveSession(session) {
  if (session?.access_token) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

async function authRequest(path, body) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.msg || payload.message || payload.error_description || 'Unable to complete account request.')
  if (payload.access_token) saveSession(payload)
  return payload
}

export async function createParentAccount(email, password) {
  const redirectTo = encodeURIComponent(`${window.location.origin}/account/`)
  return authRequest(`signup?redirect_to=${redirectTo}`, { email, password })
}

export async function signInParent(email, password) {
  return authRequest('token?grant_type=password', { email, password })
}

export async function signOutParent() {
  const session = getSession()
  if (session?.access_token && isFamilyBackendConfigured) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
    }).catch(() => {})
  }
  saveSession(null)
}

async function refreshSession(session) {
  if (!session?.refresh_token) return null
  try {
    const updated = await authRequest('token?grant_type=refresh_token', { refresh_token: session.refresh_token })
    return updated.access_token ? updated : null
  } catch {
    saveSession(null)
    return null
  }
}

async function familyRequest(path, { method = 'GET', body, prefer } = {}) {
  if (!isFamilyBackendConfigured) throw new Error('Parent accounts are not configured yet.')
  let session = getSession()
  if (!session?.access_token || !session?.user?.id) throw new Error('Please sign in to manage family profiles.')

  const send = (currentSession) => fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${currentSession.access_token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  let response = await send(session)
  if (response.status === 401) {
    session = await refreshSession(session)
    if (!session) throw new Error('Your session expired. Please sign in again.')
    response = await send(session)
  }

  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.message || payload?.details || 'Unable to access family profiles.')
  return payload
}

export function getCurrentParent() {
  return getSession()?.user || null
}

export async function completeAuthRedirect() {
  if (!window.location.hash) return null
  const fragment = new URLSearchParams(window.location.hash.slice(1))
  const accessToken = fragment.get('access_token')
  const refreshToken = fragment.get('refresh_token')
  if (!accessToken || !refreshToken) return null

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const user = await response.json().catch(() => null)
  if (!response.ok || !user?.id) throw new Error('Could not confirm the parent account. Please try signing in.')

  const expiresIn = Number(fragment.get('expires_in') || 3600)
  saveSession({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: fragment.get('token_type') || 'bearer',
    expires_in: expiresIn,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    user,
  })
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)
  return user
}

export function getChildProfiles() {
  return familyRequest('child_profiles?select=id,nickname,grade,created_at&order=created_at.asc')
}

export function addChildProfile({ nickname, grade }) {
  const parent = getCurrentParent()
  if (!parent) throw new Error('Please sign in to add a child profile.')
  return familyRequest('child_profiles?select=id,nickname,grade,created_at', {
    method: 'POST',
    body: { parent_id: parent.id, nickname, grade: Number(grade) },
    prefer: 'return=representation',
  })
}

export function removeChildProfile(id) {
  return familyRequest(`child_profiles?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export function getTestEntitlements() {
  const parent = getCurrentParent()
  if (!parent) throw new Error('Please sign in to view purchases.')
  return familyRequest(`test_entitlements?select=child_profile_id,grade,created_at&parent_id=eq.${encodeURIComponent(parent.id)}`)
}

export async function invokePayPalCheckout(body) {
  if (!isFamilyBackendConfigured) throw new Error('Parent account service is not configured.')
  let session = getSession()
  if (!session?.access_token) throw new Error('Please sign in before continuing to checkout.')

  const send = (currentSession) => fetch(`${SUPABASE_URL}/functions/v1/paypal-checkout`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${currentSession.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  let response = await send(session)
  if (response.status === 401) {
    session = await refreshSession(session)
    if (!session) throw new Error('Your session expired. Please sign in again.')
    response = await send(session)
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || payload.message || 'PayPal checkout could not be completed.')
  return payload
}
