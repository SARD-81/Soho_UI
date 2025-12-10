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
import { Fragment, useEffect, useMemo } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import type { SambaSharepointsResponse } from '../../@types/samba';
import type { UseCreateShareReturn } from '../../hooks/useCreateShare';
import { useFilesystemMountpoints } from '../../hooks/useFilesystemMountpoints';
import { useSambaGroupNames } from '../../hooks/useSambaGroupNames';
import { useSambaUsernamesList } from '../../hooks/useSambaUsernamesList';
import { useZpool } from '../../hooks/useZpool';
import axiosInstance from '../../lib/axiosInstance';
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
    validGroups,
    setValidGroups,
    fullPathError,
    validUsersError,
    validGroupsError,
    apiError,
    isCreating,
    pathValidationStatus,
    pathValidationMessage,
    isPathChecking,
    isPathValid,
  } = controller;

  const sambaUsernamesQuery = useSambaUsernamesList({ enabled: isOpen });
  const sambaUsernames = useMemo(() => sambaUsernamesQuery.data ?? [], [
    sambaUsernamesQuery.data,
  ]);

  const sambaGroupNamesQuery = useSambaGroupNames({ enabled: isOpen });
  const sambaGroupNames = useMemo(() => sambaGroupNamesQuery.data ?? [], [
    sambaGroupNamesQuery.data,
  ]);

  const existingSharesQuery = useQuery<SambaSharepointsResponse>({
    queryKey: ['samba', 'shares', 'create-modal'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<SambaSharepointsResponse>(
        '/api/samba/sharepoints/',
        { params: { property: 'all' } }
      );
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
    const shareDetails = existingSharesQuery.data?.data ?? [];

    const paths = new Set<string>();

    shareDetails.forEach((details) => {
      const rawPath = typeof details?.path === 'string' ? details.path : undefined;

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

  const hasPathError = Boolean(fullPathError) || pathValidationStatus === 'invalid';
  const pathHelperText = fullPathError || pathValidationMessage;
  const validUsersHelperText =
    validUsersError ||
    (sambaUsernamesQuery.isError ? 'دریافت فهرست کاربران با خطا مواجه شد.' : null);

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
            options={filteredMountpointOptions}
            value={fullPath}
            onChange={(_event, newValue) => {
              setFullPath(newValue ?? '');
            }}
            onInputChange={(_event, newInputValue, reason) => {
              if (
                reason === 'input' ||
                reason === 'clear' ||
                reason === 'reset'
              ) {
                setFullPath(newInputValue ?? '');
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
            multiple
            options={sambaUsernames}
            value={validUsers}
            onChange={(_event, newValue) => {
              setValidUsers(newValue ?? []);
            }}
            loading={sambaUsernamesQuery.isLoading || sambaUsernamesQuery.isFetching}
            noOptionsText="کاربری یافت نشد"
            disabled={sambaUsernamesQuery.isError}
            slotProps={autocompletePaperSlotProps}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="نام کاربر مجاز را انتخاب کنید"
                error={Boolean(validUsersError)}
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

          <InputLabel
            id="valid-groups-input"
            sx={{ color: 'var(--color-text)', fontSize: 14, fontWeight: 500 }}
          >
            گروه های مجاز
          </InputLabel>
          <Autocomplete
            multiple
            options={sambaGroupNames}
            value={validGroups}
            onChange={(_event, newValue) => {
              setValidGroups(newValue ?? []);
            }}
            loading={sambaGroupNamesQuery.isLoading || sambaGroupNamesQuery.isFetching}
            noOptionsText="گروهی یافت نشد"
            disabled={sambaGroupNamesQuery.isError}
            slotProps={autocompletePaperSlotProps}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="نام گروه مجاز را انتخاب کنید"
                error={Boolean(validGroupsError)}
                helperText={validGroupsError}
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
        </Box>
      </Box>
    </BlurModal>
  );
};

export default CreateShareModal;
