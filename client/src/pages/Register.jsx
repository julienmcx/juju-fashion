import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoOr from '../assets/juju-logo-or.svg';


export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nom, setNom] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, motDePasse, nom);
      navigate('/garde-robe');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-juju-noir text-juju-texte px-6">
      <div className="w-full max-w-sm">
        <img src={logoOr} alt="Juju" className="mx-auto mb-4" />
        <p className="text-juju-texte-mute text-center mb-10">Crée ton dressing virtuel.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-juju-texte-mute mb-1">Pseudo</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-3 bg-juju-bleu border border-juju-bordure rounded-lg text-juju-texte focus:outline-none focus:border-juju-dore transition-colors"
            />
          </div>

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
              minLength={8}
              className="w-full px-4 py-3 bg-juju-bleu border border-juju-bordure rounded-lg text-juju-texte focus:outline-none focus:border-juju-dore transition-colors"
            />
            <p className="text-xs text-juju-texte-mute mt-1">8 caractères minimum</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-juju-dore text-juju-noir font-medium rounded-lg hover:bg-juju-dore-clair transition-colors disabled:opacity-50"
          >
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-juju-texte-mute text-sm mt-8">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-juju-dore hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}