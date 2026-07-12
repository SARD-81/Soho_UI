import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { DiskInventoryItem } from '../@types/disk';
import PageContainer from '../components/PageContainer';
import DisksTable from '../components/disks/DisksTable';
import ConfirmWipeDiskModal from '../components/disks/ConfirmWipeDiskModal';
import SelectedDisksDetailsPanel from '../components/disks/SelectedDisksDetailsPanel';
import { useDiskDetails, useDiskInventory } from '../hooks/useDiskInventory';
import usePoolDeviceNames from '../hooks/usePoolDeviceNames';
import { useDiskPartitionCounts } from '../hooks/useDiskPartitionCounts';
import { cleanupDisk } from '../lib/diskMaintenance';
import extractApiErrorMessage from '../utils/apiError';
import { selectDetailViewState, useDetailSplitViewStore } from '../stores/detailSplitViewStore';

const DISK_DETAIL_VIEW_ID = 'disks';

const Disks = () => {
  const [wipingDisks, setWipingDisks] = useState<Record<string, boolean>>({});
  const [wipeTargetDisk, setWipeTargetDisk] = useState<DiskInventoryItem | null>(null);
  const queryClient = useQueryClient();
  const { data: disks = [], isLoading, error } = useDiskInventory();
  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(
    selectDetailViewState(DISK_DETAIL_VIEW_ID)
  );
  const setActiveItemId = useDetailSplitViewStore((state) => state.setActiveItemId);
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);
  const clearView = useDetailSplitViewStore((state) => state.clearView);
  const detailIds = useMemo(() => {
    const ids = new Set<string>();

    pinnedItemIds.forEach((id) => ids.add(id));

    if (activeItemId) {
      ids.add(activeItemId);
    }

    return Array.from(ids);
  }, [activeItemId, pinnedItemIds]);
  const detailItems = useDiskDetails(detailIds);
  const diskNames = useMemo(() => disks.map((disk) => disk.disk), [disks]);
  const {
    data: poolDeviceNames = [],
    error: poolDevicesError,
    isLoading: isPoolDevicesLoading,
  } = usePoolDeviceNames();
  const partitionCounts = useDiskPartitionCounts(diskNames);
  const partitionCountLookup = useMemo(() => {
    const lookup: Record<string, { partitionCount: number | null; isLoading: boolean }> = {};

    partitionCounts.forEach(({ diskName, partitionCount, isLoading }) => {
      lookup[diskName] = { partitionCount, isLoading };
    });

    return lookup;
  }, [partitionCounts]);

  useEffect(() => {
    if (poolDevicesError) {
      toast.error(poolDevicesError.message);
    }
  }, [poolDevicesError]);

  useEffect(() => {
    clearView(DISK_DETAIL_VIEW_ID);
    return () => clearView(DISK_DETAIL_VIEW_ID);
  }, [clearView]);

  useEffect(() => {
    const validIds = new Set(disks.map((disk) => disk.disk));
    pinnedItemIds.forEach((id) => { if (!validIds.has(id)) unpinItem(DISK_DETAIL_VIEW_ID, id); });
    if (activeItemId && !validIds.has(activeItemId)) {
      setActiveItemId(DISK_DETAIL_VIEW_ID, null);
    }
  }, [activeItemId, disks, pinnedItemIds, setActiveItemId, unpinItem]);

  const handleCloseWipeModal = useCallback(() => {
    setWipeTargetDisk(null);
  }, []);

  const handleConfirmWipeDisk = useCallback(async () => {
      if (!wipeTargetDisk) return;
      const diskName = wipeTargetDisk.disk;
      const toastId = toast.loading(`در حال پاکسازی دیسک ${diskName}...`);

      setWipingDisks((prev) => ({ ...prev, [diskName]: true }));

      try {
        await cleanupDisk(diskName);
        toast.success(`دیسک ${diskName} پاکسازی شد.`, { id: toastId });
        queryClient.invalidateQueries({ queryKey: ['disk', 'inventory'] });
        queryClient.invalidateQueries({ queryKey: ['disk', 'partition-count', diskName] });
        setWipeTargetDisk(null);
      } catch (error) {
        toast.error(
          extractApiErrorMessage(error, 'پاکسازی دیسک با خطا مواجه شد.'),
          { id: toastId }
        );
      } finally {
        setWipingDisks((prev) => {
          const next = { ...prev };
          delete next[diskName];
          return next;
        });
      }
    },
    [queryClient, wipeTargetDisk]
  );

  const activeWipingDisks = useMemo(
    () =>
      Object.entries(wipingDisks)
        .filter(([, isActive]) => isActive)
        .map(([name]) => name),
    [wipingDisks]
  );

  return (
    <PageContainer>
      <Box sx={{ mb: -5 }}>
        <Typography
          variant="h5"
          sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
        >
          اطلاعات دیسک‌ها
        </Typography>
      </Box>

      <Stack direction="column" spacing={3} alignItems="flex-start">
        <Box sx={{ flex: 1, width: '100%' }}>
          <DisksTable
            detailViewId={DISK_DETAIL_VIEW_ID}
            disks={disks}
            isLoading={isLoading}
            error={error ?? null}
            onWipe={setWipeTargetDisk}
            disabledDiskNames={poolDeviceNames}
            wipingDiskNames={activeWipingDisks}
            areActionsLoading={isPoolDevicesLoading}
            partitionStatus={partitionCountLookup}
          />
        </Box>

        {(activeItemId || pinnedItemIds.length > 0) && (
          <Box sx={{ width: { xs: '100%', xl: 'auto' } }}>
            <SelectedDisksDetailsPanel
              items={detailItems}
              activeItemId={activeItemId}
              pinnedItemIds={pinnedItemIds}
              onUnpin={(diskName) => unpinItem(DISK_DETAIL_VIEW_ID, diskName)}
              viewId={DISK_DETAIL_VIEW_ID}
            />
          </Box>
        )}
      </Stack>
      <ConfirmWipeDiskModal
        open={Boolean(wipeTargetDisk)}
        disk={wipeTargetDisk}
        onClose={handleCloseWipeModal}
        onConfirm={handleConfirmWipeDisk}
        isWiping={Boolean(wipeTargetDisk && wipingDisks[wipeTargetDisk.disk])}
      />
    </PageContainer>
  );
};

export default Disks;
