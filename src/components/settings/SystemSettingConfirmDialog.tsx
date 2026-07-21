import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { MdInfoOutline, MdOutlineWarningAmber } from 'react-icons/md';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

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
    <BlurModal
      open={open}
      onClose={onCancel}
      closeDisabled={isLoading}
      direction="rtl"
      minWidth="min(560px, calc(100vw - 32px))"
      maxWidth="560px"
      title={
        <Stack
          direction="row"
          alignItems="center"
          gap={1.25}
          sx={{ minWidth: 0, direction: 'rtl' }}
        >
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
          <Typography
            component="span"
            sx={{
              minWidth: 0,
              color: 'var(--color-text)',
              fontSize: '1rem',
              fontWeight: 900,
              direction: 'rtl',
              textAlign: 'right',
            }}
          >
            {title}
          </Typography>
        </Stack>
      }
      actions={
        <Box sx={{ width: '100%', direction: 'ltr' }}>
          <ModalActionButtons
            onConfirm={onConfirm}
            onCancel={onCancel}
            confirmLabel={confirmLabel}
            loadingLabel="در حال اعمال..."
            isLoading={isLoading}
            disableConfirmGradient
            confirmProps={{
              startIcon: isLoading ? (
                <CircularProgress size={17} color="inherit" />
              ) : undefined,
              sx: {
                minWidth: 148,
                color: 'var(--color-bg)',
                backgroundColor: accentColor,
                borderColor: accentColor,
                '&:hover': {
                  backgroundColor: accentColor,
                  borderColor: accentColor,
                  filter: 'brightness(1.06)',
                },
              },
            }}
            cancelProps={{
              disabled: isLoading,
              sx: {
                minWidth: 112,
                color: 'var(--color-text)',
                borderColor:
                  'color-mix(in srgb, var(--color-secondary) 50%, transparent)',
              },
            }}
          />
        </Box>
      }
    >
      <Box
        sx={{
          p: 2,
          borderRadius: '12px',
          direction: 'rtl',
          textAlign: 'right',
          color: 'var(--color-text)',
          backgroundColor: `color-mix(in srgb, ${accentColor} 7%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accentColor} 24%, transparent)`,
        }}
      >
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
      </Box>
    </BlurModal>
  );
};

export default SystemSettingConfirmDialog;
