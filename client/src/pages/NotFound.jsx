import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-juju-light-bg dark:bg-juju-noir text-juju-light-texte dark:text-juju-texte flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-6">
          <span
            className="text-[8rem] md:text-[10rem] font-medium leading-none bg-gradient-to-br from-juju-violet to-juju-dore bg-clip-text text-transparent"
          >
            404
          </span>
          <Search
            className="absolute -bottom-2 -right-2 text-juju-dore opacity-40"
            size={48}
          />
        </div>
        <h1 className="text-xl md:text-2xl font-medium mb-3">Cette page s'est perdue dans le dressing</h1>
        <p className="text-sm text-juju-light-texte-mute dark:text-juju-texte-mute mb-8">
          La page que tu cherches n'existe pas ou a été déplacée. Pas de panique, ta garde-robe t'attend.
        </p>
        <Link
          to="/garde-robe"
          className="inline-flex items-center gap-2 px-6 py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors"
        >
          <Home size={18} />
          Retour à ma garde-robe
        </Link>
      </div>
    </div>
  );
}