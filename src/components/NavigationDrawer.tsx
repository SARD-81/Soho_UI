import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer as MuiDrawer,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { CSSObject, Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import React from 'react';
import { MdClose } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import type { NavigationDrawerProps } from '../@types/navigationDrawer';
import { drawerWidth, navItems } from '../constants/navigationDrawer';

const drawerPaperLayout = (theme: Theme): CSSObject => {
  const drawerOffset = theme.spacing(6);

  return {
    position: 'sticky',
    top: drawerOffset,
    height: `calc(100svh - ${drawerOffset})`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: 'var(--color-card-bg)',
    backdropFilter: 'saturate(140%) blur(8px)',
    boxSizing: 'border-box' as const,
  };
};

const openedMixin = (theme: Theme): CSSObject => ({
  ...drawerPaperLayout(theme),
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  ...drawerPaperLayout(theme),
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
  '& .MuiDrawer-paper > .MuiList-root': {
    flexGrow: 1,
    overflowY: 'auto',
  },
}));

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();

  const handleItemClick = () => {
    if (!isDesktop) {
      onClose();
    }
  };

  const renderNavItems = () => (
    <List>
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);

        return (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              onClick={handleItemClick}
              selected={isActive}
              sx={{
                color: 'var(--color-bg-primary)',
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-card-bg)',
                  '& .MuiListItemIcon-root': {
                    color: 'var(--color-card-bg)',
                  },
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'var(--color-primary)',
                },
                '&:hover': {
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-card-bg)',
                  '& .MuiListItemIcon-root': {
                    color: 'var(--color-card-bg)',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'var(--color-bg-primary)',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ opacity: open ? 1 : 0 }}
                primaryTypographyProps={{
                  sx: { fontFamily: 'var(--font-vazir)' },
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  if (!isDesktop) {
    return (
      <MuiDrawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{ transition: { direction: 'left' } }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            ...drawerPaperLayout(theme),
          },
        }}
      >
        <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
          <IconButton
            onClick={onClose}
            sx={{ color: 'var(--color-bg-primary)' }}
          >
            <MdClose />
          </IconButton>
        </Toolbar>
        {renderNavItems()}
      </MuiDrawer>
    );
  }

  return (
    <StyledDrawer variant="permanent" open={open}>
      <Toolbar variant="dense" sx={{ justifyContent: open ? 'flex-end' : 'center' }}>
        {open && (
          <IconButton
            onClick={onClose}
            sx={{ color: 'var(--color-bg-primary)' }}
          >
            <MdClose />
          </IconButton>
        )}
      </Toolbar>
      {renderNavItems()}
    </StyledDrawer>
  );
};

export default NavigationDrawer;
