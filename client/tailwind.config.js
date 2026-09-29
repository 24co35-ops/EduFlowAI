/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ibm: {
          blue: '#0f62fe',
          darkBlue: '#0043ce',
          purple: '#8a3ffc',
          cyan: '#1192e8',
          teal: '#009d9a'
        },
        stationery: {
          ground: '#EFE9DD',
          groundSec: '#E5DED0',
          ink: '#141C2B',
          inkSec: '#4A5364',
          muted: '#767E8C',
          blue: '#2C4A8F',
          hairline: 'rgba(20,28,43,0.16)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        newsreader: ['Newsreader', 'Georgia', 'serif'],
        typewriter: ['"Courier Prime"', 'Courier', 'monospace']
      }
    },
  },
  plugins: [],
}
