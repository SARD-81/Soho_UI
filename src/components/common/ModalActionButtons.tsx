import {
  Box,
  Button,
  type ButtonProps,
  type SxProps,
  type Theme,
} from '@mui/material';

interface ModalActionButtonsProps {
  onConfirm?: ButtonProps['onClick'];
  onCancel?: ButtonProps['onClick'];
  confirmLabel: string;
  cancelLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  confirmProps?: ButtonProps;
  cancelProps?: ButtonProps;
  disableConfirmGradient?: boolean;
}

const baseButtonSx: SxProps<Theme> = {
  borderRadius: '5px',
  fontWeight: 600,
};

const gradientButtonSx: SxProps<Theme> = {
  px: 4,
  background:
    'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
  boxShadow: '0 14px 28px -18px rgba(0, 198, 169, 0.8)',
  '&:hover': {
    background:
      'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
  },
};

const cancelButtonSx: SxProps<Theme> = {
  px: 3,
};

const mergeSx = (
  ...styles: Array<SxProps<Theme> | undefined>
): SxProps<Theme> =>
  styles
    .filter(Boolean)
    .flatMap((style) =>
      Array.isArray(style) ? style : [style]
    ) as SxProps<Theme>;

const ModalActionButtons = ({
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel = 'انصراف',
  disabled = false,
  isLoading = false,
  loadingLabel,
  confirmProps,
  cancelProps,
  disableConfirmGradient = false,
}: ModalActionButtonsProps) => {
  const {
    sx: confirmSxProp,
    disabled: confirmDisabledProp,
    onClick: confirmOnClickProp,
    variant: confirmVariant,
    color: confirmColor,
    ...confirmRest
  } = confirmProps ?? {};

  const {
    sx: cancelSxProp,
    disabled: cancelDisabledProp,
    onClick: cancelOnClickProp,
    variant: cancelVariant,
    color: cancelColor,
    ...cancelRest
  } = cancelProps ?? {};

  const handleConfirmClick: ButtonProps['onClick'] = (event) => {
    if (confirmOnClickProp) {
      confirmOnClickProp(event);
    }

    if (onConfirm) {
      onConfirm(event);
    }
  };

  const handleCancelClick: ButtonProps['onClick'] = (event) => {
    if (cancelOnClickProp) {
      cancelOnClickProp(event);
    }

    if (onCancel) {
      onCancel(event);
    }
  };

  const confirmDisabled = Boolean(disabled || isLoading || confirmDisabledProp);
  const cancelDisabled = Boolean(disabled || cancelDisabledProp);

  const confirmSx = mergeSx(
    baseButtonSx,
    disableConfirmGradient ? undefined : gradientButtonSx,
    confirmSxProp
  );

  const cancelSx = mergeSx(baseButtonSx, cancelButtonSx, cancelSxProp);

  return (
    <Box sx={{ display: 'flex', gap: 4, marginX: 'auto' }}>
      {onCancel ? (
        <Button
          onClick={handleCancelClick}
          variant={cancelVariant ?? 'outlined'}
          color={cancelColor ?? 'inherit'}
          disabled={cancelDisabled}
          sx={cancelSx}
          {...cancelRest}
        >
          {cancelLabel}
        </Button>
      ) : null}

      <Button
        onClick={handleConfirmClick}
        variant={confirmVariant ?? 'contained'}
        color={confirmColor}
        disabled={confirmDisabled}
        sx={confirmSx}
        {...confirmRest}
      >
        {isLoading && loadingLabel ? loadingLabel : confirmLabel}
      </Button>
    </Box>
  );
};

export default ModalActionButtons;
