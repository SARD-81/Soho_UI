import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import LoginForm from '../components/LoginForm.tsx';
import ThemeToggle from '../components/ThemeToggle.tsx';

function LoginPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 3 },
        py: { xs: 5, md: 8 },
        fontFamily: 'var(--font-vazir)',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #07111f 0%, #0d1d32 45%, #0b302b 100%)'
            : 'linear-gradient(135deg, #eef7ff 0%, #dcefff 45%, #e6fbf4 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 18% 20%, rgba(99, 182, 219, 0.24), transparent 28%),
            radial-gradient(circle at 82% 24%, rgba(35, 213, 171, 0.2), transparent 30%),
            radial-gradient(circle at 52% 86%, rgba(79, 133, 187, 0.2), transparent 34%)
          `,
          animation: 'loginAura 14s ease-in-out infinite alternate',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
        },
        '@keyframes loginAura': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08) translateY(-12px)' },
        },
        '@keyframes loginCardIn': {
          '0%': { opacity: 0, transform: 'translateY(18px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      }}
    >
      <ThemeToggle
        sx={{
          border: '1px solid rgba(255,255,255,0.22)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.16)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          width: { xs: 220, md: 340 },
          height: { xs: 220, md: 340 },
          borderRadius: '999px',
          right: { xs: -90, md: '10%' },
          top: { xs: 40, md: '14%' },
          background:
            'linear-gradient(135deg, rgba(99,182,219,0.28), rgba(35,213,171,0.18))',
          filter: 'blur(10px)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          width: { xs: 180, md: 280 },
          height: { xs: 180, md: 280 },
          borderRadius: '999px',
          left: { xs: -80, md: '14%' },
          bottom: { xs: 40, md: '10%' },
          background:
            'linear-gradient(135deg, rgba(79,133,187,0.22), rgba(99,182,219,0.14))',
          filter: 'blur(12px)',
        }}
      />

      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: '24px', md: '30px' },
          border: (theme) =>
            `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.12)'
                : 'rgba(255,255,255,0.72)'
            }`,
          backdropFilter: 'saturate(155%) blur(22px)',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(10, 24, 39, 0.74)'
              : 'rgba(255, 255, 255, 0.8)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 30px 90px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 30px 90px rgba(31,76,116,0.22), inset 0 1px 0 rgba(255,255,255,0.85)',
          animation: 'loginCardIn 620ms cubic-bezier(.2,.8,.2,1) both',
          fontFamily: 'var(--font-vazir)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 4,
            background:
              'linear-gradient(90deg, #4f85bb, #63b6db, #23d5ab)',
          },
        }}
      >
        <CardContent sx={{ py: { xs: 4, md: 5 }, px: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={3.25} alignItems="stretch" sx={{ position: 'relative', zIndex: 1 }}>
            <Stack spacing={1.4} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: { xs: 92, md: 104 },
                  height: { xs: 92, md: 104 },
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '28px',
                  background:
                    'linear-gradient(145deg, rgba(255,255,255,0.62), rgba(255,255,255,0.14))',
                  border: '1px solid rgba(255,255,255,0.42)',
                  boxShadow:
                    '0 18px 45px rgba(35, 166, 213, 0.22), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <Box
                  component="img"
                  src="/logo/Logo.png"
                  alt="StoreX"
                  sx={{
                    width: '74%',
                    height: '74%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.18))',
                  }}
                />
              </Box>

              <Typography
                component="p"
                sx={{
                  color: 'var(--color-secondary)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                }}
              >
                کنسول مدیریت ذخیره‌ساز اداری
              </Typography>

              <Typography
                component="h1"
                sx={{
                  mt: -0.6,
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-didot)',
                  fontSize: { xs: 46, sm: 58 },
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: 1,
                  textShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 14px 34px rgba(99,182,219,0.28)'
                      : '0 14px 34px rgba(79,133,187,0.22)',
                }}
              >
                StoreX
              </Typography>

              <Typography
                component="p"
                sx={{
                  color: 'var(--color-secondary)',
                  fontSize: { xs: 12.5, sm: 13.5 },
                  lineHeight: 1.9,
                  maxWidth: 330,
                }}
              >
                ورود امن به مرکز مدیریت زیرساخت ذخیره‌سازی
              </Typography>
            </Stack>

            <LoginForm />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;
