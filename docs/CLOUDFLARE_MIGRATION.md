# QuantumAiBusiness Cloudflare Migration

This keeps the public site on GitHub Pages while moving live backend automation to an owned Cloudflare Worker API.

## Target Architecture

- GitHub Pages: public website on `quantumaibusiness.com`
- Cloudflare Workers: live `quantumaibusiness.com/api/*` backend
- GitHub Actions: scheduled checks and low-risk recurring automation
- Stripe: payments and webhook events
- Resend: owner/client email
- OpenAI: paid diagnostic generation
- Google Sheets/Apps Script: low-cost ledger and owner visibility

## Phase 1: Deploy Owned Worker

The first Worker proves the owned API path:

- `/api/health` reports Cloudflare Worker readiness.
- `/api/ads-preflight` checks the paid landing route before Google Ads spend.
- Other `/api/*` requests return a route-migration response unless `LEGACY_BACKEND_ORIGIN` is explicitly configured.

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

Keep any legacy backend active only until test submissions, owner emails, and sheet logging pass through the owned API.

## Phase 3: Move Money Routes

Move Stripe last:

1. Create a new Stripe webhook endpoint for the Worker URL.
2. Add the new signing secret to Cloudflare.
3. Run Stripe test event.
4. Confirm owner email and ledger entry.
5. Only then disable any legacy webhook.

## Why Not GitHub Only

GitHub Pages cannot receive live Stripe webhooks or run live API requests.
GitHub Actions is excellent for scheduled automation, but it is not an always-online request handler.
