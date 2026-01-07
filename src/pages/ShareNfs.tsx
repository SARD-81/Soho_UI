import { Box, Button, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { NfsShareEntry, NfsSharePayload } from '../@types/nfs';
import PageContainer from '../components/PageContainer';
import ConfirmDeleteNfsShareModal from '../components/nfs/ConfirmDeleteNfsShareModal';
import NfsShareModal from '../components/nfs/NfsShareModal';
import NfsSharesTable from '../components/nfs/NfsSharesTable';
import SelectedNfsSharesDetailsPanel from '../components/nfs/SelectedNfsSharesDetailsPanel';
import { useCreateNfsShare } from '../hooks/useCreateNfsShare';
import { useDeleteNfsShare } from '../hooks/useDeleteNfsShare';
import { useFilesystemMountpoints } from '../hooks/useFilesystemMountpoints';
import { useNfsShares } from '../hooks/useNfsShares';
import { useUpdateNfsShare } from '../hooks/useUpdateNfsShare';
import { selectDetailViewState, useDetailSplitViewStore } from '../stores/detailSplitViewStore';

const NFS_DETAIL_VIEW_ID = 'nfs-shares';

const ShareNfs = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editShare, setEditShare] = useState<NfsShareEntry | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const { data: rawShares = [], isLoading, error } = useNfsShares();
  const shares = useMemo(
    () => [...rawShares].sort((a, b) => a.path.localeCompare(b.path, 'fa-IR')),
    [rawShares]
  );

  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(
    selectDetailViewState(NFS_DETAIL_VIEW_ID)
  );
  const setActiveItemId = useDetailSplitViewStore((state) => state.setActiveItemId);
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);

  useEffect(() => {
    const validIds = new Set(shares.map((share) => share.path));

    pinnedItemIds.forEach((sharePath) => {
      if (!validIds.has(sharePath)) {
        unpinItem(NFS_DETAIL_VIEW_ID, sharePath);
      }
    });

    if (!activeItemId && shares.length > 0) {
      setActiveItemId(NFS_DETAIL_VIEW_ID, shares[0].path);
    } else if (activeItemId && !validIds.has(activeItemId)) {
      setActiveItemId(NFS_DETAIL_VIEW_ID, shares.length > 0 ? shares[0].path : null);
    }
  }, [activeItemId, pinnedItemIds, setActiveItemId, shares, unpinItem]);

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
      toast.error(`حذف اشتراک NFS با مسیر ${path} با خطا مواجه شد: ${deleteError.message}`);
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
            اشتراک‌های NFS
          </Typography>

          <Button
            onClick={handleOpenCreate}
            variant="contained"
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
            ایجاد اشتراک NFS
          </Button>
        </Box>
      </Box>

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

        <SelectedNfsSharesDetailsPanel items={shares} viewId={NFS_DETAIL_VIEW_ID} />
      </Box>

      <ConfirmDeleteNfsShareModal controller={deleteShare} />
    </PageContainer>
  );
};

export default ShareNfs;
