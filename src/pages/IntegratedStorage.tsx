import { Box, Button, Typography } from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { ZpoolCapacityEntry, ZpoolDetailEntry } from '../@types/zpool';
import ConfirmDeletePoolModal from '../components/integrated-storage/ConfirmDeletePoolModal';
import type { DeviceOption } from '../components/integrated-storage/CreatePoolModal';
import CreatePoolModal from '../components/integrated-storage/CreatePoolModal';
import PoolDiskDetailModal from '../components/integrated-storage/PoolDiskDetailModal';
import AddPoolDiskModal from '../components/integrated-storage/AddPoolDiskModal';
import PoolsTable from '../components/integrated-storage/PoolsTable';
import ReplaceDiskModal from '../components/integrated-storage/ReplaceDiskModal';
import PageContainer from '../components/PageContainer';
import SelectedPoolsDetailsPanel from '../components/integrated-storage/SelectedPoolsDetailsPanel';
import PoolPropertyToggle from '../components/integrated-storage/PoolPropertyToggle';
import { useAddPoolDevices } from '../hooks/useAddPoolDevices';
import { useCreatePool } from '../hooks/useCreatePool';
import { useDeleteZpool } from '../hooks/useDeleteZpool';
import ConfirmExportPoolModal from '../components/integrated-storage/ConfirmExportPoolModal';
import ImportPoolModal from '../components/integrated-storage/ImportPoolModal';
import { type PartitionedDiskInfo, usePartitionedDisks } from '../hooks/useDisk';
import { type PoolDiskSlot, usePoolDeviceSlots } from '../hooks/usePoolDeviceSlots';
import { type ReplaceDevicePayload, useReplacePoolDisk } from '../hooks/useReplacePoolDisk';
import { useZpool } from '../hooks/useZpool';
import { useExportPool } from '../hooks/useExportPool';
import { useImportPool } from '../hooks/useImportPool';
import { fetchZpoolDetails, zpoolDetailQueryKey } from '../hooks/useZpoolDetails';
import {
  localizeDetailEntries,
  translateDetailKey,
} from '../utils/detailLabels';

const MAX_COMPARISON_ITEMS = 4;

const INTERACTIVE_POOL_PROPERTIES = [
  'autoexpand',
  'autoreplace',
  'autotrim',
  'compatibility',
  'listsnapshots',
  'multihost',
] as const;

const buildPoolDetailValues = (
  detail: ZpoolDetailEntry | null,
  poolName: string
): Record<string, unknown> => {
  const localizedValues = localizeDetailEntries(detail);

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

const mapPartitionedDisksToDeviceOptions = (
  partitionedDisks?: PartitionedDiskInfo[] | null
): DeviceOption[] => {
  if (!partitionedDisks || partitionedDisks.length === 0) {
    return [];
  }

  const buildDeviceIdentifier = (devicePath: string | null, wwn: string | null) => {
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

  partitionedDisks.forEach(({ name, path, wwn }) => {
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
    });
  });

  return options.sort((a, b) => a.label.localeCompare(b.label, 'en'));
};

const IntegratedStorage = () => {
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

      toast.error(
        `حذف فضای یکپارچه ${poolName} با خطا مواجه شد`
      );
      console.log(error.message)
    },
  });

  const poolExport = useExportPool({
    onSuccess: (poolName) => {
      toast.success(`برون‌ریزی فضای یکپارچه ${poolName} با موفقیت انجام شد.`);
    },
    onError: (error, poolName) => {
      toast.error(`برون‌ریزی فضای یکپارچه ${poolName} با خطا مواجه شد: ${error.message}`);
    },
  });

  const poolImport = useImportPool({
    onSuccess: (poolName) => {
      toast.success(`درون‌ریزی فضای یکپارچه ${poolName} با موفقیت انجام شد.`);
    },
    onError: (error, poolName) => {
      toast.error(`درون‌ریزی فضای یکپارچه ${poolName} با خطا مواجه شد: ${error.message}`);
    },
  });

  const {
    data,
    isLoading: isPoolsLoading,
    error: zpoolError,
  } = useZpool({
    refetchInterval: 1000,
  });

  const [replacePoolName, setReplacePoolName] = useState<string | null>(null);
  const isReplaceModalOpen = Boolean(replacePoolName);

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

  const [selectedPools, setSelectedPools] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<
    { poolName: string; slot: PoolDiskSlot } | null
  >(null);

  useEffect(() => {
    setSelectedPools((prev) =>
      prev.filter((poolName) => pools.some((pool) => pool.name === poolName))
    );
  }, [pools]);

  const {
    data: poolDevices,
    isLoading: isPoolDeviceLoading,
    isFetching: isPoolDeviceFetching,
    refetch: refetchPoolSlots,
  } = usePoolDeviceSlots(poolNames, {
    enabled: pools.length > 0,
    refetchInterval: 20000,
  });

  const addPoolDevices = useAddPoolDevices({
    onSuccess: (poolName) => {
      toast.success(`افزودن دیسک به ${poolName} ثبت شد.`);
      refetchPoolSlots();
    },
    onError: (message, poolName) => {
      toast.error(`افزودن دیسک به ${poolName} با خطا مواجه شد: ${message}`);
    },
  });

  const {
    data: partitionedDisks,
    isLoading: isPartitionedDiskLoading,
    isFetching: isPartitionedDiskFetching,
    error: partitionedDiskError,
  } = usePartitionedDisks({
    enabled: createPool.isOpen || isReplaceModalOpen || addPoolDevices.isOpen,
    refetchInterval:
      createPool.isOpen || isReplaceModalOpen || addPoolDevices.isOpen
        ? 5000
        : undefined,
  });

  const deviceOptions = useMemo<DeviceOption[]>(() => {
    return mapPartitionedDisksToDeviceOptions(partitionedDisks);
  }, [partitionedDisks]);

  const isDiskLoading =
    isPartitionedDiskLoading ||
    ((createPool.isOpen || isReplaceModalOpen || addPoolDevices.isOpen) &&
      isPartitionedDiskFetching &&
      !partitionedDisks);
  const isReplaceDiskLoading =
    isPartitionedDiskLoading ||
    (isReplaceModalOpen && isPartitionedDiskFetching && !partitionedDisks);
  const isAddDiskLoading =
    isPartitionedDiskLoading ||
    (addPoolDevices.isOpen && isPartitionedDiskFetching && !partitionedDisks);

  const diskError = partitionedDiskError ?? null;

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
    if (typeof window !== 'undefined') {
      window.alert(`ویرایش فضای یکپارچه ${pool.name}`);
    }
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
    setReplacePoolName(pool.name);
  }, []);

  const handleOpenAddDevices = useCallback(
    (pool: ZpoolCapacityEntry) => {
      addPoolDevices.openModal(pool.name);
    },
    [addPoolDevices]
  );

  const handleToggleSelect = useCallback(
    (pool: ZpoolCapacityEntry, checked: boolean) => {
      setSelectedPools((prev) => {
        if (checked) {
          if (prev.includes(pool.name)) {
            return prev;
          }

          if (prev.length >= MAX_COMPARISON_ITEMS) {
            return [...prev.slice(0, MAX_COMPARISON_ITEMS - 1), pool.name];
          }

          return [...prev, pool.name];
        }

        return prev.filter((poolName) => poolName !== pool.name);
      });
    },
    []
  );

  const handleSlotClick = useCallback((poolName: string, slot: PoolDiskSlot) => {
    setSelectedSlot({ poolName, slot });
  }, []);

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

      replaceDisk.mutate({ poolName: replacePoolName, replacements: [payload] });
    },
    [replaceDisk, replacePoolName]
  );

  const isSlotLoading = isPoolDeviceLoading || isPoolDeviceFetching;

  const selectedPoolSlots = replacePoolName
    ? poolDevices?.slotsByPool[replacePoolName] ?? []
    : [];
  const selectedPoolSlotError = replacePoolName
    ? poolDevices?.errorsByPool[replacePoolName] ?? null
    : null;

  const selectedPoolDetails = useQueries({
    queries: selectedPools.map((poolName) => ({
      queryKey: zpoolDetailQueryKey(poolName),
      queryFn: () => fetchZpoolDetails(poolName),
      enabled: selectedPools.length > 0,
      refetchInterval: 10000,
    })),
  });

  const selectedPoolDetailItems = useMemo(
    () =>
      selectedPools.map((poolName, index) => {
        const query = selectedPoolDetails[index];
        const rawDetail = query?.data ?? poolByName[poolName]?.raw ?? null;
        const enhancedDetail = buildPoolDetailValues(rawDetail, poolName);

        return {
          poolName,
          detail: enhancedDetail,
          isLoading: query?.isLoading ?? false,
          error: (query?.error as Error) ?? null,
        };
      }),
    [poolByName, selectedPoolDetails, selectedPools]
  );

  const handleRemoveSelected = useCallback((poolName: string) => {
    setSelectedPools((prev) => prev.filter((name) => name !== poolName));
  }, []);

  return (
    <PageContainer sx={{ backgroundColor: 'var(--color-background)' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 , mb: -5 }}>
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

      <CreatePoolModal
        controller={createPool}
        deviceOptions={deviceOptions}
        isDiskLoading={isDiskLoading}
        diskError={diskError}
        existingPoolNames={poolNames}
      />

      <PoolsTable
        pools={pools}
        isLoading={isPoolsLoading}
        error={zpoolError ?? null}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReplace={handleOpenReplace}
        onAddDevices={handleOpenAddDevices}
        onExport={poolExport.requestExport}
        isDeleteDisabled={poolDeletion.isDeleting}
        selectedPools={selectedPools}
        onToggleSelect={handleToggleSelect}
        slotMap={poolDevices?.slotsByPool}
        slotErrors={poolDevices?.errorsByPool}
        isSlotLoading={isSlotLoading}
        onSlotClick={handleSlotClick}
      />

      <AddPoolDiskModal
        controller={addPoolDevices}
        deviceOptions={deviceOptions}
        isDiskLoading={isAddDiskLoading}
        diskError={diskError}
      />

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

      {selectedPools.length > 0 && (
        <SelectedPoolsDetailsPanel
          items={selectedPoolDetailItems}
          onRemove={handleRemoveSelected}
        />
      )}

      <ConfirmDeletePoolModal controller={poolDeletion} />
      <ConfirmExportPoolModal controller={poolExport} />
      <PoolDiskDetailModal
        open={Boolean(selectedSlot)}
        onClose={handleCloseSlotModal}
        slot={selectedSlot?.slot ?? null}
        poolName={selectedSlot?.poolName ?? null}
      />
      <ImportPoolModal controller={poolImport} />
    </PageContainer>
  );
};

export default IntegratedStorage;