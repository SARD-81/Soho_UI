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
import type { UseCreateVolumeReturn } from '../../hooks/useCreateVolume';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface CreateVolumeModalProps {
  controller: UseCreateVolumeReturn;
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

const CreateVolumeModal = ({
  controller,
  poolOptions,
}: CreateVolumeModalProps) => {
  const {
    isOpen,
    closeCreateModal,
    handleSubmit,
    selectedPool,
    setSelectedPool,
    poolError,
    volumeName,
    setVolumeName,
    nameError,
    sizeValue,
    setSizeValue,
    sizeUnit,
    setSizeUnit,
    sizeError,
    apiError,
    isCreating,
  } = controller;

  const handlePoolChange = (event: SelectChangeEvent<string>) => {
    setSelectedPool(event.target.value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVolumeName(event.target.value);
  };

  const handleSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSizeValue(event.target.value.replace(/[^\d.]/g, ''));
  };

  const handleUnitChange = (event: SelectChangeEvent<'GB' | 'TB'>) => {
    setSizeUnit(event.target.value as 'GB' | 'TB');
  };

  return (
    <BlurModal
      open={isOpen}
      onClose={closeCreateModal}
      title="ایجاد Volume جدید"
      actions={
        <ModalActionButtons
          onCancel={closeCreateModal}
          confirmLabel="ایجاد"
          loadingLabel="در حال ایجاد…"
          isLoading={isCreating}
          disabled={isCreating}
          confirmProps={{
            type: 'submit',
            form: 'create-volume-form',
          }}
        />
      }
    >
      <Box component="form" id="create-volume-form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth error={Boolean(poolError)}>
            <InputLabel
              id="volume-pool-select"
              sx={{ color: 'var(--color-text)' }}
            >
              انتخاب Pool
            </InputLabel>
            <Select
              labelId="volume-pool-select"
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
                  Poolی برای ایجاد Volume موجود نیست.
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
            label="نام Volume"
            value={volumeName}
            onChange={handleNameChange}
            fullWidth
            autoComplete="off"
            error={Boolean(nameError)}
            helperText={nameError ?? 'نامی یکتا برای Volume وارد کنید.'}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              label="حجم"
              value={sizeValue}
              onChange={handleSizeChange}
              fullWidth
              type="text"
              inputMode="decimal"
              error={Boolean(sizeError)}
              helperText={sizeError ?? 'مقدار حجم را وارد کنید.'}
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: inputBaseStyles }}
            />

            <FormControl fullWidth>
              <InputLabel
                id="volume-size-unit"
                sx={{ color: 'var(--color-text)' }}
              >
                واحد
              </InputLabel>
              <Select
                labelId="volume-size-unit"
                label="واحد"
                value={sizeUnit}
                onChange={handleUnitChange}
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
                <MenuItem value="GB">GB</MenuItem>
                <MenuItem value="TB">TB</MenuItem>
              </Select>
            </FormControl>
          </Box>

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

export default CreateVolumeModal;
