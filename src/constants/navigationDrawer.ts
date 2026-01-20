import { createElement } from 'react';
// import { BiHistory } from 'react-icons/bi';
import { BsFillShareFill } from "react-icons/bs";
// import { FiUsers } from 'react-icons/fi';
import { GrServices, GrStorage } from 'react-icons/gr';
import { MdOutlineSdStorage, MdSpaceDashboard, MdStorage } from 'react-icons/md';
import { RiSettings3Fill } from 'react-icons/ri';
import { TbHeartRateMonitor } from "react-icons/tb";
import { MdFolderShared } from "react-icons/md";
import type { NavigationItem } from '../@types/navigationDrawer';


export const drawerWidth = 210;

export const navItems: NavigationItem[] = [
  {
    text: 'داشبورد',
    icon: createElement(MdSpaceDashboard),
    path: '/dashboard',
  },
  {
    text: 'دیسک‌ها',
    icon: createElement(MdOutlineSdStorage),
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
    icon: createElement(MdStorage),
    path: '/file-system',
  },
  { text: 'اشتراک گذاری',
    icon: createElement(BsFillShareFill),
    // path: '/share',
    children:[
      {text:"SMB" , icon:createElement(BsFillShareFill), path:"/share"},
      {text:"NFS" , icon:createElement(MdFolderShared), path:"/share-nfs"},
    ] 
  },
  {
    text: 'سرویس ها',
    icon: createElement(GrServices),
    // path: '/',
    children:[
      {text:'سرویس ها' , icon:createElement(TbHeartRateMonitor), path:"/services"},
      {text:"سرویس SNMP" , icon:createElement(TbHeartRateMonitor), path:"/snmp-service"}
    ]
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