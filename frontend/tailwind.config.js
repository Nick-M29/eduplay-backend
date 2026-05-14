/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f7fe',
          100: '#e0effd',
          200: '#bae0fa',
          300: '#7dc8f6',
          400: '#38abef',
          500: '#2484df',
          600: '#1665b6',
          700: '#125193',
          800: '#10457a',
          900: '#0e3964',
        },
        secondary: {
          50: '#f5fbf2',
          100: '#e7f7e0',
          200: '#cceec0',
          300: '#a6e095',
          400: '#81c14b',
          500: '#67a338',
          600: '#50812b',
          700: '#3e6323',
          800: '#33501f',
          900: '#2b421b',
        }
      }
    },
  },
  plugins: [],
}
