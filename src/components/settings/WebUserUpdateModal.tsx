import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { UpdateWebUserPayload } from '../../@types/users';
import {
  updateWebUserSchema,
  type UpdateWebUserFormValues,
} from '../../schemas/webUserSchema';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface WebUserUpdateModalProps {
  open: boolean;
  username: string | null;
  initialValues: UpdateWebUserFormValues;
  onClose: () => void;
  onSubmit: (payload: UpdateWebUserPayload) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const inputBaseSx = {
  backgroundColor: 'var(--color-input-bg)',
  borderRadius: '5px',
  '& .MuiInputBase-input': { color: 'var(--color-text)' },
};

const labelSx = { color: 'var(--color-secondary)' };

const WebUserUpdateModal = ({
  open,
  username,
  initialValues,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: WebUserUpdateModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateWebUserFormValues>({
    resolver: zodResolver(updateWebUserSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [initialValues, open, reset]);

  const handleFormSubmit = handleSubmit((values) => {
    if (!username) {
      return;
    }

    onSubmit({
      username,
      email: values.email.trim(),
      first_name: values.first_name?.trim() ?? '',
      last_name: values.last_name?.trim() ?? '',
      is_active: true,
      is_staff: true,
      is_superuser: true,
    });
  });

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="ویرایش اطلاعات کاربر"
      actions={
        <ModalActionButtons
          onCancel={onClose}
          confirmLabel="ذخیره تغییرات"
          loadingLabel="در حال بروزرسانی..."
          isLoading={isSubmitting}
          disabled={isSubmitting || !username}
          confirmProps={{
            type: 'submit',
            form: 'web-user-update-form',
            sx: { px: 3 },
          }}
          cancelProps={{ sx: { borderRadius: '3px', px: 3 } }}
        />
      }
    >
      <Box
        component="form"
        id="web-user-update-form"
        onSubmit={handleFormSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          اطلاعات کاربری را بروزرسانی کنید. نام کاربری قابل ویرایش نیست.
        </Typography>

        <TextField
          label="نام کاربری"
          value={username ?? ''}
          disabled
          fullWidth
          InputLabelProps={{ sx: labelSx }}
          InputProps={{
            sx: {
              ...inputBaseSx,
              '& .MuiInputBase-input': { color: 'var(--color-secondary)' },
            },
          }}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="ایمیل"
              fullWidth
              size="small"
              InputLabelProps={{ sx: labelSx }}
              InputProps={{ sx: inputBaseSx }}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
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
                size="small"
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
                size="small"
                InputLabelProps={{ sx: labelSx }}
                InputProps={{ sx: inputBaseSx }}
                error={Boolean(errors.last_name)}
                helperText={errors.last_name?.message}
              />
            )}
          />
        </Stack>

        {errorMessage ? (
          <Typography color="error" sx={{ mt: 1 }}>
            {errorMessage}
          </Typography>
        ) : null}
      </Box>
    </BlurModal>
  );
};

export default WebUserUpdateModal;