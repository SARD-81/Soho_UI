import { Suspense, lazy, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoadingComponent from '../components/LoadingComponent.tsx';
import ProtectedRoute from '../routes/ProtectedRoute.tsx';

const MainLayout = lazy(() => import('../components/MainLayout.tsx'));
const BlockStorage = lazy(() => import('../pages/BlockStorage.tsx'));
const Dashboard = lazy(() => import('../pages/Dashboard.tsx'));
const Disks = lazy(() => import('../pages/Disks.tsx'));
const FileSystem = lazy(() => import('../pages/FileSystem.tsx'));
const History = lazy(() => import('../pages/History.tsx'));
const IntegratedStorage = lazy(() => import('../pages/IntegratedStorage.tsx'));
const LoginPage = lazy(() => import('../pages/LoginPage.tsx'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.tsx'));
const Services = lazy(() => import('../pages/Services.tsx'));
const Settings = lazy(() => import('../pages/Settings.tsx'));
const Share = lazy(() => import('../pages/Share.tsx'));
const Users = lazy(() => import('../pages/Users.tsx'));
const SnmpService = lazy(() => import('../pages/SnmpService.tsx'));
const ShareNfs = lazy(() => import('../pages/ShareNfs.tsx'));

const withSuspense = (node: ReactNode) => (
  <Suspense fallback={<LoadingComponent />}>{node}</Suspense>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        {withSuspense(<MainLayout />)}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: withSuspense(<Dashboard />) },
      { path: 'disks', element: withSuspense(<Disks />) },
      { path: 'Integrated-space', element: withSuspense(<IntegratedStorage />) },
      { path: 'block-space', element: withSuspense(<BlockStorage />) },
      { path: 'file-system', element: withSuspense(<FileSystem />) },
      { path: 'services', element: withSuspense(<Services />) },
      { path: 'users', element: withSuspense(<Users />) },
      { path: 'settings', element: withSuspense(<Settings />) },
      { path: 'share', element: withSuspense(<Share />) },
      { path: 'history', element: withSuspense(<History />) },
      { path: 'snmp-service', element: withSuspense(<SnmpService />) },
      { path: 'share-nfs', element: withSuspense(<ShareNfs />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);

export default router;