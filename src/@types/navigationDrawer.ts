import type { ReactNode } from 'react';

export interface NavigationDrawerProps {
  open: boolean;
  variant: 'permanent' | 'temporary';
  onClose: () => void;
  onToggle?: () => void;
}

export interface NavigationItem {
  text: string;
  icon: ReactNode;
  path: string;
}
