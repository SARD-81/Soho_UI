import { Box } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { NfsShareEntry, NfsSharePayload } from '../@types/nfs';
import PageContainer from '../components/PageContainer';
import TablePageHeader from '../components/common/TablePageHeader';
import ConfirmDeleteNfsShareModal from '../components/nfs/ConfirmDeleteNfsShareModal';
import NfsShareModal from '../components/nfs/NfsShareModal';
import NfsSharesTable from '../components/nfs/NfsSharesTable';
import { useCreateNfsShare } from '../hooks/useCreateNfsShare';
import { useDeleteNfsShare } from '../hooks/useDeleteNfsShare';
import { useFilesystemMountpoints } from '../hooks/useFilesystemMountpoints';
import { useNfsShares } from '../hooks/useNfsShares';
import { useUpdateNfsShare } from '../hooks/useUpdateNfsShare';

const NFS_DETAIL_VIEW_ID = 'nfs-shares';

const ShareNfs = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editShare, setEditShare] = useState<NfsShareEntry | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const {
    data: rawShares = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useNfsShares();
  const shares = useMemo(
    () => [...rawShares].sort((a, b) => a.path.localeCompare(b.path, 'fa-IR')),
    [rawShares]
  );

  const createShare = useCreateNfsShare({
    onSuccess: (path) => {
      toast.success(`اشتراک NFS با مسیر ${path} با موفقیت ایجاد شد.`);
      setIsCreateOpen(false);
      setCreateError(null);
    },
    onError: (message) => {
      setCreateError(message);
      toast.error(`ایجاد اشتراک NFS با خطا مواجه شد: ${message}`);
    },
  });

  const updateShare = useUpdateNfsShare({
    onSuccess: (path) => {
      toast.success(`اشتراک NFS با مسیر ${path} با موفقیت ویرایش شد.`);
      setEditShare(null);
      setEditError(null);
    },
    onError: (message) => {
      setEditError(message);
      toast.error(`ویرایش اشتراک NFS با خطا مواجه شد: ${message}`);
    },
  });

  const deleteShare = useDeleteNfsShare({
    onSuccess: (path) => {
      toast.success(`اشتراک NFS با مسیر ${path} با موفقیت حذف شد.`);
    },
    onError: (deleteError, path) => {
      toast.error(
        `حذف اشتراک NFS با مسیر ${path} با خطا مواجه شد: ${deleteError.message}`
      );
    },
  });

  const { data: mountpointOptions = [], isLoading: mountpointLoading } =
    useFilesystemMountpoints({ enabled: isCreateOpen });
  const availableMountpoints = useMemo(() => {
    const usedPaths = new Set(shares.map((share) => share.path));
    return mountpointOptions.filter((option) => !usedPaths.has(option));
  }, [mountpointOptions, shares]);

  const handleOpenCreate = useCallback(() => {
    setCreateError(null);
    setIsCreateOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setIsCreateOpen(false);
    setCreateError(null);
  }, []);

  const handleOpenEdit = useCallback((share: NfsShareEntry) => {
    setEditShare(share);
    setEditError(null);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditShare(null);
    setEditError(null);
  }, []);

  const handleCreateSubmit = useCallback(
    (payload: NfsSharePayload) => {
      createShare.mutate(payload);
    },
    [createShare]
  );

  const handleUpdateSubmit = useCallback(
    (payload: NfsSharePayload) => {
      updateShare.mutate(payload);
    },
    [updateShare]
  );

  const handleDeleteShare = useCallback(
    (share: NfsShareEntry) => {
      deleteShare.requestDelete(share);
    },
    [deleteShare]
  );

  return (
    <PageContainer>
      <TablePageHeader
        title="اشتراک‌های NFS"
        subtitle="مدیریت مسیرهای اشتراک‌گذاری و کلاینت‌های مجاز"
        refreshAction={{
          onClick: () => void refetch(),
          disabled: isFetching,
          isLoading: isFetching,
          loadingLabel: 'در حال بروزرسانی...',
        }}
        primaryAction={{
          label: 'ایجاد اشتراک NFS',
          onClick: handleOpenCreate,
        }}
      />

      <NfsShareModal
        open={isCreateOpen}
        mode="create"
        mountpointOptions={availableMountpoints}
        mountpointLoading={mountpointLoading}
        isSubmitting={createShare.isPending}
        errorMessage={createError}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSubmit}
      />

      <NfsShareModal
        open={Boolean(editShare)}
        mode="edit"
        mountpointOptions={[]}
        initialShare={editShare}
        isSubmitting={updateShare.isPending}
        errorMessage={editError}
        onClose={handleCloseEdit}
        onSubmit={handleUpdateSubmit}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <NfsSharesTable
          detailViewId={NFS_DETAIL_VIEW_ID}
          shares={shares}
          isLoading={isLoading}
          error={error ?? null}
          onDelete={handleDeleteShare}
          onEdit={handleOpenEdit}
          pendingPath={deleteShare.pendingPath}
          isDeleting={deleteShare.isDeleting}
        />

        {/* <SelectedNfsSharesDetailsPanel items={shares} viewId={NFS_DETAIL_VIEW_ID} /> */}
      </Box>

      <ConfirmDeleteNfsShareModal controller={deleteShare} />
    </PageContainer>
  );
};

export default ShareNfs;
