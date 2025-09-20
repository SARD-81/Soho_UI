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
import { MdClose } from 'react-icons/md';
import { Link } from 'react-router-dom';
import type { NavigationDrawerProps } from '../@types/navigationDrawer';
import { drawerWidth, navItems } from '../constants/navigationDrawer';

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
