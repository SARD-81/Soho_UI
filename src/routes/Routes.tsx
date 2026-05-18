import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout.tsx';
import ProtectedRoute from '../routes/ProtectedRoute.tsx';

import BlockStorage from '../pages/BlockStorage.tsx';
import Dashboard from '../pages/Dashboard.tsx';
import Disks from '../pages/Disks.tsx';
import FileSystem from '../pages/FileSystem.tsx';
import History from '../pages/History.tsx';
import IntegratedStorage from '../pages/IntegratedStorage.tsx';
import LoginPage from '../pages/LoginPage.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';
import Services from '../pages/Services.tsx';
import Settings from '../pages/Settings.tsx';
import Share from '../pages/Share.tsx';
import ShareNfs from '../pages/ShareNfs.tsx';
import SnmpService from '../pages/SnmpService.tsx';
import Users from '../pages/Users.tsx';

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
      { path: 'disks', element: <Disks /> },
      { path: 'Integrated-space', element: <IntegratedStorage /> },
      { path: 'block-space', element: <BlockStorage /> },
      { path: 'file-system', element: <FileSystem /> },
      { path: 'services', element: <Services /> },
      { path: 'users', element: <Users /> },
      { path: 'settings', element: <Settings /> },
      { path: 'share', element: <Share /> },
      { path: 'history', element: <History /> },
      { path: 'snmp-service', element: <SnmpService /> },
      { path: 'share-nfs', element: <ShareNfs /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
