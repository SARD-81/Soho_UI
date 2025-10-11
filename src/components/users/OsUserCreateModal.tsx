import { Alert, Box, Button, InputAdornment, TextField } from '@mui/material';
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import type { CreateOsUserPayload } from '../../@types/users';
import { DEFAULT_LOGIN_SHELL } from '../../constants/users';
import { removePersianCharacters } from '../../utils/text';
import BlurModal from '../BlurModal';

interface OsUserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateOsUserPayload) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  existingUsernames?: string[];
}

const OsUserCreateModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
  existingUsernames = [],
}: OsUserCreateModalProps) => {
  const [username, setUsername] = useState('');
  const [hasPersianUsername, setHasPersianUsername] = useState(false);

  const normalizedExistingUsernames = useMemo(() => {
    return new Set(
      existingUsernames
        .map((name) => name.trim().toLowerCase())
        .filter((name) => name.length > 0)
    );
  }, [existingUsernames]);

  useEffect(() => {
    if (open) {
      setUsername('');
      setHasPersianUsername(false);
    }
  }, [open]);

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const sanitizedValue = removePersianCharacters(value);
    setHasPersianUsername(sanitizedValue !== value);
    setUsername(sanitizedValue);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const normalizedUsername = trimmedUsername.toLowerCase();

    if (!trimmedUsername) {
      return;
    }

    if (normalizedExistingUsernames.has(normalizedUsername)) {
      return;
    }

    onSubmit({
      username: trimmedUsername,
      login_shell: DEFAULT_LOGIN_SHELL,
      shell: DEFAULT_LOGIN_SHELL,
    });
  };

  const trimmedUsername = username.trim();
  const normalizedUsername = trimmedUsername.toLowerCase();
  const isDuplicate =
    trimmedUsername.length > 0 &&
    normalizedExistingUsernames.has(normalizedUsername);
  const shouldShowSuccess = trimmedUsername.length > 0 && !isDuplicate;

  const adornmentIcon = isDuplicate ? (
    <FiAlertCircle color="var(--color-error)" size={18} />
  ) : shouldShowSuccess ? (
    <FiCheckCircle color="var(--color-success)" size={18} />
  ) : null;

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
          disabled={isSubmitting || !trimmedUsername || isDuplicate}
          sx={{
            marginX: 'auto',
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
        {/*<Typography sx={{ color: 'var(--color-secondary)' }}>*/}
        {/*  لطفاً اطلاعات کاربر جدید را وارد کنید. پوسته ورود به صورت پیش‌فرض*/}
        {/*  تنظیم شده است.*/}
        {/*</Typography>*/}

        <TextField
          label="نام کاربری"
          value={username}
          onChange={handleUsernameChange}
          required
          autoFocus
          fullWidth
          error={isDuplicate}
          helperText={
            (hasPersianUsername &&
              'استفاده از حروف فارسی در این فیلد مجاز نیست.') ||
            (isDuplicate && 'کاربری با این نام کاربری از قبل وجود دارد.') ||
            undefined
          }
          InputLabelProps={{ sx: { color: 'var(--color-secondary)' } }}
          InputProps={{
            sx: {
              backgroundColor: 'var(--color-input-bg)',
              borderRadius: '5px',
              '& .MuiInputBase-input': { color: 'var(--color-text)' },
            },
            endAdornment:
              trimmedUsername.length > 0 && adornmentIcon ? (
                <InputAdornment position="end">{adornmentIcon}</InputAdornment>
              ) : undefined,
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
              borderRadius: '5px',
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
