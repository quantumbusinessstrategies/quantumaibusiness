import { useMemo, useState } from 'react'

const PIPELINE_STORAGE_KEY = 'quantumaibusiness_owner_pipeline'
const PACKAGE_OPTIONS = [
  ['outlinedStrategy', 'Outlined Strategy'],
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
  'Copy/send the customer reply for any $9.99 strategy buyers.',
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
    'Note: This strategy is informational and does not guarantee revenue, profit, ranking, ad approval, or platform performance. Results depend on execution, market conditions, data quality, and business constraints.',
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
      business: form.business || parsed.business,
      website: form.website || parsed.website,
      email: form.email || parsed.email,
      objective: form.objective || parsed.objective,
      tools: form.tools || parsed.tools,
      constraints: form.constraints || parsed.constraints,
    }),
    [form, parsed],
  )
  const report = useMemo(() => buildReport({ form: effective, parsed }), [effective, parsed])
  const reply = useMemo(() => buildReply({ form: effective, parsed, report }), [effective, parsed, report])
  const upsell = useMemo(() => buildUpsell({ form: effective, parsed }), [effective, parsed])
  const outreachCopy = useMemo(() => buildOutreachCopy({ form: effective, parsed }), [effective, parsed])
  const packageDetail = PACKAGE_DETAILS[effective.packageKey] || PACKAGE_DETAILS.outlinedStrategy
  const pipelineStats = useMemo(
    () => ({
      active: pipeline.filter((item) => !['closed', 'reply sent'].includes(item.status)).length,
      paid: pipeline.filter((item) => item.status === 'paid intake').length,
      upsell: pipeline.filter((item) => item.status === 'upsell target').length,
      value: pipeline.reduce((sum, item) => sum + Number(item.numericValue || 0), 0),
    }),
    [pipeline],
  )

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
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
    const numericValue = effective.packageKey === 'fullStrategic' ? 2500 : effective.packageKey === 'automatedUtility' ? 229.99 : effective.packageKey === 'outlinedStrategy' ? 9.99 : 0
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
            <input name="business" value={effective.business} onChange={updateField} />
          </label>
          <label>
            Website
            <input name="website" value={effective.website} onChange={updateField} />
          </label>
          <label>
            Customer email
            <input name="email" value={effective.email} onChange={updateField} />
          </label>
          <label>
            Objective
            <textarea name="objective" value={effective.objective} onChange={updateField} />
          </label>
          <label>
            Current tools
            <input name="tools" value={effective.tools} onChange={updateField} />
          </label>
          <label>
            Constraints
            <input name="constraints" value={effective.constraints} onChange={updateField} />
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
          <h2>4. Daily Money Loop</h2>
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
      </section>

      <section className="owner-grid owner-output-grid">
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>5. Strategy Report</h2>
            <button type="button" onClick={() => copyText('Report', report)}>COPY REPORT</button>
          </div>
          <pre>{report}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>6. Customer Reply</h2>
            <button type="button" onClick={() => copyText('Reply', reply)}>COPY REPLY</button>
          </div>
          <pre>{reply}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>7. Upgrade Follow-Up</h2>
            <button type="button" onClick={() => copyText('Upgrade follow-up', upsell)}>COPY UPSELL</button>
          </div>
          <pre>{upsell}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>8. Outreach Copy</h2>
            <button type="button" onClick={() => copyText('Outreach copy', outreachCopy)}>COPY OUTREACH</button>
          </div>
          <pre>{outreachCopy}</pre>
        </div>
      </section>

      {copied && <p className="owner-toast">{copied}</p>}
    </main>
  )
}
