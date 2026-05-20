import type { Config } from "tailwindcss";

// Brand tokens sourced from Phase 2 Artifact 1 §9 (eCommerce Texas Brand
// System v2 + SkyFire Energy Brand Guidelines 2026). One accent, one
// trust color — everything else is a value of black or white. Whitespace
// is the second design tool.

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aperture identity (trust)
        navy: "#256370",
        // CTA / single accent
        burnt: "#D65E1D",
        // Editorial / dark anchors
        near: "#040406",
        charcoal: "#2D2D2D",
        // Metadata / co-mark text
        ash: "#57514C",
        // Surfaces
        soft: "#F9F9F9",
        silver: "#C8C8C8",
        // Reserved (not active in v1 chat UI)
        warmBrown: "#37302C",
      },
      fontFamily: {
        // Section titles, Aperture wordmark
        playfair: ["var(--font-playfair)", "Playfair Display", "serif"],
        // Body, UI, all conversation text — DM Sans per A1 §9
        sans: ["var(--font-dm-sans)", "DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      // Body type spec from A1 §9: 10.5pt, 1.55 line-height, 60-75 chars
      lineHeight: {
        body: "1.55",
      },
      maxWidth: {
        prose: "70ch",
      },
    },
  },
  plugins: [],
};

export default config;
