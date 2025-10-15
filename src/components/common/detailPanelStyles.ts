import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

export const createDetailPanelContainerSx = (theme: Theme): SxProps<Theme> => {
  const frameBorder = alpha(
    theme.palette.primary.main,
    theme.palette.mode === 'dark' ? 0.22 : 0.12
  );
  const shadow = alpha(theme.palette.common.black, 0.45);

  return {
    mt: 4,
    px: 3.5,
    py: 3,
    borderRadius: '20px',
    border: `1px solid ${frameBorder}`,
    background:
      theme.palette.mode === 'dark'
        ? 'color-mix(in srgb, var(--color-card-bg) 88%, transparent)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 250, 255, 0.92) 100%)',
    boxShadow: `0 38px 90px -52px ${shadow}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    width: 'fit-content',
    maxWidth: '100%',
    mx: 'auto',
  } satisfies SxProps<Theme>;
};

export const detailCardsWrapperSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 2.5,
  justifyContent: 'center',
};
