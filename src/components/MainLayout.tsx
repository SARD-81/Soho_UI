import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdClose, MdLogout, MdMenu } from 'react-icons/md';
import { Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePowerAction, type PowerAction } from '../hooks/usePowerAction';
import '../index.css';
import NavigationDrawer from './NavigationDrawer';
import PowerActionConfirmDialog from './PowerActionConfirmDialog';
import PowerActionCountdownOverlay from './PowerActionCountdownOverlay';
import QuickActionsMenu from './QuickActionsMenu';


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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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