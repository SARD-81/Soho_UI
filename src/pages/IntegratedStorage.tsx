import { Box, Button, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import ConfirmDeletePoolModal from '../components/integrated-storage/ConfirmDeletePoolModal';
import type { DeviceOption } from '../components/integrated-storage/CreatePoolModal';
import CreatePoolModal from '../components/integrated-storage/CreatePoolModal';
import PoolsTable from '../components/integrated-storage/PoolsTable';
import PageContainer from '../components/PageContainer';
import { useCreatePool } from '../hooks/useCreatePool';
import { useDeleteZpool } from '../hooks/useDeleteZpool';
import { usePartitionedDisks } from '../hooks/useDisk';
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
    data: partitionedDisks,
    isLoading: isPartitionedDiskLoading,
    isFetching: isPartitionedDiskFetching,
    error: partitionedDiskError,
  } = usePartitionedDisks({
    enabled: createPool.isOpen,
    refetchInterval: createPool.isOpen ? 5000 : undefined,
  });

  const deviceOptions = useMemo<DeviceOption[]>(() => {
    if (!partitionedDisks || partitionedDisks.length === 0) {
      return [];
    }

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
  }, [partitionedDisks]);

  const isDiskLoading =
    isPartitionedDiskLoading ||
    (createPool.isOpen && isPartitionedDiskFetching && !partitionedDisks);

  const diskError = partitionedDiskError ?? null;

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);
  const poolNames = useMemo(
    () =>
      pools.map((pool) => pool.name).filter((name) => name.trim().length > 0),
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
            return [...prev.slice(0, MAX_COMPARISON_ITEMS - 1), pool.name];
          }

          return [...prev, pool.name];
        }

        return prev.filter((poolName) => poolName !== pool.name);
      });
    },
    []
  );

  return (
    <PageContainer sx={{ backgroundColor: 'var(--color-background)' }}>
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
    </PageContainer>
  );
};

export default IntegratedStorage;
