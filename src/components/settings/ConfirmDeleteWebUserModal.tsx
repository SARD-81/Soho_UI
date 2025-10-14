import { Box, Typography } from '@mui/material';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ConfirmDeleteWebUserModalProps {
  open: boolean;
  username?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  errorMessage?: string | null;
}

const ConfirmDeleteWebUserModal = ({
  open,
  username,
  onClose,
  onConfirm,
  isDeleting,
  errorMessage,
}: ConfirmDeleteWebUserModalProps) => {
  const displayUsername = username?.trim() ?? '';
  const isConfirmDisabled = isDeleting || !displayUsername;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="حذف کاربر"
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={onConfirm}
          confirmLabel="حذف"
          loadingLabel="در حال حذف…"
          isLoading={isDeleting}
          disableConfirmGradient
          confirmProps={{ color: 'error', disabled: isConfirmDisabled }}
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ color: 'var(--color-text)' }}>
          آیا از حذف کاربر{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {displayUsername}
          </Typography>{' '}
          مطمئن هستید؟ این عملیات قابل بازگشت نیست.
        </Typography>

        {errorMessage && (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        )}
      </Box>
    </BlurModal>
  );
};

export default ConfirmDeleteWebUserModal;
