import { useEffect, useMemo, useState } from 'react'

const PIPELINE_STORAGE_KEY = 'quantumaibusiness_owner_pipeline'
const OWNER_TOKEN_STORAGE_KEY = 'quantumaibusiness_owner_action_token'
const AUTOMATION_API_URL = 'https://quantumaibusiness.vercel.app'
const PACKAGE_OPTIONS = [
  ['outlinedStrategy', 'Outlined Strategy'],
  ['growthScanPack', 'Growth Scan Pack'],
  ['automatedUtility', 'Automated Utility'],
  ['fullStrategic', 'Full Strategic Growth'],
  ['premiumReferral', 'Premium Referral'],
]
const PACKAGE_DETAILS = {
  outlinedStrategy: {
    label: 'Outlined Strategy',
    price: '$9.99',
    next: 'Deliver strategy outline, then recommend Automated Utility if follow-up or routing gaps are obvious.',
  },
  growthScanPack: {
    label: 'Growth Scan Pack',
    price: '$49.99',
    next: 'Auto-deliver five scan readouts, then recommend Automated Utility if repeated automation gaps appear.',
  },
  automatedUtility: {
    label: 'Automated Utility',
    price: '$229.99+',
    next: 'Confirm tools, map intake/alert/follow-up workflow, and prepare implementation checklist.',
  },
  fullStrategic: {
    label: 'Full Strategic Growth',
    price: '$2,500+',
    next: 'Schedule owner review before promises, scope strategy, and separate urgent high-value actions.',
  },
  premiumReferral: {
    label: 'Premium Referral',
    price: 'Referral',
    next: 'Send to QuantumBusinessStrategies and treat as high-touch owner follow-up.',
  },
}
const STATUS_OPTIONS = ['new', 'paid intake', 'report ready', 'reply sent', 'upsell target', 'closed']
const DAILY_ACTIONS = [
  'Check Stripe for new payments and match them to fulfillment emails.',
  'Paste each paid packet into this console and save it to the pipeline.',
  'Confirm auto-delivery for $9.99 diagnostics and $49.99 growth scan packs.',
  'Mark obvious upgrade candidates as upsell target.',
  'Post one organic launch message using the outreach copy below.',
  'Export the pipeline at the end of the day for backup/accounting.',
]

function isLocalHost() {
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
}

function loadPipeline() {
  try {
    return JSON.parse(window.localStorage.getItem(PIPELINE_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function savePipeline(next) {
  window.localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(next))
}

function loadOwnerToken() {
  try {
    return window.localStorage.getItem(OWNER_TOKEN_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function parseField(raw, labels) {
  const lines = raw.split(/\r?\n/)
  for (const label of labels) {
    const found = lines.find((line) => line.toLowerCase().startsWith(`${label.toLowerCase()}:`))
    if (found) return found.slice(found.indexOf(':') + 1).trim()
  }
  return ''
}

function summarizeInput(raw) {
  return {
    packageName: parseField(raw, ['Package', 'package', 'package_name']) || 'Outlined Strategy',
    amount: parseField(raw, ['Amount', 'amount']) || '$9.99',
    business: parseField(raw, ['Business', 'Company', 'business', 'company']) || 'Client business',
    website: parseField(raw, ['Website', 'website']) || 'Not provided',
    email: parseField(raw, ['Delivery email', 'Email', 'delivery_email', 'customer_email']) || 'client@example.com',
    objective: parseField(raw, ['Objective', 'objective']) || 'Increase lead quality, conversion clarity, follow-up, and automation readiness.',
    tools: parseField(raw, ['Current tools', 'current_tools']) || 'Not provided',
    constraints: parseField(raw, ['Constraints', 'constraints']) || 'Not provided',
  }
}

function fieldValue(current, fallback) {
  return current || fallback || ''
}

function buildReport({ form, parsed }) {
  const business = form.business || parsed.business
  const website = form.website || parsed.website
  const objective = form.objective || parsed.objective
  const tools = form.tools || parsed.tools
  const constraints = form.constraints || parsed.constraints

  return [
    `QuantumAiBusiness Outlined Strategy for ${business}`,
    '',
    '1. Business Snapshot',
    `- Target: ${business}`,
    `- Website/profile: ${website}`,
    `- Stated objective: ${objective}`,
    `- Current tools: ${tools}`,
    `- Constraints: ${constraints}`,
    '',
    '2. Likely Profit Leaks',
    '- Offer clarity may not be strong enough to convert cold or semi-warm visitors without extra explanation.',
    '- Lead capture should route every interested visitor into a clear next step, owner alert, and follow-up path.',
    '- Follow-up likely needs tighter timing, clearer segmentation, and a simple record of who is ready to buy.',
    '- Reporting should show source, status, package interest, and next action so growth decisions are not guessed.',
    '',
    '3. Priority Growth Gaps',
    '- First-screen conversion: make the paid or contact action obvious before visitors drift.',
    '- Intake routing: collect the details needed to make a fast recommendation.',
    '- Trust and proof: show what the buyer receives and how the process moves after payment.',
    '- Automation readiness: connect payment, intake, owner notification, and delivery tracking.',
    '',
    '4. 7-Day Action Plan',
    '- Day 1: Confirm the main offer, price point, and buyer promise in one sentence.',
    '- Day 2: Make sure every call-to-action leads to payment, intake, contact, or a tracked referral.',
    '- Day 3: Add owner alerts for all paid or high-intent actions.',
    '- Day 4: Create one repeatable fulfillment template for the lowest paid package.',
    '- Day 5: Post the offer through existing social/email channels with one tracking link.',
    '- Day 6: Review payment and intake records for friction or missing fields.',
    '- Day 7: Decide whether the client should receive automation setup, full growth strategy, or premium referral.',
    '',
    '5. Recommended Next Step',
    'The fastest upgrade path is Automated Utility. It connects intake, follow-up, alerts, and simple reporting so the business stops losing warm interest between visits, payments, and owner response.',
    '',
    'Note: This $9.99 outline is an entry-level strategy readout, not implementation, consulting, ad management, legal advice, or a guarantee of revenue, profit, ranking, ad approval, or platform performance.',
  ].join('\n')
}

function buildReply({ form, parsed, report }) {
  const business = form.business || parsed.business
  const email = form.email || parsed.email

  return [
    `To: ${email}`,
    `Subject: Your QuantumAiBusiness Outlined Strategy for ${business}`,
    '',
    `Hi,`,
    '',
    `Thanks for submitting your QuantumAiBusiness intake. I reviewed the information for ${business} and prepared your outlined strategy below.`,
    '',
    report,
    '',
    'Recommended upgrade path:',
    'If you want the next step handled with less manual work, the Automated Utility package is the best follow-up. It focuses on intake, owner alerts, follow-up, routing, and simple reporting so the business has a cleaner growth system.',
    '',
    'Best,',
    'QuantumAiBusiness',
  ].join('\n')
}

function buildUpsell({ form, parsed }) {
  const business = form.business || parsed.business
  const email = form.email || parsed.email

  return [
    `To: ${email}`,
    `Subject: Next step for ${business}: automated utility path`,
    '',
    'Hi,',
    '',
    `The first strategy pass for ${business} points to a practical next step: connect the intake, owner alert, follow-up, and simple reporting path so interested prospects stop leaking between contact and action.`,
    '',
    'The Automated Utility package is built for that exact layer. It focuses on turning the strategy into a repeatable workflow instead of another note sitting in an inbox.',
    '',
    'Recommended next action:',
    '- Confirm the main offer and target customer.',
    '- Confirm the current website, email, booking, CRM, spreadsheet, or ad tools.',
    '- Build the first automation path around intake, notification, follow-up, and reporting.',
    '',
    'Best,',
    'QuantumAiBusiness',
  ].join('\n')
}

function buildOutreachCopy({ form, parsed }) {
  const business = form.business || parsed.business
  const website = form.website || parsed.website

  return [
    'Organic post:',
    `I am testing fast AI-assisted business pressure scans for owners who want to find weak routing, unclear offers, missing follow-up, and unused automation paths. If your site is getting attention but not enough action, run the scan at quantumaibusiness.com.`,
    '',
    'Direct prospect note:',
    `Quick thought for ${business}: a lot of businesses lose warm leads between the website visit, follow-up, and paid next step. I built QuantumAiBusiness to flag those leaks and route owners into a strategy or automation path. ${website !== 'Not provided' ? `I would start by reviewing ${website}.` : 'I would start with the business name and current intake path.'}`,
    '',
    'Short CTA:',
    'Run the pressure scan: https://quantumaibusiness.com/#home',
  ].join('\n')
}

function buildCsv(rows) {
  const header = ['created', 'business', 'website', 'email', 'package', 'price', 'status', 'nextAction']
  const escape = (value) => `"${String(value || '').replaceAll('"', '""')}"`
  return [header.join(','), ...rows.map((row) => header.map((key) => escape(row[key])).join(','))].join('\n')
}

export default function OwnerConsole() {
  const localOnly = isLocalHost()
  const [rawPacket, setRawPacket] = useState('')
  const [copied, setCopied] = useState('')
  const [backendHealth, setBackendHealth] = useState(null)
  const [backendStatus, setBackendStatus] = useState('Checking backend...')
  const [ownerKeyStatus, setOwnerKeyStatus] = useState('')
  const [aiDraftStatus, setAiDraftStatus] = useState('')
  const [aiDraft, setAiDraft] = useState('')
  const [sendStatus, setSendStatus] = useState('')
  const [growthStatus, setGrowthStatus] = useState('')
  const [growthPack, setGrowthPack] = useState('')
  const [campaignBatchStatus, setCampaignBatchStatus] = useState('')
  const [campaignBatch, setCampaignBatch] = useState('')
  const [socialQueueStatus, setSocialQueueStatus] = useState('')
  const [socialQueue, setSocialQueue] = useState('')
  const [digestStatus, setDigestStatus] = useState('')
  const [dailyCommand, setDailyCommand] = useState('')
  const [followUpStatus, setFollowUpStatus] = useState('')
  const [followUpDraft, setFollowUpDraft] = useState('')
  const [routeStatus, setRouteStatus] = useState('')
  const [routeReport, setRouteReport] = useState('')
  const [routeResult, setRouteResult] = useState(null)
  const [ownerToken, setOwnerToken] = useState(loadOwnerToken)
  const [pipeline, setPipeline] = useState(loadPipeline)
  const parsed = useMemo(() => summarizeInput(rawPacket), [rawPacket])
  const [form, setForm] = useState({
    packageKey: 'outlinedStrategy',
    business: '',
    website: '',
    email: '',
    objective: '',
    tools: '',
    constraints: '',
  })

  const effective = useMemo(
    () => ({
      ...form,
      business: fieldValue(form.business, parsed.business),
      website: fieldValue(form.website, parsed.website),
      email: fieldValue(form.email, parsed.email),
      objective: fieldValue(form.objective, parsed.objective),
      tools: fieldValue(form.tools, parsed.tools),
      constraints: fieldValue(form.constraints, parsed.constraints),
    }),
    [form, parsed],
  )
  const report = useMemo(() => buildReport({ form: effective, parsed }), [effective, parsed])
  const reply = useMemo(() => buildReply({ form: effective, parsed, report }), [effective, parsed, report])
  const upsell = useMemo(() => buildUpsell({ form: effective, parsed }), [effective, parsed])
  const outreachCopy = useMemo(() => buildOutreachCopy({ form: effective, parsed }), [effective, parsed])
  const packageDetail = PACKAGE_DETAILS[effective.packageKey] || PACKAGE_DETAILS.outlinedStrategy
  const pipelineStats = useMemo(
    () => {
      const activeItems = pipeline.filter((item) => !['closed', 'reply sent'].includes(item.status))
      const paidItems = pipeline.filter((item) => item.status === 'paid intake')
      const upsellItems = pipeline.filter((item) => item.status === 'upsell target')
      const totalValue = pipeline.reduce((sum, item) => sum + Number(item.numericValue || 0), 0)
      const activeValue = activeItems.reduce((sum, item) => sum + Number(item.numericValue || 0), 0)
      const scanPackCount = pipeline.filter((item) => item.packageKey === 'growthScanPack').length
      const automationCount = pipeline.filter((item) => ['automatedUtility', 'fullStrategic', 'premiumReferral'].includes(item.packageKey)).length
      const averageValue = pipeline.length ? totalValue / pipeline.length : 0
      return {
        active: activeItems.length,
        paid: paidItems.length,
        upsell: upsellItems.length,
        value: totalValue,
        activeValue,
        scanPackCount,
        automationCount,
        averageValue,
      }
    },
    [pipeline],
  )

  useEffect(() => {
    refreshBackendHealth()
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function updateOwnerToken(event) {
    const value = event.target.value
    setOwnerToken(value)
    try {
      window.localStorage.setItem(OWNER_TOKEN_STORAGE_KEY, value)
    } catch {
      // Local storage can fail in locked-down browsers; state still works for this session.
    }
  }

  async function copyText(label, text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(`${label} copied`)
    } catch {
      setCopied(`Copy failed. Select the ${label.toLowerCase()} manually.`)
    }
  }

  function saveCurrentLead() {
    const numericValue =
      effective.packageKey === 'fullStrategic'
        ? 2500
        : effective.packageKey === 'automatedUtility'
          ? 229.99
          : effective.packageKey === 'growthScanPack'
            ? 49.99
            : effective.packageKey === 'outlinedStrategy'
              ? 9.99
              : 0
    const lead = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created: new Date().toISOString(),
      business: effective.business,
      website: effective.website,
      email: effective.email,
      package: packageDetail.label,
      price: packageDetail.price,
      packageKey: effective.packageKey,
      status: 'paid intake',
      nextAction: packageDetail.next,
      numericValue,
    }
    setPipeline((current) => {
      const next = [lead, ...current].slice(0, 80)
      savePipeline(next)
      return next
    })
    setCopied('Lead saved to pipeline')
    syncLeadToBackend(lead)
  }

  async function syncLeadToBackend(lead) {
    try {
      const response = await fetch(`${AUTOMATION_API_URL}/api/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          event_type: 'owner_pipeline_saved',
          form: {
            company: lead.business,
            website: lead.website,
            email: lead.email,
            objective: effective.objective,
            current_tools: effective.tools,
            constraints: effective.constraints,
          },
          package: {
            key: lead.packageKey,
            title: lead.package,
            amount: lead.numericValue || '',
          },
          payload: {
            local_pipeline_id: lead.id,
            status: lead.status,
            next_action: lead.nextAction,
            source: 'owner_console_save_lead',
          },
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setCopied(data.forwarding?.forwarded ? 'Lead saved locally and logged to Sheet' : 'Lead saved locally; Sheet forwarding not confirmed')
    } catch (error) {
      setCopied(`Lead saved locally; backend sync failed: ${error.message}`)
    }
  }

  function updateLeadStatus(id, status) {
    setPipeline((current) => {
      const next = current.map((item) => (item.id === id ? { ...item, status } : item))
      savePipeline(next)
      return next
    })
  }

  function clearClosedLeads() {
    setPipeline((current) => {
      const next = current.filter((item) => item.status !== 'closed')
      savePipeline(next)
      return next
    })
  }

  function exportPipeline(format) {
    const content = format === 'csv' ? buildCsv(pipeline) : JSON.stringify(pipeline, null, 2)
    const type = format === 'csv' ? 'text/csv' : 'application/json'
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quantumaibusiness-pipeline.${format}`
    link.click()
    URL.revokeObjectURL(url)
    setCopied(`${format.toUpperCase()} export ready`)
  }

  async function refreshBackendHealth() {
    try {
      setBackendStatus('Checking Vercel automation backend...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/health`)
      const data = await response.json()
      setBackendHealth(data)
      setBackendStatus(response.ok ? 'Backend online' : `Backend check failed: ${data.error || response.status}`)
    } catch (error) {
      setBackendStatus(`Backend check failed: ${error.message}`)
    }
  }

  async function requestAiDraft() {
    setSendStatus('')
    setDigestStatus('')
    setRouteStatus('')
    const payload = {
      package_key: effective.packageKey,
      package_name: packageDetail.label,
      company: effective.business,
      website: effective.website,
      customer_email: effective.email,
      objective: effective.objective,
      current_tools: effective.tools,
      constraints: effective.constraints,
      owner_approved: true,
      review_only: true,
      source: 'owner_console_review_draft',
    }

    try {
      setAiDraftStatus('Requesting review-only fulfillment draft...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/fulfillment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setAiDraft(data.deliverable || 'No draft returned.')
      setAiDraftStatus(
        data.generated
          ? 'AI draft generated and held for owner review'
          : `Review draft returned without AI generation: ${data.client_email?.reason || data.record?.payload?.reason || data.mode}`,
      )
    } catch (error) {
      setAiDraftStatus(`Draft request failed: ${error.message}`)
    }
  }

  async function sendApprovedDraft() {
    setAiDraftStatus('')
    setDigestStatus('')
    setRouteStatus('')
    if (!ownerToken) {
      setSendStatus('Add OWNER_ACTION_TOKEN in Vercel, then paste the same token here.')
      return
    }
    if (!aiDraft) {
      setSendStatus('Generate or paste an approved backend draft before sending.')
      return
    }

    const subject = `Your QuantumAiBusiness ${packageDetail.label} for ${effective.business}`
    const payload = {
      to: effective.email,
      subject,
      text: aiDraft,
      business: effective.business,
      website: effective.website,
      package_name: packageDetail.label,
    }

    try {
      setSendStatus('Sending approved draft through Vercel/Resend...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/send-approved-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Owner-Token': ownerToken,
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setSendStatus(
        data.client_email?.sent
          ? `Approved draft sent to ${effective.email}`
          : `Send attempted but not confirmed: ${data.client_email?.reason || data.client_email?.error || 'unknown'}`,
      )
    } catch (error) {
      setSendStatus(`Approved send failed: ${error.message}`)
    }
  }

  async function requestGrowthPack() {
    setAiDraftStatus('')
    setSendStatus('')
    setDigestStatus('')
    setRouteStatus('')
    if (!ownerToken) {
      setGrowthStatus('Add OWNER_ACTION_TOKEN in Vercel, then paste the same token here to unlock protected growth generation.')
      return
    }

    const payload = {
      offer: 'QuantumAiBusiness pressure scan, $9.99 outlined strategy, $229.99+ automated utility, and $2,500+ full strategic growth',
      audience: 'business owners, service businesses, local operators, creators, and teams with unclear conversion or follow-up paths',
      url: 'https://quantumaibusiness.com',
      channels: 'X/Twitter, LinkedIn, Facebook, direct outreach, referral links, and owner-reviewed paid ads',
      objective: 'Drive qualified scans, paid strategy buyers, automated utility upgrades, and full strategic growth prospects.',
      constraints: 'Keep public posting, direct outreach, ad spend, and client delivery owner-reviewed before anything goes live.',
      source: 'owner_console_growth_pack',
    }

    try {
      setGrowthStatus('Generating owner-reviewed growth and advertising pack...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/growth-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Owner-Token': ownerToken,
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setGrowthPack(data.campaign || 'No growth pack returned.')
      setGrowthStatus(
        data.generated
          ? 'Growth pack generated, emailed to owner, and held for review'
          : `Fallback growth pack returned: ${data.generation_reason || 'AI generation unavailable'}`,
      )
    } catch (error) {
      setGrowthStatus(`Growth pack request failed: ${error.message}`)
    }
  }

  async function requestCampaignBatch() {
    setAiDraftStatus('')
    setSendStatus('')
    setDigestStatus('')
    setRouteStatus('')
    if (!ownerToken) {
      setCampaignBatchStatus('Add OWNER_ACTION_TOKEN in Vercel, then paste the same token here to generate the daily campaign batch.')
      return
    }

    try {
      setCampaignBatchStatus('Generating daily monetization campaign batch...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/campaign-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Owner-Token': ownerToken,
        },
        body: JSON.stringify({ source: 'owner_console_campaign_batch' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setCampaignBatch(data.batch || 'No campaign batch returned.')
      setCampaignBatchStatus(
        data.generated
          ? 'Daily campaign batch generated, emailed to owner, and logged'
          : `Fallback campaign batch returned: ${data.generation_reason || 'AI generation unavailable'}`,
      )
    } catch (error) {
      setCampaignBatchStatus(`Campaign batch failed: ${error.message}`)
    }
  }

  async function requestSocialQueue() {
    setAiDraftStatus('')
    setSendStatus('')
    setDigestStatus('')
    setRouteStatus('')
    if (!ownerToken) {
      setSocialQueueStatus('Add OWNER_ACTION_TOKEN in Vercel, then paste the same token here to generate the social queue.')
      return
    }

    try {
      setSocialQueueStatus('Building ad-ready organic social queue...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/social-queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Owner-Token': ownerToken,
        },
        body: JSON.stringify({ source: 'owner_console_social_queue' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setSocialQueue(data.queue || 'No social queue returned.')
      setSocialQueueStatus(
        data.generated
          ? 'Social queue generated, emailed to owner, and logged'
          : `Fallback social queue returned: ${data.generation_reason || 'AI generation unavailable'}`,
      )
    } catch (error) {
      setSocialQueueStatus(`Social queue failed: ${error.message}`)
    }
  }

  async function requestLeadRoute() {
    setAiDraftStatus('')
    setSendStatus('')
    setDigestStatus('')
    if (!ownerToken) {
      setRouteStatus('Add OWNER_ACTION_TOKEN in Vercel, then paste the same token here to unlock lead routing.')
      return
    }

    const payload = {
      package_key: effective.packageKey,
      package_name: packageDetail.label,
      business: effective.business,
      website: effective.website,
      email: effective.email,
      objective: effective.objective,
      tools: effective.tools,
      constraints: effective.constraints,
      source: 'owner_console_lead_router',
    }

    try {
      setRouteStatus('Scoring lead and generating owner route...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/lead-router`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Owner-Token': ownerToken,
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setRouteResult({ score: data.score, route: data.route })
      setRouteReport(data.report || 'No route report returned.')
      setRouteStatus(
        data.generated
          ? `Lead scored ${data.score}/100 and routed to ${data.route.replaceAll('_', ' ')}`
          : `Fallback route created: ${data.generation_reason || 'AI generation unavailable'}`,
      )
    } catch (error) {
      setRouteStatus(`Lead routing failed: ${error.message}`)
    }
  }

  async function requestFollowUpDraft() {
    setAiDraftStatus('')
    setSendStatus('')
    setDigestStatus('')
    if (!ownerToken) {
      setFollowUpStatus('Add OWNER_ACTION_TOKEN in Vercel, then paste the same token here to generate follow-up drafts.')
      return
    }

    const payload = {
      package_key: effective.packageKey,
      package_name: packageDetail.label,
      business: effective.business,
      website: effective.website,
      email: effective.email,
      objective: effective.objective,
      tools: effective.tools,
      constraints: effective.constraints,
      source: 'owner_console_follow_up',
    }

    try {
      setFollowUpStatus('Generating owner-reviewed follow-up draft...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/follow-up-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Owner-Token': ownerToken,
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setFollowUpDraft(data.draft || 'No follow-up draft returned.')
      setFollowUpStatus(
        data.generated
          ? `Follow-up generated for ${data.route.replaceAll('_', ' ')} at ${data.score}/100`
          : `Fallback follow-up created: ${data.generation_reason || 'AI generation unavailable'}`,
      )
    } catch (error) {
      setFollowUpStatus(`Follow-up draft failed: ${error.message}`)
    }
  }

  async function runDailyDigest() {
    setAiDraftStatus('')
    setSendStatus('')
    setRouteStatus('')
    if (!ownerToken) {
      setDigestStatus('Add OWNER_ACTION_TOKEN in Vercel, then paste the same token here to run the owner digest.')
      return
    }

    try {
      setDigestStatus('Sending owner command digest...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/daily-digest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Owner-Token': ownerToken,
        },
        body: JSON.stringify({ source: 'owner_console_manual_digest' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setDailyCommand(data.command_text || '')
      setDigestStatus(
        data.notification?.notified
          ? 'Daily revenue command sent and logged to automation ledger'
          : `Digest ran but email was not confirmed: ${data.notification?.error || 'unknown'}`,
      )
    } catch (error) {
      setDigestStatus(`Digest failed: ${error.message}`)
    }
  }

  async function testOwnerKey() {
    if (!ownerToken) {
      setOwnerKeyStatus('Paste the same OWNER_ACTION_TOKEN from Vercel first.')
      return
    }

    try {
      setOwnerKeyStatus('Checking owner key...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Owner-Token': ownerToken,
        },
        body: JSON.stringify({ source: 'owner_console_key_check' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`)
      setOwnerKeyStatus('Owner key is valid')
    } catch (error) {
      setOwnerKeyStatus(`Owner key failed: ${error.message}`)
    }
  }

  if (!localOnly) {
    return (
      <main className="owner-console owner-lockout">
        <section>
          <h1>Owner Console</h1>
          <p>This tool is local-only for now. Run the dev server and open http://localhost:5173/owner on this machine.</p>
          <a href="/">Return to QuantumAiBusiness</a>
        </section>
      </main>
    )
  }

  return (
    <main className="owner-console">
      <section className="owner-hero">
        <div>
          <span>LOCAL OWNER TOOL</span>
          <h1>QuantumAiBusiness Fulfillment Console</h1>
          <p>Paste a FormSubmit fulfillment email, review the extracted fields, then copy the report or full customer reply.</p>
        </div>
        <a href="/">PUBLIC SITE</a>
      </section>

      <section className="owner-grid">
        <div className="owner-panel">
          <h2>1. Paste Fulfillment Packet</h2>
          <textarea
            value={rawPacket}
            onChange={(event) => setRawPacket(event.target.value)}
            placeholder="Paste the FormSubmit paid fulfillment email or packet text here..."
          />
        </div>

        <div className="owner-panel">
          <h2>2. Review Fields</h2>
          <label>
            Package
            <select name="packageKey" value={form.packageKey} onChange={updateField}>
              {PACKAGE_OPTIONS.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            Business
            <input name="business" placeholder={parsed.business} value={form.business} onChange={updateField} />
          </label>
          <label>
            Website
            <input name="website" placeholder={parsed.website} value={form.website} onChange={updateField} />
          </label>
          <label>
            Customer email
            <input name="email" placeholder={parsed.email} value={form.email} onChange={updateField} />
          </label>
          <label>
            Objective
            <textarea name="objective" placeholder={parsed.objective} value={form.objective} onChange={updateField} />
          </label>
          <label>
            Current tools
            <input name="tools" placeholder={parsed.tools} value={form.tools} onChange={updateField} />
          </label>
          <label>
            Constraints
            <input name="constraints" placeholder={parsed.constraints} value={form.constraints} onChange={updateField} />
          </label>
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>3. Revenue Pipeline</h2>
            <button type="button" onClick={saveCurrentLead}>SAVE LEAD</button>
          </div>
          <div className="owner-metrics">
            <span><strong>{pipelineStats.active}</strong> active</span>
            <span><strong>{pipelineStats.paid}</strong> paid</span>
            <span><strong>{pipelineStats.upsell}</strong> upsell</span>
            <span><strong>${pipelineStats.value.toFixed(2)}</strong> tracked</span>
            <span><strong>${pipelineStats.activeValue.toFixed(2)}</strong> active value</span>
            <span><strong>{pipelineStats.scanPackCount}</strong> scan packs</span>
            <span><strong>{pipelineStats.automationCount}</strong> high-tier</span>
            <span><strong>${pipelineStats.averageValue.toFixed(2)}</strong> avg lead</span>
          </div>
          <div className="owner-pipeline">
            {pipeline.length ? (
              pipeline.slice(0, 8).map((item) => (
                <article key={item.id}>
                  <strong>{item.business}</strong>
                  <span>{item.package} // {item.price}</span>
                  <small>{item.website} // {item.email}</small>
                  <p>{item.nextAction}</p>
                  <select value={item.status} onChange={(event) => updateLeadStatus(item.id, event.target.value)}>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </article>
              ))
            ) : (
              <p>No saved pipeline items yet. Paste a paid packet, review fields, then save the lead.</p>
            )}
          </div>
          <div className="owner-actions">
            <button type="button" onClick={() => exportPipeline('json')}>EXPORT JSON</button>
            <button type="button" onClick={() => exportPipeline('csv')}>EXPORT CSV</button>
            <button type="button" onClick={clearClosedLeads}>CLEAR CLOSED</button>
          </div>
        </div>

        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>4. Backend Automation</h2>
            <button type="button" onClick={refreshBackendHealth}>REFRESH</button>
          </div>
          <div className="owner-backend-status">
            <strong>{backendStatus}</strong>
            {backendHealth && (
              <div className="owner-health-grid">
                <span className={backendHealth.configured?.resend ? 'is-on' : ''}>Resend</span>
                <span className={backendHealth.configured?.stripe_webhook_secret ? 'is-on' : ''}>Stripe</span>
                <span className={backendHealth.configured?.openai_api_key ? 'is-on' : ''}>OpenAI</span>
                <span className={backendHealth.configured?.automation_webhook ? 'is-on' : ''}>Webhook</span>
                <span className={backendHealth.configured?.owner_action_token ? 'is-on' : ''}>Owner Key</span>
                <span className={backendHealth.configured?.cron_secret ? 'is-on' : ''}>Cron</span>
                <span className={backendHealth.campaign_batch_mode === 'daily_cron_enabled' ? 'is-on' : ''}>Batch</span>
                <span className={backendHealth.configured?.social_queue ? 'is-on' : ''}>Social</span>
              </div>
            )}
            {backendHealth && (
              <p>
                Fulfillment: {backendHealth.fulfillment_mode} // Client email: {backendHealth.fulfillment_client_email_mode}
              </p>
            )}
          </div>
          <button type="button" onClick={requestAiDraft}>REQUEST REVIEW DRAFT</button>
          <button type="button" onClick={runDailyDigest}>DAILY COMMAND</button>
          <button type="button" onClick={requestSocialQueue}>SOCIAL QUEUE</button>
          {aiDraftStatus && <p className="owner-inline-status">{aiDraftStatus}</p>}
          {digestStatus && <p className="owner-inline-status">{digestStatus}</p>}
          {socialQueueStatus && <p className="owner-inline-status">{socialQueueStatus}</p>}
          <label>
            Owner action token
            <input
              name="ownerToken"
              onChange={updateOwnerToken}
              placeholder="Paste local OWNER_ACTION_TOKEN after adding it in Vercel"
              type="password"
              value={ownerToken}
            />
          </label>
          <button type="button" onClick={testOwnerKey}>TEST OWNER KEY</button>
          {ownerKeyStatus && <p className="owner-inline-status">{ownerKeyStatus}</p>}
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel">
          <h2>5. Daily Money Loop</h2>
          <div className="owner-action-list">
            {DAILY_ACTIONS.map((action) => (
              <label key={action}>
                <input type="checkbox" />
                {action}
              </label>
            ))}
          </div>
          <div className="owner-next-action">
            <strong>Current package route:</strong>
            <p>{packageDetail.label} // {packageDetail.price}</p>
            <span>{packageDetail.next}</span>
          </div>
        </div>

        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>6. Backend Draft</h2>
            <button type="button" onClick={() => copyText('Backend draft', aiDraft)}>COPY DRAFT</button>
          </div>
          <pre>{aiDraft || 'No backend draft requested yet. Use REQUEST REVIEW DRAFT after reviewing the fields above.'}</pre>
          <button type="button" onClick={sendApprovedDraft}>SEND APPROVED DRAFT</button>
          {sendStatus && <p className="owner-inline-status">{sendStatus}</p>}
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel owner-route-panel">
          <div className="owner-panel-title">
            <h2>7. Lead Route Brain</h2>
            <button type="button" onClick={requestLeadRoute}>SCORE LEAD</button>
          </div>
          <p>
            Scores the reviewed intake and routes it toward strategy delivery, automated utility upsell, full growth review, or premium owner review.
          </p>
          {routeResult && (
            <div className="owner-route-score">
              <strong>{routeResult.score}/100</strong>
              <span>{routeResult.route.replaceAll('_', ' ')}</span>
            </div>
          )}
          {routeStatus && <p className="owner-inline-status">{routeStatus}</p>}
        </div>

        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>8. Route Report</h2>
            <button type="button" onClick={() => copyText('Route report', routeReport)}>COPY ROUTE</button>
          </div>
          <pre>{routeReport || 'No route report yet. Review the fields above, then use SCORE LEAD.'}</pre>
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel owner-growth-panel">
          <div className="owner-panel-title">
            <h2>9. Growth Automation Pack</h2>
            <button type="button" onClick={requestGrowthPack}>GENERATE PACK</button>
            <button type="button" onClick={requestCampaignBatch}>DAILY BATCH</button>
            <button type="button" onClick={requestSocialQueue}>SOCIAL QUEUE</button>
          </div>
          <p>
            Creates owner-reviewed ads, social posts, direct outreach, launch loop, and tracking actions for QuantumAiBusiness.
          </p>
          <div className="owner-growth-lanes">
            <span>Scan traffic</span>
            <span>Low-ticket strategy</span>
            <span>Automation upsell</span>
            <span>Premium review</span>
          </div>
          {growthStatus && <p className="owner-inline-status">{growthStatus}</p>}
          {campaignBatchStatus && <p className="owner-inline-status">{campaignBatchStatus}</p>}
        </div>

        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>10. Campaign Draft</h2>
            <button type="button" onClick={() => copyText('Growth pack', growthPack)}>COPY PACK</button>
            <button type="button" onClick={() => copyText('Daily campaign batch', campaignBatch)}>COPY BATCH</button>
            <button type="button" onClick={() => copyText('Social queue', socialQueue)}>COPY QUEUE</button>
          </div>
          <pre>{dailyCommand || socialQueue || campaignBatch || growthPack || 'No growth pack generated yet. Use DAILY COMMAND, SOCIAL QUEUE, GENERATE PACK, or DAILY BATCH after adding the owner token.'}</pre>
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>11. Follow-Up Draft</h2>
            <button type="button" onClick={requestFollowUpDraft}>GENERATE FOLLOW-UP</button>
          </div>
          <p className="owner-inline-status">
            Creates a review-only customer follow-up or upsell message based on the current fields and route.
          </p>
          {followUpStatus && <p className="owner-inline-status">{followUpStatus}</p>}
        </div>

        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>12. Follow-Up Copy</h2>
            <button type="button" onClick={() => copyText('Follow-up draft', followUpDraft)}>COPY FOLLOW-UP</button>
          </div>
          <pre>{followUpDraft || 'No follow-up generated yet. Review the fields above, then use GENERATE FOLLOW-UP.'}</pre>
        </div>
      </section>

      <section className="owner-grid owner-output-grid">
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>13. Strategy Report</h2>
            <button type="button" onClick={() => copyText('Report', report)}>COPY REPORT</button>
          </div>
          <pre>{report}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>14. Customer Reply</h2>
            <button type="button" onClick={() => copyText('Reply', reply)}>COPY REPLY</button>
          </div>
          <pre>{reply}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>15. Upgrade Follow-Up</h2>
            <button type="button" onClick={() => copyText('Upgrade follow-up', upsell)}>COPY UPSELL</button>
          </div>
          <pre>{upsell}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>16. Outreach Copy</h2>
            <button type="button" onClick={() => copyText('Outreach copy', outreachCopy)}>COPY OUTREACH</button>
          </div>
          <pre>{outreachCopy}</pre>
        </div>
      </section>

      {copied && <p className="owner-toast">{copied}</p>}
    </main>
  )
}
