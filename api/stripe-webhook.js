import crypto from 'node:crypto'
import { buildAutomationRecord, forwardAutomation, jsonResponse, notifyOwner, readRawBody, sendClientEmail } from './_shared.js'
import { normalizePackageKey, processFulfillmentIntake } from './fulfillment.js'

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
  if (amount === 4999) return 'Growth Scan Pack'
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

function paymentMomentumRecord(session, packageName) {
  const site = process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'
  const amount = session.amount_total ? session.amount_total / 100 : ''
  const campaign = `post_payment_${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`
  const moneyPage = `${site}/business-growth-scan.html?utm_source=owner&utm_medium=post_payment&utm_campaign=${campaign}`
  const scanPackPage = `${site}/growth-scan-pack.html?utm_source=owner&utm_medium=post_payment&utm_campaign=${campaign}`
  const referralPage = `${site}/refer-business.html?utm_source=owner&utm_medium=post_payment&utm_campaign=${campaign}`

  return buildAutomationRecord('post_payment_growth_push', {
    target: site,
    customer_email: session.customer_details?.email || session.customer_email || '',
    amount,
    package_name: packageName,
    payment_link: session.payment_link || '',
    stripe_checkout_session: session.id || '',
    next_action:
      'Fresh payment received: post one tracked organic link, send one direct outreach note, and check whether this buyer should receive an upgrade path.',
    payload: {
      source_event: 'checkout.session.completed',
      buyer_name: session.customer_details?.name || '',
      buyer_email: session.customer_details?.email || session.customer_email || '',
      package_name: packageName,
      amount,
      tracked_links: {
        pressure_scan: moneyPage,
        growth_scan_pack: scanPackPage,
        premium_referral: referralPage,
      },
      copy_blocks: [
        `Fresh example of why this exists: businesses often have interest already, but the path from visit to follow-up to paid action leaks. Run a pressure scan here: ${moneyPage}`,
        `If your site gets attention but not enough action, pressure-test the routing, follow-up, and offer clarity. Start with the scan pack: ${scanPackPage}`,
        `Know a business owner with weak follow-up or unclear conversion? Send them through the referral route: ${referralPage}`,
      ],
      owner_checklist: [
        'Confirm Stripe payment and customer onboarding email.',
        'Watch for fulfillment intake from the buyer.',
        'Post one tracked organic link or send one direct outreach note.',
        'If the buyer has automation pain, prepare Automated Utility follow-up.',
      ],
    },
  })
}

function fulfillmentIntakeFromCheckout(session, packageName) {
  const metadata = session.metadata || {}
  const packageKey = normalizePackageKey(metadata.package_key, packageName)
  return {
    package_key: packageKey,
    package_name: metadata.package_name || packageName,
    company: metadata.company || '',
    website: metadata.website || '',
    customer_email: metadata.customer_email || session.customer_details?.email || session.customer_email || '',
    payment_email: session.customer_details?.email || session.customer_email || metadata.customer_email || '',
    objective: metadata.objective || '',
    current_tools: metadata.current_tools || '',
    constraints: metadata.constraints || '',
    source: 'stripe_one_step_checkout_paid',
    amount: session.amount_total ? session.amount_total / 100 : '',
    review_only: !['outlinedStrategy', 'growthScanPack'].includes(packageKey),
  }
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
    const isOneStepCheckout = session.metadata?.auto_checkout_intake === 'true'
    const onboardingMode = process.env.STRIPE_CLIENT_ONBOARDING_MODE || 'auto_send'
    const onboardingEmail = buildClientOnboardingEmail(session, record.package || 'purchase')
    const momentumRecord = paymentMomentumRecord(session, record.package || 'Stripe Checkout')
    const [notification, forwarding, clientOnboarding, fulfillment] = await Promise.allSettled([
      notifyOwner(record),
      forwardAutomation(record),
      !isOneStepCheckout && onboardingMode === 'auto_send' && onboardingEmail.to
        ? sendClientEmail(onboardingEmail)
        : Promise.resolve({
            sent: false,
            reason: isOneStepCheckout
              ? 'One-step checkout carries intake metadata; second onboarding intake email skipped'
              : 'Stripe client onboarding disabled or missing customer email',
          }),
      isOneStepCheckout
        ? processFulfillmentIntake(fulfillmentIntakeFromCheckout(session, record.package || 'Stripe Checkout'))
        : Promise.resolve({ ok: false, reason: 'Not a one-step checkout session' }),
    ])
    const [momentumNotification, momentumForwarding] = await Promise.allSettled([
      notifyOwner(momentumRecord),
      forwardAutomation(momentumRecord),
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
      one_step_fulfillment:
        fulfillment.status === 'fulfilled'
          ? fulfillment.value
          : { ok: false, error: fulfillment.reason?.message },
      post_payment_growth_push: {
        record: momentumRecord,
        notification:
          momentumNotification.status === 'fulfilled'
            ? momentumNotification.value
            : { notified: false, error: momentumNotification.reason?.message },
        forwarding:
          momentumForwarding.status === 'fulfilled'
            ? momentumForwarding.value
            : { forwarded: false, error: momentumForwarding.reason?.message },
      },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
