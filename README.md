# Quantum AI Business

React/Vite site for `quantumaibusiness.com`.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Optional automation/payment settings

Set these as GitHub Pages repository variables or local `.env` values:

- `VITE_CONTACT_EMAIL`: fallback email for lead and payment buttons. Default: `quantumbusinessstrategies@gmail.com`.
- `VITE_LEAD_WEBHOOK_URL`: Zapier, Make, CRM, Google Apps Script, or other HTTPS webhook for assessments.
- `VITE_AUDIT_PAYMENT_URL`: checkout link for the Business Weakness Scan.
- `VITE_OVERHAUL_PAYMENT_URL`: checkout/application link for the Done-For-You Overhaul.
- `VITE_LIFETIME_INSIGHT_PAYMENT_URL`: checkout link for the Lifetime Insight Vault.
- `VITE_FULL_SPECTRUM_PAYMENT_URL`: checkout/application link for Full-Spectrum Growth.
- `VITE_GOOGLE_TAG_ID`: Google Ads/Analytics tag ID for conversion tracking.
- `VITE_META_PIXEL_ID`: Meta pixel ID for lead conversion tracking.

## GitHub Pages domain setup

This repo includes `public/CNAME` with `quantumaibusiness.com` and a GitHub Pages deploy workflow. After pushing to GitHub:

1. In GitHub, go to Settings > Pages.
2. Set Source to GitHub Actions.
3. Set the custom domain to `quantumaibusiness.com`.
4. In Porkbun DNS, point the apex domain to GitHub Pages using GitHub's current Pages DNS records, and add a `www` CNAME to your GitHub Pages host.
