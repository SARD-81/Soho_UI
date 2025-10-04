import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import LoginForm from '../components/LoginForm.tsx';
import ThemeToggle from '../components/ThemeToggle.tsx';
import '../index.css';

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
        px: 2,
        py: { xs: 6, md: 8 },
        fontFamily: 'var(--font-vazir)',
        background: 'linear-gradient(-45deg,#4f85bb,#63b6db,#23a6d5,#23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientMove 15s ease infinite',
      }}
    >
      <Card
        elevation={10}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: '5px',
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
        <CardContent sx={{ py: { xs: 4, md: 5 }, px: { xs: 2, md: 3 } }}>
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
                  marginTop: '-10px',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-vazir)',
                }}
              >
                ذخیره ساز اداری Storex
              </Typography>
            </Box>

            <Box textAlign="center">
              <Typography
                variant="h6"
                fontWeight={500}
                letterSpacing={0.4}
                sx={{ color: 'var(--color-primary)' }}
              >
                خوش آمدید
              </Typography>
            </Box>

            <LoginForm />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;
