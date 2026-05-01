# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # Production build (output → dist/)
npm run preview   # Preview the production build locally
```

No lint or typecheck scripts exist — the frontend is plain JSX with no TypeScript.

## Architecture

This is a single-page React 18 + Vite + TailwindCSS landing site for **buildingoro.ca**, plus Vercel serverless functions for waitlist signup and newsletter unsubscribes.

### Frontend (src/)

- `App.jsx` — root; conditionally inits Google Analytics based on cookie consent stored in `localStorage` (`oro_cookie_consent`)
- `src/components/sections/IntroSection.jsx` — the entire page: nav, hero headline, waitlist CTA button, footer links. Opens `WaitlistModal` when the CTA is clicked or when `window.location.hash` contains `access_token` (Supabase magic-link redirect)
- `src/components/sections/WaitlistModal.jsx` — email waitlist signup; POSTs to `api/waitlist` (returns 409 if already registered)
- `src/components/sections/CookieConsent.jsx` — GDPR banner; calls `setAnalyticsConsent()` from `src/lib/analytics.js`
- `src/lib/analytics.js` — thin wrapper around `window.gtag`; consent-gated; reads `VITE_GA_MEASUREMENT_ID`

Each component has a co-located `.css` file for layout/animation styles that can't be done easily with Tailwind.

### Static legal pages

`/terms`, `/privacy`, `/cookies` are standalone HTML files served from `public/`. Vite dev server rewrites these paths (via a custom plugin in `vite.config.js`); Vercel handles the same rewrites via `vercel.json`.

### API (api/) — Vercel Serverless Functions

- `api/waitlist.js` — handles `POST`; inserts email + consent into Supabase `waitlist` table; optionally forwards to `GOOGLE_SHEETS_WEBHOOK_URL` if set.
- `api/unsubscribe.ts` — handles `GET` (renders confirmation HTML) and `POST` (one-click unsubscribe for email clients). Verifies an HMAC-signed token, then updates `unsubscribed_at` in Supabase `waitlist` table.
- `api/_lib/unsubscribe-token.ts` — signs and verifies tokens using `crypto.createHmac('sha256', secret)` with timing-safe comparison. Token format: `base64url(email).timestamp.hmac_hex`.

The API has no frontend bundling — it runs as Node.js on Vercel's serverless runtime via `@vercel/node`.

## Environment variables

Frontend env vars must be prefixed `VITE_` to be exposed to the browser bundle.

| Variable | Where used | Notes |
|---|---|---|
| `VITE_GA_MEASUREMENT_ID` | `src/lib/analytics.js` | Google Analytics 4 measurement ID |
| `SUPABASE_URL` | `api/waitlist.js`, `api/unsubscribe.ts` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/waitlist.js`, `api/unsubscribe.ts` | Service role key (not anon) — server-side only |
| `UNSUBSCRIBE_SECRET` | `api/unsubscribe.ts` | HMAC secret — **must match** `UNSUBSCRIBE_SECRET` in `oro-newsletter/.env.local` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | `api/waitlist.js` | Optional — forwards signups to a Google Sheets webhook |

In dev, Vite proxies `/api` and `/static` to `https://oro-kmuj.onrender.com` (the central backend). Override with `VITE_BACKEND_URL`.
