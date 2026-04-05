/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0c10',
          2: '#111318',
          3: '#191c23',
          4: '#1e2229',
        },
        accent: {
          DEFAULT: '#e8547a',
          2: '#f0748e',
          bg: 'rgba(232,84,122,0.12)',
          border: 'rgba(232,84,122,0.3)',
        },
        gold: { DEFAULT: '#f5c842', bg: 'rgba(245,200,66,0.1)' },
        teal: { DEFAULT: '#2dd4bf', bg: 'rgba(45,212,191,0.1)' },
        sblue: { DEFAULT: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
        danger: { DEFAULT: '#f87171', bg: 'rgba(248,113,113,0.1)' },
        warn: { DEFAULT: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
        success: { DEFAULT: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
        txt: {
          DEFAULT: '#e8eaf0',
          2: '#8b909e',
          3: '#555b6a',
        },
        brd: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          2: 'rgba(255,255,255,0.12)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
      },
    },
  },
  plugins: [],
};
