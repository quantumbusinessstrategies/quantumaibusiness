const DEFAULT_OWNER_EMAIL = 'quantumbusinessstrategies@gmail.com'
const DEFAULT_SITE_ORIGIN = 'https://quantumaibusiness.com'
const PACKAGE_WEIGHT = {
  outlinedStrategy: 14,
  growthScanPack: 24,
  automatedUtility: 34,
  fullStrategic: 58,
  premiumReferral: 64,
}
const PACKAGE_LABELS = {
  outlinedStrategy: 'Outlined Strategy',
  growthScanPack: 'Growth Scan Pack',
  automatedUtility: 'Automated Utility',
  fullStrategic: 'Full Strategic Growth',
  premiumReferral: 'Premium Referral',
}

export function ownerEmail() {
  return process.env.OWNER_EMAIL || process.env.VITE_CONTACT_EMAIL || DEFAULT_OWNER_EMAIL
}

export function allowedOrigins() {
  return new Set([
    DEFAULT_SITE_ORIGIN,
    process.env.PUBLIC_SITE_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean))
}

export function setCors(req, res) {
  const origin = req.headers.origin
  const allowed = allowedOrigins()
  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature, X-Owner-Token')
}

export function handleOptions(req, res) {
  setCors(req, res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}

export async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

export function jsonResponse(res, statusCode, body) {
  res.status(statusCode).json(body)
}

export function verifyOwnerToken(req) {
  const expected = process.env.OWNER_ACTION_TOKEN || ''
  const headers = req.headers || {}
  const supplied = headers['x-owner-token'] || headers['X-Owner-Token'] || req.body?.owner_token || req.body?.ownerToken || ''
  return Boolean(expected && supplied && supplied === expected)
}

export function verifyCronOrOwner(req) {
  const cronSecret = process.env.CRON_SECRET || ''
  const headers = req.headers || {}
  const authHeader = headers.authorization || headers.Authorization || ''
  return Boolean((cronSecret && authHeader === `Bearer ${cronSecret}`) || verifyOwnerToken(req))
}

function clampScore(value) {
  return Math.max(1, Math.min(100, Math.round(value)))
}

function classifyLead(score, packageKey) {
  if (packageKey === 'premiumReferral' || score >= 78) return 'premium_review'
  if (score >= 58) return 'full_growth_review'
  if (score >= 36) return 'automated_utility_upsell'
  return 'outlined_strategy_delivery'
}

export function inferPackageKey(payload = {}) {
  const selectedPackage = payload.package || {}
  const amount = Number(selectedPackage.amount || payload.amount || 0)
  const packageText = String(
    payload.package_key ||
      payload.packageKey ||
      selectedPackage.key ||
      payload.package_name ||
      payload.packageName ||
      payload.package ||
      selectedPackage.title ||
      '',
  ).toLowerCase()

  if (packageText.includes('premium') || packageText.includes('referral')) return 'premiumReferral'
  if (packageText.includes('full') || packageText.includes('strategic') || amount >= 2500) return 'fullStrategic'
  if (packageText.includes('automated') || packageText.includes('utility') || amount >= 229) return 'automatedUtility'
  if (packageText.includes('scan pack') || packageText.includes('growth scan') || amount >= 49.99) return 'growthScanPack'
  if (packageText.includes('outlined') || packageText.includes('strategy') || amount >= 9.99) return 'outlinedStrategy'
  return ''
}

export function routeNextAction(route) {
  if (route === 'premium_review') {
    return 'Owner review now: treat as high-touch, avoid automated promises, and route to QuantumBusinessStrategies if qualified.'
  }
  if (route === 'full_growth_review') {
    return 'Owner review: confirm scope, budget, timeline, tools, and decision maker before any full-growth promise.'
  }
  if (route === 'automated_utility_upsell') {
    return 'Deliver current value, then recommend Automated Utility for intake, alerts, follow-up, and reporting.'
  }
  if (route === 'outlined_strategy_delivery') {
    return 'Deliver the outlined strategy cleanly, then watch for automation pain or upgrade signals.'
  }
  if (route === 'owner_daily_review') {
    return 'Review the ledger, fulfill paid drafts, score open leads, and approve only the strongest growth actions.'
  }
  return 'Review the record and choose the safest next owner action.'
}

export function scoreAutomationLead(payload = {}) {
  const form = payload.form || payload
  const packageKey = inferPackageKey(payload)
  const business = form.company || form.business || payload.company || payload.business || ''
  const website = form.website || payload.website || ''
  const email = form.email || payload.customer_email || payload.email || ''
  const objective = form.objective || payload.objective || ''
  const tools = form.current_tools || form.currentTools || payload.current_tools || payload.currentTools || payload.tools || ''
  const constraints = form.constraints || payload.constraints || ''
  const text = `${business} ${website} ${objective} ${tools} ${constraints}`.toLowerCase()
  let score = PACKAGE_WEIGHT[packageKey] || 18

  if (website) score += 8
  if (email && email.includes('@')) score += 6
  if (/(crm|hubspot|stripe|shopify|booking|calendar|ads|meta|google|mailchimp|zapier|make|airtable|sheets)/.test(text)) score += 10
  if (/(lead|sales|conversion|follow.?up|automation|growth|profit|revenue|client|customer)/.test(text)) score += 12
  if (/(urgent|asap|scale|high ticket|premium|enterprise|multi|team|agency)/.test(text)) score += 12
  if (/(budget|cash|funds|cheap|free|later|not sure)/.test(text)) score -= 8
  if (constraints) score += 4

  const leadScore = clampScore(score)
  return {
    package_key: packageKey,
    lead_score: leadScore,
    lead_route: classifyLead(leadScore, packageKey),
  }
}

export function buildAutomationRecord(type, payload = {}) {
  const event = payload.event || payload
  const form = payload.form || event.form || {}
  const selectedPackage = payload.package || event.package || {}
  const leadRoute = scoreAutomationLead(payload)
  const actionMode =
    leadRoute.package_key === 'premiumReferral' ||
    Number(selectedPackage.amount || 0) >= 2500 ||
    leadRoute.lead_route === 'premium_review' ||
    leadRoute.lead_route === 'full_growth_review'
      ? 'owner_review'
      : 'auto_route'
  return {
    event_type: type,
    action_mode: actionMode,
    timestamp: new Date().toISOString(),
    source: 'quantumaibusiness.com',
    target: form.website || form.company || payload.target || event.target || 'Unspecified',
    contact_email: form.email || payload.customer_email || event.customer_email || '',
    package: selectedPackage.title || payload.package_name || event.package_name || PACKAGE_LABELS[leadRoute.package_key] || '',
    package_key: payload.package_key || payload.packageKey || selectedPackage.key || leadRoute.package_key,
    amount: selectedPackage.amount || payload.amount || event.amount || '',
    lead_score: payload.lead_score || leadRoute.lead_score,
    lead_route: payload.lead_route || leadRoute.lead_route,
    next_action: payload.next_action || routeNextAction(payload.lead_route || leadRoute.lead_route),
    payload,
  }
}

export async function forwardAutomation(record) {
  const endpoint = process.env.AUTOMATION_WEBHOOK_URL || ''
  if (!endpoint) return { forwarded: false, reason: 'AUTOMATION_WEBHOOK_URL not configured' }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  })

  return { forwarded: response.ok, status: response.status }
}

export async function notifyOwner(record) {
  const to = ownerEmail()
  const routeLabel = record.lead_route ? record.lead_route.replaceAll('_', ' ') : 'unrouted'
  const scoreLabel = record.lead_score ? `${record.lead_score}/100` : 'no score'
  const eventType = record.event_type || 'owner_event'
  const eventLabel = eventType.replaceAll('_', ' ')
  const category = /(stripe|checkout|payment)/i.test(eventType)
    ? 'PAYMENT'
    : /(lead|intake|fulfillment|referral|diagnostic)/i.test(eventType)
      ? 'CLIENT'
      : /(growth|campaign|social|digest|post_payment)/i.test(eventType)
        ? 'OWNER AUTOMATION'
        : 'SYSTEM'
  const priority =
    record.action_mode === 'owner_review' || record.lead_route === 'premium_review' || Number(record.lead_score || 0) >= 58
      ? 'PRIORITY'
      : 'LOG'
  const subject = `QuantumAiBusiness ${category} ${priority} // ${eventLabel} // ${scoreLabel} // ${routeLabel}`
  const message = [
    subject,
    '',
    `Category: ${category}`,
    `Event: ${eventLabel}`,
    `Target: ${record.target || 'Unspecified'}`,
    `Contact: ${record.contact_email || 'Unspecified'}`,
    `Package: ${record.package || 'Unspecified'}`,
    `Amount: ${record.amount || 'Unspecified'}`,
    `Action mode: ${record.action_mode || 'Unspecified'}`,
    `Next action: ${record.next_action || routeNextAction(record.lead_route)}`,
    '',
    'Full record:',
    JSON.stringify(record, null, 2),
  ].join('\n')
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'QuantumAiBusiness <onboarding@resend.dev>',
        to,
        subject,
        text: message,
      }),
    })
    return { notified: response.ok, provider: 'resend', status: response.status }
  }

  const formSubmitEndpoint = process.env.OWNER_NOTIFICATION_URL || `https://formsubmit.co/ajax/${to}`
  const response = await fetch(formSubmitEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
      notify: to,
      event_type: record.event_type,
      action_mode: record.action_mode,
      source: record.source,
      message,
    }),
  })

  return { notified: response.ok, provider: 'formsubmit', status: response.status }
}

export async function sendClientEmail({ to, subject, text }) {
  if (!to) return { sent: false, reason: 'No client email supplied' }
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: 'RESEND_API_KEY not configured' }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'QuantumAiBusiness <onboarding@resend.dev>',
      to,
      bcc: ownerEmail(),
      subject,
      text,
    }),
  })

  return { sent: response.ok, provider: 'resend', status: response.status }
}
