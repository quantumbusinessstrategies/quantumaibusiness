import { forwardAutomation, jsonResponse, notifyOwner, setCors, verifyCronOrOwner } from './_shared.js'

function fallbackCommand(publicSite) {
  return [
    'QuantumAiBusiness Daily Revenue Command',
    '',
    'Primary manual post for today:',
    `Most businesses do not just need more traffic. They lose money between the first visit, the unclear next step, weak follow-up, and offers that never get routed. I built QuantumAiBusiness to pressure-scan that path and turn gaps into next actions: ${publicSite}/business-growth-scan.html?utm_source=x&utm_medium=organic&utm_campaign=daily_revenue_command`,
    '',
    'Direct outreach note:',
    `Quick thought: I am running AI-assisted pressure scans for business owners who want to find weak routing, unclear offers, missed follow-up, and unused automation paths. If you want a first-pass readout, start here: ${publicSite}/business-growth-scan.html?utm_source=direct&utm_medium=outreach&utm_campaign=daily_revenue_command`,
    '',
    'Today only needs three moves:',
    '1. Post the primary manual post from an account you already control.',
    '2. Send five real one-to-one notes to businesses you can genuinely help.',
    '3. Check Stripe, Gmail, the Sheet ledger, and the local owner console for paid actions.',
    '',
    'Rules:',
    '- No profit guarantees.',
    '- No spam blasts.',
    '- No paid ad spend without owner approval.',
    '- Route serious replies into Automated Utility, Full Strategic Growth, or premium referral.',
  ].join('\n')
}

async function generateCommand(publicSite) {
  if (!process.env.OPENAI_API_KEY) {
    return { generated: false, command: fallbackCommand(publicSite), reason: 'OPENAI_API_KEY not configured' }
  }

  const today = new Date().toISOString().slice(0, 10)
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
            'Create a concise ethical daily revenue command for an AI-assisted business diagnostics website. No guaranteed profits, no spam, no deception, no auto-DM, no paid spend without approval.',
        },
        {
          role: 'user',
          content: [
            `Date: ${today}`,
            `Site: ${publicSite}`,
            `Primary scan page: ${publicSite}/business-growth-scan.html`,
            `Scan pack page: ${publicSite}/growth-scan-pack.html`,
            'Offer ladder: free/low-friction scan, $9.99 paid diagnostic, $49.99 growth scan pack, $229.99+ automated utility, $2,500+ full strategic growth, premium referral.',
            'Produce: one X post, one LinkedIn/Facebook post, one direct outreach note, one referral ask, and a short owner checklist.',
            'Keep wording punchy, practical, and careful. Include UTM links.',
          ].join('\n'),
        },
      ],
    }),
  })

  if (!response.ok) {
    let reason = `OpenAI request failed with status ${response.status}`
    try {
      const errorPayload = await response.json()
      reason = errorPayload.error?.message || reason
    } catch {
      // Keep generic reason.
    }
    return { generated: false, command: fallbackCommand(publicSite), status: response.status, reason }
  }

  const data = await response.json()
  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((part) => part.text || '')
      .join('\n')
      .trim()

  return { generated: true, command: outputText || fallbackCommand(publicSite) }
}

async function buildDigest() {
  const publicSite = process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'
  const backend = 'https://quantumaibusiness.vercel.app'
  const command = await generateCommand(publicSite)
  return {
    event_type: 'daily_owner_digest',
    action_mode: 'owner_review',
    timestamp: new Date().toISOString(),
    source: 'quantumaibusiness.com',
    target: 'owner_daily_ops',
    contact_email: process.env.OWNER_EMAIL || 'quantumbusinessstrategies@gmail.com',
    package: 'Owner Automation',
    amount: '',
    lead_score: 100,
    lead_route: 'owner_daily_review',
    next_action: 'Review the ledger, fulfill paid drafts, score open leads, and approve only the strongest growth actions.',
    payload: {
      summary: 'Daily QuantumAiBusiness owner revenue command digest.',
      ai_generated: command.generated,
      generation_status: command.status || '',
      generation_reason: command.reason || '',
      command_text: command.command,
      links: {
        public_site: publicSite,
        fulfillment: `${publicSite}/#fulfillment`,
        backend_health: `${backend}/api/health`,
        owner_console: 'http://localhost:5173/owner',
      },
      today_actions: [
        'Check the Google Sheets ledger for new Stripe, lead, fulfillment, route, and growth-pack rows.',
        'Open the local owner console and refresh backend health.',
        'Score any paid intake that has not been routed yet.',
        'Request review drafts for paid clients.',
        'Send approved drafts only after owner review.',
        'Mark obvious upgrade targets and follow up with the Automated Utility path.',
        'Generate one growth campaign pack and approve only the strongest copy for posting.',
      ],
      operating_rules: [
        'Auto-send onboarding emails after Stripe checkout.',
        'Auto-generate fulfillment drafts, but hold client delivery for owner review.',
        'Keep $229.99+, $2,500+, and premium prospects owner-reviewed.',
        'Do not auto-post, auto-DM, or auto-spend ad budget without a separate approval step.',
      ],
    },
  }
}

export default async function handler(req, res) {
  setCors(req, res)

  if (!['GET', 'POST'].includes(req.method)) {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  if (!verifyCronOrOwner(req)) {
    jsonResponse(res, 401, { ok: false, error: 'CRON_SECRET or owner action token is missing or invalid' })
    return
  }

  try {
    const record = await buildDigest()
    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])
    jsonResponse(res, 200, {
      ok: true,
      generated: Boolean(record.payload.ai_generated),
      generation_status: record.payload.generation_status,
      generation_reason: record.payload.generation_reason,
      command_text: record.payload.command_text,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
