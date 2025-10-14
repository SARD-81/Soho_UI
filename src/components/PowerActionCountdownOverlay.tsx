import { Box, Button, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import type { ReactElement } from 'react';
import { MdPowerSettingsNew, MdRestartAlt } from 'react-icons/md';
import type { PowerAction } from '../hooks/usePowerAction';

interface PowerActionCountdownOverlayProps {
  action: PowerAction | null;
  secondsRemaining: number;
  onCancel: () => void;
}

const orbitAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.45);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 18px rgba(249, 115, 22, 0);
  }
`;

const actionDetails: Record<PowerAction, { label: string; icon: ReactElement }> = {
  restart: {
    label: 'راه‌اندازی مجدد در حال آماده‌سازی است',
    icon: <MdRestartAlt size={36} color="#f1f5f9" />,
  },
  shutdown: {
    label: 'خاموش کردن سیستم در حال آماده‌سازی است',
    icon: <MdPowerSettingsNew size={36} color="#f1f5f9" />,
  },
};

const PowerActionCountdownOverlay: React.FC<PowerActionCountdownOverlayProps> = ({
  action,
  secondsRemaining,
  onCancel,
}) => {
  if (!action) {
    return null;
  }

  const { label, icon } = actionDetails[action];
  const progressPercentage = ((5 - secondsRemaining) / 5) * 100;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: (theme) => theme.zIndex.modal + 1,
        backdropFilter: 'blur(12px)',
        background: 'rgba(15, 23, 42, 0.78)',
        transition: 'opacity 0.3s ease',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: 240, sm: 280 },
          height: { xs: 320, sm: 340 },
          borderRadius: "5px",
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.92))',
          boxShadow: '0 35px 60px rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at top, rgba(59, 130, 246, 0.15), transparent 65%)',
          }}
        />
        <Stack
          spacing={3}
          alignItems="center"
          justifyContent="center"
          sx={{ position: 'relative', height: '100%', p: 4, color: '#e2e8f0' }}
        >
          <Box
            sx={{
              position: 'relative',
              width: 160,
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: `conic-gradient(#f97316 ${progressPercentage}%, rgba(15, 23, 42, 0.35) ${progressPercentage}% 100%)`,
                filter: 'drop-shadow(0 0 24px rgba(249, 115, 22, 0.35))',
                animation: `${orbitAnimation} 5s linear infinite`,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 12,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.9))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 1,
                animation: `${pulseAnimation} 2.4s ease-in-out infinite`,
              }}
            >
              {icon}
              <Typography variant="h2" fontWeight={700} sx={{ color: '#f8fafc' }}>
                {secondsRemaining}
              </Typography>
              <Typography variant="caption" sx={{ color: '#cbd5f5', letterSpacing: 2 }}>
                ثانیه
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="subtitle1"
            textAlign="center"
            sx={{ fontWeight: 600, lineHeight: 1.8 }}
          >
            {label}
          </Typography>
          <Button
            onClick={onCancel}
            variant="outlined"
            sx={{
              mt: 1,
              color: '#f8fafc',
              borderColor: 'rgba(148, 163, 184, 0.45)',
              borderRadius: "5px",
              px: 4,
              py: 1,
              '&:hover': {
                borderColor: '#f87171',
                backgroundColor: 'rgba(248, 113, 113, 0.12)',
              },
            }}
          >
            لغو عملیات
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default PowerActionCountdownOverlay;