/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx}", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: {
          50: "#f8f7ff",
          100: "#f0eeff",
          200: "#e3e0ff",
          300: "#c4bfff",
          400: "#a59dff",
          500: "#8b7cf6",
          600: "#7c5ce7",
          700: "#6c3dd1",
          800: "#5a2db5",
          900: "#4a2494",
        },
        dark: {
          50: "#e4e4e7",
          100: "#c8c8cf",
          200: "#a1a1aa",
          300: "#71717a",
          400: "#52525b",
          500: "#3f3f46",
          600: "#2e2e35",
          700: "#1e1e24",
          800: "#141418",
          900: "#09090b",
          950: "#050507",
        },
        accent: {
          primary: "#8b5cf6",
          secondary: "#6366f1",
          tertiary: "#a78bfa",
          glow: "rgba(139, 92, 246, 0.3)",
        },
        success: "#22c55e",
        danger: "#ef4444",
        warning: "#f59e0b",
      },
    },
  },
  plugins: [],
};
