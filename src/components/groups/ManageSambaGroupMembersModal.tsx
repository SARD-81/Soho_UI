import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';
import { useSambaGroupMembers } from '../../hooks/useSambaGroupMembers';
import { useSambaUsernamesList } from '../../hooks/useSambaUsernamesList';
import { useUpdateSambaGroupMember } from '../../hooks/useUpdateSambaGroupMember';
import { uniqueSortedList } from '../../utils/samba';

type DragSource = 'available' | 'members';
type DragPayload = {
  member: string;
  source: DragSource;
};

interface ManageSambaGroupMembersModalProps {
  open: boolean;
  groupname: string | null;
  onClose: () => void;
}

const chipStyles = {
  add: {
    fontWeight: 700,
    backgroundColor: 'rgba(31, 182, 255, 0.08)',
    color: 'var(--color-primary)',
    border: '1px solid rgba(31, 182, 255, 0.18)',
    '&:hover': { backgroundColor: 'rgba(31, 182, 255, 0.16)' },
  },
  remove: {
    fontWeight: 700,
    backgroundColor: 'rgba(255, 99, 132, 0.08)',
    color: 'var(--color-error)',
    border: '1px solid rgba(255, 99, 132, 0.2)',
    '& .MuiChip-deleteIcon': { color: 'var(--color-error)' },
    '&:hover': { backgroundColor: 'rgba(255, 99, 132, 0.15)' },
  },
} as const;

const ManageSambaGroupMembersModal = ({
  open,
  groupname,
  onClose,
}: ManageSambaGroupMembersModalProps) => {
  const membersQuery = useSambaGroupMembers(groupname, { enabled: open });
  const usernamesQuery = useSambaUsernamesList({ enabled: open });
  const updateSambaGroupMember = useUpdateSambaGroupMember({
    onSuccess: (resolvedGroup, usernames, action) => {
      const actionLabel = action === 'add' ? 'به گروه افزوده شدند' : 'از گروه حذف شدند';
      toast.success(`کاربران ${usernames.join(', ')} ${actionLabel} (${resolvedGroup}).`);
    },
    onError: (message, resolvedGroup, usernames, action) => {
      const actionLabel = action === 'add' ? 'افزودن' : 'حذف';
      toast.error(
        `${actionLabel} کاربران ${usernames.join(', ')} در گروه ${resolvedGroup} با خطا مواجه شد: ${message}`
      );
    },
  });

  const [stagedMembers, setStagedMembers] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentMembers = useMemo(
    () => uniqueSortedList(membersQuery.data?.members ?? []),
    [membersQuery.data?.members]
  );

  const availableCandidates = useMemo(() => {
    const available = uniqueSortedList(usernamesQuery.data ?? []);
    const memberSet = new Set(stagedMembers);

    return available.filter((candidate) => !memberSet.has(candidate));
  }, [stagedMembers, usernamesQuery.data]);

  useEffect(() => {
    if (open && membersQuery.data) {
      setStagedMembers(currentMembers);
    }
  }, [currentMembers, membersQuery.data, open]);

  useEffect(() => {
    if (open) {
      setErrorMessage(null);
    } else {
      setIsConfirmOpen(false);
    }
  }, [open]);

  const isSubmitting = updateSambaGroupMember.isPending || isApplying;
  const hasChanges = useMemo(() => {
    if (currentMembers.length !== stagedMembers.length) return true;

    const currentSorted = [...currentMembers].sort();
    const stagedSorted = [...stagedMembers].sort();

    return currentSorted.some((value, index) => value !== stagedSorted[index]);
  }, [currentMembers, stagedMembers]);

  const handleAddMember = (member: string) => {
    if (!groupname || isSubmitting) return;

    const trimmed = member.trim();
    if (!trimmed) return;

    setStagedMembers((prev) => uniqueSortedList([...prev, trimmed]));
  };

  const handleRemoveMember = (member: string) => {
    if (!groupname || isSubmitting) return;

    setStagedMembers((prev) => prev.filter((item) => item !== member));
  };

  const handleDragStart = (event: React.DragEvent, payload: DragPayload) => {
    event.dataTransfer.setData('text/plain', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
  };

  const parseDragPayload = (event: React.DragEvent): DragPayload | null => {
    const rawData = event.dataTransfer.getData('text/plain');
    if (!rawData) return null;

    try {
      const data = JSON.parse(rawData) as DragPayload;
      return data;
    } catch {
      return null;
    }
  };

  const handleDropToMembers = (event: React.DragEvent) => {
    event.preventDefault();
    const payload = parseDragPayload(event);
    if (!payload) return;

    const { member, source } = payload;
    if (source === 'available') {
      handleAddMember(member);
    }
  };

  const handleDropToAvailable = (event: React.DragEvent) => {
    event.preventDefault();
    const payload = parseDragPayload(event);
    if (!payload) return;

    const { member, source } = payload;
    if (source === 'members') {
      handleRemoveMember(member);
    }
  };

  const handleRequestSubmit = () => {
    if (isSubmitting || !hasChanges) return;
    setIsConfirmOpen(true);
  };

  const handleCancelConfirmation = () => {
    setIsConfirmOpen(false);
    onClose();
  };

  const handleApplyChanges = async () => {
    if (!groupname || isSubmitting || !hasChanges) {
      handleCancelConfirmation();
      return;
    }

    const membersToAdd = stagedMembers.filter(
      (member) => !currentMembers.includes(member)
    );
    const membersToRemove = currentMembers.filter(
      (member) => !stagedMembers.includes(member)
    );

    if (membersToAdd.length === 0 && membersToRemove.length === 0) {
      handleCancelConfirmation();
      return;
    }

    setIsApplying(true);
    setErrorMessage(null);

    try {
      if (membersToAdd.length) {
        await updateSambaGroupMember.mutateAsync({
          groupname,
          usernames: membersToAdd,
          action: 'add',
        });
      }
      if (membersToRemove.length) {
        await updateSambaGroupMember.mutateAsync({
          groupname,
          usernames: membersToRemove,
          action: 'remove',
        });
      }

      setIsConfirmOpen(false);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'عملیات با خطا مواجه شد.';
      setErrorMessage(message);
      setIsConfirmOpen(false);
    } finally {
      setIsApplying(false);
    }
  };

  const isLoading = membersQuery.isLoading || usernamesQuery.isLoading;

  return (
    <BlurModal
      open={open}
      onClose={() => {
        if (isSubmitting) return;
        onClose();
      }}
      title={`مدیریت کاربران گروه ${groupname ?? ''}`.trim()}
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={handleRequestSubmit}
          confirmLabel="ثبت تغییرات"
          disabled={isSubmitting}
          confirmProps={{ disabled: !hasChanges }}
        />
      }
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Typography sx={{ color: 'var(--color-primary)', fontWeight: 900, fontSize: '1.02rem' }}>
          مدیریت کاربران گروه
        </Typography>
        {errorMessage ? (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {errorMessage}
          </Typography>
        ) : null}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'stretch' }}>
            <Stack
              spacing={1.25}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDropToMembers}
              sx={{
                flex: 1,
                width: '100%',
                minWidth: 0,
                order: { xs: 1, md: 1 },
                p: 1.75,
                borderRadius: '13px',
                border: '1px solid rgba(31, 182, 255, 0.24)',
                background:
                  'linear-gradient(180deg, rgba(31, 182, 255, 0.08), rgba(31, 182, 255, 0.03))',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ color: 'var(--color-primary)', fontWeight: 900 }}>
                  اعضای فعلی گروه
                </Typography>
                <Chip label={`${stagedMembers.length} عضو`} size="small" sx={{ fontWeight: 800, color: 'var(--color-primary)', backgroundColor: 'rgba(31, 182, 255, 0.12)', border: '1px solid rgba(31, 182, 255, 0.24)' }} />
              </Box>
              <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>
                اعضای فعال و تاییدشده گروه در این بخش قرار دارند.
              </Typography>
              <Divider sx={{ borderColor: 'rgba(31, 182, 255, 0.2)' }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 260, overflowY: 'auto', alignContent: 'flex-start' }}>
                {stagedMembers.length ? (
                  stagedMembers.map((member) => (
                    <Chip
                      key={member}
                      label={member}
                      onDelete={() => handleRemoveMember(member)}
                      disabled={isSubmitting}
                      sx={{ ...chipStyles.remove, color: 'var(--color-text)', backgroundColor: 'rgba(255, 255, 255, 0.72)', border: '1px solid rgba(31, 182, 255, 0.2)', '& .MuiChip-deleteIcon': { color: 'var(--color-error)' } }}
                      draggable
                      onDragStart={(event) => handleDragStart(event, { member, source: 'members' })}
                    />
                  ))
                ) : (
                  <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    هیچ عضوی برای این گروه ثبت نشده است.
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />

            <Stack
              spacing={1.25}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDropToAvailable}
              sx={{
                flex: 1,
                width: '100%',
                minWidth: 0,
                order: { xs: 2, md: 2 },
                p: 1.75,
                borderRadius: '13px',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                background:
                  'linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.06))',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ color: 'var(--color-text)', fontWeight: 800 }}>
                  کاربران خارج از گروه
                </Typography>
                <Chip label={`${availableCandidates.length} کاربر`} size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>
                کاربران قابل‌افزودن به گروه در این لیست نمایش داده می‌شوند.
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.35)' }} />
              <Box sx={{ display: 'flex', flexWrap: 'nowrap', flexDirection: 'column', gap: 1, alignItems: 'stretch', maxHeight: 260, overflowY: 'auto' }}>
                {availableCandidates.length ? (
                  availableCandidates.map((candidate) => (
                    <Chip
                      key={candidate}
                      label={candidate}
                      clickable
                      onClick={() => handleAddMember(candidate)}
                      disabled={isSubmitting}
                      sx={{ ...chipStyles.add, width: '100%', justifyContent: 'flex-start' }}
                      draggable
                      onDragStart={(event) => handleDragStart(event, { member: candidate, source: 'available' })}
                    />
                  ))
                ) : (
                  <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    گزینه‌ای برای افزودن وجود ندارد.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Stack>
        )}
      </Stack>

      <Dialog
        open={isConfirmOpen}
        onClose={handleCancelConfirmation}
        aria-labelledby="manage-group-members-confirmation"
      >
        <DialogTitle id="manage-group-members-confirmation" sx={{ fontWeight: 800 }}>
          آیا از اعمال تغییرات مطمئن هستید؟
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'var(--color-secondary)', lineHeight: 1.9 }}>
            با تایید، تغییرات اعضا در گروه «{groupname}» ثبت می‌شود. در غیر این صورت بدون
            ذخیره‌سازی بسته خواهد شد.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancelConfirmation} color="inherit">
            انصراف
          </Button>
          <Button variant="contained" onClick={handleApplyChanges} disabled={isSubmitting}>
            تایید و اعمال
          </Button>
        </DialogActions>
      </Dialog>
    </BlurModal>
  );
};

export default ManageSambaGroupMembersModal;
