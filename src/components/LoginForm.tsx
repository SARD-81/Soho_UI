import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
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
import { loginTextFieldSx } from '../constants/loginForm';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLogin } from '../hooks/useLogin';
import { useRememberUsername } from '../hooks/useRememberUsername';
import { type LoginFormData, loginSchema } from '../schemas/authSchema';

function LoginForm() {
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

  useRememberUsername(watch, setValue);

  const onSubmit = (data: LoginFormData) => {
    login(
      { username: data.username, password: data.password },
      {
        onSuccess: (response) => {
          loginAction(response.access, response.refresh, data.username);
          navigate('/dashboard');
        },
      }
    );
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('ورود موفقیت‌آمیز بود!');
    } else if (isError) {
      toast.error('ورود ناموفق! لطفا اطلاعات خود را بررسی کنید.');
      console.error(error?.message);
    }
  }, [isSuccess, isError, error]);

  const fieldLabelSx = {
    pr: 1,
    color: 'var(--color-secondary)',
    fontSize: 12.5,
    fontWeight: 800,
    lineHeight: 1,
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%' }}
    >
      <Stack spacing={2.1}>
        <Stack spacing={0.8}>
          <Typography component="label" sx={fieldLabelSx}>
            نام کاربری
          </Typography>

          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="نام کاربری مدیریتی"
                autoComplete="username"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '12px',
                            color: 'var(--color-primary)',
                            background: 'rgba(99, 182, 219, 0.12)',
                          }}
                        >
                          <FaUser size={15} />
                        </Box>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={loginTextFieldSx}
              />
            )}
          />
        </Stack>

        <Stack spacing={0.8}>
          <Typography component="label" sx={fieldLabelSx}>
            رمز عبور
          </Typography>

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="رمز عبور حساب"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '12px',
                            color: 'var(--color-primary)',
                            background: 'rgba(99, 182, 219, 0.12)',
                          }}
                        >
                          <FaLock size={15} />
                        </Box>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                          onClick={() => setShowPassword((s) => !s)}
                          edge="end"
                          size="small"
                          sx={{
                            color: 'var(--color-secondary)',
                            '&:hover': {
                              color: 'var(--color-primary)',
                              backgroundColor: 'rgba(99, 182, 219, 0.1)',
                            },
                          }}
                        >
                          {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={loginTextFieldSx}
              />
            )}
          />
        </Stack>

        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              sx={{
                width: 'fit-content',
                mx: 0,
                color: 'var(--color-secondary)',
              }}
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
                <Typography variant="body2" color="var(--color-secondary)">
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
              <CircularProgress size={18} sx={{ color: 'currentColor' }} />
            ) : (
              <LuLogIn />
            )
          }
          sx={{
            mt: 0.3,
            py: 1.35,
            borderRadius: '18px',
            textTransform: 'none',
            fontWeight: 900,
            letterSpacing: 0.2,
            boxShadow: '0 16px 34px rgba(35, 166, 213, 0.24)',
            color: '#fff',
            background: 'linear-gradient(135deg, #4f85bb 0%, #23a6d5 52%, #23d5ab 100%)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              transform: 'translateX(110%) skewX(-18deg)',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
              transition: 'transform 420ms ease',
            },
            '&:hover': {
              boxShadow: '0 20px 42px rgba(35, 166, 213, 0.32)',
              transform: 'translateY(-2px)',
            },
            '&:hover::before': {
              transform: 'translateX(-110%) skewX(-18deg)',
            },
            '&.Mui-disabled': {
              color: 'rgba(255,255,255,0.78)',
              background: 'linear-gradient(135deg, #7ca7c7 0%, #70b9d3 100%)',
            },
            transition: 'transform 180ms ease, box-shadow 180ms ease',
          }}
        >
          {isPending ? 'در حال ورود...' : 'ورود به StoreX'}
        </Button>

        <Box
          sx={{
            pt: 1.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* <Typography
            variant="body2"
            sx={{
              px: 1.4,
              py: 0.7,
              borderRadius: '999px',
              color: 'var(--color-secondary)',
              border: '1px solid var(--color-input-border)',
              backgroundColor: 'var(--color-input-bg)',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            نسخه 2
          </Typography> */}
        </Box>
      </Stack>
    </Box>
  );
}

export default LoginForm;
