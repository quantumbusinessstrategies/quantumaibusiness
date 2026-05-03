import {
  buildAutomationRecord,
  forwardAutomation,
  handleOptions,
  jsonResponse,
  notifyOwner,
  sendClientEmail,
  setCors,
} from './_shared.js'

const PUBLIC_SITE = process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'

function clean(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 4000)
}

function buildCaseNote(body) {
  const company = clean(body.company, 'Client business')
  const packageName = clean(body.package_name || body.packageName || body.package_key, 'Growth Scan Pack')
  const implemented = clean(body.implemented, 'No implementation note supplied.')
  const signal = clean(body.result_signal || body.resultSignal, 'No measurable signal supplied yet.')
  const blocker = clean(body.blocker, 'No blocker supplied.')
  const permission = clean(body.permission, 'private')

  return [
    `QuantumAiBusiness case note candidate: ${company}`,
    '',
    `Package: ${packageName}`,
    `Proof permission: ${permission}`,
    '',
    'What changed or was noticed:',
    implemented,
    '',
    'Signal reported:',
    signal,
    '',
    'Current blocker:',
    blocker,
    '',
    'Owner action:',
    permission === 'anonymous_public'
      ? 'Review for an anonymous case note. Remove identifying details before publishing.'
      : 'Keep private unless the client later approves anonymous/public use.',
  ].join('\n')
}

function buildClientConfirmation(body) {
  const company = clean(body.company, 'your business')
  const utilityLink = `${PUBLIC_SITE}/automated-utility.html?utm_source=proof_feedback&utm_medium=email&utm_campaign=feedback_upgrade`
  const referralLink = `${PUBLIC_SITE}/refer-business.html?utm_source=proof_feedback&utm_medium=email&utm_campaign=feedback_referral`

  return [
    'Hi,',
    '',
    `Thanks for sending the follow-up signal for ${company}. This helps QuantumAiBusiness tighten the next recommendation instead of guessing from a cold report.`,
    '',
    'What happens next:',
    '- Your feedback is logged for owner review.',
    '- If the blocker points to intake, follow-up, alerts, reporting, or workflow routing, Automated Utility is the practical next path.',
    '- If there is a larger strategic or premium signal, it can be reviewed before any bigger scope is discussed.',
    '',
    `Automated Utility: ${utilityLink}`,
    `Refer another business: ${referralLink}`,
    '',
    'Important note: QuantumAiBusiness provides diagnostics, automation guidance, and opportunity mapping. Outcomes are not guaranteed and depend on execution, data quality, market conditions, platform policies, and business follow-through.',
    '',
    'Best,',
    'QuantumAiBusiness',
  ].join('\n')
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
    const email = clean(body.email || body.customer_email)
    const company = clean(body.company)
    const caseNote = buildCaseNote(body)

    if (!email || !company || !clean(body.implemented)) {
      jsonResponse(res, 400, { ok: false, error: 'Business name, email, and implementation/feedback note are required' })
      return
    }

    const record = buildAutomationRecord('client_proof_feedback', {
      customer_email: email,
      package_key: clean(body.package_key || body.packageKey),
      package_name: clean(body.package_name || body.packageName || body.package_key || 'Client Feedback'),
      form: {
        company,
        website: clean(body.website),
        email,
        objective: clean(body.implemented),
        current_tools: clean(body.result_signal || body.resultSignal),
        constraints: clean(body.blocker),
      },
      permission: clean(body.permission, 'private'),
      referral: clean(body.referral),
      case_note_preview: caseNote.slice(0, 1200),
      case_note_full: caseNote,
      next_action: 'Review proof signal, save usable anonymous case notes, and route automation blockers toward Automated Utility.',
      payload: {
        ...body,
        case_note: caseNote,
      },
    })

    const [ownerNotification, forwarding, clientConfirmation] = await Promise.allSettled([
      notifyOwner(record),
      forwardAutomation(record),
      sendClientEmail({
        to: email,
        subject: `QuantumAiBusiness feedback received for ${company}`,
        text: buildClientConfirmation(body),
      }),
    ])

    jsonResponse(res, 200, {
      ok: true,
      record,
      case_note: caseNote,
      notification:
        ownerNotification.status === 'fulfilled'
          ? ownerNotification.value
          : { notified: false, error: ownerNotification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
      client_email:
        clientConfirmation.status === 'fulfilled'
          ? clientConfirmation.value
          : { sent: false, error: clientConfirmation.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
