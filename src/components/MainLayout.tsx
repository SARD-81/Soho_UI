import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { MdClose, MdMenu, MdSearch, MdSpaceDashboard } from 'react-icons/md';
import { RiSettings3Fill } from 'react-icons/ri';
import { Outlet } from 'react-router';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../index.css';
import ThemeToggle from './ThemeToggle';
// import { BiHistory } from "react-icons/bi";
// import { FaShare } from "react-icons/fa";

const drawerWidth = 200;

const MainLayout: React.FC = () => {
  const { logout, username } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { text: 'داشبورد', icon: <MdSpaceDashboard />, path: '/dashboard' },
    { text: 'کاربران', icon: <FiUsers />, path: '/users' },
    { text: 'تنظیمات', icon: <RiSettings3Fill />, path: '/settings' },
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
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ transition: { direction: 'left' } }}
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
                onClick={() => setDrawerOpen(false)}
                sx={{
                  color: 'var(--color-bg-primary)',
                  '&:hover': { backgroundColor: 'var(--color-primary)' },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: { sx: { fontFamily: 'var(--font-vazir)' } },
                  }}
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
