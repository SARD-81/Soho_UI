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
import { MdClose, MdLogout, MdMenu } from 'react-icons/md';
import { LuMoon, LuSun } from 'react-icons/lu';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import { usePowerAction, type PowerAction } from '../hooks/usePowerAction';
import useLogout from '../hooks/useLogout';
import NavigationDrawer from './NavigationDrawer';
import PowerActionConfirmDialog from './PowerActionConfirmDialog';
import PowerActionCountdownOverlay from './PowerActionCountdownOverlay';
import QuickActionsMenu from './QuickActionsMenu';
import PinnedCompareTray from './common/PinnedCompareTray';


const MainLayout: React.FC = () => {
  const Navigate = useNavigate();
  const { username } = useAuth();
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
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const isUserMenuOpen = Boolean(userMenuAnchorEl);

  const { isDark, toggleTheme } = useThemeContext();

  const displayUsername = username || 'admin';

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
            {isMobile ? (
              <IconButton
                aria-label="منوی کاربر"
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ color: 'var(--color-bg-primary)' }}
              >
                <IoPersonCircleOutline size={24} />
              </IconButton>
            ) : (
              <Button
                onClick={handleUserMenuOpen}
                endIcon={<IoPersonCircleOutline size={24} />}
                sx={{
                  color: 'var(--color-bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  fontFamily: 'var(--font-vazir)',
                  fontWeight: 500,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.9rem',
                    fontWeight: 400,
                    color: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.7)'
                        : 'rgba(0, 0, 0, 0.7)',
                  }}
                >
                  خوش آمدید،
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '1rem',
                    fontFamily: 'var(--font-didot)',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    color: 'var(--color-primary-light)',
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
                <ListItemText sx={{color : "var(--color-text)"}} primary={`تغییر به ${
                  isDark ? 'حالت روشن' : 'حالت تیره'
                }`} />
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
                <ListItemText sx={{color : "var(--color-text)"}} primary="خروج" />
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
        <Outlet />
        <PinnedCompareTray />
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