import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  type ChangeEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import type { CreateOsUserPayload, OsUserTableItem } from '../@types/users';
import TabPanel from '../components/TabPanel';
import OsUserCreateModal from '../components/users/OsUserCreateModal';
import OsUsersTable from '../components/users/OsUsersTable';
import SambaUserCreateModal from '../components/users/SambaUserCreateModal';
import SambaUserPasswordModal from '../components/users/SambaUserPasswordModal';
import SambaUsersTable from '../components/users/SambaUsersTable';
import SelectedSambaUsersDetailsPanel from '../components/users/SelectedSambaUsersDetailsPanel';
import { USERS_TABS, type UsersTabValue } from '../constants/users';
import { useCreateOsUser } from '../hooks/useCreateOsUser';
import { useCreateSambaUser } from '../hooks/useCreateSambaUser';
import { useEnableSambaUser } from '../hooks/useEnableSambaUser';
import { useOsUsers } from '../hooks/useOsUsers';
import { useSambaUsers } from '../hooks/useSambaUsers';
import { useUpdateSambaUserPassword } from '../hooks/useUpdateSambaUserPassword';
import { normalizeOsUsers } from '../utils/osUsers';
import { normalizeSambaUsers } from '../utils/sambaUsers';

const Users = () => {
  const [activeTab, setActiveTab] = useState<UsersTabValue>(USERS_TABS.os);
  const [includeSystem, setIncludeSystem] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
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
  const [pendingEnableUsername, setPendingEnableUsername] = useState<
    string | null
  >(null);
  const [pendingPasswordUsername, setPendingPasswordUsername] = useState<
    string | null
  >(null);

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

  const createOsUserForSamba = useCreateOsUser({
    onError: (message) => {
      setSambaCreateError(message);
      toast.error(`ایجاد کاربر سیستم عامل با خطا مواجه شد: ${message}`);
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

  const enableSambaUser = useEnableSambaUser({
    onSuccess: (username) => {
      toast.success(`کاربر ${username} فعال شد.`);
    },
    onError: (message) => {
      toast.error(`فعال‌سازی کاربر با خطا مواجه شد: ${message}`);
    },
  });

  const updateSambaPassword = useUpdateSambaUserPassword({
    onSuccess: (username) => {
      toast.success(`گذرواژه کاربر ${username} بروزرسانی شد.`);
      setIsPasswordModalOpen(false);
      setPasswordModalUsername(null);
      setPasswordModalError(null);
    },
    onError: (message) => {
      setPasswordModalError(message);
      toast.error(`تغییر گذرواژه با خطا مواجه شد: ${message}`);
    },
  });

  const handleTabChange = useCallback(
    (_: SyntheticEvent, value: UsersTabValue) => {
      setActiveTab(value);
    },
    []
  );

  const handleToggleIncludeSystem = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setIncludeSystem(event.target.checked);
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
      createOsUserForSamba.reset();
      setSambaCreateInitialUsername(username);
      setIsSambaCreateModalOpen(true);
    },
    [createOsUserForSamba, createSambaUser]
  );

  const handleCloseSambaCreateModal = useCallback(() => {
    setIsSambaCreateModalOpen(false);
    setSambaCreateError(null);
    createSambaUser.reset();
    setSambaCreateInitialUsername(undefined);
    createOsUserForSamba.reset();
  }, [createOsUserForSamba, createSambaUser]);

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
      setSambaCreateError(null);

      const submit = async () => {
        try {
          if (createOsUserFirst) {
            await createOsUserForSamba.mutateAsync({ username });
          }

          await createSambaUser.mutateAsync({ username, password });
        } catch {
          // Errors are handled via the mutation onError callbacks to show in the modal.
        }
      };

      void submit();
    },
    [createOsUserForSamba, createSambaUser]
  );

  const handleToggleSelectSambaUser = useCallback(
    (user: { username: string }, checked: boolean) => {
      setSelectedSambaUsers((prev) => {
        if (checked) {
          if (prev.includes(user.username)) {
            return prev;
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

  const handleEnableSambaUser = useCallback(
    (user: { username: string }) => {
      setPendingEnableUsername(user.username);
      enableSambaUser.mutate(
        { username: user.username },
        {
          onSettled: () => {
            setPendingEnableUsername(null);
          },
        }
      );
    },
    [enableSambaUser]
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
    (payload: { username: string; new_password: string }) => {
      setPendingPasswordUsername(payload.username);
      updateSambaPassword.mutate(payload, {
        onSettled: () => {
          setPendingPasswordUsername(null);
        },
      });
    },
    [updateSambaPassword]
  );

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
        <Tab label="کاربران سیستم عامل" value={USERS_TABS.os} />
        <Tab label="کاربران samba" value={USERS_TABS.samba} />
        <Tab label="سایر کاربران" value={USERS_TABS.other} />
      </Tabs>

      <TabPanel value={USERS_TABS.os} currentValue={activeTab}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeSystem}
                  onChange={handleToggleIncludeSystem}
                  sx={{
                    color: 'var(--color-secondary)',
                    '&.Mui-checked': {
                      color: 'var(--color-primary)',
                    },
                  }}
                />
              }
              label="نمایش کاربران سیستمی"
              sx={{
                '& .MuiTypography-root': {
                  color: 'var(--color-secondary)',
                  fontWeight: 600,
                },
              }}
            />

            <Button
              onClick={handleOpenCreateModal}
              variant="contained"
              sx={{
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

      <TabPanel value={USERS_TABS.samba} currentValue={activeTab}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              مدیریت کاربران Samba
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
              افزودن کاربر Samba
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: 'var(--color-secondary)' }}>
            از جدول زیر می‌توانید کاربران Samba را مشاهده، برای مقایسه انتخاب و
            عملیات فعال‌سازی یا تغییر گذرواژه را انجام دهید.
          </Typography>

          <SambaUsersTable
            users={sambaUsers}
            isLoading={sambaUsersQuery.isLoading || sambaUsersQuery.isFetching}
            error={sambaUsersQuery.error ?? null}
            selectedUsers={selectedSambaUsers}
            onToggleSelect={handleToggleSelectSambaUser}
            onEnable={handleEnableSambaUser}
            onEditPassword={handleOpenPasswordModal}
            pendingEnableUsername={pendingEnableUsername}
            isEnabling={enableSambaUser.isPending}
            pendingPasswordUsername={pendingPasswordUsername}
            isUpdatingPassword={updateSambaPassword.isPending}
          />

          <SelectedSambaUsersDetailsPanel
            items={selectedSambaUserItems}
            onRemove={handleRemoveSelectedSambaUser}
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
        isSubmitting={
          createSambaUser.isPending || createOsUserForSamba.isPending
        }
        errorMessage={sambaCreateError}
        initialUsername={sambaCreateInitialUsername}
      />

      <SambaUserPasswordModal
        open={isPasswordModalOpen}
        username={passwordModalUsername}
        onClose={handleClosePasswordModal}
        onSubmit={handleSubmitPasswordChange}
        isSubmitting={updateSambaPassword.isPending}
        errorMessage={passwordModalError}
      />
    </Box>
  );
};

export default Users;
