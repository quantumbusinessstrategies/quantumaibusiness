import {
  buildAutomationRecord,
  forwardAutomation,
  handleOptions,
  jsonResponse,
  notifyOwner,
  sendClientEmail,
  setCors,
} from './_shared.js'

const PACKAGE_NAMES = {
  outlinedStrategy: 'Outlined Strategy',
  automatedUtility: 'Automated Utility',
  fullStrategic: 'Full Strategic Growth',
  premiumReferral: 'Premium QuantumBusinessStrategies Referral',
}
const CLIENT_EMAIL_MODES = new Set(['owner_review', 'auto_send'])

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 4000)
}

function buildFallbackDeliverable(intake) {
  const business = intake.company || intake.website || 'the business'
  return [
    `QuantumAiBusiness fulfillment draft for ${business}`,
    '',
    'Priority readout:',
    `- Package: ${PACKAGE_NAMES[intake.package_key] || intake.package_name || 'Unspecified'}`,
    `- Target: ${intake.website || intake.company || 'Unspecified'}`,
    `- Growth goal: ${intake.objective || 'Increase lead quality, conversion, follow-up, and operating clarity.'}`,
    '',
    'Initial action map:',
    '- Tighten the offer so the next step is obvious within the first screen.',
    '- Route every lead into instant follow-up, owner alerting, and a tracked status.',
    '- Add a paid next step or consultation path directly after the diagnostic.',
    '- Track traffic source, business type, selected package, payment status, and next owner action.',
    '- Escalate high-value or premium prospects to owner review before major delivery decisions.',
    '',
    'Owner note: OPENAI_API_KEY is not configured or auto generation is disabled, so this fallback draft was created without an AI API call.',
  ].join('\n')
}

async function generateDeliverable(intake) {
  if (!process.env.OPENAI_API_KEY) {
    return { generated: false, deliverable: buildFallbackDeliverable(intake), reason: 'OPENAI_API_KEY not configured' }
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      max_output_tokens: 1800,
      input: [
        {
          role: 'system',
          content:
            'You create practical business growth diagnostics. Be direct, ethical, specific, and useful. Do not guarantee profits. Keep the output organized for delivery to a paying client.',
        },
        {
          role: 'user',
          content: `Create a QuantumAiBusiness paid fulfillment draft from this intake JSON:\n${JSON.stringify(intake, null, 2)}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    return { generated: false, deliverable: buildFallbackDeliverable(intake), status: response.status }
  }

  const data = await response.json()
  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((part) => part.text || '')
      .join('\n')
      .trim()

  return { generated: true, deliverable: outputText || buildFallbackDeliverable(intake) }
}

export default async function handler(req, res) {
  setCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const intake = {
      package_key: cleanText(body.package_key || body.packageKey),
      package_name: cleanText(body.package_name || body.packageName || PACKAGE_NAMES[body.package_key]),
      company: cleanText(body.company),
      website: cleanText(body.website),
      customer_email: cleanText(body.customer_email || body.email),
      payment_email: cleanText(body.payment_email || body.paymentEmail),
      objective: cleanText(body.objective),
      constraints: cleanText(body.constraints),
      current_tools: cleanText(body.current_tools || body.currentTools),
      source: cleanText(body.source, 'paid_fulfillment_intake'),
    }

    if (!intake.customer_email && !intake.payment_email) {
      jsonResponse(res, 400, { ok: false, error: 'Customer or payment email is required' })
      return
    }

    const mode = process.env.FULFILLMENT_MODE || 'intake_only'
    const clientEmailMode = CLIENT_EMAIL_MODES.has(process.env.FULFILLMENT_CLIENT_EMAIL_MODE)
      ? process.env.FULFILLMENT_CLIENT_EMAIL_MODE
      : 'owner_review'
    const reviewOnly = body.review_only !== false
    const shouldGenerate = mode === 'auto_generate' || body.owner_approved === true
    const generation = shouldGenerate
      ? await generateDeliverable(intake)
      : { generated: false, deliverable: '', reason: 'FULFILLMENT_MODE is intake_only' }
    const shouldEmailClient =
      clientEmailMode === 'auto_send' && generation.generated && generation.deliverable && !reviewOnly

    const record = buildAutomationRecord('paid_fulfillment_intake', {
      package_name: intake.package_name,
      customer_email: intake.customer_email || intake.payment_email,
      amount: body.amount || '',
      form: {
        company: intake.company,
        website: intake.website,
        email: intake.customer_email || intake.payment_email,
        objective: intake.objective,
      },
      fulfillment_mode: mode,
      client_email_mode: clientEmailMode,
      review_only: reviewOnly,
      ai_generated: generation.generated,
      intake,
      deliverable_preview: generation.deliverable.slice(0, 1200),
    })

    const [notification, forwarding, clientEmail] = await Promise.allSettled([
      notifyOwner(record),
      forwardAutomation(record),
      shouldEmailClient
        ? sendClientEmail({
            to: intake.customer_email || intake.payment_email,
            subject: `QuantumAiBusiness ${intake.package_name || 'Fulfillment'} Draft`,
            text: generation.deliverable,
          })
        : Promise.resolve({
            sent: false,
            reason: generation.deliverable
              ? 'Client auto-send disabled; deliverable held for owner review'
              : 'No deliverable generated yet',
          }),
    ])

    jsonResponse(res, 200, {
      ok: true,
      mode,
      client_email_mode: clientEmailMode,
      review_only: reviewOnly,
      owner_review_required: !shouldEmailClient,
      generated: generation.generated,
      deliverable: generation.deliverable,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
      client_email: clientEmail.status === 'fulfilled' ? clientEmail.value : { sent: false, error: clientEmail.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
