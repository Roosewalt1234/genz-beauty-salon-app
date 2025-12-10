/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './constants.ts',
  ],
  theme: {
    extend: {
      colors: {
        'rose-pink': '#E91E63',
        'lavender-purple': '#9C27B0',
        primary: '#E91E63',
        secondary: '#9C27B0',
        'light-pink': '#FCE4EC',
        'light-purple': '#F3E5F5',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
