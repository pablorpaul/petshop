import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { setUnauthorizedHandler } from '../services/api';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [bootstrapping, setBootstrapping] = useState(true);

  const logout = useCallback(() => {
    clearStoredAuth();
    setAuth(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!auth?.token) {
        setBootstrapping(false);
        return;
      }

      try {
        const user = await authService.me();
        const nextAuth = { ...auth, user };
        setAuth(nextAuth);
        setStoredAuth(nextAuth);
      } catch {
        logout();
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    const nextAuth = { token: result.token, user: result.user };
    setAuth(nextAuth);
    setStoredAuth(nextAuth);
    return nextAuth;
  };

  const value = useMemo(
    () => ({
      token: auth?.token || null,
      user: auth?.user || null,
      isAuthenticated: Boolean(auth?.token),
      bootstrapping,
      login,
      logout,
    }),
    [auth, bootstrapping, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
