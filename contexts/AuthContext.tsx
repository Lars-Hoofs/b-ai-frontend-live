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
  const { data: sessionData, isPending, error: sessionError, refetch } = useBetterAuthSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [logoutTriggered, setLogoutTriggered] = useState(false);

  // Debug logging (alleen in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Session state:', {
        isPending,
        hasSessionData: !!sessionData,
        hasUser: !!sessionData?.user,
        isLoggingIn,
        loading,
        sessionError: sessionError?.message,
      });
    }
  }, [sessionData, isPending, isLoggingIn, loading, sessionError]);

  // ✅ Session refresh interval - houdt sessie actief
  useEffect(() => {
    if (!sessionData?.user) return;

    // Ververs sessie elke 5 minuten om te voorkomen dat deze verloopt
    const refreshInterval = setInterval(() => {
      console.log('[Auth] Refreshing session...');
      refetch?.();
    }, 5 * 60 * 1000); // 5 minuten

    return () => clearInterval(refreshInterval);
  }, [sessionData?.user, refetch]);

  // ✅ Ververs sessie wanneer gebruiker terugkeert naar de pagina
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && sessionData?.user) {
        console.log('[Auth] Tab became visible, refreshing session...');
        refetch?.();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionData?.user, refetch]);

  // Sync user state met Better Auth session
  useEffect(() => {
    // Wacht tot de session check klaar is
    if (isPending) {
      return;
    }

    // Als we aan het inloggen zijn, wacht tot de session data binnenkomt
    if (isLoggingIn) {
      if (sessionData?.user) {
        console.log('[Auth] Login complete, user found:', sessionData.user.email);
        setUser(sessionData.user as any);
        setIsLoggingIn(false);
        setLoading(false);
        setLogoutTriggered(false);
      }
      // Blijf wachten als we inloggen maar nog geen user hebben
      return;
    }

    // Normale sync na page load of refresh
    if (sessionData?.user) {
      setUser(sessionData.user as any);
      setLogoutTriggered(false);
    } else if (!logoutTriggered) {
      // ✅ Alleen user op null zetten als we niet midden in een logout zitten
      // Dit voorkomt dat tijdelijke session errors leiden tot uitloggen
      setUser(null);
    }
    setLoading(false);
  }, [sessionData, isPending, isLoggingIn, logoutTriggered]);

  // Luister naar auth:logout events van de API client
  useEffect(() => {
    const handleLogout = async () => {
      // ✅ Voorkom dubbele logout triggers
      if (logoutTriggered) return;
      setLogoutTriggered(true);

      console.log('[Auth] Logout event received');
      await logout();
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [logoutTriggered]);

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
