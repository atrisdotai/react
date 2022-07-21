const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Work Sans', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        xs: '0.7rem',
        sm: '0.85rem',
        base: '0.925rem',
      },
    },
  },
  plugins: [],
}
