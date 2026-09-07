/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#16324A",
        navyDeep: "#0E2436",
        paper: "#F7F5EF",
        amber: "#E8A33D",
        amberDeep: "#C9821F",
        green: "#2F7A4F",
        greenLight: "#E7F2EA",
        rust: "#C1502E",
        rustLight: "#FBEAE4",
        ink: "#1A1A1A",
        inkSoft: "#5B6572",
        line: "#E4E0D4",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
