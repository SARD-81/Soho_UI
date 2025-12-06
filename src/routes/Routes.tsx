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

const routePrefetchers = [
  () => import('../pages/Dashboard.tsx'),
  () => import('../pages/Disks.tsx'),
  () => import('../pages/IntegratedStorage.tsx'),
  () => import('../pages/BlockStorage.tsx'),
  () => import('../pages/FileSystem.tsx'),
  () => import('../pages/Services.tsx'),
  () => import('../pages/Users.tsx'),
  () => import('../pages/Settings.tsx'),
  () => import('../pages/Share.tsx'),
  () => import('../pages/History.tsx'),
  () => import('../pages/NotFoundPage.tsx'),
];

const withSuspense = (node: ReactNode) => (
  <Suspense fallback={<LoadingComponent />}>{node}</Suspense>
);

export const prefetchRouteModules = () => {
  const schedule =
    typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? (window as typeof window & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback
      : (callback: IdleRequestCallback) => window.setTimeout(() => callback({
            didTimeout: false,
            timeRemaining: () => 15,
          } as IdleDeadline), 500);

  schedule(() => {
    routePrefetchers.forEach((prefetch) => {
      prefetch().catch(() => {});
    });
  });
};

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
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);

export default router;
