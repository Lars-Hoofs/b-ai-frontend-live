'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper om de huidige gebruiker vanaf de backend op te halen via same-origin proxy
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/users/me', {
        credentials: 'include',
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      if (data && data.id) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  // Initieel: kijk of er al een sessie is
  useEffect(() => {
    (async () => {
      await fetchCurrentUser();
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Login failed');
      }
      
      // Even wachten tot cookies gezet zijn en daarna gebruiker ophalen via backend
      await new Promise(resolve => setTimeout(resolve, 200));
      await fetchCurrentUser();
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth moet gebruikt worden binnen een AuthProvider');
  }
  return context;
}
