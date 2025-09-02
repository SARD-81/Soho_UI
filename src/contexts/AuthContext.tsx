import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in on app initialization
    const token = localStorage.getItem('authToken');
    const savedUsername = sessionStorage.getItem('username');

    if (token) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
  }, []);

  const loginAction = useCallback((token: string, username: string) => {
    localStorage.setItem('authToken', token);
    sessionStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUsername(username);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, loginAction, logout, username }),
    [isAuthenticated, loginAction, logout, username],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
