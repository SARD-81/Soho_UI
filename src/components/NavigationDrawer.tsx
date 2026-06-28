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
      'linear-gradient(180deg, color-mix(in srgb, var(--color-card-bg) 98%, var(--color-primary) 2%) 0%, var(--color-card-bg) 54%, color-mix(in srgb, var(--color-background) 88%, var(--color-card-bg) 12%) 100%)',
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
  width: 82,
  [theme.breakpoints.up('sm')]: { width: 88 },
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
            if (isItemActive(item) && next[itemKey] === undefined) {
              next[itemKey] = true;
            }
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
        py: open ? 1.2 : 1,
        mx: open ? 1.2 : 1.05,
        mb: open ? 1.15 : 1.35,
        mt: isDesktop ? 0 : 1,
        minHeight: open ? 58 : 54,
        borderRadius: open ? 3 : 2.4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: open ? 'flex-start' : 'center',
        gap: 1.25,
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 18%, var(--color-card-bg) 82%) 0%, color-mix(in srgb, var(--color-card-bg) 88%, var(--color-background) 12%) 58%, color-mix(in srgb, var(--color-secondary) 8%, var(--color-card-bg) 92%) 100%)',
        border:
          '1px solid color-mix(in srgb, var(--color-primary) 22%, var(--color-input-border) 78%)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.08), 0 14px 28px rgba(0,0,0,0.16)',
      }}
    >
      <Box
        component="img"
        src="/logo/Logo.png"
        alt="سوهو"
        sx={{
          width: open ? 34 : 36,
          height: open ? 34 : 36,
          objectFit: 'contain',
          filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.22))',
        }}
      />
      {open && (
        <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
          <Typography
            sx={{
              color: 'var(--color-text)',
              fontFamily: 'var(--font-vazir)',
              fontSize: 17.5,
              fontWeight: 900,
              lineHeight: 1.25,
            }}
          >
            سوهو
          </Typography>
          <Typography
            sx={{
              color: 'var(--color-secondary)',
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: 0,
              lineHeight: 1.6,
            }}
          >
            عملیات ذخیره‌سازی
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
        px: depth === 0 ? (open ? 0.9 : 0.8) : 0,
        py: depth === 0 ? 0.45 : 0,
        position: 'relative',
        ...(open && depth > 0
          ? {
              ml: 2,
              pl: 1.2,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 6,
                bottom: 8,
                left: 11,
                width: 1,
                backgroundColor:
                  'color-mix(in srgb, var(--color-input-border) 72%, transparent)',
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
              minHeight: open ? (depth > 0 ? 34 : 44) : 48,
              position: 'relative',
              overflow: 'hidden',
              justifyContent: open ? 'initial' : 'center',
              px: open ? (depth > 0 ? 1.25 : 1.5) : 0,
              mx: open ? (depth > 0 ? 1.25 : 0.5) : 0.75,
              my: open ? (depth > 0 ? 0.25 : 0.35) : 0.65,
              borderRadius: depth > 0 ? 999 : open ? 2.25 : 2.5,
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: theme.transitions.create(
                ['background-color', 'box-shadow', 'color', 'transform'],
                {
                  duration: theme.transitions.duration.shorter,
                  easing: theme.transitions.easing.easeInOut,
                }
              ),
              border: '1px solid transparent',
              backgroundColor: 'transparent',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: open ? 7 : 10,
                bottom: open ? 7 : 10,
                left: 0,
                width: 3,
                borderRadius: 6,
                backgroundColor: 'var(--color-primary)',
                opacity: 0,
                boxShadow:
                  '0 0 12px color-mix(in srgb, var(--color-primary) 55%, transparent)',
              },
              '&:hover': {
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 5%, var(--color-card-bg) 95%)',
                transform: open && depth === 0 ? 'translateX(2px)' : 'none',
              },
              '&.Mui-selected': {
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 7%, var(--color-card-bg) 93%)',
                border:
                  '1px solid color-mix(in srgb, var(--color-primary) 22%, var(--color-input-border) 78%)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 18px rgba(0,0,0,0.14)',
                color: 'var(--color-text)',
              },
              '&.Mui-selected::before': { opacity: 1 },
              '&.Mui-selected:hover': {
                backgroundColor:
                  'color-mix(in srgb, var(--color-primary) 7%, var(--color-card-bg) 93%)',
              },
            })}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 1.2 : 0,
                width: open ? 'auto' : 40,
                height: open ? 'auto' : 40,
                borderRadius: open ? 0 : 2.25,
                alignItems: 'center',
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
