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
    '& .tab-edge': {
      display: 'none',
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 198, 169, 0.08)',
    },
    '&.Mui-selected': {
      color: 'var(--color-primary)',
      background:
        'linear-gradient(180deg, #fdfefe 0%, #f4f7fb 70%, #e9edf4 100%)',
      borderColor: '#dfe3ea',
      boxShadow:
        '0 18px 38px -26px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 10px 18px -12px rgba(0, 0, 0, 0.28)',
      clipPath: 'polygon(10% 0, 90% 0, 100% 22%, 100% 100%, 0 100%, 0 22%)',
      transform: 'translateY(-3px)',
      borderRadius: '16px 16px 12px 12px',
      zIndex: 1,
      overflow: 'visible',
      isolation: 'isolate',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-10px',
        left: '6%',
        right: '6%',
        height: 20,
        background:
          'radial-gradient(120% 140% at 50% 120%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
        borderRadius: '999px',
        boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.8)',
        pointerEvents: 'none',
        zIndex: 0,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '16px 16px 12px 12px',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 12px 26px rgba(0, 0, 0, 0.12)',
        mixBlendMode: 'screen',
        pointerEvents: 'none',
        zIndex: 0,
      },
      '& .tab-edge': {
        position: 'absolute',
        top: -2,
        bottom: 8,
        width: 18,
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(240,244,249,0.8) 70%, rgba(233,237,244,0.85) 100%)',
        boxShadow: 'inset 1px 0 0 rgba(255, 255, 255, 0.45), inset -1px 0 0 rgba(0, 0, 0, 0.03)',
        borderRadius: '50% 50% 10px 10px',
        pointerEvents: 'none',
        zIndex: -1,
        display: 'block',
      },
      '& .tab-edge.left': {
        left: -9,
        transform: 'skewX(-10deg)',
      },
      '& .tab-edge.right': {
        right: -9,
        transform: 'skewX(10deg)',
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
