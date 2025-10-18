/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isBrowser, safeStorage } from '../utils/safeStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  loginAction: (token: string, username: string) => void;
  logout: () => void;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = safeStorage.getItem('authToken');
    return Boolean(token);
  });
  const [username, setUsername] = useState<string | null>(() =>
    safeStorage.getItem('username')
  );

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const token = safeStorage.getItem('authToken');
    const savedUsername = safeStorage.getItem('username');

    if (token) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
  }, []);

  const loginAction = useCallback((token: string, username: string) => {
    safeStorage.setItem('authToken', token);
    safeStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUsername(username);
  }, []);

  const logout = useCallback(() => {
    safeStorage.removeItem('authToken');
    safeStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, loginAction, logout, username }),
    [isAuthenticated, loginAction, logout, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
