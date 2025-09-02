import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const MainLayout: React.FC = () => {
  const { logout, username } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Soho Dashboard
          </Typography>
          <Typography variant="body1" sx={{ marginRight: 2 }}>
            Welcome, {username}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
