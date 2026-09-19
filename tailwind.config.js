/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Hind Siliguri', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Hind Siliguri', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '1.75rem',
        '5xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 16px -4px rgba(15,23,42,0.06), 0 2px 8px -2px rgba(15,23,42,0.04)',
        'soft-lg': '0 8px 32px -8px rgba(15,23,42,0.10), 0 4px 16px -4px rgba(15,23,42,0.06)',
        'brand': '0 8px 24px -6px rgba(124,58,237,0.35)',
        'brand-lg': '0 16px 40px -10px rgba(124,58,237,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      }
    },
  },
  plugins: [],
}
