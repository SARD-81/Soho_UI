import {
  Box,
  Checkbox,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { SambaShareEntry } from '../../@types/samba';
import DataTable from '../DataTable';

interface SharesTableProps {
  shares: SambaShareEntry[];
  isLoading: boolean;
  error: Error | null;
  selectedShares: string[];
  onToggleSelect: (share: SambaShareEntry, checked: boolean) => void;
  onDelete: (share: SambaShareEntry) => void;
  pendingShareName: string | null;
  isDeleting: boolean;
}

const SharesTable = ({
  shares,
  isLoading,
  error,
  selectedShares,
  onToggleSelect,
  onDelete,
  pendingShareName,
  isDeleting,
}: SharesTableProps) => {
  const columns = useMemo<DataTableColumn<SambaShareEntry>[]>(() => {
    // const resolvePath = (share: SambaShareEntry) => {
    //   const { details } = share;
    //   const rawPath =
    //     (typeof details.path === 'string' && details.path.trim()) ||
    //     (typeof details.full_path === 'string' && details.full_path.trim());
    //
    //   return rawPath ?? '-';
    // };

    const resolveValidUsers = (share: SambaShareEntry) => {
      const { details } = share;
      const value =
        (typeof details.valid_users === 'string' &&
          details.valid_users.trim()) ||
        (typeof details['valid users'] === 'string' &&
          (details['valid users'] as string).trim());

      return value ?? '-';
    };

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
        renderCell: (share) => (
          <Checkbox
            checked={selectedShares.includes(share.name)}
            onChange={(event) => onToggleSelect(share, event.target.checked)}
            color="primary"
            inputProps={{ 'aria-label': `انتخاب ${share.name}` }}
          />
        ),
      },
      {
        id: 'index',
        header: '#',
        align: 'center',
        width: 60,
        renderCell: (_share, index) => (
          <Typography sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {index + 1}
          </Typography>
        ),
      },
      {
        id: 'name',
        header: 'نام اشتراک',
        align: 'left',
        renderCell: (share) => (
          <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
            {share.name}
          </Typography>
        ),
      },
      // {
      //   id: 'path',
      //   header: 'مسیر',
      //   align: 'left',
      //   renderCell: (share) => (
      //     <Typography
      //       sx={{
      //         color: 'var(--color-text)',
      //         direction: 'ltr',
      //         fontFamily: 'var(--font-vazir)',
      //         wordBreak: 'break-all',
      //       }}
      //     >
      //       {resolvePath(share)}
      //     </Typography>
      //   ),
      // },
      {
        id: 'valid-users',
        header: 'کاربران مجاز',
        align: 'left',
        renderCell: (share) => (
          <Typography sx={{ color: 'var(--color-text)' }}>
            {resolveValidUsers(share)}
          </Typography>
        ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        renderCell: (share) => {
          const isShareDeleting = isDeleting && pendingShareName === share.name;

          return (
            <Tooltip title="حذف اشتراک">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(share)}
                  disabled={isShareDeleting}
                >
                  <MdDeleteOutline size={18} />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
    ];
  }, [isDeleting, onDelete, onToggleSelect, pendingShareName, selectedShares]);

  return (
    <DataTable<SambaShareEntry>
      columns={columns}
      data={shares}
      getRowId={(share) => share.name}
      isLoading={isLoading}
      error={error}
      renderLoadingState={() => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            py: 4,
          }}
        >
          <CircularProgress color="primary" size={32} />
          <Typography sx={{ color: 'var(--color-secondary)' }}>
            در حال دریافت اطلاعات اشتراک‌ها...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)', py: 3 }}>
          خطا در دریافت اشتراک‌ها: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          اشتراک فعالی ثبت نشده است.
        </Typography>
      )}
    />
  );
};

export default SharesTable;
