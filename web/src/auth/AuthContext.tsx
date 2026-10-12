import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { AuthResponse, User } from '../lib/types';
import { tokenStorage } from './token';


interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  setSession: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => tokenStorage.get());

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => (await api.get<User>('/auth/me')).data,
    enabled: !!token,
    retry: false,
    staleTime: Infinity
  });

  const setSession = useCallback(
    ({ user, accessToken }: AuthResponse) => {
      tokenStorage.set(accessToken);
      setToken(accessToken);
      queryClient.setQueryData(['auth', 'me'], user)
    },
    [queryClient]
  )

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    queryClient.clear(); // borra toda la caché: los datos eran de este usuario
  }, [queryClient]);

  // El interceptor de axios avisa con este evento cuando la API responde 401
  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  const value = useMemo(
    () => ({ user: token ? (user ?? null) : null, isLoading: !!token && isLoading, setSession, logout }),
    [token, user, isLoading, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
}
