import { Box, Button, Typography } from '@mui/material';
import type { ZpoolCapacityEntry } from '../../@types/zpool';
import BlurModal from '../BlurModal';

interface ConfirmDeletePoolModalProps {
  isOpen: boolean;
  targetPool: ZpoolCapacityEntry | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  errorMessage: string | null;
}

const buttonStyles = {
  borderRadius: '10px',
  fontWeight: 600,
};

const ConfirmDeletePoolModal = ({
  isOpen,
  targetPool,
  onClose,
  onConfirm,
  isDeleting,
  errorMessage,
}: ConfirmDeletePoolModalProps) => {
  return (
    <BlurModal
      open={isOpen}
      onClose={onClose}
      title="حذف Pool"
      actions={
        <>
          <Button
            onClick={onClose}
            color="inherit"
            variant="outlined"
            disabled={isDeleting}
            sx={buttonStyles}
          >
            انصراف
          </Button>
          <Button
            onClick={onConfirm}
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
