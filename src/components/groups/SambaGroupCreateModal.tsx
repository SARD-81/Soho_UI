import { Box, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';
import SambaGroupAddMemberModal from './SambaGroupAddMemberModal';

interface SambaGroupCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupname: string) => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  memberModalGroupname?: string | null;
  onCloseMemberModal?: () => void;
  onSubmitMembers?: (usernames: string[]) => void;
  isSubmittingMembers?: boolean;
  memberErrorMessage?: string | null;
}

const SambaGroupCreateModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
  memberModalGroupname = null,
  onCloseMemberModal = () => undefined,
  onSubmitMembers = () => undefined,
  isSubmittingMembers = false,
  memberErrorMessage = null,
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
    <>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
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
          {errorMessage ? (
            <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
              {errorMessage}
            </Typography>
          ) : null}
        </Box>
      </BlurModal>

      <SambaGroupAddMemberModal
        open={Boolean(memberModalGroupname)}
        groupname={memberModalGroupname}
        onClose={onCloseMemberModal}
        onSubmit={onSubmitMembers}
        isSubmitting={isSubmittingMembers}
        errorMessage={memberErrorMessage}
      />
    </>
  );
};

export default SambaGroupCreateModal;
