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
            ? 'linear-gradient(135deg, #081421 0%, #0c1b2b 52%, #0e2730 100%)'
            : 'linear-gradient(135deg, #eef6ff 0%, #e8f4fb 52%, #effaf6 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at 20% 22%, rgba(99, 182, 219, 0.1), transparent 30%),
            radial-gradient(circle at 82% 18%, rgba(35, 213, 171, 0.08), transparent 32%),
            radial-gradient(circle at 52% 88%, rgba(79, 133, 187, 0.08), transparent 36%)
          `,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: (theme) => (theme.palette.mode === 'dark' ? 0.08 : 0.14),
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)
          `,
          backgroundSize: '52px 52px',
        },
        '@keyframes loginCardIn': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <ThemeToggle
        sx={{
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          pointerEvents: 'none',
          width: { xs: 180, md: 260 },
          height: { xs: 180, md: 260 },
          borderRadius: '999px',
          right: { xs: -120, md: '8%' },
          top: { xs: 64, md: '16%' },
          background: 'rgba(35, 213, 171, 0.08)',
          filter: 'blur(18px)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          pointerEvents: 'none',
          width: { xs: 160, md: 240 },
          height: { xs: 160, md: 240 },
          borderRadius: '999px',
          left: { xs: -110, md: '13%' },
          bottom: { xs: 56, md: '12%' },
          background: 'rgba(99, 182, 219, 0.08)',
          filter: 'blur(18px)',
        }}
      />

      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          borderRadius: { xs: '22px', md: '26px' },
          border: (theme) =>
            `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(255,255,255,0.58)'
            }`,
          backdropFilter: 'saturate(120%) blur(10px)',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(8, 22, 35, 0.9)'
              : 'rgba(255, 255, 255, 0.92)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 24px 64px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04)'
              : '0 24px 64px rgba(31,76,116,0.14), inset 0 1px 0 rgba(255,255,255,0.72)',
          animation: 'loginCardIn 480ms ease both',
          fontFamily: 'var(--font-vazir)',
          '&::before': {
            content: '""',
            position: 'absolute',
            pointerEvents: 'none',
            inset: '0 0 auto 0',
            height: 3,
            opacity: 0.75,
            background: 'linear-gradient(90deg, #4f85bb, #63b6db, #23d5ab)',
          },
        }}
      >
        <CardContent sx={{ py: { xs: 4, md: 5 }, px: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={3.25} alignItems="stretch" sx={{ position: 'relative', zIndex: 1 }}>
            <Stack spacing={1.15} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: { xs: 92, md: 104 },
                  height: { xs: 92, md: 104 },
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '26px',
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.62)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  boxShadow: '0 14px 36px rgba(35, 166, 213, 0.14)',
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
                    filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.14))',
                  }}
                />
              </Box>

              <Typography
                component="p"
                sx={{
                  color: 'var(--color-secondary)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                }}
              >
                ذخیره‌ساز اداری
              </Typography>

              <Typography
                component="h1"
                sx={{
                  mt: -0.5,
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-didot)',
                  fontSize: { xs: 46, sm: 58 },
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: 1,
                  textShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 10px 28px rgba(99,182,219,0.18)'
                      : '0 10px 28px rgba(79,133,187,0.14)',
                }}
              >
                StoreX
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
