import { useEffect, useMemo, useState } from 'react'
import WireframeField from './WireframeField.jsx'

const PAYMENT_LINKS = {
  outlinedStrategy:
    import.meta.env.VITE_OUTLINED_STRATEGY_PAYMENT_URL ||
    import.meta.env.VITE_AUDIT_PAYMENT_URL ||
    'https://buy.stripe.com/fZu28qet66Ff2pE78Cfw401',
  growthScanPack: import.meta.env.VITE_GROWTH_SCAN_PACK_PAYMENT_URL || 'https://buy.stripe.com/4gM00i4SwfbLfcq50ufw404',
  automatedUtility:
    import.meta.env.VITE_AUTOMATED_UTILITY_PAYMENT_URL ||
    import.meta.env.VITE_OVERHAUL_PAYMENT_URL ||
    'https://buy.stripe.com/aFa8wO84IaVv3tIeB4fw402',
  fullStrategic:
    import.meta.env.VITE_FULL_STRATEGIC_PAYMENT_URL ||
    import.meta.env.VITE_FULL_SPECTRUM_PAYMENT_URL ||
    'https://buy.stripe.com/aFa00iet6d3D8O21Oifw403',
  premiumReferral: import.meta.env.VITE_PREMIUM_REFERRAL_URL || 'https://quantumbusinessstrategies.com',
}

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'quantumbusinessstrategies@gmail.com'
const PARTNER_LINKS = {
  riskforge: 'https://riskforgeai.xyz',
  strategies: 'https://quantumbusinessstrategies.com',
  pepes: 'https://quantumpepes.xyz',
}
const LEAD_WEBHOOK = import.meta.env.VITE_LEAD_WEBHOOK_URL || ''
const AUTOMATION_API_URL = import.meta.env.VITE_AUTOMATION_API_URL || 'https://quantumaibusiness.vercel.app'
const OWNER_NOTIFICATION_URL =
  import.meta.env.VITE_OWNER_NOTIFICATION_URL || `https://formsubmit.co/ajax/${CONTACT_EMAIL}`
const GOOGLE_TAG_ID = import.meta.env.VITE_GOOGLE_TAG_ID || ''
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || ''
const SITE_URL = 'https://quantumaibusiness.com'
const MONEY_PAGE_URL = `${SITE_URL}/business-growth-scan.html`
const SHARE_TITLE = 'QuantumAiBusiness'
const SHARE_TEXT = 'Run a cyber growth-pressure scan for business faults, profit leaks, and automation opportunities.'
const EVENT_STORAGE_KEY = 'quantumaibusiness_event_log'
const ATTRIBUTION_STORAGE_KEY = 'quantumaibusiness_attribution'
const MAX_EVENT_LOG = 40
const FULFILLMENT_PACKAGES = [
  ['outlinedStrategy', 'Outlined Strategy'],
  ['growthScanPack', 'Growth Scan Pack'],
  ['automatedUtility', 'Automated Utility'],
  ['fullStrategic', 'Full Strategic Growth'],
  ['premiumReferral', 'Premium Referral'],
]
const AUTOMATION_FLOW = [
  {
    label: 'Capture',
    copy: 'Business names, websites, scan results, package selections, and share actions become structured events.',
  },
  {
    label: 'Notify',
    copy: `Each major event attempts an owner email notification to ${CONTACT_EMAIL} through the configured notification route.`,
  },
  {
    label: 'Auto-route',
    copy: 'Low-tier packages move prospects into checkout and automated delivery while serious scopes are held for owner review.',
  },
  {
    label: 'Escalate',
    copy: 'Premium referral and higher-ticket growth signals are marked for owner review so serious prospects get attention.',
  },
]
const CAMPAIGN_LINKS = [
  {
    label: 'Business pressure scan',
    href: `${MONEY_PAGE_URL}?utm_source=organic&utm_medium=share&utm_campaign=pressure_scan`,
  },
  {
    label: '$9.99 strategy offer',
    href: `${SITE_URL}/paid-growth-diagnostic.html?utm_source=organic&utm_medium=share&utm_campaign=strategy_offer`,
  },
  {
    label: '$49.99 scan pack',
    href: `${SITE_URL}/growth-scan-pack.html?utm_source=organic&utm_medium=share&utm_campaign=growth_scan_pack`,
  },
  {
    label: 'Automation utility offer',
    href: `${SITE_URL}/automated-utility.html?utm_source=organic&utm_medium=share&utm_campaign=automation_utility`,
  },
  {
    label: 'Referral link',
    href: `${SITE_URL}/refer-business.html?utm_source=organic&utm_medium=share&utm_campaign=refer_business`,
  },
]
const AD_ANGLES = [
  'Your business may not need more effort. It may need fewer leaks. Run the QuantumAiBusiness pressure scan.',
  'Missing follow-up, weak routing, and unclear offers quietly drain revenue. Quantify the gaps before they compound.',
  'Turn a business name or website into an AI-assisted growth readout, then choose the strategy or automation path that fits.',
]
const ORGANIC_POSTS = [
  'Built a cyber business-pressure scanner for owners who want to find profit leaks, weak follow-up, and unused automation paths.',
  'If your website gets attention but not enough paid action, the problem may be routing. QuantumAiBusiness scans the pressure points.',
  'New offer: $9.99 AI-assisted strategy outline for business owners who want a fast first read on growth gaps.',
]
const SOCIAL_SETUP = [
  'Claim QuantumAiBusiness on X, LinkedIn, TikTok, Instagram, Facebook, YouTube, Reddit, Threads, and Bluesky where available.',
  'Use the same avatar, one-line promise, and link: quantumaibusiness.com/business-growth-scan.html?utm_source=social&utm_medium=bio&utm_campaign=profile',
  'Post the same launch message manually across accounts first, then decide which platform is worth automating.',
]
const PACKAGE_LADDER = [
  ['Entry', '$9.99', 'Paid diagnostic gateway that can auto-deliver after intake.'],
  ['Pack', '$49.99', 'Five-scan AI utility pack that can auto-deliver without owner approval.'],
  ['Core', '$229.99+', 'Automation utility path for businesses ready to connect workflow pieces.'],
  ['Anchor', '$2,500+', 'Owner-reviewed strategic build for serious growth-system work.'],
  ['Premier', 'Referral', 'High-touch QuantumBusinessStrategies routing when scope is bigger.'],
]

function rand(seed, min, max) {
  const n = Math.sin(seed * 9999) * 10000
  return (n - Math.floor(n)) * (max - min) + min
}

function createField(count, mapper) {
  return Array.from({ length: count }, (_, i) => mapper(i + 1))
}

function fingerprint(text) {
  return Array.from(text || 'quantum').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 137)
}

function scanTarget(target, result) {
  const seed = fingerprint(target)
  const conversionLeak = 12 + (seed % 31)
  const automationWaste = 8 + (seed % 24)
  const followupLeak = 10 + (seed % 29)
  const readiness = Math.max(18, Math.min(96, result.readiness + (seed % 17) - 8))
  const bottlenecks = [
    'Offer clarity is probably not doing enough selling before a human gets involved',
    'Lead capture should be tied to instant follow-up, owner alerts, and a paid next step',
    'Retargeting and abandoned-interest recovery are likely underused',
    'Client delivery can be packaged into repeatable automation instead of custom chaos',
    'Reporting should show cash movement, lead source, conversion stage, and next action',
  ]

  return {
    readiness,
    score: 100 - readiness,
    losses: [
      `${conversionLeak}% estimated conversion friction from unclear next-step routing`,
      `${automationWaste} hours per month may be recoverable through automated intake and follow-up`,
      `${followupLeak}% of warm interest may be leaking without structured retargeting`,
    ],
    bottlenecks: bottlenecks.sort((a, b) => ((seed + a.length) % 7) - ((seed + b.length) % 7)).slice(0, 3),
  }
}

function scoreFromAnswers(form) {
  const values = [form.revenue, form.leads, form.operations, form.accounting, form.advertising, form.automation].map(Number)
  const total = values.reduce((sum, value) => sum + value, 0)
  const readiness = Math.round((total / (values.length * 5)) * 100)
  const gaps = [
    ['Lead capture', Number(form.leads)],
    ['Operations', Number(form.operations)],
    ['Accounting', Number(form.accounting)],
    ['Advertising', Number(form.advertising)],
    ['Automation', Number(form.automation)],
  ]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([label]) => label)

  return { readiness, gaps }
}

function mailtoHref({ form, result, scan, packageName = 'General inquiry' }) {
  const subject = encodeURIComponent(`Quantum AI Business: ${packageName} - ${form.company || form.website || 'New lead'}`)
  const body = encodeURIComponent(
    [
      `Package: ${packageName}`,
      `Company: ${form.company}`,
      `Website/business name: ${form.website || form.company}`,
      `Email: ${form.email}`,
      `Revenue clarity: ${form.revenue}`,
      `Leads: ${form.leads}`,
      `Operations: ${form.operations}`,
      `Accounting: ${form.accounting}`,
      `Advertising: ${form.advertising}`,
      `Automation: ${form.automation}`,
      `Objective: ${form.objective}`,
      `Readiness score: ${result.readiness}%`,
      `Priority gaps: ${result.gaps.join(', ')}`,
      `Scan pressure: ${scan?.score || 'Not generated'}`,
      `Scan notes: ${(scan?.bottlenecks || []).join(' | ')}`,
    ].join('\n'),
  )

  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
}

async function notifyOwner(type, payload) {
  const automationEndpoint = AUTOMATION_API_URL
    ? `${AUTOMATION_API_URL.replace(/\/$/, '')}${AUTOMATION_API_URL.endsWith('/api/lead') ? '' : '/api/lead'}`
    : ''
  const endpoint = automationEndpoint || LEAD_WEBHOOK || OWNER_NOTIFICATION_URL
  if (!endpoint) return false
  const actionMode = payload.package?.key === 'premiumReferral' || Number(payload.package?.amount || 0) >= 2500 ? 'owner_review' : 'auto_route'

  const subject = `Quantum AI Business ${type.replaceAll('_', ' ')}`
  const message = JSON.stringify(
    {
      event: type,
      action_mode: actionMode,
      timestamp: new Date().toISOString(),
      ...payload,
    },
    null,
    2,
  )

  try {
    const body = automationEndpoint
      ? {
          event_type: type,
          action_mode: actionMode,
          notify: CONTACT_EMAIL,
          source: 'quantumaibusiness.com',
          payload,
        }
      : {
          _subject: subject,
          _template: 'table',
          _captcha: 'false',
          event_type: type,
          action_mode: actionMode,
          notify: CONTACT_EMAIL,
          source: 'quantumaibusiness.com',
          message,
        }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    return response.ok
  } catch {
    return false
  }
}

function fulfillmentOwnerMessage(packet) {
  return [
    'PAID BUYER FULFILLMENT PACKET',
    '',
    `Next action: Review payment in Stripe, confirm package, then prepare the ${packet.package_name || 'selected'} deliverable.`,
    `Package: ${packet.package_name || packet.package_key || 'Unspecified'}`,
    `Amount: ${packet.amount ? `$${packet.amount}` : 'Check Stripe'}`,
    `Business: ${packet.company || 'Unspecified'}`,
    `Website: ${packet.website || 'Unspecified'}`,
    `Delivery email: ${packet.customer_email || 'Unspecified'}`,
    `Stripe payment email: ${packet.payment_email || packet.customer_email || 'Unspecified'}`,
    `Current tools: ${packet.current_tools || 'Not provided'}`,
    `Objective: ${packet.objective || 'Not provided'}`,
    `Constraints: ${packet.constraints || 'Not provided'}`,
    '',
    'Owner checklist:',
    '- Confirm Stripe payment succeeded.',
    '- Match Stripe email to delivery email if different.',
    '- Review objective and constraints.',
    '- Deliver the paid strategy or queue it for backend AI generation when connected.',
    '- Escalate full-growth or premium requests before making major service commitments.',
  ].join('\n')
}

async function submitFulfillmentPacket(packet) {
  const fulfillmentEndpoint = AUTOMATION_API_URL
    ? `${AUTOMATION_API_URL.replace(/\/$/, '')}${AUTOMATION_API_URL.endsWith('/api/fulfillment') ? '' : '/api/fulfillment'}`
    : ''

  if (fulfillmentEndpoint) {
    const response = await fetch(fulfillmentEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(packet),
    })
    if (!response.ok) throw new Error('Fulfillment endpoint rejected the intake')
    return response.json()
  }

  const response = await fetch(OWNER_NOTIFICATION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `QuantumAiBusiness paid fulfillment intake - ${packet.company || packet.website || packet.customer_email}`,
      _template: 'table',
      _captcha: 'false',
      event_type: 'paid_fulfillment_intake',
      notify: CONTACT_EMAIL,
      source: 'quantumaibusiness.com',
      next_action: 'Review Stripe payment, confirm package, and prepare deliverable',
      package: packet.package_name || packet.package_key,
      amount: packet.amount ? `$${packet.amount}` : 'Check Stripe',
      business: packet.company,
      website: packet.website,
      delivery_email: packet.customer_email,
      stripe_payment_email: packet.payment_email || packet.customer_email,
      current_tools: packet.current_tools,
      objective: packet.objective,
      constraints: packet.constraints,
      owner_checklist: fulfillmentOwnerMessage(packet),
    }),
  })

  return { ok: response.ok, mode: 'static_email_fallback', generated: false, deliverable: '' }
}

async function requestBusinessDiagnostic({ target, form }) {
  const diagnosticEndpoint = AUTOMATION_API_URL
    ? `${AUTOMATION_API_URL.replace(/\/$/, '')}${AUTOMATION_API_URL.endsWith('/api/diagnostic') ? '' : '/api/diagnostic'}`
    : ''

  if (!diagnosticEndpoint) return null

  const response = await fetch(diagnosticEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      target,
      company: form.company,
      website: form.website,
      email: form.email,
      objective: form.objective,
      source: 'public_quantify_business',
    }),
  })

  if (!response.ok) return null
  return response.json()
}

function loadStoredEvents() {
  try {
    return JSON.parse(window.localStorage.getItem(EVENT_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function loadStoredAttribution() {
  try {
    return JSON.parse(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function captureAttribution() {
  const params = new URLSearchParams(window.location.search)
  const stored = loadStoredAttribution()
  const next = {
    ...stored,
    landing_path: stored.landing_path || window.location.pathname,
    referrer: stored.referrer || document.referrer || '',
    first_seen: stored.first_seen || new Date().toISOString(),
    last_seen: new Date().toISOString(),
  }
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref']) {
    const value = params.get(key)
    if (value) next[key] = value.slice(0, 160)
  }
  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Attribution is helpful but not required for the site to function.
  }
  return next
}

function serializeCsvValue(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

function buildCsv(events) {
  const header = ['timestamp', 'event', 'target', 'package', 'score', 'readiness']
  const rows = events.map((event) =>
    [event.timestamp, event.type, event.target, event.package, event.score, event.readiness].map(serializeCsvValue).join(','),
  )
  return [header.join(','), ...rows].join('\n')
}

function createAutomationEvent(type, payload, fallbackTarget) {
  const packageTitle = payload.package?.title || ''
  const isPremium = payload.package?.key === 'premiumReferral' || packageTitle.toLowerCase().includes('premium')
  const isHighValue = payload.package?.key === 'fullStrategic' || Number(payload.package?.amount || 0) >= 2500
  const actionMode = isPremium || isHighValue ? 'owner_review' : type.includes('package') ? 'auto_checkout_route' : 'auto_capture_notify'

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    actionMode,
    timestamp: new Date().toISOString(),
    target: payload.form?.website || payload.form?.company || fallbackTarget || 'Unspecified',
    package: packageTitle,
    score: payload.scan?.score ?? '',
    readiness: payload.scan?.readiness ?? payload.result?.readiness ?? '',
    payload,
  }
}

export default function QuantumAIWebsite() {
  const [target, setTarget] = useState('')
  const [open, setOpen] = useState(false)
  const [resp, setResp] = useState('AWAITING QUANTUM BUSINESS SCAN...')
  const [leadStatus, setLeadStatus] = useState('')
  const [scan, setScan] = useState(null)
  const [referralOpen, setReferralOpen] = useState(false)
  const [packageStatus, setPackageStatus] = useState('')
  const [scanBurst, setScanBurst] = useState(0)
  const [activeHash, setActiveHash] = useState(() => window.location.hash)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const [automationEvents, setAutomationEvents] = useState(loadStoredEvents)
  const [automationStatus, setAutomationStatus] = useState('AUTOPILOT READY - OWNER ALERTS ON - HIGH TIER REVIEW')
  const [campaignStatus, setCampaignStatus] = useState('')
  const [attribution] = useState(captureAttribution)
  const [fulfillmentStatus, setFulfillmentStatus] = useState('')
  const [fulfillmentDeliverable, setFulfillmentDeliverable] = useState('')
  const [fulfillmentForm, setFulfillmentForm] = useState({
    packageKey: 'outlinedStrategy',
    company: '',
    website: '',
    customerEmail: '',
    paymentEmail: '',
    objective: '',
    currentTools: '',
    constraints: '',
  })
  const [form, setForm] = useState({
    company: '',
    website: '',
    email: '',
    revenue: '2',
    leads: '2',
    operations: '2',
    accounting: '2',
    advertising: '2',
    automation: '2',
    objective: '',
  })

  const stars = useMemo(
    () => createField(56, (i) => ({ id: i, x: rand(i, 0, 100), y: rand(i + 3, 0, 100), s: rand(i + 7, 1, 3) })),
    [],
  )
  const coins = useMemo(
    () =>
      createField(10, (i) => ({
        id: i,
        x: rand(i + 11, 0, 100),
        y: rand(i + 19, 8, 88),
        s: rand(i + 23, 12, 20),
        d: rand(i + 29, 2, 6),
      })),
    [],
  )
  const beams = useMemo(
    () =>
      createField(8, (i) => ({
        id: i,
        x: rand(i + 31, 0, 100),
        y: rand(i + 37, 0, 100),
        w: rand(i + 41, 80, 260),
        r: rand(i + 43, -65, 65),
        o: rand(i + 47, 0.2, 0.8),
      })),
    [],
  )
  const particles = useMemo(
    () =>
      createField(28, (i) => ({
        id: i,
        x: rand(i + 79, 0, 100),
        y: rand(i + 83, 0, 100),
        s: rand(i + 89, 2, 5),
        d: rand(i + 97, 4, 12),
      })),
    [],
  )
  const binaryBursts = useMemo(
    () =>
      createField(16, (i) => ({
        id: i,
        text: i % 2 ? '101101' : '010010',
        left: rand(i + 103, 0, 98),
        top: rand(i + 109, 0, 96),
        delay: -rand(i + 113, 0, 10),
        duration: rand(i + 127, 5, 13),
      })),
    [],
  )
  const matrixStreams = useMemo(
    () =>
      createField(68, (i) => ({
        id: i,
        glyphs: createField(8 + (i % 7), (j) => (rand(i * j + 131, 0, 1) > 0.5 ? '1' : '0')).join('\n'),
        left: rand(i + 137, 0, 100),
        duration: rand(i + 149, 8, 20),
        delay: -rand(i + 151, 0, 16),
        opacity: rand(i + 157, 0.06, 0.32),
      })),
    [],
  )

  const result = useMemo(() => scoreFromAnswers(form), [form])

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0)
    }
  }, [])

  useEffect(() => {
    recordAutomationEvent('traffic_attribution_captured', { attribution }, { notify: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (GOOGLE_TAG_ID && !document.querySelector(`[data-quantum-script="gtag-${GOOGLE_TAG_ID}"]`)) {
      const gtagScript = document.createElement('script')
      gtagScript.async = true
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`
      gtagScript.dataset.quantumScript = `gtag-${GOOGLE_TAG_ID}`
      document.head.appendChild(gtagScript)
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', GOOGLE_TAG_ID)
    }

    if (META_PIXEL_ID && !window.fbq) {
      window.fbq = function fbq() {
        window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments)
      }
      window.fbq.push = window.fbq
      window.fbq.loaded = true
      window.fbq.version = '2.0'
      window.fbq.queue = []
      const metaScript = document.createElement('script')
      metaScript.async = true
      metaScript.src = 'https://connect.facebook.net/en_US/fbevents.js'
      metaScript.dataset.quantumScript = `meta-${META_PIXEL_ID}`
      document.head.appendChild(metaScript)
      window.fbq('init', META_PIXEL_ID)
      window.fbq('track', 'PageView')
    }
  }, [])

  useEffect(() => {
    function updateHash() {
      setActiveHash(window.location.hash)
    }

    window.addEventListener('hashchange', updateHash)
    updateHash()
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function updateFulfillmentField(event) {
    const { name, value } = event.target
    setFulfillmentForm((current) => ({ ...current, [name]: value }))
  }

  function recordLocalAutomationEvent(type, payload = {}) {
    const event = createAutomationEvent(type, payload, target)

    setAutomationEvents((current) => {
      const next = [event, ...current].slice(0, MAX_EVENT_LOG)
      try {
        window.localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Local storage can be blocked in some browsers; the in-session log still updates.
      }
      return next
    })

    return event
  }

  async function recordAutomationEvent(type, payload = {}, options = {}) {
    const payloadWithAttribution = { ...payload, attribution }
    const event = recordLocalAutomationEvent(type, payloadWithAttribution)

    if (options.notify === false) {
      setAutomationStatus(`${type.replaceAll('_', ' ').toUpperCase()} RECORDED LOCALLY // SINGLE FULFILLMENT EMAIL SENT`)
      return true
    }

    const sent = await notifyOwner(type, payloadWithAttribution)
    setAutomationStatus(
      sent
        ? `${type.replaceAll('_', ' ').toUpperCase()} SENT TO OWNER // ${event.actionMode.replaceAll('_', ' ').toUpperCase()}`
        : `${type.replaceAll('_', ' ').toUpperCase()} RECORDED LOCALLY // CHECK NOTIFICATION ROUTE`,
    )
    return sent
  }

  function exportAutomationLog(format) {
    const text = format === 'csv' ? buildCsv(automationEvents) : JSON.stringify(automationEvents, null, 2)
    const blob = new Blob([text], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quantumaibusiness-events.${format}`
    link.click()
    URL.revokeObjectURL(url)
    setAutomationStatus(`LOCAL EVENT LOG EXPORTED AS ${format.toUpperCase()}`)
  }

  function clearAutomationLog() {
    try {
      window.localStorage.removeItem(EVENT_STORAGE_KEY)
    } catch {
      // Ignore storage cleanup failures; clearing state is still useful.
    }
    setAutomationEvents([])
    setAutomationStatus('LOCAL EVENT LOG CLEARED')
  }

  async function runScan() {
    const scanTargetValue = target || form.website || form.company || 'Business'
    const nextForm = { ...form, website: form.website || scanTargetValue, company: form.company || scanTargetValue }
    const generatedScan = scanTarget(scanTargetValue, result)
    setScanBurst((current) => current + 1)
    setForm(nextForm)
    setScan(generatedScan)
    setOpen(true)
    setResp(
      `SCANNING ${scanTargetValue.toUpperCase()} :: ${generatedScan.score}/100 GROWTH PRESSURE :: ` +
        `FAULTS FOUND: ${generatedScan.bottlenecks.join(' / ')} :: PACKAGE ROUTING READY`,
    )
    setLeadStatus('SCAN GENERATED - OWNER NOTIFICATION READY')
    window.gtag?.('event', 'scan_generated', { event_category: 'diagnostic', value: generatedScan.score })
    window.fbq?.('trackCustom', 'BusinessScanGenerated')
    try {
      const aiDiagnostic = await requestBusinessDiagnostic({ target: scanTargetValue, form: nextForm })
      if (aiDiagnostic?.ok) {
        const enrichedScan = {
          ...generatedScan,
          aiGenerated: aiDiagnostic.generated,
          diagnostic: aiDiagnostic.diagnostic,
          opportunities: aiDiagnostic.opportunities || [],
          risks: aiDiagnostic.risks || [],
          recommendedPackage: aiDiagnostic.recommended_package,
          nextStep: aiDiagnostic.next_step,
          bottlenecks: aiDiagnostic.opportunities?.length ? aiDiagnostic.opportunities.slice(0, 3) : generatedScan.bottlenecks,
          losses: aiDiagnostic.risks?.length ? aiDiagnostic.risks : generatedScan.losses,
        }
        setScan(enrichedScan)
        setResp(
          `AI DIAGNOSTIC READY :: ${scanTargetValue.toUpperCase()} :: ` +
            `${aiDiagnostic.next_step || 'PACKAGE ROUTING READY'}`,
        )
        setLeadStatus('AI DIAGNOSTIC GENERATED - SENT TO AUTOMATION HUB')
        return
      }
    } catch {
      // The local scan remains available if the AI diagnostic endpoint is unavailable.
    }

    const sent = await recordAutomationEvent('scan_generated', { form: nextForm, result, scan: generatedScan })
    if (sent) setLeadStatus('LOCAL SCAN GENERATED - SENT TO AUTOMATION HUB')
  }

  async function submitLead(event) {
    event.preventDefault()
    const generatedScan = scan || scanTarget(form.website || form.company || 'Business', result)
    setScan(generatedScan)
    setLeadStatus('ASSESSMENT PACKET GENERATED')
    setOpen(true)
    setResp(`READINESS ${generatedScan.readiness}% :: UNLOCKED GAPS: ${result.gaps.join(' / ')} :: SELECT PACKAGE 1-4 BELOW`)
    window.gtag?.('event', 'generate_lead', { event_category: 'assessment', value: generatedScan.readiness })
    window.fbq?.('track', 'Lead')
    const sent = await recordAutomationEvent('assessment_submitted', { form, result, scan: generatedScan })
    if (sent) setLeadStatus('ASSESSMENT SENT TO AUTOMATION HUB')
  }

  async function trackPackage(offer) {
    window.gtag?.('event', 'select_package', { event_category: 'commerce', item_name: offer.title, value: offer.amount || 0 })
    window.fbq?.('trackCustom', 'PackageSelected', { package: offer.title })
    await recordAutomationEvent('package_selected', { form, result, scan, package: offer })
  }

  async function handleOfferAction(offer) {
    setPackageStatus(`ROUTING ${offer.title.toUpperCase()} SELECTION...`)
    await trackPackage(offer)

    if (offer.key === 'premiumReferral') {
      setReferralOpen(true)
      setPackageStatus('PREMIUM REFERRAL OPTIONS OPEN - OWNER NOTIFIED')
      return
    }

    if (!PAYMENT_LINKS[offer.key]) {
      setPackageStatus(`${offer.title.toUpperCase()} IS READY IN CODE - CREATE + ADD THE STRIPE PAYMENT LINK TO ACTIVATE CHECKOUT`)
      return
    }

    setPackageStatus(`${offer.title.toUpperCase()} SELECTED - OWNER NOTIFIED - OPENING CHECKOUT`)
    window.location.assign(PAYMENT_LINKS[offer.key])
  }

  async function submitPremiumReferral(event) {
    event.preventDefault()
    setPackageStatus('SENDING PREMIUM REFERRAL REQUEST...')
    const premiumOffer = offers.find((offer) => offer.key === 'premiumReferral')
    const sent = await recordAutomationEvent('premium_referral_requested', { form, result, scan, package: premiumOffer })
    setPackageStatus(sent ? 'PREMIUM REFERRAL SENT TO OWNER EMAIL' : 'REFERRAL READY - USE EMAIL OR SITE LINK BELOW')
  }

  async function submitPaidFulfillment(event) {
    event.preventDefault()
    setFulfillmentStatus('SENDING PAID FULFILLMENT INTAKE...')
    setFulfillmentDeliverable('')

    const selectedPackage = offers.find((offer) => offer.key === fulfillmentForm.packageKey)
    const packet = {
      package_key: fulfillmentForm.packageKey,
      package_name: selectedPackage?.title || fulfillmentForm.packageKey,
      company: fulfillmentForm.company || form.company,
      website: fulfillmentForm.website || form.website,
      customer_email: fulfillmentForm.customerEmail || form.email,
      payment_email: fulfillmentForm.paymentEmail,
      objective: fulfillmentForm.objective || form.objective,
      current_tools: fulfillmentForm.currentTools,
      constraints: fulfillmentForm.constraints,
      source: 'site_paid_fulfillment_form',
      attribution,
      amount: selectedPackage?.amount || '',
      review_only: !['outlinedStrategy', 'growthScanPack'].includes(fulfillmentForm.packageKey),
    }

    try {
      const response = await submitFulfillmentPacket(packet)
      const useSingleStaticEmail = response.mode === 'static_email_fallback'
      await recordAutomationEvent('paid_fulfillment_intake', {
        form: {
          company: packet.company,
          website: packet.website,
          email: packet.customer_email || packet.payment_email,
          objective: packet.objective,
        },
        package: selectedPackage,
      }, { notify: !useSingleStaticEmail })
      setFulfillmentDeliverable(response.deliverable || '')
      setFulfillmentStatus(
        response.client_email?.sent
          ? 'AI FULFILLMENT GENERATED + SENT TO CLIENT - OWNER BCC LOGGED'
          : response.generated
          ? 'AI FULFILLMENT GENERATED - OWNER NOTIFIED'
          : 'INTAKE SENT - PAYMENT REVIEW + DELIVERY QUEUED',
      )
    } catch {
      setFulfillmentStatus(`INTAKE NOT SENT AUTOMATICALLY - EMAIL ${CONTACT_EMAIL}`)
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(`${MONEY_PAGE_URL}?utm_source=manual&utm_medium=share&utm_campaign=share_button`)
      setShareStatus('LINK COPIED')
      recordAutomationEvent('share_link_copied', { destination: 'copy_link', url: MONEY_PAGE_URL })
      return true
    } catch {
      setShareStatus('COPY MANUALLY: QUANTUMAIBUSINESS.COM')
      return false
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyShareLink()
      return
    }

    try {
      await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: MONEY_PAGE_URL })
      setShareStatus('SHARE PANEL OPENED')
      await recordAutomationEvent('system_share_started', { destination: 'system_share', url: MONEY_PAGE_URL })
    } catch {
      setShareStatus('SHARE CANCELLED')
    }
  }

  async function openShareDestination(destination) {
    if (destination.copyFirst) {
      await copyShareLink()
    }

    window.open(destination.href, '_blank', 'noopener,noreferrer')
    if (!destination.copyFirst) setShareStatus(`OPENED ${destination.label.toUpperCase()}`)
    await recordAutomationEvent('share_destination_opened', { destination: destination.label, url: destination.shareUrl || MONEY_PAGE_URL })
  }

  async function copyCampaignLink(link) {
    try {
      await navigator.clipboard.writeText(link.href)
      setCampaignStatus(`${link.label.toUpperCase()} LINK COPIED`)
      await recordAutomationEvent('campaign_link_copied', { destination: link.label, url: link.href })
    } catch {
      setCampaignStatus(`COPY MANUALLY: ${link.href}`)
    }
  }

  const offers = [
    {
      key: 'outlinedStrategy',
      number: '01',
      title: 'Paid Growth Diagnostic',
      price: '$9.99 one-time',
      amount: 9.99,
      eyebrow: 'AUTO-DELIVERABLE ENTRY',
      copy: 'A compact AI-assisted first pass that turns a business/site into useful growth pressure, likely leaks, priority fixes, and a next-step map.',
      bullets: ['Fast paid readout', 'Auto-send eligible', 'Upgrade path included'],
      cta: 'Unlock Diagnostic',
    },
    {
      key: 'growthScanPack',
      number: '02',
      title: 'Growth Scan Pack',
      price: '$49.99 one-time',
      amount: 49.99,
      eyebrow: 'AUTO-DELIVERABLE PACK',
      copy: 'Five AI-assisted growth scans for businesses, pages, offers, or competitors with reusable notes, risks, and next-action maps.',
      bullets: ['5 scan credits', 'Basic AI utility', 'Auto-send eligible'],
      cta: 'Unlock Scan Pack',
    },
    {
      key: 'automatedUtility',
      number: '03',
      title: 'Automated Utility',
      price: 'Starts at $229.99',
      amount: 229.99,
      eyebrow: 'CORE AUTOMATION PATH',
      copy: 'For businesses ready to turn the readout into utility: intake routing, owner alerts, follow-up logic, lead status, and simple reporting.',
      bullets: ['Owner-reviewed scope', 'Workflow map', 'Implementation checklist'],
      cta: 'Start Automation',
    },
    {
      key: 'fullStrategic',
      number: '04',
      title: 'Full Strategic Growth',
      price: 'Starts at $2,500',
      amount: 2500,
      eyebrow: 'HIGH-TICKET REVIEW',
      copy: 'A premium strategic build lane for offer architecture, funnel logic, analytics, delivery workflows, and growth execution planning.',
      bullets: ['Manual owner review', 'Deeper scope', 'Serious buyer lane'],
      cta: 'Begin Growth Build',
    },
    {
      key: 'premiumReferral',
      number: '05',
      title: 'Premium QuantumBusinessStrategies Referral',
      price: 'Price upon referral',
      amount: 0,
      eyebrow: 'PREMIER ESCALATION',
      copy: 'For prospects that look bigger than a standard package and need direct routing into QuantumBusinessStrategies for strategic review.',
      bullets: ['Referral form', 'Direct email option', 'Strategy-site path'],
      cta: 'Request Premium Referral',
    },
  ]
  const shareDestinations = [
    {
      label: 'Facebook',
      shareUrl: `${MONEY_PAGE_URL}?utm_source=facebook&utm_medium=social_share&utm_campaign=share_dock`,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${MONEY_PAGE_URL}?utm_source=facebook&utm_medium=social_share&utm_campaign=share_dock`)}`,
    },
    {
      label: 'X',
      shareUrl: `${MONEY_PAGE_URL}?utm_source=x&utm_medium=social_share&utm_campaign=share_dock`,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(`${MONEY_PAGE_URL}?utm_source=x&utm_medium=social_share&utm_campaign=share_dock`)}&text=${encodeURIComponent(`${SHARE_TITLE}: ${SHARE_TEXT}`)}`,
    },
    {
      label: 'LinkedIn',
      shareUrl: `${MONEY_PAGE_URL}?utm_source=linkedin&utm_medium=social_share&utm_campaign=share_dock`,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${MONEY_PAGE_URL}?utm_source=linkedin&utm_medium=social_share&utm_campaign=share_dock`)}`,
    },
    {
      label: 'Reddit',
      shareUrl: `${MONEY_PAGE_URL}?utm_source=reddit&utm_medium=social_share&utm_campaign=share_dock`,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(`${MONEY_PAGE_URL}?utm_source=reddit&utm_medium=social_share&utm_campaign=share_dock`)}&title=${encodeURIComponent(SHARE_TITLE)}`,
    },
    {
      label: 'Threads',
      shareUrl: `${MONEY_PAGE_URL}?utm_source=threads&utm_medium=social_share&utm_campaign=share_dock`,
      href: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${SHARE_TITLE} ${MONEY_PAGE_URL}?utm_source=threads&utm_medium=social_share&utm_campaign=share_dock`)}`,
    },
    {
      label: 'Bluesky',
      shareUrl: `${MONEY_PAGE_URL}?utm_source=bluesky&utm_medium=social_share&utm_campaign=share_dock`,
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${SHARE_TITLE}: ${SHARE_TEXT} ${MONEY_PAGE_URL}?utm_source=bluesky&utm_medium=social_share&utm_campaign=share_dock`)}`,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      copyFirst: true,
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/upload',
      copyFirst: true,
    },
  ]

  return (
    <div className="quantum-shell">
      <div className="cosmic-glow" />
      <div className="stellar-dust" aria-hidden="true" />
      <WireframeField />
      {scanBurst > 0 && <span key={scanBurst} className="scan-burst" />}
      {beams.map((beam) => (
        <div
          className="beam"
          key={`beam-${beam.id}`}
          style={{ left: `${beam.x}%`, top: `${beam.y}%`, width: beam.w, transform: `rotate(${beam.r}deg)`, opacity: beam.o }}
        />
      ))}
      {stars.map((star) => (
        <span className="star" key={star.id} style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.s, height: star.s }} />
      ))}
      {particles.map((particle) => (
        <span
          className="glow-particle"
          key={`particle-${particle.id}`}
          style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.s, height: particle.s, animationDuration: `${particle.d}s` }}
        />
      ))}
      {binaryBursts.map((burst) => (
        <span
          className="binary-pop"
          key={`binary-pop-${burst.id}`}
          style={{
            left: `${burst.left}%`,
            top: `${burst.top}%`,
            animationDelay: `${burst.delay}s`,
            animationDuration: `${burst.duration}s`,
          }}
        >
          {burst.text}
        </span>
      ))}
      {coins.map((coin) => (
        <span
          className="coin"
          key={`coin-${coin.id}`}
          style={{ left: `${coin.x}%`, top: `${coin.y}%`, width: coin.s, height: coin.s, animationDuration: `${coin.d}s` }}
        >
          $
        </span>
      ))}
      {matrixStreams.map((stream) => (
        <span
          className="matrix-rain"
          key={`rain-${stream.id}`}
          style={{
            left: `${stream.left}%`,
            animationDuration: `${stream.duration}s`,
            animationDelay: `${stream.delay}s`,
            opacity: stream.opacity,
          }}
        >
          {stream.glyphs}
        </span>
      ))}

      <details className="cyber-menu">
        <summary>MENU</summary>
        <div className="cyber-menu-panel">
          <section>
            <h2>Products</h2>
            {offers.map((offer) => (
              <a key={offer.key} href="#packages">P{offer.number}: {offer.title}</a>
            ))}
          </section>
          <section>
            <h2>Contact</h2>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </section>
          <section>
            <h2>Links</h2>
            <a href={PARTNER_LINKS.riskforge}>riskforgeai.xyz</a>
            <a href={PARTNER_LINKS.strategies}>quantumbusinessstrategies.com</a>
            <a href={PARTNER_LINKS.pepes}>quantumpepes.xyz</a>
          </section>
          <section>
            <h2>Transparency</h2>
            <a href="#transparency">Read site transparency</a>
          </section>
          <section>
            <h2>Owner</h2>
            <a href="#automation-control">Automation control</a>
            <a href="#fulfillment">Fulfillment intake</a>
            <a href="#growth-launch">Growth launch kit</a>
          </section>
        </div>
      </details>

      <div className="share-dock">
        <button type="button" className="share-toggle" onClick={() => setShareOpen((current) => !current)}>
          SHARE
        </button>
        {shareOpen && (
          <div className="share-panel" aria-label="Share QuantumAiBusiness">
            <button type="button" onClick={nativeShare}>SYSTEM SHARE</button>
            {shareDestinations.map((destination) => (
              <button type="button" key={destination.label} onClick={() => openShareDestination(destination)}>
                {destination.label}
              </button>
            ))}
            <button type="button" onClick={copyShareLink}>COPY LINK</button>
            {shareStatus && <p>{shareStatus}</p>}
          </div>
        )}
      </div>

      <main className="content" id="home">
        <section className="hero-panel" aria-labelledby="hero-title">
          <div className="brand-chip">QUANTUMAIBUSINESS.COM</div>
          <h1 id="hero-title">QuantumAiBusiness</h1>
          <p className="tagline">QUANTUM PARABOLIC GROWTH // QUANTITATIVE LOGIC // AUTOMATED BUSINESS PRESSURE SCANS</p>
          <p className="promise">
            Enter a business name or website. The system generates a first-pass growth diagnostic, flags likely profit leaks,
            routes the client into the right package, and notifies the owner automation channel when connected.
          </p>

          <div className="command-center">
            <input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="> WEBSITE OR BUSINESS NAME_"
              aria-label="Website or business name"
            />
            <button className="quantify-button" onClick={runScan} type="button"><span>QUANTIFY BUSINESS</span></button>
            {open && (
              <div className="response-console">
                <p>{resp}</p>
                {scan?.diagnostic && <p>{scan.diagnostic}</p>}
                {scan && (
                  <ul>
                    {scan.losses.map((loss) => (
                      <li key={loss}>{loss}</li>
                    ))}
                    {(scan.opportunities || []).map((opportunity) => (
                      <li key={opportunity}>{opportunity}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="system-grid" aria-label="Automation system">
          <div>
            <h2>Fault Detection</h2>
            <p>Website or business-name intake becomes a structured scan for weak offers, missing follow-up, lost leads, and unused growth channels.</p>
          </div>
          <div>
            <h2>Autopilot Routing</h2>
            <p>Every scan, assessment, package selection, referral, and share action attempts an owner alert while routine prospects keep moving.</p>
          </div>
          <div>
            <h2>Client Delivery</h2>
            <p>The package ladder pushes buyers from low-friction strategy to automation utility, full strategic growth, or premium referral.</p>
          </div>
        </section>

        <section className="assessment" aria-labelledby="assessment-title">
          <div className="assessment-copy">
            <div className="brand-chip">CLIENT UTILITY LAYER</div>
            <h2 id="assessment-title">Business Growth Intake</h2>
            <p>
              The scan gives prospective clients a useful first readout, then adds context so the paid deliverable can be generated,
              reviewed, and routed into the right service path.
            </p>
            <div className="score-box">
              <strong>{scan?.readiness || result.readiness}%</strong>
              <span>growth-system readiness</span>
              <small>Priority gaps: {result.gaps.join(', ')}</small>
            </div>
          </div>

          <form className="intake-form" onSubmit={submitLead}>
            <label>
              Company
              <input name="company" value={form.company} onChange={updateField} placeholder="Business name" />
            </label>
            <label>
              Website or profile
              <input name="website" value={form.website} onChange={updateField} placeholder="https://example.com or business name" />
            </label>
            <label>
              Email
              <input name="email" value={form.email} onChange={updateField} placeholder="owner@example.com" type="email" />
            </label>
            <label className="wide">
              Desired growth outcome
              <textarea name="objective" value={form.objective} onChange={updateField} placeholder="More leads, better ads, cleaner operations, automation, reporting..." />
            </label>
            {[
              ['revenue', 'Revenue clarity'],
              ['leads', 'Lead capture'],
              ['operations', 'Operations'],
              ['accounting', 'Accounting'],
              ['advertising', 'Advertising'],
              ['automation', 'Automation'],
            ].map(([name, label]) => (
              <label key={name}>
                {label}
                <select name={name} value={form[name]} onChange={updateField}>
                  <option value="1">Critical gap</option>
                  <option value="2">Weak</option>
                  <option value="3">Functional</option>
                  <option value="4">Strong</option>
                  <option value="5">Elite</option>
                </select>
              </label>
            ))}
            <button className="wide" type="submit">LOCK READOUT + NOTIFY OWNER</button>
            {leadStatus && <p className="lead-status">{leadStatus}</p>}
          </form>
        </section>

        <section className="value-ladder" aria-label="Package value ladder">
          <div>
            <div className="brand-chip">REVENUE LADDER</div>
            <h2>Start Low-Friction. Route Serious Buyers Up.</h2>
            <p>
              The first purchase proves intent, the automation tier turns strategy into utility, and higher-ticket paths stay owner-reviewed.
              No revenue promises; just structured opportunity, delivery, and escalation.
            </p>
          </div>
          <div className="ladder-steps">
            {PACKAGE_LADDER.map(([label, price, copy]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{price}</strong>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="offers" id="packages" aria-label="Paid growth paths">
          {offers.map((offer) => {
            const emailHref = mailtoHref({ form, result, scan, packageName: offer.title })
            return (
              <article key={offer.key}>
                <span>PACKAGE {offer.number} // {offer.price}</span>
                <small>{offer.eyebrow}</small>
                <h2>{offer.title}</h2>
                <p>{offer.copy}</p>
                <ul>
                  {offer.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => handleOfferAction(offer)}>{offer.cta}</button>
                {(offer.key === 'automatedUtility' || offer.key === 'fullStrategic') && (
                  <a className="quiet-link" href={emailHref} onClick={() => trackPackage(offer)}>Email Before Checkout</a>
                )}
                {offer.key === 'premiumReferral' && (
                  <div className="premium-links">
                    <a className="quiet-link" href={emailHref} onClick={() => trackPackage(offer)}>Direct Email</a>
                    <a className="quiet-link" href={PAYMENT_LINKS.premiumReferral} onClick={() => trackPackage(offer)}>Visit Strategy Site</a>
                  </div>
                )}
              </article>
            )
          })}
        </section>
        {packageStatus && <p className="package-status">{packageStatus}</p>}

        <section className="fulfillment-console" id="fulfillment" aria-labelledby="fulfillment-title">
          <div className="fulfillment-copy">
            <div className="brand-chip">PAID DELIVERY INTAKE</div>
            <h2 id="fulfillment-title">Fulfillment Command Packet</h2>
            <p>
              After checkout, clients can submit the details needed for delivery. Right now this sends the packet to the owner route;
              once the backend host has secrets, it can generate the first AI deliverable automatically and email the client.
            </p>
            <div className="fulfillment-next">
              <strong>After payment:</strong>
              <span>Use the same email from Stripe if possible. The owner receives one fulfillment packet with the payment-review checklist.</span>
            </div>
          </div>
          <form className="intake-form fulfillment-form" onSubmit={submitPaidFulfillment}>
            <label>
              Package purchased
              <select name="packageKey" value={fulfillmentForm.packageKey} onChange={updateFulfillmentField}>
                {FULFILLMENT_PACKAGES.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>
            <label>
              Business
              <input name="company" value={fulfillmentForm.company} onChange={updateFulfillmentField} placeholder="Business name" />
            </label>
            <label>
              Website
              <input name="website" value={fulfillmentForm.website} onChange={updateFulfillmentField} placeholder="https://example.com" />
            </label>
            <label>
              Delivery email
              <input name="customerEmail" value={fulfillmentForm.customerEmail} onChange={updateFulfillmentField} placeholder="client@example.com" type="email" />
            </label>
            <label>
              Stripe payment email
              <input name="paymentEmail" value={fulfillmentForm.paymentEmail} onChange={updateFulfillmentField} placeholder="if different from delivery email" type="email" />
            </label>
            <label>
              Current tools
              <input name="currentTools" value={fulfillmentForm.currentTools} onChange={updateFulfillmentField} placeholder="Website, CRM, ads, email, booking, spreadsheets..." />
            </label>
            <label className="wide">
              What should the paid deliverable solve?
              <textarea name="objective" value={fulfillmentForm.objective} onChange={updateFulfillmentField} placeholder="Lead flow, follow-up, offer clarity, automation, reporting, operations..." />
            </label>
            <label className="wide">
              Constraints or owner notes
              <textarea name="constraints" value={fulfillmentForm.constraints} onChange={updateFulfillmentField} placeholder="Budget, timeline, platforms, industry limits, decision maker, urgent blockers..." />
            </label>
            <button className="wide" type="submit">SEND FULFILLMENT PACKET</button>
            {fulfillmentStatus && <p className="lead-status">{fulfillmentStatus}</p>}
          </form>
          {fulfillmentDeliverable && (
            <pre className="fulfillment-output">{fulfillmentDeliverable}</pre>
          )}
        </section>

        <section className="growth-launch" id="growth-launch" aria-labelledby="growth-launch-title">
          <div>
            <div className="brand-chip">MONETIZATION LAUNCH</div>
            <h2 id="growth-launch-title">Organic + Ad Launch Kit</h2>
            <p>
              Use these links and copy blocks for manual posting, direct outreach, social bios, and future paid campaigns. This keeps the
              message consistent with the landing page and avoids overpromising results.
            </p>
          </div>
          <div className="campaign-links">
            {CAMPAIGN_LINKS.map((link) => (
              <article key={link.label}>
                <strong>{link.label}</strong>
                <code>{link.href}</code>
                <button type="button" onClick={() => copyCampaignLink(link)}>COPY LINK</button>
              </article>
            ))}
          </div>
          {campaignStatus && <p className="campaign-status">{campaignStatus}</p>}
          <div className="launch-copy-grid">
            <section>
              <h3>Ad Angles</h3>
              {AD_ANGLES.map((copy) => (
                <p key={copy}>{copy}</p>
              ))}
            </section>
            <section>
              <h3>Organic Posts</h3>
              {ORGANIC_POSTS.map((copy) => (
                <p key={copy}>{copy}</p>
              ))}
            </section>
            <section>
              <h3>Social Setup</h3>
              {SOCIAL_SETUP.map((copy) => (
                <p key={copy}>{copy}</p>
              ))}
            </section>
          </div>
        </section>

        {referralOpen && (
          <section className="referral-panel" aria-labelledby="premium-referral-title">
            <div>
              <div className="brand-chip">PREMIUM ROUTING</div>
              <h2 id="premium-referral-title">QuantumBusinessStrategies Referral</h2>
              <p>
                Fill the intake fields above, then send the referral request here. The owner email is notified with the business context,
                selected package, scan notes, and contact information.
              </p>
            </div>
            <form onSubmit={submitPremiumReferral}>
              <button type="submit">SEND PREMIUM REFERRAL REQUEST</button>
              <a href={mailtoHref({ form, result, scan, packageName: 'Premium QuantumBusinessStrategies Referral' })}>
                EMAIL {CONTACT_EMAIL}
              </a>
              <a href={PAYMENT_LINKS.premiumReferral}>OPEN QUANTUMBUSINESSSTRATEGIES.COM</a>
            </form>
          </section>
        )}

        <section className="launch-board" aria-labelledby="launch-title">
          <h2 id="launch-title">What Happens After Selection</h2>
          <ul>
            <li>Routine scans and assessments are captured, logged, and sent through the owner notification route when available.</li>
            <li>Packages 1-3 auto-route prospects toward checkout or direct contact with the submitted business context attached.</li>
            <li>Paid buyers can submit fulfillment details through the command packet so delivery is ready for owner review or backend AI generation.</li>
            <li>Full strategic growth and premium referral activity is marked for owner review so higher-value prospects get human attention.</li>
            <li>The control log can be exported so lead, package, and outreach activity can move into accounting, CRM, or automation tools.</li>
          </ul>
        </section>

        <section className="automation-control" id="automation-control" aria-labelledby="automation-control-title">
          <div>
            <div className="brand-chip">AUTOMATION OPS</div>
            <h2 id="automation-control-title">Automation Control</h2>
            <p>
              Recent scans, package selections, referral requests, and share actions are captured for review. The site auto-routes
              routine prospects while higher-ticket and premium signals are separated for owner response.
            </p>
          </div>
          <div className="automation-flow" aria-label="Autopilot flow">
            {AUTOMATION_FLOW.map((step) => (
              <article key={step.label}>
                <strong>{step.label}</strong>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
          <div className="automation-metrics">
            <div>
              <strong>{automationEvents.length}</strong>
              <span>local events</span>
            </div>
            <div>
              <strong>{LEAD_WEBHOOK ? 'WEBHOOK' : 'EMAIL'}</strong>
              <span>notification route</span>
            </div>
            <div>
              <strong>AUTO</strong>
              <span>routine routing</span>
            </div>
            <div>
              <strong>REVIEW</strong>
              <span>premium prospects</span>
            </div>
          </div>
          <div className="automation-actions">
            <button type="button" onClick={() => exportAutomationLog('json')}>EXPORT JSON</button>
            <button type="button" onClick={() => exportAutomationLog('csv')}>EXPORT CSV</button>
            <button type="button" onClick={clearAutomationLog}>CLEAR LOCAL LOG</button>
          </div>
          <p className="automation-status">{automationStatus}</p>
          <div className="event-log">
            {automationEvents.length ? (
              automationEvents.slice(0, 6).map((event) => (
                <article key={event.id}>
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                  <strong>{event.type.replaceAll('_', ' ')}</strong>
                  <p>
                    {event.target}
                    {event.package ? ` // ${event.package}` : ''}
                    {event.actionMode ? ` // ${event.actionMode.replaceAll('_', ' ')}` : ''}
                    {event.score !== '' ? ` // pressure ${event.score}` : ''}
                  </p>
                </article>
              ))
            ) : (
              <p>No local events yet. Run a scan or select a package to populate the control log.</p>
            )}
          </div>
        </section>

        <footer className="transparency" id="transparency">
          <h2>Transparency</h2>
          <div className="transparency-core">
          <p>
            Transparency: Quantum AI Business provides automated diagnostics, strategic information, and workflow routing. Results are not guaranteed,
            do not replace legal, financial, tax, or professional advice, and depend on client execution, market conditions, platform policies, and data quality.
            By using this site, visitors agree that all services and information are used at their own discretion and that liability is limited to the fullest
            extent permitted by applicable law.
          </p>
          <p>Copyright notice: (c) 2025-2026 Quantumbusinessstrategies, Quantumaibusiness, and QuantumbusinessAI brand materials. Trademark registration recommended.</p>
          <nav className="footer-links" aria-label="Contact and project links">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={PARTNER_LINKS.riskforge}>riskforgeai.xyz</a>
            <a href={PARTNER_LINKS.strategies}>quantumbusinessstrategies.com</a>
            <a href={PARTNER_LINKS.pepes}>quantumpepes.xyz</a>
          </nav>
          </div>
          {activeHash === '#transparency' && <a className="home-link" href="#home">RETURN TO HOME</a>}
        </footer>
      </main>
    </div>
  )
}
