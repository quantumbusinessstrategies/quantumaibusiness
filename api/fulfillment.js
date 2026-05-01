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
const PACKAGE_SCOPES = {
  outlinedStrategy: {
    maxTokens: 1200,
    instructions: [
      'This is the $9.99 Outlined Strategy package.',
      'Keep the draft concise: 700-1000 words maximum.',
      'Do not promise implementation, audits, ad management, dashboards, multi-day consulting, or custom build work.',
      'Do not invent fees, timelines, hours, contracts, or access requirements.',
      'Deliver a useful entry-level strategy: snapshot, likely leaks, top 5 fixes, 7-day action plan, and recommended upgrade path.',
      'Mention that Automated Utility is the next step for hands-on workflow setup.',
    ].join(' '),
  },
  automatedUtility: {
    maxTokens: 1600,
    instructions: [
      'This is the Automated Utility package starting at $229.99.',
      'Focus on automation design and implementation planning, not unlimited done-for-you service.',
      'Define intake routing, owner alerts, follow-up sequence, tracking, and handoff checklist.',
      'Flag any owner decisions needed before implementation.',
      'Do not guarantee profit or platform performance.',
    ].join(' '),
  },
  fullStrategic: {
    maxTokens: 1800,
    instructions: [
      'This is the Full Strategic Growth package starting at $2,500.',
      'Create an owner-review strategic growth brief, not a final implementation contract.',
      'Include growth architecture, priority risks, automation opportunities, acquisition/conversion/retention plan, and owner review questions.',
      'Do not invent contract terms, legal terms, or guaranteed outcomes.',
    ].join(' '),
  },
  premiumReferral: {
    maxTokens: 1200,
    instructions: [
      'This is a premium referral to QuantumBusinessStrategies.',
      'Create a concise referral briefing for owner review.',
      'Summarize why the prospect may require premium handling, what to ask next, and what risks to avoid.',
      'Do not send direct client promises.',
    ].join(' '),
  },
}

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 4000)
}

function normalizePackageKey(value, packageName = '') {
  const text = `${value || ''} ${packageName || ''}`.toLowerCase()
  if (text.includes('premium') || text.includes('referral')) return 'premiumReferral'
  if (text.includes('full') || text.includes('strategic')) return 'fullStrategic'
  if (text.includes('automated') || text.includes('utility')) return 'automatedUtility'
  return 'outlinedStrategy'
}

function buildFallbackDeliverable(intake) {
  const business = intake.company || intake.website || 'the business'
  const packageKey = normalizePackageKey(intake.package_key, intake.package_name)
  if (packageKey === 'outlinedStrategy') {
    return [
      `QuantumAiBusiness Outlined Strategy for ${business}`,
      '',
      'Business snapshot:',
      `- Target: ${intake.website || intake.company || 'Unspecified'}`,
      `- Objective: ${intake.objective || 'Increase lead quality, conversion clarity, follow-up, and automation readiness.'}`,
      `- Current tools: ${intake.current_tools || 'Not provided'}`,
      '',
      'Likely profit leaks:',
      '- The first offer may not be clear enough for a cold visitor to act quickly.',
      '- Lead capture and follow-up may not be connected tightly enough.',
      '- Interested prospects may not be routed into a simple paid next step.',
      '- Tracking may not clearly show which actions create leads or revenue.',
      '',
      'Top five fixes:',
      '- Make the main offer and next action obvious above the fold.',
      '- Route all form submissions to owner notification and a tracking ledger.',
      '- Add a short follow-up path for anyone who shows interest but does not buy.',
      '- Track package interest, source, email, business name, and next owner action.',
      '- Push obvious workflow gaps toward the Automated Utility package.',
      '',
      '7-day action plan:',
      '- Day 1: Clarify the main offer in one sentence.',
      '- Day 2: Confirm every button routes to scan, payment, intake, or contact.',
      '- Day 3: Verify owner alerts and ledger tracking.',
      '- Day 4: Draft one follow-up message for warm prospects.',
      '- Day 5: Post one organic offer with a trackable link.',
      '- Day 6: Review leads and route upgrade candidates.',
      '- Day 7: Decide whether automation setup is needed.',
      '',
      'Recommended next step:',
      '- Automated Utility is the best upgrade if the business needs intake routing, follow-up, alerts, or reporting connected.',
      '',
      'Note: This is an entry-level strategy outline, not a guarantee of revenue or a full implementation plan.',
    ].join('\n')
  }
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

  const packageKey = normalizePackageKey(intake.package_key, intake.package_name)
  const scope = PACKAGE_SCOPES[packageKey] || PACKAGE_SCOPES.outlinedStrategy
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      max_output_tokens: scope.maxTokens,
      input: [
        {
          role: 'system',
          content: [
            'You create practical QuantumAiBusiness fulfillment drafts.',
            'Be direct, ethical, specific, and useful.',
            'Do not guarantee profits, revenue, rankings, ad approval, or platform performance.',
            'Do not invent prices, contracts, timelines, hours, access requirements, or legal promises.',
            'Do not claim work has been performed beyond the information supplied.',
            'Keep the output aligned to the paid package scope.',
            scope.instructions,
          ].join(' '),
        },
        {
          role: 'user',
          content: `Create a package-scoped QuantumAiBusiness fulfillment draft from this intake JSON:\n${JSON.stringify({ ...intake, normalized_package_key: packageKey }, null, 2)}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    let errorDetail
    try {
      const errorPayload = await response.json()
      errorDetail = errorPayload.error?.message || JSON.stringify(errorPayload)
    } catch {
      errorDetail = await response.text()
    }
    return {
      generated: false,
      deliverable: buildFallbackDeliverable(intake),
      status: response.status,
      reason: errorDetail || `OpenAI request failed with status ${response.status}`,
    }
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
      package_key: cleanText(normalizePackageKey(body.package_key || body.packageKey, body.package_name || body.packageName)),
      package_name: cleanText(body.package_name || body.packageName || PACKAGE_NAMES[normalizePackageKey(body.package_key || body.packageKey, body.package_name || body.packageName)]),
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
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      intake,
      deliverable_preview: generation.deliverable.slice(0, 1200),
      deliverable_full: generation.deliverable,
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
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
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
