/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        // The full one-line nav fits comfortably from 1100px up; below that
        // the compact hamburger menu takes over so labels never wrap.
        nav: '1100px',
        // Very small phones: hide the header subtitle so the action buttons
        // never push past the viewport edge.
        xs: '360px',
      },
      fontFamily: {
        bengali: ['"Hind Siliguri"', 'sans-serif'],
      },
      colors: {
        forest: {
          DEFAULT: '#175c46',
          dark: '#104b38',
          light: '#1f7a5d',
          surface: '#eff8ec',
          subtle: '#e4f3df',
        },
        surface: {
          light: '#f7f9f8',
          card: '#ffffff',
          dark: '#0e1513',
          darkCard: '#182420',
          darkElevated: '#1f2e29',
        },
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'soft': '0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        'soft-xl': '0 20px 35px -6px rgba(15, 23, 42, 0.1), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
        'forest': '0 8px 24px -4px rgba(23, 92, 70, 0.25)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
