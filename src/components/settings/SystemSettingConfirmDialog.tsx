import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { MdInfoOutline, MdOutlineWarningAmber } from 'react-icons/md';

export type SystemSettingConfirmSeverity = 'info' | 'warning' | 'error';

interface SystemSettingConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  severity?: SystemSettingConfirmSeverity;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const severityColor = {
  info: 'var(--color-primary)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
} as const;

const SystemSettingConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'تایید و ادامه',
  severity = 'warning',
  isLoading = false,
  onCancel,
  onConfirm,
}: SystemSettingConfirmDialogProps) => {
  const accentColor = severityColor[severity];
  const Icon = severity === 'info' ? MdInfoOutline : MdOutlineWarningAmber;

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        dir: 'rtl',
        sx: {
          color: 'var(--color-text)',
          backgroundColor: 'var(--color-card-bg)',
          borderRadius: '14px',
          border: `1px solid color-mix(in srgb, ${accentColor} 42%, transparent)`,
          boxShadow: '0 26px 70px -34px rgba(0, 0, 0, 0.72)',
          overflow: 'hidden',
          direction: 'rtl',
          textAlign: 'right',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.25 }}>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              color: accentColor,
              backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
              flexShrink: 0,
            }}
          >
            <Icon size={24} />
          </Box>
          <Typography component="span" sx={{ fontSize: '1rem', fontWeight: 900 }}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{
            color: 'var(--color-secondary)',
            direction: 'rtl',
            textAlign: 'right',
            lineHeight: 2,
          }}
        >
          {description}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isLoading}
          sx={{ borderRadius: '8px', minWidth: 112 }}
        >
          انصراف
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={17} color="inherit" /> : undefined}
          sx={{
            borderRadius: '8px',
            minWidth: 132,
            color: 'var(--color-bg)',
            backgroundColor: accentColor,
            '&:hover': {
              backgroundColor: accentColor,
              filter: 'brightness(1.06)',
            },
          }}
        >
          {isLoading ? 'در حال اعمال...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SystemSettingConfirmDialog;
