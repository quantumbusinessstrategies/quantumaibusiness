import { useMemo, useState } from 'react'

const PAYMENT_LINKS = {
  audit: import.meta.env.VITE_AUDIT_PAYMENT_URL || '',
  overhaul: import.meta.env.VITE_OVERHAUL_PAYMENT_URL || '',
  lifetimeInsight: import.meta.env.VITE_LIFETIME_INSIGHT_PAYMENT_URL || '',
  fullSpectrum: import.meta.env.VITE_FULL_SPECTRUM_PAYMENT_URL || '',
}

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'quantumbusinessstrategies@gmail.com'
const LEAD_WEBHOOK = import.meta.env.VITE_LEAD_WEBHOOK_URL || ''

function rand(seed, min, max) {
  const n = Math.sin(seed * 9999) * 10000
  return (n - Math.floor(n)) * (max - min) + min
}

function createField(count, mapper) {
  return Array.from({ length: count }, (_, i) => mapper(i + 1))
}

function scoreFromAnswers(form) {
  const values = [
    form.revenue,
    form.leads,
    form.operations,
    form.accounting,
    form.advertising,
    form.automation,
  ].map(Number)

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

function mailtoHref(form, result) {
  const subject = encodeURIComponent(`Quantum AI Business assessment: ${form.company || 'New lead'}`)
  const body = encodeURIComponent(
    [
      `Company: ${form.company}`,
      `Website: ${form.website}`,
      `Email: ${form.email}`,
      `Revenue stage: ${form.revenue}`,
      `Leads: ${form.leads}`,
      `Operations: ${form.operations}`,
      `Accounting: ${form.accounting}`,
      `Advertising: ${form.advertising}`,
      `Automation: ${form.automation}`,
      `Objective: ${form.objective}`,
      `Readiness score: ${result.readiness}%`,
      `Priority gaps: ${result.gaps.join(', ')}`,
    ].join('\n'),
  )

  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
}

export default function QuantumAIWebsite() {
  const [objective, setObjective] = useState('')
  const [open, setOpen] = useState(false)
  const [resp, setResp] = useState('AWAITING QUANTUM ANALYSIS...')
  const [leadStatus, setLeadStatus] = useState('')
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

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function send() {
    const target = objective || form.objective || form.company || 'BUSINESS'
    setResp(`SCANNING ${target.toUpperCase()} :: BOTTLENECKS FOUND :: ${result.gaps.join(' + ').toUpperCase()} :: NEXT STEP READY`)
    setOpen(true)
  }

  async function submitLead(event) {
    event.preventDefault()
    setLeadStatus('ASSESSMENT PACKET GENERATED')
    setOpen(true)
    setResp(`READINESS ${result.readiness}% :: PRIORITY GAPS: ${result.gaps.join(' / ')} :: SELECT A GROWTH PATH BELOW`)

    if (!LEAD_WEBHOOK) return

    try {
      await fetch(LEAD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, result, source: 'quantumaibusiness.com' }),
      })
      setLeadStatus('ASSESSMENT SENT TO AUTOMATION HUB')
    } catch {
      setLeadStatus('ASSESSMENT SAVED ON SCREEN - WEBHOOK NEEDS ATTENTION')
    }
  }

  const offers = [
    {
      key: 'audit',
      title: 'Business Weakness Scan',
      price: 'Entry diagnostic',
      copy: 'A paid review that turns the free scan into a prioritized fix list for sales, operations, accounting, automation, and advertising.',
      cta: 'Buy Scan',
    },
    {
      key: 'overhaul',
      title: 'Done-For-You Overhaul',
      price: 'High-ticket buildout',
      copy: 'Your company builds the funnels, automations, dashboards, client reporting, ad systems, and operating procedures.',
      cta: 'Start Overhaul',
    },
    {
      key: 'lifetimeInsight',
      title: 'Lifetime Insight Vault',
      price: 'Self-guided access',
      copy: 'A permanent library of recommendations, playbooks, metrics, prompts, and business growth perspectives.',
      cta: 'Unlock Insight',
    },
    {
      key: 'fullSpectrum',
      title: 'Full-Spectrum Growth',
      price: 'Ongoing partnership',
      copy: 'Lifetime access to the broadest growth system: AI analysis, automation oversight, recurring reviews, and execution planning.',
      cta: 'Apply Now',
    },
  ]

  return (
    <div className="quantum-shell">
      <div className="cosmic-glow" />
      {beams.map((beam) => (
        <div
          className="beam"
          key={`beam-${beam.id}`}
          style={{
            left: `${beam.x}%`,
            top: `${beam.y}%`,
            width: beam.w,
            transform: `rotate(${beam.r}deg)`,
            opacity: beam.o,
          }}
        />
      ))}
      {stars.map((star) => (
        <span className="star" key={star.id} style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.s, height: star.s }} />
      ))}
      {coins.map((coin) => (
        <span
          className="coin"
          key={`coin-${coin.id}`}
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            width: coin.s,
            height: coin.s,
            animationDuration: `${coin.d}s`,
          }}
        >
          $
        </span>
      ))}
      {createField(110, (i) => (
        <span
          className="matrix-rain"
          key={`rain-${i}`}
          style={{
            left: `${(i * 1.8) % 100}%`,
            animationDuration: `${2 + (i % 9) * 0.7}s`,
            animationDelay: `-${(i % 17) * 0.4}s`,
          }}
        >
          0101{'\n'}1010{'\n'}1100{'\n'}0011
        </span>
      ))}

      <main className="content">
        <section className="hero-panel" aria-labelledby="hero-title">
          <div className="brand-chip">QUANTUMAIBUSINESS.COM</div>
          <h1 id="hero-title">QUANTUM AI BUSINESS</h1>
          <p className="tagline">8-BIT FUTURISM // FRACTAL LOGIC // CYBER PROFIT // AUTOMATION COMMAND</p>
          <p className="promise">
            AI-assisted business diagnostics and automation systems for owners who need clearer bottlenecks, sharper offers,
            and a path from insight to execution.
          </p>

          <div className="command-center">
            <input
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              placeholder="> ENTER OBJECTIVE_"
              aria-label="Business objective"
            />
            <button onClick={send} type="button">QUANTIFY BUSINESS</button>
            {open && <div className="response-console">{resp}</div>}
          </div>
        </section>

        <section className="system-grid" aria-label="Automation system">
          <div>
            <h2>Automation Stack</h2>
            <p>Lead intake, scoring, offer routing, payment links, client follow-up, and operator alerts are designed as one connected funnel.</p>
          </div>
          <div>
            <h2>Human Oversight</h2>
            <p>AI can draft analysis and automate repetitive work, while final claims, billing, ads, and client promises stay reviewable.</p>
          </div>
          <div>
            <h2>Profit Engine</h2>
            <p>The site moves visitors from free weakness scan to paid audit, done-for-you overhaul, self-guided insight, or full-spectrum growth.</p>
          </div>
        </section>

        <section className="assessment" aria-labelledby="assessment-title">
          <div className="assessment-copy">
            <div className="brand-chip">FREE FRONT-END SCAN</div>
            <h2 id="assessment-title">Business Weakness Intake</h2>
            <p>
              This creates the first useful client touchpoint: collect the business context, score readiness, expose the top gaps,
              and route the lead into a paid offer.
            </p>
            <div className="score-box">
              <strong>{result.readiness}%</strong>
              <span>automation readiness</span>
              <small>Priority gaps: {result.gaps.join(', ')}</small>
            </div>
          </div>

          <form className="intake-form" onSubmit={submitLead}>
            <label>
              Company
              <input name="company" value={form.company} onChange={updateField} placeholder="Acme Growth LLC" />
            </label>
            <label>
              Website
              <input name="website" value={form.website} onChange={updateField} placeholder="https://example.com" />
            </label>
            <label>
              Email
              <input name="email" value={form.email} onChange={updateField} placeholder="owner@example.com" type="email" />
            </label>
            <label className="wide">
              Main objective
              <textarea name="objective" value={form.objective} onChange={updateField} placeholder="More qualified leads, cleaner operations, better reporting..." />
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
            <button className="wide" type="submit">GENERATE BUSINESS READOUT</button>
            {leadStatus && <p className="lead-status">{leadStatus}</p>}
          </form>
        </section>

        <section className="offers" aria-label="Paid growth paths">
          {offers.map((offer) => {
            const href = PAYMENT_LINKS[offer.key] || mailtoHref(form, result)
            return (
              <article key={offer.key}>
                <span>{offer.price}</span>
                <h2>{offer.title}</h2>
                <p>{offer.copy}</p>
                <a href={href}>{offer.cta}</a>
              </article>
            )
          })}
        </section>

        <section className="launch-board" aria-labelledby="launch-title">
          <h2 id="launch-title">Operator Launch Board</h2>
          <ul>
            <li>Connect a form webhook with <code>VITE_LEAD_WEBHOOK_URL</code> for CRM, Sheets, Zapier, Make, or GoHighLevel.</li>
            <li>Add Stripe or checkout links with the <code>VITE_*_PAYMENT_URL</code> environment variables.</li>
            <li>Point Porkbun DNS for <code>quantumaibusiness.com</code> at GitHub Pages after the repo is published.</li>
            <li>Keep final ad claims, legal promises, and financial decisions under owner review.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
