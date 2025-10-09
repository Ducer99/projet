import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
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
      // Vérifier si ce n'est pas juste le backend qui n'est pas démarré
      console.warn('⚠️ Erreur 401 - Non autorisé. Déconnexion...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // Erreur réseau - ne pas déconnecter, juste logger
      console.error('❌ Erreur réseau - Le backend n\'est peut-être pas démarré');
    }
    return Promise.reject(error);
  }
);

export default api;
