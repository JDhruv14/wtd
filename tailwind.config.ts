import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      transitionDuration: {
        "250": "250ms",
      },
      keyframes: {
        progress: {
          "0%": { transform: "scaleX(0)" },
          "50%": { transform: "scaleX(0.7)" },
          "100%": { transform: "scaleX(1)" }
        },
        wiggle: {
          "0%,100%": { transform: "translate(0)" },
          "20%,60%": { transform: "translate(-6px)" },
          "40%,80%": { transform: "translate(6px)" }
        },
        bounceSpring: {
          "0%": { transform: "scale(0.8)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" }
        },
        springPop: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "60%": { transform: "scale(1.15)" },
          "80%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideUpFade: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        entryReveal: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        progress: "progress 2s ease-in-out infinite",
        wiggle: "wiggle 0.4s ease-in-out",
        bounceSpring: "bounceSpring 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        springPop: "springPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        fadeInUp: "fadeInUp 0.35s ease-out forwards",
        slideUpFade: "slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        entryReveal: "entryReveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
