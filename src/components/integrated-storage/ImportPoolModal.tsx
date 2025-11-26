import { Box, TextField, Typography } from '@mui/material';
import type { UseImportPoolReturn } from '../../hooks/useImportPool';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ImportPoolModalProps {
  controller: UseImportPoolReturn;
}

const ImportPoolModal = ({ controller }: ImportPoolModalProps) => {
  const {
    isOpen,
    poolName,
    setPoolName,
    errorMessage,
    isImporting,
    handleSubmit,
    closeModal,
  } = controller;

  return (
    <BlurModal
      open={isOpen}
      onClose={closeModal}
      title="درون‌ریزی فضای یکپارچه"
      minWidth="380px"
      actions={
        <ModalActionButtons
          onCancel={closeModal}
          onConfirm={handleSubmit}
          confirmLabel="درون‌ریزی"
          loadingLabel="در حال درون‌ریزی..."
          isLoading={isImporting}
          disabled={isImporting}
          disableConfirmGradient
        />
      }
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="نام فضای یکپارچه"
            value={poolName}
            onChange={(event) => setPoolName(event.target.value)}
            fullWidth
            autoFocus
            size="small"
            error={Boolean(errorMessage)}
            helperText={errorMessage || 'نام فضای یکپارچه‌ای که قصد درون‌ریزی آن را دارید وارد کنید.'}
          />

          {errorMessage && (
            <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
              {errorMessage}
            </Typography>
          )}
        </Box>
      </form>
    </BlurModal>
  );
};

export default ImportPoolModal;
