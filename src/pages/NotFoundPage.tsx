import { Box, Button, Stack, Typography } from '@mui/material';
import { MdArrowBack, MdHome } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        minHeight: { xs: '70svh', md: '80svh' },
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        px: { xs: 2.5, sm: 4 },
        py: { xs: 6, md: 8 },
        backgroundColor: 'var(--color-background)',
        fontFamily: 'var(--font-vazir)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 620,
          textAlign: 'center',
          px: { xs: 4, sm: 6 },
          py: { xs: 5, sm: 7 },
          borderRadius: 3,
          backgroundColor: 'var(--color-card-bg)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(15, 23, 42, 0.08)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 18px 48px rgba(0, 0, 0, 0.5)'
              : '0 16px 44px rgba(15, 23, 42, 0.12)',

        }}
      >
        <Stack spacing={{ xs: 3, sm: 4 }} alignItems="center">
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'var(--font-didot)',
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: '0.12em',
              fontSize: { xs: '3.75rem', sm: '4.5rem', md: '5.5rem' },
              color: 'var(--color-primary)',

            }}
          >
            404
          </Typography>

          <Stack spacing={1.5}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'var(--color-bg-primary)',
              }}
            >
              صفحه مورد نظر یافت نشد

            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 520,
                mx: 'auto',
                color: 'var(--color-text)',
                lineHeight: 1.9,
              }}
            >
              صفحه‌ای که در جستجوی آن هستید در حال حاضر در دسترس نیست. احتمال دارد نشانی تغییر کرده یا صفحه حذف شده باشد. لطفاً نشانی وارد شده را بازبینی کنید یا از گزینه‌های زیر برای ادامه استفاده نمایید.

            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <Button
              variant="contained"
              onClick={handleGoHome}
              startIcon={<MdHome size={22} />}
              sx={{
                minWidth: { xs: '100%', sm: 220 },
                borderRadius: 2,
                py: 1.4,
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
            >
              {isAuthenticated ? 'ورود به داشبورد' : 'ورود به سامانه'}

            </Button>

            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<MdArrowBack size={22} />}
              sx={{
                minWidth: { xs: '100%', sm: 220 },
                borderRadius: 2,
                py: 1.4,

                fontWeight: 600,
                fontSize: '1rem',
                borderWidth: 1.5,
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
                backgroundColor: 'transparent',
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'var(--color-primary-light)',
                  backgroundColor: 'rgba(35, 167, 213, 0.08)',
                },
              }}
            >
              بازگشت به صفحه پیشین
            </Button>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              color: 'var(--color-text)',
              opacity: 0.8,
            }}
          >
            شناسه خطا: ۴۰۴
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
