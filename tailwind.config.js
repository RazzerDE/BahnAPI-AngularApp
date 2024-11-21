/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      maxHeight: {
        '60vh': '60vh',
        '30vh': '30vh',
        '40vh': '40vh',
        '42vh': '42vh',
        '22vh': '22vh',
        '12vh': '12vh',
      },
    },
    colors: {
      primary: {
        600: '#e02424',
        700: '#c31313'
      }
    },
  },
  variants: {
    extend: {
      maxHeight: ['responsive'],
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
}

