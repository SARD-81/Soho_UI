import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { DiskInventoryItem } from '../@types/disk';
import PageContainer from '../components/PageContainer';
import DisksTable from '../components/disks/DisksTable';
import SelectedDisksDetailsPanel from '../components/disks/SelectedDisksDetailsPanel';
import { useDiskDetails, useDiskInventory } from '../hooks/useDiskInventory';
import usePoolDeviceNames from '../hooks/usePoolDeviceNames';
import { useDiskPartitionCounts } from '../hooks/useDiskPartitionCounts';
import { cleanupDisk } from '../lib/diskMaintenance';
import extractApiErrorMessage from '../utils/apiError';
import { useDetailSplitViewStore } from '../store/detailSplitViewStore';

const Disks = () => {
  const [wipingDisks, setWipingDisks] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const { data: disks = [], isLoading, error } = useDiskInventory();
  const { activeItemId, pinnedItemIds, setActiveItemId, unpinItem } = useDetailSplitViewStore();
  const detailIds = useMemo(
    () => (pinnedItemIds.length > 0 ? pinnedItemIds : activeItemId ? [activeItemId] : []),
    [activeItemId, pinnedItemIds]
  );
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
    const validDisks = new Set(disks.map((disk) => disk.disk));

    pinnedItemIds.forEach((diskName) => {
      if (!validDisks.has(diskName)) {
        unpinItem(diskName);
      }
    });

    if (!activeItemId && disks.length > 0) {
      setActiveItemId(disks[0].disk);
      return;
    }

    if (activeItemId && !validDisks.has(activeItemId)) {
      setActiveItemId(disks[0]?.disk ?? null);
    }
  }, [activeItemId, disks, pinnedItemIds, setActiveItemId, unpinItem]);

  const handleWipeDisk = useCallback(
    async (disk: DiskInventoryItem) => {
      const diskName = disk.disk;
      const toastId = toast.loading(`در حال پاکسازی دیسک ${diskName}...`);

      setWipingDisks((prev) => ({ ...prev, [diskName]: true }));

      try {
        await cleanupDisk(diskName);
        toast.success(`دیسک ${diskName} پاکسازی شد.`, { id: toastId });
        queryClient.invalidateQueries({ queryKey: ['disk', 'inventory'] });
        queryClient.invalidateQueries({ queryKey: ['disk', 'partition-count', diskName] });
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
    [queryClient]
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
            disks={disks}
            isLoading={isLoading}
            error={error ?? null}
            onWipe={handleWipeDisk}
            disabledDiskNames={poolDeviceNames}
            wipingDiskNames={activeWipingDisks}
            areActionsLoading={isPoolDevicesLoading}
            partitionStatus={partitionCountLookup}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', xl: 'auto' } }}>
          <SelectedDisksDetailsPanel
            items={detailItems}
            activeItemId={activeItemId}
            pinnedItemIds={pinnedItemIds}
            onUnpin={unpinItem}
          />
        </Box>
      </Stack>
    </PageContainer>
  );
};

export default Disks;