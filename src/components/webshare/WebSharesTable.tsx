import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline, MdLockReset } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { WebShareEntry } from '../../@types/webshare';
import DataTable from '../DataTable';

interface WebSharesTableProps {
  detailViewId: string;
  shares: WebShareEntry[];
  isLoading: boolean;
  error: Error | null;
  onDelete: (share: WebShareEntry) => void;
  onPermission: (share: WebShareEntry) => void;
  pendingShareId?: string | null;
  isMutating?: boolean;
}

const WebSharesTable = ({
  detailViewId,
  shares,
  isLoading,
  error,
  onDelete,
  onPermission,
  pendingShareId = null,
  isMutating = false,
}: WebSharesTableProps) => {
  const columns = useMemo<DataTableColumn<WebShareEntry>[]>(
    () => [
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
        id: 'targetName',
        header: 'نام Web Share',
        align: 'center',
        renderCell: (share) => (
          <Typography sx={{ color: 'var(--color-text)', fontWeight: 600 }}>
            {share.targetName}
          </Typography>
        ),
      },
      {
        id: 'poolName',
        header: 'Pool',
        align: 'center',
        renderCell: (share) => (
          <Typography sx={{ color: 'var(--color-text)' }}>{share.poolName}</Typography>
        ),
      },
      {
        id: 'fsName',
        header: 'FileSystem',
        align: 'center',
        renderCell: (share) => (
          <Typography sx={{ color: 'var(--color-text)' }}>{share.fsName}</Typography>
        ),
      },
      {
        id: 'path',
        header: 'مسیر/Location',
        align: 'center',
        renderCell: (share) => (
          <Typography
            sx={{
              color: 'var(--color-text)',
              direction: 'ltr',
              fontFamily: 'var(--font-vazir)',
              wordBreak: 'break-all',
            }}
          >
            {share.path}
          </Typography>
        ),
      },
      {
        id: 'permission',
        header: 'Permission',
        align: 'center',
        renderCell: (share) =>
          share.permission ? (
            <Chip
              label={share.permission}
              size="small"
              sx={{
                fontWeight: 700,
                color: 'var(--color-primary)',
                backgroundColor: 'rgba(0, 198, 169, 0.12)',
              }}
            />
          ) : (
            <Typography sx={{ color: 'var(--color-secondary)' }}>—</Typography>
          ),
      },
      {
        id: 'actions',
        header: 'عملیات',
        align: 'center',
        width: 90,
        renderCell: (share) => {
          const isShareMutating = isMutating && pendingShareId === share.id;

          return (
            <Stack direction="row" spacing={0.5} justifyContent="center">
              <Tooltip title="تغییر Permission">
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(event) => {
                      event.stopPropagation();
                      onPermission(share);
                    }}
                    disabled={isShareMutating}
                  >
                    <MdLockReset size={18} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="حذف Web Share">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(share);
                    }}
                    disabled={isShareMutating}
                  >
                    <MdDeleteOutline size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [isMutating, onDelete, onPermission, pendingShareId]
  );

  return (
    <DataTable<WebShareEntry>
      detailViewId={detailViewId}
      columns={columns}
      data={shares}
      getRowId={(share) => share.id}
      isLoading={isLoading}
      error={error}
      bodyRowSx={{ transition: 'background-color 0.2s ease' }}
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
            در حال دریافت Web Shareها...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)', py: 3 }}>
          خطا در دریافت Web Shareها: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          Web Share فعالی ثبت نشده است.
        </Typography>
      )}
    />
  );
};

export default WebSharesTable;
