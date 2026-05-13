import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const isTruthyEnv = (value: unknown) =>
  ['1', 'true', 'yes', 'on'].includes(String(value ?? '').trim().toLowerCase());

const SHOULD_BYPASS_AUTH =
  import.meta.env.DEV && isTruthyEnv(import.meta.env.VITE_AUTH_BYPASS);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (SHOULD_BYPASS_AUTH) {
    return children;
  }

  if (isAuthLoading) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;