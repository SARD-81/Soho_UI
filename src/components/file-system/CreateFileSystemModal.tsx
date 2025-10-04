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
    apiError,
    isCreating,
  } = controller;

  const handlePoolChange = (event: SelectChangeEvent<string>) => {
    setSelectedPool(event.target.value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFileSystemName(event.target.value);
  };

  return (
    <BlurModal
      open={isOpen}
      onClose={closeCreateModal}
      title="ایجاد فایل سیستم جدید"
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
              انتخاب Pool
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
                  Poolی برای ایجاد فایل سیستم موجود نیست.
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
            label="نام فایل سیستم"
            value={filesystemName}
            onChange={handleNameChange}
            fullWidth
            autoComplete="off"
            error={Boolean(nameError)}
            helperText={nameError ?? 'نامی یکتا برای فایل سیستم وارد کنید.'}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
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
