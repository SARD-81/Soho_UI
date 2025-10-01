import type { SxProps, Theme } from '@mui/material/styles';

export const createCardSx = (theme: Theme): SxProps<Theme> => {
  const borderColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';

  return {
    // width: '100%',
    p: 3,
    bgcolor: 'var(--color-card-bg)',
    borderRadius: '5px',
    mb: 3,
    color: 'var(--color-bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
    border: `1px solid ${borderColor}`,
    backdropFilter: 'blur(14px)',
    height: '100%',
  } satisfies SxProps<Theme>;
};
