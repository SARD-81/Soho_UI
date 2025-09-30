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

  const [detailsAnchorEl, setDetailsAnchorEl] = useState<HTMLElement | null>(null);
  const isDetailsPopoverOpen = Boolean(detailsAnchorEl);

  const handleOpenDetails = (event: MouseEvent<HTMLElement>) => {
    setDetailsAnchorEl(event.currentTarget);
  };

  const handleCloseDetails = () => {
    setDetailsAnchorEl(null);
  };

  useEffect(() => {
    if (pathValidationStatus !== 'invalid' && isDetailsPopoverOpen) {
      setDetailsAnchorEl(null);
    }
  }, [isDetailsPopoverOpen, pathValidationStatus]);

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

  const pathValidationAdornment = (() => {
    if (isPathChecking) {
      return (
        <InputAdornment position="end">
          <CircularProgress size={18} thickness={5} />
        </InputAdornment>
      );
    }

    if (pathValidationStatus === 'invalid') {
      const tooltipTitle =
        pathValidationMessage || 'این مسیر در حال حاضر قابل استفاده نیست.';

      const detailsContent = pathValidationDetails ? (
        <Box sx={{ p: 2, maxWidth: 280 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            جزئیات مسیر موجود
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {pathValidationDetails.path && (
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>مسیر:</strong> {pathValidationDetails.path}
              </Typography>
            )}
            {pathValidationDetails.permissions && (
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>دسترسی‌ها:</strong> {pathValidationDetails.permissions}
              </Typography>
            )}
            {pathValidationDetails.owner && (
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>مالک:</strong> {pathValidationDetails.owner}
              </Typography>
            )}
            {pathValidationDetails.group && (
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                <strong>گروه:</strong> {pathValidationDetails.group}
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 2, maxWidth: 280 }}>
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {tooltipTitle}
          </Typography>
        </Box>
      );

      return (
        <>
          <InputAdornment position="end">
            <Tooltip title={tooltipTitle} placement="top">
              <IconButton
                size="small"
                sx={{ color: 'error.main' }}
                onClick={handleOpenDetails}
              >
                <FiAlertCircle size={18} />
              </IconButton>
            </Tooltip>
          </InputAdornment>
          <Popover
            open={isDetailsPopoverOpen}
            anchorEl={detailsAnchorEl}
            onClose={handleCloseDetails}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            {detailsContent}
          </Popover>
        </>
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
