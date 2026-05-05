# QuantumAiBusiness Cloudflare Migration

This keeps the public site on GitHub Pages while moving live backend automation away from Vercel in stages.

## Target Architecture

- GitHub Pages: public website on `quantumaibusiness.com`
- Cloudflare Workers: live API/webhook backend
- GitHub Actions: scheduled checks and low-risk recurring automation
- Stripe: payments and webhook events
- Resend: owner/client email
- OpenAI: paid diagnostic generation
- Google Sheets/Apps Script: low-cost ledger and owner visibility

## Phase 1: Deploy Worker Beside Vercel

The first Worker is a safe bridge:

- `/api/health` reports Cloudflare Worker readiness.
- `/api/ads-preflight` checks the paid landing route before Google Ads spend.
- Other `/api/*` requests proxy to the existing Vercel backend until each route is migrated.

Deploy:

```powershell
npx wrangler login
npx wrangler deploy --config cloudflare/wrangler.jsonc
```

Then set secrets:

```powershell
npx wrangler secret put OWNER_ACTION_TOKEN --config cloudflare/wrangler.jsonc
npx wrangler secret put CRON_SECRET --config cloudflare/wrangler.jsonc
npx wrangler secret put RESEND_API_KEY --config cloudflare/wrangler.jsonc
npx wrangler secret put OPENAI_API_KEY --config cloudflare/wrangler.jsonc
npx wrangler secret put STRIPE_SECRET_KEY --config cloudflare/wrangler.jsonc
npx wrangler secret put STRIPE_WEBHOOK_SECRET --config cloudflare/wrangler.jsonc
npx wrangler secret put AUTOMATION_WEBHOOK_URL --config cloudflare/wrangler.jsonc
```

## Phase 2: Move Low-Risk Routes

Move these first:

1. `/api/health`
2. `/api/lead`
3. `/api/diagnostic`
4. `/api/growth-campaign`
5. `/api/social-queue`

Keep Vercel active until test submissions, owner emails, and sheet logging pass.

## Phase 3: Move Money Routes

Move Stripe last:

1. Create a new Stripe webhook endpoint for the Worker URL.
2. Add the new signing secret to Cloudflare.
3. Run Stripe test event.
4. Confirm owner email and ledger entry.
5. Only then disable the Vercel webhook.

## Why Not GitHub Only

GitHub Pages cannot receive live Stripe webhooks or run live API requests.
GitHub Actions is excellent for scheduled automation, but it is not an always-online request handler.
