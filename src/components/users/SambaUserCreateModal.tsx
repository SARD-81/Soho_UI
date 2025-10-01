import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { type FormEvent, useEffect, useState } from 'react';
import type { CreateSambaUserPayload } from '../../@types/samba';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface SambaUserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateSambaUserPayload & { createOsUserFirst: boolean }
  ) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  initialUsername?: string;
}

const SambaUserCreateModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
  initialUsername,
}: SambaUserCreateModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [createOsUserFirst, setCreateOsUserFirst] = useState(false);

  useEffect(() => {
    if (open) {
      setUsername(initialUsername ?? '');
      setPassword('');
      setCreateOsUserFirst(false);
    }
  }, [initialUsername, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      return;
    }

    onSubmit({
      username: username.trim(),
      password,
      createOsUserFirst,
    });
  };

  const isConfirmDisabled = isSubmitting || !username.trim() || !password;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="ایجاد کاربر Samba"
      actions={
        <ModalActionButtons
          confirmLabel="ایجاد کاربر"
          loadingLabel="در حال ایجاد..."
          isLoading={isSubmitting}
          disabled={isConfirmDisabled}
          disableConfirmGradient
          confirmProps={{
            type: 'submit',
            form: 'samba-user-create-form',
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
        id="samba-user-create-form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        {/*<Typography sx={{ color: 'var(--color-secondary)' }}>*/}
        {/*  برای ایجاد کاربر Samba جدید، نام کاربری و گذرواژه را وارد کنید.*/}
        {/*</Typography>*/}

        <TextField
          label="نام کاربری"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          fullWidth
          autoFocus
          InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
          InputProps={{
            sx: {
              backgroundColor: 'var(--color-input-bg)',
              borderRadius: '5px',
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
            },
          }}
        />

        <TextField
          label="گذرواژه"
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

        <FormControlLabel
          control={
            <Checkbox
              checked={createOsUserFirst}
              onChange={(event) => setCreateOsUserFirst(event.target.checked)}
              color="primary"
            />
          }
          label="ابتدا کاربر سیستم عامل ایجاد شود"
          sx={{
            alignSelf: 'flex-start',
            '& .MuiTypography-root': {
              color: 'var(--color-secondary)',
              fontWeight: 500,
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

export default SambaUserCreateModal;
