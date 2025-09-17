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
            'radial-gradient(circle at 15% 20%, rgba(0,198,169,0.25), transparent 60%), ' +
            'radial-gradient(circle at 80% 0%, rgba(35,167,213,0.22), transparent 50%), ' +
            'radial-gradient(circle at 85% 85%, rgba(163,146,75,0.18), transparent 45%)',
          backgroundSize: '200% 200%',
          animation: 'gradientMove 18s ease infinite',
          opacity: 0.85,
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
          background: 'linear-gradient(140deg, rgba(35,167,213,0.35), rgba(0,198,169,0.25))',
          filter: 'blur(0px)',
          opacity: 0.6,
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
          background: 'linear-gradient(160deg, rgba(163,146,75,0.28), rgba(35,167,213,0.18))',
          filter: 'blur(0px)',
          opacity: 0.55,
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
          boxShadow: (theme) =>
            `0 24px 60px ${
              theme.palette.mode === 'dark' ? '#000000aa' : '#00000033'
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
              backgroundImage:
                'linear-gradient(120deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
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
              اوه! صفحه مورد نظر پیدا نشد
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
              ممکن است مسیر حذف شده باشد یا هرگز وجود نداشته است. آدرس وارد شده را بررسی کنید یا یکی از گزینه‌های زیر را برای ادامه انتخاب نمایید.
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
                borderRadius: '14px',
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--color-bg-primary)',
                backgroundImage:
                  'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                boxShadow: '0 16px 34px rgba(0, 198, 169, 0.35)',
                '&:hover': {
                  backgroundImage:
                    'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
                  boxShadow: '0 18px 40px rgba(0, 198, 169, 0.45)',
                },
              }}
            >
              {isAuthenticated ? 'بازگشت به داشبورد' : 'بازگشت به صفحه ورود'}
            </Button>

            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<MdArrowBack size={22} />}
              sx={{
                minWidth: { xs: '100%', sm: 220 },
                borderRadius: '14px',
                py: 1.5,
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
              بازگشت به صفحه قبل
            </Button>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              color: 'var(--color-text)',
              opacity: 0.8,
            }}
          >
            کد خطا: 404
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
