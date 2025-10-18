import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout.tsx';
import { ROUTE_PATHS, ROUTE_SEGMENTS } from '../constants/routes.ts';
import BlockStorage from '../pages/BlockStorage.tsx';
import Dashboard from '../pages/Dashboard.tsx';
import FileSystem from '../pages/FileSystem.tsx';
import History from '../pages/History.tsx';
import IntegratedStorage from '../pages/IntegratedStorage.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';
import Services from '../pages/Services.tsx';
import Settings from '../pages/Settings.tsx';
import Share from '../pages/Share.tsx';
import Users from '../pages/Users.tsx';
import ProtectedRoute from '../routes/ProtectedRoute.tsx';

const router = createBrowserRouter([
  {
    path: ROUTE_PATHS.login,
    element: <LoginPage />,
  },
  {
    path: ROUTE_PATHS.root,
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTE_SEGMENTS.dashboard} replace /> },
      { path: ROUTE_SEGMENTS.dashboard, element: <Dashboard /> },
      { path: ROUTE_SEGMENTS.integratedStorage, element: <IntegratedStorage /> },
      { path: ROUTE_SEGMENTS.blockStorage, element: <BlockStorage /> },
      { path: ROUTE_SEGMENTS.fileSystem, element: <FileSystem /> },
      { path: ROUTE_SEGMENTS.services, element: <Services /> },
      { path: ROUTE_SEGMENTS.users, element: <Users /> },
      { path: ROUTE_SEGMENTS.settings, element: <Settings /> },
      { path: ROUTE_SEGMENTS.share, element: <Share /> },
      { path: ROUTE_SEGMENTS.history, element: <History /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
