import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import '../index.css';

function LoadingPage() {
  return (
    <Box
      component="main"
      sx={{
        zIndex: '9999',
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        fontFamily: 'var(--font-vazir)',
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 4,
          backdropFilter: 'saturate(140%) blur(8px)',
          bgcolor: 'var(--color-card-bg)',
          boxShadow: (theme) =>
            `0 10px 30px ${
              theme.palette.mode === 'dark' ? '#00000066' : '#00000022'
            }`,
        }}
      >
        <Box component="img" src="/logo/Logo.png" alt="لوگو" sx={{ mb: 3 }} />
        <Typography
          variant="h4"
          fontWeight={900}
          letterSpacing={0.4}
          sx={{
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-didot)',
          }}
        >
          Soho
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: 'var(--color-primary)' }} />
        </Box>
        <Typography variant="h6" sx={{ mt: 2, color: 'var(--color-primary)' }}>
          در حال بارگذاری...
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoadingPage;
