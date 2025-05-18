import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  User, 
  getCurrentUser, 
  login as loginService, 
  logout as logoutService,
  register as registerService
} from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await loginService({ email, password });
      setCurrentUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutService();
    setCurrentUser(null);
  };

  const register = async (name: string, email: string, password: string, phone: string) => {
    try {
      setLoading(true);
      await registerService({ name, email, password, phone });
      // Login after successful registration
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    login,
    logout,
    register,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
