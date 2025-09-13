import {
  AppBar,
  Box,
  Button,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { MdClose, MdMenu, MdSearch } from 'react-icons/md';
import { Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';
import NavigationDrawer from './NavigationDrawer';
import ThemeToggle from './ThemeToggle';

const MainLayout: React.FC = () => {
  const { logout, username } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        <Toolbar variant="dense" sx={{ gap: 2, minHeight: '40px' }}>
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
            sx={{ flexGrow: 0.1, color: 'var(--color-primary)' }}
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
              flexGrow: 1,
              marginRight: 125,
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
          <Typography sx={{ mx: 2, color: 'var(--color-bg-primary)' }}>
            خوش آمدید، {username}
          </Typography>
          <Button
            onClick={handleLogout}
            sx={{
              color: 'var(--color-bg-primary)',
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
          <ThemeToggle fixed={false} />
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
