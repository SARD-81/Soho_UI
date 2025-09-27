import {
  Box,
  Button,
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
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ChangeEvent } from 'react';
import BlurModal from '../BlurModal';
import type { UseCreatePoolReturn } from '../../hooks/useCreatePool';

interface CreatePoolModalProps {
  controller: UseCreatePoolReturn;
  deviceOptions: string[];
  isDiskLoading: boolean;
  diskError: Error | null;
}

const buttonBaseStyles = {
  borderRadius: '10px',
  fontWeight: 600,
};

const inputBaseStyles = {
  backgroundColor: 'var(--color-input-bg)',
  borderRadius: '10px',
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
        <>
          <Button
            onClick={closeCreateModal}
            variant="outlined"
            color="inherit"
            disabled={isCreating}
            sx={{ ...buttonBaseStyles, px: 3 }}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            form="create-pool-form"
            variant="contained"
            disabled={isCreating}
            sx={{
              ...buttonBaseStyles,
              px: 4,
              background:
                'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
              boxShadow: '0 14px 28px -18px rgba(0, 198, 169, 0.8)',
              '&:hover': {
                background:
                  'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
              },
            }}
          >
            {isCreating ? 'در حال ایجاد…' : 'ایجاد'}
          </Button>
        </>
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
            error={Boolean(poolNameError)}
            helperText={poolNameError ?? 'نام یکتا برای Pool جدید وارد کنید.'}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
          />

          <FormControl fullWidth>
            <InputLabel id="vdev-type-label" sx={{ color: 'var(--color-text)' }}>
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
              <MenuItem value="disk">disk</MenuItem>
            </Select>
          </FormControl>

          <FormControl component="fieldset" error={Boolean(devicesError)}>
            <Typography sx={{ fontWeight: 600, mb: 1, color: 'var(--color-text)' }}>
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 1,
                    p: 1.5,
                  }}
                >
                  {deviceOptions.map((device) => (
                    <FormControlLabel
                      key={device}
                      control={
                        <Checkbox
                          checked={selectedDevices.includes(device)}
                          onChange={() => toggleDevice(device)}
                          sx={{
                            color: 'var(--color-secondary)',
                            '&.Mui-checked': {
                              color: 'var(--color-primary)',
                            },
                          }}
                        />
                      }
                      label={device}
                      sx={{
                        alignItems: 'flex-start',
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
