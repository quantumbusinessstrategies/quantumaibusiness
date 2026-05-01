import {
  buildAutomationRecord,
  forwardAutomation,
  handleOptions,
  jsonResponse,
  notifyOwner,
  routeNextAction,
  scoreAutomationLead,
  setCors,
  verifyOwnerToken,
} from './_shared.js'

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 4000)
}

function buildFallbackFollowUp(input, route) {
  const business = input.business || 'your business'
  const nextAction = routeNextAction(route)
  return [
    `Subject: Next step for ${business}`,
    '',
    'Hi,',
    '',
    `I reviewed the intake details for ${business} and the clearest next step is: ${nextAction}`,
    '',
    'The practical priority is to reduce missed interest between the website, first contact, follow-up, and paid next step. The fastest improvement is usually a tighter intake path, faster owner alerting, and a simple follow-up sequence.',
    '',
    'Recommended next action:',
    '- Confirm the main offer and target customer.',
    '- Confirm the current website/contact/booking tools.',
    '- Decide whether you want a strategy-only path or the Automated Utility upgrade to connect the workflow.',
    '',
    'Important note: this is strategic guidance and does not guarantee revenue, profit, ad approval, ranking, or platform performance.',
    '',
    'Best,',
    'QuantumAiBusiness',
  ].join('\n')
}

async function generateFollowUp(input, route, score) {
  if (!process.env.OPENAI_API_KEY) {
    return { generated: false, draft: buildFallbackFollowUp(input, route), reason: 'OPENAI_API_KEY not configured' }
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      max_output_tokens: 1800,
      input: [
        {
          role: 'system',
          content:
            'Create concise owner-reviewed customer follow-up emails for QuantumAiBusiness. Do not guarantee profit. Do not invent contract terms, prices beyond package labels, timelines, or completed work. Make the next step clear and ethical.',
        },
        {
          role: 'user',
          content: `Create one follow-up email draft from this routed lead. Include subject line, greeting, 2-4 short paragraphs, 3 recommended bullets, and a short disclaimer.\nScore: ${score}\nRoute: ${route}\nNext action: ${routeNextAction(route)}\nLead JSON:\n${JSON.stringify(input, null, 2)}`,
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
      draft: buildFallbackFollowUp(input, route),
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

  return { generated: true, draft: outputText || buildFallbackFollowUp(input, route) }
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
      package_key: cleanText(body.package_key || body.packageKey, 'outlinedStrategy'),
      package_name: cleanText(body.package_name || body.packageName, 'Outlined Strategy'),
      business: cleanText(body.business || body.company, 'Client business'),
      website: cleanText(body.website, 'Not provided'),
      email: cleanText(body.email || body.customer_email, ''),
      objective: cleanText(body.objective, 'Increase conversion, follow-up, automation, and growth clarity.'),
      tools: cleanText(body.tools || body.current_tools || body.currentTools, 'Not provided'),
      constraints: cleanText(body.constraints, 'Not provided'),
      source: cleanText(body.source, 'owner_console_follow_up'),
    }
    const routeData = scoreAutomationLead({
      package_key: input.package_key,
      form: {
        company: input.business,
        website: input.website === 'Not provided' ? '' : input.website,
        email: input.email,
        objective: input.objective,
        current_tools: input.tools === 'Not provided' ? '' : input.tools,
        constraints: input.constraints === 'Not provided' ? '' : input.constraints,
      },
    })
    const generation = await generateFollowUp(input, routeData.lead_route, routeData.lead_score)
    const record = buildAutomationRecord('follow_up_draft', {
      target: input.website || input.business,
      customer_email: input.email,
      package_key: input.package_key,
      package_name: input.package_name,
      lead_score: routeData.lead_score,
      lead_route: routeData.lead_route,
      next_action: routeNextAction(routeData.lead_route),
      ai_generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      follow_up_preview: generation.draft.slice(0, 1400),
      follow_up_full: generation.draft,
      input,
    })

    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])

    jsonResponse(res, 200, {
      ok: true,
      score: routeData.lead_score,
      route: routeData.lead_route,
      generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      draft: generation.draft,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
