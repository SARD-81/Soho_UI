import { createElement } from 'react';
import { BiHistory } from 'react-icons/bi';
import { FaShare } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { GrServices } from 'react-icons/gr';
import { MdSpaceDashboard, MdStorage } from 'react-icons/md';
import { RiSettings3Fill } from 'react-icons/ri';
import type { NavigationItem } from '../@types/navigationDrawer';

export const drawerWidth = 240;
export const collapsedDrawerWidth = 72;

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
  // {
  //   text: 'فضای بلاکی',
  //   icon: createElement(MdStorage),
  //   path: '/block-space',
  // },
  {
    text: 'سرویس ها',
    icon: createElement(GrServices),
    path: '/services',
  },
  { text: 'کاربران', icon: createElement(FiUsers), path: '/users' },
  { text: 'اشتراک گذاری', icon: createElement(FaShare), path: '/share' },
  { text: 'تنظیمات', icon: createElement(RiSettings3Fill), path: '/settings' },
  { text: 'تاریخچه', icon: createElement(BiHistory), path: '/history' },
];
