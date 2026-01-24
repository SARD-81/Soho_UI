import type { ReactNode } from 'react';

export interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export interface NavigationItem {
  text: string;
  icon: ReactNode;
  path?: string;
  children?: NavigationItem[];
}
