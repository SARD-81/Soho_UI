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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useUpdateSharepoint } from '../../hooks/useUpdateSharepoint';
import axiosInstance from '../../lib/axiosInstance';
import { getShareGroupMembers, getShareUserMembers, mergeShareAccessMembers, parseDelimitedList, uniqueSortedList } from '../../utils/samba';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';

type DragSource = 'available' | 'members';
type DragPayload = {
  member: string;
  source: DragSource;
};

type ManageShareMembersType = 'users' | 'groups';

interface ManageShareMembersModalProps {
  open: boolean;
  shareName: string | null;
  type: ManageShareMembersType;
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

const SHARE_ACCESS_PROPERTY = 'valid users';

const modalCopy: Record<
  ManageShareMembersType,
  {
    type: string;
    title: string;
    addLabel: string;
    empty: string;
    currentTitle: string;
    currentUnit: string;
    availableHelper: string;
    currentHelper: string;
  }
> = {
  users: {
    type: 'user',
    title: 'مدیریت کاربران اشتراک',
    addLabel: 'کاربران خارج از اشتراک',
    empty: 'هیچ کاربری برای این اشتراک ثبت نشده است.',
    currentTitle: 'کاربران فعلی اشتراک',
    currentUnit: 'کاربر',
    availableHelper: 'کاربرانی که می‌توانید به اشتراک اضافه کنید.',
    currentHelper: 'کاربران فعال این اشتراک در این بخش نمایش داده می‌شوند.',
  },
  groups: {
    type: 'group',
    title: 'مدیریت گروه‌های اشتراک',
    addLabel: 'گروه‌های خارج از اشتراک',
    empty: 'هیچ گروهی برای این اشتراک ثبت نشده است.',
    currentTitle: 'گروه‌های فعلی اشتراک',
    currentUnit: 'گروه',
    availableHelper: 'گروه‌هایی که می‌توانید به اشتراک اضافه کنید.',
    currentHelper: 'گروه‌های فعال این اشتراک در این بخش نمایش داده می‌شوند.',
  },
};

const membersProperty: Record<ManageShareMembersType, string> = {
  users: 'valid users',
  groups: 'valid groups',
};

const memberPanelBaseSx = {
  flex: 1,
  width: '100%',
  minWidth: 0,
  p: 1.75,
  borderRadius: '13px',
  boxShadow: '0 18px 40px -34px rgba(15, 23, 42, 0.35)',
} as const;

const currentPanelSx = {
  ...memberPanelBaseSx,
  border: '1px solid rgba(0, 198, 169, 0.24)',
  background:
    'linear-gradient(145deg, var(--color-card-bg) 0%, rgba(0, 198, 169, 0.045) 100%)',
} as const;

const availablePanelSx = {
  ...memberPanelBaseSx,
  border: '1px solid rgba(148, 163, 184, 0.22)',
  background:
    'linear-gradient(145deg, var(--color-card-bg) 0%, rgba(148, 163, 184, 0.045) 100%)',
} as const;

const ManageShareMembersModal = ({
  open,
  shareName,
  type,
  onClose,
}: ManageShareMembersModalProps) => {
  const propertyKey = membersProperty[type];
  const updateSharepoint = useUpdateSharepoint();
  const queryClient = useQueryClient();

  const [stagedMembers, setStagedMembers] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const membersQuery = useQuery<string[]>({
  queryKey: ['samba', 'sharepoints', shareName, SHARE_ACCESS_PROPERTY],
  queryFn: async () => {
    if (!shareName) return [];

    const encodedName = encodeURIComponent(shareName);
    const response = await axiosInstance.get(
      `/api/samba/sharepoints/${encodedName}/`,
      {
        params: { only_active: false, property: SHARE_ACCESS_PROPERTY },
      }
    );

    return parseDelimitedList(response.data?.data?.[SHARE_ACCESS_PROPERTY]);
  },
  enabled: open && Boolean(shareName),
});

const currentAccessMembers = membersQuery.data ?? [];

const currentUsers = useMemo(
  () => getShareUserMembers(currentAccessMembers),
  [currentAccessMembers]
);

const currentGroups = useMemo(
  () => getShareGroupMembers(currentAccessMembers),
  [currentAccessMembers]
);

const currentTypedMembers = type === 'users' ? currentUsers : currentGroups;

  const availableQuery = useQuery<string[]>({
    queryKey: [
      'samba',
      type === 'users' ? 'users' : 'groups',
      'available',
      shareName,
    ],
    queryFn: async () => {
      if (type === 'users') {
        const response = await axiosInstance.get('/api/samba/users/', {
          params: { property: 'Unix username' },
        });

        const data = response.data?.data ?? [];
        const usernames = Array.isArray(data)
          ? data
              .map((entry) =>
                typeof entry === 'object'
                  ? ((entry['Unix username'] as string) ??
                    (entry.username as string))
                  : undefined
              )
              .filter((username): username is string => Boolean(username))
          : [];

        return uniqueSortedList(usernames);
      }

      const response = await axiosInstance.get('/api/samba/groups/', {
        params: { contain_system_groups: false, property: 'name' },
      });

      const data = response.data?.data ?? [];
      const groupNames = Array.isArray(data)
        ? data
            .map((entry) =>
              typeof entry === 'object'
                ? ((entry.name as string) ?? (entry.groupname as string))
                : undefined
            )
            .filter((name): name is string => Boolean(name))
        : [];

      return uniqueSortedList(groupNames);
    },
    enabled: open && Boolean(shareName),
  });

  const availableCandidates = useMemo(() => {
    const available = availableQuery.data ?? [];
    const memberSet = new Set(stagedMembers);

    return available.filter((candidate) => !memberSet.has(candidate));
  }, [availableQuery.data, stagedMembers]);

  useEffect(() => {
    if (open && membersQuery.data) {
      setStagedMembers(uniqueSortedList(membersQuery.data));
    }
  }, [membersQuery.data, open]);

  useEffect(() => {
    if (!open) {
      setIsConfirmOpen(false);
    }
  }, [open]);

  useEffect(() => {
  if (open) {
    setStagedMembers(uniqueSortedList(currentTypedMembers));
  }
}, [currentTypedMembers, open]);

  const isSubmitting = updateSharepoint.isPending;
  const hasMembers = stagedMembers.length > 0;
  const hasRemovableMembers = stagedMembers.length > 1;

  const hasChanges = useMemo(() => {
    const currentMembers = membersQuery.data ?? [];
    if (currentMembers.length !== stagedMembers.length) return true;

    const currentSorted = [...currentMembers].sort();
    const stagedSorted = [...stagedMembers].sort();

    return currentSorted.some((value, index) => value !== stagedSorted[index]);
  }, [membersQuery.data, stagedMembers]);

  const handleAddMember = (member: string) => {
    if (!shareName || isSubmitting) return;

    const trimmed = member.trim();
    if (!trimmed) return;

    setStagedMembers((prev) => uniqueSortedList([...prev, trimmed]));
  };

  const handleRemoveMember = (member: string) => {
    if (!shareName || isSubmitting) return;

    setStagedMembers((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((item) => item !== member);
      return next.length === 0 ? prev : next;
    });
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
    if (isSubmitting || !hasChanges || !hasMembers) return;
    setIsConfirmOpen(true);
  };

  const handleCancelConfirmation = () => {
    setIsConfirmOpen(false);
    onClose();
  };

  const handleApplyChanges = () => {
    if (!shareName || isSubmitting || !hasChanges || !hasMembers) {
      handleCancelConfirmation();
      return;
    }

    const nextValidUsers = mergeShareAccessMembers({
  users: type === 'users' ? stagedMembers : currentUsers,
  groups: type === 'groups' ? stagedMembers : currentGroups,
});

    updateSharepoint.mutate(
      {
    shareName,
    updates: { [SHARE_ACCESS_PROPERTY]: nextValidUsers },
    saveToDb: true,
  },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['samba', 'sharepoints', shareName, propertyKey],
          });
          queryClient.invalidateQueries({
            queryKey: [
              'samba',
              type === 'users' ? 'users' : 'groups',
              'available',
              shareName,
            ],
          });
        },
        onSettled: () => {
          setIsConfirmOpen(false);
          onClose();
        },
      }
    );
  };

  const isLoading = membersQuery.isLoading || availableQuery.isLoading;
  const copy = modalCopy[type];

  return (
    <BlurModal
      open={open}
      onClose={() => {
        if (isSubmitting) return;
        onClose();
      }}
      title={`${copy.title} ${shareName ?? ''}`.trim()}
      actions={
        <ModalActionButtons
          onCancel={onClose}
          onConfirm={handleRequestSubmit}
          confirmLabel="ثبت تغییرات"
          disabled={isSubmitting}
          confirmProps={{ disabled: !hasChanges || !hasMembers }}
        />
      }
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Typography sx={{ color: 'var(--color-primary)', fontWeight: 900, fontSize: '1.02rem' }}>
          {copy.title}
        </Typography>
        {updateSharepoint.isError ? (
          <Typography sx={{ color: 'var(--color-error)', fontWeight: 600 }}>
            {updateSharepoint.error?.message}
          </Typography>
        ) : null}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: 'stretch' }}
          >
            <Stack
              spacing={1.25}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDropToMembers}
              sx={{
                ...currentPanelSx,
                order: { xs: 1, md: 1 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ color: 'var(--color-primary)', fontWeight: 900 }}>
                  {copy.currentTitle}
                </Typography>
                <Chip
                  label={`${stagedMembers.length} ${copy.currentUnit}`}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    backgroundColor: 'rgba(0, 198, 169, 0.09)',
                    border: '1px solid rgba(0, 198, 169, 0.22)',
                  }}
                />
              </Box>
              <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 500, fontSize: '0.82rem' }}>
                {copy.currentHelper}
              </Typography>
              <Divider sx={{ borderColor: 'rgba(0, 198, 169, 0.2)' }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 260, overflowY: 'auto', alignContent: 'flex-start' }}>
                {hasMembers ? (
                  stagedMembers.map((member) => (
                    <Chip
                      key={member}
                      label={member}
                      onDelete={() => handleRemoveMember(member)}
                      disabled={isSubmitting || !hasRemovableMembers}
                      sx={{
                        ...chipStyles.remove,
                        color: 'var(--color-text)',
                        backgroundColor: 'var(--color-card-bg)',
                        border: '1px solid rgba(0, 198, 169, 0.22)',
                        '& .MuiChip-deleteIcon': { color: 'var(--color-error)' },
                      }}
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(event, { member, source: 'members' })
                      }
                    />
                  ))
                ) : (
                  <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    {copy.empty}
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
                ...availablePanelSx,
                order: { xs: 2, md: 2 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ color: 'var(--color-text)', fontWeight: 800 }}>
                  {copy.addLabel}
                </Typography>
                <Chip label={`${availableCandidates.length} ${copy.currentUnit}`} size="small" sx={{ fontWeight: 700, border: '1px solid rgba(148, 163, 184, 0.25)' }} />
              </Box>
              <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 500, fontSize: '0.82rem' }}>
                {copy.availableHelper}
              </Typography>
              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.24)' }} />
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
        aria-labelledby="manage-share-members-confirmation"
      >
        <DialogTitle
          id="manage-share-members-confirmation"
          sx={{ fontWeight: 800, color: 'var(--color-text)' }}
        >
          آیا از اعمال تغییرات مطمئن هستید؟
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'var(--color-secondary)', lineHeight: 1.9 }}>
            با تایید، تغییرات اعضا در اشتراک «{shareName}» ثبت می‌شود. در غیر
            این صورت بدون ذخیره‌سازی بسته خواهد شد.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCancelConfirmation}
            sx={{ color: 'var(--color-text)' }}
          >
            انصراف
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyChanges}
            disabled={isSubmitting}
          >
            تایید و اعمال
          </Button>
        </DialogActions>
      </Dialog>
    </BlurModal>
  );
};

export default ManageShareMembersModal;
