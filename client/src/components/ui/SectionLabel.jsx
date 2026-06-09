/**
 * Petit label de section majuscule (Jakarta, pas Fraunces).
 * Remplace les anciens `h2.text-xs.uppercase.tracking-widest`.
 */
export default function SectionLabel({ as: Tag = 'h2', children, icon: Icon, className = '' }) {
  return (
    <Tag
      className={`flex items-center gap-1.5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-juju-light-texte-mute dark:text-juju-texte-mute ${className}`}
    >
      {Icon && <Icon size={13} className="text-juju-dore" />}
      {children}
    </Tag>
  );
}
