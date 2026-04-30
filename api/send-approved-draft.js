import {
  buildAutomationRecord,
  forwardAutomation,
  handleOptions,
  jsonResponse,
  notifyOwner,
  sendClientEmail,
  setCors,
  verifyOwnerToken,
} from './_shared.js'

function cleanText(value, limit = 10000) {
  return String(value || '').trim().slice(0, limit)
}

export default async function handler(req, res) {
  setCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  if (!verifyOwnerToken({ ...req, body })) {
    jsonResponse(res, 401, { ok: false, error: 'Owner action token is missing or invalid' })
    return
  }

  const to = cleanText(body.to || body.customer_email || body.email, 500)
  const subject = cleanText(body.subject || 'Your QuantumAiBusiness fulfillment draft', 300)
  const text = cleanText(body.text || body.draft || body.deliverable)
  const business = cleanText(body.business || body.company || 'Client business', 500)
  const website = cleanText(body.website, 500)

  if (!to || !text) {
    jsonResponse(res, 400, { ok: false, error: 'Recipient email and approved draft text are required' })
    return
  }

  try {
    const record = buildAutomationRecord('approved_draft_sent', {
      customer_email: to,
      package_name: cleanText(body.package_name || body.package || 'Approved Fulfillment Draft', 500),
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

    jsonResponse(res, 200, {
      ok: true,
      record,
      client_email: clientEmail.status === 'fulfilled' ? clientEmail.value : { sent: false, error: clientEmail.reason?.message },
      notification:
        ownerNotification.status === 'fulfilled'
          ? ownerNotification.value
          : { notified: false, error: ownerNotification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
