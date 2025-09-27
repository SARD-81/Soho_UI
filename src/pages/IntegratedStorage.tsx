import { Box, Button, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import ConfirmDeletePoolModal from '../components/integrated-storage/ConfirmDeletePoolModal';
import CreatePoolModal from '../components/integrated-storage/CreatePoolModal';
import PoolsTable from '../components/integrated-storage/PoolsTable';
import { useCreatePool } from '../hooks/useCreatePool';
import { useDeleteZpool } from '../hooks/useDeleteZpool';
import { useDisk } from '../hooks/useDisk';
import { useZpool } from '../hooks/useZpool';

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
    refetchInterval: 15000,
  });

  const {
    data: diskData,
    isLoading: isDiskLoading,
    error: diskError,
  } = useDisk({
    enabled: createPool.isOpen,
    refetchInterval: createPool.isOpen ? 5000 : undefined,
  });

  const deviceOptions = useMemo(() => {
    const summary = diskData?.summary.disk_io_summary;
    if (!summary) {
      return [] as string[];
    }

    return Object.keys(summary)
      .filter((device) => device.length === 3 && device.startsWith('sd'))
      .sort((a, b) => a.localeCompare(b, 'en'));
  }, [diskData?.summary.disk_io_summary]);

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);

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
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              background:
                'linear-gradient(135deg, var(--color-primary) 0%, rgba(31, 182, 255, 0.95) 100%)',
              color: 'var(--color-bg)',
              boxShadow: '0 16px 32px -18px rgba(31, 182, 255, 0.85)',
              '&:hover': {
                background:
                  'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
                boxShadow: '0 18px 36px -18px rgba(0, 198, 169, 0.75)',
              },
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
        diskError={diskError ?? null}
      />

      <PoolsTable
        pools={pools}
        isLoading={isPoolsLoading}
        error={zpoolError ?? null}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleteDisabled={poolDeletion.isDeleting}
      />

      <ConfirmDeletePoolModal controller={poolDeletion} />
    </Box>
  );
};

export default IntegratedStorage;
