import { createElement } from 'react';
import { BiHistory } from 'react-icons/bi';
import { FaShare } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { MdSpaceDashboard } from 'react-icons/md';
import { RiSettings3Fill } from 'react-icons/ri';
import type { NavigationItem } from '../../@types/components/navigationDrawer';

export const drawerWidth = 200;

export const navItems: NavigationItem[] = [
  { text: 'داشبورد', icon: createElement(MdSpaceDashboard), path: '/dashboard' },
  { text: 'کاربران', icon: createElement(FiUsers), path: '/users' },
  { text: 'تاریخچه', icon: createElement(BiHistory), path: '/history' },
  { text: 'اشتراک گذاری', icon: createElement(FaShare), path: '/share' },
  { text: 'تنظیمات', icon: createElement(RiSettings3Fill), path: '/settings' },
];
