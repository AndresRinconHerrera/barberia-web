/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#faf8f4',
          100: '#f4efe7',
          200: '#e9e0d2',
          300: '#d9cab4',
          400: '#c4ad8a',
          500: '#a8855f',
          600: '#8a6a4a',
          700: '#6f543c',
          800: '#5a4434',
          900: '#4a392d',
        },
        forest: {
          50: '#f0f5f1',
          100: '#d9e6dc',
          200: '#b3cdb8',
          300: '#84ab8c',
          400: '#588562',
          500: '#3a6645',
          600: '#2b5035',
          700: '#23402b',
          800: '#1d3324',
          900: '#162820',
        },
        ink: '#1c1a17',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 1.2s ease both',
        'scale-in': 'scale-in 1s cubic-bezier(0.22,1,0.36,1) both',
        float: 'float 7s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
};
