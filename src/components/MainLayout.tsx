import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoPersonCircleOutline } from 'react-icons/io5';
import {
  MdClose,
  MdLogout,
  MdMenu,
  MdPowerSettingsNew,
  MdRestartAlt,
  MdWarningAmber,
} from 'react-icons/md';
import { Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePowerAction, type PowerAction } from '../hooks/usePowerAction';
import '../index.css';
import NavigationDrawer from './NavigationDrawer';
import ThemeToggle from './ThemeToggle';

const powerButtonBaseSx = {
  color: '#fff',
  borderRadius: '5px',
  padding: '8px',
  minWidth: 0,
  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.18)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 14px 28px rgba(0, 0, 0, 0.25)',
    filter: 'brightness(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  '&:disabled': {
    opacity: 0.65,
    boxShadow: 'none',
    transform: 'none',
    filter: 'none',
  },
} as const;

const createPowerButtonSx = (gradient: string) => ({
  ...powerButtonBaseSx,
  background: gradient,
});

const COUNTDOWN_DURATION = 5000;

const MainLayout: React.FC = () => {
  const { logout, username } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activePowerAction, setActivePowerAction] =
    useState<PowerAction | null>(null);
  const [isPowerModalOpen, setPowerModalOpen] = useState(false);
  const [pendingPowerAction, setPendingPowerAction] =
    useState<PowerAction | null>(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdownMs, setCountdownMs] = useState(COUNTDOWN_DURATION);
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
      },
    });

  const handleLogout = async () => {
    await logout();
  };

  const resetPowerModalState = () => {
    setPowerModalOpen(false);
    setPendingPowerAction(null);
    setIsCountdownActive(false);
    setCountdownMs(COUNTDOWN_DURATION);
  };

  const handlePowerButtonClick = (action: PowerAction) => {
    setPendingPowerAction(action);
    setCountdownMs(COUNTDOWN_DURATION);
    setIsCountdownActive(false);
    setPowerModalOpen(true);
  };

  const handleConfirmPowerAction = () => {
    if (!pendingPowerAction) {
      return;
    }
    setCountdownMs(COUNTDOWN_DURATION);
    setIsCountdownActive(true);
  };

  const handlePowerModalClose = (
    _event: object,
    reason: 'backdropClick' | 'escapeKeyDown'
  ) => {
    if (isCountdownActive && reason) {
      return;
    }
    resetPowerModalState();
  };

  useEffect(() => {
    if (!isCountdownActive) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    setCountdownMs(COUNTDOWN_DURATION);

    const interval = window.setInterval(() => {
      setCountdownMs((prev) => {
        const next = prev - 100;
        return next > 0 ? next : 0;
      });
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [isCountdownActive]);

  useEffect(() => {
    if (!isCountdownActive || countdownMs > 0) {
      return;
    }

    if (pendingPowerAction) {
      const actionToTrigger = pendingPowerAction;
      setActivePowerAction(actionToTrigger);
      triggerPowerAction(actionToTrigger);
    }

    resetPowerModalState();
  }, [countdownMs, isCountdownActive, pendingPowerAction, triggerPowerAction]);

  const countdownProgress = Math.min(
    1,
    Math.max(0, 1 - countdownMs / COUNTDOWN_DURATION)
  );
  const countdownDegrees = Math.min(360, Math.max(0, countdownProgress * 360));
  const formattedCountdown = (
    (isCountdownActive ? countdownMs : COUNTDOWN_DURATION) / 1000
  ).toFixed(1);

  const getPowerActionTexts = (action: PowerAction | null) => {
    if (action === 'restart') {
      return {
        title: 'راه‌اندازی مجدد سیستم',
        description:
          'با تایید این گزینه، تمام جلسات فعال بسته شده و سیستم پس از چند لحظه دوباره بالا می‌آید.',
        highlight:
          'پس از پایان شمارش معکوس، فرآیند راه‌اندازی مجدد به صورت خودکار آغاز می‌شود.',
        confirmLabel: 'تایید و راه‌اندازی مجدد',
      } as const;
    }

    return {
      title: 'خاموش کردن سیستم',
      description:
        'با تایید این گزینه، سیستم به طور کامل خاموش شده و تمامی کاربران از حساب خود خارج می‌شوند.',
      highlight:
        'پس از پایان شمارش معکوس، سیستم به صورت خودکار خاموش خواهد شد.',
      confirmLabel: 'تایید و خاموش کردن',
    } as const;
  };

  const powerActionTexts = getPowerActionTexts(pendingPowerAction);

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
            <Tooltip title="راه‌اندازی مجدد سیستم" placement="bottom">
              <span>
                <IconButton
                  aria-label="راه‌اندازی مجدد سیستم"
                  onClick={() => handlePowerButtonClick('restart')}
                  disabled={isPowerActionPending}
                  sx={createPowerButtonSx(
                    'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'
                  )}
                >
                  {isPowerActionPending && activePowerAction === 'restart' ? (
                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                  ) : (
                    <MdRestartAlt size={22} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="خاموش کردن سیستم" placement="bottom">
              <span>
                <IconButton
                  aria-label="خاموش کردن سیستم"
                  onClick={() => handlePowerButtonClick('shutdown')}
                  disabled={isPowerActionPending}
                  sx={createPowerButtonSx(
                    'linear-gradient(135deg, #f97316, var(--color-secondary))'
                  )}
                >
                  {isPowerActionPending && activePowerAction === 'shutdown' ? (
                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                  ) : (
                    <MdPowerSettingsNew size={22} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            <ThemeToggle fixed={false} />
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
      <Dialog
        open={isPowerModalOpen}
        onClose={handlePowerModalClose}
        maxWidth="xs"
        fullWidth
        keepMounted
        sx={{
          '& .MuiPaper-root': {
            background:
              'linear-gradient(160deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))',
            borderRadius: 4,
            color: '#fff',
            boxShadow: '0 32px 75px rgba(15, 23, 42, 0.55)',
            overflow: 'hidden',
            border: '1px solid rgba(148, 163, 184, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at center, rgba(248, 113, 113, 0.25), rgba(248, 113, 113, 0.05))',
              color: '#f97316',
              boxShadow: '0 12px 24px rgba(248, 113, 113, 0.25)',
            }}
          >
            <MdWarningAmber size={24} />
          </Box>
          هشدار مهم - {powerActionTexts.title}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Stack spacing={1}>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {powerActionTexts.description}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'var(--color-primary-light)',
                  fontWeight: 600,
                }}
              >
                <span>⚡</span>
                {powerActionTexts.highlight}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2.5}
              alignItems="center"
              justifyContent="space-between"
            >
              <Box
                sx={() => ({
                  position: 'relative',
                  width: { xs: 130, sm: 150 },
                  height: { xs: 130, sm: 150 },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-didot)',
                  fontSize: { xs: '2.4rem', sm: '2.8rem' },
                  fontWeight: 700,
                  color: '#fff',
                  textShadow: '0 10px 30px rgba(15, 23, 42, 0.65)',
                  background:
                    'radial-gradient(circle at center, rgba(15, 23, 42, 0.92) 58%, transparent 59%)',
                  overflow: 'hidden',
                  boxShadow: isCountdownActive
                    ? '0 30px 60px rgba(248, 113, 113, 0.38)'
                    : '0 18px 40px rgba(148, 163, 184, 0.25)',
                  animation: isCountdownActive
                    ? 'countdownPulse 0.85s ease-in-out infinite alternate'
                    : 'idlePulse 3.2s ease-in-out infinite',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '-18%',
                    borderRadius: 'inherit',
                    background: `conic-gradient(from -90deg, rgba(248, 113, 113, 0.95) ${countdownDegrees}deg, rgba(255, 255, 255, 0.08) ${countdownDegrees}deg 360deg)`,
                    filter: 'blur(0px)',
                    animation: isCountdownActive
                      ? 'orbitGlow 1.1s linear infinite'
                      : 'haloGlow 4s ease-in-out infinite',
                    opacity: 0.92,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: '16%',
                    borderRadius: 'inherit',
                    background:
                      'linear-gradient(160deg, rgba(30, 58, 138, 0.92), rgba(220, 38, 38, 0.85))',
                    boxShadow: 'inset 0 12px 26px rgba(15, 23, 42, 0.85)',
                    opacity: 0.9,
                  },
                  '& > span': {
                    position: 'relative',
                    zIndex: 1,
                  },
                  '@keyframes orbitGlow': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                  },
                  '@keyframes haloGlow': {
                    '0%, 100%': { opacity: 0.55, transform: 'scale(1)' },
                    '50%': { opacity: 0.85, transform: 'scale(1.03)' },
                  },
                  '@keyframes countdownPulse': {
                    from: { transform: 'scale(0.96)' },
                    to: { transform: 'scale(1.02)' },
                  },
                  '@keyframes idlePulse': {
                    '0%, 100%': { transform: 'scale(0.98)' },
                    '50%': { transform: 'scale(1.01)' },
                  },
                })}
              >
                <span>{formattedCountdown}</span>
              </Box>
              <Stack spacing={1.2} sx={{ maxWidth: 260 }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.85 }}>
                  لطفاً پیش از ادامه اطمینان حاصل کنید که تمام اطلاعات ذخیره شده و
                  کاربران از فعالیت‌های حساس خود خارج شده‌اند.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: isCountdownActive
                      ? 'var(--color-secondary)'
                      : 'var(--color-primary-light)',
                    fontWeight: 600,
                  }}
                >
                  {isCountdownActive
                    ? 'شمارش معکوس آغاز شده است؛ برای توقف عملیات از دکمه لغو اضطراری استفاده کنید.'
                    : 'با فشردن دکمه تایید، شمارش معکوس ۵ ثانیه‌ای آغاز خواهد شد.'}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Button
            onClick={resetPowerModalState}
            variant="outlined"
            sx={{
              flexGrow: 1,
              borderColor: 'rgba(148, 163, 184, 0.35)',
              color: '#e2e8f0',
              fontWeight: 600,
              '&:hover': {
                borderColor: 'rgba(248, 113, 113, 0.75)',
                background: 'rgba(248, 113, 113, 0.08)',
              },
            }}
          >
            لغو اضطراری
          </Button>
          <Button
            onClick={handleConfirmPowerAction}
            variant="contained"
            disabled={isCountdownActive || !pendingPowerAction}
            startIcon={
              pendingPowerAction === 'restart' ? (
                <MdRestartAlt />
              ) : (
                <MdPowerSettingsNew />
              )
            }
            sx={{
              flexGrow: 1,
              background:
                pendingPowerAction === 'restart'
                  ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))'
                  : 'linear-gradient(135deg, #f97316, var(--color-secondary))',
              boxShadow: '0 18px 36px rgba(15, 23, 42, 0.35)',
              fontWeight: 700,
              '&:hover': {
                background:
                  pendingPowerAction === 'restart'
                    ? 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))'
                    : 'linear-gradient(135deg, var(--color-secondary), #f97316)',
              },
            }}
          >
            {powerActionTexts.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MainLayout;
