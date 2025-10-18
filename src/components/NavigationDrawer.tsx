import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer as MuiDrawer,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { CSSObject, Theme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import React from 'react';
import {
  MdClose,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import type {
  NavigationDrawerProps,
  NavigationItem,
} from '../@types/navigationDrawer';
import { drawerWidth, navItems } from '../constants/navigationDrawer';

const drawerPaperLayout = (theme: Theme): CSSObject => {
  const drawerOffset = theme.spacing(1);

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
  // backgroundColor: 'var(--color-card-bg)',
  // backdropFilter: 'saturate(140%) blur(8px)',
  // boxSizing: 'border-box' as const,
});

const closedMixin = (theme: Theme): CSSObject => ({
  ...drawerPaperLayout(theme),
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  // backgroundColor: 'var(--color-card-bg)',
  // backdropFilter: 'saturate(140%) blur(8px)',
  // boxSizing: 'border-box' as const,
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
    // overflowY: 'auto',
  },
}));

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<
    Record<string, boolean>
  >({});

  const handleItemClick = () => {
    if (!isDesktop) {
      onClose();
    }
  };

  const isItemActive = (item: NavigationItem): boolean => {
    const matchesCurrentPath =
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`);

    return (
      matchesCurrentPath ||
      (item.children?.some((child) => isItemActive(child)) ?? false)
    );
  };

  React.useEffect(() => {
    setExpandedItems((prev) => {
      const next = { ...prev };

      const ensureActiveParentsExpanded = (items: NavigationItem[]) => {
        items.forEach((item) => {
          if (item.children?.length) {
            if (isItemActive(item) && next[item.path] === undefined) {
              next[item.path] = true;
            }
            ensureActiveParentsExpanded(item.children);
          }
        });
      };

      ensureActiveParentsExpanded(navItems);

      return next;
    });
  }, [location.pathname]);

  const renderNavItems = (
    items: NavigationItem[],
    depth = 0
  ): React.ReactNode => (
    <List disablePadding={depth > 0} sx={{ pl: open && depth > 0 ? 2 : 0 }}>
      {items.map((item) => {
        const isActive = isItemActive(item);
        const hasChildren = Boolean(item.children?.length);
        const isExpanded = hasChildren
          ? (expandedItems[item.path] ?? false)
          : false;

        return (
          <React.Fragment key={`${item.text}-${item.path}`}>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleItemClick}
                selected={isActive}
                sx={(theme) => ({
                  position: 'relative',
                  overflow: 'hidden',
                  color: 'var(--color-bg-primary)',
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  mx: 1,
                  my: 0.25,
                  transform: 'translateX(0)',
                  borderRadius: 1.5,
                  transition: theme.transitions.create(['color', 'transform'], {
                    duration: theme.transitions.duration.shorter,
                    easing: theme.transitions.easing.easeInOut,
                  }),
                  ...(depth > 0 && open
                    ? {
                        pl: 2.5 + depth * 2,
                      }
                    : {}),
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: theme.spacing(0.5),
                    borderRadius: 1.5,
                    backgroundColor: 'var(--color-primary)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left center',
                    transition: theme.transitions.create(
                      ['transform', 'opacity'],
                      {
                        duration: theme.transitions.duration.standard,
                        easing: theme.transitions.easing.easeInOut,
                      }
                    ),
                    opacity: 0,
                    zIndex: -1,
                  },
                  '&:hover::before': {
                    transform: 'scaleX(1)',
                    opacity: 1,
                  },
                  '&.Mui-selected::before': {
                    transform: 'scaleX(1)',
                    opacity: 1,
                  },
                  '&:hover': {
                    color: 'var(--color-card-bg)',
                    transform: 'translateX(2px)',
                    '& .MuiListItemIcon-root': {
                      color: 'var(--color-card-bg)',
                    },
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    color: 'var(--color-card-bg)',
                    '& .MuiListItemIcon-root': {
                      color: 'var(--color-card-bg)',
                    },
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'transparent',
                    transform: 'translateX(2px)',
                  },
                })}
              >
                <ListItemIcon
                  sx={(theme) => ({
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: 'var(--color-bg-primary)',
                    transition: theme.transitions.create('color', {
                      duration: theme.transitions.duration.shorter,
                      easing: theme.transitions.easing.easeInOut,
                    }),
                    zIndex: 1,
                  })}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    zIndex: 1,
                    transition: (theme) =>
                      theme.transitions.create('opacity', {
                        duration: theme.transitions.duration.shorter,
                        easing: theme.transitions.easing.easeInOut,
                      }),
                  }}
                  primaryTypographyProps={{
                    sx: { fontFamily: 'var(--font-vazir)' },
                  }}
                />
                {hasChildren && open && (
                  <Box
                    component="span"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setExpandedItems((prev) => ({
                        ...prev,
                        [item.path]: !(prev[item.path] ?? false),
                      }));
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      ml: 'auto',
                      color: 'var(--color-bg-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    {isExpanded ? (
                      <MdKeyboardArrowUp />
                    ) : (
                      <MdKeyboardArrowDown />
                    )}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
            {item.children && (
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                {renderNavItems(item.children, depth + 1)}
              </Collapse>
            )}
          </React.Fragment>
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
        {renderNavItems(navItems)}
      </MuiDrawer>
    );
  }

  return (
    <StyledDrawer variant="permanent" open={open}>
      <Toolbar
        variant="dense"
        sx={{ justifyContent: open ? 'flex-end' : 'center' }}
      >
        {/*{open && (*/}
        {/*  <IconButton*/}
        {/*    onClick={onClose}*/}
        {/*    sx={{ color: 'var(--color-bg-primary)' }}*/}
        {/*  >*/}
        {/*    <MdClose />*/}
        {/*  </IconButton>*/}
        {/*)}*/}
      </Toolbar>
      {renderNavItems(navItems)}
      <Typography
        // variant="h6"
        color="var(--color-secondary)"
        sx={{
          fontSize: 15,
          pb: 1,
          textAlign: 'center',
          visibility: open ? 'visible' : 'hidden',
        }}
      >
        نسخه BETA
      </Typography>
    </StyledDrawer>
  );
};

export default NavigationDrawer;
