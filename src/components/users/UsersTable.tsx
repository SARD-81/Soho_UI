import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import type { DataTableColumn } from '../../@types/dataTable';
import type { UserValue } from '../../@types/user';
import DataTable from '../DataTable';

interface UserTableRow {
  id: string;
  data: Record<string, UserValue>;
}

interface UsersTableProps {
  users: UserTableRow[];
  isLoading: boolean;
  error: Error | null;
}

const formatUserValue = (value: UserValue) => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'بله' : 'خیر';
  }

  if (Array.isArray(value)) {
    return value.map((item) => (item ?? '—').toString()).join(', ');
  }

  return String(value);
};

const UsersTable = ({ users, isLoading, error }: UsersTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columnKeys = useMemo(() => {
    const keys = new Set<string>();

    users.forEach((user) => {
      Object.keys(user.data).forEach((key) => {
        keys.add(key);
      });
    });

    return Array.from(keys).sort((a, b) => a.localeCompare(b, 'fa'));
  }, [users]);

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

  const columns = useMemo<DataTableColumn<UserTableRow>[]>(() => {
    const indexColumn: DataTableColumn<UserTableRow> = {
      id: 'user-index',
      header: '#',
      align: 'center',
      width: 64,
      renderCell: (_row, index) => (
        <Typography component="span" sx={{ fontWeight: 500 }}>
          {(page * rowsPerPage + index + 1).toLocaleString('fa-IR')}
        </Typography>
      ),
    };

    const dynamicColumns = columnKeys.map<DataTableColumn<UserTableRow>>((key) => ({
      id: key,
      header: key,
      renderCell: (row) => (
        <Typography component="span" sx={{ color: 'var(--color-text)' }}>
          {formatUserValue(row.data[key])}
        </Typography>
      ),
    }));

    const actionColumn: DataTableColumn<UserTableRow> = {
      id: 'user-actions',
      header: 'عملیات',
      align: 'center',
      width: 96,
      renderCell: () => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Tooltip title="حذف" arrow>
            <span>
              <IconButton
                size="small"
                disabled
                sx={{ color: 'var(--color-error)', opacity: 0.6 }}
              >
                <FiTrash2 size={18} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    };

    return [indexColumn, ...dynamicColumns, actionColumn];
  }, [columnKeys, page, rowsPerPage]);

  return (
    <DataTable<UserTableRow>
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
            count !== -1 ? count.toLocaleString('fa-IR') : `بیش از ${localizedTo}`;

          return `${localizedFrom}–${localizedTo} از ${localizedCount}`;
        },
        rowCountFormatter: (count) =>
          `تعداد کل کاربران: ${count.toLocaleString('fa-IR')}`,
      }}
    />
  );
};

export type { UserTableRow };
export default UsersTable;
