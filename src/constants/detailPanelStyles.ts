import type { SxProps, Theme } from '@mui/material/styles';

export const createDetailPanelContainerSx = (theme: Theme): SxProps<Theme> => ({
  mt: 4,
  px: 4,
  py: 3,
  borderRadius: '18px',
  border: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.35)'
      : 'rgba(148, 163, 184, 0.25)'
  }`,
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(241, 245, 249, 0.92) 100%)',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 26px 55px -32px rgba(15, 23, 42, 0.9)'
      : '0 26px 55px -32px rgba(15, 23, 42, 0.35)',
  width: 'fit-content',
  maxWidth: '100%',
  mx: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
});

export const detailPanelHeaderSx: SxProps<Theme> = {
  position: 'relative',
  px: 2,
  py: 1,
  borderRadius: '999px',
  fontWeight: 800,
  letterSpacing: '0.015em',
  background:
    'linear-gradient(135deg, rgba(14, 165, 233, 0.18) 0%, rgba(59, 130, 246, 0.18) 100%)',
  color: 'var(--color-primary)',
  textAlign: 'center',
};

export const detailPanelItemsWrapperSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 3,
  width: '100%',
};

export const createDetailPanelCardSx = (theme: Theme): SxProps<Theme> => ({
  position: 'relative',
  borderRadius: '16px',
  border: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.35)'
      : 'rgba(148, 163, 184, 0.28)'
  }`,
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.75) 100%)'
      : 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(226, 232, 240, 0.9) 100%)',
  backdropFilter: 'blur(8px)',
  padding: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  minWidth: 260,
  maxWidth: 360,
  flex: '0 1 320px',
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 24px 48px -36px rgba(15, 23, 42, 1)'
      : '0 24px 48px -32px rgba(15, 23, 42, 0.45)',
});

export const createDetailPanelListSx = (theme: Theme): SxProps<Theme> => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.25),
  borderRadius: '12px',
  padding: theme.spacing(1.75, 2),
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.82) 100%)'
      : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(226, 232, 240, 0.8) 100%)',
  border: `1px dashed ${
    theme.palette.mode === 'dark'
      ? 'rgba(148, 163, 184, 0.35)'
      : 'rgba(148, 163, 184, 0.45)'
  }`,
});

export const detailPanelItemRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 2,
};

export const detailPanelKeySx: SxProps<Theme> = {
  fontWeight: 700,
  color: 'var(--color-secondary)',
  minWidth: 120,
};

export const detailPanelValueSx: SxProps<Theme> = {
  fontWeight: 700,
  color: 'var(--color-primary)',
  textAlign: 'left',
  direction: 'ltr',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  flex: 1,
};
