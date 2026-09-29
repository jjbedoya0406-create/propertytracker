/// <reference types="vitest/config" />
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves this as a project site at
// https://jjbedoya0406-create.github.io/propertytracker/, so the build needs
// that subpath baked into asset URLs. Local dev keeps serving from root.
const REPO_BASE = "/propertytracker/";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? REPO_BASE : "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      // Default globPatterns doesn't include font files — confirmed by
      // inspecting the built dist/sw.js precache list directly, which
      // silently omitted every font (issue #25's own explicit
      // requirement: "include the font files in the service worker
      // cache"). This was already true for the old Inter font too; not
      // new to this change, just never verified before now.
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}"],
      },
      manifest: {
        name: "Property Expense Tracker",
        short_name: "Expense Tracker",
        description: "Capture and track rental property expenses and receipts.",
        // Ink design system, issue #25 — matches --ink/--page in
        // src/index.css.
        theme_color: "#12233A",
        background_color: "#FFFFFF",
        display: "standalone",
        // Relative (no leading slash) so vite-plugin-pwa resolves these
        // against `base` — a leading slash would point at the domain root
        // instead of the /propertytracker/ subpath.
        start_url: "./",
        // Portal Monogram (issue #34) — source at
        // assets-src/portal-monogram.svg, generated to these sizes with
        // a scratch Node+sharp script (not a project dependency). Drawn
        // with an inner safe zone, so "any maskable" is accurate for
        // both sizes rather than needing a separate maskable-only asset.
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
}));
