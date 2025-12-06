import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // 🔍 DEBUG: Log every request with token status
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`   Token present: ${token ? '✅ YES' : '❌ NO'}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`   Authorization header: Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log(`   ⚠️ No token found in localStorage!`);
    }
    
    // ⚠️ Définir Content-Type uniquement si ce n'est pas FormData
    // Pour FormData, axios le définira automatiquement avec le boundary correct
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
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
