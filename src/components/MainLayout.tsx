import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { IoPersonCircleOutline } from 'react-icons/io5';
import {
  MdClose,
  MdLogout,
  MdMenu,
  MdPowerSettingsNew,
  MdRestartAlt,
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

const MainLayout: React.FC = () => {
  const { logout, username } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePowerAction, setActivePowerAction] =
    useState<PowerAction | null>(null);
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

  const handlePowerAction = (action: PowerAction) => {
    setActivePowerAction(action);
    triggerPowerAction(action);
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
            variant="h6"
            component="div"
            sx={{ color: 'var(--color-primary)', flexShrink: 0 }}
          >
            ذخیره ساز اداری استورکس
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
                  onClick={() => handlePowerAction('restart')}
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
                  onClick={() => handlePowerAction('shutdown')}
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
    </Box>
  );
};

export default MainLayout;
