/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          darkest: '#08080a',
          darker: '#0e0e12',
          card: '#14141b',
          border: '#232330',
          hover: '#1c1c26',
          muted: '#8b8b9e',
          text: '#f3f4f6',
        },
        netflix: {
          red: '#E50914',
          hover: '#b80710',
          glow: 'rgba(229, 9, 20, 0.4)',
        },
        romantic: {
          pink: '#ff3366',
          rose: '#e11d48',
          glow: 'rgba(255, 51, 102, 0.35)',
          purple: '#9333ea',
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s infinite',
        'heart-beat': 'heartBeat 1.2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        heartBeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.18)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.14)' },
          '70%': { transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
};
