import Eyebrow from './Eyebrow';

/**
 * En-tête de page standard : eyebrow + titre Fraunces + sous-titre + actions.
 * `title` accepte du JSX (ex. mot en .accent-italic).
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  align = 'left',
  className = '',
}) {
  const centered = align === 'center';
  return (
    <header className={`mb-8 ${centered ? 'text-center' : ''} ${className}`}>
      <div
        className={`flex gap-4 ${
          actions ? 'items-start justify-between' : centered ? 'flex-col items-center' : 'flex-col'
        }`}
      >
        <div className="min-w-0">
          {eyebrow && (
            <div className={`mb-3 ${centered ? 'flex justify-center' : ''}`}>
              <Eyebrow>{eyebrow}</Eyebrow>
            </div>
          )}
          <h1 className="font-display text-3xl md:text-4xl leading-[1.08] text-juju-light-texte dark:text-juju-texte">
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mt-2.5 text-juju-light-texte-mute dark:text-juju-texte-mute ${
                centered ? 'mx-auto' : ''
              } max-w-xl`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
