import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { CreateWebUserPayload } from '../../@types/users';
import ModalActionButtons from '../common/ModalActionButtons';
import BlurModal from '../BlurModal';
import {
  createWebUserSchema,
  type CreateWebUserFormValues,
} from '../../schemas/webUserSchema';
import { removePersianCharacters } from '../../utils/text';

interface WebUserCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateWebUserPayload) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  existingUsernames: string[];
}

type PersianWarningField = 'username' | 'email' | 'password';

const defaultValues: CreateWebUserFormValues = {
  username: '',
  email: '',
  password: '',
  is_superuser: false,
  first_name: '',
  last_name: '',
};

const inputBaseSx = {
  backgroundColor: 'var(--color-input-bg)',
  borderRadius: '5px',
  '& .MuiInputBase-input': {
    color: 'var(--color-text)',
  },
};

const labelSx = { color: 'var(--color-secondary)' };

const persianWarningMessage = 'استفاده از حروف فارسی در این فیلد مجاز نیست.';

const WebUserCreateModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
  existingUsernames,
}: WebUserCreateModalProps) => {
  const [persianWarnings, setPersianWarnings] = useState<Record<PersianWarningField, boolean>>({
    username: false,
    email: false,
    password: false,
  });

  const validationSchema = useMemo(
    () => createWebUserSchema({ existingUsernames }),
    [existingUsernames]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    trigger,
  } = useForm<CreateWebUserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setPersianWarnings({ username: false, email: false, password: false });
    }
  }, [open, reset]);

  useEffect(() => {
    if (open) {
      trigger('username');
    }
  }, [open, trigger, validationSchema]);

  useEffect(() => {
    if (!persianWarnings.username) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPersianWarnings((prev) => ({ ...prev, username: false }));
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [persianWarnings.username]);

  useEffect(() => {
    if (!persianWarnings.email) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPersianWarnings((prev) => ({ ...prev, email: false }));
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [persianWarnings.email]);

  useEffect(() => {
    if (!persianWarnings.password) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPersianWarnings((prev) => ({ ...prev, password: false }));
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [persianWarnings.password]);

  const handleSanitizedChange = (
    field: PersianWarningField,
    onChange: (value: string) => void
  ) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      const sanitizedValue = removePersianCharacters(rawValue);

      if (sanitizedValue !== rawValue) {
        setPersianWarnings((prev) => ({ ...prev, [field]: true }));
      }

      onChange(sanitizedValue);
    };

  const handleFormSubmit = handleSubmit((values) => {
    const payload: CreateWebUserPayload = {
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
      is_superuser: values.is_superuser,
      first_name: values.first_name?.trim() ?? '',
      last_name: values.last_name?.trim() ?? '',
    };

    onSubmit(payload);
  });

  const usernameHelperText =
    persianWarnings.username ? persianWarningMessage : errors.username?.message;
  const emailHelperText =
    persianWarnings.email ? persianWarningMessage : errors.email?.message;
  const passwordHelperText =
    persianWarnings.password ? persianWarningMessage : errors.password?.message;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="ایجاد کاربر جدید"
      actions={
        <ModalActionButtons
          onCancel={onClose}
          confirmLabel="ایجاد کاربر"
          loadingLabel="در حال ایجاد..."
          isLoading={isSubmitting}
          disabled={!isValid || isSubmitting}
          confirmProps={{
            type: 'submit',
            form: 'web-user-create-form',
            sx: { px: 3 },
          }}
          cancelProps={{
            sx: { borderRadius: '3px', px: 3 },
          }}
        />
      }
    >
      <Box
        component="form"
        id="web-user-create-form"
        onSubmit={handleFormSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          برای ایجاد کاربر وب جدید، اطلاعات زیر را تکمیل کنید.
        </Typography>

        {errorMessage ? (
          <Alert severity="error" sx={{ borderRadius: '4px' }}>
            {errorMessage}
          </Alert>
        ) : null}

        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="نام کاربری"
              autoFocus
              fullWidth
              error={Boolean(errors.username) || persianWarnings.username}
              helperText={usernameHelperText}
              onChange={handleSanitizedChange('username', field.onChange)}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: inputBaseSx }}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="ایمیل"
              fullWidth
              error={Boolean(errors.email) || persianWarnings.email}
              helperText={emailHelperText}
              onChange={handleSanitizedChange('email', field.onChange)}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: inputBaseSx }}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="گذرواژه"
              type="password"
              fullWidth
              error={Boolean(errors.password) || persianWarnings.password}
              helperText={passwordHelperText}
              onChange={handleSanitizedChange('password', field.onChange)}
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: inputBaseSx }}
            />
          )}
        />

        <Controller
          name="is_superuser"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  sx={{
                    color: 'var(--color-secondary)',
                    '&.Mui-checked': { color: 'var(--color-primary)' },
                  }}
                />
              }
              label={
                <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 500 }}>
                  دسترسی مدیر سیستم (Superuser)
                </Typography>
              }
            />
          )}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="نام"
                fullWidth
                InputLabelProps={{ sx: labelSx }}
                InputProps={{ sx: inputBaseSx }}
                error={Boolean(errors.first_name)}
                helperText={errors.first_name?.message}
              />
            )}
          />

          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="نام خانوادگی"
                fullWidth
                InputLabelProps={{ sx: labelSx }}
                InputProps={{ sx: inputBaseSx }}
                error={Boolean(errors.last_name)}
                helperText={errors.last_name?.message}
              />
            )}
          />
        </Stack>
      </Box>
    </BlurModal>
  );
};

export default WebUserCreateModal;