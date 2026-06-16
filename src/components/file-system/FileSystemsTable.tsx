import { Box, CircularProgress, IconButton, Stack, Switch, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
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
  onMount?: (filesystem: FileSystemEntry) => void;
  onUnmount?: (filesystem: FileSystemEntry) => void;
  onLoadKey?: (filesystem: FileSystemEntry) => void;
  onUnloadKey?: (filesystem: FileSystemEntry) => void;
  onSetCanmount?: (filesystem: FileSystemEntry, state: 'on' | 'off') => void;
  isMounting?: boolean;
  isUnmounting?: boolean;
  isKeyLoading?: boolean;
  isKeyUnloading?: boolean;
  isSettingCanmount?: boolean;
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
  onSetCanmount,
  isMounting = false,
  isUnmounting = false,
  isKeyLoading = false,
  isKeyUnloading = false,
  isSettingCanmount = false,
}: FileSystemsTableProps) => {

  const getCanmountValue = (filesystem: FileSystemEntry): 'on' | 'off' => {
    const val = filesystem.attributeMap?.canmount || filesystem.attributeMap?.['canmount'];
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      if (lower === 'on' || lower === 'yes' || lower === 'true' || lower === '1') return 'on';
    }
    return 'off';
  };

  // Determine if filesystem is currently mounted
  const getMountedValue = (filesystem: FileSystemEntry): boolean => {
    const val = filesystem.attributeMap?.mounted || filesystem.attributeMap?.['mounted'] || filesystem.attributeMap?.mountpoint;
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return lower === 'yes' || lower === 'on' || lower === 'true' || lower === 'mounted' || lower.length > 0;
    }
    return false;
  };

  // Determine if encryption key is loaded
  const getKeyLoadedValue = (filesystem: FileSystemEntry): boolean => {
    const val = filesystem.attributeMap?.keystatus || filesystem.attributeMap?.['keystatus'] || filesystem.attributeMap?.encryption;
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return lower === 'available' || lower === 'loaded' || lower === 'on' || lower === 'yes';
    }
    // If encryption property exists and is 'on', assume key might be needed
    const enc = filesystem.attributeMap?.encryption || filesystem.attributeMap?.['encryption'];
    if (typeof enc === 'string' && enc.toLowerCase() === 'on') {
      return false; // default to not loaded if we don't have keystatus
    }
    return false;
  };

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
      // === CANMOUNT TOGGLE ===
      {
        id: 'canmount',
        header: 'مانت خودکار',
        align: 'center',
        renderCell: (filesystem) => {
          const isOn = getCanmountValue(filesystem) === 'on';
          return (
            <Tooltip title={isOn ? 'غیرفعال کردن مانت خودکار' : 'فعال کردن مانت خودکار'}>
              <span>
                <Switch
                  checked={isOn}
                  onChange={(e) => onSetCanmount && onSetCanmount(filesystem, e.target.checked ? 'on' : 'off')}
                  disabled={!onSetCanmount || isSettingCanmount}
                  color="success"
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-success)' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-success)' },
                  }}
                />
              </span>
            </Tooltip>
          );
        },
      },
      // === MOUNTED STATUS TOGGLE ===
      {
        id: 'mounted',
        header: 'وضعیت مانت',
        align: 'center',
        renderCell: (filesystem) => {
          const isMounted = getMountedValue(filesystem);
          const isPending = isMounting || isUnmounting;

          return (
            <Tooltip title={isMounted ? 'آنمانت کردن' : 'مانت کردن'}>
              <span>
                <Switch
                  checked={isMounted}
                  onChange={(e) => {
                    if (e.target.checked && onMount) onMount(filesystem);
                    else if (!e.target.checked && onUnmount) onUnmount(filesystem);
                  }}
                  disabled={!onMount || !onUnmount || isPending}
                  color="primary"
                  size="small"
                />
              </span>
            </Tooltip>
          );
        },
      },
      // === ENCRYPTION KEY STATUS TOGGLE ===
      {
        id: 'key',
        header: 'کلید رمزنگاری',
        align: 'center',
        renderCell: (filesystem) => {
          const isKeyLoaded = getKeyLoadedValue(filesystem);
          const isPending = isKeyLoading || isKeyUnloading;

          return (
            <Tooltip title={isKeyLoaded ? 'آنلود کلید' : 'لود کلید'}>
              <span>
                <Switch
                  checked={isKeyLoaded}
                  onChange={(e) => {
                    if (e.target.checked && onLoadKey) onLoadKey(filesystem);
                    else if (!e.target.checked && onUnloadKey) onUnloadKey(filesystem);
                  }}
                  disabled={!onLoadKey || !onUnloadKey || isPending}
                  color="secondary"
                  size="small"
                />
              </span>
            </Tooltip>
          );
        },
      },
    ];

    const actionColumn: DataTableColumn<FileSystemEntry> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (filesystem) => {
        const isAnyActionPending = isMounting || isUnmounting || isKeyLoading || isKeyUnloading || isSettingCanmount;

        return (
          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
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
    onSetCanmount,
    isMounting,
    isUnmounting,
    isKeyLoading,
    isKeyUnloading,
    isSettingCanmount,
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
          هیچ فضای فایلیی برای نماش وجود ندارد.
        </Typography>
      )}
    />
  );
};

export default FileSystemsTable;
