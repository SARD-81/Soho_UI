import { Box, Typography } from '@mui/material';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ConfirmDeleteSambaUserModalProps {
  open: boolean;
  username?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  errorMessage?: string | null;
}

const ConfirmDeleteSambaUserModal = ({
  open,
  username,
  onClose,
  onConfirm,
  isDeleting,
  errorMessage,
}: ConfirmDeleteSambaUserModalProps) => {
  const displayUsername = username?.trim() ?? '';
  const isConfirmDisabled = isDeleting || !displayUsername;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="حذف کاربر اشتراک فایل"
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
          آیا از حذف کاربر اشتراک فایل{' '}
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

export default ConfirmDeleteSambaUserModal;
