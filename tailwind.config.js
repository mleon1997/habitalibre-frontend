/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#E8EDFF",
          100: "#E8EDFF",
          200: "#C9D5FF",
          300: "#A6BAFF",
          400: "#7D95FF",
          500: "#5776FF",
          600: "#2954FF", // primario
          700: "#1E3EE6",
          800: "#172FB3",
          900: "#142989",
        },
        slateink: {
          900: "#1E293B", // texto principal
          700: "#334155", // subtítulos
          100: "#F1F5F9", // fondos suaves
        },
        success: "#16A34A",
        danger: "#DC2626",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.06)",
        ring: "0 0 0 6px rgba(41,84,255,.15)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1.25rem",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

