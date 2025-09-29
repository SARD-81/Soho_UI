import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  MdCancel,
  MdCheckCircle,
  MdDeleteOutline,
  MdHelpOutline,
  MdPersonAddAlt1,
} from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable.ts';
import type { OsUserTableItem } from '../../@types/users';
import DataTable from '../DataTable';

interface OsUsersTableProps {
  users: OsUserTableItem[];
  isLoading: boolean;
  error: Error | null;
  isSambaStatusLoading: boolean;
  onCreateSambaUser: (user: OsUserTableItem) => void;
}

const OsUsersTable = ({
  users,
  isLoading,
  error,
  isSambaStatusLoading,
  onCreateSambaUser,
}: OsUsersTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
        id: 'samba-status',
        header: 'وضعیت Samba',
        align: 'center',
        width: 120,
        renderCell: (row) => {
          if (isSambaStatusLoading && row.hasSambaUser === undefined) {
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress
                  size={18}
                  sx={{ color: 'var(--color-secondary)' }}
                />
              </Box>
            );
          }

          const iconProps = {
            size: 20,
          };

          if (row.hasSambaUser) {
            return (
              <Tooltip title="کاربر Samba موجود است" arrow>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <MdCheckCircle
                    {...iconProps}
                    color="var(--color-success)"
                    aria-label="دارای کاربر Samba"
                  />
                </Box>
              </Tooltip>
            );
          }

          if (row.hasSambaUser === false) {
            return (
              <Tooltip title="کاربر Samba موجود نیست" arrow>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <MdCancel
                    {...iconProps}
                    color="var(--color-error)"
                    aria-label="فاقد کاربر Samba"
                  />
                </Box>
              </Tooltip>
            );
          }

          return (
            <Tooltip title="نامشخص" arrow>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <MdHelpOutline
                  {...iconProps}
                  color="var(--color-secondary)"
                  aria-label="وضعیت نامشخص"
                />
              </Box>
            </Tooltip>
          );
        },
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 180,
        renderCell: (row) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            <Tooltip title="ایجاد کاربر Samba" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => onCreateSambaUser(row)}
                  disabled={Boolean(row.hasSambaUser) || isSambaStatusLoading}
                  sx={{
                    color: 'var(--color-primary)',
                    '&.Mui-disabled': {
                      color: 'var(--color-secondary)',
                      opacity: 0.7,
                    },
                  }}
                >
                  <MdPersonAddAlt1 size={18} />
                </IconButton>
              </span>
            </Tooltip>
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
          </Box>
        ),
      },
    ],
    [isSambaStatusLoading, onCreateSambaUser, page, rowsPerPage]
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
