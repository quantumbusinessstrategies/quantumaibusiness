import { buildAutomationRecord, forwardAutomation, jsonResponse, notifyOwner, setCors, verifyCronOrOwner } from './_shared.js'

const MONEY_PAGE = 'https://quantumaibusiness.com/business-growth-scan.html'
const SCAN_PACK_PAGE = 'https://quantumaibusiness.com/growth-scan-pack.html'

function datedCampaignId() {
  return new Date().toISOString().slice(0, 10).replaceAll('-', '')
}

function fallbackBatch() {
  const id = datedCampaignId()
  return [
    `QuantumAiBusiness Daily Campaign Batch ${id}`,
    '',
    'Primary link:',
    `${MONEY_PAGE}?utm_source=manual&utm_medium=organic&utm_campaign=daily_${id}`,
    '',
    'Primary offer:',
    '- Push the $49.99 Growth Scan Pack first.',
    '- Mention the free first-pass scan only as a warm-up.',
    '- Route serious prospects toward Automated Utility after the scan reveals repeated workflow gaps.',
    '',
    'Post 1:',
    'Your business might not need more traffic first. It might need fewer leaks between the first visit, the follow-up, and the paid next step.',
    `${MONEY_PAGE}?utm_source=x&utm_medium=organic&utm_campaign=daily_${id}_post1`,
    '',
    'Post 2:',
    'If people visit but do not act, pressure-test the path: offer clarity, lead capture, owner alerts, follow-up, and reporting.',
    `${MONEY_PAGE}?utm_source=x&utm_medium=organic&utm_campaign=daily_${id}_post2`,
    '',
    'Post 3:',
    'New scan pack: five AI-assisted readouts across pages, offers, competitors, products, or funnel steps.',
    `${SCAN_PACK_PAGE}?utm_source=x&utm_medium=organic&utm_campaign=daily_${id}_post3`,
    '',
    'Direct outreach note:',
    `Quick thought: a lot of businesses lose warm prospects between visit, follow-up, and paid action. I built QuantumAiBusiness to pressure-test that path. Start here: ${MONEY_PAGE}?utm_source=direct&utm_medium=outreach&utm_campaign=daily_${id}`,
    '',
    'Owner action loop:',
    '- Post one public message.',
    '- Send five useful one-to-one notes to businesses you can genuinely help.',
    '- Check Stripe, Gmail, owner console, and the Sheet ledger.',
    '- Keep ad spend and direct-message automation owner-approved.',
  ].join('\n')
}

async function generateBatch() {
  if (!process.env.OPENAI_API_KEY) {
    return { generated: false, batch: fallbackBatch(), reason: 'OPENAI_API_KEY not configured' }
  }

  const id = datedCampaignId()
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      max_output_tokens: 2200,
      input: [
        {
          role: 'system',
          content:
            'Create ethical daily monetization copy for an AI-assisted business diagnostics website. No guaranteed profits, no spam, no deception, no auto-posting instructions. Focus on organic posts, direct outreach, and owner-reviewed ads.',
        },
        {
          role: 'user',
          content: [
            `Campaign ID: daily_${id}`,
            `Primary money page: ${MONEY_PAGE}?utm_source=manual&utm_medium=organic&utm_campaign=daily_${id}`,
            `Primary purchase page: ${SCAN_PACK_PAGE}?utm_source=manual&utm_medium=organic&utm_campaign=daily_${id}`,
            'Primary offer: $49.99 Growth Scan Pack.',
            'Create: 5 X posts, 1 LinkedIn/Facebook post, 1 direct outreach note, 3 paid-ad angles for later review, 1 owner checklist.',
            'Keep it concise, useful, and conversion-oriented.',
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
      // Keep the generic reason.
    }
    return { generated: false, batch: fallbackBatch(), status: response.status, reason }
  }

  const data = await response.json()
  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((part) => part.text || '')
      .join('\n')
      .trim()

  return { generated: true, batch: outputText || fallbackBatch() }
}

export default async function handler(req, res) {
  setCors(req, res)

  if (!['GET', 'POST'].includes(req.method)) {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  if (!verifyCronOrOwner(req)) {
    jsonResponse(res, 401, { ok: false, error: 'CRON_SECRET or owner action token is missing or invalid' })
    return
  }

  try {
    const generation = await generateBatch()
    const record = buildAutomationRecord('daily_campaign_batch', {
      target: MONEY_PAGE,
      package_name: 'Growth Scan Pack',
      package_key: 'growthScanPack',
      amount: 49.99,
      ai_generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      campaign_preview: generation.batch.slice(0, 1600),
      campaign_full: generation.batch,
      next_action: 'Review campaign batch, post the strongest message manually, and keep paid ads owner-approved.',
    })

    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])
    jsonResponse(res, 200, {
      ok: true,
      generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      batch: generation.batch,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
