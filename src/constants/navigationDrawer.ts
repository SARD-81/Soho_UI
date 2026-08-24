import { createElement } from 'react';
import { BsDeviceHdd, BsFolderSymlink, BsHddNetwork } from 'react-icons/bs';
import { GrServices, GrStorage } from 'react-icons/gr';
import {
  MdAccountTree,
  MdOutlinePublic,
  MdSpaceDashboard,
} from 'react-icons/md';
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
  {
    text: 'فضای فایلی',
    icon: createElement(MdAccountTree),
    path: '/file-system',
  },
  {
    text: 'اشتراک گذاری',
    icon: createElement(RiShareForwardLine),
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
  },
];
