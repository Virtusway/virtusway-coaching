// @ts-check
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

const NOINDEX_PATHS = [
  "/descargar-guia",
  "/revocar-consentimiento",
  "/legal/aviso-legal",
  "/legal/compromiso-etico",
  "/legal/politica-cookies",
  "/legal/politica-privacidad",
];

// https://astro.build/config
export default defineConfig({
  // Astro 7 defaults to JSX whitespace rules; preserve spaces between inline elements.
  compressHTML: true,
  site: "https://virtusway.com",
  integrations: [
    sitemap({
      filter: (page) =>
        !NOINDEX_PATHS.some((path) => new URL(page).pathname.replace(/\/$/, "") === path),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: netlify(),
  redirects: {
    '/exploracion': 'https://outlook.office.com/bookwithme/user/48d235d03a08496b97d4b477ea665fbb@virtusway.com/meetingtype/l9E3R2UjHUaYl4B09FL6MQ2?anonymous&ep=mlink',
  },
  env: {
    // Not validateSecrets: true — these are only read inside on-demand API
    // routes (prerender = false), not during the static build, and Netlify
    // may not inject them at build time. Astro still validates them lazily
    // the first time each is imported at request time.
    schema: {
      DATABASE_URL: envField.string({ context: "server", access: "secret" }),
      EMAIL_USER: envField.string({ context: "server", access: "secret" }),
      EMAIL_PASS: envField.string({ context: "server", access: "secret" }),
    },
  },
});
