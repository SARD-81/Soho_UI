import {
  Alert,
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { FileSystemEntry } from '../@types/filesystem';
import type { WebShareEntry } from '../@types/webshare';
import BlurModal from '../components/BlurModal';
import ModalActionButtons from '../components/common/ModalActionButtons';
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
      (filesystemData?.filesystems ?? []).filter(
        (filesystem) =>
          !existingWebShareKeys.has(
            createFilesystemKey(filesystem.poolName, filesystem.filesystemName)
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: -5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
          >
            اشتراک‌های Web Share
          </Typography>

          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
            <Button
              onClick={() => void refetchWebShares()}
              variant="outlined"
              disabled={isWebSharesFetching}
              sx={{
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
                borderRadius: '3px',
                fontWeight: 700,
              }}
            >
              به‌روزرسانی لیست
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="contained"
              disabled={isCreateMutating}
              sx={{
                px: 3,
                py: 1.25,
                borderRadius: '3px',
                fontWeight: 700,
                fontSize: '0.95rem',
                background:
                  'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
                color: 'var(--color-bg)',
                boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
              }}
            >
              ایجاد Web Share
            </Button>
          </Stack>
        </Box>
      </Box>

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
              ? 'همه فایل‌سیستم‌های موجود Web Share دارند یا لیست در دسترس نیست.'
              : 'فایل‌سیستم‌های دارای Web Share تکراری نمایش داده نمی‌شوند.'}
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
