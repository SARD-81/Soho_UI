import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import { Fragment, useMemo } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import type { UseCreateShareReturn } from '../../hooks/useCreateShare';
import { useFilesystemMountpoints } from '../../hooks/useFilesystemMountpoints';
import { useSambaUsers } from '../../hooks/useSambaUsers';
import normalizeSambaUsers from '../../utils/sambaUsers';
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

  const sambaUsersQuery = useSambaUsers({ enabled: isOpen });
  const sambaUsers = useMemo(
    () => normalizeSambaUsers(sambaUsersQuery.data?.data),
    [sambaUsersQuery.data?.data]
  );
  const sambaUsernames = useMemo(
    () => sambaUsers.map((user) => user.username).filter(Boolean),
    [sambaUsers]
  );

  const filesystemMountpointsQuery = useFilesystemMountpoints({
    enabled: isOpen,
  });
  const mountpointOptions = useMemo(
    () => filesystemMountpointsQuery.data ?? [],
    [filesystemMountpointsQuery.data]
  );

  const hasPathError =
    Boolean(fullPathError) || pathValidationStatus === 'invalid';
  const pathHelperText =
    fullPathError ||
    (pathValidationStatus === 'invalid' && pathValidationMessage);
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
          <Autocomplete
            // freeSolo
            options={mountpointOptions}
            value={fullPath}
            onChange={(_event, newValue) => setFullPath(newValue ?? '')}
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
                label="مسیر کامل"
                autoFocus
                placeholder="مانند /mnt/data/share"
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

          <Autocomplete
            options={sambaUsernames}
            value={validUsers || null}
            onChange={(_event, newValue) => setValidUsers(newValue ?? '')}
            onInputChange={(_event, _newInput, reason) => {
              if (reason === 'clear') {
                setValidUsers('');
              }
            }}
            loading={sambaUsersQuery.isLoading || sambaUsersQuery.isFetching}
            noOptionsText="کاربری یافت نشد"
            disabled={sambaUsersQuery.isError}
            slotProps={autocompletePaperSlotProps}
            renderInput={(params) => (
              <TextField
                {...params}
                label="کاربران مجاز"
                placeholder="نام کاربر مجاز را انتخاب یا جست‌وجو کنید"
                error={Boolean(validUsersError)}
                helperText={
                  validUsersError ??
                  (sambaUsersQuery.isError
                    ? 'دریافت فهرست کاربران با خطا مواجه شد.'
                    : null)
                }
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
