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
import { useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UseCreatePoolReturn } from '../../hooks/useCreatePool';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';
import axiosInstance from '../../lib/axiosInstance';

interface FreeDiskResponse {
  ok: boolean;
  error: string | null;
  data: string[];
}

export interface DeviceOption {
  label: string;
  value: string;
  tooltip: string;
}

interface CreatePoolModalProps {
  controller: UseCreatePoolReturn;
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

const CreatePoolModal = ({ controller }: CreatePoolModalProps) => {
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

  const {
    data: freeDiskResponse,
    isLoading: isDiskLoading,
    isFetching: isDiskFetching,
    error: diskError,
  } = useQuery<FreeDiskResponse, Error>({
    queryKey: ['disk', 'free'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<FreeDiskResponse>(
        '/api/disk/free'
      );
      return data;
    },
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const deviceOptions = useMemo<DeviceOption[]>(() => {
    if (!freeDiskResponse?.data) {
      return [];
    }

    return freeDiskResponse.data.map((disk) => ({
      label: disk,
      value: disk,
      tooltip: disk,
    }));
  }, [freeDiskResponse?.data]);

  const isDiskListLoading =
    isDiskLoading || (isOpen && isDiskFetching && !freeDiskResponse);

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
      title="ایجاد فضای یکپارچه"
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
            label="نام فضای یکپارچه"
            value={poolName}
            onChange={handlePoolNameChange}
            autoFocus
            placeholder={'نام یکتا برای فضای یکپارچه وارد کنید.'}
            fullWidth
            size="small"
            error={Boolean(poolNameError)}
            helperText={poolNameError}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel
              id="vdev-type-label"
              sx={{ color: 'var(--color-text)' }}
            >
              نوع آرایه
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
              <MenuItem value="disk">STRIPE</MenuItem>
              <MenuItem value="mirror">MIRROR</MenuItem>
              <MenuItem value="raidz">RAID5</MenuItem>
            </Select>
          </FormControl>

          <FormControl component="fieldset" error={Boolean(devicesError)}>
            <Typography
              sx={{ fontWeight: 600, mb: 1, color: 'var(--color-text)' }}
            >
              انتخاب دیسک‌ها
            </Typography>

            {isDiskListLoading && (
              <LinearProgress sx={{ borderRadius: '5px', height: 6 }} />
            )}

            {diskError && !isDiskListLoading && (
              <Typography sx={{ color: 'var(--color-error)' }}>
                خطا در دریافت اطلاعات دیسک‌ها: {diskError.message}
              </Typography>
            )}

            {!isDiskListLoading && !diskError && deviceOptions.length === 0 && (
              <Typography sx={{ color: 'var(--color-secondary)' }}>
                دیسکی برای انتخاب موجود نیست.
              </Typography>
            )}

            {!isDiskListLoading && !diskError && deviceOptions.length > 0 && (
              <Box
                sx={{
                  maxHeight: 260,
                  overflowY: 'auto',
                  pr: 0.5,
                  borderRadius: '5px',
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
                        borderRadius: '5px',
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
