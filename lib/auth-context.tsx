"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: User | null, token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const tokenData = JSON.parse(atob(storedToken));

        if (tokenData.exp && tokenData.exp > Date.now()) {
          setUserState(userData);
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const setUser = (newUser: User | null, newToken: string | null) => {
    setUserState(newUser);
    setToken(newToken);

    if (newUser && newToken) {
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', newToken);
    }
  };

  const logout = () => {
    setUserState(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
