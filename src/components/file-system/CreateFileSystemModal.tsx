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
import { useMemo } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import type { UseCreateFileSystemReturn } from '../../hooks/useCreateFileSystem';
import type { FileSystemEntry } from '../../@types/filesystem';
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

  const handlePoolChange = (event: SelectChangeEvent<string>) => {
    setSelectedPool(event.target.value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = removePersianCharacters(event.target.value);
    setFileSystemName(sanitizedValue);
    if (nameError) {
      setNameError(null);
    }
  };

  const handleQuotaChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuotaAmount(removePersianCharacters(event.target.value));
  };

  const normalizedFilesystemMap = useMemo(() => {
    return existingFilesystems.reduce<Record<string, Set<string>>>((acc, fs) => {
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
    }, {});
  }, [existingFilesystems]);

  const trimmedPool = selectedPool.trim();
  const trimmedName = filesystemName.trim();
  const normalizedPool = trimmedPool.toLowerCase();
  const isDuplicate =
    trimmedPool.length > 0 &&
    trimmedName.length > 0 &&
    normalizedFilesystemMap[normalizedPool]?.has(trimmedName.toLowerCase());
  const isNameFormatValid =
    trimmedName.length === 0 || /^[A-Za-z0-9]+$/.test(trimmedName);
  const shouldShowSuccess =
    trimmedPool.length > 0 &&
    trimmedName.length > 0 &&
    isNameFormatValid &&
    !isDuplicate;

  const adornmentIcon = isDuplicate ? (
    <FiAlertCircle color="var(--color-error)" size={18} />
  ) : shouldShowSuccess ? (
    <FiCheckCircle color="var(--color-success)" size={18} />
  ) : null;

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!isNameFormatValid && trimmedName.length > 0) {
      event.preventDefault();
      setNameError('نام فضای فایلی باید فقط شامل حروف انگلیسی و اعداد باشد.');
      return;
    }

    if (isDuplicate) {
      event.preventDefault();
      setNameError('فضای فایلی با این نام در این فضای یکپارچه وجود دارد.');
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
      <Box component="form" id="create-filesystem-form" onSubmit={handleFormSubmit}>
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
            error={Boolean(nameError) || !isNameFormatValid || isDuplicate}
            helperText={
              nameError ||
              (!isNameFormatValid &&
                trimmedName.length > 0 &&
                'نام فضای فایلی باید فقط شامل حروف انگلیسی و اعداد باشد.') ||
              (isDuplicate &&
                'فضای فایلی با این نام در این فضای یکپارچه وجود دارد.') ||
              'نامی یکتا برای فضای فایلی وارد کنید.'
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