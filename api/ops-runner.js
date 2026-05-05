import { buildAutomationRecord, forwardAutomation, jsonResponse, notifyOwner, setCors, verifyCronOrOwner } from './_shared.js'

const BACKEND = 'https://quantumaibusiness.vercel.app'
const GOOGLE_ADS_LANDING_URL =
  'https://quantumaibusiness.com/growth-scan-pack.html?utm_source=google&utm_medium=paid_search&utm_campaign=fifty_dollar_validation&utm_content=search_scan_pack'
const GOOGLE_ADS_PAGES = [
  ['Main site', 'https://quantumaibusiness.com'],
  ['Growth Scan Pack', GOOGLE_ADS_LANDING_URL],
  ['Business Growth Scan', 'https://quantumaibusiness.com/business-growth-scan.html'],
  ['Automated Utility', 'https://quantumaibusiness.com/automated-utility.html'],
  ['Sample Scan', 'https://quantumaibusiness.com/sample-growth-scan.html'],
  ['Results Roadmap', 'https://quantumaibusiness.com/results-roadmap.html'],
]
const GOOGLE_ADS_REQUIRED_TERMS = [
  ['price', '$49.99'],
  ['checkout path', 'Start Growth Scan Pack'],
  ['tracking campaign', 'fifty_dollar_validation'],
  ['package event', 'package_checkout'],
]

async function callAutomation(path, source) {
  const cronSecret = process.env.CRON_SECRET || ''
  const response = await fetch(`${BACKEND}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cronSecret}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ source }),
  })
  const payload = await response.json().catch(() => ({ parse_error: true }))
  return {
    path,
    ok: response.ok && payload.ok !== false,
    status: response.status,
    payload: {
      generated: payload.generated,
      scheduler_ready: payload.scheduler_ready,
      auto_schedule_enabled: payload.auto_schedule_enabled,
      notification: payload.notification,
      forwarding: payload.forwarding,
      buffer_schedule: payload.buffer_schedule
        ? {
            scheduled: payload.buffer_schedule.scheduled,
            attempted: payload.buffer_schedule.attempted,
            successful:
              typeof payload.buffer_schedule.successful === 'number'
                ? payload.buffer_schedule.successful
                : payload.buffer_schedule.results?.filter((result) => result.ok).length || 0,
            reason: payload.buffer_schedule.reason || '',
          }
        : undefined,
      error: payload.error,
      generation_reason: payload.generation_reason,
    },
  }
}

async function getHealth() {
  const response = await fetch(`${BACKEND}/api/health`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  const payload = await response.json().catch(() => ({ parse_error: true }))
  return { ok: response.ok && payload.ok !== false, status: response.status, payload }
}

async function checkGoogleAdsPage([label, url]) {
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
        ? GOOGLE_ADS_REQUIRED_TERMS.map(([name, term]) => ({ name, ok: text.includes(term) }))
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

function summarizeGoogleAdsPreflight(results) {
  const failedPages = results.filter((item) => !item.ok)
  const failedChecks = results
    .flatMap((item) => item.checks.map((check) => ({ ...check, label: item.label })))
    .filter((check) => !check.ok)
  const ready = failedPages.length === 0 && failedChecks.length === 0

  return {
    ready,
    launch_mode: ready ? 'ready_for_owner_launch' : 'fix_before_spend',
    next_action: ready
      ? 'Owner may launch the exact/phrase Google Search test with Display off, $10/day budget, and $50 hard cap.'
      : 'Fix failed page or landing checks before funding Google Ads.',
    failed_pages: failedPages,
    failed_checks: failedChecks,
    recommended_google_ads_settings: {
      campaign: 'QuantumAiBusiness - $50 Search Validation',
      landing_url: GOOGLE_ADS_LANDING_URL,
      budget: '$10/day with $50 hard cap',
      network: 'Google Search only. Display off. Search Partners off for first test.',
      match_type: 'Phrase/exact only. No broad match on first run.',
      kill_rule: 'Pause at $25 with no checkout or form signal. Hard stop at $50.',
    },
  }
}

async function runGoogleAdsPreflight() {
  const results = await Promise.all(GOOGLE_ADS_PAGES.map(checkGoogleAdsPage))
  const summary = summarizeGoogleAdsPreflight(results)
  const record = buildAutomationRecord('google_ads_preflight', {
    target: GOOGLE_ADS_LANDING_URL,
    package_key: 'growthScanPack',
    lead_route: summary.ready ? 'owner_daily_review' : 'outlined_strategy_delivery',
    lead_score: summary.ready ? 72 : 28,
    next_action: summary.next_action,
    preflight_summary: summary,
    preflight_results: results,
    source: 'owner_console_google_ads_preflight',
  })
  const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])

  return {
    ok: true,
    ...summary,
    results,
    notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
    forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
  }
}

export default async function handler(req, res) {
  setCors(req, res)

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (!['GET', 'POST'].includes(req.method)) {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  if (!verifyCronOrOwner(req)) {
    jsonResponse(res, 401, { ok: false, error: 'CRON_SECRET or owner action token is missing or invalid' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    if (body.action === 'google_ads_preflight') {
      jsonResponse(res, 200, await runGoogleAdsPreflight())
      return
    }

    const health = await getHealth()
    const jobs = await Promise.allSettled([
      callAutomation('/api/daily-digest', 'ops_runner_daily_digest'),
      callAutomation('/api/campaign-batch', 'ops_runner_campaign_batch'),
      callAutomation('/api/social-queue', 'ops_runner_social_queue'),
    ])

    const results = jobs.map((job, index) =>
      job.status === 'fulfilled'
        ? job.value
        : {
            path: ['/api/daily-digest', '/api/campaign-batch', '/api/social-queue'][index],
            ok: false,
            status: 0,
            payload: { error: job.reason?.message || 'Job failed before response' },
          },
    )
    const failed = results.filter((result) => !result.ok)
    const healthConfig = health.payload?.configured || {}
    const missingConfig = Object.entries(healthConfig)
      .filter(([, value]) => value === false)
      .map(([key]) => key)

    const record = buildAutomationRecord('daily_ops_runner', {
      target: BACKEND,
      package_name: 'Owner Automation',
      package_key: 'growthScanPack',
      lead_score: failed.length || !health.ok ? 76 : 100,
      lead_route: failed.length || !health.ok ? 'full_growth_review' : 'owner_daily_review',
      action_mode: failed.length || !health.ok ? 'owner_review' : 'auto_route',
      next_action:
        failed.length || !health.ok
          ? 'Review failed automation jobs or missing environment settings.'
          : 'Daily automation ran: digest, campaign batch, social queue, and health snapshot.',
      health: {
        ok: health.ok,
        status: health.status,
        configured: healthConfig,
        optional_missing: missingConfig.filter((key) => key === 'owner_notification_url'),
        action_missing: missingConfig.filter((key) => key !== 'owner_notification_url'),
      },
      jobs: results,
    })

    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])
    jsonResponse(res, 200, {
      ok: failed.length === 0 && health.ok,
      health,
      jobs: results,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
