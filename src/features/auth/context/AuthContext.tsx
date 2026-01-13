import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, LoginCredentials } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: Omit<LoginCredentials, 'app'>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REQUIRED_DEPT = 'TIT00302';
const AUTH_STORAGE_KEY = 'monitoring_app_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: Omit<LoginCredentials, 'app'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await authApi.login({ ...credentials, app: 'ems' });

      // Access Control Rule
      if (userData.dept !== REQUIRED_DEPT) {
        setError('You do not have permission to access this application. Please contact your system administrator.');
        return;
      }

      setUser(userData);
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
