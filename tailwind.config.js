/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', '"Noto Serif SC"', '"Songti SC"', 'ui-serif', 'serif'],
        ui: ['Geist', '"PingFang SC"', '"Noto Sans SC"', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
