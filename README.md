# VirtusWay Coaching

Marketing site for VirtusWay (coaching integrativo), built with [Astro](https://astro.build), Tailwind CSS, and a Neon Postgres database via Drizzle ORM. Deployed to Netlify with the SSR adapter (pages are static; the lead-magnet and consent-revocation API routes run on-demand).

## Requirements

- Node.js 22.18+, 24.11+, or 26+ (matching Vite+'s supported versions; Node 24 LTS recommended)
- pnpm (see `packageManager` in `package.json`)
- A Neon (or other Postgres-compatible) database
- An Office365/Outlook mailbox for sending the lead-magnet email

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable       | Description                                                               |
| -------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string (Neon), used by Drizzle and `drizzle-kit`.     |
| `EMAIL_USER`   | Office365 SMTP account (`coach@virtusway.com`) used to send guide emails. |
| `EMAIL_PASS`   | Password/app password for `EMAIL_USER`.                                   |

These are only read at request time inside `src/pages/api/*` (not during the static build), so the build itself doesn't need them — but the deployed site does. Set them as environment variables in the Netlify site settings.

## Commands

All commands run from the project root:

| Command             | Action                                                     |
| ------------------- | ---------------------------------------------------------- |
| `pnpm install`      | Install dependencies                                       |
| `pnpm dev`          | Start the local dev server at `localhost:4321`             |
| `pnpm check`        | Check formatting, lint, then type-check with `astro check` |
| `pnpm lint`         | Lint with Oxlint through Vite+; fail on warnings           |
| `pnpm lint:fix`     | Apply safe Oxlint fixes                                    |
| `pnpm format`       | Format source and project configuration with Oxfmt         |
| `pnpm format:check` | Check formatting without writing files                     |
| `pnpm test:tooling` | Verify lint/format failures, fixes, and repeatability      |
| `pnpm build`        | Type-check, then build the production site to `./dist/`    |
| `pnpm preview`      | Preview the production build locally                       |
| `pnpm db:generate`  | Generate a Drizzle migration from `src/db/schema.ts`       |
| `pnpm db:migrate`   | Apply pending migrations to `DATABASE_URL`                 |

## Code quality

[Vite+](https://viteplus.dev/guide/local-cli) is installed locally and supplies compatible,
pinned versions of Oxlint and Oxfmt. No global `vp` installation is required: use the scripts
above or `pnpm exec vp check`, `pnpm exec vp lint`, and `pnpm exec vp fmt`.
Run `pnpm exec vp toolchain` to inspect the installed tool versions.

The `lint` and `fmt` blocks in `vite.config.ts` are the shared configuration. Formatting
covers TypeScript, JavaScript, Astro templates (including frontmatter, scripts, and styles),
CSS, JSON, YAML, and Markdown. Astro formatting uses `@astrojs/compiler-rs` and matches
`compressHTML: true` in `astro.config.mjs`. Generated output, database migrations, lockfiles,
and vendored agent skills are excluded from formatting.

Oxlint checks JavaScript and TypeScript, including `<script>` blocks in `.astro` files.
`astro check` remains responsible for Astro templates, frontmatter, and TypeScript diagnostics.
Astro continues to own development, builds, preview, and Netlify integration; this setup does
not replace Astro's Vite dependency. You can also run project scripts with `pnpm exec vp run dev`
or `pnpm exec vp run build`.

Install the recommended **Oxc** VS Code extension for formatting and lint fixes on save.
The Astro extension remains enabled for Astro language support.

Before opening a PR, run:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test:tooling
pnpm build
```

GitHub Actions runs the same checks on Node 22 and 24 for every PR and push to `main`.
`test:tooling` creates temporary TypeScript, Astro, and CSS fixtures, confirms deliberate
lint/format violations fail, formats them, verifies they pass, and checks a second format
does not change them. The fixtures are removed afterward. Neither CI nor the static build
requires database or SMTP credentials.

## Database

The schema lives in `src/db/schema.ts` (currently a single `lead_magnet_registrations` table tracking guide downloads and commercial-consent state). After changing the schema, run `pnpm db:generate` to create a migration in `drizzle/`, then `pnpm db:migrate` to apply it.

## Deploy

The site deploys to Netlify via `@astrojs/netlify`. Push to the connected branch, or run a Netlify build with `DATABASE_URL`, `EMAIL_USER`, and `EMAIL_PASS` set in the site's environment variables.
