const DEFAULT_SITE_ORIGIN = 'https://quantumaibusiness.com'
const DEFAULT_OWNER_EMAIL = 'quantumbusinessstrategies@gmail.com'
const LANDING_URL =
  'https://quantumaibusiness.com/growth-scan-pack.html?utm_source=google&utm_medium=paid_search&utm_campaign=thirty_dollar_validation&utm_content=search_scan_pack'

const CHECK_PAGES = [
  ['Main site', 'https://quantumaibusiness.com'],
  ['Growth Scan Pack', LANDING_URL],
  ['Conversion Success Page', 'https://quantumaibusiness.com/scan-pack-thank-you.html'],
  ['Business Growth Scan', 'https://quantumaibusiness.com/business-growth-scan.html'],
  ['Automated Utility', 'https://quantumaibusiness.com/automated-utility.html'],
  ['Sample Scan', 'https://quantumaibusiness.com/sample-growth-scan.html'],
  ['Results Roadmap', 'https://quantumaibusiness.com/results-roadmap.html'],
]

const LANDING_TERMS = [
  ['price', '$49.99'],
  ['checkout path', 'Unlock Scan Pack'],
  ['checkout script', 'landing-checkout.js'],
]
const LANDING_URL_TERMS = [['tracking campaign', 'thirty_dollar_validation']]

function configured(value) {
  return Boolean(value && String(value).trim())
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature, X-Owner-Token, Authorization',
      ...headers,
    },
  })
}

function verifyOwner(request, env) {
  const expected = env.OWNER_ACTION_TOKEN || ''
  const supplied = request.headers.get('X-Owner-Token') || ''
  return Boolean(expected && supplied && supplied === expected)
}

function verifyCronOrOwner(request, env) {
  const cronSecret = env.CRON_SECRET || ''
  return Boolean(
    (cronSecret && request.headers.get('Authorization') === `Bearer ${cronSecret}`) ||
      verifyOwner(request, env),
  )
}

function health(env) {
  return {
    ok: true,
    service: 'quantumaibusiness-cloudflare-worker',
    owner_email: env.OWNER_EMAIL || DEFAULT_OWNER_EMAIL,
    owner_notification_provider: configured(env.RESEND_API_KEY) ? 'resend' : 'formsubmit',
    owner_notification_target: env.OWNER_EMAIL || DEFAULT_OWNER_EMAIL,
    owner_notification_endpoint_configured: configured(env.OWNER_NOTIFICATION_URL),
    public_site_origin: env.PUBLIC_SITE_ORIGIN || DEFAULT_SITE_ORIGIN,
    legacy_backend_origin_configured: configured(env.LEGACY_BACKEND_ORIGIN),
    fulfillment_mode: env.FULFILLMENT_MODE || 'intake_only',
    fulfillment_client_email_mode: env.FULFILLMENT_CLIENT_EMAIL_MODE || 'owner_review',
    lead_follow_up_mode: env.LEAD_FOLLOW_UP_MODE || 'owner_review',
    stripe_client_onboarding_mode: env.STRIPE_CLIENT_ONBOARDING_MODE || 'auto_send',
    migration_mode: configured(env.LEGACY_BACKEND_ORIGIN)
      ? 'cloudflare_first_with_explicit_legacy_fallback'
      : 'cloudflare_owned_no_implicit_fallback',
    configured: {
      resend: configured(env.RESEND_API_KEY),
      resend_from_email: configured(env.RESEND_FROM_EMAIL),
      stripe_secret_key: configured(env.STRIPE_SECRET_KEY),
      stripe_webhook_secret: configured(env.STRIPE_WEBHOOK_SECRET),
      openai_api_key: configured(env.OPENAI_API_KEY),
      automation_webhook: configured(env.AUTOMATION_WEBHOOK_URL),
      owner_action_token: configured(env.OWNER_ACTION_TOKEN),
      cron_secret: configured(env.CRON_SECRET),
      lead_follow_up: configured(env.LEAD_FOLLOW_UP_MODE),
      proof_feedback: configured(env.RESEND_API_KEY) && configured(env.AUTOMATION_WEBHOOK_URL),
      social_queue: configured(env.OWNER_ACTION_TOKEN) && configured(env.OPENAI_API_KEY),
      buffer_api_key: configured(env.BUFFER_API_KEY),
      buffer_channel_ids: configured(env.BUFFER_CHANNEL_IDS),
      social_auto_schedule: env.SOCIAL_AUTO_SCHEDULE === 'true',
    },
  }
}

async function checkPage([label, url]) {
  const started = Date.now()
  try {
    const response = await fetch(url, { redirect: 'follow' })
    const text = await response.text()
    return {
      label,
      url,
      ok: response.ok,
      status: response.status,
      ms: Date.now() - started,
      length: text.length,
      title: text.match(/<title>(.*?)<\/title>/i)?.[1] || '',
      checks: label === 'Growth Scan Pack'
        ? [
            ...LANDING_TERMS.map(([name, term]) => ({ name, ok: text.includes(term) })),
            ...LANDING_URL_TERMS.map(([name, term]) => ({ name, ok: url.includes(term) })),
          ]
        : [],
    }
  } catch (error) {
    return {
      label,
      url,
      ok: false,
      status: 0,
      ms: Date.now() - started,
      length: 0,
      title: error.message,
      checks: [],
    }
  }
}

async function adsPreflight() {
  const results = await Promise.all(CHECK_PAGES.map(checkPage))
  const failedPages = results.filter((item) => !item.ok)
  const failedChecks = results
    .flatMap((item) => item.checks.map((check) => ({ ...check, label: item.label })))
    .filter((check) => !check.ok)
  const ready = failedPages.length === 0 && failedChecks.length === 0

  return {
    ok: true,
    ready,
    launch_mode: ready ? 'ready_for_owner_launch' : 'fix_before_spend',
    next_action: ready
      ? 'Owner may launch the exact/phrase Google Search launch with Display off, $10/day budget, and $30 hard cap.'
      : 'Fix failed page or landing checks before funding Google Ads.',
    failed_pages: failedPages,
    failed_checks: failedChecks,
    recommended_google_ads_settings: {
      campaign: 'QuantumAiBusiness - $30 Search Launch',
      landing_url: LANDING_URL,
      conversion_url: 'https://quantumaibusiness.com/scan-pack-thank-you.html',
      budget: '$10/day with $30 hard cap',
      network: 'Google Search only. Display off. Search Partners off for first test.',
      match_type: 'Phrase/exact only. No broad match on first run.',
      kill_rule: 'Pause at $15 with clicks but no checkout or form signal. Hard stop at $30.',
    },
    results,
  }
}

async function proxyToLegacyBackend(request, env) {
  if (!configured(env.LEGACY_BACKEND_ORIGIN)) {
    return json(
      {
        ok: false,
        error: 'Route is not implemented on the owned API yet',
        next_action: 'Port this /api route into the Cloudflare Worker or configure LEGACY_BACKEND_ORIGIN temporarily.',
      },
      501,
    )
  }

  const origin = env.LEGACY_BACKEND_ORIGIN
  const source = new URL(request.url)
  const target = new URL(source.pathname + source.search, origin)
  return fetch(target.toString(), request)
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return json({ ok: true })

    const url = new URL(request.url)
    if (url.pathname === '/' || url.pathname === '/api/health' || url.pathname === '/health') {
      return json(health(env))
    }

    if (url.pathname === '/api/ads-preflight' || url.pathname === '/api/google-ads-preflight') {
      if (!verifyCronOrOwner(request, env)) {
        return json({ ok: false, error: 'CRON_SECRET or owner action token is missing or invalid' }, 401)
      }
      return json(await adsPreflight())
    }

    if (url.pathname.startsWith('/api/')) {
      return proxyToLegacyBackend(request, env)
    }

    return json({ ok: false, error: 'Not found' }, 404)
  },
}
