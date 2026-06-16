import { Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline, MdPlayArrow, MdStop, MdVpnKey, MdVpnKeyOff } from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { FileSystemEntry } from '../../@types/filesystem';
import DataTable from '../DataTable';

interface FileSystemsTableProps {
  detailViewId: string;
  filesystems: FileSystemEntry[];
  attributeKeys: string[];
  isLoading: boolean;
  error: Error | null;
  onDeleteFilesystem: (filesystem: FileSystemEntry) => void;
  isDeleteDisabled: boolean;
  // New powerful actions
  onMount?: (filesystem: FileSystemEntry) => void;
  onUnmount?: (filesystem: FileSystemEntry) => void;
  onLoadKey?: (filesystem: FileSystemEntry) => void;
  onUnloadKey?: (filesystem: FileSystemEntry) => void;
  isMounting?: boolean;
  isUnmounting?: boolean;
  isKeyLoading?: boolean;
  isKeyUnloading?: boolean;
}

const FileSystemsTable = ({
  detailViewId,
  filesystems,
  attributeKeys,
  isLoading,
  error,
  onDeleteFilesystem,
  isDeleteDisabled,
  onMount,
  onUnmount,
  onLoadKey,
  onUnloadKey,
  isMounting = false,
  isUnmounting = false,
  isKeyLoading = false,
  isKeyUnloading = false,
}: FileSystemsTableProps) => {

  const columns = useMemo<DataTableColumn<FileSystemEntry>[]>(() => {
    const getAttributeValue = (filesystem: FileSystemEntry, key: string) => {
      if (!filesystem.attributeMap) return '—';
      const directValue = filesystem.attributeMap[key];
      if (directValue != null) return directValue;
      return filesystem.attributeMap[key.toLowerCase()] ?? '—';
    };

    const baseColumns: DataTableColumn<FileSystemEntry>[] = [
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
        header: 'نقطه اتصال',
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

    const actionColumn: DataTableColumn<FileSystemEntry> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (filesystem) => {
        const isAnyActionPending = isMounting || isUnmounting || isKeyLoading || isKeyUnloading;

        return (
          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
            {/* Mount */}
            {onMount && (
              <Tooltip title="مانت کردن فضای فایلی">
                <span>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={(e) => { e.stopPropagation(); onMount(filesystem); }}
                    disabled={isAnyActionPending}
                    sx={{ '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.08)' } }}
                  >
                    <MdPlayArrow size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Unmount */}
            {onUnmount && (
              <Tooltip title="آنمانت کردن فضای فایلی">
                <span>
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={(e) => { e.stopPropagation(); onUnmount(filesystem); }}
                    disabled={isAnyActionPending}
                    sx={{ '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.08)' } }}
                  >
                    <MdStop size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Load Key (for encrypted) */}
            {onLoadKey && (
              <Tooltip title="لود کلید رمزنگاری">
                <span>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => { e.stopPropagation(); onLoadKey(filesystem); }}
                    disabled={isAnyActionPending}
                    sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' } }}
                  >
                    <MdVpnKey size={17} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Unload Key */}
            {onUnloadKey && (
              <Tooltip title="آنلود کلید رمزنگاری">
                <span>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={(e) => { e.stopPropagation(); onUnloadKey(filesystem); }}
                    disabled={isAnyActionPending}
                    sx={{ '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.08)' } }}
                  >
                    <MdVpnKeyOff size={17} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Delete */}
            <Tooltip title="حذف فضای فایلی">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => { e.stopPropagation(); onDeleteFilesystem(filesystem); }}
                  disabled={isDeleteDisabled || isAnyActionPending}
                >
                  <MdDeleteOutline size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    };

    return [...baseColumns, actionColumn];
  }, [
    attributeKeys,
    isDeleteDisabled,
    onDeleteFilesystem,
    onMount,
    onUnmount,
    onLoadKey,
    onUnloadKey,
    isMounting,
    isUnmounting,
    isKeyLoading,
    isKeyUnloading,
  ]);

  return (
    <DataTable<FileSystemEntry>
      detailViewId={detailViewId}
      columns={columns}
      data={filesystems}
      getRowId={(filesystem) => filesystem.id}
      isLoading={isLoading}
      error={error}
      onRowClick={() => {}}
      renderLoadingState={() => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <CircularProgress color="primary" size={32} />
          <Typography sx={{ color: 'var(--color-secondary)' }}>
            در حال دریافت اطلاعات فضاهای فایلی ...
          </Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography sx={{ color: 'var(--color-error)' }}>
          خطا در دریافت اطلاعات فضاهای فایلی: {tableError.message}
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
