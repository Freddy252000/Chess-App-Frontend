import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api';
import { AuthUser, Role } from '../data/types';

const KEY = '@chess/session';

type Ctx = {
  user: AuthUser | null;
  role: Role | null;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};
const AuthCtx = createContext<Ctx>({ user: null, role: null, ready: false, login: async () => {}, logout: () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    api.setAuthToken(null);
    setUser(null);
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  // restore the saved session on app start; sign out automatically when the server says 401
  useEffect(() => {
    api.setUnauthorizedHandler(logout);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) { const u: AuthUser = JSON.parse(raw); api.setAuthToken(u.token); setUser(u); }
      } catch { /* ignore corrupt storage */ }
      setReady(true);
    })();
    return () => api.setUnauthorizedHandler(null);
  }, [logout]);

  const login = async (username: string, password: string) => {
    const u = await api.login(username, password); // role comes from the server account
    api.setAuthToken(u.token);
    setUser(u);
    AsyncStorage.setItem(KEY, JSON.stringify(u)).catch(() => {});
  };

  return <AuthCtx.Provider value={{ user, role: user?.role ?? null, ready, login, logout }}>{children}</AuthCtx.Provider>;
};
export const useAuth = () => useContext(AuthCtx);
