import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import type { UseCreateShareReturn } from '../../hooks/useCreateShare';
import BlurModal from '../BlurModal';

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
  } = controller;

  const handlePathChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFullPath(event.target.value);
  };

  const handleValidUsersChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValidUsers(event.target.value);
  };

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
            error={Boolean(fullPathError)}
            helperText={
              fullPathError ??
              'مسیر کامل پوشه اشتراک را وارد کنید (مانند /mnt/data/share).'
            }
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
          />

          <TextField
            label="کاربران مجاز"
            value={validUsers}
            onChange={handleValidUsersChange}
            fullWidth
            size="small"
            error={Boolean(validUsersError)}
            helperText={
              validUsersError ??
              'نام کاربر یا کاربران مجاز را وارد کنید (برای چند کاربر از ویرگول استفاده کنید).'
            }
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
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
