import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { MdClose, MdMenu, MdMenuOpen } from 'react-icons/md';
import { Link } from 'react-router-dom';
import type { NavigationDrawerProps } from '../@types/navigationDrawer';
import {
  collapsedDrawerWidth,
  drawerWidth,
  navItems,
} from '../constants/navigationDrawer';

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  variant,
  open,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const isPermanent = variant === 'permanent';

  const paperWidth = isCollapsed ? collapsedDrawerWidth : drawerWidth;

  return (
    <Drawer
      anchor="left"
      variant={variant}
      open={isPermanent ? true : open}
      onClose={isPermanent ? undefined : onClose}
      slotProps={
        variant === 'temporary' ? { transition: { direction: 'left' } } : undefined
      }
      sx={{
        '& .MuiDrawer-paper': {
          width: paperWidth,
          boxSizing: 'border-box',
          backgroundColor: 'var(--color-card-bg)',
          backdropFilter: 'saturate(140%) blur(8px)',
          overflowX: 'hidden',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.shorter,
            }),
        },
      }}
    >
      <Toolbar
        sx={{
          justifyContent: isPermanent ? 'flex-end' : 'space-between',
          px: isPermanent ? 1 : 2,
        }}
      >
        {isPermanent ? (
          <IconButton
            aria-label={isCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
            onClick={onToggleCollapse}
            sx={{ color: 'var(--color-bg-primary)' }}
          >
            {isCollapsed ? <MdMenu /> : <MdMenuOpen />}
          </IconButton>
        ) : (
          <IconButton
            aria-label="بستن منو"
            onClick={onClose}
            sx={{ color: 'var(--color-bg-primary)' }}
          >
            <MdClose />
          </IconButton>
        )}
      </Toolbar>
      <List disablePadding>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip
              title={item.text}
              placement="right"
              disableHoverListener={!isCollapsed}
            >
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => {
                  if (!isPermanent) {
                    onClose();
                  }
                }}
                aria-label={isCollapsed ? item.text : undefined}
                sx={{
                  color: 'var(--color-bg-primary)',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  px: isCollapsed ? 1 : 2,
                  '&:hover': { backgroundColor: 'var(--color-primary)' },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: isCollapsed ? 'auto' : 40,
                    display: 'flex',
                    justifyContent: 'center',
                    color: 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: { sx: { fontFamily: 'var(--font-vazir)' } },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default NavigationDrawer;
