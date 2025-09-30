import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ChangeEvent, MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import type { UseCreateShareReturn } from '../../hooks/useCreateShare';
import { useSambaUsers } from '../../hooks/useSambaUsers';
import BlurModal from '../BlurModal';
import normalizeSambaUsers from '../../utils/sambaUsers';

interface CreateShareModalProps {
  controller: UseCreateShareReturn;
}

const buttonBaseStyles = {
  borderRadius: '3px',
  fontWeight: 600,
};

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
    pathValidationDetails,
  } = controller;

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFullPath(event.target.value);
  };

  const [pathDetailsAnchorEl, setPathDetailsAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const handleOpenPathDetails = (event: MouseEvent<HTMLElement>) => {
    const { currentTarget } = event;

    setPathDetailsAnchorEl((prev) => (prev ? null : currentTarget));
  };

  const handleClosePathDetails = () => {
    setPathDetailsAnchorEl(null);
  };

  const isPathDetailsOpen = Boolean(pathDetailsAnchorEl);

  useEffect(() => {
    if (pathValidationStatus !== 'invalid') {
      setPathDetailsAnchorEl(null);
    }
  }, [pathValidationStatus]);

  const sambaUsersQuery = useSambaUsers({ enabled: isOpen });
  const sambaUsers = useMemo(
    () => normalizeSambaUsers(sambaUsersQuery.data?.data),
    [sambaUsersQuery.data?.data]
  );
  const sambaUsernames = useMemo(
    () => sambaUsers.map((user) => user.username).filter(Boolean),
    [sambaUsers]
  );

  const hasPathError =
    Boolean(fullPathError) || pathValidationStatus === 'invalid';
  const pathHelperText =
    fullPathError ||
    (pathValidationStatus === 'invalid' && pathValidationMessage) ||
    'مسیر کامل پوشه اشتراک را وارد کنید (مانند /mnt/data/share).';

  const pathDetailEntries = useMemo(
    () =>
      [
        { label: 'مسیر', value: pathValidationDetails?.path },
        { label: 'سطح دسترسی', value: pathValidationDetails?.permissions },
        { label: 'مالک', value: pathValidationDetails?.owner },
        { label: 'گروه', value: pathValidationDetails?.group },
      ].filter((entry) => Boolean(entry.value)),
    [pathValidationDetails]
  );

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
            <IconButton
              size="small"
              onClick={handleOpenPathDetails}
              sx={{ color: 'error.main', p: 0.5 }}
            >
              <FiAlertCircle size={18} />
            </IconButton>
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
            form="create-share-form"
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
      <Box component="form" id="create-share-form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="مسیر کامل"
            value={fullPath}
            onChange={handlePathChange}
            autoFocus
            fullWidth
            size="small"
            error={hasPathError}
            helperText={pathHelperText}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles, endAdornment: pathValidationAdornment }}
          />
          <Popover
            open={isPathDetailsOpen && pathValidationStatus === 'invalid'}
            anchorEl={pathDetailsAnchorEl}
            onClose={handleClosePathDetails}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { p: 2, maxWidth: 280 } } }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                جزئیات مسیر موجود
              </Typography>
              {pathDetailEntries.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {pathDetailEntries.map((detail) => (
                    <Box key={detail.label} sx={{ display: 'flex', gap: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{detail.label}:</Typography>
                      <Typography sx={{ wordBreak: 'break-all' }}>
                        {detail.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  اطلاعاتی برای نمایش موجود نیست.
                </Typography>
              )}
            </Box>
          </Popover>

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
            renderInput={(params) => (
              <TextField
                {...params}
                label="کاربران مجاز"
                error={Boolean(validUsersError)}
                helperText={
                  validUsersError ??
                  (sambaUsersQuery.isError
                    ? 'دریافت فهرست کاربران با خطا مواجه شد.'
                    : 'یکی از کاربران Samba را برای اشتراک انتخاب کنید.')
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

          {!apiError && (
            <Typography
              variant="body2"
              sx={{ color: 'var(--color-secondary)' }}
            >
              پس از ایجاد اشتراک، اطلاعات به‌طور خودکار در جدول به‌روزرسانی
              می‌شود.
            </Typography>
          )}
        </Box>
      </Box>
    </BlurModal>
  );
};

export default CreateShareModal;
