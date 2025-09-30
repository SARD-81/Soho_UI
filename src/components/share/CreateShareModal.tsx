import {
  Alert,
  Autocomplete,
  Box,
  Button,
  ClickAwayListener,
  CircularProgress,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ChangeEvent } from 'react';
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
    pathValidationDetails,
    isPathChecking,
    isPathValid,
  } = controller;

  const [isPathDetailsOpen, setIsPathDetailsOpen] = useState(false);

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFullPath(event.target.value);
    setIsPathDetailsOpen(false);
  };

  const sambaUsersQuery = useSambaUsers({ enabled: isOpen });
  const sambaUsers = useMemo(
    () => normalizeSambaUsers(sambaUsersQuery.data?.data),
    [sambaUsersQuery.data?.data]
  );
  const sambaUsernames = useMemo(
    () => sambaUsers.map((user) => user.username).filter(Boolean),
    [sambaUsers]
  );

  const pathValidationDetailEntries = useMemo(() => {
    if (!pathValidationDetails) {
      return [] as Array<{ label: string; value: string }>;
    }

    const detailLabels: Array<{ key: 'path' | 'permissions' | 'owner' | 'group'; label: string }> = [
      { key: 'path', label: 'مسیر' },
      { key: 'permissions', label: 'دسترسی' },
      { key: 'owner', label: 'مالک' },
      { key: 'group', label: 'گروه' },
    ];

    return detailLabels
      .map(({ key, label }) => {
        const rawValue = (pathValidationDetails as Record<string, unknown>)[key];
        const value =
          rawValue === undefined || rawValue === null ? '' : String(rawValue);

        return value.trim() ? { label, value: value.trim() } : null;
      })
      .filter((entry): entry is { label: string; value: string } => entry !== null);
  }, [pathValidationDetails]);

  useEffect(() => {
    if (pathValidationStatus !== 'invalid') {
      setIsPathDetailsOpen(false);
    }
  }, [pathValidationStatus]);

  const shouldShowPathDetails =
    pathValidationStatus === 'invalid' &&
    (Boolean(pathValidationMessage) || pathValidationDetailEntries.length > 0);

  const pathValidationTooltipContent = useMemo(() => {
    if (!shouldShowPathDetails) {
      return null;
    }

    return (
      <Box sx={{ direction: 'rtl', textAlign: 'right' }}>
        {pathValidationMessage && (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {pathValidationMessage}
          </Typography>
        )}
        {pathValidationDetailEntries.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
            {pathValidationDetailEntries.map((entry) => (
              <Typography key={entry.label} variant="caption">
                {`${entry.label}: ${entry.value}`}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    );
  }, [
    pathValidationDetailEntries,
    pathValidationMessage,
    shouldShowPathDetails,
  ]);

  const handleTogglePathDetails = () => {
    if (!shouldShowPathDetails) {
      return;
    }

    setIsPathDetailsOpen((prev) => !prev);
  };

  const handleClosePathDetails = () => {
    setIsPathDetailsOpen(false);
  };

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
      if (shouldShowPathDetails && pathValidationTooltipContent) {
        return (
          <InputAdornment position="end">
            <ClickAwayListener onClickAway={handleClosePathDetails}>
              <Tooltip
                arrow
                placement="top"
                open={isPathDetailsOpen}
                onClose={handleClosePathDetails}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title={pathValidationTooltipContent}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={handleTogglePathDetails}
                  aria-label="نمایش جزئیات مسیر"
                  sx={{
                    display: 'flex',
                    color: 'error.main',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    p: 0,
                  }}
                >
                  <FiAlertCircle size={18} />
                </Box>
              </Tooltip>
            </ClickAwayListener>
          </InputAdornment>
        );
      }

      return (
        <InputAdornment position="end">
          <Box component="span" sx={{ display: 'flex', color: 'error.main' }}>
            <FiAlertCircle size={18} />
          </Box>
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
