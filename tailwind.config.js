/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        acc: {
          DEFAULT: '#7a3ff2',
          light: '#c9b0fb',
          bg: '#efe8fe',
          hover: '#682ee0',
        },
        ink: '#1c1c21',
        mute: '#8a8d98',
        line: '#e6e7eb',
        pb: '#eceef1',
        key: '#f5a524',
        playhead: '#f2385a',
        dark: {
          top: '#0c0c0e',
          panel: '#16171b',
          card: '#1e2024',
          hover: '#2c2e35',
          border: '#303137',
        }
      },
      fontFamily: {
        sans: ['Golos Text', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
