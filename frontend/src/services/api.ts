import axios from 'axios';

// Detect environment and set API base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🍪 envoie le cookie httpOnly JWT automatiquement
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // 🔍 DEBUG: Log every request with token status
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`   Token present: ${token ? '✅ YES' : '❌ NO'}`);
    
    // 🚨 BUGFIX: Ne PAS ajouter le token sur les routes publiques d'authentification
    const publicRoutes = [
      '/auth/login', 
      '/auth/register', 
      '/auth/register-simple', 
      '/auth/google-login',
      '/auth/create-family',    // ✅ Nouveau endpoint atomique
      '/auth/join-family'       // ✅ Nouveau endpoint atomique
    ];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));
    
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`   ✅ Authorization header added: Bearer ${token.substring(0, 20)}...`);
    } else if (isPublicRoute) {
      console.log(`   ℹ️ Public route - No token added (${config.url})`);
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
      const isOnRegisterPage = currentPath === '/register';

      // 🚨 BUGFIX: Ne PAS rediriger si on vient de s'inscrire ou si on est sur /register
      if (!isOnLoginPage && !isOnRegisterPage) {
        console.warn('⚠️ Erreur 401 - Non autorisé. Déconnexion...');
        console.warn('   Current path:', currentPath);
        console.warn('   Error URL:', error.config?.url);
        
        // Vérifier si c'est une erreur sur une route non-critique (comme family-info)
        const nonCriticalRoutes = ['/auth/family-info', '/events/upcoming', '/persons/tree'];
        const isNonCritical = nonCriticalRoutes.some(route => error.config?.url?.includes(route));
        
        if (!isNonCritical) {
          // Seulement déconnecter si c'est une route critique
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          console.warn('   ℹ️ Route non-critique - Pas de déconnexion');
        }
      } else {
        console.warn('⚠️ Erreur 401 sur la page de connexion/inscription - Pas de redirection');
      }
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // Erreur réseau - ne pas déconnecter, juste logger
      console.error('❌ Erreur réseau - Le backend n\'est peut-être pas démarré');
    }
    return Promise.reject(error);
  }
);

export default api;
