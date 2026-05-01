import { forwardAutomation, jsonResponse, notifyOwner, setCors, verifyCronOrOwner } from './_shared.js'

function buildDigest() {
  const publicSite = process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'
  const backend = 'https://quantumaibusiness.vercel.app'
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
      summary: 'Daily QuantumAiBusiness owner command digest.',
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
    const record = buildDigest()
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
