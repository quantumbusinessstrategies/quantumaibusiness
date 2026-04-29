import { useEffect, useMemo, useState } from 'react'
import WireframeField from './WireframeField.jsx'

const PAYMENT_LINKS = {
  outlinedStrategy:
    import.meta.env.VITE_OUTLINED_STRATEGY_PAYMENT_URL ||
    import.meta.env.VITE_AUDIT_PAYMENT_URL ||
    'https://buy.stripe.com/fZu28qet66Ff2pE78Cfw401',
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
const OWNER_NOTIFICATION_URL =
  import.meta.env.VITE_OWNER_NOTIFICATION_URL || `https://formsubmit.co/ajax/${CONTACT_EMAIL}`
const GOOGLE_TAG_ID = import.meta.env.VITE_GOOGLE_TAG_ID || ''
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || ''
const SITE_URL = 'https://quantumaibusiness.com'
const SHARE_TITLE = 'QuantumAiBusiness'
const SHARE_TEXT = 'Run a cyber growth-pressure scan for business faults, profit leaks, and automation opportunities.'

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
  const endpoint = LEAD_WEBHOOK || OWNER_NOTIFICATION_URL
  if (!endpoint) return false

  const subject = `Quantum AI Business ${type.replaceAll('_', ' ')}`
  const message = JSON.stringify(
    {
      event: type,
      timestamp: new Date().toISOString(),
      ...payload,
    },
    null,
    2,
  )

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        event_type: type,
        notify: CONTACT_EMAIL,
        source: 'quantumaibusiness.com',
        message,
      }),
    })
    return true
  } catch {
    return false
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

  const result = useMemo(() => scoreFromAnswers(form), [form])

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
    const sent = await notifyOwner('scan_generated', { form: nextForm, result, scan: generatedScan })
    if (sent) setLeadStatus('SCAN GENERATED - SENT TO AUTOMATION HUB')
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
    const sent = await notifyOwner('assessment_submitted', { form, result, scan: generatedScan })
    if (sent) setLeadStatus('ASSESSMENT SENT TO AUTOMATION HUB')
  }

  async function trackPackage(offer) {
    window.gtag?.('event', 'select_package', { event_category: 'commerce', item_name: offer.title, value: offer.amount || 0 })
    window.fbq?.('trackCustom', 'PackageSelected', { package: offer.title })
    await notifyOwner('package_selected', { form, result, scan, package: offer })
  }

  async function handleOfferAction(offer) {
    setPackageStatus(`ROUTING ${offer.title.toUpperCase()} SELECTION...`)
    await trackPackage(offer)

    if (offer.key === 'premiumReferral') {
      setReferralOpen(true)
      setPackageStatus('PREMIUM REFERRAL OPTIONS OPEN - OWNER NOTIFIED')
      return
    }

    setPackageStatus(`${offer.title.toUpperCase()} SELECTED - OWNER NOTIFIED - OPENING CHECKOUT`)
    window.location.assign(PAYMENT_LINKS[offer.key])
  }

  async function submitPremiumReferral(event) {
    event.preventDefault()
    setPackageStatus('SENDING PREMIUM REFERRAL REQUEST...')
    const premiumOffer = offers.find((offer) => offer.key === 'premiumReferral')
    const sent = await notifyOwner('premium_referral_requested', { form, result, scan, package: premiumOffer })
    setPackageStatus(sent ? 'PREMIUM REFERRAL SENT TO OWNER EMAIL' : 'REFERRAL READY - USE EMAIL OR SITE LINK BELOW')
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(SITE_URL)
      setShareStatus('LINK COPIED')
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
      await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: SITE_URL })
      setShareStatus('SHARE PANEL OPENED')
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
  }

  const offers = [
    {
      key: 'outlinedStrategy',
      number: '01',
      title: 'Outlined Strategy',
      price: '$9.99 one-time',
      amount: 9.99,
      copy: 'A compact AI-assisted readout: visible faults, missed growth lanes, fastest fixes, and an ordered strategy map for the owner.',
      cta: 'Buy Strategy',
    },
    {
      key: 'automatedUtility',
      number: '02',
      title: 'Automated Utility',
      price: 'Starts at $229.99',
      amount: 229.99,
      copy: 'Automation setup for intake, owner alerts, follow-up, simple reporting, lead routing, and recurring growth prompts.',
      cta: 'Start Automation',
    },
    {
      key: 'fullStrategic',
      number: '03',
      title: 'Full Strategic Growth',
      price: 'Starts at $2,500',
      amount: 2500,
      copy: 'A deeper operating-system build: offer architecture, funnel logic, analytics, client delivery workflows, and strategic execution.',
      cta: 'Begin Growth Build',
    },
    {
      key: 'premiumReferral',
      number: '04',
      title: 'Premium QuantumBusinessStrategies Referral',
      price: 'Price upon referral',
      amount: 0,
      copy: 'For businesses that need premier-tier intervention, strategic review, and referral into the Quantumbusinessstrategies growth track.',
      cta: 'Request Premium Referral',
    },
  ]
  const shareDestinations = [
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(SITE_URL)}&text=${encodeURIComponent(`${SHARE_TITLE}: ${SHARE_TEXT}`)}`,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`,
    },
    {
      label: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(SITE_URL)}&title=${encodeURIComponent(SHARE_TITLE)}`,
    },
    {
      label: 'Threads',
      href: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${SHARE_TITLE} ${SITE_URL}`)}`,
    },
    {
      label: 'Bluesky',
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${SHARE_TITLE}: ${SHARE_TEXT} ${SITE_URL}`)}`,
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
      {createField(16, (i) => (
        <span
          className="binary-pop"
          key={`binary-pop-${i}`}
          style={{
            left: `${rand(i + 103, 0, 98)}%`,
            top: `${rand(i + 109, 0, 96)}%`,
            animationDelay: `-${rand(i + 113, 0, 10)}s`,
            animationDuration: `${rand(i + 127, 5, 13)}s`,
          }}
        >
          {i % 2 ? '101101' : '010010'}
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
      {createField(68, (i) => {
        const glyphs = createField(8 + (i % 7), (j) => (rand(i * j + 131, 0, 1) > 0.5 ? '1' : '0')).join('\n')
        return (
          <span
            className="matrix-rain"
            key={`rain-${i}`}
            style={{
              left: `${rand(i + 137, 0, 100)}%`,
              animationDuration: `${rand(i + 149, 8, 20)}s`,
              animationDelay: `-${rand(i + 151, 0, 16)}s`,
              opacity: rand(i + 157, 0.06, 0.32),
            }}
          >
            {glyphs}
          </span>
        )
      })}

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
                {scan && (
                  <ul>
                    {scan.losses.map((loss) => (
                      <li key={loss}>{loss}</li>
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
            <h2>Owner Oversight</h2>
            <p>Every scan, assessment, and package selection can be sent to {CONTACT_EMAIL} through the webhook automation hub.</p>
          </div>
          <div>
            <h2>Client Delivery</h2>
            <p>The package ladder moves clients from low-friction strategy to automation utility, full strategic growth, or premium referral.</p>
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

        <section className="offers" id="packages" aria-label="Paid growth paths">
          {offers.map((offer) => {
            const emailHref = mailtoHref({ form, result, scan, packageName: offer.title })
            return (
              <article key={offer.key}>
                <span>PACKAGE {offer.number} // {offer.price}</span>
                <h2>{offer.title}</h2>
                <p>{offer.copy}</p>
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
            <li>Your scan details are routed for review so the next recommendation matches the business context you provided.</li>
            <li>Paid strategy packages begin with the submitted business name, website, desired outcome, and readiness profile.</li>
            <li>Automation and full-growth packages may require additional access, onboarding questions, and owner approval before implementation.</li>
            <li>Premium referral requests are routed toward the Quantumbusinessstrategies review path for higher-touch strategic work.</li>
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
          <p>Copyright notice: © 2025-2026 Quantumbusinessstrategies, Quantumaibusiness, and QuantumbusinessAI brand materials. Trademark registration recommended.</p>
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
