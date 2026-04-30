import {
  buildAutomationRecord,
  forwardAutomation,
  handleOptions,
  jsonResponse,
  notifyOwner,
  setCors,
  verifyOwnerToken,
} from './_shared.js'

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 4000)
}

function buildFallbackCampaign(input) {
  const offer = input.offer || 'QuantumAiBusiness pressure scan'
  const audience = input.audience || 'business owners with weak conversion, slow follow-up, or unclear automation'

  return [
    `QuantumAiBusiness Growth Campaign Pack`,
    '',
    'Campaign objective:',
    `- Promote: ${offer}`,
    `- Audience: ${audience}`,
    `- Main URL: ${input.url || 'https://quantumaibusiness.com'}`,
    `- Owner constraint: ${input.constraints || 'Keep major actions owner-reviewed before public posting or client delivery.'}`,
    '',
    'Organic social posts:',
    '- Post 1: Your website might not be broken. It might just be leaking attention between the first visit, the follow-up, and the paid next step. Run the QuantumAiBusiness pressure scan and find the gaps.',
    '- Post 2: Most businesses do not need more noise first. They need clearer routing, faster follow-up, and a paid path that does not disappear after the visitor gets curious.',
    '- Post 3: QuantumAiBusiness scans for weak offers, missed automation, untracked prospects, and unused growth paths. Start with the scan, then choose strategy, utility, or full growth support.',
    '',
    'Paid ad angles:',
    '- Angle 1: Find the profit leaks hiding in your website, intake, and follow-up path.',
    '- Angle 2: Stop guessing why leads do not convert. Get a practical business pressure scan.',
    '- Angle 3: Turn weak routing and slow follow-up into an owner-reviewed automation path.',
    '',
    'Direct outreach note:',
    'Quick thought: many businesses lose warm prospects between website visit, first contact, and follow-up. I built QuantumAiBusiness to flag those leaks and route owners into a practical strategy or automation path. Run the scan here: https://quantumaibusiness.com',
    '',
    'Seven-day owner-reviewed launch loop:',
    '- Day 1: Post one organic offer and track clicks manually.',
    '- Day 2: Send five direct outreach notes to businesses you can genuinely help.',
    '- Day 3: Review intake records and tighten the scan response copy.',
    '- Day 4: Repost the best-performing message with a different hook.',
    '- Day 5: Push the $9.99 outlined strategy as the low-friction entry.',
    '- Day 6: Follow up with warm responses and route higher-value prospects to automated utility or full strategic growth.',
    '- Day 7: Review Stripe, intake, and owner console pipeline records before scaling spend.',
    '',
    'Guardrail:',
    '- Do not auto-post, auto-DM, or spend ad budget without owner approval and platform-policy review.',
  ].join('\n')
}

async function generateCampaign(input) {
  if (!process.env.OPENAI_API_KEY) {
    return { generated: false, campaign: buildFallbackCampaign(input), reason: 'OPENAI_API_KEY not configured' }
  }

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
            'You create ethical, owner-reviewed growth campaigns for a business automation website. Do not guarantee profits, do not recommend spam, and do not advise posting or spending without approval. Produce practical copy and operating steps.',
        },
        {
          role: 'user',
          content: `Create a growth and advertising automation pack from this JSON:\n${JSON.stringify(input, null, 2)}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    let errorDetail
    try {
      const errorPayload = await response.json()
      errorDetail = errorPayload.error?.message || JSON.stringify(errorPayload)
    } catch {
      errorDetail = await response.text()
    }
    return {
      generated: false,
      campaign: buildFallbackCampaign(input),
      status: response.status,
      reason: errorDetail || `OpenAI request failed with status ${response.status}`,
    }
  }

  const data = await response.json()
  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((part) => part.text || '')
      .join('\n')
      .trim()

  return { generated: true, campaign: outputText || buildFallbackCampaign(input) }
}

export default async function handler(req, res) {
  setCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    req.body = body
    if (!verifyOwnerToken(req)) {
      jsonResponse(res, 401, { ok: false, error: 'Owner action token is missing or invalid' })
      return
    }

    const input = {
      offer: cleanText(body.offer, 'QuantumAiBusiness business pressure scan and paid strategy path'),
      audience: cleanText(body.audience, 'small business owners, service businesses, local operators, creators, and teams with unclear conversion paths'),
      url: cleanText(body.url, process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'),
      channels: cleanText(body.channels, 'X/Twitter, LinkedIn, Facebook, direct outreach, and owner-reviewed paid ads'),
      objective: cleanText(body.objective, 'Drive qualified scans, $9.99 strategy purchases, and upgrades into Automated Utility or Full Strategic Growth.'),
      constraints: cleanText(body.constraints, 'Owner approval required before public posting, direct outreach, client delivery, or paid ad spend.'),
      source: cleanText(body.source, 'owner_console_growth_pack'),
    }

    const generation = await generateCampaign(input)
    const record = buildAutomationRecord('growth_campaign_pack', {
      target: input.url,
      customer_email: '',
      growth_input: input,
      ai_generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      campaign_preview: generation.campaign.slice(0, 1600),
      campaign_full: generation.campaign,
    })

    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])

    jsonResponse(res, 200, {
      ok: true,
      generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      campaign: generation.campaign,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
