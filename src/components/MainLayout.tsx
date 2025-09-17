import {
  AppBar,
  Box,
  Button,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdClose, MdLogout, MdMenu, MdSearch } from 'react-icons/md';
import { Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';
import NavigationDrawer from './NavigationDrawer';
import ThemeToggle from './ThemeToggle';

const MainLayout: React.FC = () => {
  const { logout, username } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = async () => {
    await logout();
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
            سوهو
          </Typography>
          <TextField
            placeholder="جستجو..."
            size={'small'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                sx: {
                  padding: '6px 8px',
                  height: '28px',
                  fontSize: '0.8rem',
                  color: 'var(--color-bg-primary)',
                  '&::placeholder': {
                    color: 'var(--color-bg-primary)',
                    opacity: 0.7,
                  },
                },
                endAdornment: (
                  <IconButton
                    size="small"
                    sx={{
                      color: 'var(--color-bg-primary)',
                      padding: '4px',
                      marginRight: '-4px',
                    }}
                  >
                    <MdSearch />
                  </IconButton>
                ),
              },
            }}
            sx={{
              order: { xs: 4, sm: 'initial' },
              flexGrow: { xs: 1, md: 0.3 },
              width: { xs: '100%', md: 'auto' },
              mr: { xs: 0, md: 4 },
              mt: { xs: 1, sm: 0 },
              '& .MuiOutlinedInput-input::placeholder': {
                color: 'var(--color-bg-primary)',
              },
              '& .MuiOutlinedInput-input': {
                height: 1,
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'var(--color-input-bg)',
                borderRadius: '10px',
              },
            }}
          />
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
                  borderRadius: '10px',
                  '&:hover': {
                    backgroundColor: 'unset',
                    border: '2px solid var(--color-primary)',
                    borderRadius: '10px',
                  },
                }}
              >
                خروج
              </Button>
            )}
            <ThemeToggle fixed={false} />
          </Box>
        </Toolbar>
      </AppBar>
      <NavigationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
