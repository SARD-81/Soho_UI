import { Box, Chip, CircularProgress, IconButton, Stack, Switch, Tooltip, Typography } from '@mui/material';
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

  // Helper functions to read current state from each row's data
  const getCanmountOn = (fs: FileSystemEntry) => {
    const v = fs.attributeMap?.canmount || fs.attributeMap?.['canmount'];
    return typeof v === 'string' && ['on','yes','true','1'].includes(v.toLowerCase().trim());
  };

  const getIsMounted = (fs: FileSystemEntry) => {
    const v = fs.attributeMap?.mounted || fs.attributeMap?.['mounted'];
    return typeof v === 'string' && ['yes','on','true','mounted'].includes(v.toLowerCase().trim());
  };

  const getIsKeyLoaded = (fs: FileSystemEntry) => {
    const v = fs.attributeMap?.keystatus || fs.attributeMap?.['keystatus'];
    return typeof v === 'string' && ['available','loaded','on','yes'].includes(v.toLowerCase().trim());
  };

  const columns = useMemo<DataTableColumn<FileSystemEntry>[]>(() => {
    const getAttr = (fs: FileSystemEntry, key: string) => {
      if (!fs.attributeMap) return '—';
      return fs.attributeMap[key] ?? fs.attributeMap[key.toLowerCase()] ?? '—';
    };

    const dataColumns: DataTableColumn<FileSystemEntry>[] = [
      { id: 'filesystem', header: 'نام فضای فایلی', align: 'left', renderCell: (fs) => <Typography sx={{ fontWeight: 700 }}>{fs.filesystemName}</Typography> },
      { id: 'mountpoint', header: 'نقطه اتصال', align: 'left', renderCell: (fs) => <Typography>{fs.mountpoint}</Typography> },
      { id: 'used', header: 'فضای استفاده‌شده', align: 'left', renderCell: (fs) => <Typography>{getAttr(fs, 'used')}</Typography> },
      { id: 'available', header: 'فضای در دسترس', align: 'left', renderCell: (fs) => <Typography>{getAttr(fs, 'available')}</Typography> },
      { id: 'referenced', header: 'فضای ارجاع‌شده', align: 'left', renderCell: (fs) => <Typography>{getAttr(fs, 'referenced')}</Typography> },
    ];

    // Separate Canmount column (user wants this to stay as its own nice toggle column)
    const canmountColumn: DataTableColumn<FileSystemEntry> = {
      id: 'canmount',
      header: 'مانت خودکار',
      align: 'center',
      renderCell: (fs) => {
        const isOn = getCanmountOn(fs);
        return (
          <Tooltip title={isOn ? 'غیرفعال کردن مانت خودکار' : 'فعال کردن مانت خودکار'}>
            <span>
              <Switch
                checked={isOn}
                onChange={(e) => onSetCanmount?.(fs, e.target.checked ? 'on' : 'off')}
                disabled={!onSetCanmount || isSettingCanmount}
                color="success"
                size="small"
              />
            </span>
          </Tooltip>
        );
      },
    };

    // Actions column containing Mount/Key toggles (exactly like Share user disable pattern) + Delete
    const actionsColumn: DataTableColumn<FileSystemEntry> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (fs) => {
        const isMounted = getIsMounted(fs);
        const isKeyLoaded = getIsKeyLoaded(fs);
        const anyPending = isMounting || isUnmounting || isKeyLoading || isKeyUnloading || isSettingCanmount;

        return (
          <Stack spacing={1.5} alignItems="center" sx={{ py: 0.75 }}>
            {/* Mount / Unmount Toggle - same pattern as غیرفعال‌سازی کاربر */}
            {(onMount && onUnmount) && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ToggleBtn
                  checked={isMounted}
                  disabled={anyPending}
                  onChange={(checked) => {
                    if (checked) onMount(fs);
                    else onUnmount(fs);
                  }}
                />
                <Chip
                  label={isMounted ? 'مانت' : 'آنمانت'}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    color: isMounted ? theme.palette.success.main : theme.palette.text.secondary,
                    borderColor: alpha(isMounted ? theme.palette.success.main : theme.palette.text.secondary, 0.35),
                    minWidth: 70,
                  }}
                />
              </Stack>
            )}

            {/* Load / Unload Key Toggle - same pattern */}
            {(onLoadKey && onUnloadKey) && (
              <Stack direction="row" spacing={1} alignItems="center">
                <ToggleBtn
                  checked={isKeyLoaded}
                  disabled={anyPending}
                  onChange={(checked) => {
                    if (checked) onLoadKey(fs);
                    else onUnloadKey(fs);
                  }}
                />
                <Chip
                  label={isKeyLoaded ? 'کلید لود' : 'کلید آنلود'}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    color: isKeyLoaded ? theme.palette.primary.main : theme.palette.text.secondary,
                    borderColor: alpha(isKeyLoaded ? theme.palette.primary.main : theme.palette.text.secondary, 0.35),
                    minWidth: 85,
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
                  onClick={(e) => { e.stopPropagation(); onDeleteFilesystem(fs); }}
                  disabled={isDeleteDisabled || anyPending}
                >
                  <MdDeleteOutline size={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    };

    return [...dataColumns, canmountColumn, actionsColumn];
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
      renderLoadingState={() => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <CircularProgress color="primary" size={32} />
          <Typography>در حال دریافت اطلاعات...</Typography>
        </Box>
      )}
      renderErrorState={(e) => <Typography color="error">خطا: {e.message}</Typography>}
      renderEmptyState={() => <Typography>هیچ فضای فایلی وجود ندارد.</Typography>}
    />
  );
};

export default FileSystemsTable;
