import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ChangeEvent } from 'react';
import type { UseCreateFileSystemReturn } from '../../hooks/useCreateFileSystem';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface CreateFileSystemModalProps {
  controller: UseCreateFileSystemReturn;
  poolOptions: string[];
}

const inputBaseStyles = {
  backgroundColor: 'var(--color-input-bg)',
  borderRadius: '5px',
  color: 'var(--color-text)',
  '& fieldset': {
    borderColor: 'var(--color-input-border)',
  },
  '&:hover fieldset': {
    borderColor: 'var(--color-input-focus-border)',
  },
  '&.Mui-focused fieldset': {
    borderColor: 'var(--color-input-focus-border)',
  },
};

const CreateFileSystemModal = ({
  controller,
  poolOptions,
}: CreateFileSystemModalProps) => {
  const {
    isOpen,
    closeCreateModal,
    handleSubmit,
    selectedPool,
    setSelectedPool,
    poolError,
    filesystemName,
    setFileSystemName,
    nameError,
    quotaAmount,
    setQuotaAmount,
    quotaError,
    apiError,
    isCreating,
  } = controller;

  const handlePoolChange = (event: SelectChangeEvent<string>) => {
    setSelectedPool(event.target.value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileSystemName(event.target.value);
  };

  const handleQuotaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuotaAmount(event.target.value);
  };

  return (
    <BlurModal
      open={isOpen}
      onClose={closeCreateModal}
      title="ایجاد فضای فایلی"
      actions={
        <ModalActionButtons
          onCancel={closeCreateModal}
          confirmLabel="ایجاد"
          loadingLabel="در حال ایجاد…"
          isLoading={isCreating}
          disabled={isCreating}
          confirmProps={{
            type: 'submit',
            form: 'create-filesystem-form',
          }}
        />
      }
    >
      <Box component="form" id="create-filesystem-form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth error={Boolean(poolError)}>
            <InputLabel
              id="filesystem-pool-select"
              sx={{ color: 'var(--color-text)' }}
            >
              انتخاب فضای یکپارچه
            </InputLabel>
            <Select
              labelId="filesystem-pool-select"
              label="انتخاب Pool"
              value={selectedPool}
              onChange={handlePoolChange}
              sx={inputBaseStyles}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text)',
                  },
                },
              }}
            >
              {poolOptions.length === 0 && (
                <MenuItem value="" disabled>
                  یک فضای یکپارچه برای ایجاد فضای فایلی موجود نیست.
                </MenuItem>
              )}
              {poolOptions.map((pool) => (
                <MenuItem key={pool} value={pool}>
                  {pool}
                </MenuItem>
              ))}
            </Select>
            {poolError && <FormHelperText>{poolError}</FormHelperText>}
          </FormControl>

          <TextField
            label="نام فضای فایلی"
            value={filesystemName}
            onChange={handleNameChange}
            fullWidth
            autoComplete="off"
            error={Boolean(nameError)}
            helperText={nameError ?? 'نامی یکتا برای فضای فایلی وارد کنید.'}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
          />

          <TextField
            label="حجم فضای فایلی (GB)"
            value={quotaAmount}
            onChange={handleQuotaChange}
            fullWidth
            autoComplete="off"
            error={Boolean(quotaError)}
            helperText={
              quotaError ?? 'حجم فضای فایلی را به گیگابایت وارد کنید (مثلاً 50).'
            }
            type="number"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: inputBaseStyles,
              endAdornment: <InputAdornment position="end">GB</InputAdornment>,
              inputProps: { min: 0, step: '0.01' },
            }}
          />

          {apiError && (
            <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
              {apiError}
            </Typography>
          )}
        </Box>
      </Box>
    </BlurModal>
  );
};

export default CreateFileSystemModal;
