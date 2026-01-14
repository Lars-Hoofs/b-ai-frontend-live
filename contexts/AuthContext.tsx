'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authClient, useSession as useBetterAuthSession } from '@/lib/auth-client';

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
  // Gebruik Better Auth's ingebouwde session hook als bron van waarheid
  const { data: sessionData, isPending } = useBetterAuthSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user state met Better Auth session
  useEffect(() => {
    if (!isPending) {
      if (sessionData?.user) {
        setUser(sessionData.user as any);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [sessionData, isPending]);

  // Luister naar auth:logout events van de API client
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
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

      // Manually set user to update UI immediately and prevent redirect issues
      if (response.data?.user) {
        setUser(response.data.user as any);
      }

      // Better Auth zal de sessie-cookie zetten; de useSession-hook pakt dit automatisch op.
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
