import { Box, Button, Typography } from '@mui/material';
import type { UseDeleteVolumeReturn } from '../../hooks/useDeleteVolume';
import BlurModal from '../BlurModal';

interface ConfirmDeleteVolumeModalProps {
  controller: UseDeleteVolumeReturn;
}

const buttonStyles = {
  borderRadius: '10px',
  fontWeight: 600,
};

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
        <>
          <Button
            onClick={closeModal}
            color="inherit"
            variant="outlined"
            disabled={isDeleting}
            sx={buttonStyles}
          >
            انصراف
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
            sx={buttonStyles}
          >
            {isDeleting ? 'در حال حذف…' : 'حذف'}
          </Button>
        </>
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
