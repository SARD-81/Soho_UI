import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import {
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import type { CreateOsUserPayload, OsUserTableItem } from '../@types/users';
import TabPanel from '../components/TabPanel';
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

  const sambaUsersQuery = useSambaUsers({
    enabled: activeTab !== USERS_TABS.other,
  });

  const sambaUsers = useMemo(
    () => normalizeSambaUsers(sambaUsersQuery.data?.data),
    [sambaUsersQuery.data?.data]
  );

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
      toast.success(`کاربر Samba ${username} با موفقیت ایجاد شد.`);
      setIsSambaCreateModalOpen(false);
      setSambaCreateError(null);
    },
    onError: (message) => {
      setSambaCreateError(message);
      toast.error(`ایجاد کاربر Samba با خطا مواجه شد: ${message}`);
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
      createOsUser.mutate(payload);
    },
    [createOsUser]
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
      const run = async () => {
        if (createOsUserFirst) {
          try {
            await createOsUser.mutateAsync({
              username,
              login_shell: DEFAULT_LOGIN_SHELL,
              shell: DEFAULT_LOGIN_SHELL,
            });
          } catch {
            return;
          }
        }

        createSambaUser.mutate({ username, password });
      };

      void run();
    },
    [createOsUser, createSambaUser]
  );

  return (
    <Box
      sx={{
        p: 3,
        fontFamily: 'var(--font-vazir)',
        backgroundColor: 'var(--color-background)',
        minHeight: '100%',
      }}
    >
      <Typography
        variant="h5"
        sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
      >
        مدیریت کاربران
      </Typography>

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
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            {/*<FormControlLabel*/}
            {/*  control={*/}
            {/*    <Checkbox*/}
            {/*      checked={includeSystem}*/}
            {/*      onChange={handleToggleIncludeSystem}*/}
            {/*      sx={{*/}
            {/*        color: 'var(--color-secondary)',*/}
            {/*        '&.Mui-checked': {*/}
            {/*          color: 'var(--color-primary)',*/}
            {/*        },*/}
            {/*      }}*/}
            {/*    />*/}
            {/*  }*/}
            {/*  label="نمایش کاربران سیستمی"*/}
            {/*  sx={{*/}
            {/*    '& .MuiTypography-root': {*/}
            {/*      color: 'var(--color-secondary)',*/}
            {/*      fontWeight: 600,*/}
            {/*    },*/}
            {/*  }}*/}
            {/*/>*/}

            <Button
              onClick={handleOpenCreateModal}
              variant="contained"
              sx={{
                alignSelf: 'flex-start',
                px: 3,
                py: 1.25,
                borderRadius: '3px',
                fontWeight: 700,
                fontSize: '0.95rem',
                background:
                  'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                color: 'var(--color-bg)',
                boxShadow:
                  '0 16px 32px -18px color-mix(in srgb, var(--color-primary) 55%, transparent)',
                '&:hover': {
                  background:
                    'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)',
                },
              }}
            >
              ایجاد کاربر جدید
            </Button>
          </Box>

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
      />

      <SambaUserCreateModal
        open={isSambaCreateModalOpen}
        onClose={handleCloseSambaCreateModal}
        onSubmit={handleSubmitCreateSambaUser}
        isSubmitting={createSambaUser.isPending}
        errorMessage={sambaCreateError}
        initialUsername={sambaCreateInitialUsername}
      />
    </Box>
  );
};

export default Users;
