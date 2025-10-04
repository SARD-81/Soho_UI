import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { FileSystemEntry } from '../../@types/filesystem';
import DataTable from '../DataTable';

interface FileSystemsTableProps {
  filesystems: FileSystemEntry[];
  attributeKeys: string[];
  isLoading: boolean;
  error: Error | null;
  onDeleteFilesystem: (filesystem: FileSystemEntry) => void;
  isDeleteDisabled: boolean;
}

const valueTypographySx = {
  fontWeight: 600,
  color: 'var(--color-text)',
} as const;

const numericValueTypographySx = {
  ...valueTypographySx,
  display: 'block',
  textAlign: 'right' as const,
  direction: 'ltr' as const,
  fontVariantNumeric: 'tabular-nums',
};

const FileSystemsTable = ({
  filesystems,
  attributeKeys,
  isLoading,
  error,
  onDeleteFilesystem,
  isDeleteDisabled,
}: FileSystemsTableProps) => {
  const columns = useMemo<DataTableColumn<FileSystemEntry>[]>(() => {
    const baseColumns: DataTableColumn<FileSystemEntry>[] = [
      // {
      //   id: 'pool',
      //   header: 'نام Pool',
      //   align: 'left',
      //   renderCell: (filesystem) => (
      //     <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
      //       {filesystem.poolName}
      //     </Typography>
      //   ),
      // },
      {
        id: 'filesystem',
        header: 'نام فضای فایلی',
        align: 'left',
        renderCell: (filesystem) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {filesystem.filesystemName}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'mountpoint',
        header: 'mountpoint',
        align: 'left',
        renderCell: (filesystem) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {filesystem.attributeMap['mountpoint']}
            </Typography>
          </Box>
        ),
      },
    ];

    // const dynamicColumns = attributeKeys.map<DataTableColumn<FileSystemEntry>>(
    //   (key) => ({
    //     id: `attribute-${key}`,
    //     header: key,
    //     align: 'left',
    //     renderCell: (filesystem) => {
    //       const rawValue = filesystem.attributeMap[key];
    //       const isNumericValue =
    //         typeof rawValue === 'number' && Number.isFinite(rawValue);
    //
    //       return (
    //         <Typography
    //           sx={isNumericValue ? numericValueTypographySx : valueTypographySx}
    //         >
    //           {isNumericValue
    //             ? new Intl.NumberFormat('en-US').format(rawValue)
    //             : (rawValue ?? '—')}
    //         </Typography>
    //       );
    //     },
    //   })
    // );

    const actionColumn: DataTableColumn<FileSystemEntry> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (filesystem) => (
        <Tooltip title="حذف فضای فایلی">
          <span>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDeleteFilesystem(filesystem)}
              disabled={isDeleteDisabled}
            >
              <MdDeleteOutline size={18} />
            </IconButton>
          </span>
        </Tooltip>
      ),
    };

    return [...baseColumns, actionColumn];
  }, [attributeKeys, isDeleteDisabled, onDeleteFilesystem]);

  return (
    <DataTable<FileSystemEntry>
      columns={columns}
      data={filesystems}
      getRowId={(filesystem) => filesystem.id}
      isLoading={isLoading}
      error={error}
      renderLoadingState={() => (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <CircularProgress color="primary" size={32} />
          <Typography sx={{ color: 'var(--color-secondary)' }}>
            در حال دریافت اطلاعات فضا های فایلی ...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت اطلاعات فضا های فایلی‌: {tableError.message}
        </Typography>
      )}
      renderEmptyState={() => (
        <Typography sx={{ color: 'var(--color-secondary)' }}>
          هیچ فضای فایلیی برای نمایش وجود ندارد.
        </Typography>
      )}
    />
  );
};

export default FileSystemsTable;
