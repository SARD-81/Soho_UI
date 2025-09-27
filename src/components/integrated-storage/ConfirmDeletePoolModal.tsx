import { Box, Button, Typography } from '@mui/material';
import BlurModal from '../BlurModal';
import type { UseDeleteZpoolReturn } from '../../hooks/useDeleteZpool';

interface ConfirmDeletePoolModalProps {
  controller: UseDeleteZpoolReturn;
}

const buttonStyles = {
  borderRadius: '10px',
  fontWeight: 600,
};

const ConfirmDeletePoolModal = ({ controller }: ConfirmDeletePoolModalProps) => {
  const { isOpen, targetPool, closeModal, confirmDelete, isDeleting, errorMessage } =
    controller;

  return (
    <BlurModal
      open={isOpen}
      onClose={closeModal}
      title="حذف Pool"
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
          آیا از حذف Pool{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {targetPool?.name}
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

export default ConfirmDeletePoolModal;
