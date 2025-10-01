import { Box, Typography } from '@mui/material';
import type { UseDeleteVolumeReturn } from '../../hooks/useDeleteVolume';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ConfirmDeleteVolumeModalProps {
  controller: UseDeleteVolumeReturn;
}

const ConfirmDeleteVolumeModal = ({
  controller,
}: ConfirmDeleteVolumeModalProps) => {
  const {
    isOpen,
    targetVolume,
    closeModal,
    confirmDelete,
    isDeleting,
    errorMessage,
  } = controller;

  return (
    <BlurModal
      open={isOpen}
      onClose={closeModal}
      title="حذف Volume"
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
          آیا از حذف Volume{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {targetVolume?.fullName}
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

export default ConfirmDeleteVolumeModal;
