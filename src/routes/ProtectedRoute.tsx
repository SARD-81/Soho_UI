import React from 'react';
interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Authentication temporarily disabled for development
  return children;
};

export default ProtectedRoute;
