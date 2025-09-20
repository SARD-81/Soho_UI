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
                      <FaUser size={16} color="var(--color-primary)" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={loginTextFieldSx}
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
                          <FaEye size={16} color="var(--color-secondary)" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={loginTextFieldSx}
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
  );
}

export default LoginForm;
