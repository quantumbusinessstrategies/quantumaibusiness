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
const CRYPTO_PAYMENT_LINKS = {
  outlinedStrategy: import.meta.env.VITE_CRYPTO_OUTLINED_STRATEGY_URL || '',
  growthScanPack: import.meta.env.VITE_CRYPTO_GROWTH_SCAN_PACK_URL || '',
  automatedUtility: import.meta.env.VITE_CRYPTO_AUTOMATED_UTILITY_URL || '',
  fullStrategic: import.meta.env.VITE_CRYPTO_FULL_STRATEGIC_URL || '',
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
const GOOGLE_TAG_ID = import.meta.env.VITE_GOOGLE_TAG_ID || 'G-RCLMY2RC5S'
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '2036989413889891'
const SITE_URL = 'https://quantumaibusiness.com'
const MONEY_PAGE_URL = `${SITE_URL}/business-growth-scan.html`
const SHARE_TITLE = 'QuantumAiBusiness'
const SHARE_TEXT = 'Run a cyber growth-pressure scan for business faults, profit leaks, and automation opportunities.'
const EVENT_STORAGE_KEY = 'quantumaibusiness_event_log'
const ATTRIBUTION_STORAGE_KEY = 'quantumaibusiness_attribution'
const META_PURCHASE_STORAGE_KEY = 'quantumaibusiness_meta_purchase_events'
const META_MATCH_STORAGE_KEY = 'quantumaibusiness_meta_match_email'
const MAX_EVENT_LOG = 40
const FULFILLMENT_PACKAGES = [
  ['outlinedStrategy', 'Outlined Strategy'],
  ['growthScanPack', 'Growth Scan Pack'],
  ['automatedUtility', 'Automated Utility'],
  ['fullStrategic', 'Full Strategic Growth'],
  ['premiumReferral', 'Premium Referral'],
]
const PACKAGE_LADDER = [
  ['Entry', '$9.99', 'A fast paid diagnostic for owners who want a practical first read.'],
  ['Pack', '$49.99', 'Five scan readouts for offers, pages, competitors, or growth paths.'],
  ['Core', '$229.99+', 'Workflow utility planning for intake, alerts, follow-up, and reporting.'],
  ['Anchor', '$2,500+', 'Deeper strategic growth work for bigger business systems.'],
  ['Premier', 'Referral', 'High-touch QuantumBusinessStrategies routing for larger scopes.'],
]
const PACKAGE_VALUES = {
  outlinedStrategy: 9.99,
  growthScanPack: 49.99,
  automatedUtility: 229.99,
  fullStrategic: 2500,
}

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

async function createCheckoutSession(packet) {
  const checkoutEndpoint = `${AUTOMATION_API_URL.replace(/\/$/, '')}/api/checkout-session`
  const response = await fetch(checkoutEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(packet),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `Checkout failed with HTTP ${response.status}`)
  return data
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

function loadStoredMetaPurchases() {
  try {
    return JSON.parse(window.localStorage.getItem(META_PURCHASE_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function rememberMetaPurchase(eventId) {
  try {
    const current = loadStoredMetaPurchases()
    window.localStorage.setItem(META_PURCHASE_STORAGE_KEY, JSON.stringify([eventId, ...current].slice(0, 30)))
  } catch {
    // Purchase dedupe is helpful but not required.
  }
}

function metaEventName(name) {
  if (name === 'assessment_submitted') return 'Lead'
  if (name === 'package_checkout_started') return 'InitiateCheckout'
  if (name === 'checkout_return_success') return 'Purchase'
  if (name === 'package_selected') return 'ViewContent'
  if (name === 'premium_referral_requested') return 'Contact'
  if (name === 'scan_generated') return 'Search'
  return ''
}

function cleanMetaEmail(email) {
  const value = String(email || '').trim().toLowerCase()
  return value.includes('@') ? value : ''
}

function updateMetaAdvancedMatching(email) {
  const cleanEmail = cleanMetaEmail(email)
  if (!cleanEmail || !META_PIXEL_ID || !window.fbq) return
  try {
    if (window.localStorage.getItem(META_MATCH_STORAGE_KEY) === cleanEmail) return
    window.localStorage.setItem(META_MATCH_STORAGE_KEY, cleanEmail)
  } catch {
    // Advanced matching can still run even if local storage is unavailable.
  }
  window.fbq('init', META_PIXEL_ID, { em: cleanEmail })
}

function pushAnalyticsEvent(name, params = {}) {
  const payload = {
    event_category: params.category || 'quantumaibusiness_funnel',
    event_label: params.label || params.package || params.destination || '',
    value: params.value || 0,
    currency: params.currency || 'USD',
    ...params,
  }
  window.dataLayer?.push({ event: name, ...payload })
  window.gtag?.('event', name, payload)
  if (window.fbq) {
    const standardEvent = metaEventName(name)
    if (standardEvent === 'Purchase') {
      const eventId = params.event_id || params.checkout_session || ''
      if (eventId && loadStoredMetaPurchases().includes(eventId)) return
      window.fbq('track', 'Purchase', payload, eventId ? { eventID: eventId } : undefined)
      if (eventId) rememberMetaPurchase(eventId)
    } else if (standardEvent) {
      window.fbq('track', standardEvent, payload)
    }
    window.fbq('trackCustom', name, payload)
  }
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
  const [cryptoOpen, setCryptoOpen] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const [, setAutomationEvents] = useState(loadStoredEvents)
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
  const checkoutReturn = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      status: params.get('checkout') || '',
      packageKey: params.get('package') || '',
      sessionId: params.get('session_id') || '',
    }
  }, [])

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
    if (checkoutReturn.status === 'success') {
      pushAnalyticsEvent('checkout_return_success', {
        category: 'commerce',
        package_key: checkoutReturn.packageKey,
        checkout_session: checkoutReturn.sessionId,
        event_id: checkoutReturn.sessionId,
        value: PACKAGE_VALUES[checkoutReturn.packageKey] || 0,
        currency: 'USD',
      })
      recordAutomationEvent('checkout_return_success', { checkout: checkoutReturn }, { notify: false })
    }
    if (checkoutReturn.status === 'cancel') {
      pushAnalyticsEvent('checkout_return_cancel', {
        category: 'commerce',
        package_key: checkoutReturn.packageKey,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutReturn.status])

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
    recordLocalAutomationEvent(type, payloadWithAttribution)

    if (options.notify === false) {
      return true
    }

    const sent = await notifyOwner(type, payloadWithAttribution)
    return sent
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
    pushAnalyticsEvent('scan_generated', {
      category: 'diagnostic',
      label: scanTargetValue,
      value: generatedScan.score,
      target: scanTargetValue,
      utm_source: attribution.utm_source || '',
      utm_campaign: attribution.utm_campaign || '',
    })
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
    updateMetaAdvancedMatching(form.email)
    pushAnalyticsEvent('assessment_submitted', {
      category: 'assessment',
      label: form.company || form.website || 'assessment',
      value: generatedScan.readiness,
      target: form.website || form.company,
      gaps: result.gaps.join(', '),
      utm_source: attribution.utm_source || '',
      utm_campaign: attribution.utm_campaign || '',
    })
    const sent = await recordAutomationEvent('assessment_submitted', { form, result, scan: generatedScan })
    if (sent) setLeadStatus('ASSESSMENT SENT TO AUTOMATION HUB')
  }

  async function trackPackage(offer) {
    updateMetaAdvancedMatching(form.email)
    pushAnalyticsEvent('package_selected', {
      category: 'commerce',
      package: offer.title,
      package_key: offer.key,
      value: offer.amount || 0,
      content_name: offer.title,
      content_category: 'growth_package',
      target: form.website || form.company,
      utm_source: attribution.utm_source || '',
      utm_campaign: attribution.utm_campaign || '',
    })
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

    const checkoutPacket = {
      package_key: offer.key,
      package_name: offer.title,
      company: form.company || scan?.target || '',
      website: form.website || scan?.target || '',
      customer_email: form.email,
      objective: form.objective || scan?.bottlenecks?.join('; ') || '',
      current_tools: `Readiness ${scan?.readiness || result.readiness}%; gaps: ${result.gaps.join(', ')}`,
      constraints: 'Submitted through one-step QuantumAiBusiness checkout.',
      source: 'site_package_one_step_checkout',
      attribution,
    }

    if ((!checkoutPacket.company && !checkoutPacket.website) || !checkoutPacket.customer_email) {
      setPackageStatus('ADD BUSINESS NAME/WEBSITE + EMAIL IN THE GROWTH INTAKE ABOVE, THEN CHECKOUT RUNS IN ONE STEP')
      return
    }

    pushAnalyticsEvent('package_checkout_started', {
      category: 'commerce',
      package: offer.title,
      package_key: offer.key,
      value: offer.amount || 0,
      currency: 'USD',
      content_name: offer.title,
      content_category: 'growth_package',
      checkout_type: 'stripe_one_step',
    })

    try {
      setPackageStatus(`${offer.title.toUpperCase()} SELECTED - CREATING ONE-STEP CHECKOUT`)
      const session = await createCheckoutSession(checkoutPacket)
      setPackageStatus(`${offer.title.toUpperCase()} CHECKOUT READY - OPENING STRIPE`)
      window.location.assign(session.url)
    } catch (error) {
      if (PAYMENT_LINKS[offer.key]) {
        setPackageStatus('ONE-STEP CHECKOUT UNAVAILABLE - OPENING BACKUP STRIPE LINK')
        window.location.assign(PAYMENT_LINKS[offer.key])
        return
      }
      setPackageStatus(`CHECKOUT ERROR: ${error.message}`)
    }
  }

  async function submitPremiumReferral(event) {
    event.preventDefault()
    setPackageStatus('SENDING PREMIUM REFERRAL REQUEST...')
    const premiumOffer = offers.find((offer) => offer.key === 'premiumReferral')
    pushAnalyticsEvent('premium_referral_requested', { category: 'referral', package: premiumOffer?.title || 'Premium Referral' })
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
      pushAnalyticsEvent('paid_fulfillment_intake_submitted', {
        category: 'fulfillment',
        package: selectedPackage?.title || fulfillmentForm.packageKey,
        package_key: fulfillmentForm.packageKey,
        value: selectedPackage?.amount || 0,
        currency: 'USD',
      })
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
      pushAnalyticsEvent('share_link_copied', { category: 'sharing', destination: 'copy_link' })
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
      pushAnalyticsEvent('system_share_started', { category: 'sharing', destination: 'system_share' })
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
    pushAnalyticsEvent('share_destination_opened', {
      category: 'sharing',
      destination: destination.label,
      url: destination.shareUrl || MONEY_PAGE_URL,
    })
    await recordAutomationEvent('share_destination_opened', { destination: destination.label, url: destination.shareUrl || MONEY_PAGE_URL })
  }

  async function handleCryptoCheckout(offer) {
    const url = CRYPTO_PAYMENT_LINKS[offer.key]
    pushAnalyticsEvent('crypto_checkout_selected', {
      category: 'commerce',
      package: offer.title,
      package_key: offer.key,
      value: offer.amount || 0,
      crypto_ready: Boolean(url),
    })
    await recordAutomationEvent('crypto_checkout_selected', { form, result, scan, package: offer, crypto_ready: Boolean(url) })
    if (url) {
      window.location.assign(url)
      return
    }
    window.location.href = mailtoHref({ form, result, scan, packageName: `Crypto checkout request: ${offer.title}` })
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

      <div className="crypto-dock">
        <button type="button" className="crypto-toggle" onClick={() => setCryptoOpen((current) => !current)}>
          CRYPTO
        </button>
        {cryptoOpen && (
          <div className="crypto-panel" aria-label="Crypto checkout">
            <strong>Crypto Checkout</strong>
            <p>Use hosted checkout for wallet payments. Supports the networks enabled by the processor.</p>
            {offers.filter((offer) => offer.key !== 'premiumReferral').map((offer) => (
              <button type="button" key={offer.key} onClick={() => handleCryptoCheckout(offer)}>
                {offer.title} {CRYPTO_PAYMENT_LINKS[offer.key] ? 'PAY' : 'REQUEST'}
              </button>
            ))}
            <small>BTC, ETH, SOL, BNB, and stablecoin availability depends on the checkout provider and network support.</small>
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
            <div className="brand-chip">SERVICE LADDER</div>
            <h2>Start With Clarity. Move Into Utility.</h2>
            <p>
              Choose the depth that fits the moment: a quick diagnostic, a multi-scan pack, automation utility planning,
              deeper growth work, or premium strategy routing. No guaranteed outcomes; just structured analysis, delivery, and next steps.
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

        {checkoutReturn.status && (
          <section className={`checkout-return is-${checkoutReturn.status}`} aria-label="Checkout status">
            <div>
              <div className="brand-chip">CHECKOUT STATUS</div>
              <h2>{checkoutReturn.status === 'success' ? 'Payment Return Received' : 'Checkout Canceled'}</h2>
              <p>
                {checkoutReturn.status === 'success'
                  ? 'If payment completed, the intake is attached to the Stripe session. The backend webhook handles low-tier fulfillment automatically and keeps owner records updated.'
                  : 'No payment was captured from this return. You can adjust the intake above and try again when ready.'}
              </p>
            </div>
            <div className="checkout-return-grid">
              <span><strong>Package</strong>{checkoutReturn.packageKey || 'Unspecified'}</span>
              <span><strong>Session</strong>{checkoutReturn.sessionId ? checkoutReturn.sessionId.slice(0, 28) : 'No paid session'}</span>
              <span><strong>Next</strong>{checkoutReturn.status === 'success' ? 'Watch email/Sheet for PAYMENT + CLIENT logs' : 'Return to package selection'}</span>
            </div>
          </section>
        )}

        <section className="fulfillment-console" id="fulfillment" aria-labelledby="fulfillment-title">
          <div className="fulfillment-copy">
            <div className="brand-chip">PAID DELIVERY INTAKE</div>
            <h2 id="fulfillment-title">Fulfillment Command Packet</h2>
            <p>
              New package checkouts now carry the intake into Stripe, then the backend can generate the package-scoped
              deliverable after payment. Use this form only for older payment links, crypto payments, or manual recovery.
            </p>
            <div className="fulfillment-next">
              <strong>After payment:</strong>
              <span>Low-tier card checkouts can auto-deliver. Higher-scope packages stay owner-reviewed before major commitments.</span>
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
            <li>Your scan or assessment creates a structured first-pass readout from the information submitted.</li>
            <li>Package selections route you to checkout, intake, referral, or direct contact depending on the offer selected.</li>
            <li>Paid buyers can submit fulfillment details so the requested deliverable has the right business context.</li>
            <li>Higher-scope growth and premium referral requests receive additional review before deeper commitments are made.</li>
            <li>Diagnostics are informational and are designed to support better decisions, not promise revenue or replace professional advice.</li>
          </ul>
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
