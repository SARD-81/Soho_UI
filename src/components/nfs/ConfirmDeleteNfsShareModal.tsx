import { Box, Typography } from '@mui/material';
import type { UseDeleteNfsShareReturn } from '../../hooks/useDeleteNfsShare';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ConfirmDeleteNfsShareModalProps {
  controller: UseDeleteNfsShareReturn;
}

const ConfirmDeleteNfsShareModal = ({
  controller,
}: ConfirmDeleteNfsShareModalProps) => {
  const {
    isOpen,
    targetShare,
    closeModal,
    confirmDelete,
    isDeleting,
    errorMessage,
  } = controller;

  return (
    <BlurModal
      open={isOpen}
      onClose={closeModal}
      title="حذف اشتراک NFS"
      actions={
        <ModalActionButtons
          onCancel={closeModal}
          onConfirm={confirmDelete}
          confirmLabel="حذف"
          loadingLabel="در حال حذف…"
          isLoading={isDeleting}
          disabled={isDeleting}
          disableConfirmGradient
          confirmProps={{ color: 'error' }}
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ color: 'var(--color-text)' }}>
          آیا از حذف اشتراک NFS با مسیر{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {targetShare?.path}
          </Typography>{' '}
          مطمئن هستید؟ این عملیات قابل بازگشت نیست.
        </Typography>

        {errorMessage ? (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        ) : null}
      </Box>
    </BlurModal>
  );
};

export default ConfirmDeleteNfsShareModal;
