import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  logout as logoutRequest,
  refreshAccessToken,
  verifyAccessToken,
} from '../lib/authApi';
import { AUTH_EVENTS, authEventTarget } from '../lib/authEvents';
import axiosInstance from '../lib/axiosInstance';
import tokenStorage from '../lib/tokenStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  loginAction: (accessToken: string, refreshToken: string, username: string) => void;
  logout: () => Promise<void>;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [usernameState, setUsernameState] = useState<string | null>(() =>
    tokenStorage.getUsername()
  );
  const [accessTokenState, setAccessTokenState] = useState<string | null>(() =>
    tokenStorage.getAccessToken()
  );
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(() =>
    tokenStorage.getRefreshToken()
  );

  const accessToken = accessTokenState;
  const refreshToken = refreshTokenState;
  const username = usernameState;

  const setAccessToken = useCallback((value: string | null) => {
    tokenStorage.setAccessToken(value);
    setAccessTokenState(value);
  }, []);

  const setRefreshToken = useCallback((value: string | null) => {
    tokenStorage.setRefreshToken(value);
    setRefreshTokenState(value);
  }, []);

  const setUsername = useCallback((value: string | null) => {
    tokenStorage.setUsername(value);
    setUsernameState(value);
  }, []);

  const applyAccessTokenHeader = useCallback((token: string | null) => {
    if (token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  }, []);

  useEffect(() => {
    applyAccessTokenHeader(accessToken);
  }, [accessToken, applyAccessTokenHeader]);

  const clearAuthState = useCallback(() => {
    tokenStorage.clear();
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setUsername(null);
  }, [setAccessToken, setRefreshToken, setUsername]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsAuthLoading(true);
      const storedAccess = tokenStorage.getAccessToken();
      const storedRefresh = tokenStorage.getRefreshToken();
      const savedUsername = tokenStorage.getUsername();

      if (storedAccess) {
        try {
          await verifyAccessToken(storedAccess);
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
          setUsername(savedUsername);
          setIsAuthenticated(true);
          setIsAuthLoading(false);
          return;
        } catch (error) {
          console.warn('Stored access token failed verification, attempting refresh.', error);
        }
      }

      if (!storedRefresh) {
        clearAuthState();
        setIsAuthLoading(false);
        return;
      }

      try {
        const { access } = await refreshAccessToken(storedRefresh);
        setAccessToken(access);
        setRefreshToken(storedRefresh);
        setUsername(savedUsername);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Unable to restore session', error);
        clearAuthState();
      } finally {
        setIsAuthLoading(false);
      }
    };

    void initializeAuth();
  }, [clearAuthState, setAccessToken, setRefreshToken, setUsername]);

  useEffect(() => {
    const handleTokenRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const newAccessToken = customEvent.detail;
      if (typeof newAccessToken === 'string') {
        setAccessToken(newAccessToken);
        setIsAuthenticated(true);
      }
    };

    const handleSessionCleared = () => {
      clearAuthState();
    };

    authEventTarget.addEventListener(
      AUTH_EVENTS.TOKEN_REFRESHED,
      handleTokenRefresh
    );
    authEventTarget.addEventListener(
      AUTH_EVENTS.SESSION_CLEARED,
      handleSessionCleared
    );

    return () => {
      authEventTarget.removeEventListener(
        AUTH_EVENTS.TOKEN_REFRESHED,
        handleTokenRefresh
      );
      authEventTarget.removeEventListener(
        AUTH_EVENTS.SESSION_CLEARED,
        handleSessionCleared
      );
    };
  }, [clearAuthState, setAccessToken]);

  const loginAction = useCallback(
    (access: string, refresh: string, user: string) => {
      setAccessToken(access);
      setRefreshToken(refresh);
      setIsAuthenticated(true);
      setUsername(user);
    },
    [setAccessToken, setRefreshToken, setUsername]
  );

  const logout = useCallback(async () => {
    const currentAccess = accessToken ?? tokenStorage.getAccessToken();
    let logoutError: unknown = null;

    try {
      if (currentAccess) {
        await logoutRequest(currentAccess);
      }
    } catch (error) {
      console.error('Failed to notify server about logout', error);
      logoutError = error;
    } finally {
      clearAuthState();
    }

    if (logoutError) {
      throw logoutError;
    }
  }, [accessToken, clearAuthState]);

  const value = useMemo(
    () => ({ isAuthenticated, isAuthLoading, loginAction, logout, username }),
    [isAuthenticated, isAuthLoading, loginAction, logout, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};