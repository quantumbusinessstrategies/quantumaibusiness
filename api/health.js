import { handleOptions, jsonResponse, ownerEmail, setCors } from './_shared.js'

function configured(value) {
  return Boolean(value && String(value).trim())
}

export default async function handler(req, res) {
  setCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  jsonResponse(res, 200, {
    ok: true,
    service: 'quantumaibusiness-backend',
    owner_email: ownerEmail(),
    public_site_origin: process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com',
    fulfillment_mode: process.env.FULFILLMENT_MODE || 'intake_only',
    configured: {
      resend: configured(process.env.RESEND_API_KEY),
      resend_from_email: configured(process.env.RESEND_FROM_EMAIL),
      stripe_webhook_secret: configured(process.env.STRIPE_WEBHOOK_SECRET),
      openai_api_key: configured(process.env.OPENAI_API_KEY),
      automation_webhook: configured(process.env.AUTOMATION_WEBHOOK_URL),
      owner_notification_url: configured(process.env.OWNER_NOTIFICATION_URL),
    },
  })
}
