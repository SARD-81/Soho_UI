import {
  Box,
  Button,
  type ButtonProps,
  type SxProps,
  Tooltip,
  Typography,
  type Theme,
} from '@mui/material';
import type { ReactNode } from 'react';

export interface TablePageHeaderAction {
  label: ReactNode;
  onClick?: ButtonProps['onClick'];
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: ReactNode;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  startIcon?: ButtonProps['startIcon'];
  tooltip?: ReactNode;
  sx?: SxProps<Theme>;
}

interface TablePageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  refreshAction?: Omit<TablePageHeaderAction, 'label'> & {
    label?: ReactNode;
  };
  primaryAction?: TablePageHeaderAction;
  actions?: TablePageHeaderAction[];
  sx?: SxProps<Theme>;
}

const headerSx: SxProps<Theme> = {
  direction: 'rtl',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  flexWrap: 'wrap',
  p: { xs: 2, md: 2.35 },
  mb: 1,
  borderRadius: '18px',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(0, 198, 169, 0.28)',
  background:
    'radial-gradient(circle at 92% 15%, rgba(0,198,169,0.26), transparent 32%), linear-gradient(135deg, rgba(5, 12, 18, 0.96) 0%, rgba(12, 22, 31, 0.92) 44%, rgba(0, 198, 169, 0.12) 100%)',
  boxShadow:
    '0 24px 60px -34px rgba(0, 198, 169, 0.74), inset 0 1px 0 rgba(255,255,255,0.08)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, rgba(0,198,169,0.16) 0%, transparent 32%, rgba(31,182,255,0.1) 100%)',
    pointerEvents: 'none',
  },
};

const primaryButtonSx: SxProps<Theme> = {
  px: 3,
  py: 1.15,
  borderRadius: '8px',
  fontWeight: 900,
  fontSize: '0.92rem',
  color: '#03130f',
  background:
    'linear-gradient(135deg, rgba(0, 198, 169, 1) 0%, rgba(31, 182, 255, 0.96) 100%)',
  boxShadow: '0 18px 38px -22px rgba(0,198,169,0.95)',
  '&:hover': {
    background:
      'linear-gradient(135deg, rgba(0, 214, 182, 1) 0%, rgba(55, 197, 255, 0.98) 100%)',
  },
  '&.Mui-disabled': {
    color: 'rgba(255,255,255,0.45)',
    background: 'rgba(148,163,184,0.18)',
    boxShadow: 'none',
  },
};

const secondaryButtonSx: SxProps<Theme> = {
  px: 2.5,
  py: 1.05,
  borderRadius: '8px',
  fontWeight: 850,
  color: 'var(--color-primary)',
  borderColor: 'rgba(0,198,169,0.5)',
  backgroundColor: 'rgba(0,198,169,0.045)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    borderColor: 'rgba(0,198,169,0.8)',
    backgroundColor: 'rgba(0,198,169,0.12)',
  },
};

const mergeSx = (...styles: Array<SxProps<Theme> | undefined>): SxProps<Theme> =>
  styles.filter(Boolean).flatMap((style) => (Array.isArray(style) ? style : [style])) as SxProps<Theme>;

const renderAction = (
  action: TablePageHeaderAction,
  key: string,
  isPrimary = false
) => {
  const button = (
    <Button
      key={key}
      onClick={action.onClick}
      disabled={action.disabled || action.isLoading}
      variant={action.variant ?? (isPrimary ? 'contained' : 'outlined')}
      color={action.color}
      startIcon={action.startIcon}
      sx={mergeSx(isPrimary ? primaryButtonSx : secondaryButtonSx, action.sx)}
    >
      {action.isLoading && action.loadingLabel ? action.loadingLabel : action.label}
    </Button>
  );

  if (!action.tooltip) {
    return button;
  }

  return (
    <Tooltip key={key} title={action.tooltip}>
      <span>{button}</span>
    </Tooltip>
  );
};

const TablePageHeader = ({
  title,
  subtitle,
  refreshAction,
  primaryAction,
  actions = [],
  sx,
}: TablePageHeaderProps) => {
  const resolvedActions: TablePageHeaderAction[] = [];

  if (primaryAction) {
    resolvedActions.push(primaryAction);
  }

  if (refreshAction) {
    resolvedActions.push({
      label: refreshAction.label ?? 'به‌روزرسانی لیست',
      ...refreshAction,
      variant: refreshAction.variant ?? 'outlined',
    });
  }

  resolvedActions.push(...actions);

  return (
    <Box sx={mergeSx(headerSx, sx)}>
      <Box sx={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
        <Typography
          variant="h5"
          sx={{
            color: 'var(--color-primary)',
            fontWeight: 950,
            letterSpacing: '-0.02em',
            textShadow: '0 12px 28px rgba(0,198,169,0.22)',
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body2"
            sx={{ color: 'rgba(226,232,240,0.72)', mt: 0.55, fontWeight: 600 }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      {resolvedActions.length > 0 ? (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            direction: 'ltr',
            gap: 1.25,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {resolvedActions.map((action, index) =>
            renderAction(action, `table-page-action-${index}`, index === 0 && action === primaryAction)
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default TablePageHeader;
