import { Box, Typography } from '@mui/material';
import type { UseDeleteZpoolReturn } from '../../hooks/useDeleteZpool';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ConfirmDeletePoolModalProps {
  controller: UseDeleteZpoolReturn;
}

const ConfirmDeletePoolModal = ({
  controller,
}: ConfirmDeletePoolModalProps) => {
  const {
    isOpen,
    targetPool,
    closeModal,
    confirmDelete,
    isDeleting,
    errorMessage,
  } = controller;

  if (errorMessage) {
    console.log(errorMessage);
    controller.isOpen = false;
  }

  return (
    <BlurModal
      open={isOpen}
      onClose={closeModal}
      title="حذف Pool"
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
          آیا از حذف فضای یکپارچه{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {targetPool?.name}
          </Typography>{' '}
          مطمئن هستید؟ با انجام این عملیات تمام اطلاعات شما حذف خواهد شد.
        </Typography>

        {/* {errorMessage && (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        )} */}
      </Box>
    </BlurModal>
  );
};

export default ConfirmDeletePoolModal;
