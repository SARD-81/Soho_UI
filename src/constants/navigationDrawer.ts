import { createElement } from 'react';
// import { BiHistory } from 'react-icons/bi';
import { BsFillShareFill } from 'react-icons/bs';
// import { FiUsers } from 'react-icons/fi';
import { GrServices, GrStorage } from 'react-icons/gr';
import { MdSpaceDashboard, MdStorage } from 'react-icons/md';
import { RiSettings3Fill } from 'react-icons/ri';
import type { NavigationItem } from '../@types/navigationDrawer';
import { faMessages } from '../locales/fa';
import { ROUTE_PATHS } from './routes';

export const drawerWidth = 200;

export const navItems: NavigationItem[] = [
  {
    text: faMessages.navigation.dashboard,
    icon: createElement(MdSpaceDashboard),
    path: ROUTE_PATHS.dashboard,
  },
  {
    text: faMessages.navigation.integratedStorage,
    icon: createElement(GrStorage),
    path: ROUTE_PATHS.integratedStorage,
  },
  // {
  //   text: 'فضای بلاکی',
  //   icon: createElement(MdStorage),
  //   path: '/block-space',
  // },
  {
    text: faMessages.navigation.fileStorage,
    icon: createElement(MdStorage),
    path: ROUTE_PATHS.fileSystem,
  },
  {
    text: faMessages.navigation.sharing,
    icon: createElement(BsFillShareFill),
    path: ROUTE_PATHS.share,
  },
  {
    text: faMessages.navigation.services,
    icon: createElement(GrServices),
    path: ROUTE_PATHS.services,
  },

  {
    text: faMessages.navigation.settings,
    icon: createElement(RiSettings3Fill),
    path: ROUTE_PATHS.settings,
    children: [
      // { text: 'کاربران', icon: createElement(FiUsers), path: '/users' },
    ],
  },
  // { text: 'تاریخچه', icon: createElement(BiHistory), path: '/history' },
];
