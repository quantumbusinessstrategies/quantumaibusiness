import crypto from 'node:crypto'
import { buildAutomationRecord, forwardAutomation, jsonResponse, notifyOwner, readRawBody } from './_shared.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

function parseStripeSignature(header = '') {
  return header.split(',').reduce((parts, piece) => {
    const [key, value] = piece.split('=')
    if (key && value) parts[key] = value
    return parts
  }, {})
}

function verifyStripeSignature(rawBody, signatureHeader, secret) {
  const parts = parseStripeSignature(signatureHeader)
  if (!parts.t || !parts.v1) return false

  const signedPayload = `${parts.t}.${rawBody}`
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')
  const expectedBuffer = Buffer.from(expected, 'hex')
  const receivedBuffer = Buffer.from(parts.v1, 'hex')
  return expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

function stripeCheckoutRecord(event) {
  const session = event.data?.object || {}
  return buildAutomationRecord('stripe_checkout_completed', {
    stripe_event_id: event.id,
    stripe_event_type: event.type,
    customer_email: session.customer_details?.email || session.customer_email || '',
    amount: session.amount_total ? session.amount_total / 100 : '',
    currency: session.currency || '',
    payment_status: session.payment_status || '',
    checkout_url: session.url || '',
    package_name: session.metadata?.package || session.metadata?.product || '',
    raw_stripe_object: session,
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    jsonResponse(res, 500, { ok: false, error: 'STRIPE_WEBHOOK_SECRET is not configured' })
    return
  }

  try {
    const rawBody = await readRawBody(req)
    const signature = req.headers['stripe-signature']
    if (!verifyStripeSignature(rawBody, signature, secret)) {
      jsonResponse(res, 400, { ok: false, error: 'Invalid Stripe signature' })
      return
    }

    const event = JSON.parse(rawBody)
    if (event.type !== 'checkout.session.completed') {
      jsonResponse(res, 200, { ok: true, ignored: true, event_type: event.type })
      return
    }

    const record = stripeCheckoutRecord(event)
    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])
    jsonResponse(res, 200, {
      ok: true,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
