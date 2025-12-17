import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSambaGroupMembers } from '../../hooks/useSambaGroupMembers';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface SambaGroupRemoveMemberModalProps {
  open: boolean;
  groupname: string | null;
  onClose: () => void;
  onRemove: (usernames: string[]) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const SambaGroupRemoveMemberModal = ({
  open,
  groupname,
  onClose,
  onRemove,
  isSubmitting = false,
  errorMessage = null,
}: SambaGroupRemoveMemberModalProps) => {
  const membersQuery = useSambaGroupMembers(groupname, { enabled: open });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    setSelectedMembers([]);
  }, [open, groupname]);

  const hasMembers = useMemo(
    () => (membersQuery.data?.members?.length ?? 0) > 0,
    [membersQuery.data?.members?.length]
  );

  const toggleSelection = useCallback(
    (username: string) => {
      if (isSubmitting) return;

      setSelectedMembers((prev) =>
        prev.includes(username)
          ? prev.filter((item) => item !== username)
          : [...prev, username]
      );
    },
    [isSubmitting]
  );

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;

    const trimmedMembers = selectedMembers
      .map((user) => user.trim())
      .filter(Boolean);

    if (!trimmedMembers.length) return;

    onRemove(trimmedMembers);
  }, [isSubmitting, onRemove, selectedMembers]);

  const isConfirmDisabled = isSubmitting || selectedMembers.length === 0;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title={`حذف عضو از ${groupname ?? ''}`.trim()}
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={handleSubmit}
          confirmLabel="حذف"
          loadingLabel="در حال حذف…"
          isLoading={isSubmitting}
          confirmProps={{ color: 'error', disabled: isConfirmDisabled }}
        />
      }
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        {membersQuery.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : hasMembers ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {membersQuery.data?.members?.map((member) => {
              const isSelected = selectedMembers.includes(member);

              return (
                <Chip
                  key={member}
                  label={member}
                  onClick={() => toggleSelection(member)}
                  disabled={isSubmitting}
                  clickable
                  variant={isSelected ? 'filled' : 'outlined'}
                  // icon={isSelected ? <MdDoneOutline /> : undefined}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: isSelected
                      ? 'rgba(255, 99, 132, 0.22)'
                      : 'rgba(255, 99, 132, 0.08)',
                    color: 'var(--color-error)',
                    border: isSelected
                      ? '2px solid rgba(255, 99, 132, 0.55)'
                      : '1px solid rgba(255, 99, 132, 0.2)',
                    boxShadow: isSelected
                      ? '0 0 0 2px rgba(255, 99, 132, 0.15)'
                      : 'none',
                    '&:hover': { backgroundColor: 'rgba(255, 99, 132, 0.22)' },
                  }}
                />
              );
            })}
          </Box>
        ) : (
          <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
            هیچ عضوی برای این گروه ثبت نشده است.
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

export default SambaGroupRemoveMemberModal;
