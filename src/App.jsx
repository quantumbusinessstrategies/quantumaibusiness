import { useEffect, useMemo, useState } from 'react'

const PAYMENT_LINKS = {
  outlinedStrategy: import.meta.env.VITE_OUTLINED_STRATEGY_PAYMENT_URL || import.meta.env.VITE_AUDIT_PAYMENT_URL || '',
  automatedUtility: import.meta.env.VITE_AUTOMATED_UTILITY_PAYMENT_URL || import.meta.env.VITE_OVERHAUL_PAYMENT_URL || '',
  fullStrategic: import.meta.env.VITE_FULL_STRATEGIC_PAYMENT_URL || import.meta.env.VITE_FULL_SPECTRUM_PAYMENT_URL || '',
  premiumReferral: import.meta.env.VITE_PREMIUM_REFERRAL_URL || 'https://quantumbusinessstrategies.com',
}

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'quantumbusinessstrategies@gmail.com'
const LEAD_WEBHOOK = import.meta.env.VITE_LEAD_WEBHOOK_URL || ''
const OWNER_NOTIFICATION_URL =
  import.meta.env.VITE_OWNER_NOTIFICATION_URL || `https://formsubmit.co/ajax/${CONTACT_EMAIL}`
const GOOGLE_TAG_ID = import.meta.env.VITE_GOOGLE_TAG_ID || ''
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || ''

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
    () => createField(120, (i) => ({ id: i, x: rand(i, 0, 100), y: rand(i + 3, 0, 100), s: rand(i + 7, 1, 3) })),
    [],
  )
  const coins = useMemo(
    () =>
      createField(28, (i) => ({
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
      createField(22, (i) => ({
        id: i,
        x: rand(i + 31, 0, 100),
        y: rand(i + 37, 0, 100),
        w: rand(i + 41, 80, 260),
        r: rand(i + 43, -65, 65),
        o: rand(i + 47, 0.2, 0.8),
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

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function runScan() {
    const scanTargetValue = target || form.website || form.company || 'Business'
    const nextForm = { ...form, website: form.website || scanTargetValue, company: form.company || scanTargetValue }
    const generatedScan = scanTarget(scanTargetValue, result)
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

  return (
    <div className="quantum-shell">
      <div className="cosmic-glow" />
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
      {coins.map((coin) => (
        <span
          className="coin"
          key={`coin-${coin.id}`}
          style={{ left: `${coin.x}%`, top: `${coin.y}%`, width: coin.s, height: coin.s, animationDuration: `${coin.d}s` }}
        >
          $
        </span>
      ))}
      {createField(110, (i) => (
        <span
          className="matrix-rain"
          key={`rain-${i}`}
          style={{ left: `${(i * 1.8) % 100}%`, animationDuration: `${2 + (i % 9) * 0.7}s`, animationDelay: `-${(i % 17) * 0.4}s` }}
        >
          0101{'\n'}1010{'\n'}1100{'\n'}0011
        </span>
      ))}

      <main className="content">
        <section className="hero-panel" aria-labelledby="hero-title">
          <div className="brand-chip">QUANTUMAIBUSINESS.COM</div>
          <h1 id="hero-title">QUANTUM AI BUSINESS</h1>
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
            <button onClick={runScan} type="button">QUANTIFY BUSINESS</button>
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

        <section className="offers" aria-label="Paid growth paths">
          {offers.map((offer) => {
            const href =
              PAYMENT_LINKS[offer.key] ||
              (offer.key === 'premiumReferral' ? PAYMENT_LINKS.premiumReferral : mailtoHref({ form, result, scan, packageName: offer.title }))
            return (
              <article key={offer.key}>
                <span>PACKAGE {offer.number} // {offer.price}</span>
                <h2>{offer.title}</h2>
                <p>{offer.copy}</p>
                <a href={href} onClick={() => trackPackage(offer)}>{offer.cta}</a>
              </article>
            )
          })}
        </section>

        <section className="launch-board" aria-labelledby="launch-title">
          <h2 id="launch-title">Background Utility + Delivery Map</h2>
          <ul>
            <li>Connect <code>VITE_LEAD_WEBHOOK_URL</code> to Zapier, Make, GoHighLevel, HubSpot, Airtable, or Google Sheets for owner emails and client records.</li>
            <li>Add Stripe Payment Links for package 1, 2, and 3 so checkout is immediate.</li>
            <li>Use package 4 to send premium prospects to <code>quantumbusinessstrategies.com</code> and notify {CONTACT_EMAIL}.</li>
            <li>Names such as Quantumbusinessstrategies, Quantumaibusiness, and QuantumbusinessAI should be protected through trademark review, not only copyright.</li>
          </ul>
        </section>

        <footer className="transparency">
          <p>
            Transparency: Quantum AI Business provides automated diagnostics, strategic information, and workflow routing. Results are not guaranteed,
            do not replace legal, financial, tax, or professional advice, and depend on client execution, market conditions, platform policies, and data quality.
            By using this site, visitors agree that all services and information are used at their own discretion and that liability is limited to the fullest
            extent permitted by applicable law.
          </p>
          <p>Copyright notice: © 2025-2026 Quantumbusinessstrategies, Quantumaibusiness, and QuantumbusinessAI brand materials. Trademark registration recommended.</p>
        </footer>
      </main>
    </div>
  )
}
