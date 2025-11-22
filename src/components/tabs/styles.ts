import type { SxProps, Theme } from '@mui/material';

export const tabContainerSx: SxProps<Theme> = {
  mt: 2,
  borderRadius: '16px',
  background: 'linear-gradient(180deg, var(--color-card-bg) 0%, rgba(255,255,255,0.9) 100%)',
  boxShadow: '0 26px 70px -48px rgba(0, 0, 0, 0.65)',
  border: '1px solid rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
};

export const tabListSx: SxProps<Theme> = {
  px: 2.5,
  pt: 2,
  pb: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.02)',
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  position: 'relative',
  '& .MuiTabs-flexContainer': {
    gap: 1,
  },
  '& .MuiTab-root': {
    color: 'var(--color-secondary)',
    fontWeight: 700,
    minHeight: 54,
    borderRadius: '12px',
    px: 2.5,
    textTransform: 'none',
    transition: 'all 0.2s ease',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    border: '1px solid transparent',
    '&:hover': {
      backgroundColor: 'rgba(0, 198, 169, 0.08)',
    },
    '&.Mui-selected': {
      color: 'var(--color-primary)',
      background:
        'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      boxShadow:
        '0 14px 35px -20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
      clipPath: 'polygon(6% 0, 94% 0, 100% 32%, 100% 100%, 0 100%, 0 32%)',
      transform: 'translateY(-2px)',
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '10px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 10px 24px rgba(0, 0, 0, 0.18)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        zIndex: -1,
      },
    },
  },
  '& .MuiTabs-indicator': {
    height: 4,
    bottom: 4,
    borderRadius: '999px',
    background:
      'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
  },
};

export const tabPanelSx: SxProps<Theme> = {
  p: 3,
  backgroundColor: 'var(--color-card-bg)',
  borderRadius: '0 0 16px 16px',
  borderTop: '1px solid rgba(0, 0, 0, 0.035)',
};
