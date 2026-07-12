import {
  Alert,
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { FileSystemEntry } from '../@types/filesystem';
import type { WebShareEntry } from '../@types/webshare';
import BlurModal from '../components/BlurModal';
import ModalActionButtons from '../components/common/ModalActionButtons';
import TablePageHeader from '../components/common/TablePageHeader';
import PageContainer from '../components/PageContainer';
import WebSharesTable from '../components/webshare/WebSharesTable';
import { useFileSystems } from '../hooks/useFileSystems';
import {
  extractWebShareErrorMessage,
  useCreateWebShare,
  useDeleteWebShare,
  useSetWebSharePermission,
  useWebShares,
} from '../hooks/useWebShares';

const WEB_SHARE_DETAIL_VIEW_ID = 'web-shares';
const createFilesystemKey = (poolName: string, fsName: string) =>
  `${poolName}_${fsName}`;

const ENABLED_SHARE_VALUES = new Set(['on', 'yes', 'true', '1', 'enabled', 'available']);

const isShareEnabledValue = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  const normalized = String(value ?? '').trim().toLowerCase();
  return ENABLED_SHARE_VALUES.has(normalized);
};

const hasSmbOrNfsShareEnabled = (filesystem: FileSystemEntry) =>
  isShareEnabledValue(filesystem.attributeMap?.sharesmb) ||
  isShareEnabledValue(filesystem.attributeMap?.sharenfs);

const WebShare = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFilesystemKey, setSelectedFilesystemKey] = useState('');
  const [deleteShare, setDeleteShare] = useState<WebShareEntry | null>(null);

  const {
    data: webShares = [],
    isLoading: isWebSharesLoading,
    isFetching: isWebSharesFetching,
    error: webSharesError,
    refetch: refetchWebShares,
  } = useWebShares();
  const {
    data: filesystemData,
    isLoading: isFilesystemsLoading,
    error: filesystemsError,
  } = useFileSystems();

  const existingWebShareKeys = useMemo(
    () =>
      new Set(
        webShares.map((share) => createFilesystemKey(share.poolName, share.fsName))
      ),
    [webShares]
  );

  const availableFilesystems = useMemo(
    () =>
      (filesystemData?.filesystems ?? [])
        .filter(
          (filesystem) =>
            hasSmbOrNfsShareEnabled(filesystem) &&
            !existingWebShareKeys.has(
              createFilesystemKey(filesystem.poolName, filesystem.filesystemName)
            )
        )
        .sort((a, b) =>
          `${a.poolName}/${a.filesystemName}`.localeCompare(
            `${b.poolName}/${b.filesystemName}`,
            'en',
            { sensitivity: 'base' }
          )
        ),
    [existingWebShareKeys, filesystemData?.filesystems]
  );

  const selectedFilesystem = useMemo(
    () =>
      availableFilesystems.find(
        (filesystem) =>
          createFilesystemKey(filesystem.poolName, filesystem.filesystemName) ===
          selectedFilesystemKey
      ) ?? null,
    [availableFilesystems, selectedFilesystemKey]
  );

  const createWebShare = useCreateWebShare();
  const setWebSharePermission = useSetWebSharePermission();
  const deleteWebShare = useDeleteWebShare();

  const closeCreateDialog = () => {
    if (createWebShare.isPending || setWebSharePermission.isPending) {
      return;
    }
    setIsCreateOpen(false);
    setSelectedFilesystemKey('');
  };

  const handleCreateSubmit = () => {
    if (!selectedFilesystem) {
      toast.error('لطفاً یک فایل‌سیستم را انتخاب کنید.');
      return;
    }

    createWebShare.mutate(
      {
        pool_name: selectedFilesystem.poolName,
        fs_name: selectedFilesystem.filesystemName,
        save_to_db: false,
      },
      {
        onSuccess: () => {
          setWebSharePermission.mutate(
            {
              pool_name: selectedFilesystem.poolName,
              fs_name: selectedFilesystem.filesystemName,
              permission: '777',
            },
            {
              onSuccess: () => {
                setIsCreateOpen(false);
                setSelectedFilesystemKey('');
                toast.success('Web Share با دسترسی 777 با موفقیت ایجاد شد.');
              },
              onError: (error) => {
                toast.error(
                  `اشتراک ایجاد شد اما تنظیم دسترسی 777 با خطا مواجه شد: ${extractWebShareErrorMessage(error)}`
                );
              },
            }
          );
        },
        onError: (error) => {
          toast.error(
            `ایجاد Web Share با خطا مواجه شد: ${extractWebShareErrorMessage(error)}`
          );
        },
      }
    );
  };

  const closeDeleteDialog = () => {
    if (deleteWebShare.isPending) {
      return;
    }
    setDeleteShare(null);
  };

  const handleDeleteSubmit = () => {
    if (!deleteShare) {
      return;
    }

    deleteWebShare.mutate(
      {
        pool_name: deleteShare.poolName,
        fs_name: deleteShare.fsName,
        save_to_db: false,
      },
      {
        onSuccess: () => {
          setDeleteShare(null);
          toast.success('Web Share با موفقیت حذف شد.');
        },
        onError: (error) => {
          toast.error(
            `حذف Web Share با خطا مواجه شد: ${extractWebShareErrorMessage(error)}`
          );
        },
      }
    );
  };

  const renderFilesystemLabel = (filesystem: FileSystemEntry) =>
    `${filesystem.poolName}/${filesystem.filesystemName}`;

  const pendingShareId = deleteShare?.id ?? null;
  const isMutating = deleteWebShare.isPending;
  const webShareHost = window.location.hostname;
  const isCreateMutating = createWebShare.isPending || setWebSharePermission.isPending;

  return (
    <PageContainer>
      <TablePageHeader
        title="اشتراک‌های Web Share"
        // subtitle="مدیریت دسترسی وب برای فایل‌سیستم‌های قابل انتشار"
        refreshAction={{
          onClick: () => void refetchWebShares(),
          disabled: isWebSharesFetching,
          isLoading: isWebSharesFetching,
          loadingLabel: 'در حال بروزرسانی...',
        }}
        primaryAction={{
          label: 'ایجاد Web Share',
          onClick: () => setIsCreateOpen(true),
          disabled: isCreateMutating,
        }}
      />

      {filesystemsError ? (
        <Alert severity="warning" sx={{ mt: 3 }}>
          دریافت لیست فایل‌سیستم‌ها با خطا مواجه شد؛ ایجاد Web Share ممکن است در
          دسترس نباشد.
        </Alert>
      ) : null}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        <WebSharesTable
          detailViewId={WEB_SHARE_DETAIL_VIEW_ID}
          shares={webShares}
          isLoading={isWebSharesLoading}
          error={webSharesError ?? null}
          onDelete={setDeleteShare}
          host={webShareHost}
          pendingShareId={pendingShareId}
          isMutating={isMutating}
        />
      </Box>

      <BlurModal
        open={isCreateOpen}
        onClose={closeCreateDialog}
        title="ایجاد Web Share"
        maxWidth="560px"
        actions={
          <ModalActionButtons
            onCancel={closeCreateDialog}
            onConfirm={handleCreateSubmit}
            confirmLabel="ایجاد"
            disabled={!selectedFilesystem || isCreateMutating}
            isLoading={isCreateMutating}
          />
        }
      >
        <FormControl fullWidth disabled={isFilesystemsLoading || isCreateMutating}>
          <InputLabel id="webshare-filesystem-label">FileSystem</InputLabel>
          <Select
            labelId="webshare-filesystem-label"
            label="FileSystem"
            value={selectedFilesystemKey}
            onChange={(event: SelectChangeEvent) =>
              setSelectedFilesystemKey(event.target.value)
            }
          >
            {availableFilesystems.map((filesystem) => {
              const key = createFilesystemKey(
                filesystem.poolName,
                filesystem.filesystemName
              );
              return (
                <MenuItem key={key} value={key}>
                  {renderFilesystemLabel(filesystem)}
                </MenuItem>
              );
            })}
          </Select>
          <FormHelperText>
            {availableFilesystems.length === 0
              ? 'فقط فایل‌سیستم‌های دارای SMB یا NFS فعال نمایش داده می‌شوند و مورد واجد شرایطی بدون Web Share موجود نیست.'
              : 'فقط فایل‌سیستم‌های اشتراک‌گذاری‌شده از طریق SMB یا NFS و بدون Web Share نمایش داده می‌شوند.'}
          </FormHelperText>
        </FormControl>
      </BlurModal>

      <BlurModal
        open={Boolean(deleteShare)}
        onClose={closeDeleteDialog}
        title="حذف Web Share"
        maxWidth="420px"
        actions={
          <ModalActionButtons
            onCancel={closeDeleteDialog}
            onConfirm={handleDeleteSubmit}
            confirmLabel="حذف"
            disabled={deleteWebShare.isPending}
            isLoading={deleteWebShare.isPending}
            disableConfirmGradient
            confirmProps={{ color: 'error', variant: 'contained' }}
          />
        }
      >
        <Typography sx={{ color: 'var(--color-text)' }}>
          آیا از حذف Web Share برای {deleteShare?.poolName}/{deleteShare?.fsName}{' '}
          مطمئن هستید؟
        </Typography>
      </BlurModal>
    </PageContainer>
  );
};

export default WebShare;
