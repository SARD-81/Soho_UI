import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Divider,
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
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoPersonCircleOutline } from 'react-icons/io5';
import {
  MdArrowDropDown,
  MdClose,
  MdLogout,
  MdMenu,
  MdOutlineSettings,
  MdPowerSettingsNew,
  MdRestartAlt,
} from 'react-icons/md';
import { LuMoon, LuSun } from 'react-icons/lu';
import { Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import { usePowerAction, type PowerAction } from '../hooks/usePowerAction';
import '../index.css';
import NavigationDrawer from './NavigationDrawer';
import PowerActionConfirmDialog from './PowerActionConfirmDialog';
import PowerActionCountdownOverlay from './PowerActionCountdownOverlay';

const MainLayout: React.FC = () => {
  const { logout, username } = useAuth();
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
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const { isDark, toggleTheme } = useThemeContext();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const { mutate: triggerPowerAction, isPending: isPowerActionPending } =
    usePowerAction({
      onSuccess: (_data, action) => {
        const successMessage =
          action === 'restart'
            ? 'سیستم در حال راه‌اندازی مجدد است.'
            : 'سیستم در حال خاموش شدن است.';
        toast.success(successMessage);
      },
      onError: (message, action) => {
        const actionLabel =
          action === 'restart' ? 'راه‌اندازی مجدد' : 'خاموش کردن';
        toast.error(`${actionLabel} سیستم با خطا مواجه شد: ${message}`);
      },
      onSettled: () => {
        setActivePowerAction(null);
        setSecondsRemaining(5);
      },
    });

  const handleLogout = async () => {
    await logout();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMenuPowerAction = (action: PowerAction) => {
    handleMenuClose();
    handlePowerActionRequest(action);
  };

  const handleMenuThemeToggle = () => {
    handleMenuClose();
    toggleTheme();
  };

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
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'var(--color-card-bg)',
          backdropFilter: 'saturate(140%) blur(8px)',
          boxShadow: (theme) =>
            `0 4px 20px ${
              theme.palette.mode === 'dark' ? '#00000066' : '#00000022'
            }`,
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            gap: { xs: 1, sm: 3 },
            // minHeight: '50px',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            alignItems: 'center',
            width: '100%',
          }}
        >
          <IconButton
            onClick={() => setDrawerOpen((prev) => !prev)}
            sx={{ color: 'var(--color-bg-primary)' }}
          >
            {drawerOpen ? <MdClose /> : <MdMenu />}
          </IconButton>
          <Box
            component="img"
            src="/logo/Logo.png"
            alt="لوگو"
            sx={{ height: 30 }}
          />

          <Typography
            variant="h4"
            component="div"
            sx={{
              color: 'var(--color-primary)',
              flexShrink: 0,
              fontFamily: 'var(--font-didot)',
            }}
          >
            StoreX
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 4 },
              ml: 'auto',
              order: { xs: 3, sm: 'initial' },
            }}
          >
            {!isMobile && (
              <Typography
                sx={{
                  color: 'var(--color-bg-primary)',
                  display: 'flex',
                  gap: 1,
                }}
              >
                خوش آمدید، {username} <IoPersonCircleOutline size={24} />
              </Typography>
            )}
            {isMobile ? (
              <IconButton
                aria-label="خروج"
                onClick={handleLogout}
                size="small"
                sx={{ color: 'var(--color-bg-primary)' }}
              >
                <MdLogout />
              </IconButton>
            ) : (
              <Button
                onClick={handleLogout}
                sx={{
                  color: 'var(--color-bg-primary)',
                  height: 30,
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '5px',
                  '&:hover': {
                    backgroundColor: 'unset',
                    border: '2px solid var(--color-primary)',
                    borderRadius: '5px',
                  },
                }}
              >
                خروج
              </Button>
            )}
            <Button
              onClick={handleMenuOpen}
              startIcon={<MdOutlineSettings size={20} />}
              endIcon={<MdArrowDropDown size={20} />}
              sx={{
                background:
                  'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: '#fff',
                borderRadius: '999px',
                px: 2.5,
                py: 1,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                boxShadow: '0 16px 34px rgba(15, 23, 42, 0.35)',
                textTransform: 'none',
                letterSpacing: 0.4,
                '&:hover': {
                  background:
                    'linear-gradient(135deg, var(--color-secondary), var(--color-primary-light))',
                  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.45)',
                },
              }}
            >
              مدیریت سیستم
            </Button>
            <Menu
              anchorEl={menuAnchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: (theme) => ({
                  mt: 1.5,
                  py: 1,
                  px: 0.5,
                  minWidth: 250,
                  borderRadius: 2,
                  backdropFilter: 'blur(16px)',
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 25px 55px rgba(15, 23, 42, 0.65)'
                      : '0 20px 45px rgba(148, 163, 184, 0.45)',
                  background:
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,64,175,0.92))'
                      : 'linear-gradient(145deg, rgba(248,250,252,0.96), rgba(191,219,254,0.92))',
                  border:
                    theme.palette.mode === 'dark'
                      ? '1px solid rgba(96, 165, 250, 0.35)'
                      : '1px solid rgba(59, 130, 246, 0.35)',
                }),
              }}
            >
              <MenuItem
                onClick={() => handleMenuPowerAction('restart')}
                disabled={isPowerActionPending || Boolean(countdownAction)}
                sx={{
                  mx: 0.5,
                  borderRadius: 1.5,
                  gap: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'var(--color-primary)' }}>
                  {isPowerActionPending && activePowerAction === 'restart' ? (
                    <CircularProgress size={18} sx={{ color: 'var(--color-primary)' }} />
                  ) : (
                    <MdRestartAlt size={22} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="راه‌اندازی مجدد سیستم"
                  secondary="اجرای ایمن مجدد سرویس‌ها"
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: 12.5 }}
                />
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuPowerAction('shutdown')}
                disabled={isPowerActionPending || Boolean(countdownAction)}
                sx={{
                  mx: 0.5,
                  borderRadius: 1.5,
                  gap: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: '#f97316' }}>
                  {isPowerActionPending && activePowerAction === 'shutdown' ? (
                    <CircularProgress size={18} sx={{ color: '#f97316' }} />
                  ) : (
                    <MdPowerSettingsNew size={22} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="خاموش کردن سیستم"
                  secondary="پایان دادن ایمن به فعالیت‌ها"
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: 12.5 }}
                />
              </MenuItem>
              <Divider
                sx={{
                  my: 1,
                  borderColor: 'rgba(148, 163, 184, 0.25)',
                }}
              />
              <MenuItem
                onClick={handleMenuThemeToggle}
                sx={{
                  mx: 0.5,
                  borderRadius: 1.5,
                  gap: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'var(--color-primary)' }}>
                  {isDark ? <LuSun size={22} /> : <LuMoon size={22} />}
                </ListItemIcon>
                <ListItemText
                  primary={isDark ? 'فعال‌سازی حالت روشن' : 'فعال‌سازی حالت تاریک'}
                  secondary={
                    isDark
                      ? 'محیطی روشن و پویا برای روز'
                      : 'فضایی آرام و مناسب برای شب'
                  }
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: 12.5 }}
                />
              </MenuItem>
            </Menu>
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
        <Outlet />
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