import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { FiEdit3 } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
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
  const columns: DataTableColumn<OsUserTableItem>[] = useMemo(
    () => [
      {
        id: 'index',
        header: '#',
        align: 'center',
        width: 64,
        renderCell: (_row, index) => (
          <Typography component="span" sx={{ fontWeight: 600 }}>
            {(index + 1).toLocaleString('en-US')}
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
      // {
      //   id: 'samba-status',
      //   header: 'وضعیت Samba',
      //   align: 'center',
      //   width: 120,
      //   renderCell: (row) => {
      //     if (isSambaStatusLoading && row.hasSambaUser === undefined) {
      //       return (
      //         <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      //           <CircularProgress
      //             size={18}
      //             sx={{ color: 'var(--color-secondary)' }}
      //           />
      //         </Box>
      //       );
      //     }
      //
      //     const iconProps = {
      //       size: 20,
      //     };
      //
      //     if (row.hasSambaUser) {
      //       return (
      //         <Tooltip title="کاربر Samba موجود است" arrow>
      //           <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      //             <MdCheckCircle
      //               {...iconProps}
      //               color="var(--color-success)"
      //               aria-label="دارای کاربر Samba"
      //             />
      //           </Box>
      //         </Tooltip>
      //       );
      //     }
      //
      //     if (row.hasSambaUser === false) {
      //       return (
      //         <Tooltip title="کاربر Samba موجود نیست" arrow>
      //           <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      //             <MdCancel
      //               {...iconProps}
      //               color="var(--color-error)"
      //               aria-label="فاقد کاربر Samba"
      //             />
      //           </Box>
      //         </Tooltip>
      //       );
      //     }
      //
      //     return (
      //       <Tooltip title="نامشخص" arrow>
      //         <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      //           <MdHelpOutline
      //             {...iconProps}
      //             color="var(--color-secondary)"
      //             aria-label="وضعیت نامشخص"
      //           />
      //         </Box>
      //       </Tooltip>
      //     );
      //   },
      // },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 180,
        renderCell: () => (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            <Tooltip title="ویرایش کاربر " arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => alert('edit')}
                  // disabled={updateInterfaceIp.isPending}
                  sx={{
                    color: 'var(--color-primary)',
                    '&.Mui-disabled': {
                      color:
                        'color-mix(in srgb, var(--color-secondary) 45%, transparent)',
                    },
                  }}
                >
                  <FiEdit3 size={18} />
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
    [isSambaStatusLoading, onCreateSambaUser]
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
