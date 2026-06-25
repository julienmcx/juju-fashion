import { NavLink } from 'react-router-dom';
import { Shirt, UserSquare, User, LogOut, Sparkles, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import JujuLogo from './JujuLogo';
import Button from './ui/Button';

const navItems = [
  { to: '/garde-robe', icon: Shirt, label: 'Garde-robe' },
  { to: '/mannequin', icon: UserSquare, label: 'Mannequin' },
  { to: '/essayages', icon: Sparkles, label: 'Mes essayages', beta: true },
  { to: '/profil', icon: User, label: 'Profil' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col z-20 px-4 py-7 bg-juju-light-bg/80 dark:bg-juju-noir/70 backdrop-blur-xl border-r border-juju-light-bordure dark:border-juju-bordure">
      <div className="px-2 mb-8">
        <a href="/" aria-label="Retour à l'accueil" className="inline-block">
          <JujuLogo className="text-[2rem]" />
        </a>
      </div>
      <Button to="/ajout" icon={Camera} fullWidth className="mb-6">
        Ajouter un article
      </Button>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, icon: Icon, label, beta }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive
                ? 'bg-juju-violet/10 dark:bg-juju-dore/10 text-juju-violet dark:text-juju-dore font-semibold'
                : 'text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-light-texte dark:hover:text-juju-texte hover:bg-juju-light-bordure/50 dark:hover:bg-juju-bleu-clair/40'
              }`
            }
          >
            <Icon size={19} strokeWidth={2} />
            <span className="flex-1">{label}</span>
            {beta && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-juju-violet/15 text-juju-violet dark:bg-juju-dore/15 dark:text-juju-dore">
                bêta
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-juju-light-bordure dark:border-juju-bordure pt-4 mt-4">
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mb-2.5 px-1 truncate">
          {user?.email}
        </p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-red-500 transition-colors px-1"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
