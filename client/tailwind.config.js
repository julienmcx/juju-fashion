/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ----- Sombre -----
        'juju-noir': '#0A0A0F',
        'juju-bleu': '#0F1538',
        'juju-bleu-clair': '#1A2155',
        'juju-bordure': '#2A2F5C',
        'juju-texte': '#F5F0E8',
        'juju-texte-mute': '#A19FB0',
        // ----- Clair (signature) -----
        'juju-light-bg': '#FAFAFE',
        'juju-light-card': '#FFFFFF',
        'juju-light-bordure': '#E8E5F0',
        'juju-light-texte': '#0F0820',
        'juju-light-texte-mute': '#6B5B8A',
        // ----- Accents -----
        'juju-violet': '#7C3AED',
        'juju-violet-dark': '#9333EA',
        'juju-violet-deep': '#6D28D9',
        'juju-violet-soft': 'rgba(124, 58, 237, 0.14)',
        'juju-dore': '#D4AF37',
        'juju-dore-clair': '#E5C158',
        // alias historiques
        'juju-light-dore': '#D4AF37',
        'juju-light-violet': '#7C3AED',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        violet: '0 8px 24px rgba(124, 58, 237, 0.25)',
        'violet-lg': '0 14px 36px rgba(124, 58, 237, 0.40)',
        'violet-sm': '0 8px 20px rgba(124, 58, 237, 0.30)',
        gold: '0 8px 24px rgba(212, 175, 55, 0.28)',
        soft: '0 4px 20px rgba(15, 8, 32, 0.06)',
        card: '0 2px 16px rgba(15, 8, 32, 0.05)',
        'card-hover': '0 20px 40px rgba(124, 58, 237, 0.13)',
      },
      borderRadius: {
        '2xl': '1.25rem', // 20px — cartes
        '3xl': '1.75rem',
      },
      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundImage: {
        'gradient-violet': 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
        'gradient-violet-deep': 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #E5C158 100%)',
        'gradient-violet-gold': 'linear-gradient(135deg, #7C3AED 0%, #D4AF37 100%)',
        'gradient-gold-violet': 'linear-gradient(135deg, #E5C158 0%, #7C3AED 100%)',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(40px, -30px) scale(1.1)' },
        },
        'drift-rev': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-40px, 30px) scale(1.12)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'word-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        drift: 'drift 18s ease-in-out infinite',
        'drift-rev': 'drift-rev 22s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'word-in': 'word-in 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
    },
  },
  plugins: [],
};
