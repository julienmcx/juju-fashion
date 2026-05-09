import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement de l'app, on regarde si un token existe et on récupère le profil
  useEffect(() => {
    const token = localStorage.getItem('juju_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('juju_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, mot_de_passe) => {
    const { data } = await apiClient.post('/auth/login', { email, mot_de_passe });
    localStorage.setItem('juju_token', data.token);
    setUser(data.user);
  };

  const register = async (email, mot_de_passe, nom) => {
    const { data } = await apiClient.post('/auth/register', { email, mot_de_passe, nom });
    localStorage.setItem('juju_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('juju_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}