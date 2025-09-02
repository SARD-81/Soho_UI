import { zodResolver } from '@hookform/resolvers/zod';
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
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import { LuLogIn } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle.tsx';
import { useAuth } from '../contexts/AuthContext';
import { useLogin } from '../hooks/useLogin';
import '../index.css';
import { type LoginFormData, loginSchema } from '../schemas/authSchema';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, isError, error, isSuccess } = useLogin();
  const { loginAction } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');
  const username = watch('username');
  const password = watch('password');

  useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = sessionStorage.getItem('savedPassword');
    if (savedUsername) setValue('username', savedUsername);
    if (savedPassword) setValue('password', savedPassword);
    if (savedUsername || savedPassword) {
      setValue('rememberMe', true);
    }
  }, [setValue]);

  useEffect(() => {
    if (rememberMe) {
      if (username) localStorage.setItem('savedUsername', username);
      if (password) sessionStorage.setItem('savedPassword', password);
    } else {
      localStorage.removeItem('savedUsername');
      sessionStorage.removeItem('savedPassword');
    }
  }, [rememberMe, username, password]);

  const onSubmit = (data: LoginFormData) => {
    login(
      { username: data.username, password: data.password },
      {
        onSuccess: (response) => {
          loginAction(response.token, data.username);
          navigate('/dashboard');
        },
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('ورود موفقیت‌آمیز بود!');
    } else if (isError) {
      toast.error(
        error?.message || 'ورود ناموفق! لطفا اطلاعات خود را بررسی کنید.'
      );
    }
  }, [isSuccess, isError, error]);

  return (
    <>
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
          background: 'linear-gradient(-45deg,#4f85bb,#63b6db,#23a6d5,#23d5ab)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 15s ease infinite',
          '@keyframes gradientMove': {
            '0%': {
              backgroundPosition: '0% 50%',
            },
            '50%': {
              backgroundPosition: '100% 50%',
            },
            '100%': {
              backgroundPosition: '0% 50%',
            },
          },
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
            <Stack spacing={2.5} alignItems="center">
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
                  fontWeight={900}
                  letterSpacing={0.4}
                  sx={{
                    marginTop: '-15px',
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-didot)',
                  }}
                >
                  Soho
                </Typography>
              </Box>

              <Box textAlign="center">
                <Typography
                  variant="h5"
                  fontWeight={600}
                  letterSpacing={0.4}
                  sx={{ color: 'var(--color-primary)' }}
                >
                  خوش آمدید
                </Typography>
              </Box>

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ width: '100%' }}
              >
                <Stack spacing={2.25}>
                  {/* Username Field */}
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="نام کاربری"
                        autoComplete="username"
                        fullWidth
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <FaUser
                                  size={16}
                                  color="var(--color-primary)"
                                />
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
                            '&.Mui-error': {
                              borderColor: '#d32f2f',
                            },
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: '12px 14px',
                          },
                        }}
                      />
                    )}
                  />

                  {/* Password Field */}
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        placeholder="رمز عبور"
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <FaLock
                                  size={16}
                                  color="var(--color-primary)"
                                />
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
                            '&.Mui-error': {
                              borderColor: '#d32f2f',
                            },
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: '12px 14px',
                          },
                        }}
                      />
                    )}
                  />
                  <Box textAlign="center">
                    <Typography
                      variant="body2"
                      sx={{ mt: 0.5, color: 'var(--color-secondary)' }}
                    >
                      لطفا برای ادامه وارد شوید
                    </Typography>
                  </Box>

                  {/* Remember Me Checkbox */}
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            sx={{
                              color: 'var(--color-secondary)',
                              '&.Mui-checked': {
                                color: 'var(--color-primary)',
                              },
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
                    )}
                  />

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
