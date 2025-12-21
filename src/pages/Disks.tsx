import { Box, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { DiskInventoryItem } from '../@types/disk';
import PageContainer from '../components/PageContainer';
import DisksTable from '../components/disks/DisksTable';
import SelectedDisksDetailsPanel from '../components/disks/SelectedDisksDetailsPanel';
import { useDiskDetails, useDiskInventory } from '../hooks/useDiskInventory';
import usePinnedSelection from '../hooks/usePinnedSelection';
import usePoolDeviceNames from '../hooks/usePoolDeviceNames';
import { useDiskPartitionCounts } from '../hooks/useDiskPartitionCounts';
import { cleanupDisk } from '../lib/diskMaintenance';
import extractApiErrorMessage from '../utils/apiError';

const Disks = () => {
  const {
    selectedIds: selectedDisks,
    pinnedId: pinnedDisk,
    select: selectDisk,
    remove: removeDisk,
    pin: pinDisk,
    unpin: unpinDisk,
    prune,
    setSelection,
  } = usePinnedSelection();
  const [wipingDisks, setWipingDisks] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: disks = [], isLoading, error } = useDiskInventory();
  const detailItems = useDiskDetails(selectedDisks);
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
    const parsed = (searchParams.get('selected') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    setSelection(parsed);
  }, [searchParams, setSelection]);

  useEffect(() => {
    prune(disks.map((disk) => disk.disk));
  }, [disks, prune]);

  useEffect(() => {
    setSearchParams((prevParams) => {
      const params = new URLSearchParams(prevParams);

      if (selectedDisks.length > 0) {
        params.set('selected', selectedDisks.join(','));
      } else {
        params.delete('selected');
      }

      return params;
    });
  }, [selectedDisks, setSearchParams]);

  const handleToggleSelect = useCallback(
    (disk: DiskInventoryItem, checked: boolean) => {
      if (checked) {
        selectDisk(disk.disk);
        return;
      }

      removeDisk(disk.disk);
    },
    [removeDisk, selectDisk]
  );

  const handleRemoveSelected = useCallback(
    (diskName: string) => {
      removeDisk(diskName);
    },
    [removeDisk]
  );

  useEffect(() => {
    if (poolDevicesError) {
      toast.error(poolDevicesError.message);
    }
  }, [poolDevicesError]);

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
            selectedDiskNames={selectedDisks}
            onToggleSelect={handleToggleSelect}
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
            onRemove={handleRemoveSelected}
            pinnedId={pinnedDisk}
            onPin={pinDisk}
            onUnpin={unpinDisk}
          />
        </Box>
      </Stack>
    </PageContainer>
  );
};

export default Disks;