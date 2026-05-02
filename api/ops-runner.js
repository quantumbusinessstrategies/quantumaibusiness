import { buildAutomationRecord, forwardAutomation, jsonResponse, notifyOwner, setCors, verifyCronOrOwner } from './_shared.js'

const BACKEND = 'https://quantumaibusiness.vercel.app'

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
            successful: payload.buffer_schedule.results?.filter((result) => result.ok).length || 0,
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
