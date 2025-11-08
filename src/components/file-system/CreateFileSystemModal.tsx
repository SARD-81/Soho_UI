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
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import type { FileSystemEntry } from '../../@types/filesystem';
import type { UseCreateFileSystemReturn } from '../../hooks/useCreateFileSystem';
import { removePersianCharacters } from '../../utils/text';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface CreateFileSystemModalProps {
  controller: UseCreateFileSystemReturn;
  poolOptions: string[];
  existingFilesystems: FileSystemEntry[];
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
  existingFilesystems,
}: CreateFileSystemModalProps) => {
  const {
    isOpen,
    closeCreateModal,
    handleSubmit,
    selectedPool,
    setSelectedPool,
    poolError,
    setPoolError,
    filesystemName,
    setFileSystemName,
    nameError,
    quotaAmount,
    setQuotaAmount,
    quotaError,
    apiError,
    isCreating,
    setNameError,
  } = controller;
  const [hasPersianName, setHasPersianName] = useState(false);
  const [hasPersianQuota, setHasPersianQuota] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasPersianName(false);
      setHasPersianQuota(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hasPersianName) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasPersianName(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasPersianName]);

  useEffect(() => {
    if (!hasPersianQuota) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasPersianQuota(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasPersianQuota]);

  const handlePoolChange = (event: SelectChangeEvent<string>) => {
    if (poolError) {
      setPoolError(null);
    }
    setSelectedPool(event.target.value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const sanitizedValue = removePersianCharacters(value);
    setHasPersianName(sanitizedValue !== value);
    setFileSystemName(sanitizedValue);
    if (nameError) {
      setNameError(null);
    }
  };

  const handleQuotaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const sanitizedValue = removePersianCharacters(value);
    setHasPersianQuota(sanitizedValue !== value);

    const numericOnlyValue = sanitizedValue
      .replace(/,/g, '.')
      .replace(/[^\d.]/g, '')
      .replace(/(\..*)\./g, '$1');

    setQuotaAmount(numericOnlyValue);
  };

  const normalizedFilesystemMap = useMemo(() => {
    return existingFilesystems.reduce<Record<string, Set<string>>>(
      (acc, fs) => {
        const poolKey = fs.poolName.trim().toLowerCase();
        const nameKey = fs.filesystemName.trim().toLowerCase();

        if (!poolKey || !nameKey) {
          return acc;
        }

        if (!acc[poolKey]) {
          acc[poolKey] = new Set();
        }

        acc[poolKey].add(nameKey);
        return acc;
      },
      {}
    );
  }, [existingFilesystems]);

  const trimmedPool = selectedPool.trim();
  const trimmedName = filesystemName.trim();
  const normalizedPool = trimmedPool.toLowerCase();
  const isDuplicate =
    trimmedPool.length > 0 &&
    trimmedName.length > 0 &&
    normalizedFilesystemMap[normalizedPool]?.has(trimmedName.toLowerCase());
  const isSameAsPool =
    trimmedPool.length > 0 &&
    trimmedName.length > 0 &&
    trimmedName.toLowerCase() === normalizedPool;
  const hasOnlyEnglishAlphanumeric =
    trimmedName.length === 0 || /^[A-Za-z0-9]+$/.test(trimmedName);
  const startsWithNumber =
    trimmedName.length > 0 && /^[0-9]/.test(trimmedName);
  const isNameFormatValid =
    trimmedName.length === 0 || (hasOnlyEnglishAlphanumeric && !startsWithNumber);
  const shouldShowSuccess =
    trimmedPool.length > 0 &&
    trimmedName.length > 0 &&
    isNameFormatValid &&
    !isDuplicate &&
    !isSameAsPool;

  const adornmentIcon =
    isDuplicate || isSameAsPool ? (
      <FiAlertCircle color="var(--color-error)" size={18} />
    ) : shouldShowSuccess ? (
      <FiCheckCircle color="var(--color-success)" size={18} />
    ) : null;

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!hasOnlyEnglishAlphanumeric && trimmedName.length > 0) {
      event.preventDefault();
      setNameError('نام فضای فایلی باید فقط شامل حروف انگلیسی و اعداد باشد.');
      return;
    }

    if (startsWithNumber) {
      event.preventDefault();
      setNameError('نام فضای فایلی نمی‌تواند با عدد شروع شود.');
      return;
    }

    if (isDuplicate) {
      event.preventDefault();
      setNameError('فضای فایلی با این نام در این فضای یکپارچه وجود دارد.');
      return;
    }

    if (isSameAsPool) {
      event.preventDefault();
      setNameError('نام فضای فایلی نمی‌تواند با نام فضای یکپارچه یکسان باشد.');
      return;
    }

    handleSubmit(event);
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
      <Box
        component="form"
        id="create-filesystem-form"
        onSubmit={handleFormSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <InputLabel
            id="filesystem-pool-select"
            sx={{ color: 'var(--color-text)' }}
          >
            انتخاب فضای یکپارچه
          </InputLabel>
          <FormControl fullWidth error={Boolean(poolError)}>
            <Select
              labelId="filesystem-pool-select"
              // label="انتخاب Pool"
              value={selectedPool}
              onChange={handlePoolChange}
              displayEmpty
              sx={inputBaseStyles}
              size="small"
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'var(--color-card-bg)',
                    color: 'var(--color-text)',
                  },
                },
              }}
            >
              {poolOptions.length > 0 && (
                <MenuItem
                  value=""
                  disabled
                  sx={{ color: 'var(--color-secondary)' }}
                >
                  یکی از گزینه های زیر را انتخاب کنید
                </MenuItem>
              )}
              {poolOptions.length === 0 && (
                <MenuItem value="" disabled>
                  هیچ فضای یکپارچه ای برای ایجاد فضای فایلی موجود نیست.
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
          <InputLabel
            id="filesystem-name-input"
            sx={{ color: 'var(--color-text)' }}
          >
            نام فضای فایلی
          </InputLabel>
          <TextField
            // label="نام فضای فایلی"
            value={filesystemName}
            onChange={handleNameChange}
            fullWidth
            id="filesystem-name-input"
            size="small"
            autoComplete="off"
            placeholder="نامی یکتا برای فضای فایلی وارد کنید."
            error={
              Boolean(nameError) ||
              (!hasOnlyEnglishAlphanumeric && trimmedName.length > 0) ||
              startsWithNumber ||
              isDuplicate ||
              isSameAsPool ||
              hasPersianName
            }
            helperText={
              (hasPersianName &&
                'استفاده از حروف فارسی در این فیلد مجاز نیست.') ||
              nameError ||
              (!hasOnlyEnglishAlphanumeric &&
                trimmedName.length > 0 &&
                'نام فضای فایلی باید فقط شامل حروف انگلیسی و اعداد باشد.') ||
              (startsWithNumber &&
                'نام فضای فایلی نمی‌تواند با عدد شروع شود.') ||
              (isDuplicate &&
                'فضای فایلی با این نام در این فضای یکپارچه وجود دارد.') ||
              (isSameAsPool &&
                'نام فضای فایلی نمی‌تواند با نام فضای یکپارچه یکسان باشد.')
            }
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: inputBaseStyles,
              endAdornment:
                trimmedName.length > 0 && adornmentIcon ? (
                  <InputAdornment position="end">
                    {adornmentIcon}
                  </InputAdornment>
                ) : undefined,
            }}
          />
          <InputLabel
            id="filesystem-quota-input"
            sx={{ color: 'var(--color-text)' }}
          >
            حجم فضای فایلی (GB)
          </InputLabel>
          <TextField
            // label="حجم فضای فایلی (GB)"
            value={quotaAmount}
            onChange={handleQuotaChange}
            fullWidth
            placeholder="حجم فضای فایلی را به گیگابایت وارد کنید."
            id="filesystem-quota-input"
            size="small"
            autoComplete="off"
            error={Boolean(quotaError) || hasPersianQuota}
            helperText={
              (hasPersianQuota &&
                'استفاده از حروف فارسی در این فیلد مجاز نیست.') ||
              quotaError
            }
            type="text"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: inputBaseStyles,
              endAdornment: <InputAdornment position="end">GB</InputAdornment>,
            }}
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*[.,]?[0-9]*',
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
