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
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';
import type { CreateOsUserPayload } from '../@types/users';
import { USERS_TABS, type UsersTabValue } from '../constants/users';
import OsUserCreateModal from '../components/users/OsUserCreateModal';
import OsUsersTable from '../components/users/OsUsersTable';
import { useCreateOsUser } from '../hooks/useCreateOsUser';
import { useOsUsers } from '../hooks/useOsUsers';
import { normalizeOsUsers } from '../utils/osUsers';

const TabPanel = ({
  value,
  currentValue,
  children,
}: {
  value: UsersTabValue;
  currentValue: UsersTabValue;
  children: ReactNode;
}) => {
  if (value !== currentValue) {
    return null;
  }

  return <Box sx={{ mt: 3 }}>{children}</Box>;
};

const Users = () => {
  const [activeTab, setActiveTab] = useState<UsersTabValue>(USERS_TABS.os);
  const [includeSystem, setIncludeSystem] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const osUsersQuery = useOsUsers({
    includeSystem,
    enabled: activeTab === USERS_TABS.os,
  });

  const osUsers = useMemo(
    () => normalizeOsUsers(osUsersQuery.data?.data),
    [osUsersQuery.data?.data]
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
            users={osUsers}
            isLoading={osUsersQuery.isLoading || osUsersQuery.isFetching}
            error={osUsersQuery.error ?? null}
          />
        </Box>
      </TabPanel>

      <TabPanel value={USERS_TABS.samba} currentValue={activeTab}>
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          مدیریت کاربران Samba به‌زودی افزوده می‌شود.
        </Typography>
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
    </Box>
  );
};

export default Users;
