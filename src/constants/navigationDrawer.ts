import { createElement } from 'react';
import { BiHistory } from 'react-icons/bi';
import { FaShare } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { MdSpaceDashboard, MdStorage } from 'react-icons/md';
import { RiSettings3Fill } from 'react-icons/ri';
import type { NavigationItem } from '../@types/navigationDrawer';

export const drawerWidth = 200;

export const navItems: NavigationItem[] = [
  {
    text: 'داشبورد',
    icon: createElement(MdSpaceDashboard),
    path: '/dashboard',
  },
  {
    text: 'فضای یکپارچه',
    icon: createElement(MdStorage),
    path: '/Integrated-space',
  },
  { text: 'کاربران', icon: createElement(FiUsers), path: '/users' },
  { text: 'تاریخچه', icon: createElement(BiHistory), path: '/history' },
  { text: 'اشتراک گذاری', icon: createElement(FaShare), path: '/share' },
  { text: 'تنظیمات', icon: createElement(RiSettings3Fill), path: '/settings' },
];
