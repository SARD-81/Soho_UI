import { Box, Button, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { UserValue } from '../@types/user';
import CreateUserModal from '../components/users/CreateUserModal';
import UsersTable from '../components/users/UsersTable';
import { useCreateUser } from '../hooks/useCreateUser';
import { useUsers } from '../hooks/useUsers';

const Users = () => {
  const usersQuery = useUsers();

  const createUser = useCreateUser({
    onSuccess: (username) => {
      toast.success(`کاربر ${username} با موفقیت ایجاد شد.`);
    },
    onError: (message) => {
      toast.error(`ایجاد کاربر با خطا مواجه شد: ${message}`);
    },
  });
  const { openCreateModal } = createUser;

  const users = useMemo(() => {
    const data = usersQuery.data?.data ?? [];

    return data.map((entry, index) => {
      const normalizedEntry = Object.entries(entry ?? {}).reduce<
        Record<string, UserValue>
      >((accumulator, [key, value]) => {
        accumulator[key] = value;
        return accumulator;
      }, {});

      const username = normalizedEntry.username;
      const rowId =
        typeof username === 'string' && username.trim()
          ? username.trim()
          : `user-${index + 1}`;

      return {
        id: rowId,
        data: normalizedEntry,
      };
    });
  }, [usersQuery.data?.data]);

  const handleOpenCreate = useCallback(() => {
    openCreateModal();
  }, [openCreateModal]);

  return (
    <Box sx={{ p: 3, fontFamily: 'var(--font-vazir)' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
          >
            مدیریت کاربران
          </Typography>

          <Button
            onClick={handleOpenCreate}
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
            ایجاد کاربر جدید
          </Button>
        </Box>

        <UsersTable
          users={users}
          isLoading={usersQuery.isLoading}
          error={usersQuery.error ?? null}
        />
      </Box>

      <CreateUserModal controller={createUser} />
    </Box>
  );
};

export default Users;
