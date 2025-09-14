/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0,0,0,0.1)',
        'card-hover': '0 10px 30px rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [],
}