import { Box, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import ToggleBtn from '../ToggleBtn';
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
  const theme = useTheme();

  const getCanmountValue = (filesystem: FileSystemEntry): boolean => {
    const val = filesystem.attributeMap?.canmount || filesystem.attributeMap?.['canmount'];
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return lower === 'on' || lower === 'yes' || lower === 'true' || lower === '1';
    }
    return false;
  };

  const getMountedValue = (filesystem: FileSystemEntry): boolean => {
    const val = filesystem.attributeMap?.mounted || filesystem.attributeMap?.['mounted'];
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return lower === 'yes' || lower === 'on' || lower === 'true' || lower === 'mounted';
    }
    return false;
  };

  const getKeyLoadedValue = (filesystem: FileSystemEntry): boolean => {
    const val = filesystem.attributeMap?.keystatus || filesystem.attributeMap?.['keystatus'];
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      return lower === 'available' || lower === 'loaded' || lower === 'on';
    }
    return false;
  };

  const columns = useMemo<DataTableColumn<FileSystemEntry>[]>(() => {
    const getAttributeValue = (filesystem: FileSystemEntry, key: string) => {
      if (!filesystem.attributeMap) return '—';
      const direct = filesystem.attributeMap[key];
      return direct != null ? String(direct) : filesystem.attributeMap[key.toLowerCase()] ?? '—';
    };

    const baseColumns: DataTableColumn<FileSystemEntry>[] = [
      { id: 'filesystem', header: 'نام فضای فایلی', align: 'left', renderCell: (fs) => <Typography sx={{ fontWeight: 700 }}>{fs.filesystemName}</Typography> },
      { id: 'mountpoint', header: 'نقطه اتصال', align: 'left', renderCell: (fs) => <Typography>{fs.mountpoint}</Typography> },
      { id: 'used', header: 'فضای استفاده‌شده', align: 'left', renderCell: (fs) => <Typography>{getAttributeValue(fs, 'used')}</Typography> },
      { id: 'available', header: 'فضای در دسترس', align: 'left', renderCell: (fs) => <Typography>{getAttributeValue(fs, 'available')}</Typography> },
      { id: 'referenced', header: 'فضای ارجاع‌شده', align: 'left', renderCell: (fs) => <Typography>{getAttributeValue(fs, 'referenced')}</Typography> },
    ];

    const actionColumn: DataTableColumn<FileSystemEntry> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (filesystem) => {
        const isMounted = getMountedValue(filesystem);
        const isKeyLoaded = getKeyLoadedValue(filesystem);
        const isCanmountOn = getCanmountValue(filesystem);

        const isAnyPending = isMounting || isUnmounting || isKeyLoading || isKeyUnloading || isSettingCanmount;

        return (
          <Stack spacing={1.25} alignItems="center" sx={{ py: 0.5 }}>
            {/* Mount Toggle */}
            {(onMount || onUnmount) && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ToggleBtn
                  checked={isMounted}
                  disabled={isAnyPending || !onMount || !onUnmount}
                  onChange={(checked) => {
                    if (checked && onMount) onMount(filesystem);
                    else if (!checked && onUnmount) onUnmount(filesystem);
                  }}
                />
                <Chip
                  label={isMounted ? 'مانت' : 'آنمانت'}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    color: isMounted ? theme.palette.success.main : theme.palette.text.secondary,
                    borderColor: alpha(isMounted ? theme.palette.success.main : theme.palette.text.secondary, 0.4),
                    minWidth: 78,
                  }}
                />
              </Stack>
            )}

            {/* Encryption Key Toggle */}
            {(onLoadKey || onUnloadKey) && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ToggleBtn
                  checked={isKeyLoaded}
                  disabled={isAnyPending || !onLoadKey || !onUnloadKey}
                  onChange={(checked) => {
                    if (checked && onLoadKey) onLoadKey(filesystem);
                    else if (!checked && onUnloadKey) onUnloadKey(filesystem);
                  }}
                />
                <Chip
                  label={isKeyLoaded ? 'کلید لود' : 'کلید آنلود'}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    color: isKeyLoaded ? theme.palette.primary.main : theme.palette.text.secondary,
                    borderColor: alpha(isKeyLoaded ? theme.palette.primary.main : theme.palette.text.secondary, 0.4),
                    minWidth: 90,
                  }}
                />
              </Stack>
            )}

            {/* Canmount Toggle (compact) */}
            {onSetCanmount && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ToggleBtn
                  checked={isCanmountOn}
                  disabled={isAnyPending}
                  onChange={(checked) => onSetCanmount(filesystem, checked ? 'on' : 'off')}
                />
                <Chip
                  label={isCanmountOn ? 'مانت خودکار' : 'غیرفعال'}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    color: isCanmountOn ? theme.palette.success.main : theme.palette.text.secondary,
                    borderColor: alpha(isCanmountOn ? theme.palette.success.main : theme.palette.text.secondary, 0.4),
                    minWidth: 95,
                  }}
                />
              </Stack>
            )}

            {/* Delete */}
            <Tooltip title="حذف فضای فایلی">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => { e.stopPropagation(); onDeleteFilesystem(filesystem); }}
                  disabled={isDeleteDisabled || isAnyPending}
                  sx={{ mt: 0.5 }}
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
    attributeKeys, isDeleteDisabled, onDeleteFilesystem,
    onMount, onUnmount, onLoadKey, onUnloadKey, onSetCanmount,
    isMounting, isUnmounting, isKeyLoading, isKeyUnloading, isSettingCanmount, theme
  ]);

  return (
    <DataTable<FileSystemEntry>
      detailViewId={detailViewId}
      columns={columns}
      data={filesystems}
      getRowId={(fs) => fs.id}
      isLoading={isLoading}
      error={error}
      onRowClick={() => {}}
      renderLoadingState={() => <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}><CircularProgress size={32} /><Typography>در حال دریافت...</Typography></Box>}
      renderErrorState={(e) => <Typography color="error">خطا: {e.message}</Typography>}
      renderEmptyState={() => <Typography>هیچ فضای فایلیی وجود ندارد.</Typography>}
    />
  );
};

export default FileSystemsTable;
