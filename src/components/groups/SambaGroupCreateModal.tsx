import { Box, Chip, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';
import { useSambaUsernamesList } from '../../hooks/useSambaUsernamesList';
import { uniqueSortedList } from '../../utils/samba';

interface SambaGroupCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupname: string, usernames: string[]) => void;
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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const sambaUsernamesQuery = useSambaUsernamesList({ enabled: open });

  const availableUsers = uniqueSortedList(sambaUsernamesQuery.data ?? []);

  useEffect(() => {
    if (!open) {
      setGroupname('');
      setNameError(null);
      setSelectedUsers([]);
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = groupname.trim();

    if (!trimmed) {
      setNameError('لطفاً نام گروه را وارد کنید.');
      return;
    }

    setNameError(null);
    onSubmit(trimmed, selectedUsers);
  };

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="ایجاد گروه اشتراک فایل"
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="ایجاد"
          loadingLabel="در حال ایجاد…"
          isLoading={isSubmitting}
        />
      }
    >
      <Stack spacing={2} sx={{ mt: 0.5 }}>
        <TextField
          label="نام گروه"
          value={groupname}
          onChange={(event) => setGroupname(event.target.value)}
          fullWidth
          error={Boolean(nameError)}
          helperText={nameError}
          sx={{
                '& .MuiInputBase-input': {
                  color: 'var(--color-text)',
                },
              }}
        />
        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            انتخاب اعضای اولیه گروه
          </Typography>
          {sambaUsernamesQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <CircularProgress size={26} />
            </Box>
          ) : availableUsers.length ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableUsers.map((user) => {
                const isSelected = selectedUsers.includes(user);

                return (
                  <Chip
                    key={user}
                    label={user}
                    onClick={() => {
                      if (isSubmitting) return;
                      setSelectedUsers((prev) =>
                        prev.includes(user)
                          ? prev.filter((item) => item !== user)
                          : [...prev, user]
                      );
                    }}
                    disabled={isSubmitting}
                    clickable
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      fontWeight: 700,
                      backgroundColor: isSelected
                        ? 'rgba(31, 182, 255, 0.25)'
                        : 'rgba(31, 182, 255, 0.08)',
                      color: 'var(--color-primary)',
                      border: isSelected
                        ? '2px solid rgba(31, 182, 255, 0.65)'
                        : '1px solid rgba(31, 182, 255, 0.18)',
                      boxShadow: isSelected
                        ? '0 0 0 2px rgba(31, 182, 255, 0.15)'
                        : 'none',
                      '&:hover': { backgroundColor: 'rgba(31, 182, 255, 0.25)' },
                    }}
                  />
                );
              })}
            </Box>
          ) : (
            <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
              هیچ کاربری برای افزودن یافت نشد.
            </Typography>
          )}
        </Stack>
        {errorMessage ? (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        ) : null}
      </Stack>
    </BlurModal>
  );
};

export default SambaGroupCreateModal;
