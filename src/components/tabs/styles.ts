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
        'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,247,250,0.96) 100%)',
      borderColor: 'rgba(0, 0, 0, 0.06)',
      boxShadow:
        '0 18px 38px -24px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
      clipPath: 'polygon(9% 0, 91% 0, 100% 28%, 100% 100%, 0 100%, 0 28%)',
      transform: 'translateY(-3px)',
      borderRadius: '14px 14px 12px 12px',
      zIndex: 1,
      overflow: 'visible',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-12px',
        left: '8%',
        right: '8%',
        height: 22,
        background:
          'radial-gradient(80% 140% at 50% 120%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 65%)',
        borderRadius: '999px',
        boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.75)',
        pointerEvents: 'none',
        zIndex: 0,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '14px 14px 12px 12px',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 12px 28px rgba(0, 0, 0, 0.12)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        zIndex: 0,
      },
    },
  },
  '& .MuiTabs-indicator': {
    height: 3,
    bottom: 6,
    borderRadius: '999px',
    background:
      'linear-gradient(90deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.12) 100%)',
  },
};

export const tabPanelSx: SxProps<Theme> = {
  p: 3,
  backgroundColor: 'var(--color-card-bg)',
  borderRadius: '0 0 16px 16px',
  borderTop: '1px solid rgba(0, 0, 0, 0.035)',
};
