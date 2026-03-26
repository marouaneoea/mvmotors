/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#e3c35a',
          500: '#c9a227',
          600: '#a88620',
        },
        dark: {
          900: '#050505',
          800: '#0a0a0a',
          700: '#141414',
          600: '#1a1a1a',
          500: '#2a2a2a',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
