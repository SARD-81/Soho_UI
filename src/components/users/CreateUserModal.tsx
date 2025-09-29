import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import type { UseCreateUserReturn } from '../../hooks/useCreateUser';
import BlurModal from '../BlurModal';

interface CreateUserModalProps {
  controller: UseCreateUserReturn;
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

const CreateUserModal = ({ controller }: CreateUserModalProps) => {
  const {
    isOpen,
    closeCreateModal,
    handleSubmit,
    username,
    setUsername,
    loginShell,
    usernameError,
    apiError,
    isCreating,
  } = controller;

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  return (
    <BlurModal
      open={isOpen}
      onClose={closeCreateModal}
      title="ایجاد کاربر جدید"
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
            form="create-user-form"
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
      <Box component="form" id="create-user-form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="نام کاربری"
            value={username}
            onChange={handleUsernameChange}
            autoFocus
            fullWidth
            size="small"
            error={Boolean(usernameError)}
            helperText={
              usernameError ?? 'نام کاربری جدید را وارد کنید (مانند user10).'
            }
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
          />

          <TextField
            label="پوسته ورود"
            value={loginShell}
            disabled
            fullWidth
            size="small"
            helperText="پوسته پیش‌فرض کاربر جدید تغییرپذیر نیست."
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: inputBaseStyles }}
          />

          {apiError ? (
            <Alert severity="error" sx={{ direction: 'rtl' }}>
              {apiError}
            </Alert>
          ) : (
            <Typography variant="body2" sx={{ color: 'var(--color-secondary)' }}>
              پس از ایجاد کاربر، جدول کاربران به صورت خودکار به‌روزرسانی می‌شود.
            </Typography>
          )}
        </Box>
      </Box>
    </BlurModal>
  );
};

export default CreateUserModal;
