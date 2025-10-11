import { Alert, Box, TextField, Typography } from '@mui/material';
import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { removePersianCharacters } from '../../utils/text';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface NetworkInterfaceIpEditModalProps {
  open: boolean;
  interfaceName: string | null;
  initialIp: string;
  initialNetmask: string;
  onClose: () => void;
  onSubmit: (payload: { ip: string; netmask: string }) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

const NetworkInterfaceIpEditModal = ({
  open,
  interfaceName,
  initialIp,
  initialNetmask,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: NetworkInterfaceIpEditModalProps) => {
  const [ip, setIp] = useState(initialIp);
  const [netmask, setNetmask] = useState(initialNetmask);
  const [hasPersianIp, setHasPersianIp] = useState(false);
  const [hasPersianNetmask, setHasPersianNetmask] = useState(false);

  useEffect(() => {
    if (open) {
      setIp(initialIp);
      setNetmask(initialNetmask);
      setHasPersianIp(false);
      setHasPersianNetmask(false);
    }
  }, [initialIp, initialNetmask, open]);

  const handleIpChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const sanitizedValue = removePersianCharacters(value);
    setHasPersianIp(sanitizedValue !== value);
    setIp(sanitizedValue);
  };

  const handleNetmaskChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const sanitizedValue = removePersianCharacters(value);
    setHasPersianNetmask(sanitizedValue !== value);
    setNetmask(sanitizedValue);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!interfaceName) {
      return;
    }

    onSubmit({ ip, netmask });
  };

  const isConfirmDisabled = isSubmitting || !interfaceName || !ip || !netmask;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="ویرایش آدرس IP"
      actions={
        <ModalActionButtons
          confirmLabel="ثبت تغییرات"
          loadingLabel="در حال ارسال..."
          isLoading={isSubmitting}
          disabled={isConfirmDisabled}
          disableConfirmGradient
          confirmProps={{
            type: 'submit',
            form: 'network-interface-ip-edit-form',
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
        id="network-interface-ip-edit-form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          آدرس IP و نت‌ماسک جدید برای رابط انتخاب‌شده را وارد کنید.
        </Typography>

        <TextField
          label="رابط شبکه"
          value={interfaceName ?? ''}
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
          label="آدرس IP"
          value={ip}
          onChange={handleIpChange}
          required
          fullWidth
          helperText={
            hasPersianIp ? 'استفاده از حروف فارسی در این فیلد مجاز نیست.' : undefined
          }
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
          label="نت‌ماسک"
          value={netmask}
          onChange={handleNetmaskChange}
          required
          fullWidth
          helperText={
            hasPersianNetmask ? 'استفاده از حروف فارسی در این فیلد مجاز نیست.' : undefined
          }
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

export default NetworkInterfaceIpEditModal;
