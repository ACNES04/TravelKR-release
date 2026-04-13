'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, AuthCredentials, AuthRegisterData } from '@/types/auth';
import { getCurrentUser, login as authLogin, logout as authLogout, register as authRegister } from '@/lib/auth/localAuth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: AuthRegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login: async (credentials: AuthCredentials) => {
        setLoading(true);
        setError(null);
        try {
          const loggedUser = await authLogin(credentials);
          setUser(loggedUser);
        } catch (err) {
          setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
          throw err;
        } finally {
          setLoading(false);
        }
      },
      register: async (data: AuthRegisterData) => {
        setLoading(true);
        setError(null);
        try {
          const registeredUser = await authRegister(data);
          setUser(registeredUser);
        } catch (err) {
          setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
          throw err;
        } finally {
          setLoading(false);
        }
      },
      logout: () => {
        authLogout();
        setUser(null);
      },
    }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}
