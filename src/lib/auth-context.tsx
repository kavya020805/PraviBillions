'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserProfile } from './supabase/db';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (params: {
    email: string;
    password?: string;
    full_name: string;
    role?: 'admin' | 'citizen';
    family_id?: string;
    district?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsDemo: (role: 'admin' | 'citizen') => Promise<void>;
  isAdmin: boolean;
  isCitizen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password = 'Password@123') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Authentication failed' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  };

  const signup = async (params: {
    email: string;
    password?: string;
    full_name: string;
    role?: 'admin' | 'citizen';
    family_id?: string;
    district?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          password: params.password || 'Citizen@12345',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const loginAsDemo = async (role: 'admin' | 'citizen') => {
    if (role === 'admin') {
      await login('admin@gujarat.gov.in', 'Admin@12345');
      window.location.href = '/';
    } else {
      await login('citizen@gujarat.gov.in', 'Citizen@12345');
      window.location.href = '/families/240100000001';
    }
  };

  const isAdmin = user?.role === 'admin';
  const isCitizen = user?.role === 'citizen';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        loginAsDemo,
        isAdmin,
        isCitizen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
