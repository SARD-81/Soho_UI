import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface SambaGroupCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupname: string) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const SambaGroupCreateModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: SambaGroupCreateModalProps) => {
  const [groupname, setGroupname] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setGroupname('');
      setNameError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = groupname.trim();

    if (!trimmed) {
      setNameError('لطفاً نام گروه را وارد کنید.');
      return;
    }

    setNameError(null);
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800, color: 'var(--color-primary)' }}>
        ایجاد گروه اشتراک فایل
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="نام گروه"
            value={groupname}
            onChange={(event) => setGroupname(event.target.value)}
            fullWidth
            error={Boolean(nameError)}
            helperText={nameError}
          />
          {errorMessage ? (
            <Box component="span" sx={{ color: 'var(--color-error)' }}>
              {errorMessage}
            </Box>
          ) : null}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: 'var(--color-secondary)' }}>
          انصراف
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{
            px: 3,
            py: 1,
            borderRadius: '3px',
            fontWeight: 700,
            background:
              'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
            color: 'var(--color-bg)',
            boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
          }}
        >
          ایجاد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SambaGroupCreateModal;
