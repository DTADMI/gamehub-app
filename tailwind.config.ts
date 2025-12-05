import type { Config } from "tailwindcss";

// Tailwind v4 config with shadcn-style design tokens mapped to CSS variables.
// This ensures utilities like bg-card, text-card-foreground, border-border, ring, etc. are valid
// and fixes many of the Tailwind lint warnings shown in Code Analysis.
const config: Config = {
  darkMode: "class",
  content: [
    // Frontend sources
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",

    // Local packages (games + libs)
    "./games/**/*.{ts,tsx}",
    "./libs/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Design tokens (shadcn/ui compatible)
      colors: {
        // Core semantic tokens mapped to CSS variables (defined in globals.css)
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",

        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        // Brand palette from requirements (kept for direct usage where needed)
        emerald: {
          600: "#059669",
          700: "#047857",
        },
        indigo: {
          600: "#4F46E5", // royal blue
          700: "#4338CA",
        },
        amber: {
          500: "#F59E0B", // royal gold / accent
        },
        auburn: {
          600: "#A52A2A",
        },
        purple: {
          800: "#3B0A45", // dark purple
        },
        orange: {
          700: "#C2410C", // dark orange
        },
      },
    },
  },
  safelist: [
    // A few dynamic classes we toggle in template strings
    "bg-emerald-600",
    "bg-emerald-700",
    "bg-gray-200",
    "bg-gray-300",
    "dark:bg-gray-700",
    "dark:bg-gray-600",
    "text-gray-900",
    "dark:text-gray-100",
    "size-14",
    // Common dynamic utilities seen in components and tests
    "backdrop-blur",
    "bg-white/70",
    "dark:bg-gray-900/60",
    "ring-2",
    "outline",
    "outline-2",
  ],
} as Config;

export default config;
