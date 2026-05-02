import {
  buildAutomationRecord,
  forwardAutomation,
  handleOptions,
  jsonResponse,
  notifyOwner,
  routeNextAction,
  scoreAutomationLead,
  sendClientEmail,
  setCors,
} from './_shared.js'

function cleanText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 4000)
}

function leadFormFromPayload(payload = {}) {
  return payload.form || payload.payload?.form || {}
}

function shouldCreateFollowUp(type, record) {
  const email = record.contact_email || leadFormFromPayload(record.payload).email || ''
  return ['assessment_submitted', 'package_selected'].includes(type) && email.includes('@')
}

function buildFallbackLeadFollowUp(input, routeData) {
  const business = input.business || input.website || 'your business'
  const nextAction = routeNextAction(routeData.lead_route)
  const site = process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'
  const utilityLink = `${site}/business-growth-scan.html?utm_source=lead_follow_up&utm_medium=email&utm_campaign=warm_lead_upgrade`
  return [
    `Subject: Next step for ${business}`,
    '',
    'Hi,',
    '',
    `Thanks for running the QuantumAiBusiness growth intake for ${business}. The main thing to look at next is not just more traffic, but whether interest is being routed cleanly into a paid next step, owner alert, follow-up, and tracking.`,
    '',
    `Recommended next action: ${nextAction}`,
    '',
    'The practical upgrade path is Automated Utility when you want the intake, follow-up, alerts, and reporting connected instead of only reviewed.',
    '',
    `Start or continue here: ${utilityLink}`,
    '',
    'Important note: this is strategic guidance and does not guarantee revenue, profit, rankings, ad approval, or platform performance.',
    '',
    'Best,',
    'QuantumAiBusiness',
  ].join('\n')
}

async function generateLeadFollowUp(input, routeData) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      generated: false,
      draft: buildFallbackLeadFollowUp(input, routeData),
      reason: 'OPENAI_API_KEY not configured',
    }
  }

  const site = process.env.PUBLIC_SITE_ORIGIN || 'https://quantumaibusiness.com'
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      max_output_tokens: 1200,
      input: [
        {
          role: 'system',
          content:
            'Create a concise, ethical follow-up email draft for a warm website lead. No guaranteed profit, no spam, no pressure, no invented claims. Keep it clear and useful.',
        },
        {
          role: 'user',
          content: [
            `Site: ${site}`,
            `Score: ${routeData.lead_score}`,
            `Route: ${routeData.lead_route}`,
            `Next action: ${routeNextAction(routeData.lead_route)}`,
            'Write one email with a subject line, 2-4 short paragraphs, a clear next step toward Automated Utility when relevant, and a short no-guarantee note.',
            `Lead JSON:\n${JSON.stringify(input, null, 2)}`,
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
    return { generated: false, draft: buildFallbackLeadFollowUp(input, routeData), status: response.status, reason }
  }

  const data = await response.json()
  const outputText =
    data.output_text ||
    data.output
      ?.flatMap((item) => item.content || [])
      .map((part) => part.text || '')
      .join('\n')
      .trim()

  return { generated: true, draft: outputText || buildFallbackLeadFollowUp(input, routeData) }
}

function splitSubjectAndBody(draft) {
  const lines = String(draft || '').split(/\r?\n/)
  const subjectLine = lines.find((line) => /^subject:/i.test(line))
  const subject = subjectLine ? subjectLine.replace(/^subject:\s*/i, '').trim() : 'Your QuantumAiBusiness next step'
  const body = lines.filter((line) => line !== subjectLine).join('\n').trim()
  return { subject, body }
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
    const type = body.event_type || body.type || 'lead_event'
    const record = buildAutomationRecord(type, body.payload || body)
    const followUpMode = process.env.LEAD_FOLLOW_UP_MODE || 'owner_review'
    let followUp = { created: false, reason: 'Not a follow-up eligible lead event' }

    if (shouldCreateFollowUp(type, record)) {
      const form = leadFormFromPayload(record.payload)
      const input = {
        package_key: cleanText(record.package_key || record.payload?.package?.key || 'outlinedStrategy'),
        package_name: cleanText(record.package || record.payload?.package?.title || 'Outlined Strategy'),
        business: cleanText(form.company || record.target, 'Client business'),
        website: cleanText(form.website || record.target, ''),
        email: cleanText(form.email || record.contact_email, ''),
        objective: cleanText(form.objective, 'Increase conversion, follow-up, automation, and growth clarity.'),
        tools: cleanText(form.current_tools || form.currentTools || record.payload?.current_tools, 'Not provided'),
        constraints: cleanText(form.constraints || record.payload?.constraints, 'Not provided'),
        source: cleanText(type, 'lead_event'),
      }
      const routeData = scoreAutomationLead({
        package_key: input.package_key,
        form: {
          company: input.business,
          website: input.website,
          email: input.email,
          objective: input.objective,
          current_tools: input.tools === 'Not provided' ? '' : input.tools,
          constraints: input.constraints === 'Not provided' ? '' : input.constraints,
        },
      })
      const generation = await generateLeadFollowUp(input, routeData)
      const followUpRecord = buildAutomationRecord('warm_lead_follow_up', {
        target: input.website || input.business,
        customer_email: input.email,
        package_key: input.package_key,
        package_name: input.package_name,
        lead_score: routeData.lead_score,
        lead_route: routeData.lead_route,
        next_action:
          followUpMode === 'auto_send'
            ? 'Warm lead follow-up generated and sent automatically.'
            : 'Warm lead follow-up generated for owner review before sending.',
        ai_generated: generation.generated,
        generation_status: generation.status || '',
        generation_reason: generation.reason || '',
        follow_up_mode: followUpMode,
        follow_up_preview: generation.draft.slice(0, 1400),
        follow_up_full: generation.draft,
        input,
      })
      const emailParts = splitSubjectAndBody(generation.draft)
      const [followUpNotification, followUpForwarding, followUpClientEmail] = await Promise.allSettled([
        notifyOwner(followUpRecord),
        forwardAutomation(followUpRecord),
        followUpMode === 'auto_send'
          ? sendClientEmail({ to: input.email, subject: emailParts.subject, text: emailParts.body })
          : Promise.resolve({ sent: false, reason: 'LEAD_FOLLOW_UP_MODE is owner_review' }),
      ])
      followUp = {
        created: true,
        mode: followUpMode,
        generated: generation.generated,
        notification:
          followUpNotification.status === 'fulfilled'
            ? followUpNotification.value
            : { notified: false, error: followUpNotification.reason?.message },
        forwarding:
          followUpForwarding.status === 'fulfilled'
            ? followUpForwarding.value
            : { forwarded: false, error: followUpForwarding.reason?.message },
        client_email:
          followUpClientEmail.status === 'fulfilled'
            ? followUpClientEmail.value
            : { sent: false, error: followUpClientEmail.reason?.message },
      }
    }

    const [notification, forwarding] = await Promise.allSettled([notifyOwner(record), forwardAutomation(record)])
    jsonResponse(res, 200, {
      ok: true,
      record,
      follow_up: followUp,
      notification: notification.status === 'fulfilled' ? notification.value : { notified: false, error: notification.reason?.message },
      forwarding: forwarding.status === 'fulfilled' ? forwarding.value : { forwarded: false, error: forwarding.reason?.message },
    })
  } catch (error) {
    jsonResponse(res, 500, { ok: false, error: error.message })
  }
}
