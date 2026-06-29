import { Box, IconButton, TextField, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { FileSystemEntry } from '../../@types/filesystem';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface FileSystemPassphraseModalProps {
  mode: 'load-key' | 'change-passphrase';
  open: boolean;
  targetFileSystem: FileSystemEntry | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (passphrase: string) => void;
}

const inputBaseStyles = {
  backgroundColor: 'var(--color-input-bg)',
  borderRadius: '5px',
  color: 'var(--color-text)',
  '& fieldset': {
    borderColor: 'var(--color-input-border)',
    color: 'var(--color-text)',
  },
  '&:hover fieldset': {
    borderColor: 'var(--color-input-focus-border)',
  },
  '&.Mui-focused fieldset': {
    borderColor: 'var(--color-input-focus-border)',
  },
};

const FileSystemPassphraseModal = ({
  mode,
  open,
  targetFileSystem,
  isLoading,
  onClose,
  onConfirm,
}: FileSystemPassphraseModalProps) => {
  const [passphrase, setPassphrase] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassphrase('');
      setIsTouched(false);
      setShowPassphrase(false);
    }
  }, [open]);

  const trimmedPassphrase = passphrase.trim();
  const hasPassphrase = trimmedPassphrase.length > 0;

  const content = useMemo(() => {
    if (mode === 'load-key') {
      return {
        title: 'بارگذاری کلید رمزنگاری',
        label: 'رمز فایل سیستم',
        helperText:
          'رمز فعلی فایل سیستم را وارد کنید تا کلید رمزنگاری در RAM بارگذاری شود.',
        confirmLabel: 'بارگذاری کلید',
        loadingLabel: 'در حال بارگذاری…',
      };
    }

    return {
      title: 'تغییر رمز فایل سیستم',
      label: 'رمز جدید فایل سیستم',
      helperText:
        'فقط رمز جدید را وارد کنید. قبل از تغییر رمز، کلید فعلی فایل سیستم باید بارگذاری شده باشد.',
      confirmLabel: 'تغییر رمز',
      loadingLabel: 'در حال تغییر رمز…',
    };
  }, [mode]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsTouched(true);

    if (!hasPassphrase || isLoading) {
      return;
    }

    onConfirm(trimmedPassphrase);
  };

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title={content.title}
      actions={
        <ModalActionButtons
          onCancel={onClose}
          confirmLabel={content.confirmLabel}
          loadingLabel={content.loadingLabel}
          isLoading={isLoading}
          disabled={isLoading || !hasPassphrase}
          confirmProps={{
            type: 'submit',
            form: 'filesystem-passphrase-form',
          }}
        />
      }
    >
      <Box
        component="form"
        id="filesystem-passphrase-form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography sx={{ color: 'var(--color-text)' }}>
          فایل سیستم:{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {targetFileSystem?.fullName ?? '—'}
          </Typography>
        </Typography>

        <TextField
          label={content.label}
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          onBlur={() => setIsTouched(true)}
          type={showPassphrase ? 'text' : 'password'}
          fullWidth
          size="small"
          autoComplete="off"
          error={isTouched && !hasPassphrase}
          helperText={
            isTouched && !hasPassphrase
              ? 'وارد کردن رمز الزامی است.'
              : content.helperText
          }
          InputLabelProps={{ shrink: true }}
          InputProps={{
            sx: inputBaseStyles,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPassphrase((value) => !value)}
                  edge="end"
                >
                  {showPassphrase ? <FiEyeOff /> : <FiEye />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </BlurModal>
  );
};

export default FileSystemPassphraseModal;
