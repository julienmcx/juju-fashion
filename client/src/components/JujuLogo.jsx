export default function JujuLogo({ variant = 'or', className = '' }) {
  // 'or'    : pour fonds sombres (app, sidebar, login)
  // 'violet': pour fonds clairs (impression, signature, supports externes)
  const colors = {
    or:     { letters: '#F0E68C', star: '#D8B4FE' },
    violet: { letters: '#B8860B', star: '#5B21B6' },
  }[variant];

  return (
    <svg
      viewBox="0 0 300 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Juju"
    >
      <g transform="translate(70, 80)">
        <text
          x="0"
          y="0"
          fill={colors.letters}
          style={{ fontFamily: "'Playfair Display', Didot, serif", fontSize: 65, fontStyle: 'italic' }}
        >
          J
        </text>
        <text
          x="40"
          y="0"
          fill={colors.letters}
          style={{ fontFamily: "'Playfair Display', Didot, serif", fontSize: 50, fontStyle: 'italic' }}
        >
          u
        </text>
        <text
          x="75"
          y="0"
          fill={colors.letters}
          style={{ fontFamily: "'Playfair Display', Didot, serif", fontSize: 50, fontStyle: 'italic' }}
        >
          ȷ
        </text>
        <text
          x="95"
          y="0"
          fill={colors.letters}
          style={{ fontFamily: "'Playfair Display', Didot, serif", fontSize: 50, fontStyle: 'italic' }}
        >
          u
        </text>
      </g>
      <path
        transform="translate(152, 40) scale(0.8)"
        d="M 0 -10 L 2.24 -3.09 L 9.51 -3.09 L 3.63 1.18 L 5.88 8.09 L 0 3.82 L -5.88 8.09 L -3.63 1.18 L -9.51 -3.09 L -2.24 -3.09 Z"
        fill={colors.star}
      />
    </svg>
  );
}