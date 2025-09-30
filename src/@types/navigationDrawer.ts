import type { ReactNode } from 'react';

export interface NavigationDrawerProps {
  variant: 'temporary' | 'permanent';
  open: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface NavigationItem {
  text: string;
  icon: ReactNode;
  path: string;
}
