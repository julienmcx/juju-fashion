import { NavLink } from 'react-router-dom';
import { Shirt, Camera, UserSquare, User } from 'lucide-react';

const tabs = [
  { to: '/garde-robe', icon: Shirt, label: 'Garde-robe' },
  { to: '/ajout', icon: Camera, label: 'Ajouter' },
  { to: '/mannequin', icon: UserSquare, label: 'Mannequin' },
  { to: '/profil', icon: User, label: 'Profil' },
];

export default function BottomTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-juju-bleu/95 backdrop-blur-md border-t border-juju-light-bordure dark:border-juju-bordure z-10">
      <div className="grid grid-cols-4 pt-2 pb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-juju-dore' : 'text-juju-light-texte-mute dark:text-juju-texte-mute'
                }`
              }
            >
              <Icon size={22} strokeWidth={isActive => isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}