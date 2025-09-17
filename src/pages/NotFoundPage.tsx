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
      sx={{
        position: 'relative',
        minHeight: { xs: '70svh', md: '80svh' },
        width: '100%',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        px: { xs: 2, sm: 4 },
        py: { xs: 6, md: 8 },
        fontFamily: 'var(--font-vazir)',
        backgroundColor: 'var(--color-bg-body, #f5f7fa)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(35,167,213,0.12), rgba(0,198,169,0.06) 45%, rgba(163,146,75,0.1))',
          backgroundSize: 'cover',
          opacity: 0.9,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: { xs: 200, sm: 260 },
          height: { xs: 200, sm: 260 },
          top: { xs: '-70px', sm: '-90px' },
          right: { xs: '-70px', sm: '-90px' },
          borderRadius: '50%',
          background: 'linear-gradient(150deg, rgba(35,167,213,0.22), rgba(0,198,169,0.12))',
          opacity: 0.4,
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: { xs: 220, sm: 280 },
          height: { xs: 220, sm: 280 },
          bottom: { xs: '-90px', sm: '-110px' },
          left: { xs: '-80px', sm: '-100px' },
          borderRadius: '50%',
          background: 'linear-gradient(160deg, rgba(163,146,75,0.2), rgba(35,167,213,0.14))',
          opacity: 0.35,
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 680,
          textAlign: 'center',
          px: { xs: 4, sm: 6 },
          py: { xs: 6, sm: 8 },
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(18px)',
          border: (theme) =>
            `1px solid ${
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'
            }`,
          boxShadow: (theme) =>
            `0 18px 48px ${
              theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(15,23,42,0.12)'
            }`,
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'var(--font-didot)',
              fontWeight: 700,
              lineHeight: 1,
              fontSize: { xs: '4.5rem', sm: '6rem', md: '7.5rem' },
              letterSpacing: { xs: '0.15rem', sm: '0.3rem', md: '0.4rem' },
              color: 'var(--color-primary)',
            }}
          >
            404
          </Typography>

          <Stack spacing={1.5}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: 'var(--color-bg-primary)',
              }}
            >
              صفحه مورد نظر شما یافت نشد
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 520,
                mx: 'auto',
                color: 'var(--color-text)',
                lineHeight: 1.8,
              }}
            >
              احتمال دارد نشانی وارد شده تغییر کرده یا دیگر در دسترس نباشد. لطفاً نشانی را بازبینی کنید یا یکی از گزینه‌های زیر را برگزینید.
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
                borderRadius: '12px',
                py: 1.4,
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--color-bg-primary)',
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 14px 32px rgba(0, 120, 114, 0.28)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-dark, #028c7f)',
                  boxShadow: '0 16px 40px rgba(0, 120, 114, 0.34)',
                },
              }}
            >
              {isAuthenticated ? 'بازگشت به داشبورد' : 'انتقال به صفحه ورود'}
            </Button>

            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<MdArrowBack size={22} />}
              sx={{
                minWidth: { xs: '100%', sm: 220 },
                borderRadius: '12px',
                py: 1.4,
                fontWeight: 600,
                fontSize: '1rem',
                borderWidth: 2,
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
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
            کد خطا: ۴۰۴
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
