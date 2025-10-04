import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  loginAction: (token: string, username: string) => void;
  logout: () => void;
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
  // const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
  //   () => !!localStorage.getItem('authToken')
  // );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem('username')
  );

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUsername = localStorage.getItem('username');

    if (token) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
  }, []);

  const loginAction = useCallback((token: string, username: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUsername(username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, loginAction, logout, username }),
    [isAuthenticated, loginAction, logout, username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
