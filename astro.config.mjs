// @ts-check
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://virtusway.com",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: netlify(),
  redirects: {
    '/exploracion': 'https://outlook.office.com/bookwithme/user/48d235d03a08496b97d4b477ea665fbb@virtusway.com/meetingtype/l9E3R2UjHUaYl4B09FL6MQ2?anonymous&ep=mlink',
  },
});
