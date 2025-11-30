import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useCallback, useMemo } from 'react';
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
  selectedFilesystems: string[];
  onToggleSelect: (filesystem: FileSystemEntry, checked: boolean) => void;
}

const FileSystemsTable = ({
  filesystems,
  attributeKeys,
  isLoading,
  error,
  onDeleteFilesystem,
  isDeleteDisabled,
  selectedFilesystems,
  onToggleSelect,
}: FileSystemsTableProps) => {
  const theme = useTheme();

  const columns = useMemo<DataTableColumn<FileSystemEntry>[]>(() => {
    const getAttributeValue = (filesystem: FileSystemEntry, key: string) => {
      if (!filesystem.attributeMap) return '—';

      const directValue = filesystem.attributeMap[key];
      if (directValue != null) return directValue;

      return filesystem.attributeMap[key.toLowerCase()] ?? '—';
    };

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
              {filesystem.mountpoint}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'used',
        header: 'فضای استفاده‌شده',
        align: 'left',
        renderCell: (filesystem) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {getAttributeValue(filesystem, 'used')}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'available',
        header: 'فضای در دسترس',
        align: 'left',
        renderCell: (filesystem) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {getAttributeValue(filesystem, 'available')}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'referenced',
        header: 'فضای ارجاع‌شده',
        align: 'left',
        renderCell: (filesystem) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              {getAttributeValue(filesystem, 'referenced')}
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
              onClick={(event) => {
                event.stopPropagation();
                onDeleteFilesystem(filesystem);
              }}
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

  const handleRowClick = useCallback(
    (filesystem: FileSystemEntry) => {
      const isSelected = selectedFilesystems.includes(filesystem.id);
      onToggleSelect(filesystem, !isSelected);
    },
    [onToggleSelect, selectedFilesystems]
  );

  const resolveRowSx = useCallback(
    (filesystem: FileSystemEntry) => {
      const isSelected = selectedFilesystems.includes(filesystem.id);

      if (!isSelected) {
        return {};
      }

      return {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.18),
        },
      };
    },
    [selectedFilesystems, theme]
  );

  return (
    <DataTable<FileSystemEntry>
      columns={columns}
      data={filesystems}
      getRowId={(filesystem) => filesystem.id}
      isLoading={isLoading}
      error={error}
      onRowClick={handleRowClick}
      bodyRowSx={resolveRowSx}
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