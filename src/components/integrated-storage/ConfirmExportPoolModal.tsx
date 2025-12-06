import { Box, Typography } from '@mui/material';
import type { UseExportPoolReturn } from '../../hooks/useExportPool';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ConfirmExportPoolModalProps {
  controller: UseExportPoolReturn;
}

const ConfirmExportPoolModal = ({ controller }: ConfirmExportPoolModalProps) => {
  const { isOpen, targetPool, closeModal, confirmExport, isExporting, errorMessage } = controller;

  return (
    <BlurModal
      open={isOpen}
      onClose={closeModal}
      title="آزادسازی فضای یکپارچه"
      actions={
        <ModalActionButtons
          onCancel={closeModal}
          onConfirm={confirmExport}
          confirmLabel="آزادسازی"
          loadingLabel="در حال آزادسازی..."
          isLoading={isExporting}
          disabled={isExporting}
          disableConfirmGradient
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ color: 'var(--color-text)' }}>
          آیا از آزادسازی فضای یکپارچه{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {targetPool?.name}
          </Typography>{' '}
          مطمئن هستید؟
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

export default ConfirmExportPoolModal;