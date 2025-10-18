import { Box, Button, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import ConfirmDeletePoolModal from '../components/integrated-storage/ConfirmDeletePoolModal';
import type { DeviceOption } from '../components/integrated-storage/CreatePoolModal';
import CreatePoolModal from '../components/integrated-storage/CreatePoolModal';
import PoolsTable from '../components/integrated-storage/PoolsTable';
import { useCreatePool } from '../hooks/useCreatePool';
import { useDeleteZpool } from '../hooks/useDeleteZpool';
import { useDiskWwnMap, useFreeDisks } from '../hooks/useDisk';
import { useZpool } from '../hooks/useZpool';

const MAX_COMPARISON_ITEMS = 4;

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
        `حذف فضای یکپارچه ${poolName} با خطا مواجه شد: ${error.message}`
      );
    },
  });

  const {
    data,
    isLoading: isPoolsLoading,
    error: zpoolError,
  } = useZpool({
    refetchInterval: 1000,
  });

  const {
    data: freeDisks,
    isLoading: isFreeDiskLoading,
    isFetching: isFreeDiskFetching,
    error: freeDiskError,
  } = useFreeDisks({
    enabled: createPool.isOpen,
    refetchInterval: createPool.isOpen ? 5000 : undefined,
  });

  const {
    data: diskWwnMap,
    isFetching: isDiskMapFetching,
    error: diskMapError,
  } = useDiskWwnMap({
    enabled: createPool.isOpen,
    refetchInterval: createPool.isOpen ? 5000 : undefined,
  });

  const deviceOptions = useMemo<DeviceOption[]>(() => {
    if (!freeDisks || freeDisks.length === 0) {
      return [];
    }

    const wwnMap = diskWwnMap?.data ?? {};
    const uniqueValues = new Set<string>();
    const options: DeviceOption[] = [];

    freeDisks.forEach((diskName) => {
      const trimmedName = diskName.trim();
      if (!trimmedName) {
        return;
      }

      const normalizedValue = trimmedName.startsWith('/dev/')
        ? trimmedName
        : `/dev/${trimmedName}`;

      if (uniqueValues.has(normalizedValue)) {
        return;
      }

      uniqueValues.add(normalizedValue);
      const wwnPath = wwnMap[normalizedValue];

      options.push({
        label: normalizedValue.replace(/^\/dev\//, ''),
        value: normalizedValue,
        tooltip: wwnPath ?? normalizedValue,
        wwn: wwnPath,
      });
    });

    return options.sort((a, b) => a.label.localeCompare(b.label, 'en'));
  }, [diskWwnMap?.data, freeDisks]);

  const isDiskLoading =
    isFreeDiskLoading ||
    (createPool.isOpen && isFreeDiskFetching && !freeDisks) ||
    (createPool.isOpen && isDiskMapFetching && !diskWwnMap);

  const diskError = freeDiskError ?? diskMapError ?? null;

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);
  const poolNames = useMemo(
    () => pools.map((pool) => pool.name).filter((name) => name.trim().length > 0),
    [pools]
  );

  const [selectedPools, setSelectedPools] = useState<string[]>([]);

  useEffect(() => {
    setSelectedPools((prev) =>
      prev.filter((poolName) => pools.some((pool) => pool.name === poolName))
    );
  }, [pools]);

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

  const handleToggleSelect = useCallback(
    (pool: ZpoolCapacityEntry, checked: boolean) => {
      setSelectedPools((prev) => {
        if (checked) {
          if (prev.includes(pool.name)) {
            return prev;
          }

          if (prev.length >= MAX_COMPARISON_ITEMS) {
            return [
              ...prev.slice(0, MAX_COMPARISON_ITEMS - 1),
              pool.name,
            ];
          }

          return [...prev, pool.name];
        }

        return prev.filter((poolName) => poolName !== pool.name);
      });
    },
    []
  );

  return (
    <Box sx={{ p: 3, fontFamily: 'var(--font-vazir)' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
            فضای یکپارچه
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
            ایجاد
          </Button>
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
        isDeleteDisabled={poolDeletion.isDeleting}
        selectedPools={selectedPools}
        onToggleSelect={handleToggleSelect}
      />

      {/*{selectedPools.length > 0 && (*/}
      {/*  <SelectedPoolsDetailsPanel*/}
      {/*    items={selectedPoolDetailItems}*/}
      {/*    onRemove={handleRemoveSelected}*/}
      {/*  />*/}
      {/*)}*/}

      <ConfirmDeletePoolModal controller={poolDeletion} />
    </Box>
  );
};

export default IntegratedStorage;