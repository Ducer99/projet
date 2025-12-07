import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();
  
  // 🚨 BUGFIX: Vérifier AUSSI le localStorage en cas de décalage avec le contexte
  // Cela arrive juste après l'inscription quand le contexte n'est pas encore à jour
  const hasToken = !!localStorage.getItem('token');
  const hasUser = !!localStorage.getItem('user');
  const isAuthenticatedWithLocalStorage = hasToken && hasUser;
  
  const shouldAllowAccess = isAuthenticated || isAuthenticatedWithLocalStorage;
  
  if (!shouldAllowAccess) {
    console.warn('🔒 PrivateRoute: Access denied - Redirecting to login');
    console.warn('   Context isAuthenticated:', isAuthenticated);
    console.warn('   LocalStorage hasToken:', hasToken);
    console.warn('   LocalStorage hasUser:', hasUser);
  }
  
  return shouldAllowAccess ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
