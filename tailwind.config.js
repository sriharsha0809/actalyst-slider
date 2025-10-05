/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f9ff',
          100: '#e9f1ff',
          200: '#cfe0ff',
          300: '#a9c6ff',
          400: '#7aa4ff',
          500: '#4c82ff',
          600: '#2c65f7',
          700: '#1f4fd6',
          800: '#1c43ad',
          900: '#1b3b8b',
        },
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
