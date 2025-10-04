import { createElement } from 'react';
import { BiHistory } from 'react-icons/bi';
import { FaShare } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { GrServices, GrStorage } from 'react-icons/gr';
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
    icon: createElement(GrStorage),
    path: '/Integrated-space',
  },
  // {
  //   text: 'فضای بلاکی',
  //   icon: createElement(MdStorage),
  //   path: '/block-space',
  // },
  {
    text: 'فضای فایلی',
    icon: createElement(MdStorage),
    path: '/file-system',
  },
  { text: 'اشتراک گذاری', icon: createElement(FaShare), path: '/share' },
  {
    text: 'سرویس ها',
    icon: createElement(GrServices),
    path: '/services',
  },

  {
    text: 'تنظیمات',
    icon: createElement(RiSettings3Fill),
    path: '/settings',
    children: [
      { text: 'کاربران', icon: createElement(FiUsers), path: '/users' },
    ],
  },
  { text: 'تاریخچه', icon: createElement(BiHistory), path: '/history' },
];
