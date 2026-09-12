import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; education?: string; experience_level?: string; year?: string; department?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('futurehub_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('futurehub_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.me();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('futurehub_user', JSON.stringify(res.user));
      }
    } catch {
      localStorage.removeItem('futurehub_token');
      localStorage.removeItem('futurehub_user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      refreshUser();
    };

    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if (res.success) {
      localStorage.setItem('futurehub_token', res.token);
      localStorage.setItem('futurehub_user', JSON.stringify(res.user));
      setUser(res.user);
    }
  };

  const register = async (data: { email: string; password: string; name: string; education?: string; experience_level?: string; year?: string; department?: string }) => {
    const res = await api.auth.register(data);
    if (res.success) {
      localStorage.setItem('futurehub_token', res.token);
      localStorage.setItem('futurehub_user', JSON.stringify(res.user));
      setUser(res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('futurehub_token');
    localStorage.removeItem('futurehub_user');
    setUser(null);
    try {
      api.auth.logout();
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
