import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LegalLayout({ title, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-juju-light-bg dark:bg-juju-noir text-juju-light-texte dark:text-juju-texte">
      <header className="border-b border-juju-light-bordure dark:border-juju-bordure">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link to="/" className="text-xl font-medium italic">
            Juju<span className="text-juju-dore not-italic"> ✦</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore transition-colors"
          >
            <ArrowLeft size={16} /> Accueil
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-medium mb-2">{title}</h1>
        {lastUpdated && (
          <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-10">
            Dernière mise à jour : {lastUpdated}
          </p>
        )}
        <div className="space-y-8 leading-relaxed text-juju-light-texte dark:text-juju-texte">
          {children}
        </div>
      </main>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-lg md:text-xl font-medium mb-3 text-juju-dore">{title}</h2>
      <div className="space-y-3 text-sm md:text-base text-juju-light-texte-mute dark:text-juju-texte-mute">
        {children}
      </div>
    </section>
  );
}