import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#061426',
        midnight: '#061426',
        ink: '#071426',
        sky: '#c9962b',
        blue: '#0b2d4d',
        ice: '#fffdf8',
        muted: '#5c6b7a',
        gold: '#c9962b',
        mint: '#587d58',
        cream: '#fbf8f1'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      },
      boxShadow: {
        glow: '0 0 55px rgba(201,150,43,.20)',
        card: '0 24px 80px rgba(6,20,38,.18)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(6,20,38,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(6,20,38,.035) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
export default config;
