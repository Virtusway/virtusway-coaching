# Code Review — VirtusWay Coaching

Reviewed: 2026-07-18 · Scope: full repo (`src/`, `public/`, config). Overall the codebase is clean, small, and well-structured: strict TypeScript, sensible Drizzle schema, HTML-escaping in emails, enumeration-safe API responses, and good accessibility touches (aria-live, sr-only labels, reduced-motion support). The findings below are ordered by priority.

---

## High priority

### 1. `/api/lead-magnet` has no abuse protection
`src/pages/api/lead-magnet.ts` sends an email to any address posted to it, with no rate limiting, honeypot, or CAPTCHA. Anyone can script POSTs to:

- Email-bomb arbitrary victims through your Office365 account (the recipient is attacker-controlled).
- Burn your SMTP sender reputation / get `coach@virtusway.com` flagged as spam.
- Fill the `lead_magnet_registrations` table with junk rows.

**Suggestions (in increasing effort):**
- Add a honeypot field (hidden input; reject if filled) — cheap and catches most bots.
- Add rate limiting per IP (Netlify has [rate limiting rules](https://docs.netlify.com/security/rate-limiting/), or use `lastRequestedAt` in the DB to throttle repeat sends per email, e.g. max 1 email per address per 10 minutes).
- Consider double opt-in: send a confirmation link first, only mark consent granted after the click. This is also stronger footing for GDPR consent evidence.

### 2. Email links are built from the request Host header
`src/pages/api/lead-magnet.ts:185-187` builds `downloadUrl` and `revokeUrl` with `new URL(path, request.url)`. If the platform ever forwards a spoofed `Host`/`X-Forwarded-Host`, an attacker could submit a victim's email and have a legitimate VirtusWay email deliver links pointing at an attacker-controlled domain (phishing). Netlify normally normalizes this, but there's no reason to depend on it.

**Suggestion:** build absolute URLs from a canonical origin constant (`https://virtusway.com`, or `Astro.site` / an env var) instead of `request.url`.

### 3. English word in Spanish copy
`src/pages/mujeres-profesionales.astro:46`:

> "la coherencia entre lo que sientes **and** lo que haces"

Should be "y". This is user-visible on a live marketing page.

### 4. robots.txt rules don't match real URLs; gated pages are indexable
- `public/robots.txt` disallows `/legal/aviso-legal.html` etc., but Astro serves these pages **without** the `.html` extension (`/legal/aviso-legal`). The Disallow rules never match, so the legal pages are crawlable despite the intent to exclude them.
- `/descargar-guia` (the "you got the email" download page) and `/revocar-consentimiento` have no `noindex` and are included in the generated sitemap. Google can index the download page, making the email gate pointless and surfacing token-bearing revoke URLs in analytics/referrers.

**Suggestions:**
- Fix robots.txt paths (drop `.html`) or, better, rely on meta robots.
- Add a `noindex` option to `Layout.astro` (`<meta name="robots" content="noindex" />`) and set it on `descargar-guia`, `revocar-consentimiento`, and the legal pages.
- Exclude those pages from the sitemap via the integration's `filter` option in `astro.config.mjs`.

---

## Medium priority

### 5. Booking URL is hardcoded in 5 places
The long Outlook `bookwithme` URL is duplicated in `Header.astro:50`, `Footer.astro:60`, `Hero.astro:59`, `FinalCTA.astro:27`, and `LandingPage.astro:61` — plus the `/exploracion` redirect in `astro.config.mjs`. If the meeting link ever changes (new meeting type, new mailbox), six files must be edited and it's easy to miss one.

**Suggestion:** you already have the `/exploracion` redirect — use `href="/exploracion"` everywhere (also gives you a trackable, readable URL), or export the constant from a shared `src/lib/constants.ts`. Same for `coach@virtusway.com` and the social URLs in the email template.

### 6. Anyone can revoke consent for any email
`src/pages/api/revoke-consent.ts` (email branch) revokes without verifying ownership. The response is enumeration-safe (good), but a third party who knows a subscriber's address can silently unsubscribe them. Impact is low (worst case: someone stops receiving marketing), and it's arguably GDPR-friendly, but it's worth a conscious decision. If you care, send a "confirm your revocation" email instead of revoking directly.

### 7. Env handling: validate secrets with `astro:env`
`EMAIL_USER`, `EMAIL_PASS` (`lead-magnet.ts:124-125`) and `DATABASE_URL` (`db/client.ts:9`) are read ad hoc from `import.meta.env`, and `drizzle.config.ts:9` uses a non-null assertion (`process.env.DATABASE_URL!`) that would fail confusingly if unset. Astro's `astro:env` schema (`envField` + `getSecret`) gives you startup validation and typed access, and makes required secrets self-documenting.

### 8. Lead magnet form is dead without JavaScript
`src/components/LeadMagnet.astro`: the `<form>` has no `action`/`method` and the submit button ships `disabled` in the HTML. With JS disabled the button never enables and the form cannot be submitted at all (unlike the download page, which has a `<noscript>` fallback).

**Suggestion:** add `action="/api/lead-magnet" method="post"` as a baseline, remove the hardcoded `disabled` (the inline script already sets it on load via `updateSubmitAvailability()`), and let the JS `preventDefault` path take over when available. The endpoint would need a non-JSON response (redirect to `/descargar-guia`-style confirmation) when the request isn't `fetch`-initiated, or you can accept the degradation but at least keep the button clickable so native validation messages appear.

### 9. Fonts: legacy formats, no preload
`src/styles/global.css:9-23` loads `hoss-round-wide-light.otf` (40 KB) and `nexa-regular.ttf` (148 KB). Both fonts are render-critical (Nexa is the body font, Hoss the hero display font).

**Suggestions:**
- Convert both to WOFF2 (typically 50–70% smaller; universal browser support).
- Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` for both in `Layout.astro` to avoid late discovery (CSS must load before the fonts are even requested).

### 10. No security headers
There's no `public/_headers` or `netlify.toml` defining headers. Consider adding at minimum:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

A CSP is also feasible (the site has a couple of inline scripts, so you'd need `'unsafe-inline'` for scripts or a refactor — even a CSP limited to `frame-ancestors`, `object-src`, and `base-uri` is a win).

---

## Low priority / polish

### 11. Duplicated helpers across API routes
`EMAIL_PATTERN`, `readField`, and `jsonMessage` are copy-pasted in both `lead-magnet.ts` and `revoke-consent.ts`. Extract to `src/lib/api-utils.ts` (or similar) so validation stays consistent.

### 12. The gated PDF is fully public
`public/Virtusway_Valores_v4-1.pdf` (4.4 MB) is served statically; the email step is trivially bypassable by anyone who guesses/shares the URL. Probably acceptable for a lead magnet — just be aware the "consent in exchange for the PDF" trade is honor-system. If it matters, serve the download through an endpoint that checks a short-lived token from the email.

### 13. README is still the Astro starter template
`README.md` says "Astro Starter Kit: Basics". Replace with real docs: required env vars (`DATABASE_URL`, `EMAIL_USER`, `EMAIL_PASS`), how to run migrations (`db:generate` / `db:migrate`), and deploy notes. Right now none of the runtime requirements are written down anywhere.

### 14. No linting, formatting, or type-check in the build
There's no ESLint/Prettier config and `build` doesn't run `astro check`. Suggested:

```jsonc
"scripts": {
  "check": "astro check",
  "build": "astro check && astro build"
}
```

(`astro check` requires adding `@astrojs/check` + `typescript` as dev deps.) Prettier with `prettier-plugin-astro` and `prettier-plugin-tailwindcss` would also keep the long class lists consistent.

### 15. Social/meta polish
- `Layout.astro:40-44` uses `property="twitter:*"`; the Twitter/X spec uses `name="twitter:*"`. Most crawlers tolerate both, but `name` is the correct attribute.
- The OG image is `personal-image.jpeg` (a portrait). For link previews a 1200×630 branded card would render much better than a cropped portrait.
- `descargar-guia.astro` and `revocar-consentimiento.astro` could pass `noindex` (see finding 4).

### 16. Minor code notes
- `src/components/Header.astro:87`: `document.getElementById` runs in a module script — fine on first load, but if you ever adopt Astro view transitions, this and the `Layout.astro` reveal script will need `astro:page-load` listeners.
- `src/layouts/Layout.astro:8`: `schemaMarkup?: Record<string, any>` — `Record<string, unknown>` keeps strict typing without effort.
- `src/pages/api/revoke-consent.ts:58-66`: the GET handler only bounces `?token=` back to the page that already reads `?token=` from its own URL; the email links point at the page directly, so this endpoint appears unused. Either point email links here (single entry point) or delete it.
- `src/components/LandingPage.astro:114-129`: the `hook.split(/(?<=[.?!])\s+/)` display logic silently drops sentences beyond the second if a `hook` ever contains three; both current hooks have exactly two, but a comment or a `parts.slice(1).join(" ")` would make it robust.

---

## What's already good (no action needed)

- **XSS hygiene:** `escapeHtml` on URLs interpolated into email HTML; `set:html` only receives hardcoded literals, never user input.
- **Unsubscribe tokens:** 32 random bytes via `crypto.randomBytes`, unique-indexed, format-validated (`/^[a-f0-9]{64}$/i`) before hitting the DB, and preserved across re-registration so old email links keep working.
- **Enumeration safety:** revoke-by-email always answers "if that email was registered…".
- **GDPR bookkeeping:** consent granted/revoked timestamps, explicit consent checkbox required server-side, revocation page linked from the consent label and every email.
- **Accessibility:** `aria-live` status regions, `sr-only` labels, `prefers-reduced-motion` handling, decorative elements marked `aria-hidden`.
- **DB layer:** lazy singleton client, upsert with `onConflictDoUpdate`, timezone-aware timestamps.
