import {
  Alert,
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { type FormEvent, useEffect, useState } from 'react';
import type { CreateOsUserPayload } from '../../@types/users';
import { DEFAULT_LOGIN_SHELL } from '../../constants/users';
import BlurModal from '../BlurModal';

interface OsUserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateOsUserPayload) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const OsUserCreateModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: OsUserCreateModalProps) => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (open) {
      setUsername('');
    }
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim()) {
      return;
    }

    onSubmit({
      username: username.trim(),
      login_shell: DEFAULT_LOGIN_SHELL,
      shell: DEFAULT_LOGIN_SHELL,
    });
  };

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="ایجاد کاربر جدید"
      actions={
        <Button
          type="submit"
          form="os-user-create-form"
          variant="contained"
          disabled={isSubmitting || !username.trim()}
          sx={{
            px: 3,
            py: 1,
            fontWeight: 600,
            background:
              'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
            color: 'var(--color-bg)',
            '&:hover': {
              background:
                'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'color-mix(in srgb, var(--color-secondary) 25%, transparent)',
              color: 'var(--color-secondary)',
            },
          }}
        >
          {isSubmitting ? 'در حال ایجاد...' : 'ایجاد کاربر'}
        </Button>
      }
    >
      <Box
        component="form"
        id="os-user-create-form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          لطفاً اطلاعات کاربر جدید را وارد کنید. پوسته ورود به صورت پیش‌فرض تنظیم
          شده است.
        </Typography>

        <TextField
          label="نام کاربری"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          autoFocus
          fullWidth
          InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
          InputProps={{
            sx: {
              backgroundColor: 'var(--color-input-bg)',
              borderRadius: 1,
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
            },
          }}
        />

        <TextField
          label="پوسته ورود"
          value={DEFAULT_LOGIN_SHELL}
          fullWidth
          disabled
          InputProps={{
            sx: {
              direction: 'ltr',
              backgroundColor: 'var(--color-input-bg)',
              borderRadius: 1,
              '& .MuiInputBase-input': { color: 'var(--color-secondary)' },
            },
          }}
          InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
        />

        {errorMessage ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Alert>
        ) : null}
      </Box>
    </BlurModal>
  );
};

export default OsUserCreateModal;
