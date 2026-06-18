import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#E6F4EE',
          100: '#C3E4D2',
          200: '#9ED3B4',
          300: '#72C294',
          400: '#4AAF78',
          500: '#1B7A56',
          600: '#145E41',
          700: '#0F4730',
          800: '#092D1E',
          900: '#04160F',
        },
        gold: {
          50:  '#FDF3E3',
          100: '#FAE3BB',
          200: '#F6CF8E',
          300: '#F2BA60',
          400: '#EDA83A',
          500: '#C9922A',
          600: '#9A6D1C',
          700: '#6D4B10',
          800: '#402B07',
          900: '#170F01',
        },
        sand: '#F7F5F0',
        ink:  '#1A1A18',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)',
        green: '0 4px 14px rgba(27,122,86,.3)',
      },
      animation: {
        'fade-in': 'fadeIn .3s ease-out',
        'slide-up': 'slideUp .4s cubic-bezier(.16,1,.3,1)',
        pulse2: 'pulse2 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulse2: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(27,122,86,.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(27,122,86,0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
