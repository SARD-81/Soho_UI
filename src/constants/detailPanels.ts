import type { SxProps, Theme } from '@mui/material/styles';

type DetailPanelRowStyleFactory = (isLast: boolean) => SxProps<Theme>;

type DetailPanelPalette = {
  border: string;
  background: string;
  accentBar: string;
  cardBackground: string;
  cardBorder: string;
  listBackground: string;
  rowDivider: string;
  keyColor: string;
  valueColor: string;
  mutedText: string;
  removeIcon: string;
  shadowColor: string;
  titleColor: string;
  errorText: string;
};

export interface DetailPanelStyles {
  root: SxProps<Theme>;
  title: SxProps<Theme>;
  cardsWrapper: SxProps<Theme>;
  card: SxProps<Theme>;
  cardHeader: SxProps<Theme>;
  cardTitle: SxProps<Theme>;
  removeButton: SxProps<Theme>;
  emptyState: SxProps<Theme>;
  infoList: SxProps<Theme>;
  keyText: SxProps<Theme>;
  valueText: SxProps<Theme>;
  statusText: SxProps<Theme>;
  errorText: SxProps<Theme>;
  getInfoRow: DetailPanelRowStyleFactory;
}

const createDetailPanelPalette = (theme: Theme): DetailPanelPalette => {
  const isDark = theme.palette.mode === 'dark';

  return {
    border: isDark ? 'rgba(148, 163, 184, 0.28)' : 'rgba(148, 163, 184, 0.22)',
    background: isDark
      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.78) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.9) 100%)',
    accentBar: isDark
      ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.7) 0%, rgba(94, 234, 212, 0.6) 100%)'
      : 'linear-gradient(90deg, rgba(59, 130, 246, 0.65) 0%, rgba(16, 185, 129, 0.55) 100%)',
    cardBackground: isDark
      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%)',
    cardBorder: isDark ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.28)',
    listBackground: isDark
      ? 'rgba(15, 23, 42, 0.6)'
      : 'rgba(241, 245, 249, 0.9)',
    rowDivider: isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.28)',
    keyColor: isDark ? 'rgba(203, 213, 225, 0.9)' : 'rgba(71, 85, 105, 0.95)',
    valueColor: theme.palette.text.primary,
    mutedText: isDark ? 'rgba(226, 232, 240, 0.75)' : 'rgba(71, 85, 105, 0.75)',
    removeIcon: theme.palette.error.main,
    shadowColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(15, 23, 42, 0.18)',
    titleColor: theme.palette.primary.main,
    errorText: theme.palette.error.main,
  };
};

export const createDetailPanelStyles = (theme: Theme): DetailPanelStyles => {
  const palette = createDetailPanelPalette(theme);

  return {
    root: {
      mt: 4,
      position: 'relative',
      px: { xs: 2.5, sm: 4 },
      py: { xs: 3, sm: 3.5 },
      borderRadius: 4,
      border: `1px solid ${palette.border}`,
      background: palette.background,
      boxShadow: `0 28px 50px -32px ${palette.shadowColor}`,
      width: 'fit-content',
      maxWidth: 'min(100%, 1080px)',
      mx: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      backdropFilter: 'blur(10px)',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: '0 0 auto 0',
        height: 4,
        background: palette.accentBar,
      },
    },
    title: {
      mb: 1,
      fontWeight: 800,
      fontSize: '1.15rem',
      color: palette.titleColor,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      letterSpacing: '0.015em',
      textTransform: 'none',
    },
    cardsWrapper: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: { xs: 2, sm: 3 },
    },
    card: {
      position: 'relative',
      flex: '0 0 auto',
      minWidth: { xs: 240, sm: 260 },
      maxWidth: 340,
      px: { xs: 2.5, sm: 3 },
      py: { xs: 2.25, sm: 2.75 },
      borderRadius: 3,
      border: `1px solid ${palette.cardBorder}`,
      background: palette.cardBackground,
      boxShadow: `0 22px 46px -30px ${palette.shadowColor}`,
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 1.75,
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: '0 0 auto 0',
        height: 3,
        background: palette.accentBar,
        opacity: 0.85,
      },
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: `0 30px 52px -28px ${palette.shadowColor}`,
      },
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.5,
      pt: 1,
      pb: 1.5,
      borderBottom: `1px solid ${palette.rowDivider}`,
    },
    cardTitle: {
      fontWeight: 700,
      color: palette.valueColor,
      fontSize: '1.05rem',
    },
    removeButton: {
      color: palette.removeIcon,
      '&:hover': {
        backgroundColor: 'transparent',
        opacity: 0.85,
      },
    },
    emptyState: {
      color: palette.mutedText,
      fontWeight: 500,
      fontSize: '0.95rem',
      textAlign: 'center',
    },
    infoList: {
      width: '100%',
      backgroundColor: palette.listBackground,
      borderRadius: 2,
      px: 2,
      py: 1.75,
      border: `1px dashed ${palette.rowDivider}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    },
    keyText: {
      fontWeight: 700,
      color: palette.keyColor,
      minWidth: 120,
      fontSize: '0.92rem',
    },
    valueText: {
      color: palette.valueColor,
      textAlign: 'left',
      direction: 'ltr',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      flex: 1,
      fontSize: '0.94rem',
    },
    statusText: {
      color: palette.mutedText,
      fontWeight: 500,
      fontSize: '0.95rem',
    },
    errorText: {
      color: palette.errorText,
      fontWeight: 600,
      fontSize: '0.95rem',
    },
    getInfoRow: (isLast: boolean) => ({
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 2,
      py: 1,
      borderBottom: isLast ? 'none' : `1px dashed ${palette.rowDivider}`,
    }),
  };
};
