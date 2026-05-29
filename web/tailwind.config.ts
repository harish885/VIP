import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface
        bg: 'rgb(var(--bg) / <alpha-value>)',
        'bg-1': 'rgb(var(--bg-1) / <alpha-value>)',
        'bg-2': 'rgb(var(--bg-2) / <alpha-value>)',
        'bg-3': 'rgb(var(--bg-3) / <alpha-value>)',
        // Text
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--ink-soft) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        'text-dim': 'rgb(var(--text-dim) / <alpha-value>)',
        'text-faint': 'rgb(var(--text-faint) / <alpha-value>)',
        // Accents
        gold: {
          DEFAULT: 'rgb(var(--gold) / <alpha-value>)',
          soft: 'rgb(var(--gold-2) / <alpha-value>)',
        },
        cyan: {
          DEFAULT: 'rgb(var(--cyan) / <alpha-value>)',
          soft: 'rgb(var(--cyan-2) / <alpha-value>)',
        },
        purple: {
          DEFAULT: 'rgb(var(--purple) / <alpha-value>)',
          soft: 'rgb(var(--purple-2) / <alpha-value>)',
        },
        green: {
          DEFAULT: 'rgb(var(--green) / <alpha-value>)',
          soft: 'rgb(var(--green-2) / <alpha-value>)',
        },
        red: 'rgb(var(--red) / <alpha-value>)',
        amber: 'rgb(var(--amber) / <alpha-value>)',
        orange: 'rgb(var(--orange) / <alpha-value>)',
        blue: 'rgb(var(--blue) / <alpha-value>)',
        // Capital tokens
        'cap-fin': 'rgb(var(--cap-fin) / <alpha-value>)',
        'cap-tech': 'rgb(var(--cap-tech) / <alpha-value>)',
        'cap-human': 'rgb(var(--cap-human) / <alpha-value>)',
        'cap-rel': 'rgb(var(--cap-rel) / <alpha-value>)',
        // Borders
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-2': 'rgb(var(--line-2) / <alpha-value>)',
        'line-faint': 'rgb(var(--line-faint) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'ui-serif', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        'eyebrow': '0.16em',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scroll-cue': 'scroll-cue 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'flow': 'flow 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
        'scroll-cue': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '50%': { transform: 'scaleY(1)', transformOrigin: 'top' },
          '51%': { transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
        },
        'flow': {
          '0%, 100%': { transform: 'translateX(0)', opacity: '0.4' },
          '50%': { transform: 'translateX(6px)', opacity: '1' },
        },
      },
      backdropBlur: {
        glass: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
