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
- `VITE_OWNER_NOTIFICATION_URL`: owner notification endpoint. Defaults to FormSubmit AJAX for `quantumbusinessstrategies@gmail.com`; approve the first activation email from FormSubmit.
- `VITE_AUDIT_PAYMENT_URL`: checkout link for the Business Weakness Scan.
- `VITE_OVERHAUL_PAYMENT_URL`: checkout/application link for the Done-For-You Overhaul.
- `VITE_LIFETIME_INSIGHT_PAYMENT_URL`: checkout link for the Lifetime Insight Vault.
- `VITE_FULL_SPECTRUM_PAYMENT_URL`: checkout/application link for Full-Spectrum Growth.
- `VITE_OUTLINED_STRATEGY_PAYMENT_URL`: package 1 checkout link, starting at `$9.99`.
- `VITE_AUTOMATED_UTILITY_PAYMENT_URL`: package 2 checkout link, starting at `$229.99`.
- `VITE_FULL_STRATEGIC_PAYMENT_URL`: package 3 checkout/application link, starting at `$2,500`.
- `VITE_PREMIUM_REFERRAL_URL`: package 4 referral URL, defaulting to `https://quantumbusinessstrategies.com`.
- `VITE_GOOGLE_TAG_ID`: Google Ads/Analytics tag ID for conversion tracking.
- `VITE_META_PIXEL_ID`: Meta pixel ID for lead conversion tracking.

## Brand protection note

Names such as Quantumbusinessstrategies, Quantumaibusiness, and QuantumbusinessAI are usually protected through trademark law when used to identify services. Copyright can protect original website copy, graphics, software, and creative materials, but it generally does not protect names, titles, short phrases, or domain names.

## GitHub Pages domain setup

This repo includes `public/CNAME` with `quantumaibusiness.com` and a GitHub Pages deploy workflow. After pushing to GitHub:

1. In GitHub, go to Settings > Pages.
2. Set Source to GitHub Actions.
3. Set the custom domain to `quantumaibusiness.com`.
4. In Porkbun DNS, point the apex domain to GitHub Pages using GitHub's current Pages DNS records, and add a `www` CNAME to your GitHub Pages host.
