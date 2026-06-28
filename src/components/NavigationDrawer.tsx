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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha, styled } from '@mui/material/styles';
import type { MouseEvent } from 'react';
import React, { useCallback } from 'react';
import { MdClose, MdKeyboardArrowDown } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import type {
  NavigationDrawerProps,
  NavigationItem,
} from '../@types/navigationDrawer';
import { drawerWidth, navItems } from '../constants/navigationDrawer';

const getItemKey = (item: NavigationItem): string => item.path || item.text;

const drawerPaperLayout = (theme: Theme): CSSObject => {
  const drawerOffset = theme.spacing(1);
  return {
    position: 'sticky',
    top: drawerOffset,
    height: `calc(100svh - ${drawerOffset})`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background:
      'linear-gradient(180deg, color-mix(in srgb, var(--color-card-bg) 96%, var(--color-primary) 4%) 0%, var(--color-card-bg) 50%, color-mix(in srgb, var(--color-background) 84%, var(--color-card-bg) 16%) 100%)',
    backdropFilter: 'saturate(150%) blur(14px)',
    borderRight:
      '1px solid color-mix(in srgb, var(--color-input-border) 70%, transparent)',
    boxShadow: `inset -1px 0 0 ${alpha(theme.palette.common.white, 0.05)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.06)}, 14px 0 34px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.24 : 0.08)}`,
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
  [theme.breakpoints.up('sm')]: { width: `calc(${theme.spacing(8)} + 1px)` },
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
  '& .MuiDrawer-paper > .MuiList-root': { flexGrow: 1 },
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

  const handleItemClick = useCallback(() => {
    if (!isDesktop) onClose();
  }, [isDesktop, onClose]);

  const isItemActive = useCallback(
    (item: NavigationItem): boolean => {
      const matchesCurrentPath = Boolean(
        item.path &&
        (location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`))
      );
      return (
        matchesCurrentPath ||
        (item.children?.some((child) => isItemActive(child)) ?? false)
      );
    },
    [location.pathname]
  );

  React.useEffect(() => {
    setExpandedItems((prev) => {
      const next = { ...prev };
      const ensureActiveParentsExpanded = (items: NavigationItem[]) => {
        items.forEach((item) => {
          if (item.children?.length) {
            const itemKey = getItemKey(item);
            if (isItemActive(item) && next[itemKey] === undefined)
              next[itemKey] = true;
            ensureActiveParentsExpanded(item.children);
          }
        });
      };
      ensureActiveParentsExpanded(navItems);
      return next;
    });
  }, [isItemActive]);

  const renderIdentity = () => (
    <Box
      sx={{
        px: open ? 1.5 : 1,
        py: 1.25,
        mx: 1,
        mb: 1,
        mt: isDesktop ? 0 : 1,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'flex-start' : 'center',
        gap: 1.25,
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 16%, transparent), color-mix(in srgb, var(--color-secondary) 8%, transparent))',
        border:
          '1px solid color-mix(in srgb, var(--color-input-border) 58%, transparent)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <Box
        component="img"
        src="/logo/Logo.png"
        alt="SOHO"
        sx={{
          width: 34,
          height: 34,
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.22))',
        }}
      />
      {open && (
        <Box sx={{ overflow: 'hidden' }}>
          <Typography
            sx={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-didot)',
              fontSize: 20,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            SOHO
          </Typography>
          <Typography
            sx={{
              color: 'var(--color-secondary)',
              fontSize: 11.5,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
            }}
          >
            Storage Operations
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderNavItems = (
    items: NavigationItem[],
    depth = 0
  ): React.ReactNode => (
    <List
      disablePadding={depth > 0}
      sx={{
        px: depth === 0 ? 0.75 : 0,
        py: depth === 0 ? 0.5 : 0,
        position: 'relative',
        ...(open && depth > 0
          ? {
              ml: 2,
              pl: 1.2,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 4,
                bottom: 8,
                left: 11,
                width: 1,
                background:
                  'linear-gradient(180deg, transparent, var(--color-input-border), transparent)',
              },
            }
          : {}),
      }}
    >
      {items.map((item) => {
        const itemKey = getItemKey(item);
        const isActive = isItemActive(item);
        const hasChildren = Boolean(item.children?.length);
        const hasPath = Boolean(item.path);
        const isExpanded = hasChildren
          ? (expandedItems[itemKey] ?? false)
          : false;
        const button = (
          <ListItemButton
            component={hasChildren ? 'div' : Link}
            to={!hasChildren && hasPath ? item.path : undefined}
            onClick={(
              event: MouseEvent<HTMLAnchorElement | HTMLDivElement>
            ) => {
              if (hasChildren) {
                event.preventDefault();
                event.stopPropagation();
                setExpandedItems((prev) => ({
                  ...prev,
                  [itemKey]: !(prev[itemKey] ?? false),
                }));
              } else if (hasPath) handleItemClick();
            }}
            selected={isActive}
            sx={(theme) => ({
              minHeight: depth > 0 ? 38 : 44,
              position: 'relative',
              overflow: 'hidden',
              justifyContent: open ? 'initial' : 'center',
              px: open ? 1.5 : 0,
              mx: open ? 0.5 : 0.65,
              my: 0.35,
              borderRadius: 2.25,
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: theme.transitions.create(
                ['background-color', 'box-shadow', 'color', 'transform'],
                {
                  duration: theme.transitions.duration.shorter,
                  easing: theme.transitions.easing.easeInOut,
                }
              ),
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 7,
                bottom: 7,
                left: 0,
                width: 3,
                borderRadius: 6,
                background:
                  'linear-gradient(180deg, var(--color-primary), var(--color-secondary))',
                opacity: 0,
                boxShadow: '0 0 14px var(--color-primary)',
              },
              '&:hover': {
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                transform: open ? 'translateX(2px)' : 'none',
              },
              '&.Mui-selected': {
                background:
                  'linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 24%, transparent), color-mix(in srgb, var(--color-secondary) 10%, transparent))',
                boxShadow:
                  'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                color: 'var(--color-text)',
              },
              '&.Mui-selected::before': { opacity: 1 },
              '&.Mui-selected:hover': {
                background:
                  'linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 28%, transparent), color-mix(in srgb, var(--color-secondary) 12%, transparent))',
              },
            })}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 1.2 : 'auto',
                justifyContent: 'center',
                color: isActive
                  ? 'var(--color-primary)'
                  : 'var(--color-secondary)',
                fontSize: depth > 0 ? 18 : 20,
                transition: (theme) =>
                  theme.transitions.create('color', {
                    duration: theme.transitions.duration.shorter,
                  }),
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                opacity: open ? 1 : 0,
                zIndex: 1,
                '& .MuiTypography-root': {
                  fontFamily: 'var(--font-vazir)',
                  fontSize: depth > 0 ? 13 : 14.5,
                  fontWeight: isActive ? 800 : depth > 0 ? 500 : 650,
                },
              }}
            />
            {hasChildren && open && (
              <Box
                component="span"
                sx={{
                  display: 'flex',
                  ml: 'auto',
                  color: isActive
                    ? 'var(--color-primary)'
                    : 'var(--color-secondary)',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: (theme) =>
                    theme.transitions.create('transform', {
                      duration: theme.transitions.duration.shorter,
                    }),
                }}
              >
                <MdKeyboardArrowDown />
              </Box>
            )}
          </ListItemButton>
        );
        return (
          <React.Fragment key={`${item.text}-${itemKey}`}>
            <ListItem disablePadding sx={{ display: 'block' }}>
              {open ? (
                button
              ) : (
                <Tooltip title={item.text} placement="right" arrow>
                  {button}
                </Tooltip>
              )}
            </ListItem>
            {item.children && (
              <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
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
          <IconButton onClick={onClose} sx={{ color: 'var(--color-text)' }}>
            <MdClose />
          </IconButton>
        </Toolbar>
        {renderIdentity()}
        {renderNavItems(navItems)}
      </MuiDrawer>
    );
  }

  return (
    <StyledDrawer variant="permanent" open={open}>
      <Toolbar variant="dense" sx={{ minHeight: 52 }} />
      {renderIdentity()}
      {renderNavItems(navItems)}
      <Typography
        variant="h6"
        color="var(--color-secondary)"
        sx={{
          fontSize: 13,
          pb: 1.5,
          mt: 'auto',
          textAlign: 'center',
          visibility: open ? 'visible' : 'hidden',
        }}
      >
        نسخه 2
      </Typography>
    </StyledDrawer>
  );
};

export default NavigationDrawer;
