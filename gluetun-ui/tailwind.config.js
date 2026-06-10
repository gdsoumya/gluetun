/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080d12",
          900: "#0b1117",
          800: "#121a23",
          700: "#18222d",
          600: "#1f2b37",
          500: "#2c3b4a",
          400: "#43576a",
        },
        fog: {
          DEFAULT: "#e6edf3",
          dim: "#8b9bab",
          mute: "#5a6b7b",
        },
        signal: {
          DEFAULT: "#3df0a0",
          dim: "#2bc57f",
          dark: "#0f2c20",
        },
        danger: {
          DEFAULT: "#ff5c5c",
          dark: "#321216",
        },
        warn: {
          DEFAULT: "#ffb454",
          dark: "#2e2210",
        },
        info: {
          DEFAULT: "#53b4ff",
          dark: "#0f2233",
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      keyframes: {
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(61, 240, 160, 0.45)" },
          "70%": { boxShadow: "0 0 0 6px rgba(61, 240, 160, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(61, 240, 160, 0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        "fade-up": "fade-up 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};
