import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { resolveVdevLabel } from '../../constants/vdev';
import type { UseCreatePoolReturn } from '../../hooks/useCreatePool';
import { removePersianCharacters } from '../../utils/text';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

export interface DeviceOption {
  label: string;
  value: string;
  tooltip: string;
  wwn?: string;
}

interface CreatePoolModalProps {
  controller: UseCreatePoolReturn;
  deviceOptions?: DeviceOption[];
  isDiskLoading?: boolean;
  diskError?: Error | null;
  existingPoolNames?: string[];
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
  deviceOptions: externalDeviceOptions,
  isDiskLoading: externalIsDiskLoading,
  diskError: externalDiskError,
  existingPoolNames = [],
}: CreatePoolModalProps) => {
  const {
    isOpen,
    closeCreateModal,
    handleSubmit,
    poolName,
    setPoolName,
    setPoolNameError,
    vdevType,
    setVdevType,
    vdevTypeError,
    setVdevTypeError,
    selectedDevices,
    toggleDevice,
    poolNameError,
    devicesError,
    apiError,
    isCreating,
  } = controller;
  const [hasPersianPoolName, setHasPersianPoolName] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasPersianPoolName(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hasPersianPoolName) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasPersianPoolName(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasPersianPoolName]);

  const deviceOptions = externalDeviceOptions ?? [];

  const isDiskListLoading = externalIsDiskLoading ?? false;

  const diskError = externalDiskError ?? null;

  const normalizedExistingNames = useMemo(() => {
    return existingPoolNames
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0);
  }, [existingPoolNames]);

  const trimmedPoolName = poolName.trim();
  const normalizedPoolName = trimmedPoolName.toLowerCase();
  const isDuplicate =
    trimmedPoolName.length > 0 &&
    normalizedExistingNames.includes(normalizedPoolName);
  const hasOnlyEnglishAlphanumeric =
    trimmedPoolName.length === 0 || /^[A-Za-z0-9]+$/.test(trimmedPoolName);
  const startsWithNumber =
    trimmedPoolName.length > 0 && /^[0-9]/.test(trimmedPoolName);
  const isNameFormatValid =
    trimmedPoolName.length === 0 || (hasOnlyEnglishAlphanumeric && !startsWithNumber);
  const shouldShowSuccess =
    trimmedPoolName.length > 0 && isNameFormatValid && !isDuplicate;

  const adornmentIcon = isDuplicate ? (
    <FiAlertCircle color="var(--color-error)" size={18} />
  ) : shouldShowSuccess ? (
    <FiCheckCircle color="var(--color-success)" size={18} />
  ) : null;

  const handlePoolNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const sanitizedValue = removePersianCharacters(value);
    setHasPersianPoolName(sanitizedValue !== value);
    setPoolName(sanitizedValue);
    if (poolNameError) {
      setPoolNameError(null);
    }
  };

  const handleVdevChange = (event: SelectChangeEvent<string>) => {
    if (vdevTypeError) {
      setVdevTypeError(null);
    }
    setVdevType(event.target.value);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!hasOnlyEnglishAlphanumeric && trimmedPoolName.length > 0) {
      event.preventDefault();
      setPoolNameError(
        'نام فضای یکپارچه باید فقط شامل حروف انگلیسی و اعداد باشد.'
      );
      return;
    }

    if (startsWithNumber) {
      event.preventDefault();
      setPoolNameError('نام فضای یکپارچه نمی‌تواند با عدد شروع شود.');
      return;
    }

    if (isDuplicate) {
      event.preventDefault();
      setPoolNameError('فضای یکپارچه‌ای با این نام از قبل وجود دارد.');
      return;
    }

    handleSubmit(event);
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
      <Box component="form" id="create-pool-form" onSubmit={handleFormSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <InputLabel
            htmlFor="pool-name-input"
            sx={{ color: 'var(--color-text)', fontWeight: 600 }}
          >
            نام فضای یکپارچه
          </InputLabel>
          <TextField
            // label="نام فضای یکپارچه"
            value={poolName}
            onChange={handlePoolNameChange}
            autoFocus
            placeholder={'نام یکتا برای فضای یکپارچه وارد کنید.'}
            fullWidth
            size="small"
            error={
              Boolean(poolNameError) ||
              (!hasOnlyEnglishAlphanumeric && trimmedPoolName.length > 0) ||
              startsWithNumber ||
              isDuplicate ||
              hasPersianPoolName
            }
            helperText={
              (hasPersianPoolName &&
                'استفاده از حروف فارسی در این فیلد مجاز نیست.') ||
              poolNameError ||
              (!hasOnlyEnglishAlphanumeric &&
                trimmedPoolName.length > 0 &&
                'نام فضای یکپارچه باید فقط شامل حروف انگلیسی و اعداد باشد.') ||
              (startsWithNumber &&
                'نام فضای یکپارچه نمی‌تواند با عدد شروع شود.') ||
              (isDuplicate && 'فضای یکپارچه‌ای با این نام از قبل وجود دارد.') ||
              undefined
            }
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: inputBaseStyles,
              endAdornment:
                trimmedPoolName.length > 0 && adornmentIcon ? (
                  <InputAdornment position="end">
                    {adornmentIcon}
                  </InputAdornment>
                ) : undefined,
            }}
          />
          <InputLabel id="vdev-type-label" sx={{ color: 'var(--color-text)' }}>
            نوع آرایه
          </InputLabel>
          <FormControl
            size="small"
            fullWidth
            error={Boolean(vdevTypeError)}
          >
            <Select
              labelId="vdev-type-label"
              // label="نوع VDEV"
              value={vdevType || ''}
              onChange={handleVdevChange}
              displayEmpty
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
              <MenuItem
                value=""
                sx={{ color: 'var(--color-secondary)' }}
              >
                یکی از گزینه های زیر را انتخاب کنید
              </MenuItem>
              <MenuItem value="disk">{resolveVdevLabel('disk')}</MenuItem>
              <MenuItem value="mirror">{resolveVdevLabel('mirror')}</MenuItem>
              <MenuItem value="raidz">{resolveVdevLabel('raidz')}</MenuItem>
            </Select>
            {vdevTypeError && (
              <FormHelperText>{vdevTypeError}</FormHelperText>
            )}
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
                    display: 'flex',
                    flexDirection : "row",
                    // gridTemplateColumns:
                    //   'repeat(auto-fill, minmax(180px, 1fr))',
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