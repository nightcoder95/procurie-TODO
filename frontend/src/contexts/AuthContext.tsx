'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthTokens } from '../types';
import api from '../services/api';

// Shape of the context's value
interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // When the app loads, try to get tokens from localStorage
    const storedTokens = localStorage.getItem('authTokens');
    if (storedTokens) {
      const parsedTokens: AuthTokens = JSON.parse(storedTokens);
      setTokens(parsedTokens);
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile/');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile, logging out.');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (newTokens: AuthTokens) => {
    setTokens(newTokens);
    // Store tokens in localStorage for persistence
    localStorage.setItem('authTokens', JSON.stringify(newTokens));
    await fetchUserProfile();
    router.push('/'); // Redirect to the main page after login
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('authTokens');
    router.push('/login'); // Redirect to login page after logout
  };

  const value = { user, tokens, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
