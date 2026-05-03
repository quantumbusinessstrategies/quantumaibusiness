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
const STATUS_OPTIONS = ['new', 'paid intake', 'report ready', 'reply sent', 'proof signal', 'upsell target', 'closed']
const DAILY_ACTIONS = [
  'Check Stripe for new payments and match them to fulfillment emails.',
  'Paste each paid packet into this console and save it to the pipeline.',
  'Confirm auto-delivery for $9.99 diagnostics and $49.99 growth scan packs.',
  'Mark obvious upgrade candidates as upsell target.',
  'Post one organic launch message using the outreach copy below.',
  'Export the pipeline at the end of the day for backup/accounting.',
]
const SOCIAL_PLATFORMS = [
  {
    platform: 'X',
    timing: 'Today',
    action: 'Post one main thread/post, pin it, then manually reply to 3-5 relevant conversations.',
  },
  {
    platform: 'LinkedIn',
    timing: 'Next business morning',
    action: 'Post the professional version with a practical no-guarantee CTA.',
  },
  {
    platform: 'Facebook',
    timing: 'After LinkedIn',
    action: 'Use the softer local-business version; avoid posting in groups unless it clearly fits rules.',
  },
  {
    platform: 'Reddit',
    timing: 'Only when relevant',
    action: 'Comment helpfully first. Link only when someone asks for tools, diagnostics, or examples.',
  },
]
const DEFAULT_SOCIAL_POST =
  'Most businesses do not just need more traffic. They lose money between the first visit, the unclear next step, weak follow-up, and offers that never get routed. I built QuantumAiBusiness to pressure-scan that path and turn gaps into next actions: https://quantumaibusiness.com/business-growth-scan.html?utm_source=x&utm_medium=organic&utm_campaign=owner_console_quick_post'
const TRAFFIC_CHANNELS = [
  ['linkedin', 'LinkedIn', 'Post once, then leave 3 useful comments under business-owner posts.'],
  ['facebook', 'Facebook', 'Post to your page/profile; group posts only when rules allow useful tools.'],
  ['reddit', 'Reddit', 'Answer pain-point questions first; link only when directly useful.'],
  ['quora', 'Quora', 'Answer one lead-gen/automation question with a practical checklist.'],
  ['youtube_shorts', 'YouTube Shorts', 'Use a 20-second script: problem, scan, no-guarantee CTA.'],
  ['tiktok', 'TikTok', 'Same short script; keep it direct and visually punchy.'],
  ['email_signature', 'Email Signature', 'Add the scan link under every outbound email.'],
  ['google_business', 'Google Business', 'If eligible, post the scan offer as a business update.'],
]
const PASSIVE_TRAFFIC_ASSETS = [
  {
    label: 'Email Signature',
    purpose: 'Always-on link under every outbound email.',
    text:
      'AI-assisted business pressure scans: https://quantumaibusiness.com/business-growth-scan.html?utm_source=email_signature&utm_medium=passive&utm_campaign=always_on',
  },
  {
    label: 'Social Bio',
    purpose: 'Use in X, LinkedIn, Facebook, YouTube, TikTok, or forum bios.',
    text:
      'AI business pressure scans for weak offers, missed follow-up, and unused automation paths. Start: https://quantumaibusiness.com/business-growth-scan.html?utm_source=social_bio&utm_medium=passive&utm_campaign=always_on',
  },
  {
    label: 'Pinned Post',
    purpose: 'Pin where possible so every profile visit has a next step.',
    text:
      'Most businesses do not only need more traffic. They need a cleaner path from interest to action. QuantumAiBusiness scans weak offers, missing follow-up, and unused automation paths: https://quantumaibusiness.com/business-growth-scan.html?utm_source=pinned_post&utm_medium=passive&utm_campaign=always_on',
  },
  {
    label: 'QR / Offline',
    purpose: 'Use for direct conversations, screenshots, print, or local outreach.',
    text:
      'https://quantumaibusiness.com/business-growth-scan.html?utm_source=qr&utm_medium=offline&utm_campaign=always_on',
  },
]
const PAID_TRAFFIC_TESTS = [
  {
    channel: 'Meta / Facebook',
    budget: '$5-$10 per day for 2-3 days',
    setup: 'Use Traffic or Leads objective, send to the scan page, and stop fast if clicks do not become scans.',
  },
  {
    channel: 'Google Search',
    budget: '$5-$15 per day exact-intent test',
    setup: 'Test phrases around business automation audit, website conversion audit, AI business audit, and follow-up automation.',
  },
  {
    channel: 'Reddit Ads',
    budget: '$5 per day tiny test',
    setup: 'Only use helpful no-hype copy in entrepreneur or operator audiences. Watch comments closely.',
  },
  {
    channel: 'LinkedIn',
    budget: 'Hold until the offer proves itself',
    setup: 'Good business audience, but usually expensive. Use organic LinkedIn first, then paid only for proven copy.',
  },
]
const GOOGLE_ADS_TEST = {
  campaign: 'QuantumAiBusiness - $50 Search Validation',
  budget: '$10/day, hard cap $50 total',
  landing:
    'https://quantumaibusiness.com/growth-scan-pack.html?utm_source=google&utm_medium=paid_search&utm_campaign=fifty_dollar_validation&utm_content=search_scan_pack',
  kill: 'Pause at $25 with no useful actions. Hard stop at $50 unless purchase or strong checkout intent appears.',
  keywords: [
    '"website conversion audit"',
    '"business automation audit"',
    '"AI business audit"',
    '"lead follow up automation"',
    '"website not converting visitors"',
    '"small business growth audit"',
    '"sales funnel audit"',
  ],
}
const MONEY_LINKS = [
  {
    label: 'Main Scan',
    priority: 'Primary traffic target',
    url: 'https://quantumaibusiness.com/business-growth-scan.html?utm_source=owner_console&utm_medium=command&utm_campaign=money_link',
  },
  {
    label: '$49.99 Pack',
    priority: 'Best cold paid offer',
    url: 'https://quantumaibusiness.com/growth-scan-pack.html?utm_source=owner_console&utm_medium=command&utm_campaign=money_link',
  },
  {
    label: '$229.99 Utility',
    priority: 'Upsell after scan',
    url: 'https://quantumaibusiness.com/automated-utility.html?utm_source=owner_console&utm_medium=command&utm_campaign=money_link',
  },
  {
    label: 'Premium Referral',
    priority: 'High-ticket handoff',
    url: 'https://quantumaibusiness.com/refer-business.html?utm_source=owner_console&utm_medium=command&utm_campaign=money_link',
  },
]
const ACCESS_ACTIONS = [
  {
    label: 'Google Analytics',
    status: 'Connected',
    next: 'Watch key events: qualify_lead, close_convert_lead, purchase, and client_results_feedback.',
  },
  {
    label: 'Meta Pixel',
    status: 'Receiving events',
    next: 'Use for retargeting only after enough traffic collects. Keep spend paused until copy proves interest.',
  },
  {
    label: 'Search Console',
    status: 'Submitted',
    next: 'Check indexing weekly and add more narrow pages only when they match a buyer problem.',
  },
  {
    label: 'Stripe',
    status: 'Live payments',
    next: 'Keep webhook + fulfillment healthy; do not change checkout links unless replacing products intentionally.',
  },
  {
    label: 'Buffer',
    status: 'Scheduling ready',
    next: 'Queue one approved post per connected channel, then compare traffic before increasing volume.',
  },
]
const PROOF_LOOP_ACTIONS = [
  'Turn each paid delivery into one follow-up signal request.',
  'Save any reply with a result, blocker, or upgrade need as proof signal.',
  'Only publish anonymous proof after explicit permission.',
  'Route blockers about follow-up, intake, reporting, or tool connection toward Automated Utility.',
]
const BUSINESS_SCORECARD = [
  ['Technical', 9, 'Live site, Vercel backend, Stripe, OpenAI, Resend, tracking, and ledger are connected.'],
  ['Automation', 8, 'Low-tier delivery, notifications, campaign generation, proof capture, and Buffer queue are active.'],
  ['Offer', 8, '$49.99 scan pack is the main entry, with $229+ utility and high-ticket owner review behind it.'],
  ['Trust', 7, 'Sample scan, scope pages, proof feedback, and results roadmap reduce buyer uncertainty.'],
  ['Traffic', 6, 'Buffer is now scheduling, SEO pages are indexed-ready, but paid traffic still needs disciplined testing.'],
  ['Fast Profit', 7, 'Able to take payments and deliver quickly; scale depends on qualified traffic and proof signals.'],
]
const DAILY_COMMANDS = [
  {
    lane: 'Traffic',
    command: 'Post one useful no-hype scan link where business owners already are.',
    auto: 'Buffer queue and campaign batch can generate/schedule approved posts.',
  },
  {
    lane: 'Conversion',
    command: 'Push the $49.99 Growth Scan Pack first; use $9.99 only as a low-friction backup.',
    auto: 'Tracked landing pages route to Stripe checkout and fulfillment intake.',
  },
  {
    lane: 'Fulfillment',
    command: 'Let low-ticket delivery run, then personally review $229+ and premium prospects.',
    auto: 'Stripe webhook, OpenAI generation, Resend, and Apps Script logging are connected.',
  },
  {
    lane: 'Scale',
    command: 'Increase only channels producing Lead, ViewContent, InitiateCheckout, or Purchase.',
    auto: 'Meta Pixel and Google tag now separate traffic source and funnel events.',
  },
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

function extractFirstPost(text) {
  if (!text) return DEFAULT_SOCIAL_POST
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const firstUrl = lines.find((line) => line.includes('https://')) || ''
  const firstQuoted = lines.find((line) => line.startsWith('"') && line.endsWith('"'))
  const firstAction = lines.find((line) => /x|post|twitter/i.test(line)) || ''
  return [firstQuoted || firstAction || lines[0], firstUrl].filter(Boolean).join('\n')
}

function buildSchedulerCsv({ command, queue }) {
  const source = command || queue || DEFAULT_SOCIAL_POST
  const xPost = extractFirstPost(source)
  const rows = [
    {
      channel: 'X',
      text: xPost,
      link: 'https://quantumaibusiness.com/business-growth-scan.html?utm_source=x&utm_medium=organic&utm_campaign=scheduler_export',
      timing: 'Next open slot',
      status: 'Owner approved before posting',
    },
    {
      channel: 'LinkedIn',
      text:
        'If your site gets attention but not enough action, the issue may be routing, follow-up, or offer clarity. QuantumAiBusiness runs an AI-assisted pressure scan and gives practical next steps. No guaranteed profits, just structured diagnostics.',
      link: 'https://quantumaibusiness.com/business-growth-scan.html?utm_source=linkedin&utm_medium=organic&utm_campaign=scheduler_export',
      timing: 'Next business morning',
      status: 'Owner approved before posting',
    },
    {
      channel: 'Facebook',
      text:
        'Testing a practical AI-assisted business pressure scan for owners who want to find weak follow-up, unclear offers, and missed automation paths. Useful first read, no hype or guaranteed outcomes.',
      link: 'https://quantumaibusiness.com/business-growth-scan.html?utm_source=facebook&utm_medium=organic&utm_campaign=scheduler_export',
      timing: 'After LinkedIn',
      status: 'Owner approved before posting',
    },
    {
      channel: 'Bluesky/Threads',
      text:
        'Business growth is often less about more noise and more about fixing the path from interest to action. QuantumAiBusiness scans that path and turns gaps into next steps.',
      link: 'https://quantumaibusiness.com/business-growth-scan.html?utm_source=threads_bluesky&utm_medium=organic&utm_campaign=scheduler_export',
      timing: 'Later today',
      status: 'Owner approved before posting',
    },
  ]
  const header = ['channel', 'text', 'link', 'timing', 'status']
  const escape = (value) => `"${String(value || '').replaceAll('"', '""')}"`
  return [header.join(','), ...rows.map((row) => header.map((key) => escape(row[key])).join(','))].join('\n')
}

function trafficLink(source) {
  return `https://quantumaibusiness.com/business-growth-scan.html?utm_source=${source}&utm_medium=organic&utm_campaign=traffic_board`
}

function buildTrafficCsv() {
  const header = ['source', 'platform', 'link', 'action']
  const escape = (value) => `"${String(value || '').replaceAll('"', '""')}"`
  return [
    header.join(','),
    ...TRAFFIC_CHANNELS.map(([source, platform, action]) =>
      [source, platform, trafficLink(source), action].map(escape).join(','),
    ),
  ].join('\n')
}

function buildPaidTestCsv() {
  const header = ['channel', 'budget', 'landing_page', 'setup', 'kill_rule']
  const escape = (value) => `"${String(value || '').replaceAll('"', '""')}"`
  return [
    header.join(','),
    ...PAID_TRAFFIC_TESTS.map((test) =>
      [
        test.channel,
        test.budget,
        'https://quantumaibusiness.com/business-growth-scan.html?utm_source=paid_test&utm_medium=paid&utm_campaign=rapid_intake',
        test.setup,
        'Pause if spend produces clicks but no scans, or scans but no paid intent.',
      ].map(escape).join(','),
    ),
  ].join('\n')
}

function buildGoogleAdsCsv() {
  const header = ['campaign', 'budget', 'landing_page', 'kill_rule', 'keywords']
  const escape = (value) => `"${String(value || '').replaceAll('"', '""')}"`
  return [
    header.join(','),
    [
      GOOGLE_ADS_TEST.campaign,
      GOOGLE_ADS_TEST.budget,
      GOOGLE_ADS_TEST.landing,
      GOOGLE_ADS_TEST.kill,
      GOOGLE_ADS_TEST.keywords.join(' | '),
    ].map(escape).join(','),
  ].join('\n')
}

function buildProofCsv(rows) {
  const proofRows = rows.filter((row) => ['proof signal', 'upsell target', 'reply sent'].includes(row.status))
  const header = ['created', 'business', 'email', 'package', 'status', 'nextAction']
  const escape = (value) => `"${String(value || '').replaceAll('"', '""')}"`
  return [header.join(','), ...proofRows.map((row) => header.map((key) => escape(row[key])).join(','))].join('\n')
}

function extractRecordFromText(text) {
  const raw = String(text || '').trim()
  if (!raw) return null
  const fullRecordIndex = raw.indexOf('Full record:')
  const jsonStart = raw.indexOf('{', fullRecordIndex >= 0 ? fullRecordIndex : 0)
  if (jsonStart < 0) return null

  let depth = 0
  let inString = false
  let escaped = false
  for (let index = jsonStart; index < raw.length; index += 1) {
    const char = raw[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) {
      try {
        return JSON.parse(raw.slice(jsonStart, index + 1))
      } catch {
        return null
      }
    }
  }
  return null
}

function decodeAutomationMessage(text) {
  const raw = String(text || '')
  const record = extractRecordFromText(raw) || {}
  const eventType = record.event_type || (raw.match(/QuantumAiBusiness\s+(?:PAYMENT|CLIENT|OWNER AUTOMATION|SYSTEM)?\s*(?:PRIORITY|LOG)?\s*\/\/?\s*([^/\n]+)/i)?.[1] || '').trim()
  const haystack = `${raw} ${eventType}`.toLowerCase()
  const amount = record.amount || ''
  const contact = record.contact_email || record.payload?.buyer_email || record.payload?.customer_email || ''
  const packageName = record.package || record.payload?.package_name || record.payload?.growth_input?.offer || ''
  const target = record.target || record.payload?.target || record.payload?.tracked_links?.pressure_scan || ''

  let category = 'SYSTEM'
  if (/(stripe|checkout|payment)/.test(haystack)) category = 'PAYMENT'
  else if (/(paid_fulfillment|diagnostic|lead|intake|referral|approved_draft)/.test(haystack)) category = 'CLIENT'
  else if (/(growth|campaign|social|digest|post_payment)/.test(haystack)) category = 'OWNER AUTOMATION'

  const realBuyer =
    category === 'PAYMENT' ||
    (category === 'CLIENT' && Boolean(contact)) ||
    /(paid_fulfillment_intake|stripe_checkout_completed|checkout\.session\.completed)/.test(haystack)

  const action =
    category === 'PAYMENT'
      ? 'Check Stripe, then watch for auto fulfillment or intake metadata.'
      : category === 'CLIENT'
        ? 'Review the client record. Low tiers may auto-deliver; higher tiers need owner review.'
        : category === 'OWNER AUTOMATION'
          ? 'This is your machine creating content, campaign, digest, or growth instructions. No buyer action unless it says PAYMENT or CLIENT.'
          : 'System/status message. Usually no client action needed.'

  return {
    category,
    eventType: eventType || 'Unknown event',
    realBuyer,
    action,
    contact: contact || 'Unspecified',
    packageName: packageName || 'Unspecified',
    amount: amount ? `$${amount}` : 'Unspecified',
    target: target || 'Unspecified',
    route: record.lead_route ? record.lead_route.replaceAll('_', ' ') : 'Unspecified',
    score: record.lead_score ? `${record.lead_score}/100` : 'Unspecified',
    record,
    parsed: Boolean(Object.keys(record).length),
  }
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
  const [decoderInput, setDecoderInput] = useState('')
  const [ownerToken, setOwnerToken] = useState(loadOwnerToken)
  const [pipeline, setPipeline] = useState(loadPipeline)
  const parsed = useMemo(() => summarizeInput(rawPacket), [rawPacket])
  const decodedAutomation = useMemo(() => decodeAutomationMessage(decoderInput), [decoderInput])
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
      const proofItems = pipeline.filter((item) => item.status === 'proof signal')
      const replyItems = pipeline.filter((item) => item.status === 'reply sent')
      const totalValue = pipeline.reduce((sum, item) => sum + Number(item.numericValue || 0), 0)
      const activeValue = activeItems.reduce((sum, item) => sum + Number(item.numericValue || 0), 0)
      const scanPackCount = pipeline.filter((item) => item.packageKey === 'growthScanPack').length
      const automationCount = pipeline.filter((item) => ['automatedUtility', 'fullStrategic', 'premiumReferral'].includes(item.packageKey)).length
      const averageValue = pipeline.length ? totalValue / pipeline.length : 0
      return {
        active: activeItems.length,
        paid: paidItems.length,
        upsell: upsellItems.length,
        proof: proofItems.length,
        replies: replyItems.length,
        value: totalValue,
        activeValue,
        scanPackCount,
        automationCount,
        averageValue,
      }
    },
    [pipeline],
  )
  const conversionCommand = useMemo(() => {
    if (!pipeline.length) return 'Get the next real signal: send traffic to the scan page and watch for Lead or InitiateCheckout.'
    if (pipelineStats.proof > 0) return 'Convert proof signals into anonymous case notes, then reuse the repeated blocker in traffic copy and upsells.'
    if (pipelineStats.upsell > 0) return 'Work the upsell queue first. These are the warmest paths toward Automated Utility or full strategy revenue.'
    if (pipelineStats.paid > 0) return 'Confirm paid fulfillment, then follow up with the Automated Utility upgrade when the scan exposes repeated gaps.'
    if (pipelineStats.active > 0) return 'Move active leads to a clear next status: report ready, reply sent, upsell target, or closed.'
    return 'Re-open traffic: post the scan link, run a tiny tracked test, and save any response into the pipeline.'
  }, [pipeline.length, pipelineStats.active, pipelineStats.paid, pipelineStats.proof, pipelineStats.upsell])
  const automationReadiness = useMemo(() => {
    if (!backendHealth?.configured) return 0
    const keys = ['resend', 'stripe_webhook_secret', 'openai_api_key', 'automation_webhook', 'owner_action_token', 'cron_secret', 'proof_feedback', 'social_queue']
    const active = keys.filter((key) => backendHealth.configured?.[key]).length
    return Math.round((active / keys.length) * 100)
  }, [backendHealth])

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

  function exportSchedulerCsv() {
    const content = buildSchedulerCsv({ command: dailyCommand, queue: socialQueue || campaignBatch || growthPack })
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quantumaibusiness-social-scheduler.csv'
    link.click()
    URL.revokeObjectURL(url)
    setCopied('Social scheduler CSV export ready')
  }

  function exportTrafficCsv() {
    const blob = new Blob([buildTrafficCsv()], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quantumaibusiness-traffic-links.csv'
    link.click()
    URL.revokeObjectURL(url)
    setCopied('Traffic links CSV export ready')
  }

  function exportPaidTestCsv() {
    const blob = new Blob([buildPaidTestCsv()], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quantumaibusiness-paid-test-plan.csv'
    link.click()
    URL.revokeObjectURL(url)
    setCopied('Paid test CSV export ready')
  }

  function exportGoogleAdsCsv() {
    const blob = new Blob([buildGoogleAdsCsv()], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quantumaibusiness-google-ads-50-test.csv'
    link.click()
    URL.revokeObjectURL(url)
    setCopied('Google Ads $50 test CSV export ready')
  }

  function exportProofCsv() {
    const blob = new Blob([buildProofCsv(pipeline)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'quantumaibusiness-proof-signals.csv'
    link.click()
    URL.revokeObjectURL(url)
    setCopied('Proof signal CSV export ready')
  }

  function markLatestPaidAsProof() {
    setPipeline((current) => {
      const index = current.findIndex((item) => ['paid intake', 'report ready', 'reply sent'].includes(item.status))
      if (index < 0) {
        setCopied('No paid or replied lead found to mark as proof')
        return current
      }
      const next = current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              status: 'proof signal',
              nextAction: 'Review for an anonymous case note, then route any repeated blocker toward Automated Utility.',
            }
          : item,
      )
      savePipeline(next)
      setCopied('Latest paid/replied lead marked as proof signal')
      return next
    })
  }

  async function copyQuickXPost() {
    await copyText('Quick X post', extractFirstPost(dailyCommand || socialQueue || campaignBatch || growthPack || DEFAULT_SOCIAL_POST))
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
      action: 'send_approved_draft',
      owner_token: ownerToken,
      to: effective.email,
      subject,
      text: aiDraft,
      business: effective.business,
      website: effective.website,
      package_name: packageDetail.label,
    }

    try {
      setSendStatus('Sending approved draft through Vercel/Resend...')
      const response = await fetch(`${AUTOMATION_API_URL}/api/fulfillment`, {
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
      setFollowUpStatus('Generating owner-reviewed follow-up route brief...')
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
      setFollowUpDraft(data.report || 'No follow-up route brief returned.')
      setFollowUpStatus(
        data.generated
          ? `Follow-up route generated for ${data.route.replaceAll('_', ' ')} at ${data.score}/100`
          : `Fallback follow-up route created: ${data.generation_reason || 'AI generation unavailable'}`,
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

      <section className="owner-command-deck">
        <div className="owner-command-card owner-command-primary">
          <span>FASTEST NEXT MOVE</span>
          <strong>{conversionCommand}</strong>
          <p>
            Automation readiness: {automationReadiness}% // Tracked value: ${pipelineStats.value.toFixed(2)} // Active value: ${pipelineStats.activeValue.toFixed(2)}
          </p>
          <div className="owner-command-buttons">
            <button type="button" onClick={runDailyDigest}>RUN DAILY OPS</button>
            <button type="button" onClick={requestCampaignBatch}>BUILD CAMPAIGN</button>
            <button type="button" onClick={requestSocialQueue}>QUEUE SOCIAL</button>
          </div>
        </div>

        <div className="owner-command-card">
          <span>FUNNEL STATUS</span>
          <div className="owner-command-stats">
            <strong>{pipelineStats.active}</strong><small>active</small>
            <strong>{pipelineStats.paid}</strong><small>paid</small>
            <strong>{pipelineStats.proof}</strong><small>proof</small>
            <strong>{pipelineStats.upsell}</strong><small>upsell</small>
            <strong>{pipelineStats.automationCount}</strong><small>high tier</small>
            <strong>{pipelineStats.replies}</strong><small>replies</small>
          </div>
        </div>

        <div className="owner-command-card owner-command-links">
          <span>MONEY LINKS</span>
          {MONEY_LINKS.map((link) => (
            <button key={link.label} type="button" onClick={() => copyText(link.label, link.url)}>
              <strong>{link.label}</strong>
              <small>{link.priority}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="owner-command-deck owner-command-lanes">
        {DAILY_COMMANDS.map((item) => (
          <article key={item.lane}>
            <span>{item.lane}</span>
            <strong>{item.command}</strong>
            <p>{item.auto}</p>
          </article>
        ))}
      </section>

      <section className="owner-panel owner-scorecard">
        <div className="owner-panel-title">
          <h2>Business Scorecard</h2>
        </div>
        <div className="owner-score-grid">
          {BUSINESS_SCORECARD.map(([label, score, note]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{score}/10</strong>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel owner-proof-engine">
          <div className="owner-panel-title">
            <h2>Proof Engine</h2>
            <button type="button" onClick={markLatestPaidAsProof}>MARK LATEST PROOF</button>
            <button type="button" onClick={exportProofCsv}>EXPORT PROOF</button>
          </div>
          <p>
            This is the trust loop: paid scan, client signal, anonymous case note, better offer copy, then stronger upsell.
          </p>
          <div className="owner-proof-grid">
            {PROOF_LOOP_ACTIONS.map((action) => (
              <article key={action}>{action}</article>
            ))}
          </div>
        </div>

        <div className="owner-panel owner-access-map">
          <div className="owner-panel-title">
            <h2>Access Map</h2>
          </div>
          <p>
            These are the main systems already connected or ready. The safest automation path is internal generation and tracking first, public posting/spend second.
          </p>
          <div className="owner-access-grid">
            {ACCESS_ACTIONS.map((item) => (
              <article key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.status}</span>
                <p>{item.next}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel owner-decoder">
          <div className="owner-panel-title">
            <h2>0. Automation Decoder</h2>
            <button type="button" onClick={() => setDecoderInput('')}>CLEAR</button>
          </div>
          <textarea
            value={decoderInput}
            onChange={(event) => setDecoderInput(event.target.value)}
            placeholder="Paste any QuantumAiBusiness email/log here. This tells you if it was a real buyer, client action, owner automation, or system noise."
          />
        </div>

        <div className={`owner-panel owner-decode-card is-${decodedAutomation.category.toLowerCase().replaceAll(' ', '-')}`}>
          <div className="owner-decode-banner">
            <span>{decodedAutomation.category}</span>
            <strong>{decodedAutomation.realBuyer ? 'REAL BUYER / CLIENT PATH' : 'NOT A BUYER EVENT'}</strong>
          </div>
          <div className="owner-decode-grid">
            <span><strong>Event</strong>{decodedAutomation.eventType}</span>
            <span><strong>Action</strong>{decodedAutomation.action}</span>
            <span><strong>Contact</strong>{decodedAutomation.contact}</span>
            <span><strong>Package</strong>{decodedAutomation.packageName}</span>
            <span><strong>Amount</strong>{decodedAutomation.amount}</span>
            <span><strong>Score / route</strong>{decodedAutomation.score} // {decodedAutomation.route}</span>
          </div>
          <p className="owner-inline-status">
            {decodedAutomation.parsed
              ? 'Full record parsed. Use this card first, then only dig into JSON if needed.'
              : 'No full JSON record parsed yet. Paste the whole email including Full record when possible.'}
          </p>
        </div>
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
            <span><strong>{pipelineStats.proof}</strong> proof</span>
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
                <span className={backendHealth.configured?.proof_feedback ? 'is-on' : ''}>Proof</span>
                <span className={backendHealth.campaign_batch_mode === 'daily_cron_enabled' ? 'is-on' : ''}>Batch</span>
                <span className={backendHealth.configured?.social_queue ? 'is-on' : ''}>Social</span>
              </div>
            )}
            {backendHealth && (
              <p>
                Fulfillment: {backendHealth.fulfillment_mode} // Client email: {backendHealth.fulfillment_client_email_mode} // Lead follow-up: {backendHealth.lead_follow_up_mode || 'owner_review'}
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
        <div className="owner-panel owner-social-plan">
          <div className="owner-panel-title">
            <h2>11. Social Scheduler</h2>
            <button type="button" onClick={copyQuickXPost}>COPY X POST</button>
            <button type="button" onClick={exportSchedulerCsv}>EXPORT CSV</button>
          </div>
          <p>
            Best automation route: generate here, approve here, schedule in Buffer/Typefully/Hypefury. Keep auto-posting off until the accounts have momentum.
          </p>
          <div className="owner-social-grid">
            {SOCIAL_PLATFORMS.map((item) => (
              <article key={item.platform}>
                <strong>{item.platform}</strong>
                <span>{item.timing}</span>
                <p>{item.action}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>12. Quick Post</h2>
            <button type="button" onClick={copyQuickXPost}>COPY</button>
          </div>
          <pre>{extractFirstPost(dailyCommand || socialQueue || campaignBatch || growthPack || DEFAULT_SOCIAL_POST)}</pre>
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel owner-google-ads">
          <div className="owner-panel-title">
            <h2>Google Ads $50 Test</h2>
            <button type="button" onClick={() => copyText('Google Ads landing URL', GOOGLE_ADS_TEST.landing)}>COPY URL</button>
            <button type="button" onClick={exportGoogleAdsCsv}>EXPORT TEST</button>
          </div>
          <p>
            Strongest paid-intent route right now: exact/phrase Google Search only. One scan sale nearly validates the spend; two sales means the channel has life.
          </p>
          <div className="owner-google-box">
            <span><strong>Campaign</strong>{GOOGLE_ADS_TEST.campaign}</span>
            <span><strong>Budget</strong>{GOOGLE_ADS_TEST.budget}</span>
            <span><strong>Kill rule</strong>{GOOGLE_ADS_TEST.kill}</span>
          </div>
          <div className="owner-keyword-list">
            {GOOGLE_ADS_TEST.keywords.map((keyword) => (
              <code key={keyword}>{keyword}</code>
            ))}
          </div>
        </div>

        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>Ad Guardrails</h2>
          </div>
          <div className="owner-action-list">
            <label><input type="checkbox" /> Search Network only. Display Network off.</label>
            <label><input type="checkbox" /> Phrase/exact keywords only. No broad match.</label>
            <label><input type="checkbox" /> Do not accept Google budget/target expansion recommendations.</label>
            <label><input type="checkbox" /> Pause at $25 if there is no useful action.</label>
            <label><input type="checkbox" /> Hard stop at $50 unless purchase or strong checkout intent appears.</label>
          </div>
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel owner-traffic-board">
          <div className="owner-panel-title">
            <h2>13. Traffic Board</h2>
            <button type="button" onClick={exportTrafficCsv}>EXPORT LINKS</button>
          </div>
          <p>
            Fast free traffic comes from targeted usefulness: posts, comments, answers, shorts, and email signatures. Use these links so analytics can separate channels.
          </p>
          <div className="owner-traffic-grid">
            {TRAFFIC_CHANNELS.map(([source, platform, action]) => (
              <article key={source}>
                <strong>{platform}</strong>
                <p>{action}</p>
                <code>{trafficLink(source)}</code>
                <button type="button" onClick={() => copyText(`${platform} traffic link`, trafficLink(source))}>COPY LINK</button>
              </article>
            ))}
          </div>
        </div>

        <div className="owner-panel owner-passive-paid">
          <div className="owner-panel-title">
            <h2>14. Passive + Paid Launch</h2>
            <button type="button" onClick={() => copyText('Email signature', PASSIVE_TRAFFIC_ASSETS[0].text)}>COPY EMAIL SIG</button>
            <button type="button" onClick={() => copyText('Social bio', PASSIVE_TRAFFIC_ASSETS[1].text)}>COPY BIO</button>
            <button type="button" onClick={exportPaidTestCsv}>EXPORT PAID</button>
          </div>
          <p>
            Best fast route: set the passive links once, then run one tiny paid test at a time. Keep spend low until a channel creates scans, paid intent, or replies.
          </p>
          <div className="owner-passive-grid">
            {PASSIVE_TRAFFIC_ASSETS.map((asset) => (
              <article key={asset.label}>
                <strong>{asset.label}</strong>
                <p>{asset.purpose}</p>
                <code>{asset.text}</code>
                <button type="button" onClick={() => copyText(asset.label, asset.text)}>COPY</button>
              </article>
            ))}
          </div>
          <div className="owner-paid-grid">
            {PAID_TRAFFIC_TESTS.map((test) => (
              <article key={test.channel}>
                <strong>{test.channel}</strong>
                <span>{test.budget}</span>
                <p>{test.setup}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>15. Rapid Intake</h2>
          </div>
          <div className="owner-action-list">
            <label><input type="checkbox" /> Post one X or LinkedIn link using the traffic-board UTM.</label>
            <label><input type="checkbox" /> Make three useful comments before dropping any link.</label>
            <label><input type="checkbox" /> Add the scan link to email signature and social bios.</label>
            <label><input type="checkbox" /> Check owner console, Gmail, Stripe, and Sheet after posting.</label>
          </div>
        </div>

        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>16. Follow-Up Draft</h2>
            <button type="button" onClick={requestFollowUpDraft}>GENERATE FOLLOW-UP</button>
          </div>
          <p className="owner-inline-status">
            Creates a review-only customer follow-up or upsell message based on the current fields and route.
          </p>
          {followUpStatus && <p className="owner-inline-status">{followUpStatus}</p>}
        </div>
      </section>

      <section className="owner-grid owner-ops-grid">
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>17. Follow-Up Copy</h2>
            <button type="button" onClick={() => copyText('Follow-up draft', followUpDraft)}>COPY FOLLOW-UP</button>
          </div>
          <pre>{followUpDraft || 'No follow-up generated yet. Review the fields above, then use GENERATE FOLLOW-UP.'}</pre>
        </div>
      </section>

      <section className="owner-grid owner-output-grid">
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>18. Strategy Report</h2>
            <button type="button" onClick={() => copyText('Report', report)}>COPY REPORT</button>
          </div>
          <pre>{report}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>19. Customer Reply</h2>
            <button type="button" onClick={() => copyText('Reply', reply)}>COPY REPLY</button>
          </div>
          <pre>{reply}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>20. Upgrade Follow-Up</h2>
            <button type="button" onClick={() => copyText('Upgrade follow-up', upsell)}>COPY UPSELL</button>
          </div>
          <pre>{upsell}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>21. Outreach Copy</h2>
            <button type="button" onClick={() => copyText('Outreach copy', outreachCopy)}>COPY OUTREACH</button>
          </div>
          <pre>{outreachCopy}</pre>
        </div>
      </section>

      {copied && <p className="owner-toast">{copied}</p>}
    </main>
  )
}
