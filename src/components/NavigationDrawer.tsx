import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
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

const navItems = [
  { text: 'داشبورد', icon: <MdSpaceDashboard />, path: '/dashboard' },
  { text: 'کاربران', icon: <FiUsers />, path: '/users' },
  { text: 'تاریخچه', icon: <BiHistory />, path: '/history' },
  { text: 'اشتراک گذاری', icon: <FaShare />, path: '/share' },
  { text: 'تنظیمات', icon: <RiSettings3Fill />, path: '/settings' },
];

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerWidth = isSmall ? '75%' : 200;

  return (
    <Drawer
      anchor="left"
      variant={isSmall ? 'temporary' : 'permanent'}
      open={isSmall ? open : true}
      onClose={onClose}
      slotProps={{ transition: { direction: 'left' } }}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'var(--color-card-bg)',
          backdropFilter: 'saturate(140%) blur(8px)',
          height: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['transform', 'width'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
          }),
        },
      }}
    >
      {isSmall && (
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          <IconButton onClick={onClose} sx={{ color: 'var(--color-bg-primary)' }}>
            <MdClose />
          </IconButton>
        </Toolbar>
      )}
      <List sx={{ flexGrow: 1 }}>
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
};

export default NavigationDrawer;
