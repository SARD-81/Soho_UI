import {
  Alert,
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
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
    importablePools,
    isImportablePoolsLoading,
    importablePoolsError,
    handleSubmit,
    closeModal,
  } = controller;

  const hasImportablePools = importablePools.length > 0;
  const handlePoolSelect = (event: SelectChangeEvent<string>) => {
    setPoolName(event.target.value);
  };

  return (
    <BlurModal
      open={isOpen}
      onClose={closeModal}
      title="فراخوانی فضای یکپارچه"
      minWidth="380px"
      actions={
        <ModalActionButtons
          onCancel={closeModal}
          onConfirm={handleSubmit}
          confirmLabel="فراخوانی"
          loadingLabel="در حال فراخوانی..."
          isLoading={isImporting}
          disabled={isImporting || isImportablePoolsLoading}
          disableConfirmGradient
        />
      }
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {importablePoolsError && (
            <Alert severity="warning">
              {importablePoolsError.message ||
                'فهرست فضاهای قابل فراخوانی دریافت نشد؛ نام را به‌صورت دستی وارد کنید.'}
            </Alert>
          )}

          {!isImportablePoolsLoading && !importablePoolsError && !hasImportablePools && (
            <Alert severity="info">
              فضای یکپارچه‌ای برای فراخوانی پیدا نشد. در صورت اطمینان می‌توانید نام را دستی وارد کنید.
            </Alert>
          )}

          {hasImportablePools ? (
            <FormControl fullWidth size="small" error={Boolean(errorMessage)}>
              <InputLabel id="importable-pool-select-label">
                نام فضای یکپارچه
              </InputLabel>
              <Select
                labelId="importable-pool-select-label"
                label="نام فضای یکپارچه"
                value={poolName}
                onChange={handlePoolSelect}
                autoFocus
                sx={{ color: 'var(--color-text)' }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: 'var(--color-card-bg)',
                      color: 'var(--color-text)',
                    },
                  },
                }}
              >
                {importablePools.map((pool) => (
                  <MenuItem key={pool.id} value={pool.name}>
                    {pool.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errorMessage || 'یکی از فضاهای قابل فراخوانی را انتخاب کنید.'}
              </FormHelperText>
            </FormControl>
          ) : (
            <TextField
              label="نام فضای یکپارچه"
              value={poolName}
              onChange={(event) => setPoolName(event.target.value)}
              fullWidth
              autoFocus
              size="small"
              disabled={isImportablePoolsLoading}
              error={Boolean(errorMessage)}
              helperText={
                errorMessage ||
                (isImportablePoolsLoading
                  ? 'در حال دریافت فهرست فضاهای قابل فراخوانی...'
                  : 'نام فضای یکپارچه‌ای که قصد فراخوانی آن را دارید وارد کنید.')
              }
              sx={{
                '& .MuiOutlinedInput-input': {
                  color: 'var(--color-text)',
                },
              }}
            />
          )}

          {isImportablePoolsLoading && (
            <Typography variant="body2" sx={{ color: 'var(--color-muted)' }}>
              در حال دریافت فهرست فضاهای قابل فراخوانی...
            </Typography>
          )}
        </Box>
      </form>
    </BlurModal>
  );
};

export default ImportPoolModal;
