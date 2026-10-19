import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
}
const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }
const PRICE = '4.99'
const CURRENCY = 'USD'

function jsonResponse(status: number, body: Record<string, unknown>, origin: string | null) {
  const allowed = new Set([
    Deno.env.get('APP_ALLOWED_ORIGIN'),
    'http://localhost:4175',
    'http://localhost:4173',
    'http://localhost:5173',
  ].filter(Boolean))
  const headers = new Headers(jsonHeaders)
  if (origin && allowed.has(origin)) headers.set('Access-Control-Allow-Origin', origin)
  return new Response(JSON.stringify(body), { status, headers })
}

function paypalBaseUrl() {
  return Deno.env.get('PAYPAL_ENVIRONMENT') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID')
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
  if (!clientId || !clientSecret) throw new Error('PayPal server credentials are not configured.')

  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await response.json()
  if (!response.ok || !data.access_token) throw new Error('PayPal could not authorize the checkout request.')
  return data.access_token as string
}

async function paypalRequest(path: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(`${paypalBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'PayPal request failed.')
  return data
}

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin')
  if (request.method === 'OPTIONS') {
    const allowed = new Set([
      Deno.env.get('APP_ALLOWED_ORIGIN'),
      'http://localhost:4175',
      'http://localhost:4173',
      'http://localhost:5173',
    ].filter(Boolean))
    const headers = new Headers(corsHeaders)
    if (origin && allowed.has(origin)) headers.set('Access-Control-Allow-Origin', origin)
    return new Response(null, { status: 204, headers })
  }
  if (request.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed.' }, origin)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(503, { error: 'Family account service is not configured.' }, origin)
  }

  const authorization = request.headers.get('Authorization') || ''
  const accessToken = authorization.replace(/^Bearer\s+/i, '')
  if (!accessToken) return jsonResponse(401, { error: 'Sign in is required.' }, origin)

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const { data: { user }, error: authError } = await userClient.auth.getUser(accessToken)
  if (authError || !user) return jsonResponse(401, { error: 'Please sign in again.' }, origin)

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const body = await request.json()

    if (body.action === 'create') {
      const childProfileId = String(body.childProfileId || '')
      const { data: child, error: childError } = await admin
        .from('child_profiles')
        .select('id,parent_id,grade')
        .eq('id', childProfileId)
        .eq('parent_id', user.id)
        .maybeSingle()

      if (childError) throw childError
      if (!child || ![6, 7].includes(child.grade)) {
        return jsonResponse(404, { error: 'That child profile or grade is not available for a check-in.' }, origin)
      }

      const { data: existingEntitlement, error: entitlementError } = await admin
        .from('test_entitlements')
        .select('id')
        .eq('child_profile_id', child.id)
        .eq('grade', child.grade)
        .maybeSingle()
      if (entitlementError) throw entitlementError
      if (existingEntitlement) return jsonResponse(409, { error: 'This child already has access for that grade.' }, origin)

      const staleBefore = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const { error: staleAttemptError } = await admin
        .from('test_checkout_attempts')
        .update({ state: 'cancelled' })
        .eq('parent_id', user.id)
        .eq('child_profile_id', child.id)
        .eq('grade', child.grade)
        .eq('state', 'pending')
        .lt('created_at', staleBefore)
      if (staleAttemptError) throw staleAttemptError

      const paypalAccessToken = await getPayPalAccessToken()

      const attemptId = crypto.randomUUID()
      const { error: reserveError } = await admin.from('test_checkout_attempts').insert({
        id: attemptId,
        parent_id: user.id,
        child_profile_id: child.id,
        grade: child.grade,
        state: 'pending',
      })
      if (reserveError?.code === '23505') {
        return jsonResponse(409, { error: 'A checkout for this child and grade is already in progress.' }, origin)
      }
      if (reserveError) throw reserveError

      try {
        const order = await paypalRequest('/v2/checkout/orders', paypalAccessToken, {
          method: 'POST',
          headers: { 'PayPal-Request-Id': attemptId },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              reference_id: child.id,
              custom_id: attemptId,
              description: `Grade ${child.grade} Math Readiness Check-in`,
              amount: { currency_code: CURRENCY, value: PRICE },
            }],
            application_context: {
              brand_name: 'MyMathSteps',
              user_action: 'PAY_NOW',
              shipping_preference: 'NO_SHIPPING',
            },
          }),
        })
        if (!order.id) throw new Error('PayPal did not return a checkout order.')
        const { error: updateError } = await admin
          .from('test_checkout_attempts')
          .update({ paypal_order_id: order.id })
          .eq('id', attemptId)
        if (updateError) throw updateError
        return jsonResponse(200, { orderId: order.id, attemptId }, origin)
      } catch (error) {
        await admin.from('test_checkout_attempts').update({ state: 'failed' }).eq('id', attemptId)
        throw error
      }
    }

    if (body.action === 'cancel') {
      const attemptId = String(body.attemptId || '')
      const { error: cancelError } = await admin
        .from('test_checkout_attempts')
        .update({ state: 'cancelled' })
        .eq('id', attemptId)
        .eq('parent_id', user.id)
        .eq('state', 'pending')
      if (cancelError) throw cancelError
      return jsonResponse(200, { cancelled: true }, origin)
    }

    if (body.action === 'capture') {
      const orderId = String(body.orderId || '')
      const { data: attempt, error: attemptError } = await admin
        .from('test_checkout_attempts')
        .select('id,parent_id,child_profile_id,grade,state,paypal_order_id')
        .eq('paypal_order_id', orderId)
        .eq('parent_id', user.id)
        .maybeSingle()
      if (attemptError) throw attemptError
      if (!attempt) return jsonResponse(404, { error: 'Checkout order was not found for this parent.' }, origin)

      const paypalAccessToken = await getPayPalAccessToken()
      const order = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}`, paypalAccessToken)
      const unit = order.purchase_units?.[0]
      if (
        unit?.custom_id !== attempt.id ||
        unit?.reference_id !== attempt.child_profile_id ||
        unit?.amount?.currency_code !== CURRENCY ||
        unit?.amount?.value !== PRICE
      ) {
        return jsonResponse(400, { error: 'The PayPal order does not match this check-in purchase.' }, origin)
      }

      let completedOrder = order
      if (order.status === 'APPROVED') {
        completedOrder = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, paypalAccessToken, {
          method: 'POST',
          headers: { 'PayPal-Request-Id': `${attempt.id}-capture` },
          body: JSON.stringify({}),
        })
      }

      const capture = completedOrder.purchase_units?.[0]?.payments?.captures?.[0]
      if (completedOrder.status !== 'COMPLETED' || capture?.status !== 'COMPLETED' || capture?.amount?.currency_code !== CURRENCY || capture?.amount?.value !== PRICE) {
        return jsonResponse(402, { error: 'PayPal has not confirmed the full USD 4.99 payment.' }, origin)
      }

      const { error: entitlementInsertError } = await admin.from('test_entitlements').insert({
        parent_id: user.id,
        child_profile_id: attempt.child_profile_id,
        grade: attempt.grade,
        amount_cents: 499,
        currency: CURRENCY,
        paypal_order_id: orderId,
        paypal_capture_id: capture.id,
      })

      if (entitlementInsertError && entitlementInsertError.code !== '23505') throw entitlementInsertError
      const { error: attemptUpdateError } = await admin
        .from('test_checkout_attempts')
        .update({ state: 'captured' })
        .eq('id', attempt.id)
      if (attemptUpdateError) throw attemptUpdateError

      return jsonResponse(200, { completed: true, childProfileId: attempt.child_profile_id, grade: attempt.grade }, origin)
    }

    return jsonResponse(400, { error: 'Unsupported checkout action.' }, origin)
  } catch (error) {
    console.error('PayPal checkout failure:', error)
    return jsonResponse(500, { error: error instanceof Error ? error.message : 'Checkout failed.' }, origin)
  }
})
