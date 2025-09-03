/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'parroquia': {
          'primary': '#16a34a',
          'secondary': '#eab308',
          'accent': '#2196f3',
          'success': '#4caf50',
          'warning': '#ff9800',
          'error': '#f44336',
          'light-blue': '#e3f2fd',
          'dark-blue': '#0d47a1'
        }
      },
      fontFamily: {
        'sans': ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

