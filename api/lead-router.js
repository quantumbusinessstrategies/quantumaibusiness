import {
  buildAutomationRecord,
  forwardAutomation,
  handleOptions,
  jsonResponse,
  notifyOwner,
  scoreAutomationLead,
  setCors,
  verifyOwnerToken,
} from './_shared.js'

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 4000)
}

function buildFallbackRoute(input, score, route) {
  const business = input.business || input.website || 'Client business'
  const routeName = route.replaceAll('_', ' ')
  return [
    `QuantumAiBusiness Lead Route: ${business}`,
    '',
    `Score: ${score}/100`,
    `Route: ${routeName}`,
    '',
    'Recommended owner action:',
    route === 'premium_review'
      ? '- Treat this as a high-touch prospect. Review manually, reply from QuantumBusinessStrategies, and avoid automated promises until scoped.'
      : route === 'full_growth_review'
        ? '- Prepare a full strategic growth review. Confirm budget, timeline, tools, and decision maker before sending implementation promises.'
        : route === 'automated_utility_upsell'
          ? '- Deliver the current strategy, then recommend Automated Utility as the fastest path to fix intake, alerts, follow-up, and tracking.'
          : '- Deliver the outlined strategy cleanly, then watch for signs of follow-up pain or automation readiness.',
    '',
    'Why this route:',
    `- Package selected: ${input.package_name || input.package_key || 'Unspecified'}`,
    `- Website/profile: ${input.website || 'Not provided'}`,
    `- Objective: ${input.objective || 'Not provided'}`,
    `- Current tools: ${input.tools || 'Not provided'}`,
    `- Constraints: ${input.constraints || 'Not provided'}`,
    '',
    'Next message angle:',
    route === 'premium_review'
      ? '- Position the conversation around scope, risk, operational leverage, and owner-reviewed execution.'
      : route === 'full_growth_review'
        ? '- Position the conversation around strategic growth architecture, conversion repair, and implementation sequencing.'
        : route === 'automated_utility_upsell'
          ? '- Position the next step around making the strategy operational with routing, notifications, follow-up, and reporting.'
          : '- Position the next step around clarity, immediate fixes, and the low-friction paid strategy path.',
  ].join('\n')
}

async function generateRouteReport(input, score, route) {
  if (!process.env.OPENAI_API_KEY) {
    return { generated: false, report: buildFallbackRoute(input, score, route), reason: 'OPENAI_API_KEY not configured' }
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      max_output_tokens: 1400,
      input: [
        {
          role: 'system',
          content:
            'You are an owner-reviewed business lead router. Be concise, practical, ethical, and revenue-aware. Do not guarantee profits. Recommend the next owner action and the best package path.',
        },
        {
          role: 'user',
          content: `Create a lead routing report using this score and route. Keep it easy for an owner to act on.\nScore: ${score}\nRoute: ${route}\nLead JSON:\n${JSON.stringify(input, null, 2)}`,
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
      report: buildFallbackRoute(input, score, route),
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

  return { generated: true, report: outputText || buildFallbackRoute(input, score, route) }
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
      source: cleanText(body.source, 'owner_console_lead_router'),
    }

    const { lead_score: score, lead_route: route } = scoreAutomationLead({
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
    const generation = await generateRouteReport(input, score, route)
    const record = buildAutomationRecord('lead_route_review', {
      target: input.website || input.business,
      customer_email: input.email,
      package_name: input.package_name,
      lead_score: score,
      lead_route: route,
      ai_generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      route_report_preview: generation.report.slice(0, 1400),
      route_report_full: generation.report,
      input,
    })

    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])

    jsonResponse(res, 200, {
      ok: true,
      score,
      route,
      generated: generation.generated,
      generation_status: generation.status || '',
      generation_reason: generation.reason || '',
      report: generation.report,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
