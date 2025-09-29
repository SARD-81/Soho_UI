import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
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
  const columns: DataTableColumn<OsUserTableItem>[] = useMemo(
    () => [
      {
        id: 'index',
        header: 'ردیف',
        align: 'center',
        width: 80,
        renderCell: (_row, index) => index + 1,
      },
      {
        id: 'username',
        header: 'نام کاربری',
        renderCell: (row) => (
          <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {row.username}
          </Typography>
        ),
      },
      {
        id: 'fullName',
        header: 'نام کامل',
        renderCell: (row) => row.fullName ?? '—',
      },
      {
        id: 'uid',
        header: 'UID',
        renderCell: (row) => row.uid ?? '—',
      },
      {
        id: 'gid',
        header: 'GID',
        renderCell: (row) => row.gid ?? '—',
      },
      {
        id: 'homeDirectory',
        header: 'مسیر خانه',
        renderCell: (row) => (
          <Typography sx={{ direction: 'ltr', textAlign: 'left' }}>
            {row.homeDirectory ?? '—'}
          </Typography>
        ),
      },
      {
        id: 'loginShell',
        header: 'پوسته ورود',
        renderCell: (row) => (
          <Typography sx={{ direction: 'ltr', textAlign: 'left' }}>
            {row.loginShell ?? '—'}
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
            <Tooltip title="حذف">
              <IconButton size="small" color="error" disabled>
                <MdDeleteOutline size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <DataTable<OsUserTableItem>
      columns={columns}
      data={users}
      getRowId={(row) => row.id}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default OsUsersTable;
