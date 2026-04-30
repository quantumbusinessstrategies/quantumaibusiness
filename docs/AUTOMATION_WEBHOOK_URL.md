# AUTOMATION_WEBHOOK_URL Setup

Recommended first automation target: Google Sheets through Google Apps Script.

This gives QuantumAiBusiness a low-cost event ledger that is easy to export, back up, and replace later. Vercel remains the source of truth for the backend; the sheet is just a copy of events.

## Why This Path

- Cheap/free for early volume.
- You own the spreadsheet data and can export CSV anytime.
- No Make/Zapier task billing surprises while traffic is low.
- Easy to replace later with Make, Zapier, Airtable, HubSpot, or a real database.

## Create The Sheet Webhook

1. Create a Google Sheet named `QuantumAiBusiness Automation Ledger`.
2. Go to Extensions > Apps Script.
3. Paste the contents of `automation/google-sheets-webhook.gs`.
4. In Apps Script, open Project Settings > Script Properties.
5. Add:
   - Property: `QAB_WEBHOOK_SECRET`
   - Value: a long random secret
6. Click Deploy > New deployment.
7. Select type: Web app.
8. Execute as: Me.
9. Who has access: Anyone.
10. Deploy and copy the Web app URL.

## Add It To Vercel

In the Vercel project, add:

```text
AUTOMATION_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?secret=YOUR_LONG_SECRET
```

Then redeploy Vercel.

## What Will Be Logged

The sheet receives backend records from:

- Lead scans
- Package clicks
- Referral requests
- Stripe checkout events
- Paid fulfillment intake
- AI fulfillment drafts
- Approved draft sends
- Growth campaign packs
- Lead route reports
- Daily owner digest rows

New deployments of the Apps Script also include `lead_score` and `lead_route` columns.

## Later Upgrade Path

When revenue justifies it, replace the Google Apps Script URL with a Make, Zapier, Airtable, HubSpot, or database endpoint. No frontend code change is needed; only `AUTOMATION_WEBHOOK_URL` changes.
