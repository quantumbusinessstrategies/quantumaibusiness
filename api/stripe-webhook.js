import crypto from 'node:crypto'
import { buildAutomationRecord, forwardAutomation, jsonResponse, notifyOwner, readRawBody, sendClientEmail } from './_shared.js'

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

function inferPackageName(session) {
  const metadataName = session.metadata?.package || session.metadata?.product || session.metadata?.package_name
  if (metadataName) return metadataName

  const amount = session.amount_total || 0
  if (amount === 999) return 'Outlined Strategy'
  if (amount === 22999) return 'Automated Utility'
  if (amount === 250000) return 'Full Strategic Growth'
  return session.payment_link ? `Stripe Payment Link ${session.payment_link}` : 'Stripe Checkout'
}

function buildClientOnboardingEmail(session, packageName) {
  const name = session.customer_details?.name || 'there'
  const amount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2).replace(/\.00$/, '')}` : 'your payment'
  const fulfillmentUrl = `${process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'}/#fulfillment`

  return {
    to: session.customer_details?.email || session.customer_email || '',
    subject: `Next step for your QuantumAiBusiness ${packageName}`,
    text: [
      `Hi ${name},`,
      '',
      `Your ${amount} checkout for ${packageName} was received.`,
      '',
      'Next step:',
      `Please complete the fulfillment intake here: ${fulfillmentUrl}`,
      '',
      'Use the same email from checkout if possible. The intake asks for the business name, website, current tools, objective, and constraints so the strategy draft can be prepared and reviewed.',
      '',
      'Important note: QuantumAiBusiness provides strategic diagnostics and automation guidance. Results are not guaranteed and depend on execution, market conditions, platform policies, and data quality.',
      '',
      'Best,',
      'QuantumAiBusiness',
    ].join('\n'),
  }
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
    package_name: inferPackageName(session),
    payment_link: session.payment_link || '',
    customer_name: session.customer_details?.name || '',
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
    const session = event.data?.object || {}
    const onboardingMode = process.env.STRIPE_CLIENT_ONBOARDING_MODE || 'auto_send'
    const onboardingEmail = buildClientOnboardingEmail(session, record.package || 'purchase')
    const [notification, forwarding, clientOnboarding] = await Promise.allSettled([
      notifyOwner(record),
      forwardAutomation(record),
      onboardingMode === 'auto_send' && onboardingEmail.to
        ? sendClientEmail(onboardingEmail)
        : Promise.resolve({ sent: false, reason: 'Stripe client onboarding disabled or missing customer email' }),
    ])
    jsonResponse(res, 200, {
      ok: true,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
      client_onboarding:
        clientOnboarding.status === 'fulfilled'
          ? clientOnboarding.value
          : { sent: false, error: clientOnboarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
