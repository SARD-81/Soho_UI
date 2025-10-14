import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import type { DataTableColumn } from '../../@types/dataTable';
import type { CreateWebUserPayload } from '../../@types/users';
import DataTable from '../DataTable';
import WebUserCreateModal from './WebUserCreateModal';
import { useWebUsers } from '../../hooks/useWebUsers';
import { useCreateWebUser } from '../../hooks/useCreateWebUser';
import { useDeleteWebUser } from '../../hooks/useDeleteWebUser';
import { formatUtcDateTimeToIran } from '../../utils/dateTime';

interface UserSettingsTableRow {
  id: number;
  username: string;
  email: string;
  dateJoined: string;
}

const ADMIN_USERNAME = 'admin';

const createButtonSx = {
  px: 3,
  py: 1.25,
  borderRadius: '3px',
  fontWeight: 700,
  fontSize: '0.95rem',
  background:
    'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
  color: 'var(--color-bg)',
  boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
};

const UserSettingsTable = () => {
  const usersQuery = useWebUsers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const createUser = useCreateWebUser({
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

  const deleteUser = useDeleteWebUser({
    onSuccess: (username) => {
      toast.success(`کاربر ${username} با موفقیت حذف شد.`);
    },
    onError: (message, username) => {
      toast.error(`حذف کاربر ${username} با خطا مواجه شد: ${message}`);
    },
  });

  const rows = useMemo<UserSettingsTableRow[]>(() => {
    return (usersQuery.data ?? []).map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      dateJoined: formatUtcDateTimeToIran(user.date_joined) ?? '—',
    }));
  }, [usersQuery.data]);

  const existingUsernames = useMemo(
    () => rows.map((row) => row.username).filter((name) => name.trim().length > 0),
    [rows]
  );

  const handleOpenCreateModal = useCallback(() => {
    setCreateError(null);
    createUser.reset();
    setIsCreateModalOpen(true);
  }, [createUser]);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setCreateError(null);
    createUser.reset();
  }, [createUser]);

  const handleCreateUser = useCallback(
    (payload: CreateWebUserPayload) => {
      setCreateError(null);
      createUser.mutate(payload);
    },
    [createUser]
  );

  const handleDeleteUser = useCallback(
    (row: UserSettingsTableRow) => {
      const normalizedUsername = row.username.trim().toLowerCase();

      if (normalizedUsername === ADMIN_USERNAME) {
        toast.error('امکان حذف کاربر مدیر وجود ندارد.');
        return;
      }

      deleteUser.mutate(row.username);
    },
    [deleteUser]
  );

  const deletingUsername = deleteUser.isPending
    ? deleteUser.variables?.toLowerCase() ?? null
    : null;

  const columns = useMemo<DataTableColumn<UserSettingsTableRow>[]>(
    () => [
      {
        id: 'id',
        header: 'شناسه',
        align: 'center',
        width: 96,
        renderCell: (row) => (
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {row.id}
          </Typography>
        ),
      },
      {
        id: 'username',
        header: 'نام کاربری',
        align: 'center',
        renderCell: (row) => (
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {row.username}
          </Typography>
        ),
      },
      {
        id: 'email',
        header: 'ایمیل',
        align: 'center',
        renderCell: (row) => (
          <Typography component="span" sx={{ color: 'var(--color-secondary)' }}>
            {row.email?.trim() ? row.email : '—'}
          </Typography>
        ),
      },
      {
        id: 'date-joined',
        header: 'تاریخ ایجاد',
        align: 'center',
        renderCell: (row) => (
          <Typography component="span" sx={{ color: 'var(--color-secondary)' }}>
            {row.dateJoined}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 120,
        renderCell: (row) => {
          const normalizedUsername = row.username.trim().toLowerCase();
          const isAdmin = normalizedUsername === ADMIN_USERNAME;
          const isDeleting =
            deleteUser.isPending && deletingUsername === normalizedUsername;
          const isDisabled = isAdmin || isDeleting;

          return (
            <Tooltip
              title={
                isAdmin ? 'کاربر مدیر قابل حذف نیست.' : 'حذف کاربر'
              }
              placement="top"
            >
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteUser(row)}
                  disabled={isDisabled}
                  sx={{
                    color: 'var(--color-error)',
                    opacity: isAdmin ? 0.4 : isDeleting ? 0.6 : 1,
                    transition: 'opacity 0.2s ease',
                    '&:hover': {
                      color: 'var(--color-error)',
                      backgroundColor: 'rgba(255, 0, 0, 0.08)',
                    },
                    '&.Mui-disabled': {
                      color: 'var(--color-secondary)',
                    },
                  }}
                >
                  <FiTrash2 size={18} />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
    ],
    [deleteUser.isPending, deletingUsername, handleDeleteUser]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{ color: 'var(--color-primary)', fontWeight: 700 }}>
          مدیریت کاربران وب
        </Typography>

        <Button
          onClick={handleOpenCreateModal}
          sx={createButtonSx}
          variant="contained"
        >
          ایجاد کاربر
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id.toString()}
        isLoading={usersQuery.isLoading}
        error={usersQuery.error ?? null}
        containerSx={{ borderRadius: '8px' }}
      />

      <WebUserCreateModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateUser}
        isSubmitting={createUser.isPending}
        errorMessage={createError}
        existingUsernames={existingUsernames}
      />
    </Box>
  );
};

export default UserSettingsTable;
