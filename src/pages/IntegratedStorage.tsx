import { Box, Button, Tooltip, Typography } from '@mui/material';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cancelIntegratedStorageQueries } from '../utils/cancelIntegratedStorageQueries';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import type { ZpoolCapacityEntry, ZpoolDetailEntry } from '../@types/zpool';
import type { DeviceOption } from '../components/integrated-storage/CreatePoolModal';
import PoolPropertyToggle from '../components/integrated-storage/PoolPropertyToggle';
import PoolsTable from '../components/integrated-storage/PoolsTable';
import SelectedPoolsDetailsPanel from '../components/integrated-storage/SelectedPoolsDetailsPanel';
import PageContainer from '../components/PageContainer';
import { useAddPoolDevices } from '../hooks/useAddPoolDevices';
import { useCreatePool } from '../hooks/useCreatePool';
import { useDeleteZpool } from '../hooks/useDeleteZpool';
import {
  type PartitionedDiskInfo,
  usePartitionedDisks,
} from '../hooks/useDisk';
import { useExportPool } from '../hooks/useExportPool';
import { useImportPool } from '../hooks/useImportPool';
import {
  type PoolDiskSlot,
  usePoolDeviceSlots,
} from '../hooks/usePoolDeviceSlots';
import {
  type ReplaceDevicePayload,
  useReplacePoolDisk,
} from '../hooks/useReplacePoolDisk';
import { useZpool } from '../hooks/useZpool';
import {
  fetchZpoolDetails,
  zpoolDetailQueryKey,
} from '../hooks/useZpoolDetails';
import {
  selectDetailViewState,
  useDetailSplitViewStore,
} from '../stores/detailSplitViewStore';
import {
  localizeDetailEntries,
  translateDetailKey,
} from '../utils/detailLabels';
import { createPoolDisksTable } from '../utils/poolDetails';

const MAX_COMPARISON_ITEMS = 4;
const POOL_DETAIL_VIEW_ID = 'pools';

// Pool properties rendered as interactive toggles inside the detail comparison panel.
const INTERACTIVE_POOL_PROPERTIES = [
  'autoexpand',
  'autoreplace',
  'autotrim',
  'listsnapshots',
  'multihost',
] as const;

const CreatePoolModal = lazy(
  () => import('../components/integrated-storage/CreatePoolModal')
);

const AddPoolDiskModal = lazy(
  () => import('../components/integrated-storage/AddPoolDiskModal')
);

const ReplaceDiskModal = lazy(
  () => import('../components/integrated-storage/ReplaceDiskModal')
);

const ImportPoolModal = lazy(
  () => import('../components/integrated-storage/ImportPoolModal')
);

const ConfirmDeletePoolModal = lazy(
  () => import('../components/integrated-storage/ConfirmDeletePoolModal')
);

const ConfirmExportPoolModal = lazy(
  () => import('../components/integrated-storage/ConfirmExportPoolModal')
);

const PoolDiskDetailModal = lazy(
  () => import('../components/integrated-storage/PoolDiskDetailModal')
);

// Normalizes disk identifiers so /dev paths and raw disk names can be matched consistently.
const normalizeDiskIdentifier = (value: unknown) => {
  const normalized = String(value ?? '')
    .replace(/^\/dev\//, '')
    .trim();
  return normalized.length > 0 ? normalized : null;
};

// Builds a quick lookup from disk name to physical slot metadata.
const buildDiskSlotLookup = (slots: PoolDiskSlot[]) => {
  const lookup = new Map<string, PoolDiskSlot>();

  slots.forEach((slot) => {
    if (slot.diskName) {
      lookup.set(slot.diskName, slot);
    }
  });

  return lookup;
};

// Enriches pool disk records with slot numbers when matching slot data is available.
const attachSlotNumbersToDisks = (disks: unknown, slots: PoolDiskSlot[]) => {
  if (!Array.isArray(disks) || slots.length === 0) {
    return disks;
  }

  const slotLookup = buildDiskSlotLookup(slots);

  return disks.map((disk) => {
    if (!disk || typeof disk !== 'object') {
      return disk;
    }

    const diskRecord = disk as Record<string, unknown>;
    const diskKey =
      normalizeDiskIdentifier(diskRecord.disk_name) ??
      normalizeDiskIdentifier(diskRecord.full_disk_name) ??
      normalizeDiskIdentifier(diskRecord.full_path_name);
    const slotNumber = diskKey ? slotLookup.get(diskKey)?.slotNumber : null;

    if (slotNumber == null) {
      return disk;
    }

    return { ...diskRecord, slot_number: slotNumber };
  });
};

// Converts raw pool details into display values and injects interactive controls where needed.
const buildPoolDetailValues = (
  detail: ZpoolDetailEntry | null,
  poolName: string,
  slots: PoolDiskSlot[]
): Record<string, unknown> => {
  const localizedValues = localizeDetailEntries(detail);
  const disksWithSlots = attachSlotNumbersToDisks(detail?.disks, slots);

  localizedValues[translateDetailKey('disks')] =
    createPoolDisksTable(disksWithSlots);

  INTERACTIVE_POOL_PROPERTIES.forEach((propertyKey) => {
    const label = translateDetailKey(propertyKey);

    localizedValues[label] = (
      <PoolPropertyToggle
        key={`${poolName}-${propertyKey}`}
        poolName={poolName}
        propertyKey={propertyKey}
        value={detail?.[propertyKey]}
      />
    );
  });

  return localizedValues;
};

// Converts available partitioned disks into unique selectable device options for pool actions.
const mapPartitionedDisksToDeviceOptions = (
  partitionedDisks?: PartitionedDiskInfo[] | null
): DeviceOption[] => {
  if (!partitionedDisks || partitionedDisks.length === 0) {
    return [];
  }

  // Prefer stable by-id paths when WWN data exists, otherwise fall back to the device path.
  const buildDeviceIdentifier = (
    devicePath: string | null,
    wwn: string | null
  ) => {
    const trimmedPath = devicePath?.trim();

    if (wwn) {
      const trimmedWwn = wwn.trim();

      if (trimmedWwn.length > 0) {
        if (trimmedWwn.startsWith('/dev/')) {
          return trimmedWwn;
        }

        const sanitizedWwn = trimmedWwn.replace(/^\/dev\/disk\/by-id\//, '');
        return `/dev/disk/by-id/${sanitizedWwn}`;
      }
    }

    if (trimmedPath && trimmedPath.length > 0) {
      return trimmedPath;
    }

    return null;
  };

  const uniqueValues = new Set<string>();
  const options: DeviceOption[] = [];

  partitionedDisks.forEach(({ name, path, wwn, slotNumber }) => {
    const identifier = buildDeviceIdentifier(path, wwn);

    if (!identifier || uniqueValues.has(identifier)) {
      return;
    }

    uniqueValues.add(identifier);

    options.push({
      label: (path ?? name).replace(/^\/dev\//, '') || name,
      value: identifier,
      tooltip: identifier,
      wwn: wwn ?? undefined,
      slotNumber,
    });
  });

  return options.sort((a, b) => a.label.localeCompare(b.label, 'en'));
};

const IntegratedStorage = () => {
  const queryClient = useQueryClient();
  const location = useLocation();

  const isIntegratedStorageRoute =
    location.pathname.toLowerCase() === '/integrated-space';

  const createPool = useCreatePool({
    onSuccess: (poolName) => {
      toast.success(`فضای یکپارچه ${poolName} با موفقیت ایجاد شد.`);
    },
    onError: (errorMessage: string) => {
      toast.error(`ایجاد فضای یکپارچه با خطا مواجه شد: ${errorMessage}`);
    },
  });

  const poolDeletion = useDeleteZpool({
    onSuccess: (poolName) => {
      toast.success(`فضای یکپارچه ${poolName} با موفقیت حذف شد.`);
    },
    onError: (error, poolName) => {
      if (error.message.includes('shareConfiguration')) {
        toast.error(
          `حذف فضای یکپارچه ${poolName} امکان‌پذیر نیست؛ ابتدا تمام فایل‌سیستم‌های وابسته به این فضا را حذف کنید.`
        );
        return;
      }

      toast.error(`حذف فضای یکپارچه ${poolName} با خطا مواجه شد`);
      console.log(error.message);
    },
  });

  const poolExport = useExportPool({
    onSuccess: (poolName) => {
      toast.success(`آزادسازی فضای یکپارچه ${poolName} با موفقیت انجام شد.`);
    },
    onError: (error, poolName) => {
      toast.error(
        `آزادسازی فضای یکپارچه ${poolName} با خطا مواجه شد: ${error.message}`
      );
    },
  });

  const poolImport = useImportPool({
    onSuccess: (poolName) => {
      toast.success(`فراخوانی فضای یکپارچه ${poolName} با موفقیت انجام شد.`);
    },
    onError: (error, poolName) => {
      toast.error(
        `فراخوانی فضای یکپارچه ${poolName} با خطا مواجه شد: ${error.message}`
      );
    },
  });

  const {
    data,
    isLoading: isPoolsLoading,
    error: zpoolError,
  } = useZpool({
    enabled: isIntegratedStorageRoute,
    refetchInterval: 1 * 60 * 1000,
  });

  const [replacePoolName, setReplacePoolName] = useState<string | null>(null);
  const isReplaceModalOpen = Boolean(replacePoolName);

  const [shouldLoadPoolSlots, setShouldLoadPoolSlots] = useState(false);

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);
  const poolByName = useMemo(
    () => Object.fromEntries(pools.map((pool) => [pool.name, pool])),
    [pools]
  );
  const poolNames = useMemo(
    () =>
      pools.map((pool) => pool.name).filter((name) => name.trim().length > 0),
    [pools]
  );

  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(
    selectDetailViewState(POOL_DETAIL_VIEW_ID)
  );
  const setActiveItemId = useDetailSplitViewStore(
    (state) => state.setActiveItemId
  );
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);
  const [selectedSlot, setSelectedSlot] = useState<{
    poolName: string;
    slot: PoolDiskSlot;
  } | null>(null);

  useEffect(() => {
    const validPools = new Set(pools.map((pool) => pool.name));

    pinnedItemIds.forEach((poolName) => {
      if (!validPools.has(poolName)) {
        unpinItem(POOL_DETAIL_VIEW_ID, poolName);
      }
    });

    if (activeItemId && !validPools.has(activeItemId)) {
      setActiveItemId(POOL_DETAIL_VIEW_ID, null);
    }
  }, [activeItemId, pinnedItemIds, pools, setActiveItemId, unpinItem]);

  useEffect(() => {
    return () => {
      setActiveItemId(POOL_DETAIL_VIEW_ID, null);
    };
  }, [setActiveItemId]);

  const shouldFetchPoolSlots =
    isIntegratedStorageRoute && shouldLoadPoolSlots && pools.length > 0;

  const {
    data: poolDevices,
    isLoading: isPoolDeviceLoading,
    refetch: refetchPoolSlots,
  } = usePoolDeviceSlots(poolNames, {
    enabled: shouldFetchPoolSlots,
    refetchInterval: shouldFetchPoolSlots ? 60 * 1000 : undefined,
  });

  const handleLoadPoolSlots = useCallback(() => {
    if (!shouldLoadPoolSlots) {
      setShouldLoadPoolSlots(true);
      return;
    }

    void refetchPoolSlots();
  }, [refetchPoolSlots, shouldLoadPoolSlots]);

  const addPoolDevices = useAddPoolDevices({
    onSuccess: (poolName) => {
      toast.success(`افزودن دیسک به ${poolName} ثبت شد.`);
      refetchPoolSlots();
    },
    onError: (message, poolName) => {
      toast.error(`افزودن دیسک به ${poolName} با خطا مواجه شد: ${message}`);
    },
  });
  const shouldFetchPartitionedDisks =
    isIntegratedStorageRoute &&
    (createPool.isOpen || isReplaceModalOpen || addPoolDevices.isOpen);

  const {
    data: partitionedDisks,
    isLoading: isPartitionedDiskLoading,
    isFetching: isPartitionedDiskFetching,
    error: partitionedDiskError,
  } = usePartitionedDisks({
    enabled: shouldFetchPartitionedDisks,
    refetchInterval: shouldFetchPartitionedDisks ? 5000 : undefined,
  });

  const deviceOptions = useMemo<DeviceOption[]>(() => {
    return mapPartitionedDisksToDeviceOptions(partitionedDisks);
  }, [partitionedDisks]);

  useEffect(() => {
  return () => {
    void cancelIntegratedStorageQueries(queryClient);
    setActiveItemId(POOL_DETAIL_VIEW_ID, null);
  };
}, [queryClient, setActiveItemId]);

  const isDiskLoading =
    isPartitionedDiskLoading ||
    (shouldFetchPartitionedDisks &&
      isPartitionedDiskFetching &&
      !partitionedDisks);

  const isReplaceDiskLoading =
    isPartitionedDiskLoading ||
    (isPartitionedDiskFetching && !partitionedDisks);

  const isAddDiskLoading =
    isPartitionedDiskLoading ||
    (addPoolDevices.isOpen && isPartitionedDiskFetching && !partitionedDisks);

  const diskError = partitionedDiskError ?? null;

  // Keeps replacement side effects here so the modal stays focused on user input.
  const replaceDisk = useReplacePoolDisk({
    onSuccess: (poolName) => {
      toast.success(`جایگزینی دیسک برای فضای ${poolName} ثبت شد.`);
      refetchPoolSlots();
      setReplacePoolName(null);
    },
    onError: (message, poolName) => {
      toast.error(`جایگزینی دیسک برای ${poolName} با خطا مواجه شد: ${message}`);
    },
  });

  const handleEdit = useCallback((pool: ZpoolCapacityEntry) => {
    console.log(pool);
  }, []);

  const handleOpenCreate = useCallback(() => {
    createPool.openCreateModal();
  }, [createPool]);

  const handleDelete = useCallback(
    (pool: ZpoolCapacityEntry) => {
      poolDeletion.requestDelete(pool);
    },
    [poolDeletion]
  );

  const handleOpenReplace = useCallback((pool: ZpoolCapacityEntry) => {
    setShouldLoadPoolSlots(true);
    setReplacePoolName(pool.name);
  }, []);

  const handleOpenAddDevices = useCallback(
    (pool: ZpoolCapacityEntry) => {
      addPoolDevices.openModal(pool.name);
    },
    [addPoolDevices]
  );

  const handleSlotClick = useCallback(
    (poolName: string, slot: PoolDiskSlot) => {
      setSelectedSlot({ poolName, slot });
    },
    []
  );

  const handleCloseSlotModal = useCallback(() => {
    setSelectedSlot(null);
  }, []);

  const handleCloseReplace = useCallback(() => {
    setReplacePoolName(null);
    replaceDisk.reset();
  }, [replaceDisk]);

  const handleSubmitReplacement = useCallback(
    (payload: ReplaceDevicePayload) => {
      if (!replacePoolName) {
        return;
      }

      replaceDisk.mutate({
        poolName: replacePoolName,
        replacements: [payload],
      });
    },
    [replaceDisk, replacePoolName]
  );

  const isSlotLoading = shouldFetchPoolSlots && isPoolDeviceLoading;

  const selectedPoolSlots = replacePoolName
    ? (poolDevices?.slotsByPool[replacePoolName] ?? [])
    : [];
  const selectedPoolSlotError = replacePoolName
    ? (poolDevices?.errorsByPool[replacePoolName] ?? null)
    : null;
  // Limits comparison queries to the active pool plus pinned pools to keep the panel manageable.
  const poolDetailIds = useMemo(() => {
    if (!isIntegratedStorageRoute) {
      return [];
    }

    const ids = new Set<string>();

    pinnedItemIds.forEach((poolName) => ids.add(poolName));

    if (activeItemId) {
      ids.add(activeItemId);
    }

    return Array.from(ids).slice(0, MAX_COMPARISON_ITEMS);
  }, [activeItemId, isIntegratedStorageRoute, pinnedItemIds]);

  // Fetches details for each visible comparison item and refreshes them independently.
  const poolDetailQueries = useQueries({
    queries: poolDetailIds.map((poolName) => ({
      queryKey: zpoolDetailQueryKey(poolName),
      queryFn: ({ signal }) => fetchZpoolDetails(poolName, signal),
      enabled: isIntegratedStorageRoute && Boolean(poolName),
      refetchInterval: 30 * 1000,
      staleTime: 25 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      meta: {
        skipGlobalLoader: true,
      },
    })),
  });

  const selectedPoolDetailItems = useMemo(
    () =>
      poolDetailIds.map((poolName, index) => {
        const query = poolDetailQueries[index];
        const rawDetail = query?.data ?? poolByName[poolName]?.raw ?? null;
        const poolSlots = poolDevices?.slotsByPool[poolName] ?? [];
        const enhancedDetail = buildPoolDetailValues(
          rawDetail,
          poolName,
          poolSlots
        );

        return {
          poolName,
          detail: enhancedDetail,
          isLoading: query?.isLoading ?? false,
          error: (query?.error as Error) ?? null,
        };
      }),
    [poolByName, poolDetailIds, poolDetailQueries, poolDevices?.slotsByPool]
  );

  const shouldRenderPoolDetails =
    isIntegratedStorageRoute && selectedPoolDetailItems.length > 0;

  return (
    <PageContainer sx={{ backgroundColor: 'var(--color-background)' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: -5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            // gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: 'var(--color-primary)', fontWeight: 700 }}
          >
            فضای یکپارچه
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title=" فراخوانی فضای یکپارچه آزاد شده از سیستم‌">
              <Button
                onClick={poolImport.openModal}
                variant="outlined"
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: '3px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--color-primary)',
                  borderColor: 'rgba(31, 182, 255, 0.5)',
                }}
              >
                فراخوانی
              </Button>
            </Tooltip>
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
              ایجاد
            </Button>
          </Box>
        </Box>
      </Box>

      <Suspense fallback={null}>
        {createPool.isOpen && (
          <CreatePoolModal
            controller={createPool}
            deviceOptions={deviceOptions}
            isDiskLoading={isDiskLoading}
            diskError={diskError}
            existingPoolNames={poolNames}
          />
        )}

        <PoolsTable
          detailViewId={POOL_DETAIL_VIEW_ID}
          pools={pools}
          isLoading={isPoolsLoading}
          error={zpoolError ?? null}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReplace={handleOpenReplace}
          onAddDevices={handleOpenAddDevices}
          onExport={poolExport.requestExport}
          isDeleteDisabled={poolDeletion.isDeleting}
          slotMap={poolDevices?.slotsByPool}
          slotErrors={poolDevices?.errorsByPool}
          isSlotLoading={isSlotLoading}
          slotsEnabled={shouldLoadPoolSlots}
          onLoadSlots={handleLoadPoolSlots}
          onSlotClick={handleSlotClick}
        />

        {addPoolDevices.isOpen && (
          <AddPoolDiskModal
            controller={addPoolDevices}
            deviceOptions={deviceOptions}
            isDiskLoading={isAddDiskLoading}
            diskError={diskError}
          />
        )}

        {isReplaceModalOpen && (
          <ReplaceDiskModal
            open={isReplaceModalOpen}
            poolName={replacePoolName}
            slots={selectedPoolSlots}
            newDiskOptions={deviceOptions}
            onClose={handleCloseReplace}
            onSubmit={handleSubmitReplacement}
            isSubmitting={replaceDisk.isPending}
            slotError={selectedPoolSlotError}
            isNewDiskLoading={isReplaceDiskLoading}
            apiError={replaceDisk.error?.message ?? null}
          />
        )}

        {shouldRenderPoolDetails && (
          <SelectedPoolsDetailsPanel
            items={selectedPoolDetailItems}
            onRemove={(poolName) => unpinItem(POOL_DETAIL_VIEW_ID, poolName)}
            viewId={POOL_DETAIL_VIEW_ID}
          />
        )}

        {poolDeletion.isOpen && (
          <ConfirmDeletePoolModal controller={poolDeletion} />
        )}

        {poolExport.isOpen && (
          <ConfirmExportPoolModal controller={poolExport} />
        )}
        {selectedSlot && (
          <PoolDiskDetailModal
            open
            onClose={handleCloseSlotModal}
            slot={selectedSlot.slot}
            poolName={selectedSlot.poolName}
          />
        )}

        {poolImport.isOpen && <ImportPoolModal controller={poolImport} />}
      </Suspense>
    </PageContainer>
  );
};

export default IntegratedStorage;
