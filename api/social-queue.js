import { buildAutomationRecord, forwardAutomation, jsonResponse, notifyOwner, setCors, verifyCronOrOwner } from './_shared.js'

const SITE = 'https://quantumaibusiness.com'
const MONEY_PAGE = `${SITE}/business-growth-scan.html`
const SCAN_PACK_PAGE = `${SITE}/growth-scan-pack.html`
const REFERRAL_PAGE = `${SITE}/refer-business.html`
const MAX_SCHEDULED_POSTS = Math.max(1, Math.min(3, Number(process.env.SOCIAL_MAX_SCHEDULED_POSTS || 1)))
const FACEBOOK_TYPE_REQUIRED = /facebook posts require a type/i
const BUFFER_LIMIT_REACHED = /scheduled posts limit reached/i

function campaignDate() {
  return new Date().toISOString().slice(0, 10)
}

function parseListEnv(value) {
  return String(value || '')
    .split(/[,\s]+/)
    .map((item) => item.trim().replace(/^['"]+|['"]+$/g, ''))
    .filter(Boolean)
}

function buildFallbackQueue() {
  const day = campaignDate()
  const campaign = `organic_queue_${day.replaceAll('-', '')}`
  return [
    `QuantumAiBusiness Organic Social Queue // ${day}`,
    '',
    'Use this as copy-ready queue material for X, LinkedIn, Facebook, Reddit replies where relevant, and short-form captions. Keep it manual or owner-approved until a scheduler token is connected.',
    '',
    '1. X / short post',
    'Most businesses do not lose money only from low traffic. They lose it between the first visit, the unclear next step, the missed follow-up, and the offer that never gets routed.',
    `${MONEY_PAGE}?utm_source=x&utm_medium=organic&utm_campaign=${campaign}_traffic_leak`,
    '',
    '2. X / short post',
    'A pressure scan is simple: name the business, find conversion gaps, find unused follow-up paths, and decide whether strategy or automation is the next best move.',
    `${SCAN_PACK_PAGE}?utm_source=x&utm_medium=organic&utm_campaign=${campaign}_pressure_scan`,
    '',
    '3. LinkedIn / Facebook',
    'If your website gets attention but not enough paid action, the problem may be routing instead of demand. QuantumAiBusiness is built to surface weak offers, missing intake, poor follow-up, and automation opportunities so owners can choose the next practical growth path without guessing.',
    `${MONEY_PAGE}?utm_source=linkedin&utm_medium=organic&utm_campaign=${campaign}_routing`,
    '',
    '4. Direct outreach opener',
    `Quick thought: I am running AI-assisted pressure scans for businesses that may be losing warm prospects between website visit, follow-up, and payment. If you want a first-pass readout, start here: ${MONEY_PAGE}?utm_source=direct&utm_medium=outreach&utm_campaign=${campaign}_owner_note`,
    '',
    '5. Referral angle',
    `Know a business owner whose website looks active but the follow-up path feels weak? Send them here: ${REFERRAL_PAGE}?utm_source=referral&utm_medium=organic&utm_campaign=${campaign}_referral`,
    '',
    'Owner posting rhythm',
    '- Post one short version first.',
    '- Send five real one-to-one messages to businesses you can genuinely help.',
    '- Check the Sheet ledger, Gmail, Stripe, and owner console after posting.',
    '- Do not promise profit, ranking, ad approval, or guaranteed outcomes.',
  ].join('\n')
}

async function generateQueue() {
  if (!process.env.OPENAI_API_KEY) {
    return { generated: false, queue: buildFallbackQueue(), reason: 'OPENAI_API_KEY not configured' }
  }

  const day = campaignDate()
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      max_output_tokens: 2400,
      input: [
        {
          role: 'system',
          content:
            'Create ethical organic marketing copy for an AI-assisted business diagnostics site. No guaranteed profit, no spam, no deception, no impersonation, no instructions to bypass platform limits. Make it direct, useful, and conversion oriented.',
        },
        {
          role: 'user',
          content: [
            `Date: ${day}`,
            `Brand: QuantumAiBusiness`,
            `Primary site: ${SITE}`,
            `Primary page: ${MONEY_PAGE}`,
            `Scan pack page: ${SCAN_PACK_PAGE}`,
            `Referral page: ${REFERRAL_PAGE}`,
            'Offer ladder: free/low-friction pressure scan, $9.99 strategy, $49.99 scan pack, $229.99+ automated utility, $2,500+ full growth review, premium referral.',
            'Create a ready-to-copy queue with: 5 X posts, 2 LinkedIn/Facebook posts, 2 direct outreach messages, 2 referral prompts, 3 short video captions, and a daily owner checklist.',
            'Include UTM links. Keep public claims careful and practical.',
          ].join('\n'),
        },
      ],
    }),
  })

  if (!response.ok) {
    let reason = `OpenAI request failed with status ${response.status}`
    try {
      const errorPayload = await response.json()
      reason = errorPayload.error?.message || reason
    } catch {
      // Keep generic reason.
    }
    return { generated: false, queue: buildFallbackQueue(), status: response.status, reason }
  }

  const data = await response.json()
  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((part) => part.text || '')
      .join('\n')
      .trim()

  return { generated: true, queue: outputText || buildFallbackQueue() }
}

function fallbackSchedulePosts() {
  const campaign = `buffer_queue_${campaignDate().replaceAll('-', '')}`
  return [
    `Most businesses do not lose money only from low traffic. They lose it between the first visit, the unclear next step, the missed follow-up, and the offer that never gets routed. ${MONEY_PAGE}?utm_source=buffer&utm_medium=social&utm_campaign=${campaign}_traffic_leak`,
    `A pressure scan is simple: name the business, find conversion gaps, find unused follow-up paths, and decide whether strategy or automation is the next best move. ${SCAN_PACK_PAGE}?utm_source=buffer&utm_medium=social&utm_campaign=${campaign}_pressure_scan`,
    `Know a business owner whose website looks active but the follow-up path feels weak? Send them here: ${REFERRAL_PAGE}?utm_source=buffer&utm_medium=social&utm_campaign=${campaign}_referral`,
  ]
}

function isSkippableScheduleLine(line) {
  return /^(notes?:|utm |utm_|primary free|scan pack:|referral program:|- |below is|copy|daily owner checklist|[-]{3,})/i.test(line)
}

function compactPostForScheduling(value) {
  const post = String(value || '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["']|["']$/g, '')
  if (post.length <= 260) return post

  const urlMatch = post.match(/https:\/\/quantumaibusiness\.com\/\S+/)
  const url = (urlMatch?.[0] || '').replace(/[)"']+$/g, '')
  const text = url ? post.replace(url, '').trim() : post
  const maxTextLength = url ? 225 - url.length : 255
  const targetLength = Math.max(80, maxTextLength)
  const trimmed = text.length > targetLength ? text.slice(0, targetLength) : text
  const sentenceSafe = trimmed
    .replace(/\s+\S*$/, '')
    .trim()
    .replace(/[.,;:!?-]+$/, '')
  return `${sentenceSafe || trimmed.trim()}...${url ? ` ${url}` : ''}`
}

function extractSchedulePosts(queue) {
  const posts = []
  const lines = String(queue || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (let index = 0; index < lines.length && posts.length < MAX_SCHEDULED_POSTS; index += 1) {
    const line = lines[index]
    if (!/^\d+[).]\s+/.test(line) || !/https:\/\/quantumaibusiness\.com/.test(line) || isSkippableScheduleLine(line)) {
      continue
    }
    posts.push(line.replace(/^\d+[).]\s+/, ''))
  }

  for (let index = 0; index < lines.length && posts.length < MAX_SCHEDULED_POSTS; index += 1) {
    const line = lines[index]
    const next = lines[index + 1] || ''
    const isHeading = /^\d+\.\s|^(x|linkedin|facebook|short|post|caption|referral|direct)/i.test(line)
    const hasUrl = /https:\/\/quantumaibusiness\.com/.test(line)
    const nextHasUrl = /https:\/\/quantumaibusiness\.com/.test(next)

    if (hasUrl && !/^https?:\/\//i.test(line) && !isSkippableScheduleLine(line)) {
      posts.push(line)
      continue
    }

    if (isHeading && next && !/^https?:\/\//i.test(next) && !isSkippableScheduleLine(next)) {
      const url = nextHasUrl ? '' : lines.slice(index + 2, index + 5).find((candidate) => /^https?:\/\//i.test(candidate)) || ''
      posts.push([next, url].filter(Boolean).join(' '))
    }
  }

  return posts
    .map((post) => post.replace(/^[-*]\s*/, '').trim())
    .filter((post) => post.length > 40)
    .map(compactPostForScheduling)
    .slice(0, MAX_SCHEDULED_POSTS)
}

async function scheduleBufferQueue(queue) {
  const apiKey = process.env.BUFFER_API_KEY || ''
  const channelIds = parseListEnv(process.env.BUFFER_CHANNEL_IDS)
  const legacyToken = process.env.BUFFER_ACCESS_TOKEN || ''
  const legacyProfileIds = parseListEnv(process.env.BUFFER_PROFILE_IDS)

  if (process.env.SOCIAL_AUTO_SCHEDULE !== 'true') {
    return { scheduled: false, reason: 'SOCIAL_AUTO_SCHEDULE is not enabled' }
  }
  if ((!apiKey || channelIds.length === 0) && (!legacyToken || legacyProfileIds.length === 0)) {
    return { scheduled: false, reason: 'Buffer API key/channel IDs or legacy token/profile IDs are missing' }
  }

  const posts = extractSchedulePosts(queue)
  const selectedPosts = posts.length ? posts : fallbackSchedulePosts()
  const results = []

  if (apiKey && channelIds.length) {
    for (let index = 0; index < selectedPosts.length; index += 1) {
      const dueAt = new Date(Date.now() + (index + 1) * 2 * 60 * 60 * 1000).toISOString()
      for (const channelId of channelIds) {
        const buildInput = (withFacebookType = false) => ({
          text: selectedPosts[index],
          channelId,
          schedulingType: 'automatic',
          mode: 'customScheduled',
          dueAt,
          source: 'quantumaibusiness-social-queue',
          ...(withFacebookType ? { metadata: { facebook: { type: 'post' } } } : {}),
        })

        const createPost = (withFacebookType = false) =>
          fetch('https://api.buffer.com', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `mutation CreateQuantumPost($input: CreatePostInput!) {
                createPost(input: $input) {
                  ... on PostActionSuccess {
                    post { id text dueAt }
                  }
                  ... on MutationError {
                    message
                  }
                }
              }`,
              variables: {
                input: buildInput(withFacebookType),
              },
            }),
          })

        let response = await createPost(false)
        let payload = await response.json().catch(() => ({ parse_error: true }))
        let mutationResult = payload.data?.createPost || {}
        let retriedWithFacebookType = false

        if (!mutationResult.post?.id && FACEBOOK_TYPE_REQUIRED.test(mutationResult.message || '')) {
          retriedWithFacebookType = true
          response = await createPost(true)
          payload = await response.json().catch(() => ({ parse_error: true }))
          mutationResult = payload.data?.createPost || {}
        }

        const ok = response.ok && Boolean(mutationResult.post?.id)

        results.push({
          ok,
          api: 'buffer_graphql',
          status: response.status,
          channel_id: channelId,
          scheduled_at: dueAt,
          retried_with_facebook_type: retriedWithFacebookType,
          text_preview: selectedPosts[index].slice(0, 180),
          buffer_response: payload,
        })
      }
    }

    const successful = results.filter((result) => result.ok).length
    const limitReached = results.some((result) =>
      BUFFER_LIMIT_REACHED.test(result.buffer_response?.data?.createPost?.message || ''),
    )
    return {
      scheduled: successful > 0,
      attempted: results.length,
      successful,
      reason: limitReached ? 'Buffer scheduled-post limit reached. Let queued posts publish or clear space before scheduling more.' : '',
      results,
    }
  }

  for (let index = 0; index < selectedPosts.length; index += 1) {
    const scheduledAt = new Date(Date.now() + (index + 1) * 2 * 60 * 60 * 1000).toISOString()
    const form = new URLSearchParams()
    form.set('access_token', legacyToken)
    form.set('text', selectedPosts[index])
    form.set('scheduled_at', scheduledAt)
    form.set('shorten', 'false')
    legacyProfileIds.forEach((profileId) => form.append('profile_ids[]', profileId))

    const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })

    const payload = await response.json().catch(() => ({ parse_error: true }))

    results.push({
      ok: response.ok,
      api: 'buffer_rest_legacy',
      status: response.status,
      scheduled_at: scheduledAt,
      text_preview: selectedPosts[index].slice(0, 180),
      buffer_response: payload,
    })
  }

  const successful = results.filter((result) => result.ok).length
  return {
    scheduled: successful > 0,
    attempted: results.length,
    successful,
    reason: successful ? '' : results[0]?.buffer_response?.message || results[0]?.buffer_response?.error || '',
    results,
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
    const generation = await generateQueue()
    const bufferSchedule = await scheduleBufferQueue(generation.queue)
    const record = buildAutomationRecord('organic_social_queue', {
      target: SITE,
      package_name: 'Growth Scan Pack',
      package_key: 'growthScanPack',
      amount: 49.99,
      ai_generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      queue_preview: generation.queue.slice(0, 1600),
      queue_full: generation.queue,
      scheduler_ready: Boolean(
        (process.env.BUFFER_API_KEY && process.env.BUFFER_CHANNEL_IDS) ||
          (process.env.BUFFER_ACCESS_TOKEN && process.env.BUFFER_PROFILE_IDS),
      ),
      auto_schedule_enabled: process.env.SOCIAL_AUTO_SCHEDULE === 'true',
      buffer_schedule: bufferSchedule,
      next_action:
        bufferSchedule.scheduled
          ? 'Buffer scheduling attempted. Review Buffer, then monitor clicks, scans, paid intent, and replies.'
          : 'Review queue, copy strongest posts into current social accounts or a scheduler, and keep paid ads owner-approved.',
    })

    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])
    jsonResponse(res, 200, {
      ok: true,
      generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      queue: generation.queue,
      scheduler_ready: record.payload.scheduler_ready,
      auto_schedule_enabled: record.payload.auto_schedule_enabled,
      buffer_schedule: bufferSchedule,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
