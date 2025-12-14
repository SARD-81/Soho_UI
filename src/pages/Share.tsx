import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import type {
  SambaShareEntry,
  UpdateSambaUserPasswordPayload,
} from '../@types/samba';
import PageContainer from '../components/PageContainer';
import ConfirmDeleteShareModal from '../components/share/ConfirmDeleteShareModal';
import CreateShareModal from '../components/share/CreateShareModal';
import ManageShareMembersModal from '../components/share/ManageShareMembersModal';
import SelectedSharesDetailsPanel from '../components/share/SelectedSharesDetailsPanel';
import SharesTable from '../components/share/SharesTable';
import TabPanel from '../components/TabPanel';
import ConfirmDeleteSambaUserModal from '../components/users/ConfirmDeleteSambaUserModal';
import SambaUserCreateModal from '../components/users/SambaUserCreateModal';
import SambaUserPasswordModal from '../components/users/SambaUserPasswordModal';
import SambaUsersTable from '../components/users/SambaUsersTable';
import SelectedSambaUsersDetailsPanel from '../components/users/SelectedSambaUsersDetailsPanel';
import {
  tabContainerSx,
  tabListSx,
  tabPanelSx,
} from '../components/tabs/styles';
import { DEFAULT_LOGIN_SHELL } from '../constants/users';
import { useCreateOsUser } from '../hooks/useCreateOsUser';
import { useCreateSambaUser } from '../hooks/useCreateSambaUser';
import { useCreateShare } from '../hooks/useCreateShare';
import { useCreateSambaGroup } from '../hooks/useCreateSambaGroup';
import { useDeleteSambaUser } from '../hooks/useDeleteSambaUser';
import { useDeleteShare } from '../hooks/useDeleteShare';
import { useDeleteSambaGroup } from '../hooks/useDeleteSambaGroup';
import { useSambaGroups } from '../hooks/useSambaGroups';
import { useSambaUserAccountFlags } from '../hooks/useSambaUserAccountFlags';
import { useSambaShares } from '../hooks/useSambaShares';
import { useSambaUsers } from '../hooks/useSambaUsers';
import { useServiceAction } from '../hooks/useServiceAction';
import { useUpdateSambaGroupMember } from '../hooks/useUpdateSambaGroupMember';
import { useUpdateSambaUserStatus } from '../hooks/useUpdateSambaUserStatus';
import { useUpdateSambaUserPassword } from '../hooks/useUpdateSambaUserPassword';
import { normalizeSambaUsers } from '../utils/sambaUsers';
import SambaGroupCreateModal from '../components/groups/SambaGroupCreateModal';
import SambaGroupsTable from '../components/groups/SambaGroupsTable';
import SambaGroupAddMemberModal from '../components/groups/SambaGroupAddMemberModal';
import SambaGroupRemoveMemberModal from '../components/groups/SambaGroupRemoveMemberModal';
import ConfirmDeleteSambaGroupModal from '../components/groups/ConfirmDeleteSambaGroupModal';
import ConfirmRemoveGroupMemberModal from '../components/groups/ConfirmRemoveGroupMemberModal';
import GroupGuideAccordion from '../components/groups/GroupGuideAccordion';

const SHARE_TABS = {
  shares: 'shares',
  sambaUsers: 'samba-users',
  sambaGroups: 'samba-groups',
} as const;

type ShareTabValue = (typeof SHARE_TABS)[keyof typeof SHARE_TABS];

const MAX_COMPARISON_ITEMS = 4;

const Share = () => {
  const [activeTab, setActiveTab] = useState<ShareTabValue>(SHARE_TABS.shares);
  const [selectedShares, setSelectedShares] = useState<string[]>([]);
  const [manageUsersShare, setManageUsersShare] = useState<string | null>(null);
  const [manageGroupsShare, setManageGroupsShare] = useState<string | null>(null);
  const [isSambaCreateModalOpen, setIsSambaCreateModalOpen] = useState(false);
  const [sambaCreateError, setSambaCreateError] = useState<string | null>(null);
  const [sambaCreateInitialUsername, setSambaCreateInitialUsername] = useState<
    string | undefined
  >(undefined);
  const [selectedSambaUsers, setSelectedSambaUsers] = useState<string[]>([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordModalUsername, setPasswordModalUsername] = useState<
    string | null
  >(null);
  const [passwordModalError, setPasswordModalError] = useState<string | null>(
    null
  );
  const [pendingStatusUsername, setPendingStatusUsername] = useState<
    string | null
  >(null);
  const [pendingPasswordUsername, setPendingPasswordUsername] = useState<
    string | null
  >(null);
  const [pendingDeleteUsername, setPendingDeleteUsername] = useState<
    string | null
  >(null);
  const [deleteModalUsername, setDeleteModalUsername] = useState<string | null>(
    null
  );
  const [deleteSambaError, setDeleteSambaError] = useState<string | null>(null);
  const [isGroupCreateModalOpen, setIsGroupCreateModalOpen] = useState(false);
  const [groupCreateError, setGroupCreateError] = useState<string | null>(null);
  const [pendingGroupDelete, setPendingGroupDelete] = useState<string | null>(
    null
  );
  const [pendingGroupMember, setPendingGroupMember] = useState<string | null>(
    null
  );
  const [addMemberGroup, setAddMemberGroup] = useState<string | null>(null);
  const [removeMemberGroup, setRemoveMemberGroup] = useState<string | null>(
    null
  );
  const [deleteGroupName, setDeleteGroupName] = useState<string | null>(null);
  const [deleteGroupError, setDeleteGroupError] = useState<string | null>(null);
  const [groupMemberError, setGroupMemberError] = useState<string | null>(null);
  const [removeMemberError, setRemoveMemberError] = useState<string | null>(null);
  const [removeMemberTarget, setRemoveMemberTarget] = useState<{
    groupname: string | null;
    username: string | null;
  }>({ groupname: null, username: null });

  const { data: rawShares = [], isLoading, error } = useSambaShares();

  const shares = useMemo(
    () =>
      [...rawShares].sort((a, b) =>
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
      ),
    [rawShares]
  );

  const createShare = useCreateShare({
    onSuccess: (shareName) => {
      toast.success(`اشتراک ${shareName} با موفقیت ایجاد شد.`);
      handleRestartSmbd();
    },
    onError: (message) => {
      toast.error(`ایجاد اشتراک با خطا مواجه شد: ${message}`);
    },
  });

  const shareDeletion = useDeleteShare({
    onSuccess: (shareName) => {
      toast.success(`اشتراک ${shareName} با موفقیت حذف شد.`);
    },
    onError: (deleteError, shareName) => {
      toast.error(
        `حذف اشتراک ${shareName} با خطا مواجه شد: ${deleteError.message}`
      );
    },
  });

  const handleOpenManageUsersModal = useCallback((share: SambaShareEntry) => {
    setManageUsersShare(share.name);
  }, []);

  const handleCloseManageUsersModal = useCallback(() => {
    setManageUsersShare(null);
  }, []);

  const handleOpenManageGroupsModal = useCallback((share: SambaShareEntry) => {
    setManageGroupsShare(share.name);
  }, []);

  const handleCloseManageGroupsModal = useCallback(() => {
    setManageGroupsShare(null);
  }, []);

  const handleTabChange = useCallback(
    (_: SyntheticEvent, value: ShareTabValue) => {
      setActiveTab(value);
    },
    []
  );

  const serviceAction = useServiceAction({
    onSuccess: () => {
      // toast.success(`سرویس ${service} با موفقیت راه‌اندازی مجدد شد.`);
    },
    onError: (message, { service }) => {
      toast.error(`راه‌اندازی مجدد ${service} با خطا مواجه شد: ${message}`);
    },
  });

  const handleRestartSmbd = useCallback(() => {
    // if (serviceAction.isPending) {
    //   toast(
    //     'راه‌اندازی مجدد سرویس smbd.service در حال انجام است. لطفاً صبر کنید.'
    //   );
    //   return;
    // }
    //
    // const toastId = toast.loading(
    //   'در حال راه‌اندازی مجدد سرویس smbd.service...'
    // );

    serviceAction.mutate(
      { service: 'smbd.service', action: 'restart' },
      {
        onSettled: () => {
          // toast.dismiss(toastId);
        },
      }
    );
  }, [serviceAction]);

  useEffect(() => {
    setSelectedShares((prev) =>
      prev.filter((shareName) =>
        shares.some((share) => share.name === shareName)
      )
    );
  }, [shares]);

  const handleToggleSelect = useCallback(
    (share: SambaShareEntry, checked: boolean) => {
      setSelectedShares((prev) => {
        if (checked) {
          if (prev.includes(share.name)) {
            return prev;
          }

          if (prev.length >= MAX_COMPARISON_ITEMS) {
            return [...prev.slice(0, MAX_COMPARISON_ITEMS - 1), share.name];
          }

          return [...prev, share.name];
        }

        return prev.filter((name) => name !== share.name);
      });
    },
    []
  );

  const handleRemoveSelected = useCallback((shareName: string) => {
    setSelectedShares((prev) => prev.filter((name) => name !== shareName));
  }, []);

  const handleDeleteShare = useCallback(
    (share: SambaShareEntry) => {
      shareDeletion.requestDelete(share);
    },
    [shareDeletion]
  );

  const comparisonItems = useMemo(
    () =>
      selectedShares
        .map((shareName) => {
          const targetShare = shares.find((share) => share.name === shareName);

          if (!targetShare) {
            return null;
          }

          return {
            shareName: targetShare.name,
            detail: targetShare.details,
          };
        })
        .filter(
          (
            item
          ): item is {
            shareName: string;
            detail: SambaShareEntry['details'];
          } => item !== null
        ),
    [selectedShares, shares]
  );

  const sambaUsersQuery = useSambaUsers({
    enabled: activeTab === SHARE_TABS.sambaUsers,
  });

  const sambaUsers = useMemo(() => {
    const normalizedUsers = normalizeSambaUsers(sambaUsersQuery.data?.data);

    return normalizedUsers.slice().sort((a, b) =>
      (a.username ?? '').localeCompare(b.username ?? '', 'en', {
        sensitivity: 'base',
      })
    );
  }, [sambaUsersQuery.data?.data]);

  const normalizedSambaUsernames = useMemo(() => {
    return new Set(
      sambaUsers
        .map((user) => (user.username ?? '').trim().toLowerCase())
        .filter((username) => username.length > 0)
    );
  }, [sambaUsers]);

  const sambaUserAccountFlags = useSambaUserAccountFlags({
    usernames: sambaUsers.map((user) => user.username),
    enabled: activeTab === SHARE_TABS.sambaUsers,
  });

  const sambaGroupsQuery = useSambaGroups({
    enabled: activeTab === SHARE_TABS.sambaGroups,
  });

  const sambaGroups = useMemo(
    () =>
      (sambaGroupsQuery.data ?? []).slice().sort((a, b) =>
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
      ),
    [sambaGroupsQuery.data]
  );

  const createOsUser = useCreateOsUser({
    onSuccess: (username) => {
      toast.success(`کاربر ${username} با موفقیت ایجاد شد.`);
    },
    onError: (message) => {
      toast.error(`ایجاد کاربر با خطا مواجه شد: ${message}`);
    },
  });

  const createSambaUser = useCreateSambaUser({
    onSuccess: () => {
      // toast.success(`کاربر Samba ${username} با موفقیت ایجاد شد.`);
      setIsSambaCreateModalOpen(false);
      setSambaCreateError(null);
    },
    onError: (message) => {
      setSambaCreateError(message);
      toast.error(`ایجاد کاربر اشتراک فایل با خطا مواجه شد: ${message}`);
    },
  });

  const updateSambaUserStatus = useUpdateSambaUserStatus({
    onSuccess: (username, action) => {
      const actionLabel = action === 'enable' ? 'فعال شد' : 'غیرفعال شد';
      toast.success(`کاربر اشتراک فایل ${username} ${actionLabel}.`);
    },
    onError: (message, action) => {
      const actionLabel = action === 'enable' ? 'فعال‌سازی' : 'غیرفعال‌سازی';
      toast.error(`${actionLabel} کاربر اشتراک فایل با خطا مواجه شد: ${message}`);
    },
  });

  const deleteSambaUser = useDeleteSambaUser({
    onSuccess: (username) => {
      toast.success(`کاربر اشتراک فایل ${username} با موفقیت حذف شد.`);
      setDeleteSambaError(null);
    },
    onError: (message, error, username) => {
      setDeleteSambaError(message);
      if (
        error.response?.status === 400
        
      ) {
        toast.error(
          `کاربر اشتراک فایل ${username} در اشتراک‌های فعال استفاده شده است. لطفاً ابتدا اشتراک‌های مرتبط را حذف کنید.`
        );
        return;
      }

      toast.error(`حذف کاربر اشتراک فایل با خطا مواجه شد: ${message}`);
    },
  });

  const updateSambaPassword = useUpdateSambaUserPassword({
    onSuccess: (username) => {
      toast.success(`گذرواژه کاربر اشتراک فایل ${username} بروزرسانی شد.`);
      setIsPasswordModalOpen(false);
      setPasswordModalUsername(null);
      setPasswordModalError(null);
    },
    onError: (message) => {
      setPasswordModalError(message);
      toast.error(
        `تغییر گذرواژه کاربر اشتراک فایل با خطا مواجه شد: ${message}`
      );
    },
  });

  const createSambaGroup = useCreateSambaGroup({
    onSuccess: (groupname) => {
      toast.success(`گروه ${groupname} با موفقیت ایجاد شد.`);
      setIsGroupCreateModalOpen(false);
      setGroupCreateError(null);
    },
    onError: (message) => {
      setGroupCreateError(message);
      toast.error(`ایجاد گروه اشتراک فایل با خطا مواجه شد: ${message}`);
    },
  });

  const deleteSambaGroup = useDeleteSambaGroup({
    onSuccess: (groupname) => {
      toast.success(`گروه ${groupname} با موفقیت حذف شد.`);
    },
    onError: (message, groupname) => {
      toast.error(`حذف گروه ${groupname} با خطا مواجه شد: ${message}`);
    },
  });

  const updateSambaGroupMember = useUpdateSambaGroupMember({
    onSuccess: (groupname, username, action) => {
      const actionLabel = action === 'add' ? 'به گروه افزوده شد' : 'از گروه حذف شد';
      toast.success(`کاربر ${username} ${actionLabel} (${groupname}).`);
      setGroupMemberError(null);
      setRemoveMemberError(null);
      setAddMemberGroup(null);
      setRemoveMemberGroup(null);
      setRemoveMemberTarget({ groupname: null, username: null });
      setPendingGroupMember(null);
    },
    onError: (message, groupname, username, action) => {
      const actionLabel = action === 'add' ? 'افزودن' : 'حذف';
      if (action === 'add') {
        setGroupMemberError(message);
      } else {
        setRemoveMemberError(message);
      }
      toast.error(
        `${actionLabel} کاربر ${username} در گروه ${groupname} با خطا مواجه شد: ${message}`
      );
      setPendingGroupMember(null);
    },
  });

  const handleOpenSambaCreateModal = useCallback(
    (username?: string) => {
      setSambaCreateError(null);
      createSambaUser.reset();
      setSambaCreateInitialUsername(username);
      setIsSambaCreateModalOpen(true);
    },
    [createSambaUser]
  );

  const handleCloseSambaCreateModal = useCallback(() => {
    setIsSambaCreateModalOpen(false);
    setSambaCreateError(null);
    createSambaUser.reset();
    setSambaCreateInitialUsername(undefined);
  }, [createSambaUser]);

  const handleSubmitCreateSambaUser = useCallback(
    ({
      username,
      password,
      createOsUserFirst,
    }: {
      username: string;
      password: string;
      createOsUserFirst: boolean;
    }) => {
      const trimmedUsername = username.trim();
      const normalizedUsername = trimmedUsername.toLowerCase();

      if (normalizedUsername.length === 0) {
        return;
      }

      if (normalizedSambaUsernames.has(normalizedUsername)) {
        const message = 'کاربر اشتراک فایل با این نام کاربری وجود دارد.';
        setSambaCreateError(message);
        toast.error(message);
        return;
      }

      const run = async () => {
        if (createOsUserFirst) {
          try {
            await createOsUser.mutateAsync({
              username: trimmedUsername,
              login_shell: DEFAULT_LOGIN_SHELL,
              shell: DEFAULT_LOGIN_SHELL,
            });
          } catch {
            return;
          }
        }

        createSambaUser.mutate({ username: trimmedUsername, password });
      };

      void run();
    },
    [createOsUser, createSambaUser, normalizedSambaUsernames]
  );

  const handleToggleSelectSambaUser = useCallback(
    (user: { username: string }, checked: boolean) => {
      setSelectedSambaUsers((prev) => {
        if (checked) {
          if (prev.includes(user.username)) {
            return prev;
          }

          if (prev.length >= MAX_COMPARISON_ITEMS) {
            return [...prev.slice(0, MAX_COMPARISON_ITEMS - 1), user.username];
          }

          return [...prev, user.username];
        }

        return prev.filter((username) => username !== user.username);
      });
    },
    []
  );

  const handleRemoveSelectedSambaUser = useCallback((username: string) => {
    setSelectedSambaUsers((prev) => prev.filter((item) => item !== username));
  }, []);

  const handleToggleSambaUserStatus = useCallback(
    (user: { username: string }) => {
      const currentStatus =
        sambaUserAccountFlags.statusByUsername[user.username] ?? 'unknown';
      const nextAction = currentStatus === 'enabled' ? 'disable' : 'enable';

      setPendingStatusUsername(user.username);
      updateSambaUserStatus.mutate(
        { username: user.username, action: nextAction },
        {
          onSettled: () => {
            setPendingStatusUsername(null);
          },
        }
      );
    },
    [sambaUserAccountFlags.statusByUsername, updateSambaUserStatus]
  );

  const handleOpenPasswordModal = useCallback(
    (user: { username: string }) => {
      setPasswordModalUsername(user.username);
      setPasswordModalError(null);
      updateSambaPassword.reset();
      setIsPasswordModalOpen(true);
    },
    [updateSambaPassword]
  );

  const handleClosePasswordModal = useCallback(() => {
    setIsPasswordModalOpen(false);
    setPasswordModalUsername(null);
    setPasswordModalError(null);
    updateSambaPassword.reset();
  }, [updateSambaPassword]);

  const handleSubmitPasswordChange = useCallback(
    (payload: UpdateSambaUserPasswordPayload) => {
      if (!payload.new_password) {
        return;
      }

      setPendingPasswordUsername(payload.username);
      updateSambaPassword.mutate(payload, {
        onSettled: () => {
          setPendingPasswordUsername(null);
        },
      });
    },
    [updateSambaPassword]
  );

  const handleOpenGroupCreateModal = useCallback(() => {
    setGroupCreateError(null);
    createSambaGroup.reset();
    setIsGroupCreateModalOpen(true);
  }, [createSambaGroup]);

  const handleCloseGroupCreateModal = useCallback(() => {
    if (createSambaGroup.isPending) {
      return;
    }

    setIsGroupCreateModalOpen(false);
    setGroupCreateError(null);
    createSambaGroup.reset();
  }, [createSambaGroup]);

  const handleSubmitCreateGroup = useCallback(
    (groupname: string) => {
      setGroupCreateError(null);
      createSambaGroup.mutate(groupname);
    },
    [createSambaGroup]
  );

  const handleOpenAddGroupMemberModal = useCallback(
    (group: { name: string }) => {
      setGroupMemberError(null);
      updateSambaGroupMember.reset();
      setAddMemberGroup(group.name);
    },
    [updateSambaGroupMember]
  );

  const handleCloseAddGroupMemberModal = useCallback(() => {
    if (updateSambaGroupMember.isPending) {
      return;
    }

    setAddMemberGroup(null);
    setGroupMemberError(null);
  }, [updateSambaGroupMember.isPending]);

  const handleSubmitAddMember = useCallback(
    (username: string) => {
      if (!addMemberGroup) {
        return;
      }

      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        return;
      }

      setPendingGroupMember(addMemberGroup);
      setGroupMemberError(null);

      updateSambaGroupMember.mutate(
        {
          groupname: addMemberGroup,
          username: trimmedUsername,
          action: 'add',
        },
        {
          onSettled: () => {
            setPendingGroupMember(null);
          },
        }
      );
    },
    [addMemberGroup, updateSambaGroupMember]
  );

  const handleOpenRemoveGroupMemberModal = useCallback(
    (group: { name: string }) => {
      setRemoveMemberError(null);
      setRemoveMemberTarget({ groupname: null, username: null });
      updateSambaGroupMember.reset();
      setRemoveMemberGroup(group.name);
    },
    [updateSambaGroupMember]
  );

  const handleCloseRemoveGroupMemberModal = useCallback(() => {
    if (updateSambaGroupMember.isPending) {
      return;
    }

    setRemoveMemberGroup(null);
    setRemoveMemberError(null);
    setRemoveMemberTarget({ groupname: null, username: null });
  }, [updateSambaGroupMember.isPending]);

  const handleRequestRemoveMember = useCallback(
    (username: string) => {
      if (!removeMemberGroup) {
        return;
      }

      setRemoveMemberError(null);
      setRemoveMemberTarget({ groupname: removeMemberGroup, username });
    },
    [removeMemberGroup]
  );

  const handleCloseConfirmRemoveMember = useCallback(() => {
    if (updateSambaGroupMember.isPending) {
      return;
    }

    setRemoveMemberTarget({ groupname: null, username: null });
    setRemoveMemberError(null);
  }, [updateSambaGroupMember.isPending]);

  const handleConfirmRemoveMember = useCallback(() => {
    if (!removeMemberTarget.groupname || !removeMemberTarget.username) {
      return;
    }

    const targetGroup = removeMemberTarget.groupname;
    const targetUser = removeMemberTarget.username;
    setPendingGroupMember(targetGroup);
    setRemoveMemberError(null);

    updateSambaGroupMember.mutate(
      {
        groupname: targetGroup,
        username: targetUser,
        action: 'remove',
      },
      {
        onSettled: () => {
          setPendingGroupMember(null);
          setRemoveMemberTarget({ groupname: null, username: null });
        },
      }
    );
  }, [removeMemberTarget, updateSambaGroupMember]);

  const handleDeleteSambaGroup = useCallback(
    (group: { name: string }) => {
      setDeleteGroupError(null);
      setDeleteGroupName(group.name);
    },
    []
  );

  const handleCloseDeleteGroupModal = useCallback(() => {
    if (deleteSambaGroup.isPending) {
      return;
    }

    setDeleteGroupName(null);
    setDeleteGroupError(null);
    setPendingGroupDelete(null);
  }, [deleteSambaGroup.isPending]);

  const handleConfirmDeleteGroup = useCallback(() => {
    if (!deleteGroupName) {
      return;
    }

    const targetGroup = deleteGroupName;
    setPendingGroupDelete(targetGroup);
    setDeleteGroupError(null);

    deleteSambaGroup.mutate(targetGroup, {
      onError: (error) => {
        setDeleteGroupError(error.message);
      },
      onSettled: () => {
        setPendingGroupDelete(null);
        setDeleteGroupName(null);
      },
    });
  }, [deleteGroupName, deleteSambaGroup]);

  const isDeletingSambaUser = deleteSambaUser.isPending;

  const handleDeleteSambaUser = useCallback(
    (user: { username: string }) => {
      setDeleteSambaError(null);
      deleteSambaUser.reset();
      setDeleteModalUsername(user.username);
    },
    [deleteSambaUser]
  );

  const handleCloseDeleteSambaUserModal = useCallback(() => {
    if (isDeletingSambaUser) {
      return;
    }

    setDeleteModalUsername(null);
    setPendingDeleteUsername(null);
    setDeleteSambaError(null);
    deleteSambaUser.reset();
  }, [deleteSambaUser, isDeletingSambaUser]);

  const handleConfirmDeleteSambaUser = useCallback(() => {
    if (!deleteModalUsername) {
      return;
    }

    const targetUsername = deleteModalUsername;
    setDeleteSambaError(null);
    setPendingDeleteUsername(targetUsername);
    deleteSambaUser.mutate(targetUsername, {
      onSettled: () => {
        setPendingDeleteUsername(null);
        setDeleteModalUsername(null);
      },
    });
  }, [deleteModalUsername, deleteSambaUser]);

  useEffect(() => {
    setSelectedSambaUsers((prev) =>
      prev.filter((username) =>
        sambaUsers.some((user) => user.username === username)
      )
    );
  }, [sambaUsers]);

  const selectedSambaUserItems = useMemo(
    () =>
      selectedSambaUsers
        .map((username) =>
          sambaUsers.find((user) => user.username === username)
        )
        .filter((user): user is (typeof sambaUsers)[number] => Boolean(user)),
    [sambaUsers, selectedSambaUsers]
  );

  return (
    <PageContainer sx={{ backgroundColor: 'var(--color-background)' }}>
      <Typography
        variant="h5"
        sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
      >
        اشتراک‌گذاری
      </Typography>
      <Box sx={tabContainerSx}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={tabListSx}>
          <Tab label="اشتراک‌ها" value={SHARE_TABS.shares} />
          <Tab label="کاربران اشتراک فایل" value={SHARE_TABS.sambaUsers} />
          <Tab label="گروه‌های اشتراک فایل" value={SHARE_TABS.sambaGroups} />
        </Tabs>

        <Box sx={tabPanelSx}>
          <TabPanel
            value={SHARE_TABS.sambaGroups}
            currentValue={activeTab}
            sx={{ mt: 0 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  مدیریت گروه‌های اشتراک فایل
                </Typography>

                <Button
                  onClick={handleOpenGroupCreateModal}
                  variant="contained"
                  sx={{
                    px: 3,
                    py: 1.25,
                    borderRadius: '3px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    background:
                      'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
                    color: 'var(--color-bg)',
                    boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
                  }}
                >
                  ایجاد گروه جدید
                </Button>
              </Box>

              <GroupGuideAccordion dense sx={{ mb: 2 }} />

              <SambaGroupsTable
                groups={sambaGroups}
                isLoading={sambaGroupsQuery.isLoading || sambaGroupsQuery.isFetching}
                error={sambaGroupsQuery.error ?? null}
                pendingDeleteGroup={pendingGroupDelete}
                pendingMemberGroup={pendingGroupMember}
                onAddUser={handleOpenAddGroupMemberModal}
                onRemoveUser={handleOpenRemoveGroupMemberModal}
                onDelete={handleDeleteSambaGroup}
              />
            </Box>
          </TabPanel>

          <TabPanel
            value={SHARE_TABS.shares}
            currentValue={activeTab}
            sx={{ mt: 0 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  اشتراک‌گذاری فایل
                </Typography>

                <Button
                  onClick={createShare.openCreateModal}
                  variant="contained"
                  sx={{
                    px: 3,
                    py: 1.25,
                    borderRadius: '3px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    background:
                      'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
                    color: 'var(--color-bg)',
                    boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
                  }}
                >
                  ایجاد اشتراک جدید
                </Button>
              </Box>

              <SharesTable
                shares={shares}
                isLoading={isLoading}
                error={error}
                selectedShares={selectedShares}
                onToggleSelect={handleToggleSelect}
                onDelete={handleDeleteShare}
                onManageUsers={handleOpenManageUsersModal}
                onManageGroups={handleOpenManageGroupsModal}
                pendingShareName={shareDeletion.pendingShareName}
                isDeleting={shareDeletion.isDeleting}
              />

              <SelectedSharesDetailsPanel
                items={comparisonItems}
                onRemove={handleRemoveSelected}
              />
            </Box>
          </TabPanel>

          <TabPanel
            value={SHARE_TABS.sambaUsers}
            currentValue={activeTab}
            sx={{ mt: 0 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  مدیریت کاربران
                </Typography>

                <Button
                  onClick={() => handleOpenSambaCreateModal()}
                  variant="contained"
                  sx={{
                    px: 3,
                    py: 1.25,
                    borderRadius: '3px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    background:
                      'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
                    color: 'var(--color-bg)',
                    boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
                  }}
                >
                  ایجاد کاربر جدید
                </Button>
              </Box>

              <SambaUsersTable
                users={sambaUsers}
                isLoading={sambaUsersQuery.isLoading || sambaUsersQuery.isFetching}
                error={sambaUsersQuery.error ?? null}
                selectedUsers={selectedSambaUsers}
                onToggleSelect={handleToggleSelectSambaUser}
                onToggleStatus={handleToggleSambaUserStatus}
                onEditPassword={handleOpenPasswordModal}
                onDelete={handleDeleteSambaUser}
                statusByUsername={sambaUserAccountFlags.statusByUsername}
                isStatusLoading={
                  sambaUserAccountFlags.isLoading ||
                  sambaUserAccountFlags.isFetching
                }
                pendingStatusUsername={pendingStatusUsername}
                isUpdatingStatus={updateSambaUserStatus.isPending}
                pendingPasswordUsername={pendingPasswordUsername}
                isUpdatingPassword={updateSambaPassword.isPending}
                pendingDeleteUsername={pendingDeleteUsername}
                isDeleting={deleteSambaUser.isPending}
              />

              <SelectedSambaUsersDetailsPanel
                items={selectedSambaUserItems}
                onRemove={handleRemoveSelectedSambaUser}
              />
            </Box>
          </TabPanel>
        </Box>
      </Box>

      <CreateShareModal controller={createShare} />

      <SambaGroupCreateModal
        open={isGroupCreateModalOpen}
        onClose={handleCloseGroupCreateModal}
        onSubmit={handleSubmitCreateGroup}
        isSubmitting={createSambaGroup.isPending}
        errorMessage={groupCreateError}
      />

      <ConfirmDeleteSambaGroupModal
        open={Boolean(deleteGroupName)}
        groupname={deleteGroupName}
        onClose={handleCloseDeleteGroupModal}
        onConfirm={handleConfirmDeleteGroup}
        isDeleting={deleteSambaGroup.isPending}
        errorMessage={deleteGroupError}
      />

      <SambaGroupAddMemberModal
        open={Boolean(addMemberGroup)}
        groupname={addMemberGroup}
        onClose={handleCloseAddGroupMemberModal}
        onSubmit={handleSubmitAddMember}
        isSubmitting={updateSambaGroupMember.isPending}
        errorMessage={groupMemberError}
      />

      <SambaGroupRemoveMemberModal
        open={Boolean(removeMemberGroup)}
        groupname={removeMemberGroup}
        onClose={handleCloseRemoveGroupMemberModal}
        onRemove={handleRequestRemoveMember}
        isSubmitting={updateSambaGroupMember.isPending}
        errorMessage={removeMemberError}
      />

      <ConfirmRemoveGroupMemberModal
        open={Boolean(removeMemberTarget.groupname && removeMemberTarget.username)}
        groupname={removeMemberTarget.groupname}
        username={removeMemberTarget.username}
        onClose={handleCloseConfirmRemoveMember}
        onConfirm={handleConfirmRemoveMember}
        isRemoving={updateSambaGroupMember.isPending}
        errorMessage={removeMemberError}
      />

      <ManageShareMembersModal
        open={Boolean(manageUsersShare)}
        shareName={manageUsersShare}
        type="users"
        onClose={handleCloseManageUsersModal}
      />

      <ManageShareMembersModal
        open={Boolean(manageGroupsShare)}
        shareName={manageGroupsShare}
        type="groups"
        onClose={handleCloseManageGroupsModal}
      />

      <ConfirmDeleteShareModal controller={shareDeletion} />

      <ConfirmDeleteSambaUserModal
        open={Boolean(deleteModalUsername)}
        username={deleteModalUsername}
        onClose={handleCloseDeleteSambaUserModal}
        onConfirm={handleConfirmDeleteSambaUser}
        isDeleting={isDeletingSambaUser}
        errorMessage={deleteSambaError}
      />

      <SambaUserCreateModal
        open={isSambaCreateModalOpen}
        onClose={handleCloseSambaCreateModal}
        onSubmit={handleSubmitCreateSambaUser}
        isSubmitting={createSambaUser.isPending}
        errorMessage={sambaCreateError}
        initialUsername={sambaCreateInitialUsername}
        existingUsernames={Array.from(normalizedSambaUsernames).sort((a, b) =>
          a.localeCompare(b, 'en', { sensitivity: 'base' })
        )}
      />

      <SambaUserPasswordModal
        open={isPasswordModalOpen}
        username={passwordModalUsername}
        onClose={handleClosePasswordModal}
        onSubmit={handleSubmitPasswordChange}
        errorMessage={passwordModalError}
        isSubmitting={updateSambaPassword.isPending}
      />
    </PageContainer>
  );
};

export default Share;