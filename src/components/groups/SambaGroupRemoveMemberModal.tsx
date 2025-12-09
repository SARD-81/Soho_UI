import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';
import { useSambaGroupMembers } from '../../hooks/useSambaGroupMembers';

interface SambaGroupRemoveMemberModalProps {
  open: boolean;
  groupname: string | null;
  onClose: () => void;
  onRemove: (username: string) => void;
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
  const hasMembers = (membersQuery.data?.members?.length ?? 0) > 0;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title={`حذف عضو از ${groupname ?? ''}`.trim()}
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={() => {}}
          hideConfirm
          confirmLabel=""
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
            {membersQuery.data?.members?.map((member) => (
              <Chip
                key={member}
                label={member}
                onDelete={() => onRemove(member)}
                disabled={isSubmitting}
                sx={{
                  fontWeight: 700,
                  backgroundColor: 'rgba(255, 99, 132, 0.08)',
                  color: 'var(--color-error)',
                  border: '1px solid rgba(255, 99, 132, 0.2)',
                  '& .MuiChip-deleteIcon': { color: 'var(--color-error)' },
                  '&:hover': { backgroundColor: 'rgba(255, 99, 132, 0.15)' },
                }}
              />
            ))}
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
