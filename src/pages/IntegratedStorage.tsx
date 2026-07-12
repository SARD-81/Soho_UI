import { useQueries, useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import type { ZpoolCapacityEntry, ZpoolDetailEntry } from '../@types/zpool';
import TablePageHeader from '../components/common/TablePageHeader';
import type { DeviceOption } from '../components/integrated-storage/CreatePoolModal';
import PoolPropertyToggle from '../components/integrated-storage/PoolPropertyToggle';
import PoolsTable from '../components/integrated-storage/PoolsTable';
import SelectedPoolsDetailsPanel from '../components/integrated-storage/SelectedPoolsDetailsPanel';
import PageContainer from '../components/PageContainer';
import { useAddPoolDevices } from '../hooks/useAddPoolDevices';
import { useCreatePool } from '../hooks/useCreatePool';
import { useDeleteZpool } from '../hooks/useDeleteZpool';
import { type PartitionedDiskInfo, usePartitionedDisks } from '../hooks/useDisk';
import { useExportPool } from '../hooks/useExportPool';
import { useImportPool } from '../hooks/useImportPool';
import { type PoolDiskSlot, usePoolDeviceSlots } from '../hooks/usePoolDeviceSlots';
import { type ReplaceDevicePayload, useReplacePoolDisk } from '../hooks/useReplacePoolDisk';
import { useZpool, zpoolQueryKey } from '../hooks/useZpool';
import { fetchZpoolDetails, zpoolDetailQueryKey } from '../hooks/useZpoolDetails';
import { selectDetailViewState, useDetailSplitViewStore } from '../stores/detailSplitViewStore';
import { localizeDetailEntries, translateDetailKey } from '../utils/detailLabels';
import { normalizeByIdDiskBase } from '../utils/diskIdentifier';
import { createPoolDisksTable } from '../utils/poolDetails';

const MAX_COMPARISON_ITEMS = 4;
const POOL_DETAIL_VIEW_ID = 'pools';
const INTERACTIVE_POOL_PROPERTIES = ['autoexpand', 'autoreplace', 'autotrim', 'listsnapshots', 'multihost'] as const;

const CreatePoolModal = lazy(() => import('../components/integrated-storage/CreatePoolModal'));
const AddPoolDiskModal = lazy(() => import('../components/integrated-storage/AddPoolDiskModal'));
const ReplaceDiskModal = lazy(() => import('../components/integrated-storage/ReplaceDiskModal'));
const ImportPoolModal = lazy(() => import('../components/integrated-storage/ImportPoolModal'));
const ConfirmDeletePoolModal = lazy(() => import('../components/integrated-storage/ConfirmDeletePoolModal'));
const ConfirmExportPoolModal = lazy(() => import('../components/integrated-storage/ConfirmExportPoolModal'));
const PoolDiskDetailModal = lazy(() => import('../components/integrated-storage/PoolDiskDetailModal'));

const normalizeDiskIdentifier = (value: unknown) => {
  const normalized = String(value ?? '').replace(/^\/dev\//, '').trim();
  return normalized.length > 0 ? normalized : null;
};

const buildDiskSlotLookup = (slots: PoolDiskSlot[]) => {
  const lookup = new Map<string, PoolDiskSlot>();
  slots.forEach((slot) => {
    if (slot.diskName) lookup.set(slot.diskName, slot);
  });
  return lookup;
};

const attachSlotNumbersToDisks = (disks: unknown, slots: PoolDiskSlot[]) => {
  if (!Array.isArray(disks) || slots.length === 0) return disks;
  const slotLookup = buildDiskSlotLookup(slots);
  return disks.map((disk) => {
    if (!disk || typeof disk !== 'object') return disk;
    const diskRecord = disk as Record<string, unknown>;
    const diskKey = normalizeDiskIdentifier(diskRecord.disk_name) ?? normalizeDiskIdentifier(diskRecord.full_disk_name) ?? normalizeDiskIdentifier(diskRecord.full_path_name);
    const slotNumber = diskKey ? slotLookup.get(diskKey)?.slotNumber : null;
    return slotNumber == null ? disk : { ...diskRecord, slot_number: slotNumber };
  });
};

const buildPoolDetailValues = (detail: ZpoolDetailEntry | null, poolName: string, slots: PoolDiskSlot[]): Record<string, unknown> => {
  const localizedValues = localizeDetailEntries(detail);
  localizedValues[translateDetailKey('disks')] = createPoolDisksTable(attachSlotNumbersToDisks(detail?.disks, slots));
  INTERACTIVE_POOL_PROPERTIES.forEach((propertyKey) => {
    localizedValues[translateDetailKey(propertyKey)] = (
      <PoolPropertyToggle key={`${poolName}-${propertyKey}`} poolName={poolName} propertyKey={propertyKey} value={detail?.[propertyKey]} />
    );
  });
  return localizedValues;
};

const mapPartitionedDisksToDeviceOptions = (partitionedDisks?: PartitionedDiskInfo[] | null): DeviceOption[] => {
  if (!partitionedDisks?.length) return [];
  const uniqueValues = new Set<string>();
  const options: DeviceOption[] = [];

  partitionedDisks.forEach(({ name, path, wwn, slotNumber }) => {
    const trimmedWwn = wwn?.trim();
    const trimmedPath = path?.trim();
    const identifier = trimmedWwn ? normalizeByIdDiskBase(trimmedWwn) : trimmedPath;

    if (!identifier || uniqueValues.has(identifier)) return;
    uniqueValues.add(identifier);
    options.push({ label: (path ?? name).replace(/^\/dev\//, '') || name, value: identifier, tooltip: identifier, wwn: wwn ?? undefined, slotNumber });
  });

  return options.sort((a, b) => a.label.localeCompare(b.label, 'en'));
};

const IntegratedStorage = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isIntegratedStorageRoute = location.pathname.toLowerCase() === '/integrated-space';

  const refreshIntegratedStorageData = useCallback(async (poolName?: string) => {
    if (!isIntegratedStorageRoute) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: zpoolQueryKey }),
      poolName ? queryClient.invalidateQueries({ queryKey: zpoolDetailQueryKey(poolName) }) : Promise.resolve(),
      queryClient.invalidateQueries({ queryKey: ['zpool', 'devices'] }),
      queryClient.invalidateQueries({ queryKey: ['disk', 'partitioned'] }),
    ]);
  }, [isIntegratedStorageRoute, queryClient]);

  const createPool = useCreatePool({
    onSuccess: (poolName) => { toast.success(`فضای یکپارچه ${poolName} با موفقیت ایجاد شد.`); void refreshIntegratedStorageData(poolName); },
    onError: (errorMessage: string) => { toast.error(`ایجاد فضای یکپارچه با خطا مواجه شد: ${errorMessage}`); },
  });

  const poolDeletion = useDeleteZpool({
    onSuccess: (poolName) => { toast.success(`فضای یکپارچه ${poolName} با موفقیت حذف شد.`); void refreshIntegratedStorageData(poolName); },
    onError: (error, poolName) => {
      if (error.message.includes('shareConfiguration')) {
        toast.error(`حذف فضای یکپارچه ${poolName} امکان‌پذیر نیست؛ ابتدا تمام فایل‌سیستم‌های وابسته به این فضا را حذف کنید.`);
        return;
      }
      toast.error(`حذف فضای یکپارچه ${poolName} با خطا مواجه شد: ${error.message}`);
    },
  });

  const poolExport = useExportPool({
    onSuccess: (poolName) => { toast.success(`آزادسازی فضای یکپارچه ${poolName} با موفقیت انجام شد.`); void refreshIntegratedStorageData(poolName); },
    onError: (error, poolName) => { toast.error(`آزادسازی فضای یکپارچه ${poolName} با خطا مواجه شد: ${error.message}`); },
  });

  const poolImport = useImportPool({
    onSuccess: (poolName) => { toast.success(`فراخوانی فضای یکپارچه ${poolName} با موفقیت انجام شد.`); void refreshIntegratedStorageData(poolName); },
    onError: (error, poolName) => { toast.error(`فراخوانی فضای یکپارچه ${poolName} با خطا مواجه شد: ${error.message}`); },
  });

  const { data, isLoading: isPoolsLoading, error: zpoolError } = useZpool({ enabled: isIntegratedStorageRoute, refetchInterval: 30 * 1000 });
  const [replacePoolName, setReplacePoolName] = useState<string | null>(null);
  const [shouldLoadPoolSlots, setShouldLoadPoolSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ poolName: string; slot: PoolDiskSlot } | null>(null);
  const isReplaceModalOpen = Boolean(replacePoolName);

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);
  const poolByName = useMemo(() => Object.fromEntries(pools.map((pool) => [pool.name, pool])), [pools]);
  const poolNames = useMemo(() => pools.map((pool) => pool.name).filter((name) => name.trim().length > 0), [pools]);
  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(selectDetailViewState(POOL_DETAIL_VIEW_ID));
  const setActiveItemId = useDetailSplitViewStore((state) => state.setActiveItemId);
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);

  useEffect(() => {
    const validPools = new Set(pools.map((pool) => pool.name));
    pinnedItemIds.forEach((poolName) => { if (!validPools.has(poolName)) unpinItem(POOL_DETAIL_VIEW_ID, poolName); });
    if (activeItemId && !validPools.has(activeItemId)) setActiveItemId(POOL_DETAIL_VIEW_ID, null);
  }, [activeItemId, pinnedItemIds, pools, setActiveItemId, unpinItem]);

  useEffect(() => () => { setActiveItemId(POOL_DETAIL_VIEW_ID, null); }, [setActiveItemId]);
  useEffect(() => () => { window.setTimeout(() => { setActiveItemId(POOL_DETAIL_VIEW_ID, null); }, 0); }, [setActiveItemId]);

  const shouldFetchPoolSlots = isIntegratedStorageRoute && shouldLoadPoolSlots && pools.length > 0;
  const { data: poolDevices, isLoading: isPoolDeviceLoading, refetch: refetchPoolSlots } = usePoolDeviceSlots(poolNames, {
    enabled: shouldFetchPoolSlots,
    refetchInterval: shouldFetchPoolSlots ? 30 * 1000 : undefined,
  });

  const handleLoadPoolSlots = useCallback(() => {
    if (!shouldLoadPoolSlots) { setShouldLoadPoolSlots(true); return; }
    void refetchPoolSlots();
  }, [refetchPoolSlots, shouldLoadPoolSlots]);

  const addPoolDevices = useAddPoolDevices({
    onSuccess: (poolName) => { toast.success(`افزودن دیسک به ${poolName} ثبت شد.`); void refreshIntegratedStorageData(poolName); void refetchPoolSlots(); },
    onError: (message, poolName) => { toast.error(`افزودن دیسک به ${poolName} با خطا مواجه شد: ${message}`); },
  });

  const shouldFetchPartitionedDisks = isIntegratedStorageRoute && (createPool.isOpen || isReplaceModalOpen || addPoolDevices.isOpen);
  const { data: partitionedDisks, isLoading: isPartitionedDiskLoading, isFetching: isPartitionedDiskFetching, error: partitionedDiskError } = usePartitionedDisks({
    enabled: shouldFetchPartitionedDisks,
    refetchInterval: shouldFetchPartitionedDisks ? 5000 : undefined,
  });

  const deviceOptions = useMemo<DeviceOption[]>(() => mapPartitionedDisksToDeviceOptions(partitionedDisks), [partitionedDisks]);
  const isDiskLoading = isPartitionedDiskLoading || (shouldFetchPartitionedDisks && isPartitionedDiskFetching && !partitionedDisks);
  const isReplaceDiskLoading = isPartitionedDiskLoading || (isPartitionedDiskFetching && !partitionedDisks);
  const isAddDiskLoading = isPartitionedDiskLoading || (addPoolDevices.isOpen && isPartitionedDiskFetching && !partitionedDisks);
  const diskError = partitionedDiskError ?? null;

  const replaceDisk = useReplacePoolDisk({
    onSuccess: (poolName) => { toast.success(`جایگزینی دیسک برای فضای ${poolName} ثبت شد.`); void refreshIntegratedStorageData(poolName); void refetchPoolSlots(); setReplacePoolName(null); },
    onError: (message, poolName) => { toast.error(`جایگزینی دیسک برای ${poolName} با خطا مواجه شد: ${message}`); },
  });

  const handleEdit = useCallback((pool: ZpoolCapacityEntry) => { void pool; }, []);
  const handleOpenCreate = useCallback(() => { createPool.openCreateModal(); }, [createPool]);
  const handleDelete = useCallback((pool: ZpoolCapacityEntry) => { poolDeletion.requestDelete(pool); }, [poolDeletion]);
  const handleOpenReplace = useCallback((pool: ZpoolCapacityEntry) => { setShouldLoadPoolSlots(true); setReplacePoolName(pool.name); }, []);
  const handleOpenAddDevices = useCallback((pool: ZpoolCapacityEntry) => { addPoolDevices.openModal(pool.name); }, [addPoolDevices]);
  const handleSlotClick = useCallback((poolName: string, slot: PoolDiskSlot) => { setSelectedSlot({ poolName, slot }); }, []);
  const handleCloseSlotModal = useCallback(() => { setSelectedSlot(null); }, []);
  const handleCloseReplace = useCallback(() => { setReplacePoolName(null); replaceDisk.reset(); }, [replaceDisk]);
  const handleSubmitReplacement = useCallback((payload: ReplaceDevicePayload) => {
    if (!replacePoolName) return;
    replaceDisk.mutate({ poolName: replacePoolName, replacements: [payload] });
  }, [replaceDisk, replacePoolName]);

  const isSlotLoading = shouldFetchPoolSlots && isPoolDeviceLoading;
  const selectedPoolSlots = replacePoolName ? (poolDevices?.slotsByPool[replacePoolName] ?? []) : [];
  const selectedPoolSlotError = replacePoolName ? (poolDevices?.errorsByPool[replacePoolName] ?? null) : null;

  const poolDetailIds = useMemo(() => {
    if (!isIntegratedStorageRoute) return [];
    const ids = new Set<string>();
    pinnedItemIds.forEach((poolName) => ids.add(poolName));
    if (activeItemId) ids.add(activeItemId);
    return Array.from(ids).slice(0, MAX_COMPARISON_ITEMS);
  }, [activeItemId, isIntegratedStorageRoute, pinnedItemIds]);

  const poolDetailQueries = useQueries({
    queries: poolDetailIds.map((poolName) => ({
      queryKey: zpoolDetailQueryKey(poolName),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchZpoolDetails(poolName, signal),
      enabled: isIntegratedStorageRoute && Boolean(poolName),
      refetchInterval: 30 * 1000,
      staleTime: 25 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      meta: { skipGlobalLoader: true },
    })),
  });

  const selectedPoolDetailItems = useMemo(() => poolDetailIds.map((poolName, index) => {
    const query = poolDetailQueries[index];
    const rawDetail = query?.data ?? poolByName[poolName]?.raw ?? null;
    return {
      poolName,
      detail: buildPoolDetailValues(rawDetail, poolName, poolDevices?.slotsByPool[poolName] ?? []),
      isLoading: query?.isLoading ?? false,
      error: (query?.error as Error) ?? null,
    };
  }), [poolByName, poolDetailIds, poolDetailQueries, poolDevices?.slotsByPool]);

  const shouldRenderPoolDetails = isIntegratedStorageRoute && selectedPoolDetailItems.length > 0;

  return (
    <PageContainer sx={{ backgroundColor: 'var(--color-background)' }}>
      <TablePageHeader
        title="فضای یکپارچه"
        // subtitle="مدیریت Poolها، دیسک‌ها و عملیات نگهداری فضای ذخیره‌سازی"
        primaryAction={{ label: 'ایجاد', onClick: handleOpenCreate }}
        actions={[{ label: 'فراخوانی', onClick: poolImport.openModal, tooltip: 'فراخوانی فضای یکپارچه آزاد شده از سیستم' }]}
      />

      <Suspense fallback={null}>
        {createPool.isOpen && <CreatePoolModal controller={createPool} deviceOptions={deviceOptions} isDiskLoading={isDiskLoading} diskError={diskError} existingPoolNames={poolNames} />}
        <PoolsTable detailViewId={POOL_DETAIL_VIEW_ID} pools={pools} isLoading={isPoolsLoading} error={zpoolError ?? null} onEdit={handleEdit} onDelete={handleDelete} onReplace={handleOpenReplace} onAddDevices={handleOpenAddDevices} onExport={poolExport.requestExport} isDeleteDisabled={poolDeletion.isDeleting} slotMap={poolDevices?.slotsByPool} slotErrors={poolDevices?.errorsByPool} isSlotLoading={isSlotLoading} slotsEnabled={shouldLoadPoolSlots} onLoadSlots={handleLoadPoolSlots} onSlotClick={handleSlotClick} />
        {addPoolDevices.isOpen && <AddPoolDiskModal controller={addPoolDevices} deviceOptions={deviceOptions} isDiskLoading={isAddDiskLoading} diskError={diskError} />}
        {isReplaceModalOpen && <ReplaceDiskModal open={isReplaceModalOpen} poolName={replacePoolName} slots={selectedPoolSlots} newDiskOptions={deviceOptions} onClose={handleCloseReplace} onSubmit={handleSubmitReplacement} isSubmitting={replaceDisk.isPending} slotError={selectedPoolSlotError} isNewDiskLoading={isReplaceDiskLoading} apiError={replaceDisk.error?.message ?? null} />}
        {shouldRenderPoolDetails && <SelectedPoolsDetailsPanel items={selectedPoolDetailItems} onRemove={(poolName) => unpinItem(POOL_DETAIL_VIEW_ID, poolName)} viewId={POOL_DETAIL_VIEW_ID} />}
        {poolDeletion.isOpen && <ConfirmDeletePoolModal controller={poolDeletion} />}
        {poolExport.isOpen && <ConfirmExportPoolModal controller={poolExport} />}
        {selectedSlot && <PoolDiskDetailModal open onClose={handleCloseSlotModal} slot={selectedSlot.slot} poolName={selectedSlot.poolName} />}
        {poolImport.isOpen && <ImportPoolModal controller={poolImport} />}
      </Suspense>
    </PageContainer>
  );
};

export default IntegratedStorage;
