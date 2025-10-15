import { Box, Checkbox, IconButton, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline, MdLockOpen, MdLockReset } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { SambaUserTableItem } from '../../@types/samba';
import DataTable from '../DataTable';

interface SambaUsersTableProps {
  users: SambaUserTableItem[];
  isLoading: boolean;
  error: Error | null;
  selectedUsers: string[];
  onToggleSelect: (user: SambaUserTableItem, checked: boolean) => void;
  onEnable: (user: SambaUserTableItem) => void;
  onEditPassword: (user: SambaUserTableItem) => void;
  onDelete: (user: SambaUserTableItem) => void;
  pendingEnableUsername: string | null;
  isEnabling: boolean;
  pendingPasswordUsername: string | null;
  isUpdatingPassword: boolean;
  pendingDeleteUsername: string | null;
  isDeleting: boolean;
}

const valueOrDash = (value?: string) => (value && value.trim() ? value : '-');

const SambaUsersTable = ({
  users,
  isLoading,
  error,
  selectedUsers,
  onToggleSelect,
  onEnable,
  onEditPassword,
  onDelete,
  pendingEnableUsername,
  isEnabling,
  pendingPasswordUsername,
  isUpdatingPassword,
  pendingDeleteUsername,
  isDeleting,
}: SambaUsersTableProps) => {
  const columns = useMemo<DataTableColumn<SambaUserTableItem>[]>(() => {
    return [
      {
        id: 'select',
        header: '',
        align: 'center',
        padding: 'checkbox',
        width: 52,
        headerSx: { width: 52 },
        cellSx: { width: 52 },
        getCellProps: () => ({ padding: 'checkbox' }),
        renderCell: (user) => (
          <Checkbox
            checked={selectedUsers.includes(user.username)}
            onChange={(event) => onToggleSelect(user, event.target.checked)}
            color="primary"
            inputProps={{ 'aria-label': `انتخاب ${user.username}` }}
          />
        ),
      },
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
      // {
      //   id: 'domain',
      //   header: 'دامنه',
      //   align: 'left',
      //   renderCell: (user) => (
      //     <Typography sx={{ color: 'var(--color-text)' }}>
      //       {valueOrDash(user.domain)}
      //     </Typography>
      //   ),
      // },
      // {
      //   id: 'profile-path',
      //   header: 'مسیر پروفایل',
      //   align: 'left',
      //   renderCell: (user) => (
      //     <Typography
      //       sx={{
      //         color: 'var(--color-text)',
      //         direction: 'ltr',
      //         wordBreak: 'break-all',
      //         fontFamily: 'var(--font-vazir)',
      //       }}
      //     >
      //       {valueOrDash(user.profilePath)}
      //     </Typography>
      //   ),
      // },
      {
        id: 'password-must-change',
        header: 'تغییر اجباری گذرواژه',
        align: 'left',
        renderCell: (user) => (
          <Typography sx={{ color: 'var(--color-text)' }}>
            {valueOrDash(user.passwordMustChange)}
          </Typography>
        ),
      },
      {
        id: 'logon-time',
        header: 'Logon time',
        align: 'left',
        renderCell: (user) => (
          <Typography sx={{ color: 'var(--color-text)' }}>
            {valueOrDash(user.logonTime)}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 168,
        renderCell: (user) => {
          const isEnablePending =
            isEnabling && pendingEnableUsername === user.username;
          const isPasswordPending =
            isUpdatingPassword && pendingPasswordUsername === user.username;
          const isDeletePending =
            isDeleting && pendingDeleteUsername === user.username;

          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
              <Tooltip title="حذف" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(user)}
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

              <Tooltip title="فعال‌سازی کاربر" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onEnable(user)}
                    disabled={isEnablePending}
                    sx={{
                      color: 'var(--color-success)',
                      '&.Mui-disabled': {
                        color: 'var(--color-secondary)',
                        opacity: 0.7,
                      },
                    }}
                  >
                    <MdLockOpen size={18} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="تغییر گذرواژه" arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onEditPassword(user)}
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
      isEnabling,
      isUpdatingPassword,
      onEditPassword,
      onEnable,
      onDelete,
      onToggleSelect,
      pendingEnableUsername,
      pendingDeleteUsername,
      pendingPasswordUsername,
      selectedUsers,
    ]);

  return (
    <DataTable<SambaUserTableItem>
      columns={columns}
      data={users}
      getRowId={(user) => user.id}
      isLoading={isLoading}
      error={error}
      renderLoadingState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          در حال دریافت اطلاعات کاربران اشتراک فایل...
        </Typography>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)', py: 3 }}>
          خطا در دریافت کاربران اشتراک فایل: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          کاربری برای نمایش وجود ندارد.
        </Typography>
      )}
    />
  );
};

export default SambaUsersTable;
