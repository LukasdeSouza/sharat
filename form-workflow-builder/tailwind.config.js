/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          200: '#e8e8e8',
          300: '#d0d0d0',
          400: '#b8b8b8',
          500: '#a0a0a0',
          600: '#1f1f1f',
          700: '#1a1a1a',
          800: '#0f0f0f',
          900: '#000000',
        },
        'notion-bg': '#ffffff',
        'notion-bg-dark': '#f8f8f8',
        'notion-bg-darker': '#f0f0f0',
        'notion-text': '#1111',
        'notion-text-secondary': '#626262',
        'notion-text-tertiary': '#9b9b9b',
        'notion-border': '#e5e5e5',
        'notion-border-dark': '#e0e0e0',
        'notion-accent': '#0f0f0f',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'notion': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
