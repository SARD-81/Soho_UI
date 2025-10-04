// LoadingPage.tsx
import { Box, Paper, Typography } from '@mui/material';
import { TailChase } from 'ldrs/react';
import 'ldrs/react/TailChase.css';
import '../index.css';

function LoadingPage() {
  return (
    <Box
      component="main"
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        zIndex: 9999,
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100svh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        bgcolor: 'var(--color-bg)',
        fontFamily: 'var(--font-vazir)',
      }}
    >
      {/* Top accent bar (brand color), minimal but distinctive */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: 'var(--color-primary)',
          opacity: 0.95,
        }}
      />

      <Paper
        elevation={8}
        sx={{
          width: 'min(92vw, 440px)',
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'var(--color-card-bg)',
          backdropFilter: 'blur(8px) saturate(130%)',
          boxShadow: (theme) =>
            `0 16px 40px ${
              theme.palette.mode === 'dark' ? '#00000066' : '#0000001f'
            }`,
          border: (theme) =>
            `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(0,0,0,0.06)'
            }`,
        }}
      >
        {/* Optional logo (kept commented for drop-in) */}
        {/* <Box component="img" src="/logo/Logo.png" alt="لوگو" sx={{ mb: 2, mx: 'auto', height: 40 }} /> */}

        <Typography
          variant="h5"
          fontWeight={800}
          letterSpacing={0.2}
          sx={{ color: 'var(--color-primary)', mb: 1 }}
        >
          استورکس
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 3, mt: 0.5 }}
        >
          در حال آماده‌سازی محیط کار شما
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <TailChase size="66" speed="1.6" color="var(--color-primary)" />
        </Box>

        <Typography
          variant="body2"
          sx={{ mt: 2, color: 'var(--color-primary)' }}
        >
          در حال بارگذاری...
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoadingPage;
