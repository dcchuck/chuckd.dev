/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ["Fredoka One"]
      },
      colors: {
        'seafoamgreen': '#99f6e4'
      }
    },
  },
  plugins: [],
}
