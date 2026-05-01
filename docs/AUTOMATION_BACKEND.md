# Automation Backend

This repo includes a lightweight serverless backend for the money and notification path.

## What It Does

- `POST /api/lead`: receives scans, assessments, package clicks, referral requests, and share events.
- `POST /api/fulfillment`: receives paid customer delivery details and can generate an AI fulfillment draft when enabled.
- `POST /api/stripe-webhook`: receives Stripe `checkout.session.completed` events.
- `POST /api/growth-campaign`: creates owner-reviewed advertising, outreach, and growth campaign packs.
- `POST /api/lead-router`: scores reviewed leads and recommends the next owner action.
- `POST /api/send-approved-draft`: sends a reviewed fulfillment draft to a customer from the local owner console.
- `GET /api/daily-digest`: sends a protected daily owner command digest through Vercel Cron.
- Sends owner notifications to `quantumbusinessstrategies@gmail.com`.
- Optionally forwards every record to Zapier, Make, Google Sheets, Airtable, HubSpot, or another CRM through `AUTOMATION_WEBHOOK_URL`.

## Fastest Deployment Path

Keep `quantumaibusiness.com` on GitHub Pages for now and deploy only the API to Vercel.

1. Import this GitHub repo into Vercel.
2. Add these Vercel environment variables:
   - `OWNER_EMAIL=quantumbusinessstrategies@gmail.com`
   - `PUBLIC_SITE_ORIGIN=https://quantumaibusiness.com`
   - `OWNER_NOTIFICATION_URL=https://formsubmit.co/ajax/quantumbusinessstrategies@gmail.com`
   - `AUTOMATION_WEBHOOK_URL=` optional Zapier/Make/Sheets/CRM catch URL
   - `STRIPE_WEBHOOK_SECRET=` from the Stripe webhook endpoint
   - `OPENAI_API_KEY=` from the OpenAI platform, only on the backend host
   - `OPENAI_MODEL=gpt-5-mini`
   - `FULFILLMENT_MODE=intake_only` to collect paid intake for owner review, or `auto_generate` to generate AI drafts automatically
   - `FULFILLMENT_CLIENT_EMAIL_MODE=owner_review` to hold generated drafts for owner review
   - `FULFILLMENT_CLIENT_EMAIL_MODE=auto_send_low_tier` to auto-send only the $9.99 diagnostic and $49.99 Growth Scan Pack after paid intake
   - `FULFILLMENT_CLIENT_EMAIL_MODE=auto_send_all` only if you intentionally want every generated package draft sent without owner review
   - `STRIPE_CLIENT_ONBOARDING_MODE=auto_send` to email paid buyers the fulfillment intake link after checkout, or `off` to disable
   - `OWNER_ACTION_TOKEN=` a private random token used by the local owner console to send approved drafts to clients
   - `CRON_SECRET=` a private random token used by Vercel Cron for the daily owner digest
   - `RESEND_API_KEY=` optional, for more reliable email than FormSubmit
   - `RESEND_FROM_EMAIL=` optional, requires a verified sender/domain in Resend
3. Deploy in Vercel and copy the deployment URL, for example `https://quantumaibusiness.vercel.app`.
4. The production frontend now defaults to:
   - `VITE_AUTOMATION_API_URL=https://quantumaibusiness.vercel.app`
5. Re-run the GitHub Pages deploy workflow if you later override the backend URL through repository variables.

After that, the static site sends events to the backend first. If the backend URL is intentionally removed, it falls back to the current FormSubmit/webhook path.

## Stripe Webhook Setup

In Stripe:

1. Go to Developers > Webhooks.
2. Add endpoint:
   - `https://YOUR-VERCEL-APP.vercel.app/api/stripe-webhook`
3. Listen for:
   - `checkout.session.completed`
4. Copy the signing secret that starts with `whsec_`.
5. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`.

When a checkout completes, the backend records the payment event, emails the owner, and forwards it to `AUTOMATION_WEBHOOK_URL` if configured.

If `STRIPE_CLIENT_ONBOARDING_MODE=auto_send`, the backend also emails the buyer a transactional next-step message with the paid fulfillment form link:

- `https://quantumaibusiness.com/#fulfillment`

## Paid Fulfillment Setup

The live site includes a `#fulfillment` intake form for paid customers. Until `VITE_AUTOMATION_API_URL` points to a deployed backend, that form falls back to the owner notification route.

When backend hosting is available:

1. Add `OPENAI_API_KEY` only to the backend host. Never add it to GitHub Pages or any frontend variable.
2. Start with `FULFILLMENT_MODE=intake_only` so requests go to owner review.
3. Keep `FULFILLMENT_CLIENT_EMAIL_MODE=owner_review` while testing so drafts notify the owner but do not auto-send to clients.
4. After testing, switch to `FULFILLMENT_MODE=auto_generate` if you want the backend to create the first AI deliverable immediately.
5. Use `FULFILLMENT_CLIENT_EMAIL_MODE=auto_send_low_tier` for the recommended first automation stage. This auto-sends the low-tier $9.99 and $49.99 packages, while Automated Utility, Full Strategic Growth, and premium referral stay owner-reviewed.
6. Only switch `FULFILLMENT_CLIENT_EMAIL_MODE=auto_send_all` after generated drafts are consistently acceptable for direct client delivery across every tier.
7. Add `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL` if you want generated drafts emailed directly to clients.

Recommended live settings for the current business stage:

- `FULFILLMENT_MODE=auto_generate`
- `FULFILLMENT_CLIENT_EMAIL_MODE=auto_send_low_tier`
- `STRIPE_CLIENT_ONBOARDING_MODE=auto_send`

With those values, Stripe checkout still sends the buyer to the intake form, the $9.99 diagnostic and $49.99 Growth Scan Pack can auto-generate and auto-send after intake, and higher-ticket packages remain held for owner review.

## Owner-Approved Draft Sending

The backend includes `POST /api/send-approved-draft` for the local owner console. This endpoint sends a reviewed draft to the customer through Resend and notifies the owner.

The backend also includes protected owner tools:

- `POST /api/growth-campaign` generates launch copy, social posts, ad angles, direct outreach, and a seven-day action loop. It does not auto-post or spend ad budget.
- `POST /api/lead-router` scores a reviewed lead and recommends one of the package routes: outlined strategy delivery, automated utility upsell, full growth review, or premium owner review.

Security requirement:

- Add `OWNER_ACTION_TOKEN` in Vercel.
- Use a long random value.
- Enter the same value only in the local owner console.
- Never publish or commit this token.

Recommended Stripe Payment Link redirect:

- Success URL: `https://quantumaibusiness.com/#fulfillment`

That sends paid buyers straight to the fulfillment form after checkout.

## Recommended Next Automation

For the fastest useful operations stack, connect `AUTOMATION_WEBHOOK_URL` to a Make or Zapier flow that:

- Creates a row in Google Sheets or Airtable.
- Sends an owner email.
- Tags the lead by package tier.
- Creates a follow-up task only for full-growth or premium prospects.
- Sends a client receipt/onboarding email after Stripe payment.

## Daily Owner Digest

The repo includes a Vercel Cron job in `vercel.json`:

- Path: `/api/daily-digest`
- Schedule: `0 14 * * *`

That is 14:00 UTC daily, which is usually morning in the United States. Add `CRON_SECRET` in Vercel before relying on the cron. The endpoint can also be run manually with the owner token by calling it with an `X-Owner-Token` header.
