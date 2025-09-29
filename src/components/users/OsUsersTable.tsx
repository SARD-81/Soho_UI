import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  MdCancel,
  MdCheckCircle,
  MdDeleteOutline,
  MdPersonAdd,
} from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable.ts';
import type { OsUserTableItem } from '../../@types/users';
import DataTable from '../DataTable';

interface OsUsersTableProps {
  users: OsUserTableItem[];
  isLoading: boolean;
  error: Error | null;
  sambaUsernames: string[];
  onCreateSambaUser: (user: OsUserTableItem) => void;
}

const OsUsersTable = ({
  users,
  isLoading,
  error,
  sambaUsernames,
  onCreateSambaUser,
}: OsUsersTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sambaUsersSet = useMemo(
    () => new Set(sambaUsernames.map((username) => username.trim())),
    [sambaUsernames]
  );

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= users.length) {
      const lastPage = Math.max(Math.ceil(users.length / rowsPerPage) - 1, 0);
      setPage(lastPage);
    }
  }, [page, rowsPerPage, users.length]);

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;

    return users.slice(start, end);
  }, [page, rowsPerPage, users]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const columns: DataTableColumn<OsUserTableItem>[] = useMemo(
    () => [
      {
        id: 'index',
        header: '#',
        align: 'center',
        width: 64,
        renderCell: (_row, index) => (
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {(page * rowsPerPage + index + 1).toLocaleString('fa-IR')}
          </Typography>
        ),
      },
      {
        id: 'username',
        header: 'نام کاربری',
        renderCell: (row) => (
          <Typography
            component="span"
            sx={{ fontWeight: 600, color: 'var(--color-text)' }}
          >
            {row.username}
          </Typography>
        ),
      },
      {
        id: 'samba-user',
        header: 'کاربر Samba',
        align: 'center',
        width: 120,
        renderCell: (row) => {
          const hasSambaUser = sambaUsersSet.has(row.username);

          return (
            <Tooltip
              title={
                hasSambaUser
                  ? 'این کاربر دارای حساب Samba است.'
                  : 'این کاربر حساب Samba ندارد.'
              }
              arrow
            >
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {hasSambaUser ? (
                  <MdCheckCircle size={20} color="var(--color-success)" />
                ) : (
                  <MdCancel size={20} color="var(--color-error)" />
                )}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 168,
        renderCell: (row) => {
          const hasSambaUser = sambaUsersSet.has(row.username);

          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
              <Tooltip title="حذف" arrow>
                <span>
                  <IconButton
                    size="small"
                    disabled
                    sx={{
                      color: 'var(--color-error)',
                      '&.Mui-disabled': {
                        color: 'var(--color-secondary)',
                        opacity: 0.6,
                      },
                    }}
                  >
                    <MdDeleteOutline size={18} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip
                title={
                  hasSambaUser
                    ? 'کاربر Samba موجود است'
                    : 'ایجاد کاربر Samba'
                }
                arrow
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onCreateSambaUser(row)}
                    disabled={hasSambaUser}
                    sx={{
                      color: 'var(--color-primary)',
                      '&.Mui-disabled': {
                        color: 'var(--color-secondary)',
                        opacity: 0.7,
                      },
                    }}
                  >
                    <MdPersonAdd size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [onCreateSambaUser, page, rowsPerPage, sambaUsersSet]
  );

  return (
    <DataTable<OsUserTableItem>
      columns={columns}
      data={paginatedUsers}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      error={error}
      pagination={{
        page,
        rowsPerPage,
        count: users.length,
        onPageChange: handleChangePage,
        onRowsPerPageChange: handleChangeRowsPerPage,
        rowsPerPageOptions: [5, 10, 25],
        labelRowsPerPage: 'ردیف در هر صفحه',
        labelDisplayedRows: ({ from, to, count }) => {
          const localizedFrom = from.toLocaleString('fa-IR');
          const localizedTo = to.toLocaleString('fa-IR');
          const localizedCount =
            count !== -1
              ? count.toLocaleString('fa-IR')
              : `بیش از ${localizedTo}`;

          return `${localizedFrom}–${localizedTo} از ${localizedCount}`;
        },
        rowCountFormatter: (count) =>
          `تعداد کل کاربران: ${count.toLocaleString('fa-IR')}`,
      }}
    />
  );
};

export default OsUsersTable;
