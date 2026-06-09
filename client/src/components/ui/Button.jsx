import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Bouton standard Juju.
 * variant : primary (défaut) | secondary | gold | ghost | danger | danger-soft
 * size    : sm | md | lg
 * Rendu   : <button> par défaut, <Link> si `to`, <a> si `href`.
 */
const VARIANTS = {
  primary:
    'text-white bg-gradient-violet shadow-violet hover:shadow-violet-lg hover:-translate-y-[3px]',
  secondary:
    'border-[1.5px] border-juju-light-bordure dark:border-juju-bordure bg-juju-light-card dark:bg-juju-bleu/40 text-juju-light-texte dark:text-juju-texte hover:border-juju-violet hover:text-juju-violet dark:hover:border-juju-violet dark:hover:text-white hover:-translate-y-[2px]',
  gold:
    'text-juju-noir bg-gradient-gold shadow-gold hover:-translate-y-[2px] hover:brightness-105',
  ghost:
    'text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-violet dark:hover:text-juju-dore hover:bg-juju-violet/5 dark:hover:bg-juju-dore/10',
  danger:
    'text-white bg-red-500 hover:bg-red-600 shadow-[0_8px_24px_rgba(239,68,68,0.22)] hover:-translate-y-[2px]',
  'danger-soft':
    'border-[1.5px] border-juju-light-bordure dark:border-juju-bordure text-juju-light-texte-mute dark:text-juju-texte-mute hover:border-red-400 hover:text-red-500',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  as,
  to,
  href,
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'group inline-flex items-center justify-center font-semibold rounded-full',
    'transition-all duration-300 ease-bounce select-none whitespace-nowrap',
    'disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');

  const content = (
    <>
      {loading ? (
        <Loader2 size={size === 'lg' ? 20 : 18} className="animate-spin" />
      ) : (
        Icon && <Icon size={size === 'lg' ? 20 : 18} />
      )}
      {children}
      {IconRight && !loading && <IconRight size={size === 'lg' ? 20 : 18} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-disabled={disabled || loading} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  const Tag = as || 'button';
  return (
    <Tag className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </Tag>
  );
}
