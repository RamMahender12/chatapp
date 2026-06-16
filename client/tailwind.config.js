/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
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
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient":
          "linear-gradient(135deg, #0f0f1a 0%, #1a1025 25%, #0f172a 50%, #1a0f2e 75%, #0f0f1a 100%)",
        "glow-gradient":
          "radial-gradient(circle at center, rgba(139,92,246,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 30px rgba(139, 92, 246, 0.15)",
        "glow-lg": "0 0 60px rgba(139, 92, 246, 0.2)",
        "glow-sm": "0 0 15px rgba(139, 92, 246, 0.1)",
        glass:
          "0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "glass-sm":
          "0 4px 16px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.03)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};
