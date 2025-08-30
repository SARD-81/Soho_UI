import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import { LuLogIn } from 'react-icons/lu';
import ThemeToggle from '../components/ThemeToggle.tsx';
import { useLogin } from '../hooks/useLogin';
import '../index.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem('rememberMe') === 'true'
  );
  const [focusedUsername, setFocusedUsername] = useState(false);

  const { mutate: login, isPending, isError, error, isSuccess } = useLogin();

  useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = sessionStorage.getItem('savedPassword');
    if (savedUsername) setUsername(savedUsername);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  useEffect(() => {
    localStorage.setItem('rememberMe', String(rememberMe));
    if (rememberMe) {
      if (username) localStorage.setItem('savedUsername', username);
      if (password) sessionStorage.setItem('savedPassword', password);
    } else {
      localStorage.removeItem('savedUsername');
      sessionStorage.removeItem('savedPassword');
    }
  }, [rememberMe, username, password]);

  // Show toast based on login status
  useEffect(() => {
    if (isSuccess) {
      toast.success('ورود موفقیت‌آمیز بود!');
    } else if (isError) {
      toast.error(
        error?.message || 'ورود ناموفق! لطفا اطلاعات خود را بررسی کنید.'
      );
    }
  }, [isSuccess, isError, error]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ username, password });
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-card-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-primary)',
            borderRadius: '8px',
            fontFamily: 'var(--font-vazir)',
            direction: 'rtl',
          },
          success: {
            iconTheme: {
              primary: 'var(--color-primary)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
      <Box
        component="main"
        sx={{
          minHeight: '100svh',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          px: 2,
          py: { xs: 6, md: 8 },
          fontFamily: 'var(--font-vazir)',
          bgcolor: 'var(--color-primary)',
        }}
      >
        <Card
          elevation={10}
          sx={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 4,
            backdropFilter: 'saturate(140%) blur(8px)',
            bgcolor: 'var(--color-card-bg)',
            boxShadow: (theme) =>
              `0 10px 30px ${
                theme.palette.mode === 'dark' ? '#00000066' : '#00000022'
              }`,
            transition: 'transform 250ms ease, box-shadow 250ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: (theme) =>
                `0 14px 38px ${
                  theme.palette.mode === 'dark' ? '#00000088' : '#00000033'
                }`,
            },
            fontFamily: 'var(--font-vazir)',
          }}
          className="shadow-2xl"
        >
          <ThemeToggle />
          <CardContent sx={{ p: { xs: 4, md: 5 } }}>
            <Stack spacing={3} alignItems="center">
              <Box sx={{ width: 100, height: 100 }}>
                <img
                  src="/logo/Logo.png"
                  alt="لوگو"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              <Box textAlign="center">
                <Typography
                  variant="h4"
                  fontWeight={800}
                  letterSpacing={0.4}
                  sx={{ color: 'var(--color-primary)' }}
                >
                  خوش آمدید
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, color: 'var(--color-secondary)' }}
                >
                  لطفا برای ادامه وارد شوید
                </Typography>
              </Box>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: '100%' }}
              >
                <Stack spacing={2.25}>
                  <TextField
                    placeholder={
                      focusedUsername ? 'behrooz mohammadi nasab' : 'نام کاربری'
                    }
                    autoComplete="username"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedUsername(true)}
                    onBlur={() => setFocusedUsername(false)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaUser size={16} color="var(--color-primary)" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        color: 'var(--color-text)',
                        backgroundColor: 'var(--color-input-bg)',
                        border: '1px solid var(--color-input-border)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'var(--color-input-bg)',
                          borderColor: 'var(--color-primary-light)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'var(--color-input-bg)',
                          borderColor: 'var(--color-primary)',
                          boxShadow: '0 0 0 3px rgba(126, 87, 194, 0.1)',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '12px 14px',
                      },
                      '& label': {
                        color: 'var(--color-secondary)',
                        fontWeight: 500,
                      },
                      '& label.Mui-focused': {
                        color: 'var(--color-primary)',
                      },
                    }}
                  />

                  <TextField
                    placeholder="رمز عبور"
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <FaLock size={16} color="var(--color-primary)" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'
                              }
                              onClick={() => setShowPassword((s) => !s)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <FaEyeSlash
                                  size={16}
                                  color="var(--color-secondary)"
                                />
                              ) : (
                                <FaEye
                                  size={16}
                                  color="var(--color-secondary)"
                                />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        color: 'var(--color-text)',
                        backgroundColor: 'var(--color-input-bg)',
                        border: '1px solid var(--color-input-border)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'var(--color-input-bg)',
                          borderColor: 'var(--color-primary-light)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'var(--color-input-bg)',
                          borderColor: 'var(--color-primary)',
                          boxShadow: '0 0 0 3px rgba(126, 87, 194, 0.1)',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '12px 14px',
                      },
                      '& label': {
                        color: 'var(--color-secondary-dark)',
                        fontWeight: 500,
                      },
                      '& label.Mui-focused': {
                        color: 'var(--color-primary)',
                      },
                    }}
                  />

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          sx={{
                            color: 'var(--color-secondary)',
                            '&.Mui-checked': { color: 'var(--color-primary)' },
                          }}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          color="var(--color-secondary)"
                        >
                          مرا به خاطر بسپار
                        </Typography>
                      }
                    />
                  </Stack>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isPending}
                    fullWidth
                    startIcon={
                      isPending ? (
                        <CircularProgress
                          size={18}
                          sx={{ color: 'var(--color-secondary)' }}
                        />
                      ) : (
                        <LuLogIn />
                      )
                    }
                    sx={{
                      py: 1.2,
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      letterSpacing: 0.2,
                      boxShadow: 'none',
                      color: 'var(--color-text)',
                      background: 'var(--color-primary-light)',
                      '&:hover': {
                        boxShadow: 'none',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'transform 180ms ease',
                    }}
                  >
                    {isPending ? 'در حال ورود...' : 'ورود'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
