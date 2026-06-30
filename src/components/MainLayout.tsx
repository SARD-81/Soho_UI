import {
  AppBar,
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { LuMoon, LuSun } from 'react-icons/lu';
import { MdClose, MdLogout, MdMenu } from 'react-icons/md';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import useLogout from '../hooks/useLogout';
import { usePowerAction, type PowerAction } from '../hooks/usePowerAction';
import { useSessionActivityTimeout } from '../hooks/useSessionActivityTimeout';
import NavigationDrawer from './NavigationDrawer';
import NotificationBell from './notifications/NotificationBell';
import NotificationBootstrapper from './notifications/NotificationBootstrapper';
import PowerActionConfirmDialog from './PowerActionConfirmDialog';
import PowerActionCountdownOverlay from './PowerActionCountdownOverlay';
import QuickActionsMenu from './QuickActionsMenu';

const MainLayout: React.FC = () => {
  const Navigate = useNavigate();
  const location = useLocation();
  const { logout, username } = useAuth();
  const { logout: triggerLogout, isLoggingOut } = useLogout();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activePowerAction, setActivePowerAction] =
    useState<PowerAction | null>(null);
  const [confirmationAction, setConfirmationAction] =
    useState<PowerAction | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [countdownAction, setCountdownAction] = useState<PowerAction | null>(
    null
  );
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const isUserMenuOpen = Boolean(userMenuAnchorEl);

  const { isDark, toggleTheme } = useThemeContext();

  const displayUsername = username || 'admin';
  const notificationUserKey = username || undefined;

  useSessionActivityTimeout({
    enabled: true,
    onTimeout: async () => {
      try {
        await logout();
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[auth] idle timeout logout request failed', error);
        }
      } finally {
        toast.error(
          'نشست شما به دلیل عدم فعالیت منقضی شد. لطفاً دوباره وارد شوید.'
        );
        Navigate('/login', { replace: true });
      }
    },
  });

  const { mutate: triggerPowerAction, isPending: isPowerActionPending } =
    usePowerAction({
      onSuccess: (_data, action) => {
        const successMessage =
          action === 'reboot'
            ? 'سیستم در حال راه‌اندازی مجدد است.'
            : 'سیستم در حال خاموش شدن است.';
        toast.success(successMessage);
        Navigate('/login');
      },
      onError: (message, action) => {
        const actionLabel =
          action === 'reboot' ? 'راه‌اندازی مجدد' : 'خاموش کردن';
        toast.error(`${actionLabel} سیستم با خطا مواجه شد: ${message}`);
      },
      onSettled: () => {
        setActivePowerAction(null);
        setSecondsRemaining(5);
      },
    });

  const clearCountdownTimer = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const handlePowerActionRequest = (action: PowerAction) => {
    setConfirmationAction(action);
    setIsConfirmationOpen(true);
  };

  const handleDialogClose = () => {
    setIsConfirmationOpen(false);
    setConfirmationAction(null);
  };

  const startCountdown = (action: PowerAction) => {
    clearCountdownTimer();
    setCountdownAction(action);
    setSecondsRemaining(5);
    countdownTimerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearCountdownTimer();
          setCountdownAction(null);
          setActivePowerAction(action);
          triggerPowerAction(action);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDialogConfirm = () => {
    if (!confirmationAction) {
      return;
    }
    setIsConfirmationOpen(false);
    startCountdown(confirmationAction);
    setConfirmationAction(null);
  };

  const handleCountdownCancel = () => {
    clearCountdownTimer();
    setCountdownAction(null);
    setSecondsRemaining(5);
    setActivePowerAction(null);
  };

  useEffect(() => {
    return () => {
      clearCountdownTimer();
    };
  }, []);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100svh',
        fontFamily: 'var(--font-vazir)',
        background: 'var(--color-background)',
        backgroundSize: '400% 400%',
      }}
    >
      <NotificationBootstrapper userKey={notificationUserKey} />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background:
            'linear-gradient(90deg, color-mix(in srgb, var(--color-card-bg) 94%, var(--color-primary) 6%), var(--color-card-bg))',
          backdropFilter: 'saturate(155%) blur(14px)',
          borderBottom:
            '1px solid color-mix(in srgb, var(--color-input-border) 68%, transparent)',
          boxShadow: (theme) =>
            `0 14px 34px ${alpha(
              theme.palette.common.black,
              theme.palette.mode === 'dark' ? 0.24 : 0.08
            )}, inset 0 -1px 0 ${alpha(theme.palette.common.white, 0.05)}`,
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            gap: { xs: 1, sm: 1.5 },
            minHeight: { xs: 58, sm: 62 },
            flexWrap: 'nowrap',
            alignItems: 'center',
            width: '100%',
            px: { xs: 1, sm: 2 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              minWidth: 0,
            }}
          >
            <IconButton
              aria-label={
                drawerOpen ? 'بستن منوی کناری' : 'باز کردن منوی کناری'
              }
              onClick={() => setDrawerOpen((prev) => !prev)}
              sx={{
                color: 'var(--color-text)',
                border:
                  '1px solid color-mix(in srgb, var(--color-input-border) 62%, transparent)',
                backgroundColor:
                  'color-mix(in srgb, var(--color-background) 54%, transparent)',
                '&:hover': {
                  backgroundColor:
                    'color-mix(in srgb, var(--color-primary) 14%, transparent)',
                },
              }}
            >
              {drawerOpen ? <MdClose /> : <MdMenu />}
            </IconButton>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
              }}
            >
              <Box
                component="img"
                src="/logo/Logo.png"
                alt="لوگو"
                sx={{
                  height: 32,
                  width: 32,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.22))',
                }}
              />
              <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    color: 'var(--color-primary)',
                    flexShrink: 0,
                    fontFamily: 'var(--font-didot)',
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >استورکس</Typography>
                <Typography
                  component="div"
                  sx={{
                    color: 'var(--color-secondary)',
                    fontSize: 12,
                    letterSpacing: '0.18em',
                    lineHeight: 2.4,
                    textTransform: 'uppercase',
                  }}
                >ذخیره‌ساز اداری هوشمند</Typography>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 0.75, sm: 1.25 },
              ml: 'auto',
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 999,
                border:
                  '1px solid color-mix(in srgb, var(--color-input-border) 54%, transparent)',
                backgroundColor:
                  'color-mix(in srgb, var(--color-background) 48%, transparent)',
              }}
            >
              <NotificationBell userKey={notificationUserKey} />
            </Box>
            {isMobile ? (
              <IconButton
                aria-label="منوی کاربر"
                onClick={handleUserMenuOpen}
                size="small"
                sx={{
                  color: 'var(--color-text)',
                  border:
                    '1px solid color-mix(in srgb, var(--color-input-border) 58%, transparent)',
                  backgroundColor:
                    'color-mix(in srgb, var(--color-background) 50%, transparent)',
                }}
              >
                <IoPersonCircleOutline size={24} />
              </IconButton>
            ) : (
              <Button
                onClick={handleUserMenuOpen}
                endIcon={<IoPersonCircleOutline size={24} />}
                sx={{
                  color: 'var(--color-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 999,
                  fontFamily: 'var(--font-vazir)',
                  fontWeight: 500,
                  backgroundColor:
                    'color-mix(in srgb, var(--color-background) 50%, transparent)',
                  border:
                    '1px solid color-mix(in srgb, var(--color-input-border) 58%, transparent)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  transition:
                    'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                  '&:hover': {
                    backgroundColor:
                      'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                    borderColor:
                      'color-mix(in srgb, var(--color-primary) 38%, var(--color-input-border))',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.82rem',
                    fontWeight: 400,
                    color: 'var(--color-secondary)',
                  }}
                >
                  خوش آمدید،
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-didot)',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    color: 'var(--color-primary)',
                  }}
                >
                  {displayUsername}
                </Typography>
              </Button>
            )}
            <Menu
              anchorEl={userMenuAnchorEl}
              open={isUserMenuOpen}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                elevation: 0,
                sx: (theme) => ({
                  mt: 1.5,
                  minWidth: 220,
                  px: 1,
                  py: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(20, 20, 20, 0.08)'
                  }`,
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? alpha('#121212', 0.92)
                      : alpha('#ffffff', 0.95),
                  backdropFilter: 'blur(12px)',
                  boxShadow:
                    '0px 12px 30px rgba(15, 23, 42, 0.18), 0px 2px 8px rgba(15, 23, 42, 0.12)',
                }),
              }}
              MenuListProps={{
                sx: {
                  py: 0,
                  '& .MuiMenuItem-root': {
                    borderRadius: 1,
                    px: 2,
                    py: 1.25,
                    typography: 'body2',
                    color: 'var(--color-text)',
                    transition:
                      'background-color 0.2s ease, transform 0.2s ease',
                    '&:not(:last-of-type)': {
                      mb: 0.5,
                    },
                    '&:hover': {
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateX(-3px)',
                    },
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  toggleTheme();
                }}
                sx={{
                  '& .MuiListItemIcon-root': {
                    color: 'var(--color-primary-light)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isDark ? (
                    <LuSun size={20} color="var(--color-primary-light)" />
                  ) : (
                    <LuMoon size={20} color="var(--color-bg-primary)" />
                  )}
                </ListItemIcon>
                <ListItemText
                  sx={{ color: 'var(--color-text)' }}
                  primary={`تغییر به ${isDark ? 'حالت روشن' : 'حالت تیره'}`}
                />
              </MenuItem>
              <MenuItem
                disabled={isLoggingOut}
                onClick={() => {
                  handleUserMenuClose();
                  triggerLogout();
                }}
                sx={{
                  '& .MuiListItemIcon-root': {
                    color: 'var(--color-text)',
                  },
                  '&:hover .MuiListItemIcon-root': {
                    color: 'var(--color-primary-light)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <MdLogout />
                </ListItemIcon>
                <ListItemText
                  sx={{ color: 'var(--color-text)' }}
                  primary="خروج"
                />
              </MenuItem>
            </Menu>
            <QuickActionsMenu
              onPowerActionRequest={handlePowerActionRequest}
              isPowerActionDisabled={
                isPowerActionPending || Boolean(countdownAction)
              }
              activePowerAction={activePowerAction}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <NavigationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <Box
        component="main"
        sx={(theme) => ({
          flexGrow: 1,
          p: 3,
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        })}
      >
        <Toolbar />
        <Box key={location.pathname}>
          <Outlet />
        </Box>
      </Box>
      <PowerActionConfirmDialog
        open={isConfirmationOpen}
        action={confirmationAction}
        onCancel={handleDialogClose}
        onConfirm={handleDialogConfirm}
      />
      <PowerActionCountdownOverlay
        action={countdownAction}
        secondsRemaining={secondsRemaining}
        onCancel={handleCountdownCancel}
      />
    </Box>
  );
};

export default MainLayout;
