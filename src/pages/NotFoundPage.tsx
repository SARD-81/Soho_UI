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
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 25%, rgba(35,167,213,0.18), transparent 60%), ' +
            'radial-gradient(circle at 80% 15%, rgba(0,198,169,0.14), transparent 55%), ' +
            'radial-gradient(circle at 75% 80%, rgba(163,146,75,0.12), transparent 50%)',
          backgroundSize: '180% 180%',
          animation: 'gradientMove 22s ease infinite',
          opacity: 0.75,
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
          background: 'linear-gradient(140deg, rgba(35,167,213,0.24), rgba(0,198,169,0.18))',
          filter: 'blur(0px)',
          opacity: 0.55,
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
          background: 'linear-gradient(160deg, rgba(163,146,75,0.22), rgba(35,167,213,0.14))',
          filter: 'blur(0px)',
          opacity: 0.5,
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
          backgroundColor: 'var(--color-card-bg)',
          backdropFilter: 'saturate(160%) blur(12px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: (theme) =>
            `0 18px 48px ${
              theme.palette.mode === 'dark' ? '#00000088' : '#00000022'
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
              color: 'var(--color-primary)',
              letterSpacing: { xs: '-0.08em', md: '-0.1em' },
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
              صفحه درخواستی شما در دسترس نیست
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
              ممکن است نشانی که وارد کرده‌اید تغییر یافته باشد یا موقتاً در دسترس نباشد. لطفاً برای ادامه از گزینه‌های زیر استفاده کنید تا به مسیر مناسب هدایت شوید.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                maxWidth: 520,
                mx: 'auto',
                color: 'var(--color-text-secondary, rgba(0, 0, 0, 0.7))',
                lineHeight: 1.9,
              }}
            >
              در صورت نیاز می‌توانید با تیم پشتیبانی سامانه مکاتبه کنید تا در کوتاه‌ترین زمان ممکن راهنمایی لازم ارائه شود.
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
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                color: 'var(--color-bg-primary)',
                backgroundColor: 'var(--color-primary)',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.18)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-light)',
                  boxShadow: '0 14px 32px rgba(0, 0, 0, 0.22)',
                },
              }}
            >
              {isAuthenticated ? 'بازگشت به پیشخوان سامانه' : 'ورود به صفحه ورود'}
            </Button>

            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<MdArrowBack size={22} />}
              sx={{
                minWidth: { xs: '100%', sm: 220 },
                borderRadius: '12px',
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                borderWidth: 2,
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
