/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        panel: "0 18px 45px -24px rgba(9, 32, 77, 0.45)"
      }
    }
  },
  plugins: []
};
