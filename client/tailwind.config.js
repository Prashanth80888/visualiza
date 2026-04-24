/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-end Slate & Indigo Palette
        slate: {
          950: '#030712',
          900: '#0f172a',
        },
        primary: {
          light: '#818cf8', // Indigo 400
          DEFAULT: '#6366f1', // Indigo 500
          dark: '#4f46e5', // Indigo 600
        },
        accent: {
          purple: '#a855f7',
          cyan: '#06b6d4',
          emerald: '#10b981',
          orange: '#f97316',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3.5rem', // For those smooth "Command Center" corners
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'neural': '0 20px 50px rgba(79, 70, 229, 0.15)', // Custom Indigo glow
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
        'marquee2': 'marquee2 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee2: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      letterSpacing: {
        'tightest': '-.06em',
        'widest-xl': '0.8em', // For those futuristic headers
      },
    },
  },
  plugins: [],
}