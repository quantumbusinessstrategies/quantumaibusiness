const DEFAULT_SITE_ORIGIN = 'https://quantumaibusiness.com'
const DEFAULT_VERCEL_ORIGIN = 'https://quantumaibusiness.vercel.app'
const DEFAULT_OWNER_EMAIL = 'quantumbusinessstrategies@gmail.com'
const LANDING_URL =
  'https://quantumaibusiness.com/growth-scan-pack.html?utm_source=google&utm_medium=paid_search&utm_campaign=fifty_dollar_validation&utm_content=search_scan_pack'

const CHECK_PAGES = [
  ['Main site', 'https://quantumaibusiness.com'],
  ['Growth Scan Pack', LANDING_URL],
  ['Business Growth Scan', 'https://quantumaibusiness.com/business-growth-scan.html'],
  ['Automated Utility', 'https://quantumaibusiness.com/automated-utility.html'],
  ['Sample Scan', 'https://quantumaibusiness.com/sample-growth-scan.html'],
  ['Results Roadmap', 'https://quantumaibusiness.com/results-roadmap.html'],
]

const LANDING_TERMS = [
  ['price', '$49.99'],
  ['tracking campaign', 'fifty_dollar_validation'],
  ['package event', 'package_checkout'],
]

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
    public_site_origin: env.PUBLIC_SITE_ORIGIN || DEFAULT_SITE_ORIGIN,
    vercel_backend_origin: env.VERCEL_BACKEND_ORIGIN || DEFAULT_VERCEL_ORIGIN,
    fulfillment_mode: env.FULFILLMENT_MODE || 'intake_only',
    fulfillment_client_email_mode: env.FULFILLMENT_CLIENT_EMAIL_MODE || 'owner_review',
    lead_follow_up_mode: env.LEAD_FOLLOW_UP_MODE || 'owner_review',
    stripe_client_onboarding_mode: env.STRIPE_CLIENT_ONBOARDING_MODE || 'auto_send',
    migration_mode: 'cloudflare_first_with_vercel_fallback',
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
        ? LANDING_TERMS.map(([name, term]) => ({ name, ok: text.includes(term) }))
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
      ? 'Owner may launch the exact/phrase Google Search test with Display off, $10/day budget, and $50 hard cap.'
      : 'Fix failed page or landing checks before funding Google Ads.',
    failed_pages: failedPages,
    failed_checks: failedChecks,
    recommended_google_ads_settings: {
      campaign: 'QuantumAiBusiness - $50 Search Validation',
      landing_url: LANDING_URL,
      budget: '$10/day with $50 hard cap',
      network: 'Google Search only. Display off. Search Partners off for first test.',
      match_type: 'Phrase/exact only. No broad match on first run.',
      kill_rule: 'Pause at $25 with no checkout or form signal. Hard stop at $50.',
    },
    results,
  }
}

async function proxyToVercel(request, env) {
  const origin = env.VERCEL_BACKEND_ORIGIN || DEFAULT_VERCEL_ORIGIN
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
      return proxyToVercel(request, env)
    }

    return json({ ok: false, error: 'Not found' }, 404)
  },
}
