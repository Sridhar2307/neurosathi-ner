/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        elder: {
          bg: '#F8FAF9',
          card: '#FFFFFF',
          primary: '#0D9488',     // Soothing Healing Teal
          primaryDark: '#0F766E',
          primaryLight: '#CCFBF1',
          accent: '#F59E0B',      // Warm Amber
          accentLight: '#FEF3C7',
          text: '#134E4A',
          subtext: '#475569',
          border: '#E2E8F0',
          success: '#10B981',
          successLight: '#D1FAE5',
          warning: '#F59E0B',
          danger: '#EF4444',
          dangerLight: '#FEE2E2',
        },
        contrastSepia: {
          bg: '#F5EFEB',
          card: '#FAF6F0',
          text: '#43281C',
          accent: '#8C5338',
          border: '#6F351B',
          btnBg: '#6F351B',
          btnText: '#FFFFFF'
        }
      },
      boxShadow: {
        'soft-3d': '0 10px 25px -5px rgba(13, 148, 136, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'soft-3d-hover': '0 20px 30px -10px rgba(13, 148, 136, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'tactile-btn': '0 6px 0 #0F766E, 0 12px 16px rgba(13, 148, 136, 0.25)',
        'tactile-btn-pressed': '0 2px 0 #0F766E, 0 4px 6px rgba(13, 148, 136, 0.2)',
        'tactile-amber': '0 6px 0 #B45309, 0 12px 16px rgba(245, 158, 11, 0.25)',
        'tactile-amber-pressed': '0 2px 0 #B45309, 0 4px 6px rgba(245, 158, 11, 0.2)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
