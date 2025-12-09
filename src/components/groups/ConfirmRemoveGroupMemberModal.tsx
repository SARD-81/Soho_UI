import { Box, Typography } from '@mui/material';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

interface ConfirmRemoveGroupMemberModalProps {
  open: boolean;
  groupname?: string | null;
  username?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  isRemoving: boolean;
  errorMessage?: string | null;
}

const ConfirmRemoveGroupMemberModal = ({
  open,
  groupname,
  username,
  onClose,
  onConfirm,
  isRemoving,
  errorMessage,
}: ConfirmRemoveGroupMemberModalProps) => {
  const displayGroup = groupname?.trim() ?? '';
  const displayUser = username?.trim() ?? '';
  const isConfirmDisabled = isRemoving || !displayGroup || !displayUser;

  return (
    <BlurModal
      open={open}
      onClose={onClose}
      title="حذف کاربر از گروه"
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={onConfirm}
          confirmLabel="حذف"
          loadingLabel="در حال حذف…"
          isLoading={isRemoving}
          disableConfirmGradient
          confirmProps={{ color: 'error', disabled: isConfirmDisabled }}
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ color: 'var(--color-text)' }}>
          آیا از حذف{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {displayUser}
          </Typography>{' '}
          از گروه{' '}
          <Typography component="span" sx={{ fontWeight: 700 }}>
            {displayGroup}
          </Typography>{' '}
          مطمئن هستید؟
        </Typography>

        {errorMessage ? (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        ) : null}
      </Box>
    </BlurModal>
  );
};

export default ConfirmRemoveGroupMemberModal;