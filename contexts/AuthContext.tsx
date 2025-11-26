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
  // Use Better Auth's built-in session hook
  const { data: sessionData, isPending } = useBetterAuthSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user state with Better Auth session
  useEffect(() => {
    if (!isPending) {
      if (sessionData?.user) {
        setUser(sessionData.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [sessionData, isPending]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Login failed');
      }
      
      // Force a manual session fetch after login to ensure user is set
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Manually fetch session after login
      try {
        const sessionResponse = await fetch('/api/auth/get-session', {
          credentials: 'include'
        });
        
        const sessionData = await sessionResponse.json();
        if (sessionData?.user) {
          setUser(sessionData.user);
        }
      } catch (err) {
        // Session fetch failed - user might still be authenticated
        // Let the useSession hook handle this
      }
      
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
