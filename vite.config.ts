import { defineConfig } from "vite-plus";

// Astro owns dev/build/preview; Vite+ owns linting and formatting.
export default defineConfig({
  lint: {
    // astro check handles TypeScript diagnostics, including virtual Astro modules.
    categories: {
      correctness: "error",
    },
    ignorePatterns: ["dist/**", ".astro/**", ".netlify/**"],
  },
  fmt: {
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "all",
    astro: {
      compressHTML: "html",
    },
    ignorePatterns: [
      "dist/**",
      ".astro/**",
      ".netlify/**",
      ".agents/**",
      ".augment/**",
      ".kiro/**",
      ".claude/**",
      "drizzle/**",
      "pnpm-lock.yaml",
      "skills-lock.json",
    ],
  },
});
