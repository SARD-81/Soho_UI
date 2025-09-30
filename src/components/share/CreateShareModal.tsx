import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Popover,
  Stack,
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
import type { DirPermissionsDetails } from '../../hooks/useDirPermissionsValidation';

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

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFullPath(event.target.value);
  };

  const [validationAnchorEl, setValidationAnchorEl] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    if (pathValidationStatus !== 'invalid') {
      setValidationAnchorEl(null);
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

  const validationDetailEntries = useMemo(() => {
    if (!pathValidationDetails) {
      return [];
    }

    const keys: Array<keyof DirPermissionsDetails> = [
      'path',
      'permissions',
      'owner',
      'group',
    ];

    return keys
      .map((key) => {
        const value = pathValidationDetails[key];

        if (value === undefined || value === null || value === '') {
          return null;
        }

        return { key, value: String(value) };
      })
      .filter(Boolean) as Array<{ key: keyof DirPermissionsDetails; value: string }>;
  }, [pathValidationDetails]);

  const hasPathError =
    Boolean(fullPathError) || pathValidationStatus === 'invalid';
  const defaultPathHelperText =
    'مسیر کامل پوشه اشتراک را وارد کنید (مانند /mnt/data/share).';
  const pathHelperText = (() => {
    if (fullPathError) {
      return fullPathError;
    }

    if (pathValidationStatus === 'invalid') {
      return (
        pathValidationMessage ||
        'این مسیر از قبل وجود دارد و امکان ایجاد اشتراک جدید وجود ندارد.'
      );
    }

    if (pathValidationStatus === 'valid') {
      return (
        pathValidationMessage ||
        'این مسیر وجود ندارد و در صورت نیاز ایجاد خواهد شد.'
      );
    }

    return defaultPathHelperText;
  })();

  const handleValidationIconClick = (event: MouseEvent<HTMLElement>) => {
    setValidationAnchorEl((prev) =>
      prev ? null : (event.currentTarget as HTMLElement)
    );
  };

  const closeValidationPopover = () => {
    setValidationAnchorEl(null);
  };

  const validationPopoverOpen = Boolean(validationAnchorEl);

  const pathValidationAdornment = (() => {
    if (isPathChecking) {
      return (
        <InputAdornment position="end">
          <CircularProgress size={18} thickness={5} />
        </InputAdornment>
      );
    }

    if (pathValidationStatus === 'invalid') {
      return (
        <InputAdornment position="end">
          <Tooltip
            title={
              pathValidationMessage ||
              'این مسیر از قبل وجود دارد و امکان ایجاد اشتراک جدید وجود ندارد.'
            }
            placement="top"
          >
            <IconButton
              color="error"
              size="small"
              aria-label="نمایش اطلاعات مسیر"
              onClick={handleValidationIconClick}
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
      <Popover
        open={validationPopoverOpen}
        anchorEl={validationAnchorEl}
        onClose={closeValidationPopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 2, maxWidth: 280 }}>
          <Stack spacing={1}>
            {validationDetailEntries.length > 0 ? (
              validationDetailEntries.map((item) => (
                <Box
                  key={item.key}
                  sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                  >
                    {item.key}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'var(--color-secondary)', wordBreak: 'break-all' }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">
                {pathValidationMessage ||
                  'این مسیر از قبل وجود دارد و امکان ایجاد اشتراک جدید وجود ندارد.'}
              </Typography>
            )}
          </Stack>
        </Box>
      </Popover>
    </BlurModal>
  );
};

export default CreateShareModal;
