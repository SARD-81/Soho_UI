import type { SxProps, Theme } from '@mui/material';

export const tabContainerSx: SxProps<Theme> = {
  mt: 2,
  direction: 'rtl',
  textAlign: 'right',
  color: 'var(--color-text)',
  borderRadius: '14px',
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--color-card-bg) 96%, var(--color-primary) 4%) 0%, var(--color-card-bg) 100%)',
  boxShadow: '0 26px 70px -48px rgba(0, 0, 0, 0.72)',
  border:
    '1px solid color-mix(in srgb, var(--color-primary) 14%, transparent)',
  overflow: 'hidden',
};

export const tabListSx: SxProps<Theme> = {
  px: { xs: 1.25, sm: 2.5 },
  pt: 1.5,
  pb: 0.75,
  direction: 'rtl',
  color: 'var(--color-text)',
  backgroundColor:
    'color-mix(in srgb, var(--color-background) 58%, transparent)',
  backdropFilter: 'blur(8px)',
  borderBottom:
    '1px solid color-mix(in srgb, var(--color-primary) 12%, transparent)',
  '& .MuiTabs-flexContainer': {
    gap: 1,
    direction: 'rtl',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  '& .MuiTab-root': {
    color: 'var(--color-secondary)',
    fontWeight: 800,
    minHeight: 48,
    borderRadius: '10px',
    px: { xs: 1.5, sm: 2.5 },
    textTransform: 'none',
    textAlign: 'right',
    transition: 'all 0.2s ease',
    alignSelf: 'center',
    '&:hover': {
      color: 'var(--color-text)',
      backgroundColor:
        'color-mix(in srgb, var(--color-primary) 7%, transparent)',
    },
    '&.Mui-selected': {
      color: 'var(--color-primary)',
      backgroundColor:
        'color-mix(in srgb, var(--color-primary) 12%, transparent)',
      boxShadow:
        '0 10px 40px -30px color-mix(in srgb, var(--color-primary) 80%, transparent)',
    },
  },
  '& .MuiTabs-indicator': {
    height: 4,
    borderRadius: '8px 8px 0 0',
    background:
      'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
  },
  '& .MuiTabs-scrollButtons': {
    color: 'var(--color-text)',
  },
};

export const tabPanelSx: SxProps<Theme> = {
  p: { xs: 1.5, md: 2.5 },
  direction: 'rtl',
  textAlign: 'right',
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-card-bg)',
  borderRadius: '0 0 14px 14px',
  borderTop:
    '1px solid color-mix(in srgb, var(--color-primary) 8%, transparent)',
};
