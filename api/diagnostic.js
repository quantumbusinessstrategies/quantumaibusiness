import { buildAutomationRecord, forwardAutomation, handleOptions, jsonResponse, notifyOwner, setCors } from './_shared.js'

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 25
const diagnosticHits = globalThis.__quantumAiDiagnosticHits || new Map()
globalThis.__quantumAiDiagnosticHits = diagnosticHits

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 1200)
}

function getClientKey(req) {
  const forwarded = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For'] || ''
  return String(forwarded).split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
}

function isRateLimited(req) {
  const now = Date.now()
  const key = getClientKey(req)
  const hits = (diagnosticHits.get(key) || []).filter((hit) => now - hit < RATE_LIMIT_WINDOW_MS)
  hits.push(now)
  diagnosticHits.set(key, hits)

  for (const [storedKey, storedHits] of diagnosticHits.entries()) {
    const freshHits = storedHits.filter((hit) => now - hit < RATE_LIMIT_WINDOW_MS)
    if (freshHits.length) diagnosticHits.set(storedKey, freshHits)
    else diagnosticHits.delete(storedKey)
  }

  return hits.length > RATE_LIMIT_MAX
}

function fallbackDiagnostic(input) {
  const target = input.target || input.website || input.company || 'the business'
  return {
    diagnostic:
      `First-pass growth diagnostic for ${target}: the strongest opportunity is likely clearer offer routing, faster follow-up, and a cleaner paid next step. This is an opportunity scan, not a guarantee of results.`,
    opportunities: [
      'Clarify the main offer and next action before visitors have to think too hard.',
      'Connect every lead action to owner alerting, follow-up, and a tracked status.',
      'Use a low-friction paid strategy offer to identify serious buyers.',
      'Route automation-ready businesses toward workflow utility instead of one-off advice.',
    ],
    risks: [
      'Slow or unclear follow-up can lose warm interest.',
      'Untracked lead sources make growth decisions feel like guessing.',
      'A broad offer can attract curiosity without enough paid action.',
    ],
    recommended_package: 'outlinedStrategy',
    next_step: 'Start with the $9.99 Outlined Strategy, then upgrade to Automated Utility if follow-up or routing gaps are confirmed.',
  }
}

async function generateDiagnostic(input) {
  if (!process.env.OPENAI_API_KEY) {
    return { generated: false, ...fallbackDiagnostic(input), reason: 'OPENAI_API_KEY not configured' }
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
      text: {
        format: {
          type: 'json_schema',
          name: 'business_diagnostic',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              diagnostic: { type: 'string' },
              opportunities: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 },
              risks: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 },
              recommended_package: {
                type: 'string',
                enum: ['outlinedStrategy', 'automatedUtility', 'fullStrategic', 'premiumReferral'],
              },
              next_step: { type: 'string' },
            },
            required: ['diagnostic', 'opportunities', 'risks', 'recommended_package', 'next_step'],
          },
        },
      },
      input: [
        {
          role: 'system',
          content:
            'Create concise first-pass business growth diagnostics. Return only valid JSON matching the schema. Do not promise or guarantee profit, revenue, rankings, ad results, or outcomes. Keep diagnostic under 420 characters, each opportunity/risk under 160 characters, and next_step under 180 characters. Give useful opportunity framing and package routing. Keep it ethical, practical, and direct.',
        },
        {
          role: 'user',
          content: `Create a first-pass QuantumAiBusiness diagnostic from this input JSON:\n${JSON.stringify(input, null, 2)}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    return { generated: false, ...fallbackDiagnostic(input), status: response.status, reason: `OpenAI request failed with status ${response.status}` }
  }

  const data = await response.json()
  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((part) => part.text || '')
      .join('\n')
      .trim()

  try {
    return { generated: true, ...JSON.parse(outputText) }
  } catch {
    return { generated: false, ...fallbackDiagnostic(input), reason: 'OpenAI returned an unparsable diagnostic' }
  }
}

export default async function handler(req, res) {
  setCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    jsonResponse(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  try {
    if (isRateLimited(req)) {
      jsonResponse(res, 429, { ok: false, error: 'Too many diagnostic requests. Please wait a few minutes and try again.' })
      return
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const input = {
      target: cleanText(body.target),
      company: cleanText(body.company),
      website: cleanText(body.website),
      objective: cleanText(body.objective),
      email: cleanText(body.email),
      source: cleanText(body.source, 'public_quantify_business'),
    }

    if (!input.target && !input.company && !input.website) {
      jsonResponse(res, 400, { ok: false, error: 'Business name or website is required' })
      return
    }

    const diagnostic = await generateDiagnostic(input)
    const record = buildAutomationRecord('ai_diagnostic_generated', {
      form: {
        company: input.company || input.target,
        website: input.website || input.target,
        email: input.email,
        objective: input.objective,
      },
      package_key: diagnostic.recommended_package,
      package_name: diagnostic.recommended_package,
      ai_generated: diagnostic.generated,
      diagnostic_preview: diagnostic.diagnostic,
      opportunities: diagnostic.opportunities,
      risks: diagnostic.risks,
      next_action: diagnostic.next_step,
      input,
    })

    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])

    jsonResponse(res, 200, {
      ok: true,
      ...diagnostic,
      record,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
