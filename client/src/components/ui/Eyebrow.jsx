/**
 * Surtitre — petit label majuscule au-dessus d'un titre.
 * Violet (clair) / doré (sombre), étoile dorée décorative.
 */
export default function Eyebrow({ children, star = true, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-juju-violet dark:text-juju-dore ${className}`}
    >
      {star && (
        <span className="text-juju-dore dark:text-juju-violet-dark not-italic">✦</span>
      )}
      {children}
    </span>
  );
}
