/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-black': '#0A0A0A',
        'panel-dark': '#121212',
        'card-dark': '#1F1F1F',
        'electric-blue': '#3A8DFF',
        'teal-accent': '#1FD1A4',
        'success-green': '#10B981',
        'warning-amber': '#F59E0B',
        'danger-red': '#EF4444',
        'text-light': '#D1D5DB'
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '12': '12px',
      },
      transitionDuration: {
        '200': '200ms',
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out',
      }
    },
  },
  plugins: [],
}