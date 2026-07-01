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
  direction: 'ltr',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  flexWrap: 'wrap',
  p: { xs: 1.65, md: 1.9 },
  mb: -5.5,
  borderRadius: '14px',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(0, 198, 169, 0.16)',
  background:
    'radial-gradient(circle at 92% 18%, rgba(0,198,169,0.11), transparent 34%), linear-gradient(135deg, rgba(10, 16, 22, 0.82) 0%, rgba(16, 23, 31, 0.74) 54%, rgba(0, 198, 169, 0.055) 100%)',
  boxShadow:
    '0 18px 42px -38px rgba(0, 198, 169, 0.64), inset 0 1px 0 rgba(255,255,255,0.045)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(90deg, rgba(0,198,169,0.06) 0%, transparent 42%, rgba(31,182,255,0.045) 100%)',
    pointerEvents: 'none',
  },
};

const primaryButtonSx: SxProps<Theme> = {
  px: 2.5,
  py: 0.95,
  borderRadius: '7px',
  fontWeight: 850,
  fontSize: '0.9rem',
  color: '#03130f',
  background:
    'linear-gradient(135deg, rgba(0, 198, 169, 0.94) 0%, rgba(31, 182, 255, 0.82) 100%)',
  boxShadow: '0 14px 30px -24px rgba(0,198,169,0.78)',
  '&:hover': {
    background:
      'linear-gradient(135deg, rgba(0, 214, 182, 0.98) 0%, rgba(55, 197, 255, 0.9) 100%)',
  },
  '&.Mui-disabled': {
    color: 'rgba(255,255,255,0.42)',
    background: 'rgba(148,163,184,0.14)',
    boxShadow: 'none',
  },
};

const secondaryButtonSx: SxProps<Theme> = {
  px: 2.25,
  py: 0.88,
  borderRadius: '7px',
  fontWeight: 800,
  color: 'var(--color-primary)',
  borderColor: 'rgba(0,198,169,0.38)',
  backgroundColor: 'rgba(0,198,169,0.025)',
  backdropFilter: 'blur(8px)',
  '&:hover': {
    borderColor: 'rgba(0,198,169,0.64)',
    backgroundColor: 'rgba(0,198,169,0.085)',
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
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minWidth: 0,
          direction: 'rtl',
          textAlign: 'left',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'var(--color-primary)',
            fontWeight: 850,
            letterSpacing: '-0.015em',
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body2"
            sx={{ color: 'rgba(226,232,240,0.6)', mt: 0.45, fontWeight: 500 }}
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
            gap: 1.1,
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
