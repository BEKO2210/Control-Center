import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shells/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        claw: {
          50: 'var(--claw-50)',
          100: 'var(--claw-100)',
          200: 'var(--claw-200)',
          300: 'var(--claw-300)',
          400: 'var(--claw-400)',
          500: 'var(--claw-500)',
          600: 'var(--claw-600)',
          700: 'var(--claw-700)',
          800: 'var(--claw-800)',
          900: 'var(--claw-900)',
          950: 'var(--claw-950)',
        },
        glass: {
          light: 'var(--glass-light)',
          medium: 'var(--glass-medium)',
          heavy: 'var(--glass-heavy)',
          border: 'var(--glass-border)',
        },
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          elevated: 'var(--surface-elevated)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          glow: 'var(--accent-glow)',
        },
        status: {
          idle: '#6b7280',
          thinking: '#f59e0b',
          building: '#3b82f6',
          reviewing: '#8b5cf6',
          blocked: '#ef4444',
          done: '#10b981',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shell-gradient': 'var(--shell-gradient)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px var(--accent-glow), 0 0 10px var(--accent-glow)' },
          '100%': { boxShadow: '0 0 10px var(--accent-glow), 0 0 20px var(--accent-glow), 0 0 30px var(--accent-glow)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'neon': '0 0 5px var(--accent-glow), 0 0 10px var(--accent-glow)',
      },
    },
  },
  plugins: [],
};

export default config;
