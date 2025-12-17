import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSambaAvailableUsersByGroup } from '../../hooks/useSambaAvailableUsersByGroup';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface SambaGroupAddMemberModalProps {
  open: boolean;
  groupname: string | null;
  onClose: () => void;
  onSubmit: (usernames: string[]) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const SambaGroupAddMemberModal = ({
  open,
  groupname,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: SambaGroupAddMemberModalProps) => {
  const availableUsersQuery = useSambaAvailableUsersByGroup(groupname, {
    enabled: open,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    setSelectedUsers([]);
  }, [open, groupname]);

  const hasUsers = useMemo(
    () => (availableUsersQuery.data?.length ?? 0) > 0,
    [availableUsersQuery.data?.length]
  );

  const toggleSelect = useCallback(
    (username: string) => {
      if (isSubmitting) return;

      setSelectedUsers((prev) =>
        prev.includes(username)
          ? prev.filter((item) => item !== username)
          : [...prev, username]
      );
    },
    [isSubmitting]
  );

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;

    const trimmedUsers = selectedUsers
      .map((user) => user.trim())
      .filter(Boolean);

    if (!trimmedUsers.length) return;

    onSubmit(trimmedUsers);
  }, [isSubmitting, onSubmit, selectedUsers]);

  const isConfirmDisabled = isSubmitting || selectedUsers.length === 0;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title={`افزودن عضو به ${groupname ?? ''}`.trim()}
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="ثبت"
          loadingLabel="در حال ثبت…"
          isLoading={isSubmitting}
          confirmProps={{ disabled: isConfirmDisabled }}
        />
      }
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        {availableUsersQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : hasUsers ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableUsersQuery.data?.map((user) => {
              const isSelected = selectedUsers.includes(user);

              return (
                <Chip
                  key={user}
                  label={user}
                  onClick={() => toggleSelect(user)}
                  disabled={isSubmitting}
                  clickable
                  variant={isSelected ? 'filled' : 'outlined'}
                  // icon={isSelected ? <MdDoneOutline /> : undefined}
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
            هیچ کاربری خارج از این گروه یافت نشد.
          </Typography>
        )}

        {errorMessage ? (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        ) : null}
      </Stack>
    </BlurModal>
  );
};

export default SambaGroupAddMemberModal;
