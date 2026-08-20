/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060B16',
          900: '#0A0F1D',
          850: '#0F172A',
          800: '#15203B',
          700: '#1E293B',
          600: '#334155',
        },
        mars: {
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          glow: 'rgba(234, 88, 12, 0.35)',
        },
        earth: {
          400: '#38BDF8',
          500: '#0284C7',
          600: '#0369A1',
          glow: 'rgba(2, 132, 199, 0.35)',
        },
        spacegold: {
          400: '#FBBF24',
          500: '#F59E0B',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit-spin': 'spin 60s linear infinite',
        'radar-sweep': 'radar 4s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
