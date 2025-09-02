import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout.tsx';
import AuthPage from '../../../src/pages/AuthPage.tsx';
import Dashboard from '../pages/Dashboard.tsx';
import ProtectedRoute from '../routes/ProtectedRoute.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },

      // Add more protected routes here as needed
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
