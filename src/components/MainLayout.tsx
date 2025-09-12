import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { MdClose, MdMenu, MdSearch } from 'react-icons/md';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const { logout, username } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { text: 'داشبورد', path: '/dashboard' },
    { text: 'کاربران', path: '/users' },
    { text: 'تنظیمات', path: '/settings' },

  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100svh',
        fontFamily: 'var(--font-vazir)',
        background: 'linear-gradient(-45deg,#4f85bb,#63b6db,#23a6d5,#23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientMove 15s ease infinite',
        '@keyframes gradientMove': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
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
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            onClick={() => setDrawerOpen((prev) => !prev)}
            sx={{ color: 'var(--color-bg-primary)' }}
          >
            {drawerOpen ? <MdClose /> : <MdMenu />}
          </IconButton>
          <Box component="img" src="/logo/Logo.png" alt="لوگو" sx={{ height: 40 }} />

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: 'var(--color-primary)' }}
          >
            داشبورد سوهو
          </Typography>
          <TextField
            size="small"
            placeholder="جستجو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton sx={{ color: 'var(--color-bg-primary)' }}>
                  <MdSearch />
                </IconButton>
              ),
            }}

            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'var(--color-input-bg)',
                borderRadius: 1,
              },
            }}
          />
          <Typography sx={{ mx: 2, color: 'var(--color-bg-primary)' }}>
            خوش آمدید، {username}
          </Typography>
          <Button
            onClick={handleLogout}
            sx={{ color: 'var(--color-bg-primary)' }}
          >
            خروج

          </Button>
          <ThemeToggle fixed={false} />
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        SlideProps={{ direction: 'left' }}
        sx={{

          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: 'var(--color-card-bg)',
            backdropFilter: 'saturate(140%) blur(8px)',
          },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box component="img" src="/logo/Logo.png" alt="لوگو" sx={{ height: 40 }} />
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: 'var(--color-bg-primary)' }}
          >
            <MdClose />
          </IconButton>
        </Toolbar>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  color: 'var(--color-bg-primary)',
                  '&:hover': { backgroundColor: 'var(--color-input-bg)' },
                }}
              >

                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontFamily: 'var(--font-vazir)' }}
                />

              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>

        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
