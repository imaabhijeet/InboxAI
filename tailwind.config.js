/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        grotesk: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        cyber: {
          bg: "#0A0F1E",
          surface: "#0D1B2A",
          border: "#1A2744",
          cyan: "#00E5FF",
          blue: "#2979FF",
          text: "#E8F4FD",
          muted: "#4A6FA5",
          dim: "#2A4A6A",
        },
      },
    },
  },
  plugins: [],
};
