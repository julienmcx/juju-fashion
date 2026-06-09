import { Link } from 'react-router-dom';

/**
 * Carte standard Juju — rounded-2xl (20px), ombre douce.
 * hover : true → soulèvement + bord doré + ombre colorée (cartes cliquables).
 * accent : 'violet' | 'gold' (couleur du bord au survol). Défaut : gold.
 * Rendu : <div>, ou <Link> si `to`.
 */
export default function Card({
  hover = false,
  accent = 'gold',
  to,
  className = '',
  children,
  ...rest
}) {
  const accentBorder =
    accent === 'violet'
      ? 'hover:border-juju-violet/60'
      : 'hover:border-juju-dore/70';

  const classes = [
    'rounded-2xl bg-juju-light-card dark:bg-juju-bleu/40',
    'border border-juju-light-bordure dark:border-juju-bordure shadow-card',
    hover
      ? `transition-all duration-300 ease-bounce hover:-translate-y-1.5 hover:shadow-card-hover ${accentBorder}`
      : '',
    className,
  ].join(' ');

  if (to) {
    return (
      <Link to={to} className={`block ${classes}`} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
