/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00D4FF',
        secondary: '#7C3AED',
        accent: '#06B6D4',
        background: '#0A0E27',
        surface: '#1A1F3D',
        surfaceHover: '#242A4D',
        textPrimary: '#FFFFFF',
        textSecondary: '#A0AEC0',
        textMuted: '#718096',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'wave': 'wave 10s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-reverse': 'spin-reverse 3s linear infinite',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'wave': {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(-25%) translateY(-10px)' },
          '100%': { transform: 'translateX(-50%) translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { 'box-shadow': '0 0 40px rgba(0, 212, 255, 0.6)' },
        },
        'spin-reverse': {
          'to': { transform: 'rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
};
