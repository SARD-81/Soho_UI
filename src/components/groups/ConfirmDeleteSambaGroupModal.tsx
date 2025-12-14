import { Box, Typography } from '@mui/material';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';
import GroupGuide from './GroupGuide';

interface ConfirmDeleteSambaGroupModalProps {
  open: boolean;
  groupname?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  errorMessage?: string | null;
}

const ConfirmDeleteSambaGroupModal = ({
  open,
  groupname,
  onClose,
  onConfirm,
  isDeleting,
  errorMessage,
}: ConfirmDeleteSambaGroupModalProps) => {
  const displayName = groupname?.trim() ?? '';
  const isConfirmDisabled = isDeleting || !displayName;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="حذف گروه اشتراک فایل"
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
          آیا از حذف گروه{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {displayName}
          </Typography>{' '}
          مطمئن هستید؟ این عملیات قابل بازگشت نیست.
        </Typography>

        {errorMessage ? (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        ) : null}

        <GroupGuide compact />
      </Box>
    </BlurModal>
  );
};

export default ConfirmDeleteSambaGroupModal;