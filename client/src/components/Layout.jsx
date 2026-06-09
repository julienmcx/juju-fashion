import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';

export default function Layout({ children }) {
  return (
    <div className="app-bg min-h-screen text-juju-light-texte dark:text-juju-texte relative overflow-x-hidden">
      {/* Blobs ambiants animés (cachés en reduced-motion via index.css) */}
      <div
        aria-hidden
        className="app-blob hidden md:block -top-32 -right-24 w-[420px] h-[420px] blur-3xl bg-juju-dore/10 dark:bg-juju-dore/[0.07] animate-drift"
      />
      <div
        aria-hidden
        className="app-blob top-1/2 -left-32 w-[460px] h-[460px] blur-3xl bg-juju-violet/10 dark:bg-juju-violet/20 animate-drift-rev"
      />

      <Sidebar />
      <main className="md:ml-64 pb-28 md:pb-0 min-h-screen relative z-[1]">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
