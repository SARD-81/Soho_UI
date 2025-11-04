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
} from '../lib/authApi.ts';
import { AUTH_EVENTS, authEventTarget } from '../lib/authEvents.ts';
import axiosInstance from '../lib/axiosInstance.ts';
import tokenStorage from '../lib/tokenStorage.ts';

interface AuthContextType {
  isAuthenticated: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const initialAccess = tokenStorage.getAccessToken();
    const initialRefresh = tokenStorage.getRefreshToken();
    return Boolean(initialAccess || initialRefresh);
  });
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
          return;
        } catch (error) {
          console.warn('Stored access token failed verification, attempting refresh.', error);
        }
      }

      if (!storedRefresh) {
        clearAuthState();
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
    const currentRefresh = refreshToken ?? tokenStorage.getRefreshToken();
    let logoutError: unknown = null;

    try {
      if (currentAccess && currentRefresh) {
        await logoutRequest(currentAccess, currentRefresh);
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
  }, [accessToken, refreshToken, clearAuthState]);

  const value = useMemo(
    () => ({ isAuthenticated, loginAction, logout, username }),
    [isAuthenticated, loginAction, logout, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
