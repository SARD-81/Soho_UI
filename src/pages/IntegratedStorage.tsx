import { Box, Button, Typography } from '@mui/material';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQueries } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { ZpoolCapacityEntry, ZpoolDetailEntry } from '../@types/zpool';
import ConfirmDeletePoolModal from '../components/integrated-storage/ConfirmDeletePoolModal';
import CreatePoolModal from '../components/integrated-storage/CreatePoolModal';
import type { DeviceOption } from '../components/integrated-storage/CreatePoolModal';
import PoolsTable from '../components/integrated-storage/PoolsTable';
import SelectedPoolsDetailsPanel from '../components/integrated-storage/SelectedPoolsDetailsPanel';
import { useCreatePool } from '../hooks/useCreatePool';
import { useDeleteZpool } from '../hooks/useDeleteZpool';
import { useDiskWwnMap } from '../hooks/useDisk';
import { useZpool } from '../hooks/useZpool';
import {
  fetchZpoolDetails,
  zpoolDetailQueryKey,
} from '../hooks/useZpoolDetails';

const IntegratedStorage = () => {
  const createPool = useCreatePool({
    onSuccess: (poolName) => {
      toast.success(`Pool ${poolName} با موفقیت ایجاد شد.`);
    },
    onError: (errorMessage) => {
      toast.error(`ایجاد Pool با خطا مواجه شد: ${errorMessage}`);
    },
  });

  const poolDeletion = useDeleteZpool({
    onSuccess: (poolName) => {
      toast.success(`Pool ${poolName} با موفقیت حذف شد.`);
    },
    onError: (error, poolName) => {
      toast.error(`حذف Pool ${poolName} با خطا مواجه شد: ${error.message}`);
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
    data: diskWwnMap,
    isLoading: isDiskMapLoading,
    isFetching: isDiskMapFetching,
    error: diskMapError,
  } = useDiskWwnMap({
    enabled: createPool.isOpen,
    refetchInterval: createPool.isOpen ? 5000 : undefined,
  });

  const deviceOptions = useMemo<DeviceOption[]>(() => {
    const data = diskWwnMap?.data;
    if (!data) {
      return [];
    }

    return Object.entries(data)
      .map(([devicePath, wwnPath]) => {
        const deviceLabel = devicePath.split('/').pop() ?? devicePath;
        const normalizedWwnPath =
          typeof wwnPath === 'string' ? wwnPath : String(wwnPath ?? '');
        const wwnValue =
          normalizedWwnPath.split('/').pop() ?? normalizedWwnPath;

        if (!wwnValue) {
          return null;
        }

        return {
          label: deviceLabel,
          value: wwnValue,
          tooltip: wwnValue,
        } satisfies DeviceOption;
      })
      .filter((option): option is DeviceOption => option !== null)
      .sort((a, b) => a.label.localeCompare(b.label, 'en'));
  }, [diskWwnMap?.data]);

  const isDiskLoading =
    isDiskMapLoading || (createPool.isOpen && isDiskMapFetching && !diskWwnMap);

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);

  const [selectedPools, setSelectedPools] = useState<string[]>([]);

  useEffect(() => {
    setSelectedPools((prev) =>
      prev.filter((poolName) => pools.some((pool) => pool.name === poolName))
    );
  }, [pools]);

  const handleEdit = useCallback((pool: ZpoolCapacityEntry) => {
    if (typeof window !== 'undefined') {
      window.alert(`ویرایش Pool ${pool.name}`);
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

          if (prev.length >= 3) {
            toast.error('امکان مقایسه بیش از سه Pool وجود ندارد.');
            return prev;
          }

          return [...prev, pool.name];
        }

        return prev.filter((poolName) => poolName !== pool.name);
      });
    },
    []
  );

  const handleRemoveSelected = useCallback((poolName: string) => {
    setSelectedPools((prev) => prev.filter((name) => name !== poolName));
  }, []);

  const selectedPoolQueries = useQueries({
    queries: selectedPools.map((poolName) => ({
      queryKey: zpoolDetailQueryKey(poolName),
      queryFn: () => fetchZpoolDetails(poolName),
      staleTime: 15000,
      refetchInterval: 15000,
      enabled: selectedPools.length > 0,
    })),
  }) as UseQueryResult<ZpoolDetailEntry | null, Error>[];

  const selectedPoolDetailItems = useMemo(
    () =>
      selectedPools.map((poolName, index) => {
        const query = selectedPoolQueries[index];
        const isLoading =
          query?.isPending ?? query?.isLoading ?? query?.isFetching ?? false;

        return {
          poolName,
          detail: (query?.data as ZpoolDetailEntry | null) ?? null,
          isLoading,
          error: (query?.error as Error) ?? null,
        };
      }),
    [selectedPools, selectedPoolQueries]
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
        diskError={diskMapError ?? null}
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

      {selectedPools.length > 0 && (
        <SelectedPoolsDetailsPanel
          items={selectedPoolDetailItems}
          onRemove={handleRemoveSelected}
        />
      )}

      <ConfirmDeletePoolModal controller={poolDeletion} />
    </Box>
  );
};

export default IntegratedStorage;
