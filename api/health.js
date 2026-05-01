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
    fulfillment_client_email_mode: process.env.FULFILLMENT_CLIENT_EMAIL_MODE || 'owner_review',
    stripe_client_onboarding_mode: process.env.STRIPE_CLIENT_ONBOARDING_MODE || 'auto_send',
    growth_campaign_mode: configured(process.env.OWNER_ACTION_TOKEN)
      ? 'owner_token_required'
      : 'waiting_for_owner_action_token',
    campaign_batch_mode: configured(process.env.CRON_SECRET)
      ? 'daily_cron_enabled'
      : 'waiting_for_cron_secret',
    social_queue_mode: configured(process.env.OWNER_ACTION_TOKEN)
      ? 'owner_token_required'
      : 'waiting_for_owner_action_token',
    lead_router_mode: configured(process.env.OWNER_ACTION_TOKEN)
      ? 'owner_token_required'
      : 'waiting_for_owner_action_token',
    configured: {
      resend: configured(process.env.RESEND_API_KEY),
      resend_from_email: configured(process.env.RESEND_FROM_EMAIL),
      stripe_webhook_secret: configured(process.env.STRIPE_WEBHOOK_SECRET),
      openai_api_key: configured(process.env.OPENAI_API_KEY),
      automation_webhook: configured(process.env.AUTOMATION_WEBHOOK_URL),
      owner_notification_url: configured(process.env.OWNER_NOTIFICATION_URL),
      owner_action_token: configured(process.env.OWNER_ACTION_TOKEN),
      cron_secret: configured(process.env.CRON_SECRET),
      social_queue: configured(process.env.OWNER_ACTION_TOKEN) && configured(process.env.OPENAI_API_KEY),
      buffer_access_token: configured(process.env.BUFFER_ACCESS_TOKEN),
      buffer_profile_ids: configured(process.env.BUFFER_PROFILE_IDS),
    },
  })
}
