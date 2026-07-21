# VirtusWay Coaching

Marketing site for VirtusWay (coaching integrativo), built with [Astro](https://astro.build), Tailwind CSS, and a Neon Postgres database via Drizzle ORM. Deployed to Netlify with the SSR adapter (pages are static; the lead-magnet and consent-revocation API routes run on-demand).

## Requirements

- Node.js ≥ 22.12.0
- pnpm (see `packageManager` in `package.json`)
- A Neon (or other Postgres-compatible) database
- An Office365/Outlook mailbox for sending the lead-magnet email

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable       | Description                                                              |
| -------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string (Neon), used by Drizzle and `drizzle-kit`.     |
| `EMAIL_USER`   | Office365 SMTP account (`coach@virtusway.com`) used to send guide emails. |
| `EMAIL_PASS`   | Password/app password for `EMAIL_USER`.                                   |

These are only read at request time inside `src/pages/api/*` (not during the static build), so the build itself doesn't need them — but the deployed site does. Set them as environment variables in the Netlify site settings.

## Commands

All commands run from the project root:

| Command             | Action                                                    |
| -------------------- | ---------------------------------------------------------- |
| `pnpm install`       | Install dependencies                                       |
| `pnpm dev`           | Start the local dev server at `localhost:4321`              |
| `pnpm check`         | Type-check the project with `astro check`                   |
| `pnpm build`         | Type-check, then build the production site to `./dist/`     |
| `pnpm preview`       | Preview the production build locally                        |
| `pnpm db:generate`   | Generate a Drizzle migration from `src/db/schema.ts`         |
| `pnpm db:migrate`    | Apply pending migrations to `DATABASE_URL`                   |

## Database

The schema lives in `src/db/schema.ts` (currently a single `lead_magnet_registrations` table tracking guide downloads and commercial-consent state). After changing the schema, run `pnpm db:generate` to create a migration in `drizzle/`, then `pnpm db:migrate` to apply it.

## Deploy

The site deploys to Netlify via `@astrojs/netlify`. Push to the connected branch, or run a Netlify build with `DATABASE_URL`, `EMAIL_USER`, and `EMAIL_PASS` set in the site's environment variables.
