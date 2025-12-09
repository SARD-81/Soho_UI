import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

type SambaGroupMemberAction = 'add' | 'remove';

interface SambaGroupMemberModalProps {
  open: boolean;
  action: SambaGroupMemberAction;
  groupname: string | null;
  onClose: () => void;
  onSubmit: (username: string) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const actionLabels: Record<SambaGroupMemberAction, string> = {
  add: 'افزودن عضو',
  remove: 'حذف عضو',
};

const SambaGroupMemberModal = ({
  open,
  action,
  groupname,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: SambaGroupMemberModalProps) => {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const actionLabel = useMemo(() => actionLabels[action], [action]);

  useEffect(() => {
    if (!open) {
      setUsername('');
      setUsernameError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = username.trim();

    if (!trimmed) {
      setUsernameError('لطفاً نام کاربری را وارد کنید.');
      return;
    }

    setUsernameError(null);
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800, color: 'var(--color-primary)' }}>
        {actionLabel}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography sx={{ color: 'var(--color-secondary)' }}>
            {groupname ? `گروه: ${groupname}` : ''}
          </Typography>
          <TextField
            label="نام کاربری"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            fullWidth
            error={Boolean(usernameError)}
            helperText={usernameError}
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
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SambaGroupMemberModal;