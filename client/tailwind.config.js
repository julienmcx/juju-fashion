/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {        'juju-noir': '#0A0A0F',
        'juju-bleu': '#0F1538',
        'juju-bleu-clair': '#1A2155',
        'juju-violet': '#5E2D91',
        'juju-dore': '#D4AF37',
        'juju-dore-clair': '#E5C158',
        'juju-texte': '#F5F0E8',
        'juju-texte-mute': '#A19FB0',
        'juju-bordure': '#2A2F5C',
        'juju-light-bg': '#FAFAFE',
        'juju-light-card': '#FFFFFF',
        'juju-light-bordure': '#E8E5F0',
        'juju-light-texte': '#0F0820',
        'juju-light-texte-mute': '#6B5B8A',
        'juju-light-dore': '#D4AF37',
        'juju-light-violet': '#7C3AED',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};