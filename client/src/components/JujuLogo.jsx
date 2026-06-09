/**
 * Wordmark Juju — Fraunces italique + étoile dorée, façon landing.
 * S'adapte au thème : violet sur fond clair, doré sur fond sombre.
 * La taille se règle via `className` (ex. text-3xl, text-5xl).
 */
export default function JujuLogo({ className = '', star = true }) {
  return (
    <span
      className={`juju-wordmark inline-flex items-start leading-none text-juju-violet dark:text-juju-dore ${className}`}
      aria-label="Juju"
      role="img"
    >
      Juju
      {star && (
        <span className="ml-[0.08em] -mt-[0.15em] text-[0.55em] not-italic text-juju-dore dark:text-juju-violet-dark">
          ✦
        </span>
      )}
    </span>
  );
}
