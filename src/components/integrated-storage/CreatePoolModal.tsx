import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ChangeEvent } from 'react';
import type { UseCreatePoolReturn } from '../../hooks/useCreatePool';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

export interface DeviceOption {
  label: string;
  value: string;
  tooltip: string;
}

interface CreatePoolModalProps {
  controller: UseCreatePoolReturn;
  deviceOptions: DeviceOption[];
  isDiskLoading: boolean;
  diskError: Error | null;
}

const inputBaseStyles = {
  backgroundColor: 'var(--color-input-bg)',
  height: 1,
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

const CreatePoolModal = ({
  controller,
  deviceOptions,
  isDiskLoading,
  diskError,
}: CreatePoolModalProps) => {
  const {
    isOpen,
    closeCreateModal,
    handleSubmit,
    poolName,
    setPoolName,
    vdevType,
    setVdevType,
    selectedDevices,
    toggleDevice,
    poolNameError,
    devicesError,
    apiError,
    isCreating,
  } = controller;

  const handlePoolNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPoolName(event.target.value);
  };

  const handleVdevChange = (event: SelectChangeEvent<string>) => {
    setVdevType(event.target.value);
  };

  return (
    <BlurModal
      open={isOpen}
      onClose={closeCreateModal}
      title="ایجاد Pool جدید"
      actions={
        <ModalActionButtons
          onCancel={closeCreateModal}
          confirmLabel="ایجاد"
          loadingLabel="در حال ایجاد…"
          isLoading={isCreating}
          disabled={isCreating}
          cancelProps={{
            sx: { borderRadius: '3px', px: 3 },
          }}
          confirmProps={{
            type: 'submit',
            form: 'create-pool-form',
            sx: { borderRadius: '3px' },
          }}
        />
      }
    >
      <Box component="form" id="create-pool-form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="نام Pool"
            value={poolName}
            onChange={handlePoolNameChange}
            autoFocus
            fullWidth
            size="small"
            error={Boolean(poolNameError)}
            helperText={poolNameError ?? 'نام یکتا برای Pool جدید وارد کنید.'}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel
              id="vdev-type-label"
              sx={{ color: 'var(--color-text)' }}
            >
              نوع VDEV
            </InputLabel>
            <Select
              labelId="vdev-type-label"
              label="نوع VDEV"
              value={vdevType}
              onChange={handleVdevChange}
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
              <MenuItem value="disk">DISK</MenuItem>
              <MenuItem value="mirror">MIRROR</MenuItem>
              <MenuItem value="raidz">RAIDZ</MenuItem>
            </Select>
          </FormControl>

          <FormControl component="fieldset" error={Boolean(devicesError)}>
            <Typography
              sx={{ fontWeight: 600, mb: 1, color: 'var(--color-text)' }}
            >
              انتخاب دیسک‌ها
            </Typography>

            {isDiskLoading && (
              <LinearProgress sx={{ borderRadius: '10px', height: 6 }} />
            )}

            {diskError && !isDiskLoading && (
              <Typography sx={{ color: 'var(--color-error)' }}>
                خطا در دریافت اطلاعات دیسک‌ها: {diskError.message}
              </Typography>
            )}

            {!isDiskLoading && !diskError && deviceOptions.length === 0 && (
              <Typography sx={{ color: 'var(--color-secondary)' }}>
                دیسکی برای انتخاب موجود نیست.
              </Typography>
            )}

            {!isDiskLoading && !diskError && deviceOptions.length > 0 && (
              <Box
                sx={{
                  maxHeight: 260,
                  overflowY: 'auto',
                  pr: 0.5,
                  borderRadius: '10px',
                  border: '1px solid var(--color-input-border)',
                  backgroundColor: 'var(--color-input-bg)',
                }}
              >
                <FormGroup
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 1,
                    p: 1.5,
                  }}
                >
                  {deviceOptions.map((device) => (
                    <FormControlLabel
                      key={device.value}
                      control={
                        <Checkbox
                          checked={selectedDevices.includes(device.value)}
                          onChange={() => toggleDevice(device.value)}
                          sx={{
                            color: 'var(--color-secondary)',
                            '&.Mui-checked': {
                              color: 'var(--color-primary)',
                            },
                          }}
                        />
                      }
                      label={
                        <Tooltip title={device.tooltip} placement="top" arrow>
                          <Typography
                            component="span"
                            sx={{ color: 'var(--color-text)' }}
                          >
                            {device.label}
                          </Typography>
                        </Tooltip>
                      }
                      sx={{
                        alignItems: 'center',
                        m: 0,
                        borderRadius: '8px',
                        px: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 198, 169, 0.08)',
                        },
                        '& .MuiFormControlLabel-label': {
                          whiteSpace: 'normal',
                          color: 'var(--color-text)',
                        },
                      }}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            {devicesError && <FormHelperText>{devicesError}</FormHelperText>}
          </FormControl>

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

export default CreatePoolModal;
