import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Ajoute automatiquement le token JWT à chaque requête sortante
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('juju_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si le serveur renvoie 401 (token expiré ou invalide), on déconnecte
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('juju_token');
      // Force un reload pour réinitialiser l'état
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;