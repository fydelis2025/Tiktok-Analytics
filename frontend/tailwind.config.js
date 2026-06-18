/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",      // ✅ Onde estão as páginas
    "./components/**/*.{js,jsx,ts,tsx}", // ✅ Onde estão os componentes
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        tiktok: {
          black: '#010101',
          red: '#FE2C55',
          cyan: '#25F4EE',
          gray: '#161616'
        }
      }
    },
  },
  plugins: [],
}