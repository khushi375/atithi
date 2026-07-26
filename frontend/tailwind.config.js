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
        nature: {
          50: '#f4f8f6',
          100: '#e5f0ec',
          200: '#cce1da',
          300: '#a3c8bc',
          400: '#73a797',
          500: '#528c7b',
          600: '#3e7061',
          700: '#325a4f',
          800: '#26443c',
          900: '#1a4335', // Deep Forest Green
          950: '#0d221b',
        },
        gold: {
          50: '#fbf9eb',
          100: '#f5eecc',
          200: '#ebdb99',
          300: '#dec260',
          400: '#d4aa37', // Indian Luxury Saffron/Gold
          500: '#b88d29',
          600: '#9b6f20',
          700: '#7b521b',
          800: '#64421b',
          900: '#54361a',
          950: '#301c0c',
        },
        luxury: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // Premium Dark Background
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.5s infinite ease-in-out',
        'namaste': 'namaste 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(25px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.95' },
        },
        namaste: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-6px) scale(1.03)' }
        }
      }
    },
  },
  plugins: [],
}
