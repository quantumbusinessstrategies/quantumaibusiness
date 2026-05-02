import { buildAutomationRecord, forwardAutomation, handleOptions, jsonResponse, notifyOwner, setCors } from './_shared.js'
import { normalizePackageKey, PACKAGE_NAMES } from './fulfillment.js'

const PACKAGE_AMOUNTS = {
  outlinedStrategy: 999,
  growthScanPack: 4999,
  automatedUtility: 22999,
  fullStrategic: 250000,
}

function cleanText(value, fallback = '', limit = 500) {
  return String(value || fallback).trim().slice(0, limit)
}

function appendParam(form, key, value) {
  if (value !== undefined && value !== null && value !== '') form.append(key, String(value))
}

function metadataValue(value) {
  return cleanText(value, '', 480)
}

function buildCheckoutForm(intake) {
  const site = process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'
  const packageKey = normalizePackageKey(intake.package_key || intake.packageKey, intake.package_name || intake.packageName)
  const amount = PACKAGE_AMOUNTS[packageKey]
  const packageName = PACKAGE_NAMES[packageKey] || 'QuantumAiBusiness Package'

  if (!amount) {
    return { error: 'This package is owner-reviewed and cannot use instant checkout yet.' }
  }

  const successUrl = `${site}/?checkout=success&package=${encodeURIComponent(packageKey)}&session_id={CHECKOUT_SESSION_ID}#fulfillment`
  const cancelUrl = `${site}/?checkout=cancel&package=${encodeURIComponent(packageKey)}#packages`
  const form = new URLSearchParams()

  appendParam(form, 'mode', 'payment')
  appendParam(form, 'success_url', successUrl)
  appendParam(form, 'cancel_url', cancelUrl)
  appendParam(form, 'allow_promotion_codes', 'true')
  appendParam(form, 'customer_email', intake.customer_email || intake.email)
  appendParam(form, 'client_reference_id', `qab_${Date.now()}`)
  appendParam(form, 'line_items[0][quantity]', '1')
  appendParam(form, 'line_items[0][price_data][currency]', 'usd')
  appendParam(form, 'line_items[0][price_data][unit_amount]', amount)
  appendParam(form, 'line_items[0][price_data][product_data][name]', `QuantumAiBusiness ${packageName}`)
  appendParam(
    form,
    'line_items[0][price_data][product_data][description]',
    packageKey === 'growthScanPack'
      ? 'Five AI-assisted growth scan readouts from the submitted business intake.'
      : packageKey === 'automatedUtility'
        ? 'Owner-reviewed automation utility planning from the submitted business intake.'
        : packageKey === 'fullStrategic'
          ? 'Owner-reviewed strategic growth briefing from the submitted business intake.'
          : 'AI-assisted outlined strategy from the submitted business intake.',
  )

  const metadata = {
    auto_checkout_intake: 'true',
    package_key: packageKey,
    package_name: packageName,
    company: intake.company,
    website: intake.website,
    customer_email: intake.customer_email || intake.email,
    objective: intake.objective,
    current_tools: intake.current_tools || intake.currentTools,
    constraints: intake.constraints,
    attribution: JSON.stringify(intake.attribution || {}).slice(0, 480),
    source: intake.source || 'site_one_step_checkout',
  }

  Object.entries(metadata).forEach(([key, value]) => {
    appendParam(form, `metadata[${key}]`, metadataValue(value))
    appendParam(form, `payment_intent_data[metadata][${key}]`, metadataValue(value))
  })

  return { form, packageKey, packageName, amount }
}

export default async function handler(req, res) {
  setCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    jsonResponse(res, 501, { ok: false, error: 'STRIPE_SECRET_KEY is not configured' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const intake = {
      package_key: cleanText(body.package_key || body.packageKey),
      package_name: cleanText(body.package_name || body.packageName),
      company: cleanText(body.company),
      website: cleanText(body.website),
      customer_email: cleanText(body.customer_email || body.email),
      objective: cleanText(body.objective),
      current_tools: cleanText(body.current_tools || body.currentTools),
      constraints: cleanText(body.constraints),
      attribution: body.attribution || {},
      source: cleanText(body.source, 'site_one_step_checkout'),
    }

    if (!intake.customer_email || !intake.customer_email.includes('@')) {
      jsonResponse(res, 400, { ok: false, error: 'Delivery email is required before checkout' })
      return
    }

    if (!intake.company && !intake.website) {
      jsonResponse(res, 400, { ok: false, error: 'Business name or website is required before checkout' })
      return
    }

    const checkout = buildCheckoutForm(intake)
    if (checkout.error) {
      jsonResponse(res, 400, { ok: false, error: checkout.error })
      return
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: checkout.form,
    })
    const session = await response.json()

    if (!response.ok) {
      jsonResponse(res, response.status, { ok: false, error: session.error?.message || 'Stripe checkout session failed' })
      return
    }

    const record = buildAutomationRecord('one_step_checkout_created', {
      package_key: checkout.packageKey,
      package_name: checkout.packageName,
      customer_email: intake.customer_email,
      amount: checkout.amount / 100,
      target: intake.website || intake.company,
      form: {
        company: intake.company,
        website: intake.website,
        email: intake.customer_email,
        objective: intake.objective,
        current_tools: intake.current_tools,
        constraints: intake.constraints,
      },
      stripe_checkout_session: session.id,
      next_action: 'Checkout created with intake metadata. If payment completes, Stripe webhook can fulfill from the same metadata.',
    })

    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])

    jsonResponse(res, 200, {
      ok: true,
      url: session.url,
      id: session.id,
      package_key: checkout.packageKey,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
