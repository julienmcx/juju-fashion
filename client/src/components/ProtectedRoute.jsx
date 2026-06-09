import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import JujuLogo from './JujuLogo';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-bg min-h-screen flex flex-col items-center justify-center gap-5 text-juju-light-texte dark:text-juju-texte">
        <JujuLogo className="text-4xl animate-pulse" />
        <Loader2 size={22} className="animate-spin text-juju-violet dark:text-juju-dore" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
