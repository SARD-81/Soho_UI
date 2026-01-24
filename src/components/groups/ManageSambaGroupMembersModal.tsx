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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack
              spacing={1}
              sx={{
                flex: 1,
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: 2,
                p: 1.5,
                width: '100px',
              }}
            >
              <Typography sx={{ color: 'var(--color-text)', fontWeight: 700 }}>
                کاربران خارج از گروه
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  flexDirection: 'column',
                  gap: 1,
                  alignItems: 'stretch',
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDropToAvailable}
              >
                {availableCandidates.length ? (
                  availableCandidates.map((candidate) => (
                    <Chip
                      key={candidate}
                      label={candidate}
                      clickable
                      onClick={() => handleAddMember(candidate)}
                      disabled={isSubmitting}
                      sx={{
                        ...chipStyles.add,
                        width: '100%',
                        justifyContent: 'flex-start',
                      }}
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(event, {
                          member: candidate,
                          source: 'available',
                        })
                      }
                    />
                  ))
                ) : (
                  <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    گزینه‌ای برای افزودن وجود ندارد.
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider
              flexItem
              orientation="vertical"
              sx={{ display: { xs: 'none', md: 'block' } }}
            />

            <Box
              sx={{
                flex: 1,
                position: 'relative',
                borderRadius: 3,
                backgroundColor: 'rgba(31, 182, 255, 0.05)',
                p: 1.2,
                border: '1px solid rgba(131, 182, 255, 0.24)',
              }}
            >
              <Stack
                spacing={1.5}
                sx={{
                  position: 'relative',
                  borderRadius: 2.5,
                  p: 2,
                  overflow: 'hidden',
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDropToMembers}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    flexWrap: 'wrap',
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box>
                      <Typography
                        sx={{
                          color: 'var(--color-error)',
                          fontWeight: 900,
                          letterSpacing: 0.5,
                        }}
                      >
                        اعضای فعلی گروه ({stagedMembers.length} عضو)
                      </Typography>
                      <Typography
                        sx={{
                          color: 'var(--color-secondary)',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        اعضای تایید شده این گروه در این بخش نمایش داده می‌شوند.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 99, 132, 0.3)' }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {stagedMembers.length ? (
                    stagedMembers.map((member) => (
                      <Chip
                        key={member}
                        label={member}
                        onDelete={() => handleRemoveMember(member)}
                        disabled={isSubmitting}
                        sx={chipStyles.remove}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, { member, source: 'members' })
                        }
                      />
                    ))
                  ) : (
                    <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                      هیچ عضوی برای این گروه ثبت نشده است.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
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
