/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f6f3',
          100: '#ede9e0',
          200: '#d9d0bf',
          300: '#c0b09a',
          400: '#a68e73',
          500: '#8c7158',
          600: '#735a44',
          700: '#5c4535',
          800: '#3d2d22',
          900: '#1e1612',
          950: '#100c09',
        },
        parchment: '#faf8f3',
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23faf8f3'/%3E%3Crect x='0' y='0' width='1' height='1' fill='%23f0ece3' opacity='0.5'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typewriter': 'typewriter 2s steps(40) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'paper': '0 2px 8px rgba(30, 22, 18, 0.08), 0 0 0 1px rgba(30, 22, 18, 0.04)',
        'paper-lg': '0 8px 32px rgba(30, 22, 18, 0.12), 0 0 0 1px rgba(30, 22, 18, 0.06)',
        'ink': 'inset 0 0 0 2px rgba(30, 22, 18, 0.15)',
      },
    },
  },
  plugins: [],
};
