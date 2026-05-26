import { NavLink } from 'react-router-dom';
import { Shirt, Camera, UserSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import JujuLogo from './JujuLogo';

const navItems = [
  { to: '/garde-robe', icon: Shirt, label: 'Garde-robe' },
  { to: '/ajout', icon: Camera, label: 'Ajouter' },
  { to: '/mannequin', icon: UserSquare, label: 'Mannequin' },
  { to: '/profil', icon: User, label: 'Profil' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-juju-light-bg dark:bg-juju-bleu/40 border-r border-juju-light-bordure dark:border-juju-bordure px-5 py-8 z-10">
      <div className="mb-10">
        <JujuLogo className="h-14 w-auto" />
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${isActive
                  ? 'bg-juju-light-bordure/50 dark:bg-juju-bleu-clair text-juju-dore'
                  : 'text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-light-texte dark:hover:text-juju-texte hover:bg-juju-light-bordure/30 dark:hover:bg-juju-bleu-clair/50'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-juju-light-bordure dark:border-juju-bordure pt-4 mt-4">
        <p className="text-xs text-juju-light-texte-mute dark:text-juju-texte-mute mb-2 truncate">{user?.email}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-juju-light-texte-mute dark:text-juju-texte-mute hover:text-juju-dore transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
