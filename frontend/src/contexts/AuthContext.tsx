import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ needsFamilyOnboarding?: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('user');
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);
      
      // ASP.NET Core sérialise en camelCase par défaut
      const responseData = response.data as any;
      const token = responseData.token || responseData.Token;
      const userData = responseData.user || responseData.User;
      const needsFamilyOnboarding = responseData.needsFamilyOnboarding || responseData.NeedsFamilyOnboarding || false;
      
      if (!token || !userData) {
        console.error('Token or user missing:', { token, userData, fullResponse: response.data });
        throw new Error('Réponse invalide du serveur');
      }
      
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch { /* storage quota exceeded — session still works in memory */ }
      setUser(userData);

      // 🚀 Retourner le flag pour le Smart Redirect Flow
      return { needsFamilyOnboarding };
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Échec de la connexion. Vérifiez vos identifiants.';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout'); // efface le cookie httpOnly côté serveur
    } catch { /* silencieux si déjà expiré */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
