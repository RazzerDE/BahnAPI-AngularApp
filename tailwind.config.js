/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
    colors: {
      primary: {
        600: '#e02424',
        700: '#c31313'
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
}

