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
  const { data: sessionData, isPending, error: sessionError } = useBetterAuthSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('[Auth] Session state:', {
      isPending,
      hasSessionData: !!sessionData,
      hasUser: !!sessionData?.user,
      isLoggingIn,
      loading,
      sessionError: sessionError?.message,
    });
  }, [sessionData, isPending, isLoggingIn, loading, sessionError]);

  // Sync user state met Better Auth session
  useEffect(() => {
    // Wacht tot de session check klaar is
    if (isPending) {
      console.log('[Auth] Session still pending...');
      return;
    }

    // Als we aan het inloggen zijn, wacht tot de session data binnenkomt
    if (isLoggingIn) {
      if (sessionData?.user) {
        console.log('[Auth] Login complete, user found:', sessionData.user.email);
        setUser(sessionData.user as any);
        setIsLoggingIn(false);
        setLoading(false);
      }
      // Blijf wachten als we inloggen maar nog geen user hebben
      return;
    }

    // Normale sync na page load of refresh
    if (sessionData?.user) {
      console.log('[Auth] Session user found:', sessionData.user.email);
      setUser(sessionData.user as any);
    } else {
      console.log('[Auth] No session user found');
      setUser(null);
    }
    setLoading(false);
  }, [sessionData, isPending, isLoggingIn]);

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
      setIsLoggingIn(true);

      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        setIsLoggingIn(false);
        throw new Error(response.error.message || 'Login failed');
      }

      // Manually set user to update UI immediately and prevent redirect issues
      if (response.data?.user) {
        setUser(response.data.user as any);
        setLoading(false);
      }

      // Better Auth zal de sessie-cookie zetten; de useSession-hook pakt dit automatisch op.
      return response;
    } catch (error) {
      setIsLoggingIn(false);
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
