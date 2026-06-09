import { NavLink } from 'react-router-dom';
import { Shirt, UserSquare, User, Sparkles, Camera } from 'lucide-react';

const left = [
  { to: '/garde-robe', icon: Shirt, label: 'Dressing' },
  { to: '/mannequin', icon: UserSquare, label: 'Mannequin' },
];
const right = [
  { to: '/essayages', icon: Sparkles, label: 'Essayages' },
  { to: '/profil', icon: User, label: 'Profil' },
];

function TabItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 py-1 transition-colors ${
          isActive
            ? 'text-juju-violet dark:text-juju-dore'
            : 'text-juju-light-texte-mute dark:text-juju-texte-mute'
        }`
      }
    >
      <Icon size={22} strokeWidth={1.9} />
      <span className="text-[10px] font-semibold">{label}</span>
    </NavLink>
  );
}

export default function BottomTabBar() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-juju-light-bg/90 dark:bg-juju-noir/85 backdrop-blur-xl border-t border-juju-light-bordure dark:border-juju-bordure">
      <div className="grid grid-cols-5 items-center px-1 pt-2 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
        {left.map((t) => (
          <TabItem key={t.to} {...t} />
        ))}

        {/* FAB central : Ajouter */}
        <div className="flex justify-center">
          <NavLink
            to="/ajout"
            aria-label="Ajouter un article"
            className="-mt-8 w-14 h-14 rounded-full bg-gradient-violet text-white shadow-violet flex items-center justify-center border-4 border-juju-light-bg dark:border-juju-noir active:scale-95 transition-transform"
          >
            <Camera size={24} />
          </NavLink>
        </div>

        {right.map((t) => (
          <TabItem key={t.to} {...t} />
        ))}
      </div>
    </nav>
  );
}
