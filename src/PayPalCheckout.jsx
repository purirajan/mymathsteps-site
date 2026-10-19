import { useEffect, useRef, useState } from 'react'
import { invokePayPalCheckout, PAYPAL_CLIENT_ID } from './familyApi.js'

let paypalSdkPromise

function loadPayPalSdk() {
  if (window.paypal?.Buttons) return Promise.resolve(window.paypal)
  if (paypalSdkPromise) return paypalSdkPromise

  paypalSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-mymathsteps-paypal="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.paypal), { once: true })
      existing.addEventListener('error', () => reject(new Error('PayPal checkout could not load.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.dataset.mymathstepsPaypal = 'true'
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=USD&intent=capture&components=buttons&enable-funding=venmo`
    script.async = true
    script.onload = () => resolve(window.paypal)
    script.onerror = () => reject(new Error('PayPal checkout could not load.'))
    document.head.appendChild(script)
  }).catch((error) => {
    paypalSdkPromise = undefined
    throw error
  })

  return paypalSdkPromise
}

function PayPalCheckout({ child, onComplete }) {
  const paypalHost = useRef(null)
  const venmoHost = useRef(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(PAYPAL_CLIENT_ID))

  useEffect(() => {
    let active = true
    let currentAttemptId = null
    const paypalButtonHost = paypalHost.current
    const venmoButtonHost = venmoHost.current

    if (!PAYPAL_CLIENT_ID || !paypalButtonHost || !venmoButtonHost) return undefined

    loadPayPalSdk()
      .then((paypal) => {
        if (!active || !paypal?.Buttons) return undefined

        const buttonOptions = {
          style: { layout: 'vertical', shape: 'rect' },
          createOrder: async () => {
            setError('')
            const result = await invokePayPalCheckout({ action: 'create', childProfileId: child.id })
            currentAttemptId = result.attemptId || null
            if (!result.orderId) throw new Error('PayPal did not return an order ID.')
            return result.orderId
          },
          onApprove: async (data) => {
            setLoading(true)
            const result = await invokePayPalCheckout({ action: 'capture', orderId: data.orderID })
            if (!result.completed) throw new Error('PayPal has not confirmed this payment yet.')
            setError('')
            await onComplete()
            setLoading(false)
          },
          onCancel: async () => {
            if (currentAttemptId) {
              await invokePayPalCheckout({ action: 'cancel', attemptId: currentAttemptId }).catch(() => {})
            }
            setLoading(false)
          },
          onError: (checkoutError) => {
            setLoading(false)
            setError(checkoutError?.message || 'PayPal checkout could not be completed. Please try again.')
          },
        }

        const renderPromises = [
          paypal.Buttons({ ...buttonOptions, fundingSource: paypal.FUNDING.PAYPAL }).render(paypalButtonHost),
        ]
        if (paypal.FUNDING?.VENMO && paypal.Buttons({ fundingSource: paypal.FUNDING.VENMO }).isEligible()) {
          renderPromises.push(paypal.Buttons({ ...buttonOptions, fundingSource: paypal.FUNDING.VENMO }).render(venmoButtonHost))
        }
        return Promise.all(renderPromises)
      })
      .then(() => {
        if (active) setLoading(false)
      })
      .catch((checkoutError) => {
        if (!active) return
        setLoading(false)
        setError(checkoutError.message || 'PayPal checkout could not load.')
      })

    return () => {
      active = false
      paypalButtonHost.replaceChildren()
      venmoButtonHost.replaceChildren()
    }
  }, [child, onComplete])

  const visibleError = error || (!PAYPAL_CLIENT_ID ? 'PayPal Checkout is not configured yet.' : '')

  return (
    <div className="paypal-checkout">
      {loading && <p className="paypal-status" role="status">Loading secure checkout…</p>}
      <div ref={paypalHost} />
      <div ref={venmoHost} />
      {visibleError && <p className="paypal-status paypal-error" role="alert">{visibleError}</p>}
      <p className="paypal-caption">PayPal checkout · Venmo appears only when PayPal marks it eligible</p>
    </div>
  )
}

export default PayPalCheckout
