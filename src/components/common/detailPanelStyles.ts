import type { SxProps, Theme } from '@mui/material/styles';

interface DetailPanelStyles {
  wrapper: SxProps<Theme>;
  header: SxProps<Theme>;
  collection: SxProps<Theme>;
  card: SxProps<Theme>;
  list: SxProps<Theme>;
  keyText: SxProps<Theme>;
  valueText: SxProps<Theme>;
  removeButton: SxProps<Theme>;
  emptyState: SxProps<Theme>;
  dividerColor: string;
  listBackground: string;
}

export const buildDetailPanelStyles = (theme: Theme): DetailPanelStyles => {
  const isDark = theme.palette.mode === 'dark';

  const dividerColor = isDark
    ? 'rgba(148, 163, 184, 0.32)'
    : 'rgba(99, 102, 241, 0.2)';

  const listBackground = isDark
    ? 'rgba(15, 23, 42, 0.55)'
    : 'rgba(241, 245, 249, 0.78)';

  const wrapper: DetailPanelStyles['wrapper'] = {
    mt: 4,
    px: { xs: 3, md: 4.5 },
    py: { xs: 3, md: 4 },
    borderRadius: '18px',
    border: `1px solid color-mix(in srgb, var(--color-primary) 22%, transparent)`,
    background: isDark
      ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 41, 59, 0.88) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(236, 244, 255, 0.92) 100%)',
    boxShadow: isDark
      ? '0 28px 65px -32px rgba(15, 23, 42, 0.65)'
      : '0 28px 60px -30px rgba(15, 118, 110, 0.35)',
    backdropFilter: 'blur(14px)',
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    flexDirection: 'column',
    gap: 3,
    width: { xs: '100%', md: 'fit-content' },
    maxWidth: '100%',
    mx: 'auto',
    alignSelf: { xs: 'stretch', md: 'center' },
    '&::before': {
      content: "''",
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(120deg, rgba(0, 198, 169, 0.18) 0%, transparent 60%)',
      opacity: isDark ? 0.28 : 0.18,
      pointerEvents: 'none',
    },
    '& > *': {
      position: 'relative',
      zIndex: 1,
    },
  };

  const header: DetailPanelStyles['header'] = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    fontWeight: 800,
    color: 'var(--color-primary)',
    fontSize: { xs: '1.05rem', md: '1.15rem' },
    letterSpacing: '0.02em',
  };

  const collection: DetailPanelStyles['collection'] = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: { xs: 2.5, md: 3 },
    minWidth: 'min(100%, 260px)',
  };

  const card: DetailPanelStyles['card'] = {
    flex: '1 1 260px',
    maxWidth: 340,
    borderRadius: '14px',
    border: `1px solid ${dividerColor}`,
    backgroundColor: isDark
      ? 'rgba(17, 24, 39, 0.82)'
      : 'rgba(255, 255, 255, 0.92)',
    boxShadow: '0 20px 45px -28px rgba(15, 23, 42, 0.45)',
    padding: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    position: 'relative',
    '&::after': {
      content: "''",
      position: 'absolute',
      inset: '0 0 auto',
      height: '4px',
      borderRadius: '14px 14px 0 0',
      background:
        'linear-gradient(90deg, var(--color-primary) 0%, rgba(56, 189, 248, 0.85) 100%)',
    },
  };

  const list: DetailPanelStyles['list'] = {
    bgcolor: listBackground,
    borderRadius: '12px',
    px: 2.5,
    py: 2,
    border: `1px solid ${dividerColor}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  };

  const keyText: DetailPanelStyles['keyText'] = {
    fontWeight: 600,
    color: isDark ? 'rgba(226, 232, 240, 0.88)' : 'rgba(30, 41, 59, 0.78)',
    minWidth: 120,
    fontSize: '0.9rem',
  };

  const valueText: DetailPanelStyles['valueText'] = {
    color: isDark ? 'rgba(241, 245, 249, 0.92)' : 'rgba(15, 23, 42, 0.94)',
    textAlign: 'left',
    direction: 'ltr',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    flex: 1,
    fontSize: '0.9rem',
  };

  const removeButton: DetailPanelStyles['removeButton'] = {
    color: 'var(--color-secondary)',
    backgroundColor: 'transparent',
    borderRadius: '999px',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
    '&:hover': {
      backgroundColor: 'color-mix(in srgb, var(--color-secondary) 18%, transparent)',
      transform: 'rotate(90deg)',
    },
  };

  const emptyState: DetailPanelStyles['emptyState'] = {
    color: 'var(--color-secondary)',
    textAlign: 'center',
    fontWeight: 500,
  };

  return {
    wrapper,
    header,
    collection,
    card,
    list,
    keyText,
    valueText,
    removeButton,
    emptyState,
    dividerColor,
    listBackground,
  };
};

