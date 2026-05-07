# QuantumAiBusiness Ownership Exit Plan

This plan removes Vercel as an implicit dependency and keeps the live system under owned domains and accounts.

## Current State

- `quantumaibusiness.com` is the public site on GitHub Pages.
- `quantumaibusiness.com/api/*` is the intended owned API path.
- Vercel should be treated only as a temporary legacy backend, not the public site owner.
- Google Ads and analytics should point directly at `https://quantumaibusiness.com/...` landing pages.

## Immediate Changes In This Repo

- Frontend API calls now default to same-origin `/api/*`.
- The owner console reads `VITE_AUTOMATION_API_URL` instead of hardcoding a Vercel URL.
- The Cloudflare Worker no longer silently falls back to Vercel. A fallback must be explicitly configured with `LEGACY_BACKEND_ORIGIN`.

## Exit Steps

1. Deploy the Cloudflare Worker from `cloudflare/wrangler.jsonc`.
2. Add a Cloudflare Worker route for `quantumaibusiness.com/api/*`.
3. Add Cloudflare secrets for owner token, Stripe, Resend, OpenAI, and the automation ledger.
4. Port routes from `api/` into the Worker in this order:
   - `/api/health`
   - `/api/lead`
   - `/api/diagnostic`
   - `/api/checkout-session`
   - `/api/stripe-webhook`
   - `/api/ops-runner`
5. Leave the GitHub Pages build variable blank unless intentionally using a separate API origin:
   - `VITE_AUTOMATION_API_URL=`
6. Update Stripe webhook endpoint to the owned API domain.
7. Run a test lead, test checkout, test webhook, and owner console preflight.
8. Remove `.vercel/`, `vercel.json`, and Vercel project connection after the owned API passes.

## Google Ads And Analytics Rule

Use only owned URLs in campaign setup:

- Final URL: `https://quantumaibusiness.com/growth-scan-pack.html`
- Conversion page: `https://quantumaibusiness.com/scan-pack-thank-you.html`
- API/backend URL: never use as an ad final URL.

Vercel should not appear in Google Ads final URLs, analytics property setup, or customer-visible links.
