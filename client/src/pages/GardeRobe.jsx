import { useAuth } from '../contexts/AuthContext';

export default function GardeRobe() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-juju-noir text-juju-texte p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="juju-wordmark text-3xl text-juju-dore">Juju</h1>
        <button
          onClick={logout}
          className="text-sm text-juju-texte-mute hover:text-juju-dore transition-colors"
        >
          Se déconnecter
        </button>
      </header>

      <div className="max-w-2xl mx-auto text-center mt-20">
        <p className="text-2xl mb-4">
          Bienvenue, <span className="text-juju-dore">{user?.nom || user?.email}</span>
        </p>
        <p className="text-juju-texte-mute">Ta garde-robe va apparaître ici très bientôt.</p>
      </div>
    </div>
  );
}
