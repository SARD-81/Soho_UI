import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
} from '@mui/material';
import type { FormEvent } from 'react';
import { resolveVdevLabel } from '../../constants/vdev';
import type { UseAddPoolDevicesReturn } from '../../hooks/useAddPoolDevices';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';
import type { DeviceOption } from './CreatePoolModal';

interface AddPoolDiskModalProps {
  controller: UseAddPoolDevicesReturn;
  deviceOptions?: DeviceOption[];
  isDiskLoading?: boolean;
  diskError?: Error | null;
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

const validationRules = [
  { type: 'disk', label: 'هر دیسک جداگانه', rule: '۱ دیسک' },
  { type: 'mirror', label: 'RAID1', rule: 'حداقل ۲ دیسک (تعداد زوج)' },
  { type: 'raidz', label: 'RAID5', rule: 'حداقل ۳ دیسک' },
  { type: 'raidz2', label: 'RAID6', rule: 'حداقل ۵ دیسک' },
  { type: 'raidz3', label: 'Triple parity', rule: 'حداقل ۵ دیسک' },
  { type: 'spare', label: 'دیسک رزرو', rule: 'حداقل ۱ دیسک' },
];

const AddPoolDiskModal = ({
  controller,
  deviceOptions: externalDeviceOptions,
  isDiskLoading: externalIsDiskLoading,
  diskError: externalDiskError,
}: AddPoolDiskModalProps) => {
  const {
    isOpen,
    closeModal,
    poolName,
    vdevType,
    selectedDevices,
    devicesError,
    apiError,
    vdevError,
    isSubmitting,
    isVdevLoading,
    toggleDevice,
    handleSubmit,
  } = controller;

  const deviceOptions = externalDeviceOptions ?? [];
  const isDiskLoading = externalIsDiskLoading ?? false;
  const diskError = externalDiskError ?? null;
  const vdevLabel = resolveVdevLabel(vdevType);

  return (
    <BlurModal
      open={isOpen}
      onClose={closeModal}
      title={`افزودن دیسک به ${poolName ?? ''}`}
      actions={
        <ModalActionButtons
          onCancel={closeModal}
          confirmLabel="ثبت"
          loadingLabel="در حال ثبت..."
          isLoading={isSubmitting || isVdevLoading}
          disabled={isSubmitting || isVdevLoading || !poolName}
          cancelProps={{ sx: { borderRadius: '3px', px: 3 } }}
          confirmProps={{
            type: 'submit',
            form: 'add-pool-disk-form',
            sx: { borderRadius: '3px' },
          }}
        />
      }
    >
      <Box
        component="form"
        id="add-pool-disk-form"
        onSubmit={(event: FormEvent<HTMLFormElement>) => handleSubmit(event)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <InputLabel htmlFor="pool-name" sx={{ color: 'var(--color-text)', fontWeight: 600 }}>
          نام فضای یکپارچه
        </InputLabel>
        <TextField
          value={poolName ?? ''}
          id="pool-name"
          disabled
          fullWidth
          size="small"
          InputProps={{ sx: inputBaseStyles }}
        />

        <InputLabel htmlFor="vdev-type" sx={{ color: 'var(--color-text)', fontWeight: 600 }}>
          نوع آرایه
        </InputLabel>
        <TextField
          value={vdevType || vdevLabel}
          id="vdev-type"
          disabled
          fullWidth
          size="small"
          placeholder={isVdevLoading ? 'در حال شناسایی نوع آرایه...' : ''}
          InputProps={{ sx: inputBaseStyles }}
          helperText={vdevError ?? undefined}
          error={Boolean(vdevError)}
        />

        {isVdevLoading && (
          <LinearProgress sx={{ borderRadius: '5px', height: 6 }} />
        )}

        <Box
          sx={{
            border: '1px solid var(--color-divider)',
            borderRadius: '8px',
            p: 2,
            backgroundColor: 'var(--color-card-bg)',
          }}
        >
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)', mb: 1 }}>
            تعداد دیسک‌ها باید با نوع vdev سازگار باشد:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 3, color: 'var(--color-text)', lineHeight: 2 }}>
            {validationRules.map((rule) => (
              <Box component="li" key={rule.type} sx={{ listStyleType: 'disc' }}>
                <Typography component="span" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {rule.label}
                </Typography>{' '}
                <Typography component="span">: {rule.rule}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <FormControl component="fieldset" error={Boolean(devicesError)}>
          <Typography sx={{ fontWeight: 600, mb: 1, color: 'var(--color-text)' }}>
            انتخاب دیسک‌ها
          </Typography>

          {isDiskLoading && <LinearProgress sx={{ borderRadius: '5px', height: 6 }} />}

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
                borderRadius: '5px',
                border: '1px solid var(--color-input-border)',
                backgroundColor: 'var(--color-input-bg)',
              }}
            >
              <FormGroup
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
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
                      <Tooltip title={device.wwn} placement="top" arrow>
                        <Typography component="span" sx={{ color: 'var(--color-text)' }}>
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
    </BlurModal>
  );
};

export default AddPoolDiskModal;
