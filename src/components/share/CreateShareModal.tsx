import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  InputAdornment,
  InputLabel,
  TextField,
  Tooltip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import type { SambaSharesResponse } from '../../@types/samba';
import type { UseCreateShareReturn } from '../../hooks/useCreateShare';
import { useFilesystemMountpoints } from '../../hooks/useFilesystemMountpoints';
import { useSambaUsers } from '../../hooks/useSambaUsers';
import { useZpool } from '../../hooks/useZpool';
import axiosInstance from '../../lib/axiosInstance';
import normalizeSambaUsers from '../../utils/sambaUsers';
import { removePersianCharacters } from '../../utils/text';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface CreateShareModalProps {
  controller: UseCreateShareReturn;
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

const autocompletePaperSlotProps = {
  paper: {
    sx: {
      bgcolor: 'var(--color-input-bg)',
      '& .MuiAutocomplete-option': {
        color: 'var(--color-text)',
        '&.Mui-focused': {
          bgcolor: 'var(--color-input-focus-border)',
          color: '#fff',
        },
        '&[aria-selected="true"]': {
          bgcolor: 'var(--color-primary)',
          color: '#fff',
        },
      },
    },
  },
} as const;

const CreateShareModal = ({ controller }: CreateShareModalProps) => {
  const {
    isOpen,
    closeCreateModal,
    handleSubmit,
    fullPath,
    setFullPath,
    validUsers,
    setValidUsers,
    fullPathError,
    validUsersError,
    apiError,
    isCreating,
    pathValidationStatus,
    pathValidationMessage,
    isPathChecking,
    isPathValid,
  } = controller;
  const [hasPersianPathInput, setHasPersianPathInput] = useState(false);
  const [hasPersianValidUsersInput, setHasPersianValidUsersInput] =
    useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasPersianPathInput(false);
      setHasPersianValidUsersInput(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hasPersianPathInput) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasPersianPathInput(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasPersianPathInput]);

  useEffect(() => {
    if (!hasPersianValidUsersInput) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasPersianValidUsersInput(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasPersianValidUsersInput]);

  const sambaUsersQuery = useSambaUsers({ enabled: isOpen });
  const sambaUsers = useMemo(
    () => normalizeSambaUsers(sambaUsersQuery.data?.data),
    [sambaUsersQuery.data?.data]
  );
  const sambaUsernames = useMemo(
    () => sambaUsers.map((user) => user.username).filter(Boolean),
    [sambaUsers]
  );

  const existingSharesQuery = useQuery<SambaSharesResponse>({
    queryKey: ['samba', 'shares', 'create-modal'],
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<SambaSharesResponse>('/api/samba/');
      return data;
    },
    enabled: isOpen,
    staleTime: 0,
    gcTime: 0,
  });

  const { refetch: refetchExistingShares } = existingSharesQuery;

  useEffect(() => {
    if (isOpen) {
      void refetchExistingShares();
    }
  }, [isOpen, refetchExistingShares]);

  const existingSharePaths = useMemo(() => {
    const shareDetails = existingSharesQuery.data?.data;

    if (!shareDetails) {
      return new Set<string>();
    }

    const paths = new Set<string>();

    Object.values(shareDetails).forEach((details) => {
      const rawPath =
        typeof details?.path === 'string' ? details.path : undefined;

      if (!rawPath) {
        return;
      }

      const trimmedPath = rawPath.trim();

      if (!trimmedPath) {
        return;
      }

      paths.add(trimmedPath);

      const withoutTrailingSlashes = trimmedPath.replace(/\/+$/, '');

      if (withoutTrailingSlashes) {
        paths.add(withoutTrailingSlashes);
      }
    });

    return paths;
  }, [existingSharesQuery.data?.data]);

  const filesystemMountpointsQuery = useFilesystemMountpoints({
    enabled: isOpen,
  });
  const mountpointOptions = useMemo(
    () => filesystemMountpointsQuery.data ?? [],
    [filesystemMountpointsQuery.data]
  );
  const { data: zpoolData } = useZpool();
  const normalizedPoolNames = useMemo(() => {
    const pools = zpoolData?.pools ?? [];

    return new Set(
      pools
        .map((pool) => pool.name?.trim())
        .filter((name): name is string => Boolean(name && name.length > 0))
        .map((name) => name.toLowerCase())
    );
  }, [zpoolData?.pools]);
  const filteredMountpointOptions = useMemo(
    () =>
      mountpointOptions.filter((option) => {
        const trimmedOption = option.trim();

        if (!trimmedOption) {
          return false;
        }

        if (existingSharePaths.has(trimmedOption)) {
          return false;
        }

        const withoutTrailingSlashes = trimmedOption.replace(/\/+$/, '');

        if (
          withoutTrailingSlashes &&
          existingSharePaths.has(withoutTrailingSlashes)
        ) {
          return false;
        }

        const normalizedOption = trimmedOption.toLowerCase();
        const normalizedOptionWithoutBoundarySlashes = normalizedOption.replace(
          /^\/+|\/+$/g,
          ''
        );

        return !normalizedPoolNames.has(normalizedOptionWithoutBoundarySlashes);
      }),
    [existingSharePaths, mountpointOptions, normalizedPoolNames]
  );

  const hasPathError =
    Boolean(fullPathError) ||
    pathValidationStatus === 'invalid' ||
    hasPersianPathInput;
  const pathHelperText =
    (hasPersianPathInput && 'استفاده از حروف فارسی در این فیلد مجاز نیست.') ||
    fullPathError ||
    (pathValidationStatus === 'invalid' && pathValidationMessage);
  const validUsersHelperText =
    (hasPersianValidUsersInput &&
      'استفاده از حروف فارسی در این فیلد مجاز نیست.') ||
    validUsersError ||
    (sambaUsersQuery.isError ? 'دریافت فهرست کاربران با خطا مواجه شد.' : null);
  const pathValidationAdornment = (() => {
    if (isPathChecking) {
      return (
        <InputAdornment position="end">
          <CircularProgress size={18} thickness={5} />
        </InputAdornment>
      );
    }

    if (pathValidationStatus === 'invalid' && pathValidationMessage) {
      return (
        <InputAdornment position="end">
          <Tooltip title={pathValidationMessage} placement="top">
            <Box
              component="span"
              sx={{ display: 'flex', color: 'error.main', cursor: 'pointer' }}
            >
              <FiAlertCircle size={18} />
            </Box>
          </Tooltip>
        </InputAdornment>
      );
    }

    if (isPathValid) {
      return (
        <InputAdornment position="end">
          <Box component="span" sx={{ display: 'flex', color: 'success.main' }}>
            <FiCheckCircle size={18} />
          </Box>
        </InputAdornment>
      );
    }

    return undefined;
  })();

  return (
    <BlurModal
      open={isOpen}
      onClose={closeCreateModal}
      title="ایجاد اشتراک جدید"
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
            form: 'create-share-form',
            sx: { borderRadius: '3px' },
          }}
        />
      }
    >
      <Box component="form" id="create-share-form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <InputLabel
            id="full-path-input"
            sx={{ color: 'var(--color-text)', fontSize: 14, fontWeight: 500 }}
          >
            مسیر کامل
          </InputLabel>
          <Autocomplete
            // freeSolo
            options={filteredMountpointOptions}
            value={fullPath}
            onChange={(_event, newValue) => {
              const originalValue = newValue ?? '';
              const sanitizedValue = removePersianCharacters(originalValue);
              setHasPersianPathInput(sanitizedValue !== originalValue);
              setFullPath(sanitizedValue);
            }}
            onInputChange={(_event, newInputValue, reason) => {
              if (
                reason === 'input' ||
                reason === 'clear' ||
                reason === 'reset'
              ) {
                const originalValue = newInputValue ?? '';
                const sanitizedValue = removePersianCharacters(originalValue);
                setHasPersianPathInput(sanitizedValue !== originalValue);
                setFullPath(sanitizedValue);
              }
            }}
            fullWidth
            size="small"
            loading={filesystemMountpointsQuery.isLoading}
            noOptionsText="مسیر (mountpoint) یافت نشد"
            slotProps={autocompletePaperSlotProps}
            renderInput={(params) => (
              <TextField
                {...params}
                // label="مسیر کامل"
                autoFocus
                id="full-path-input"
                placeholder="مسیر فضای فایلی را انتخاب کنید"
                error={hasPathError}
                helperText={pathHelperText}
                InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                InputProps={{
                  ...params.InputProps,
                  sx: inputBaseStyles,
                  endAdornment: (
                    <Fragment>
                      {pathValidationAdornment}
                      {filesystemMountpointsQuery.isLoading && (
                        <CircularProgress
                          size={18}
                          thickness={5}
                          sx={{ mr: 1 }}
                        />
                      )}
                      {params.InputProps?.endAdornment}
                    </Fragment>
                  ),
                }}
              />
            )}
          />
          <InputLabel
            id="valid-users-input"
            sx={{ color: 'var(--color-text)', fontSize: 14, fontWeight: 500 }}
          >
            کاربران مجاز
          </InputLabel>
          <Autocomplete
            options={sambaUsernames}
            value={validUsers || null}
            onChange={(_event, newValue) => {
              const originalValue = newValue ?? '';
              const sanitizedValue = removePersianCharacters(originalValue);
              setHasPersianValidUsersInput(sanitizedValue !== originalValue);
              setValidUsers(sanitizedValue);
            }}
            onInputChange={(_event, newInput, reason) => {
              if (reason === 'input') {
                const originalValue = newInput ?? '';
                const sanitizedValue = removePersianCharacters(originalValue);
                setHasPersianValidUsersInput(sanitizedValue !== originalValue);
              }

              if (reason === 'clear') {
                setValidUsers('');
                setHasPersianValidUsersInput(false);
              }

              if (reason === 'reset') {
                setHasPersianValidUsersInput(false);
              }
            }}
            loading={sambaUsersQuery.isLoading || sambaUsersQuery.isFetching}
            noOptionsText="کاربری یافت نشد"
            disabled={sambaUsersQuery.isError}
            slotProps={autocompletePaperSlotProps}
            renderInput={(params) => (
              <TextField
                {...params}
                // label="کاربران مجاز"
                placeholder="نام کاربر مجاز را انتخاب کنید"
                error={Boolean(validUsersError) || hasPersianValidUsersInput}
                helperText={validUsersHelperText}
                size="small"
                InputLabelProps={{ ...params.InputLabelProps, shrink: true }}
                InputProps={{
                  ...params.InputProps,
                  sx: inputBaseStyles,
                  endAdornment: params.InputProps?.endAdornment,
                }}
              />
            )}
          />

          {apiError && (
            <Alert severity="error" sx={{ direction: 'rtl' }}>
              {apiError}
            </Alert>
          )}

          {/*{!apiError && (*/}
          {/*  <Typography*/}
          {/*    variant="body2"*/}
          {/*    sx={{ color: 'var(--color-secondary)' }}*/}
          {/*  >*/}
          {/*    پس از ایجاد اشتراک، اطلاعات به‌طور خودکار در جدول به‌روزرسانی*/}
          {/*    می‌شود.*/}
          {/*  </Typography>*/}
          {/*)}*/}
        </Box>
      </Box>
    </BlurModal>
  );
};

export default CreateShareModal;
