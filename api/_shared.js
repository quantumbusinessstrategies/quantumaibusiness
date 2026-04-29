const DEFAULT_OWNER_EMAIL = 'quantumbusinessstrategies@gmail.com'
const DEFAULT_SITE_ORIGIN = 'https://quantumaibusiness.com'

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature')
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

export function buildAutomationRecord(type, payload = {}) {
  const event = payload.event || payload
  const form = payload.form || event.form || {}
  const selectedPackage = payload.package || event.package || {}
  return {
    event_type: type,
    action_mode:
      selectedPackage.key === 'premiumReferral' || Number(selectedPackage.amount || 0) >= 2500 ? 'owner_review' : 'auto_route',
    timestamp: new Date().toISOString(),
    source: 'quantumaibusiness.com',
    target: form.website || form.company || payload.target || event.target || 'Unspecified',
    contact_email: form.email || payload.customer_email || event.customer_email || '',
    package: selectedPackage.title || payload.package_name || event.package_name || '',
    amount: selectedPackage.amount || payload.amount || event.amount || '',
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
        subject: `QuantumAiBusiness ${record.event_type.replaceAll('_', ' ')}`,
        text: JSON.stringify(record, null, 2),
      }),
    })
    return { notified: response.ok, provider: 'resend', status: response.status }
  }

  const formSubmitEndpoint = process.env.OWNER_NOTIFICATION_URL || `https://formsubmit.co/ajax/${to}`
  const response = await fetch(formSubmitEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `QuantumAiBusiness ${record.event_type.replaceAll('_', ' ')}`,
      _template: 'table',
      _captcha: 'false',
      notify: to,
      event_type: record.event_type,
      action_mode: record.action_mode,
      source: record.source,
      message: JSON.stringify(record, null, 2),
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
