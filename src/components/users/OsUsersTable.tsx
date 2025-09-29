import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable.ts';
import type { OsUserTableItem } from '../../@types/users';
import DataTable from '../DataTable';

interface OsUsersTableProps {
  users: OsUserTableItem[];
  isLoading: boolean;
  error: Error | null;
}

const OsUsersTable = ({ users, isLoading, error }: OsUsersTableProps) => {
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
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 120,
        renderCell: () => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
    [page, rowsPerPage]
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
