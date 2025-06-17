/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    'w-12',
    'h-16',
    'w-9',
    'h-12',
  ]
}
