import { LogOut, Mail, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profil() {
  const { user, logout } = useAuth();

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-medium mb-8">Mon profil</h2>

      <div className="space-y-1 mb-8">
        <div className="flex items-center gap-3 p-4 bg-juju-bleu border border-juju-bordure rounded-lg">
          <UserIcon size={18} className="text-juju-dore" />
          <div>
            <p className="text-xs text-juju-texte-mute">Pseudo</p>
            <p className="font-medium">{user?.nom || '—'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-juju-bleu border border-juju-bordure rounded-lg">
          <Mail size={18} className="text-juju-dore" />
          <div>
            <p className="text-xs text-juju-texte-mute">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-juju-bordure text-juju-texte-mute rounded-lg hover:border-red-500 hover:text-red-400 transition-colors"
      >
        <LogOut size={18} />
        Se déconnecter
      </button>
    </div>
  );
}