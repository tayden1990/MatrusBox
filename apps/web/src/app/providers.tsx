'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  );
}

// Lightweight Auth Context for display name and user
type AuthUser = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  [k: string]: any;
} | null;

interface AuthContextValue {
  user: AuthUser;
  displayName: string | null;
  setUser: (u: AuthUser) => void;
  refreshFromStorage: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const computeDisplay = (u: any): string | null => {
    if (!u) return null;
    if (u.firstName) return `${u.firstName}${u.lastName ? ' ' + u.lastName : ''}`;
    return u.email || null;
  };

  const refreshFromStorage = React.useCallback(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        setDisplayName(computeDisplay(parsed));
      } else {
        setUser(null);
        setDisplayName(null);
      }
    } catch {
      setUser(null);
      setDisplayName(null);
    }
  }, []);

  useEffect(() => {
    refreshFromStorage();
  }, [refreshFromStorage]);

  return (
    <AuthContext.Provider value={{ user, displayName, setUser, refreshFromStorage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}