import { Alert, Box, TextField, Typography } from '@mui/material';
import { type FormEvent, useEffect, useState } from 'react';
import type { UpdateSambaUserPasswordPayload } from '../../@types/samba';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface SambaUserPasswordModalProps {
  open: boolean;
  username: string | null;
  onClose: () => void;
  onSubmit: (payload: UpdateSambaUserPasswordPayload) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const SambaUserPasswordModal = ({
  open,
  username,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: SambaUserPasswordModalProps) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open) {
      setPassword('');
    }
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !password) {
      return;
    }

    onSubmit({
      username,
      new_password: password,
    });
  };

  const isConfirmDisabled = isSubmitting || !username || !password;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="تغییر گذرواژه کاربر"
      actions={
        <ModalActionButtons
          confirmLabel="ثبت گذرواژه جدید"
          loadingLabel="در حال بروزرسانی..."
          isLoading={isSubmitting}
          disabled={isConfirmDisabled}
          disableConfirmGradient
          confirmProps={{
            type: 'submit',
            form: 'samba-user-password-form',
            sx: {
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
                backgroundColor:
                  'color-mix(in srgb, var(--color-secondary) 25%, transparent)',
                color: 'var(--color-secondary)',
              },
            },
          }}
        />
      }
    >
      <Box
        component="form"
        id="samba-user-password-form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          گذرواژه جدید برای کاربر انتخاب‌شده را وارد کنید. نام کاربری قابل تغییر
          نیست.
        </Typography>

        <TextField
          label="نام کاربری"
          value={username ?? ''}
          disabled
          fullWidth
          InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
          InputProps={{
            sx: {
              backgroundColor: 'var(--color-input-bg)',
              borderRadius: '5px',
              '& .MuiInputBase-input': { color: 'var(--color-secondary)' },
            },
          }}
        />

        <TextField
          label="گذرواژه جدید"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
          InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
          InputProps={{
            sx: {
              backgroundColor: 'var(--color-input-bg)',
              borderRadius: '5px',
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
            },
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

export default SambaUserPasswordModal;
