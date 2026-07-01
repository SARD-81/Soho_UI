import { Box, Tab, Tabs, Typography } from '@mui/material';
import {
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import type { CreateOsUserPayload, OsUserTableItem } from '../@types/users';
import TabPanel from '../components/TabPanel';
import PageContainer from '../components/PageContainer';
import TablePageHeader from '../components/common/TablePageHeader';
import OsUserCreateModal from '../components/users/OsUserCreateModal';
import OsUsersTable from '../components/users/OsUsersTable';
import SambaUserCreateModal from '../components/users/SambaUserCreateModal';
import {
  DEFAULT_LOGIN_SHELL,
  USERS_TABS,
  type UsersTabValue,
} from '../constants/users';
import { useCreateOsUser } from '../hooks/useCreateOsUser';
import { useCreateSambaUser } from '../hooks/useCreateSambaUser';
import { useOsUsers } from '../hooks/useOsUsers';
import { useSambaUsers } from '../hooks/useSambaUsers';
import { normalizeOsUsers } from '../utils/osUsers';
import { normalizeSambaUsers } from '../utils/sambaUsers';

const Users = () => {
  const [activeTab, setActiveTab] = useState<UsersTabValue>(USERS_TABS.os);
  const [includeSystem] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSambaCreateModalOpen, setIsSambaCreateModalOpen] = useState(false);
  const [sambaCreateError, setSambaCreateError] = useState<string | null>(null);
  const [sambaCreateInitialUsername, setSambaCreateInitialUsername] = useState<
    string | undefined
  >(undefined);

  const osUsersQuery = useOsUsers({
    includeSystem,
    enabled: activeTab === USERS_TABS.os,
  });

  const osUsers = useMemo(
    () => normalizeOsUsers(osUsersQuery.data?.data),
    [osUsersQuery.data?.data]
  );

  const normalizedOsUsernames = useMemo(() => {
    return new Set(
      osUsers
        .map((user) => user.username.trim().toLowerCase())
        .filter((username) => username.length > 0)
    );
  }, [osUsers]);

  const sambaUsersQuery = useSambaUsers({
    enabled: activeTab !== USERS_TABS.other,
  });

  const sambaUsers = useMemo(
    () => normalizeSambaUsers(sambaUsersQuery.data?.data),
    [sambaUsersQuery.data?.data]
  );

  const normalizedSambaUsernames = useMemo(() => {
    return new Set(
      sambaUsers
        .map((user) => (user.username ?? '').trim().toLowerCase())
        .filter((username) => username.length > 0)
    );
  }, [sambaUsers]);

  const sambaUsernames = useMemo(
    () => new Set(sambaUsers.map((user) => user.username)),
    [sambaUsers]
  );

  const osUsersWithSambaStatus = useMemo(
    () =>
      osUsers.map((user) => ({
        ...user,
        hasSambaUser:
          user.hasSambaUser !== undefined
            ? user.hasSambaUser
            : sambaUsernames.has(user.username),
      })),
    [osUsers, sambaUsernames]
  );

  const createOsUser = useCreateOsUser({
    onSuccess: (username) => {
      toast.success(`کاربر ${username} با موفقیت ایجاد شد.`);
      setIsCreateModalOpen(false);
      setCreateError(null);
    },
    onError: (message) => {
      setCreateError(message);
      toast.error(`ایجاد کاربر با خطا مواجه شد: ${message}`);
    },
  });

  const createSambaUser = useCreateSambaUser({
    onSuccess: (username) => {
      toast.success(`کاربر اشتراک فایل ${username} با موفقیت ایجاد شد.`);
      setIsSambaCreateModalOpen(false);
      setSambaCreateError(null);
    },
    onError: (message) => {
      setSambaCreateError(message);
      toast.error(`ایجاد کاربر اشتراک فایل با خطا مواجه شد: ${message}`);
    },
  });

  const handleTabChange = useCallback(
    (_: SyntheticEvent, value: UsersTabValue) => {
      setActiveTab(value);
    },
    []
  );

  const handleOpenCreateModal = useCallback(() => {
    setCreateError(null);
    createOsUser.reset();
    setIsCreateModalOpen(true);
  }, [createOsUser]);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setCreateError(null);
    createOsUser.reset();
  }, [createOsUser]);

  const handleSubmitCreateUser = useCallback(
    (payload: CreateOsUserPayload) => {
      const trimmedUsername = payload.username.trim();
      const normalizedUsername = trimmedUsername.toLowerCase();

      if (normalizedUsername.length === 0) {
        return;
      }

      if (normalizedOsUsernames.has(normalizedUsername)) {
        const message = 'کاربری با این نام کاربری از قبل وجود دارد.';
        setCreateError(message);
        toast.error(message);
        return;
      }

      setCreateError(null);
      createOsUser.mutate({ ...payload, username: trimmedUsername });
    },
    [createOsUser, normalizedOsUsernames]
  );

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

  const handleCreateSambaUserFromOsUser = useCallback(
    (user: OsUserTableItem) => {
      handleOpenSambaCreateModal(user.username);
    },
    [handleOpenSambaCreateModal]
  );

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

      if (createOsUserFirst && normalizedOsUsernames.has(normalizedUsername)) {
        const message = 'کاربر سامانه‌ای با این نام کاربری از قبل وجود دارد.';
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

        setSambaCreateError(null);
        createSambaUser.mutate({ username: trimmedUsername, password });
      };

      void run();
    },
    [createOsUser, createSambaUser, normalizedOsUsernames, normalizedSambaUsernames]
  );

  return (
    <PageContainer
      sx={{ backgroundColor: 'var(--color-background)', minHeight: '100%' }}
    >
      <TablePageHeader
        title="مدیریت کاربران"
        // subtitle="مشاهده کاربران سامانه و ساخت کاربر جدید برای دسترسی‌های سرویس‌ها"
        refreshAction={{
          onClick: () => void osUsersQuery.refetch(),
          disabled: osUsersQuery.isFetching,
          isLoading: osUsersQuery.isFetching,
          loadingLabel: 'در حال بروزرسانی...',
        }}
        primaryAction={{
          label: 'ایجاد کاربر جدید',
          onClick: handleOpenCreateModal,
          disabled: createOsUser.isPending,
        }}
      />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mt: 2,
          '& .MuiTab-root': {
            color: 'var(--color-secondary)',
            fontWeight: 600,
            '&.Mui-selected': {
              color: 'var(--color-primary)',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'var(--color-primary)',
          },
        }}
      >
        <Tab label="کاربران سامانه" value={USERS_TABS.os} />
        <Tab label="سایر کاربران" value={USERS_TABS.other} />
      </Tabs>

      <TabPanel value={USERS_TABS.os} currentValue={activeTab}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <OsUsersTable
            users={osUsersWithSambaStatus}
            isLoading={osUsersQuery.isLoading || osUsersQuery.isFetching}
            error={osUsersQuery.error ?? null}
            isSambaStatusLoading={
              sambaUsersQuery.isLoading || sambaUsersQuery.isFetching
            }
            onCreateSambaUser={handleCreateSambaUserFromOsUser}
          />
        </Box>
      </TabPanel>

      <TabPanel value={USERS_TABS.other} currentValue={activeTab}>
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          بخش سایر کاربران در دست توسعه است.
        </Typography>
      </TabPanel>

      <OsUserCreateModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmitCreateUser}
        isSubmitting={createOsUser.isPending}
        errorMessage={createError}
        existingUsernames={Array.from(normalizedOsUsernames)}
      />

      <SambaUserCreateModal
        open={isSambaCreateModalOpen}
        onClose={handleCloseSambaCreateModal}
        onSubmit={handleSubmitCreateSambaUser}
        isSubmitting={createSambaUser.isPending}
        errorMessage={sambaCreateError}
        initialUsername={sambaCreateInitialUsername}
        existingUsernames={sambaUsers
          .map((user) => user.username ?? '')
          .filter((username) => username)}
      />
    </PageContainer>
  );
};

export default Users;
