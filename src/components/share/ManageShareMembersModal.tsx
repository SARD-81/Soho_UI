import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import BlurModal from '../BlurModal';
import ModalActionButtons from '../common/ModalActionButtons';
import axiosInstance from '../../lib/axiosInstance';
import { parseDelimitedList, uniqueSortedList } from '../../utils/samba';
import { useUpdateSharepoint } from '../../hooks/useUpdateSharepoint';

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

const modalCopy: Record<ManageShareMembersType, { title: string; addLabel: string; empty: string }> = {
  users: {
    title: 'مدیریت کاربران اشتراک',
    addLabel: 'کاربران خارج از اشتراک',
    empty: 'هیچ کاربری برای این اشتراک ثبت نشده است.',
  },
  groups: {
    title: 'مدیریت گروه‌های اشتراک',
    addLabel: 'گروه‌های خارج از اشتراک',
    empty: 'هیچ گروهی برای این اشتراک ثبت نشده است.',
  },
};

const membersProperty: Record<ManageShareMembersType, string> = {
  users: 'valid users',
  groups: 'valid groups',
};

const ManageShareMembersModal = ({ open, shareName, type, onClose }: ManageShareMembersModalProps) => {
  const propertyKey = membersProperty[type];
  const updateSharepoint = useUpdateSharepoint();

  const [stagedMembers, setStagedMembers] = useState<string[]>([]);

  const membersQuery = useQuery<string[]>({
    queryKey: ['samba', 'sharepoints', shareName, propertyKey],
    queryFn: async () => {
      if (!shareName) return [];
      const encodedName = encodeURIComponent(shareName);
      const response = await axiosInstance.get(`/api/samba/sharepoints/${encodedName}/`, {
        params: { only_active: false, property: propertyKey },
      });

      const rawMembers = response.data?.data?.[propertyKey];
      return parseDelimitedList(rawMembers);
    },
    enabled: open && Boolean(shareName),
  });

  const availableQuery = useQuery<string[]>({
    queryKey: ['samba', type === 'users' ? 'users' : 'groups', 'available', shareName],
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
                  ? (entry['Unix username'] as string) ?? (entry.username as string)
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
                ? (entry.name as string) ?? (entry.groupname as string)
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

  const isSubmitting = updateSharepoint.isPending;
  const hasMembers = stagedMembers.length > 0;

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

    setStagedMembers((prev) => prev.filter((item) => item !== member));
  };

  const handleSubmit = () => {
    if (!shareName || isSubmitting || !hasChanges) return;

    updateSharepoint.mutate(
      { shareName, updates: { [propertyKey]: stagedMembers }, saveToDb: true },
      {
        onSuccess: () => {
          membersQuery.refetch();
          availableQuery.refetch();
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
          onConfirm={handleSubmit}
          confirmLabel="ثبت تغییرات"
          disabled={isSubmitting}
          confirmProps={{ disabled: !hasChanges }}
        />
      }
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack
              spacing={1}
              sx={{
                flex: 1,
                border: '1px solid rgba(31, 182, 255, 0.24)',
                borderRadius: 2,
                p: 1.5,
                backgroundColor: 'rgba(31, 182, 255, 0.05)',
              }}
            >
              <Typography sx={{ color: 'var(--color-text)', fontWeight: 700 }}>
                {copy.addLabel}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableCandidates.length ? (
                  availableCandidates.map((candidate) => (
                    <Chip
                      key={candidate}
                      label={candidate}
                      clickable
                      onClick={() => handleAddMember(candidate)}
                      disabled={isSubmitting}
                      sx={chipStyles.add}
                    />
                  ))
                ) : (
                  <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    گزینه‌ای برای افزودن وجود ندارد.
                  </Typography>
                )}
              </Box>
            </Stack>

            <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />

            <Stack
              spacing={1}
              sx={{
                flex: 1,
                border: '1px solid rgba(255, 99, 132, 0.28)',
                borderRadius: 2,
                p: 1.5,
                backgroundColor: 'rgba(255, 99, 132, 0.05)',
              }}
            >
              <Typography sx={{ color: 'var(--color-text)', fontWeight: 800 }}>
                اعضای فعلی اشتراک
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {hasMembers ? (
                  stagedMembers.map((member) => (
                    <Chip
                      key={member}
                      label={member}
                      onDelete={() => handleRemoveMember(member)}
                      disabled={isSubmitting}
                      sx={chipStyles.remove}
                    />
                  ))
                ) : (
                  <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
                    {copy.empty}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Stack>
        )}
      </Stack>
    </BlurModal>
  );
};

export default ManageShareMembersModal;
