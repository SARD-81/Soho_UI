import { Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { MdDeleteOutline, MdEdit, MdPlayArrow, MdStop, MdVpnKey, MdVpnKeyOff } from 'react-icons/md';
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
  onChangePassphrase?: (filesystem: FileSystemEntry) => void;
  onSetCanmount?: (filesystem: FileSystemEntry, state: 'on' | 'off') => void;
  isMounting?: boolean;
  isUnmounting?: boolean;
  isKeyLoading?: boolean;
  isKeyUnloading?: boolean;
  isChangingPassphrase?: boolean;
  isSettingCanmount?: boolean;
}

const FileSystemsTable = ({
  detailViewId,
  filesystems,
  isLoading,
  error,
  onDeleteFilesystem,
  isDeleteDisabled,
  onMount,
  onUnmount,
  onLoadKey,
  onUnloadKey,
  onChangePassphrase,
  onSetCanmount,
  isMounting = false,
  isUnmounting = false,
  isKeyLoading = false,
  isKeyUnloading = false,
  isChangingPassphrase = false,
  isSettingCanmount = false,
}: FileSystemsTableProps) => {

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
    return typeof v === 'string' && ['available','loaded','on','yes','true'].includes(v.toLowerCase().trim());
  };

  const getCanShowEncryptionActions = (fs: FileSystemEntry) => {
    const value =
      fs.attributeMap?.encryption ??
      fs.attributeMap?.encrypted ??
      fs.attributeMap?.['رمزگذاری'];

    if (typeof value !== 'string') {
      return false;
    }

    const normalized = value.toLowerCase().trim();
    return !['off', 'false', 'no', 'disabled', 'none', '—', '-', ''].includes(normalized);
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

    // Canmount column - only ToggleBtn (no Chip)
    const canmountColumn: DataTableColumn<FileSystemEntry> = {
      id: 'canmount',
      header: 'اتصال خودکار',
      align: 'center',
      renderCell: (fs) => {
        const isOn = getCanmountOn(fs);
        const toggleId = `canmount-${fs.id}`;
        return (
          <ToggleBtn
            id={toggleId}
            checked={isOn}
            disabled={!onSetCanmount || isSettingCanmount}
            onChange={(checked) => onSetCanmount?.(fs, checked ? 'on' : 'off')}
          />
        );
      },
    };

    const actionsColumn: DataTableColumn<FileSystemEntry> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (fs) => {
        const isMounted = getIsMounted(fs);
        const isKeyLoaded = getIsKeyLoaded(fs);
        const canShowEncryptionActions = getCanShowEncryptionActions(fs);
        const anyPending = isMounting || isUnmounting || isKeyLoading || isKeyUnloading || isChangingPassphrase || isSettingCanmount;

        return (
          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
            {(onMount && onUnmount) && (
              <Tooltip title={isMounted ? 'قطع اتصال' : 'وصل کردن'}>
                <span>
                  <IconButton
                    size="small"
                    color={isMounted ? 'warning' : 'success'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isMounted) onUnmount(fs);
                      else onMount(fs);
                    }}
                    disabled={anyPending}
                  >
                    {isMounted ? <MdStop size={18} /> : <MdPlayArrow size={18} />}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {canShowEncryptionActions && (onLoadKey && onUnloadKey) && (
              <Tooltip title={isKeyLoaded ? 'تخلیه کلید' : 'بارگذاری کلید'}>
                <span>
                  <IconButton
                    size="small"
                    color={isKeyLoaded ? 'secondary' : 'primary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isKeyLoaded) onUnloadKey(fs);
                      else onLoadKey(fs);
                    }}
                    disabled={anyPending}
                  >
                    {isKeyLoaded ? <MdVpnKeyOff size={17} /> : <MdVpnKey size={17} />}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {canShowEncryptionActions && onChangePassphrase && (
              <Tooltip title={isKeyLoaded ? 'تغییر رمز فایل سیستم' : 'برای تغییر رمز، ابتدا کلید را بارگذاری کنید'}>
                <span>
                  <IconButton
                    size="small"
                    color="info"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangePassphrase(fs);
                    }}
                    disabled={anyPending || !isKeyLoaded}
                  >
                    <MdEdit size={17} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

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
    isDeleteDisabled, onDeleteFilesystem,
    onMount, onUnmount, onLoadKey, onUnloadKey, onChangePassphrase, onSetCanmount,
    isMounting, isUnmounting, isKeyLoading, isKeyUnloading, isChangingPassphrase, isSettingCanmount
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
