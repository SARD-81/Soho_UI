import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout.tsx';
import Dashboard from '../pages/Dashboard.tsx';
import History from '../pages/History.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import Settings from '../pages/Settings.tsx';
import Share from '../pages/Share.tsx';
import Users from '../pages/Users.tsx';
import ProtectedRoute from '../routes/ProtectedRoute.tsx';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'users', element: <Users /> },
      { path: 'settings', element: <Settings /> },
      { path: 'share', element: <Share /> },
      { path: 'history', element: <History /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export default router;
