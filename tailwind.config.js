/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        holo: {
          gold: {
            DEFAULT: '#ffaa00',
            hot: '#ffdd55',
            deep: '#ff7700',
            bright: '#fff0aa',
            core: '#ffbb33',
          },
          purple: {
            DEFAULT: '#aa44ff',
            hot: '#dd88ff',
            deep: '#7722dd',
            bright: '#f0c0ff',
            core: '#bb77ff',
          },
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
}
