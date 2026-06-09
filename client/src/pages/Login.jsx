import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import JujuLogo from '../components/JujuLogo';
import { Button, Eyebrow, Input } from '../components/ui';

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
    <div className="app-bg min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden text-juju-light-texte dark:text-juju-texte">
      <div aria-hidden className="app-blob -top-24 -right-16 w-80 h-80 blur-3xl bg-juju-dore/15 dark:bg-juju-dore/10 animate-drift" />
      <div aria-hidden className="app-blob -bottom-24 -left-16 w-96 h-96 blur-3xl bg-juju-violet/15 dark:bg-juju-violet/25 animate-drift-rev" />

      <div className="w-full max-w-sm relative z-[1] animate-fade-up">
        <div className="text-center mb-7">
          <JujuLogo className="text-5xl mb-5" />
          <div className="mb-3 flex justify-center">
            <Eyebrow>Bon retour</Eyebrow>
          </div>
          <h1 className="font-display text-3xl mb-2">
            Ravie de te <span className="accent-italic">revoir</span>
          </h1>
          <p className="text-juju-light-texte-mute dark:text-juju-texte-mute">
            Connecte-toi à ton dressing.
          </p>
        </div>

        <div className="rounded-2xl bg-juju-light-card/80 dark:bg-juju-bleu/40 backdrop-blur border border-juju-light-bordure dark:border-juju-bordure shadow-card p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="toi@exemple.com"
            />
            <Input
              label="Mot de passe"
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" fullWidth loading={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </div>

        <p className="text-center text-juju-light-texte-mute dark:text-juju-texte-mute text-sm mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-juju-violet dark:text-juju-dore font-semibold hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
