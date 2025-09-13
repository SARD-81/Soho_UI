import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import React from 'react';
import { BiHistory } from 'react-icons/bi';
import { FaShare } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { MdClose, MdSpaceDashboard } from 'react-icons/md';
import { RiSettings3Fill } from 'react-icons/ri';
import { Link } from 'react-router-dom';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
}

const drawerWidth = 200;

const navItems = [
  { text: 'داشبورد', icon: <MdSpaceDashboard />, path: '/dashboard' },
  { text: 'کاربران', icon: <FiUsers />, path: '/users' },
  { text: 'تاریخچه', icon: <BiHistory />, path: '/history' },
  { text: 'اشتراک گذاری', icon: <FaShare />, path: '/share' },
  { text: 'تنظیمات', icon: <RiSettings3Fill />, path: '/settings' },
];

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  onClose,
}) => (
  <Drawer
    anchor="left"
    open={open}
    onClose={onClose}
    slotProps={{ transition: { direction: 'left' } }}
    sx={{
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: 'var(--color-card-bg)',
        backdropFilter: 'saturate(140%) blur(8px)',
      },
    }}
  >
    <Toolbar sx={{ justifyContent: 'space-between' }}>
      <IconButton onClick={onClose} sx={{ color: 'var(--color-bg-primary)' }}>
        <MdClose />
      </IconButton>
    </Toolbar>
    <List>
      {navItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            component={Link}
            to={item.path}
            onClick={onClose}
            sx={{
              color: 'var(--color-bg-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary)' },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              slotProps={{
                primary: { sx: { fontFamily: 'var(--font-vazir)' } },
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </Drawer>
);

export default NavigationDrawer;
