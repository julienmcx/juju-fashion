import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoOr from '../assets/juju-logo-or.svg';
import JujuLogo from '../components/JujuLogo';


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, motDePasse);
      navigate('/garde-robe');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-juju-noir text-juju-texte px-6">
      <div className="w-full max-w-sm">
        <JujuLogo className="h-24 mx-auto mb-2" />
        <p className="text-juju-texte-mute text-center mb-10">Heureux de te revoir.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-juju-texte-mute mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-juju-bleu border border-juju-bordure rounded-lg text-juju-texte focus:outline-none focus:border-juju-dore transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-juju-texte-mute mb-1">Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              className="w-full px-4 py-3 bg-juju-bleu border border-juju-bordure rounded-lg text-juju-texte focus:outline-none focus:border-juju-dore transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-juju-texte-mute text-sm mt-8">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-juju-dore hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}