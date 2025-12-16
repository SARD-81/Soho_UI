import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiKey, FiTrash2 } from 'react-icons/fi';
import type { DataTableColumn } from '../../@types/dataTable';
import type {
  CreateWebUserPayload,
  UpdateWebUserPasswordPayload,
  UpdateWebUserPayload,
} from '../../@types/users';
import DataTable from '../DataTable';
import ConfirmDeleteWebUserModal from './ConfirmDeleteWebUserModal';
import WebUserCreateModal from './WebUserCreateModal';
import { useWebUsers } from '../../hooks/useWebUsers';
import { useCreateWebUser } from '../../hooks/useCreateWebUser';
import { useDeleteWebUser } from '../../hooks/useDeleteWebUser';
import { useCreateOsUser } from '../../hooks/useCreateOsUser';
import { useUpdateWebUserPassword } from '../../hooks/useUpdateWebUserPassword';
import { useUpdateWebUser } from '../../hooks/useUpdateWebUser';
import WebUserPasswordModal from './WebUserPasswordModal';
import WebUserUpdateModal from './WebUserUpdateModal';
import { DEFAULT_LOGIN_SHELL } from '../../constants/users';
import { formatUtcDateTimeToIran } from '../../utils/dateTime';

interface UserSettingsTableRow {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
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
  const [deleteTarget, setDeleteTarget] = useState<UserSettingsTableRow | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [passwordModalUsername, setPasswordModalUsername] = useState<string | null>(
    null
  );
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [updateTarget, setUpdateTarget] = useState<UserSettingsTableRow | null>(
    null
  );
  const [updateError, setUpdateError] = useState<string | null>(null);

  const createOsUser = useCreateOsUser();

  const createUser = useCreateWebUser({
    onSuccess: (username) => {
      toast.success(`کاربر ${username} با موفقیت ایجاد شد.`);
      setIsCreateModalOpen(false);
      setCreateError(null);
      createOsUser.mutate({
        username,
        login_shell: DEFAULT_LOGIN_SHELL,
        shell: DEFAULT_LOGIN_SHELL,
      });
    },
    onError: (message) => {
      setCreateError(message);
      toast.error(`ایجاد کاربر با خطا مواجه شد: ${message}`);
    },
  });

  const deleteUser = useDeleteWebUser({
    onSuccess: (username) => {
      toast.success(`کاربر ${username} با موفقیت حذف شد.`);
      setDeleteTarget(null);
      setDeleteError(null);
    },
    onError: (message, username) => {
      setDeleteError(message);
      toast.error(`حذف کاربر ${username} با خطا مواجه شد: ${message}`);
    },
  });

  const updatePassword = useUpdateWebUserPassword({
    onSuccess: (username) => {
      toast.success(`گذرواژه کاربر ${username} بروزرسانی شد.`);
      setPasswordModalUsername(null);
      setPasswordError(null);
    },
    onError: (message, username) => {
      setPasswordError(message);
      toast.error(`تغییر گذرواژه ${username} با خطا مواجه شد: ${message}`);
    },
  });

  const updateUser = useUpdateWebUser({
    onSuccess: (username) => {
      toast.success(`اطلاعات کاربر ${username} بروزرسانی شد.`);
      setUpdateTarget(null);
      setUpdateError(null);
    },
    onError: (message, username) => {
      setUpdateError(message);
      toast.error(`بروزرسانی ${username} با خطا مواجه شد: ${message}`);
    },
  });

  const rows = useMemo<UserSettingsTableRow[]>(() => {
    return (usersQuery.data ?? [])
      .map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name ?? '',
        lastName: user.last_name ?? '',
        dateJoined: formatUtcDateTimeToIran(user.date_joined) ?? '—',
      }))
      .sort((a, b) =>
        a.username.localeCompare(b.username, 'en', { sensitivity: 'base' })
      );
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

  const handleRequestDeleteUser = useCallback((row: UserSettingsTableRow) => {
    const normalizedUsername = row.username.trim().toLowerCase();

    if (normalizedUsername === ADMIN_USERNAME) {
      toast.error('امکان حذف کاربر مدیر وجود ندارد.');
      return;
    }

    setDeleteError(null);
    setDeleteTarget(row);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteTarget(null);
    setDeleteError(null);
  }, []);

  const handleConfirmDeleteUser = useCallback(() => {
    if (!deleteTarget || deleteUser.isPending) {
      return;
    }

    setDeleteError(null);
    deleteUser.mutate(deleteTarget.username);
  }, [deleteTarget, deleteUser]);

  const deletingUsername = deleteUser.isPending
    ? deleteUser.variables?.toLowerCase() ?? null
    : null;

  const handleOpenPasswordModal = useCallback(
    (username: string) => {
      setPasswordError(null);
      updatePassword.reset();
      setPasswordModalUsername(username);
    },
    [updatePassword]
  );

  const handleClosePasswordModal = useCallback(() => {
    setPasswordModalUsername(null);
    setPasswordError(null);
  }, []);

  const handleSubmitPassword = useCallback(
    (payload: UpdateWebUserPasswordPayload) => {
      setPasswordError(null);
      updatePassword.mutate(payload);
    },
    [updatePassword]
  );

  const handleOpenUpdateModal = useCallback((row: UserSettingsTableRow) => {
    setUpdateError(null);
    updateUser.reset();
    setUpdateTarget(row);
  }, [updateUser]);

  const handleCloseUpdateModal = useCallback(() => {
    setUpdateTarget(null);
    setUpdateError(null);
  }, []);

  const handleSubmitUpdateUser = useCallback(
    (payload: UpdateWebUserPayload) => {
      setUpdateError(null);
      updateUser.mutate(payload);
    },
    [updateUser]
  );

  const updateInitialValues = useMemo(
    () => ({
      email: updateTarget?.email ?? '',
      first_name: updateTarget?.firstName ?? '',
      last_name: updateTarget?.lastName ?? '',
    }),
    [updateTarget]
  );

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
        width: 180,
        renderCell: (row) => {
          const normalizedUsername = row.username.trim().toLowerCase();
          const isAdmin = normalizedUsername === ADMIN_USERNAME;
          const isDeleting =
            deleteUser.isPending && deletingUsername === normalizedUsername;
          const isDisabled = isAdmin || isDeleting;

          return (
            <Stack direction="row" spacing={1} justifyContent="center">
              <Tooltip title="تغییر گذرواژه" placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenPasswordModal(row.username)}
                    disabled={isDeleting}
                    sx={{
                      color: 'var(--color-primary)',
                      opacity: isDeleting ? 0.6 : 1,
                      '&:hover': {
                        backgroundColor: 'rgba(31, 182, 255, 0.08)',
                      },
                      '&.Mui-disabled': { color: 'var(--color-secondary)' },
                    }}
                  >
                    <FiKey size={18} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="ویرایش اطلاعات" placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenUpdateModal(row)}
                    disabled={isDeleting}
                    sx={{
                      color: 'var(--color-warning)',
                      opacity: isDeleting ? 0.6 : 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 193, 7, 0.12)',
                      },
                      '&.Mui-disabled': { color: 'var(--color-secondary)' },
                    }}
                  >
                    <FiEdit2 size={18} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip
                title={
                  isAdmin ? 'کاربر مدیر قابل حذف نیست.' : 'حذف کاربر'
                }
                placement="top"
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleRequestDeleteUser(row)}
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
            </Stack>
          );
        },
      },
    ],
    [
      deleteUser.isPending,
      deletingUsername,
      handleOpenPasswordModal,
      handleOpenUpdateModal,
      handleRequestDeleteUser,
    ]
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

      <ConfirmDeleteWebUserModal
        open={Boolean(deleteTarget)}
        username={deleteTarget?.username ?? null}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteUser}
        isDeleting={deleteUser.isPending}
        errorMessage={deleteError}
      />

      <WebUserPasswordModal
        open={Boolean(passwordModalUsername)}
        username={passwordModalUsername}
        onClose={handleClosePasswordModal}
        onSubmit={handleSubmitPassword}
        isSubmitting={updatePassword.isPending}
        errorMessage={passwordError}
      />

      <WebUserUpdateModal
        open={Boolean(updateTarget)}
        username={updateTarget?.username ?? null}
        initialValues={updateInitialValues}
        onClose={handleCloseUpdateModal}
        onSubmit={(payload) =>
          handleSubmitUpdateUser({
            ...payload,
            username: updateTarget?.username ?? '',
          })
        }
        isSubmitting={updateUser.isPending}
        errorMessage={updateError}
      />
    </Box>
  );
};

export default UserSettingsTable;