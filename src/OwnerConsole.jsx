import { useMemo, useState } from 'react'

const PACKAGE_OPTIONS = [
  ['outlinedStrategy', 'Outlined Strategy'],
  ['automatedUtility', 'Automated Utility'],
  ['fullStrategic', 'Full Strategic Growth'],
  ['premiumReferral', 'Premium Referral'],
]

function isLocalHost() {
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
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

export default function OwnerConsole() {
  const localOnly = isLocalHost()
  const [rawPacket, setRawPacket] = useState('')
  const [copied, setCopied] = useState('')
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

      <section className="owner-grid owner-output-grid">
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>3. Strategy Report</h2>
            <button type="button" onClick={() => copyText('Report', report)}>COPY REPORT</button>
          </div>
          <pre>{report}</pre>
        </div>
        <div className="owner-panel">
          <div className="owner-panel-title">
            <h2>4. Customer Reply</h2>
            <button type="button" onClick={() => copyText('Reply', reply)}>COPY REPLY</button>
          </div>
          <pre>{reply}</pre>
        </div>
      </section>

      {copied && <p className="owner-toast">{copied}</p>}
    </main>
  )
}
