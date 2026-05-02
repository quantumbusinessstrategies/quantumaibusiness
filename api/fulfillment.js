import {
  buildAutomationRecord,
  forwardAutomation,
  handleOptions,
  jsonResponse,
  notifyOwner,
  sendClientEmail,
  setCors,
} from './_shared.js'

export const PACKAGE_NAMES = {
  outlinedStrategy: 'Outlined Strategy',
  growthScanPack: 'Growth Scan Pack',
  automatedUtility: 'Automated Utility',
  fullStrategic: 'Full Strategic Growth',
  premiumReferral: 'Premium QuantumBusinessStrategies Referral',
}
const CLIENT_EMAIL_MODES = new Set(['owner_review', 'auto_send'])
const AUTO_SEND_MODES = new Set(['auto_send', 'auto_send_low_tier', 'auto_send_all'])
const PUBLIC_SITE = process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'
const AUTOMATED_UTILITY_LINK = `${PUBLIC_SITE}/business-growth-scan.html?utm_source=fulfillment&utm_medium=email&utm_campaign=automated_utility_upgrade`
const CLIENT_SUCCESS_GUIDE = `${PUBLIC_SITE}/client-success-guide.html?utm_source=fulfillment&utm_medium=email&utm_campaign=client_success`
const CLIENT_RESULTS_FEEDBACK = `${PUBLIC_SITE}/client-results-feedback.html?utm_source=fulfillment&utm_medium=email&utm_campaign=proof_loop`
const CLIENT_REFERRAL_LINK = `${PUBLIC_SITE}/refer-business.html?utm_source=fulfillment&utm_medium=email&utm_campaign=client_referral`
const PACKAGE_SCOPES = {
  outlinedStrategy: {
    maxTokens: 2600,
    instructions: [
      'This is the $9.99 Outlined Strategy package.',
      'Keep the draft concise: 700-1000 words maximum.',
      'Finish the complete draft. Do not stop mid-list or mid-sentence.',
      'Do not promise implementation, audits, ad management, dashboards, multi-day consulting, or custom build work.',
      'Do not invent fees, timelines, hours, contracts, or access requirements.',
      'Deliver a useful entry-level strategy: snapshot, likely leaks, top 5 fixes, 7-day action plan, and recommended upgrade path.',
      'Mention that Automated Utility is the next step for hands-on workflow setup.',
      'End with this exact line: End of outlined strategy.',
    ].join(' '),
  },
  growthScanPack: {
    maxTokens: 3000,
    instructions: [
      'This is the $49.99 Growth Scan Pack package.',
      'Create an auto-deliverable pack with five concise scan slots/readouts.',
      'The client may use the five scans for business pages, offers, competitors, products, or funnel steps based on the intake.',
      'For each scan slot include: target/focus, likely weakness, growth opportunity, basic AI utility action, and next step.',
      'Do not promise implementation, audits, ad management, dashboards, multi-day consulting, or custom build work.',
      'Do not invent fees, timelines, hours, contracts, or access requirements.',
      'Mention that Automated Utility is the next step if they want intake, alerts, follow-up, and reporting connected.',
      'End with this exact line: End of growth scan pack.',
    ].join(' '),
  },
  automatedUtility: {
    maxTokens: 2800,
    instructions: [
      'This is the Automated Utility package starting at $229.99.',
      'Focus on automation design and implementation planning, not unlimited done-for-you service.',
      'Define intake routing, owner alerts, follow-up sequence, tracking, and handoff checklist.',
      'Flag any owner decisions needed before implementation.',
      'Do not guarantee profit or platform performance.',
      'Finish the complete draft and do not stop mid-list or mid-sentence.',
    ].join(' '),
  },
  fullStrategic: {
    maxTokens: 3200,
    instructions: [
      'This is the Full Strategic Growth package starting at $2,500.',
      'Create an owner-review strategic growth brief, not a final implementation contract.',
      'Include growth architecture, priority risks, automation opportunities, acquisition/conversion/retention plan, and owner review questions.',
      'Do not invent contract terms, legal terms, or guaranteed outcomes.',
      'Finish the complete draft and do not stop mid-list or mid-sentence.',
    ].join(' '),
  },
  premiumReferral: {
    maxTokens: 2200,
    instructions: [
      'This is a premium referral to QuantumBusinessStrategies.',
      'Create a concise referral briefing for owner review.',
      'Summarize why the prospect may require premium handling, what to ask next, and what risks to avoid.',
      'Do not send direct client promises.',
      'Finish the complete draft and do not stop mid-list or mid-sentence.',
    ].join(' '),
  },
}

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 4000)
}

export function normalizePackageKey(value, packageName = '') {
  const text = `${value || ''} ${packageName || ''}`.toLowerCase()
  if (text.includes('premium') || text.includes('referral')) return 'premiumReferral'
  if (text.includes('full') || text.includes('strategic')) return 'fullStrategic'
  if (text.includes('automated') || text.includes('utility')) return 'automatedUtility'
  if (text.includes('scan pack') || text.includes('growth scan')) return 'growthScanPack'
  return 'outlinedStrategy'
}

function normalizeClientEmailMode(value) {
  if (AUTO_SEND_MODES.has(value)) return value
  if (CLIENT_EMAIL_MODES.has(value)) return value
  return 'owner_review'
}

function canAutoSendClientDeliverable({ clientEmailMode, packageKey, reviewOnly, generated }) {
  if (!generated || reviewOnly) return false
  if (clientEmailMode === 'auto_send_all' || clientEmailMode === 'auto_send') return true
  return clientEmailMode === 'auto_send_low_tier' && ['outlinedStrategy', 'growthScanPack'].includes(packageKey)
}

function buildClientSubject(intake) {
  const business = intake.company || intake.website || 'your business'
  return `Your QuantumAiBusiness ${intake.package_name || PACKAGE_NAMES[intake.package_key] || 'Strategy'} for ${business}`
}

function buildClientDeliveryText(intake, deliverable) {
  const business = intake.company || intake.website || 'your business'
  const upgradePath =
    ['outlinedStrategy', 'growthScanPack'].includes(intake.package_key)
      ? [
          '',
          'Recommended upgrade path:',
          'If you want this turned into connected intake, owner alerts, follow-up, and reporting, the Automated Utility package is the next practical step.',
          `Continue here: ${AUTOMATED_UTILITY_LINK}`,
        ].join('\n')
      : ''

  return [
    `Hi,`,
    '',
    `Thanks for submitting your QuantumAiBusiness intake for ${business}. Your package-scoped strategy draft is below.`,
    '',
    deliverable,
    '',
    'How to use this:',
    `Use the Client Success Guide here: ${CLIENT_SUCCESS_GUIDE}`,
    'Start with the repeated bottleneck, turn it into one practical task, then measure whether more prospects move into form fills, replies, checkout starts, purchases, or clearer owner decisions.',
    '',
    'After you try one action:',
    `Send feedback, blockers, or referral signals here: ${CLIENT_RESULTS_FEEDBACK}`,
    '',
    'Know another owner with a weak website path, missed follow-up, or unclear automation route?',
    `Refer them here: ${CLIENT_REFERRAL_LINK}`,
    upgradePath,
    '',
    'Important note: QuantumAiBusiness provides strategic diagnostics, automation guidance, and opportunity mapping. Results are not guaranteed and depend on execution, market conditions, platform policies, data quality, and the actions taken by the business.',
    '',
    'Best,',
    'QuantumAiBusiness',
  ].join('\n')
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
  if (packageKey === 'growthScanPack') {
    const target = intake.website || intake.company || 'Primary business'
    return [
      `QuantumAiBusiness Growth Scan Pack for ${business}`,
      '',
      'Business snapshot:',
      `- Primary target: ${target}`,
      `- Objective: ${intake.objective || 'Find growth leaks, scan multiple business angles, and identify automation-ready opportunities.'}`,
      `- Current tools: ${intake.current_tools || 'Not provided'}`,
      '',
      'Five scan slots:',
      '- Scan 1: Main offer clarity // Weakness: unclear first action // Utility: rewrite the offer into one direct promise and one next step.',
      '- Scan 2: Lead capture path // Weakness: warm interest may not be saved // Utility: map every form, button, email, and contact action into a single lead record.',
      '- Scan 3: Follow-up gap // Weakness: interested prospects can go cold // Utility: draft a simple 3-message follow-up path for non-buyers or incomplete inquiries.',
      '- Scan 4: Traffic source logic // Weakness: source quality may be unknown // Utility: tag links and compare which sources create scans, payments, and replies.',
      '- Scan 5: Upgrade readiness // Weakness: strategy may stay manual // Utility: identify whether Automated Utility should connect alerts, intake, follow-up, and reporting.',
      '',
      'Basic AI utility actions:',
      '- Use each scan slot on one business page, service offer, competitor page, landing page, or workflow step.',
      '- Compare the five outputs and prioritize the repeat problems first.',
      '- Upgrade only if the business needs the recommendations turned into a connected system.',
      '',
      'Note: This pack provides automated strategic readouts and utility prompts, not implementation, legal advice, financial advice, ad management, or guaranteed outcomes.',
      '',
      'End of growth scan pack.',
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

export async function processFulfillmentIntake(body = {}) {
    if (body.action === 'send_approved_draft') {
      if (!body.owner_token || body.owner_token !== process.env.OWNER_ACTION_TOKEN) {
        return { ok: false, statusCode: 401, error: 'Owner action token is missing or invalid' }
      }

      const to = cleanText(body.to || body.customer_email || body.email, '')
      const subject = cleanText(body.subject || 'Your QuantumAiBusiness fulfillment draft')
      const text = cleanText(body.text || body.draft || body.deliverable)
      const business = cleanText(body.business || body.company || 'Client business')
      const website = cleanText(body.website)

      if (!to || !text) {
        return { ok: false, statusCode: 400, error: 'Recipient email and approved draft text are required' }
      }

      const record = buildAutomationRecord('approved_draft_sent', {
        customer_email: to,
        package_name: cleanText(body.package_name || body.package || 'Approved Fulfillment Draft'),
        form: {
          company: business,
          website,
          email: to,
        },
        approved_subject: subject,
        approved_draft_preview: text.slice(0, 1200),
      })

      const [clientEmail, ownerNotification, forwarding] = await Promise.allSettled([
        sendClientEmail({ to, subject, text }),
        notifyOwner(record),
        forwardAutomation(record),
      ])

      return {
        ok: true,
        record,
        client_email: clientEmail.status === 'fulfilled' ? clientEmail.value : { sent: false, error: clientEmail.reason?.message },
        notification:
          ownerNotification.status === 'fulfilled'
            ? ownerNotification.value
            : { notified: false, error: ownerNotification.reason?.message },
        forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
      }
    }

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
      return { ok: false, statusCode: 400, error: 'Customer or payment email is required' }
    }

    const mode = process.env.FULFILLMENT_MODE || 'intake_only'
    const clientEmailMode = normalizeClientEmailMode(process.env.FULFILLMENT_CLIENT_EMAIL_MODE)
    const reviewOnly = body.review_only !== false
    const shouldGenerate = mode === 'auto_generate' || body.owner_approved === true
    const generation = shouldGenerate
      ? await generateDeliverable(intake)
      : { generated: false, deliverable: '', reason: 'FULFILLMENT_MODE is intake_only' }
    const shouldEmailClient = canAutoSendClientDeliverable({
      clientEmailMode,
      packageKey: intake.package_key,
      reviewOnly,
      generated: generation.generated && Boolean(generation.deliverable),
    })
    const clientDeliveryText = generation.deliverable ? buildClientDeliveryText(intake, generation.deliverable) : ''

    const record = buildAutomationRecord('paid_fulfillment_intake', {
      package_key: intake.package_key,
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
            subject: buildClientSubject(intake),
            text: clientDeliveryText,
          })
        : Promise.resolve({
            sent: false,
            reason: generation.deliverable
              ? `Client auto-send not eligible for mode ${clientEmailMode}; deliverable held for owner review`
              : 'No deliverable generated yet',
          }),
    ])

    return {
      ok: true,
      mode,
      client_email_mode: clientEmailMode,
      review_only: reviewOnly,
      owner_review_required: !shouldEmailClient,
      auto_send_eligible: shouldEmailClient,
      generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      deliverable: generation.deliverable,
      client_delivery_text: clientDeliveryText,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
      client_email: clientEmail.status === 'fulfilled' ? clientEmail.value : { sent: false, error: clientEmail.reason?.message },
    }
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
    const result = await processFulfillmentIntake(body)
    jsonResponse(res, result.statusCode || 200, result)
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
