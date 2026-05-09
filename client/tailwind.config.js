/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Direction Artistique Juju
        'juju-noir': '#0A0A0F',      // fond profond
        'juju-bleu': '#0F1538',       // surfaces (cards, modals)
        'juju-bleu-clair': '#1A2155', // surfaces hover
        'juju-violet': '#5E2D91',     // accent secondaire
        'juju-dore': '#D4AF37',       // accent principal (CTA)
        'juju-dore-clair': '#E5C158',
        'juju-texte': '#F5F0E8',      // texte principal (un peu chaud)
        'juju-texte-mute': '#A19FB0', // texte secondaire
        'juju-bordure': '#2A2F5C',    // séparateurs
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};