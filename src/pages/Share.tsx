import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import type { SambaShareEntry } from '../@types/samba';
import TabPanel from '../components/TabPanel';
import CreateShareModal from '../components/share/CreateShareModal';
import SelectedSharesDetailsPanel from '../components/share/SelectedSharesDetailsPanel';
import SharesTable from '../components/share/SharesTable';
import SambaUserCreateModal from '../components/users/SambaUserCreateModal';
import SambaUserPasswordModal from '../components/users/SambaUserPasswordModal';
import SambaUsersTable from '../components/users/SambaUsersTable';
import SelectedSambaUsersDetailsPanel from '../components/users/SelectedSambaUsersDetailsPanel';
import { DEFAULT_LOGIN_SHELL } from '../constants/users';
import { useCreateOsUser } from '../hooks/useCreateOsUser';
import { useCreateSambaUser } from '../hooks/useCreateSambaUser';
import { useCreateShare } from '../hooks/useCreateShare';
import { useDeleteShare } from '../hooks/useDeleteShare';
import { useEnableSambaUser } from '../hooks/useEnableSambaUser';
import { useSambaShares } from '../hooks/useSambaShares';
import { useSambaUsers } from '../hooks/useSambaUsers';
import { useServiceAction } from '../hooks/useServiceAction';
import { useUpdateSambaUserPassword } from '../hooks/useUpdateSambaUserPassword';
import { normalizeSambaUsers } from '../utils/sambaUsers';

const SHARE_TABS = {
  shares: 'shares',
  sambaUsers: 'samba-users',
} as const;

type ShareTabValue = (typeof SHARE_TABS)[keyof typeof SHARE_TABS];

const Share = () => {
  const [activeTab, setActiveTab] = useState<ShareTabValue>(SHARE_TABS.shares);
  const [selectedShares, setSelectedShares] = useState<string[]>([]);
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

  const { data: shares = [], isLoading, error } = useSambaShares();

  const createShare = useCreateShare({
    onSuccess: (shareName) => {
      toast.success(`اشتراک ${shareName} با موفقیت ایجاد شد.`);
      handleRestartSmbd();
    },
    onError: (message) => {
      toast.error(`ایجاد اشتراک با خطا مواجه شد: ${message}`);
    },
  });

  const deleteShare = useDeleteShare({
    onSuccess: (shareName) => {
      toast.success(`اشتراک ${shareName} با موفقیت حذف شد.`);
    },
    onError: (deleteError, shareName) => {
      toast.error(
        `حذف اشتراک ${shareName} با خطا مواجه شد: ${deleteError.message}`
      );
    },
  });

  const handleTabChange = useCallback(
    (_: SyntheticEvent, value: ShareTabValue) => {
      setActiveTab(value);
    },
    []
  );

  const serviceAction = useServiceAction({
    onSuccess: ({ service }) => {
      toast.success(`سرویس ${service} با موفقیت راه‌اندازی مجدد شد.`);
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
      deleteShare.deleteShare(share.name);
    },
    [deleteShare]
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

  const sambaUsers = useMemo(
    () => normalizeSambaUsers(sambaUsersQuery.data?.data),
    [sambaUsersQuery.data?.data]
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
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
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
        <Tab label="اشتراک‌ها" value={SHARE_TABS.shares} />
        <Tab label="کاربران اشتراک فایل" value={SHARE_TABS.sambaUsers} />
      </Tabs>

      <TabPanel value={SHARE_TABS.shares} currentValue={activeTab}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                '&:hover': {
                  background:
                    'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
                },
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
            pendingShareName={deleteShare.pendingShareName}
            isDeleting={deleteShare.isDeleting}
          />

          <SelectedSharesDetailsPanel
            items={comparisonItems}
            onRemove={handleRemoveSelected}
          />
        </Box>
      </TabPanel>

      <TabPanel value={SHARE_TABS.sambaUsers} currentValue={activeTab}>
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
              افزودن کاربر
            </Button>
          </Box>

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

      <CreateShareModal controller={createShare} />

      <SambaUserCreateModal
        open={isSambaCreateModalOpen}
        onClose={handleCloseSambaCreateModal}
        onSubmit={handleSubmitCreateSambaUser}
        isSubmitting={createSambaUser.isPending}
        errorMessage={sambaCreateError}
        initialUsername={sambaCreateInitialUsername}
      />

      <SambaUserPasswordModal
        open={isPasswordModalOpen}
        username={passwordModalUsername}
        onClose={handleClosePasswordModal}
        onSubmit={handleSubmitPasswordChange}
        errorMessage={passwordModalError}
        isSubmitting={updateSambaPassword.isPending}
        pendingUsername={pendingPasswordUsername}
      />
    </Box>
  );
};

export default Share;
