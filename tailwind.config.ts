import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bhumi: {
          DEFAULT: "#2958B1",
          dark: "#1E4085",
          light: "#EAF0FA",
        },
        ink: "#1E1E1E",
        muted: "#667085",
        line: "#E4E7EC",
        canvas: "#F6F8FB",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Arial", "sans-serif"],
      },
      maxWidth: {
        site: "1320px",
      },
      keyframes: {
        "soft-rise": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scroll-cue": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(4px)" },
        },
      },
      animation: {
        "soft-rise": "soft-rise 650ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "scroll-cue": "scroll-cue 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
