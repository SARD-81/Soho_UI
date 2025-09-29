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
        />

        <TextField
          label="پوسته ورود"
          value={DEFAULT_LOGIN_SHELL}
          fullWidth
          disabled
          InputProps={{
            sx: { direction: 'ltr' },
          }}
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
