import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import {
  MdDeleteOutline,
  MdLockOpen,
  MdLockOutline,
  MdLockReset,
} from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type {
  SambaUserAccountStatus,
  SambaUserTableItem,
} from '../../@types/samba';
import DataTable from '../DataTable';

interface SambaUsersTableProps {
  detailViewId: string;
  users: SambaUserTableItem[];
  isLoading: boolean;
  error: Error | null;
  onToggleStatus: (user: SambaUserTableItem) => void;
  onEditPassword: (user: SambaUserTableItem) => void;
  onDelete: (user: SambaUserTableItem) => void;
  statusByUsername: Record<string, SambaUserAccountStatus>;
  isStatusLoading: boolean;
  pendingStatusUsername: string | null;
  isUpdatingStatus: boolean;
  pendingPasswordUsername: string | null;
  isUpdatingPassword: boolean;
  pendingDeleteUsername: string | null;
  isDeleting: boolean;
}

const SambaUsersTable = ({
  detailViewId,
  users,
  isLoading,
  error,
  onToggleStatus,
  onEditPassword,
  onDelete,
  statusByUsername,
  isStatusLoading,
  pendingStatusUsername,
  isUpdatingStatus,
  pendingPasswordUsername,
  isUpdatingPassword,
  pendingDeleteUsername,
  isDeleting,
}: SambaUsersTableProps) => {
  const columns = useMemo<DataTableColumn<SambaUserTableItem>[]>(() => {
    return [
      {
        id: 'index',
        header: '#',
        align: 'center',
        width: 60,
        renderCell: (_user, index) => (
          <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {index + 1}
          </Typography>
        ),
      },
      {
        id: 'username',
        header: 'نام کاربری',
        align: 'left',
        renderCell: (user) => (
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {user.username}
          </Typography>
        ),
      },
      {
        id: 'passLastSet',
        header: 'آخرین زمان تغییر گذرواژه',
        align: 'left',
        renderCell: (user) => (
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {user.passwordLastSet}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 168,
        renderCell: (user) => {
          const status = statusByUsername[user.username] ?? 'unknown';
          const toggleAction = status === 'enabled' ? 'disable' : 'enable';
          const toggleTooltip =
            status === 'enabled' ? 'غیرفعال‌سازی کاربر' : 'فعال‌سازی کاربر';
          const isStatusPending =
            isUpdatingStatus && pendingStatusUsername === user.username;
          const isPasswordPending =
            isUpdatingPassword && pendingPasswordUsername === user.username;
          const isDeletePending =
            isDeleting && pendingDeleteUsername === user.username;

          const resolveToggleIcon = () => {
            if (toggleAction === 'disable') {
              return <MdLockOutline size={18} />;
            }

            return <MdLockOpen size={18} />;
          };

          const resolveToggleColor = () => {
            if (toggleAction === 'disable') {
              return 'var(--color-error)';
            }

            return 'var(--color-success)';
          };

          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
              <Tooltip title="حذف" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(user);
                    }}
                    disabled={isDeleting}
                    sx={{
                      color: 'var(--color-error)',
                      '&.Mui-disabled': {
                        color: 'var(--color-secondary)',
                        opacity: isDeletePending ? 0.6 : 0.4,
                      },
                    }}
                  >
                    <MdDeleteOutline size={18} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={toggleTooltip} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleStatus(user);
                    }}
                    disabled={isStatusPending || isStatusLoading}
                    sx={{
                      color: resolveToggleColor(),
                      '&.Mui-disabled': {
                        color: 'var(--color-secondary)',
                        opacity: 0.7,
                      },
                    }}
                  >
                    {resolveToggleIcon()}
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="تغییر گذرواژه" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditPassword(user);
                    }}
                    disabled={isPasswordPending}
                    sx={{
                      color: 'var(--color-primary)',
                      '&.Mui-disabled': {
                        color: 'var(--color-secondary)',
                        opacity: 0.7,
                      },
                    }}
                  >
                    <MdLockReset size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, [
    isDeleting,
    isStatusLoading,
    isUpdatingStatus,
    isUpdatingPassword,
    onDelete,
    onEditPassword,
    onToggleStatus,
    pendingDeleteUsername,
    pendingStatusUsername,
    pendingPasswordUsername,
    statusByUsername,
  ]);

  const handleRowClick = useCallback((user: SambaUserTableItem) => user, []);

  return (
    <DataTable<SambaUserTableItem>
      detailViewId={detailViewId}
      columns={columns}
      data={users}
      getRowId={(user) => user.username}
      isLoading={isLoading}
      error={error}
      onRowClick={handleRowClick}
      bodyRowSx={{
        transition: 'background-color 0.2s ease',
      }}
    />
  );
};

export default SambaUsersTable;