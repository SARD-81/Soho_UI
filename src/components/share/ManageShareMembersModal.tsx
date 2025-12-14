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
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const [stagedMembers, setStagedMembers] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  useEffect(() => {
    if (!open) {
      setIsConfirmOpen(false);
    }
  }, [open]);

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

    updateSharepoint.mutate(
      { shareName, updates: { [propertyKey]: stagedMembers }, saveToDb: true },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['samba', 'sharepoints', shareName, propertyKey] });
          queryClient.invalidateQueries({
            queryKey: ['samba', type === 'users' ? 'users' : 'groups', 'available', shareName],
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
                // width:"2px"
              }}
            >
              <Typography sx={{ color: 'var(--color-text)', fontWeight: 700 }}>
                {copy.addLabel}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  flexDirection:'column',
                  gap: 1,
                  alignItems:'stretch',
                  
                }}
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
                        width:'100%' ,
                        justifyContent: 'flex-start',
                      }}
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

            <Box
              sx={{
                flex: 1,
                position: 'relative',
                borderRadius: 3,
                background: 'linear-gradient(130deg, rgba(255, 99, 132, 0.22), rgba(31, 182, 255, 0.18))',
                p: 1.2,
                boxShadow: '0 22px 46px rgba(255, 99, 132, 0.26)',
              }}
            >
              <Stack
                spacing={1.5}
                sx={{
                  position: 'relative',
                  borderRadius: 2.5,
                //   background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(255, 245, 247, 0.96))',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 10px 14px rgba(255, 99, 132, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
                  p: 2,
                  overflow: 'hidden',
                }}
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
                    {/* <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        background: 'linear-gradient(145deg, rgba(255, 238, 240, 0.9), rgba(255, 217, 224, 0.95))',
                        boxShadow: '0 6px 14px rgba(255, 99, 132, 0.28)',
                        border: '1px solid rgba(255, 99, 132, 0.25)',
                      }}
                    >
                      <Typography sx={{ color: 'var(--color-error)', fontWeight: 900, fontSize: 18 }}>
                        ★
                      </Typography>
                    </Box> */}
                    <Box>
                      <Typography
                        sx={{
                          color: 'var(--color-error)',
                          fontWeight: 900,
                          letterSpacing: 0.5,
                        }}
                      >
                        اعضای فعلی اشتراک
                      </Typography>
                      <Typography sx={{ color: 'var(--color-secondary)', fontWeight: 600, fontSize: 12 }}>
                        اعضای تایید شده این اشتراک در این بخش نمایش داده می‌شوند.
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${stagedMembers.length} عضو`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      background: 'rgba(255, 99, 132, 0.12)',
                      color: 'var(--color-error)',
                      border: '1px solid rgba(255, 99, 132, 0.35)',
                      borderRadius: '12px',
                      px: 1,
                    }}
                  />
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 99, 132, 0.3)' }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {hasMembers ? (
                    stagedMembers.map((member) => (
                      <Chip
                        key={member}
                        label={member}
                        onDelete={() => handleRemoveMember(member)}
                        disabled={isSubmitting || !hasRemovableMembers}
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
            </Box>
          </Stack>
        )}
      </Stack>

      <Dialog
        open={isConfirmOpen}
        onClose={handleCancelConfirmation}
        aria-labelledby="manage-share-members-confirmation"
      >
        <DialogTitle id="manage-share-members-confirmation" sx={{ fontWeight: 800 }}>
          آیا از اعمال تغییرات مطمئن هستید؟
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'var(--color-secondary)', lineHeight: 1.9 }}>
            با تایید، تغییرات اعضا در اشتراک «{shareName}» ثبت می‌شود. در غیر این صورت بدون ذخیره‌سازی بسته خواهد شد.
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

export default ManageShareMembersModal;