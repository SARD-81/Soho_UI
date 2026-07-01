import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline, MdLink } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { WebShareEntry } from '../../@types/webshare';
import DataTable from '../DataTable';

interface WebSharesTableProps {
  detailViewId: string;
  shares: WebShareEntry[];
  isLoading: boolean;
  error: Error | null;
  onDelete: (share: WebShareEntry) => void;
  host: string;
  pendingShareId?: string | null;
  isMutating?: boolean;
}

const WebSharesTable = ({
  detailViewId,
  shares,
  isLoading,
  error,
  onDelete,
  host,
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
        header: 'نام اشتراک وب',
        align: 'center',
        renderCell: (share) => (
          <Typography sx={{ color: 'var(--color-text)', fontWeight: 600 }}>
            {share.targetName}
          </Typography>
        ),
      },
      {
        id: 'poolName',
        header: 'فضای یکپارچه',
        align: 'center',
        renderCell: (share) => (
          <Typography sx={{ color: 'var(--color-text)' }}>{share.poolName}</Typography>
        ),
      },
      {
        id: 'fsName',
        header: 'فایل‌سیستم',
        align: 'center',
        renderCell: (share) => (
          <Typography sx={{ color: 'var(--color-text)' }}>{share.fsName}</Typography>
        ),
      },
      {
        id: 'path',
        header: 'مسیر',
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
        id: 'links',
        header: 'لینک‌ها',
        align: 'center',
        renderCell: (share) => {
          const link = `http://${host}/${share.targetName}/`;

          return (
            <Tooltip title={link} arrow>
              <Typography
                component="a"
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                sx={{
                  color: 'var(--color-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontWeight: 800,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                <MdLink size={18} />
                لینک
              </Typography>
            </Tooltip>
          );
        },
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
              <Tooltip title="حذف اشتراک وب">
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
    [host, isMutating, onDelete, pendingShareId]
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
            در حال دریافت اشتراک‌های وب...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)', py: 3 }}>
          خطا در دریافت اشتراک‌های وب: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)', py: 3 }}>
          اشتراک وب فعالی ثبت نشده است.
        </Typography>
      )}
    />
  );
};

export default WebSharesTable;
