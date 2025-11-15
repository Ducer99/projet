import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne déconnecter que si c'est une vraie erreur 401 d'authentification
    // Pas sur les erreurs réseau (ECONNREFUSED, Network Error, etc.)
    if (error.response?.status === 401) {
      // Éviter les boucles de redirection infinies
      const currentPath = window.location.pathname;
      const isOnLoginPage = currentPath === '/login';

      if (!isOnLoginPage) {
        console.warn('⚠️ Erreur 401 - Non autorisé. Déconnexion...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.warn('⚠️ Erreur 401 sur la page de connexion - Pas de redirection');
      }
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // Erreur réseau - ne pas déconnecter, juste logger
      console.error('❌ Erreur réseau - Le backend n\'est peut-être pas démarré');
    }
    return Promise.reject(error);
  }
);

export default api;
