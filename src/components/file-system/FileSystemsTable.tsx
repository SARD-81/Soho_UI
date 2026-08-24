import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import {
  MdDeleteOutline,
  MdLockReset,
  MdOutlineLink,
  MdOutlineLinkOff,
  MdVpnKey,
  MdVpnKeyOff,
} from 'react-icons/md';
import type { DataTableColumn } from '../../@types/dataTable';
import type { FileSystemEntry } from '../../@types/filesystem';
import DataTable from '../DataTable';
import ToggleBtn from '../ToggleBtn';

interface FileSystemsTableProps {
  detailViewId: string;
  filesystems: FileSystemEntry[];
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

const isTruthyAttribute = (value: string | undefined, truthyValues: string[]) =>
  typeof value === 'string' && truthyValues.includes(value.toLowerCase().trim());

const isCanmountOn = (filesystem: FileSystemEntry) =>
  isTruthyAttribute(filesystem.attributeMap?.canmount, [
    'on',
    'yes',
    'true',
    '1',
  ]);

const isMounted = (filesystem: FileSystemEntry) =>
  isTruthyAttribute(filesystem.attributeMap?.mounted, [
    'yes',
    'on',
    'true',
    'mounted',
  ]);

const isKeyLoaded = (filesystem: FileSystemEntry) =>
  isTruthyAttribute(filesystem.attributeMap?.keystatus, [
    'available',
    'loaded',
    'on',
    'yes',
    'true',
  ]);

const hasEncryption = (filesystem: FileSystemEntry) => {
  const value =
    filesystem.attributeMap?.encryption ??
    filesystem.attributeMap?.encrypted ??
    filesystem.attributeMap?.['رمزگذاری'];

  if (typeof value !== 'string') {
    return false;
  }

  return ![
    'off',
    'false',
    'no',
    'disabled',
    'none',
    '—',
    '-',
    '',
  ].includes(value.toLowerCase().trim());
};

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
  const columns = useMemo<DataTableColumn<FileSystemEntry>[]>(() => {
    const getAttribute = (filesystem: FileSystemEntry, key: string) => {
      if (!filesystem.attributeMap) {
        return '—';
      }

      return (
        filesystem.attributeMap[key] ??
        filesystem.attributeMap[key.toLowerCase()] ??
        '—'
      );
    };

    const dataColumns: DataTableColumn<FileSystemEntry>[] = [
      {
        id: 'filesystem',
        header: 'نام فضای فایلی',
        align: 'left',
        renderCell: (filesystem) => (
          <Typography sx={{ fontWeight: 700 }}>
            {filesystem.filesystemName}
          </Typography>
        ),
      },
      {
        id: 'mountpoint',
        header: 'نقطه اتصال',
        align: 'left',
        renderCell: (filesystem) => (
          <Typography>{filesystem.mountpoint}</Typography>
        ),
      },
      {
        id: 'used',
        header: 'فضای استفاده‌شده',
        align: 'left',
        renderCell: (filesystem) => (
          <Typography>{getAttribute(filesystem, 'used')}</Typography>
        ),
      },
      {
        id: 'available',
        header: 'فضای در دسترس',
        align: 'left',
        renderCell: (filesystem) => (
          <Typography>{getAttribute(filesystem, 'available')}</Typography>
        ),
      },
      {
        id: 'referenced',
        header: 'فضای ارجاع‌شده',
        align: 'left',
        renderCell: (filesystem) => (
          <Typography>{getAttribute(filesystem, 'referenced')}</Typography>
        ),
      },
    ];

    const canmountColumn: DataTableColumn<FileSystemEntry> = {
      id: 'canmount',
      header: 'اتصال خودکار',
      align: 'center',
      renderCell: (filesystem) => (
        <ToggleBtn
          id={`canmount-${filesystem.id}`}
          checked={isCanmountOn(filesystem)}
          disabled={!onSetCanmount || isSettingCanmount}
          onChange={(checked) =>
            onSetCanmount?.(filesystem, checked ? 'on' : 'off')
          }
        />
      ),
    };

    const actionsColumn: DataTableColumn<FileSystemEntry> = {
      id: 'actions',
      header: 'عملیات',
      align: 'center',
      renderCell: (filesystem) => {
        const mounted = isMounted(filesystem);
        const keyLoaded = isKeyLoaded(filesystem);
        const encryptionEnabled = hasEncryption(filesystem);
        const anyPending =
          isMounting ||
          isUnmounting ||
          isKeyLoading ||
          isKeyUnloading ||
          isChangingPassphrase ||
          isSettingCanmount;

        return (
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="center"
            alignItems="center"
          >
            {onMount && onUnmount ? (
              <Tooltip
                title={mounted ? 'آنمانت فضای فایلی' : 'مانت فضای فایلی'}
              >
                <span>
                  <IconButton
                    size="small"
                    color={mounted ? 'warning' : 'success'}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (mounted) {
                        onUnmount(filesystem);
                      } else {
                        onMount(filesystem);
                      }
                    }}
                    disabled={anyPending}
                    aria-label={
                      mounted ? 'آنمانت فضای فایلی' : 'مانت فضای فایلی'
                    }
                  >
                    {mounted ? (
                      <MdOutlineLinkOff size={18} />
                    ) : (
                      <MdOutlineLink size={18} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}

            {encryptionEnabled && onLoadKey && onUnloadKey ? (
              <Tooltip
                title={
                  keyLoaded
                    ? 'تخلیه کلید رمزنگاری'
                    : 'بارگذاری کلید رمزنگاری'
                }
              >
                <span>
                  <IconButton
                    size="small"
                    color={keyLoaded ? 'secondary' : 'primary'}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (keyLoaded) {
                        onUnloadKey(filesystem);
                      } else {
                        onLoadKey(filesystem);
                      }
                    }}
                    disabled={anyPending}
                    aria-label={
                      keyLoaded
                        ? 'تخلیه کلید رمزنگاری'
                        : 'بارگذاری کلید رمزنگاری'
                    }
                  >
                    {keyLoaded ? (
                      <MdVpnKeyOff size={18} />
                    ) : (
                      <MdVpnKey size={18} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}

            {encryptionEnabled && onChangePassphrase ? (
              <Tooltip
                title={
                  keyLoaded
                    ? 'تغییر رمز فایل سیستم'
                    : 'برای تغییر رمز، ابتدا کلید را بارگذاری کنید'
                }
              >
                <span>
                  <IconButton
                    size="small"
                    color="info"
                    onClick={(event) => {
                      event.stopPropagation();
                      onChangePassphrase(filesystem);
                    }}
                    disabled={anyPending || !keyLoaded}
                    aria-label="تغییر گذرواژه فایل سیستم"
                  >
                    <MdLockReset size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}

            <Tooltip title="حذف فضای فایلی">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteFilesystem(filesystem);
                  }}
                  disabled={isDeleteDisabled || anyPending}
                  aria-label="حذف فضای فایلی"
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
    isChangingPassphrase,
    isDeleteDisabled,
    isKeyLoading,
    isKeyUnloading,
    isMounting,
    isSettingCanmount,
    isUnmounting,
    onChangePassphrase,
    onDeleteFilesystem,
    onLoadKey,
    onMount,
    onSetCanmount,
    onUnloadKey,
    onUnmount,
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <CircularProgress color="primary" size={32} />
          <Typography>در حال دریافت اطلاعات...</Typography>
        </Box>
      )}
      renderErrorState={(tableError) => (
        <Typography color="error">خطا: {tableError.message}</Typography>
      )}
      renderEmptyState={() => <Typography>هیچ فضای فایلی وجود ندارد.</Typography>}
    />
  );
};

export default FileSystemsTable;
