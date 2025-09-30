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
import { MdClose, MdMenu } from 'react-icons/md';
import { Link } from 'react-router-dom';
import type { NavigationDrawerProps } from '../@types/navigationDrawer';
import {
  collapsedDrawerWidth,
  drawerWidth,
  navItems,
} from '../constants/navigationDrawer';

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  variant,
  onClose,
  onToggle,
}) => {
  const isPermanent = variant === 'permanent';

  const ToggleIcon = isPermanent ? (open ? MdClose : MdMenu) : MdClose;
  const handleToggle = () => {
    if (isPermanent) {
      onToggle?.();
    } else {
      onClose();
    }
  };

  const handleItemClick = () => {
    if (!isPermanent) {
      onClose();
    }
  };

  return (
    <Drawer
      anchor="left"
      variant={variant}
      open={isPermanent ? true : open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: isPermanent ? drawerWidth : undefined,
        flexShrink: 0,
        '& .MuiDrawer-paper': (theme) => ({
          width: isPermanent
            ? open
              ? drawerWidth
              : collapsedDrawerWidth
            : drawerWidth,
          overflowX: 'hidden',
          overflowY: 'auto',
          boxSizing: 'border-box',
          backgroundColor: 'var(--color-card-bg)',
          backdropFilter: 'saturate(140%) blur(8px)',
          whiteSpace: 'nowrap',
          position: isPermanent ? 'relative' : 'fixed',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: open
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
          display: 'flex',
          flexDirection: 'column',
        }),
      }}
    >
      <Toolbar
        sx={{
          justifyContent: open ? 'space-between' : 'center',
          px: open ? 2 : 1,
          minHeight: 56,
        }}
      >
        <IconButton onClick={handleToggle} sx={{ color: 'var(--color-bg-primary)' }}>
          <ToggleIcon />
        </IconButton>
      </Toolbar>
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={handleItemClick}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                color: 'var(--color-bg-primary)',
                '&:hover': { backgroundColor: 'var(--color-primary)' },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                slotProps={{
                  primary: {
                    sx: {
                      fontFamily: 'var(--font-vazir)',
                      opacity: open ? 1 : 0,
                      transition: 'opacity 0.2s ease',
                    },
                  },
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
