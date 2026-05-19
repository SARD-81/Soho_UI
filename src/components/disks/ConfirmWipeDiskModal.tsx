import { Box, Typography } from '@mui/material';
import type { DiskInventoryItem } from '../../@types/disk';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ConfirmWipeDiskModalProps {
  open: boolean;
  disk: DiskInventoryItem | null;
  onClose: () => void;
  onConfirm: () => void;
  isWiping: boolean;
}

const ConfirmWipeDiskModal = ({
  open,
  disk,
  onClose,
  onConfirm,
  isWiping,
}: ConfirmWipeDiskModalProps) => {
  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="پاکسازی دیسک"
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={onConfirm}
          confirmLabel="پاکسازی"
          loadingLabel="در حال پاکسازی…"
          isLoading={isWiping}
          disabled={isWiping}
          disableConfirmGradient
          confirmProps={{ color: 'error' }}
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ color: 'var(--color-text)', lineHeight: 1.9 }}>
          آیا از پاکسازی دیسک{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {disk?.disk}
          </Typography>{' '}
          مطمئن هستید؟
        </Typography>
        <Typography sx={{ color: 'var(--color-error)', lineHeight: 1.9 }}>
          با انجام این عملیات، پارتیشن‌ها، امضاها و اطلاعات قابل شناسایی روی این
          دیسک حذف می‌شوند. این عملیات قابل بازگشت نیست.
        </Typography>
      </Box>
    </BlurModal>
  );
};

export default ConfirmWipeDiskModal;
