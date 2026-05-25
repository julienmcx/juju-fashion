import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-juju-noir text-juju-texte">
      <Sidebar />
      <main className="md:ml-60 pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}