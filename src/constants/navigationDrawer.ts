import { createElement } from 'react';
// import { BiHistory } from 'react-icons/bi';
import { BsDeviceHdd, BsFolderSymlink, BsHddNetwork } from 'react-icons/bs';
// import { FiUsers } from 'react-icons/fi';
import { GrServices, GrStorage } from 'react-icons/gr';
import { MdAccountTree, MdOutlinePublic, MdSpaceDashboard } from 'react-icons/md';
import { RiSettings3Fill, RiShareForwardLine } from 'react-icons/ri';
import { TbActivityHeartbeat, TbServerCog } from 'react-icons/tb';
import type { NavigationItem } from '../@types/navigationDrawer';

export const drawerWidth = 250;

export const navItems: NavigationItem[] = [
  {
    text: 'داشبورد',
    icon: createElement(MdSpaceDashboard),
    path: '/dashboard',
  },
  {
    text: 'دیسک‌ها',
    icon: createElement(BsDeviceHdd),
    path: '/disks',
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
    icon: createElement(MdAccountTree),
    path: '/file-system',
  },
  {
    text: 'اشتراک گذاری',
    icon: createElement(RiShareForwardLine),
    // path: '/share',
    children: [
      { text: 'SMB', icon: createElement(BsFolderSymlink), path: '/share' },
      { text: 'NFS', icon: createElement(BsHddNetwork), path: '/share-nfs' },
      {
        text: 'Web Share',
        icon: createElement(MdOutlinePublic),
        path: '/web-share',
      },
    ],
  },
  {
    text: 'سرویس ها',
    icon: createElement(GrServices),
    // path: '/',
    children: [
      {
        text: 'سرویس ها',
        icon: createElement(TbServerCog),
        path: '/services',
      },
      {
        text: 'سرویس SNMP',
        icon: createElement(TbActivityHeartbeat),
        path: '/snmp-service',
      },
    ],
  },

  {
    text: 'تنظیمات',
    icon: createElement(RiSettings3Fill),
    path: '/settings',
    // children: [
    //   { text: 'کاربران', icon: createElement(FiUsers), path: '/users' },
    // ],
  },
  // { text: 'تاریخچه', icon: createElement(BiHistory), path: '/history' },
];
