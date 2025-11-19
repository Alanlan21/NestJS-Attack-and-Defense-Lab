/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0e27',
          darker: '#050814',
          blue: '#00d4ff',
          purple: '#7b68ee',
          red: '#ff2e63',
          green: '#00ff88',
        },
      },
    },
  },
  plugins: [],
};
