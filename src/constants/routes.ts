export const ROUTE_SEGMENTS = {
  dashboard: 'dashboard',
  integratedStorage: 'integrated-storage',
  blockStorage: 'block-storage',
  fileSystem: 'file-system',
  services: 'services',
  settings: 'settings',
  share: 'share',
  users: 'users',
  history: 'history',
} as const;

export const ROUTE_PATHS = {
  root: '/',
  login: '/login',
  dashboard: `/${ROUTE_SEGMENTS.dashboard}`,
  integratedStorage: `/${ROUTE_SEGMENTS.integratedStorage}`,
  blockStorage: `/${ROUTE_SEGMENTS.blockStorage}`,
  fileSystem: `/${ROUTE_SEGMENTS.fileSystem}`,
  services: `/${ROUTE_SEGMENTS.services}`,
  settings: `/${ROUTE_SEGMENTS.settings}`,
  share: `/${ROUTE_SEGMENTS.share}`,
  users: `/${ROUTE_SEGMENTS.users}`,
  history: `/${ROUTE_SEGMENTS.history}`,
} as const;

export type RouteSegmentKey = keyof typeof ROUTE_SEGMENTS;
export type RoutePathKey = keyof typeof ROUTE_PATHS;
