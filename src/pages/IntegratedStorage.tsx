import { Alert, Box, Button, Chip, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { ZpoolCapacityEntry } from '../@types/zpool';
import ConfirmDeletePoolModal from '../components/integrated-storage/ConfirmDeletePoolModal';
import CreatePoolModal from '../components/integrated-storage/CreatePoolModal';
import PoolsTable from '../components/integrated-storage/PoolsTable';
import { useCreatePool } from '../hooks/useCreatePool';
import { useDisk } from '../hooks/useDisk';
import { useDeleteZpool } from '../hooks/useDeleteZpool';
import { useZpool } from '../hooks/useZpool';
import {
  clampPercent,
  formatCapacity,
  resolveStatus,
  STATUS_STYLES,
} from '../components/integrated-storage/status';

const IntegratedStorage = () => {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [selectedPoolNames, setSelectedPoolNames] = useState<string[]>([]);
  const [poolPendingDelete, setPoolPendingDelete] = useState<ZpoolCapacityEntry | null>(
    null
  );
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const handleFeedback = useCallback((message: string | null) => {
    setFeedbackMessage(message);
  }, []);

  const createPool = useCreatePool({
    onSuccess: (poolName) => {
      handleFeedback(`Pool ${poolName} با موفقیت ایجاد شد.`);
    },
  });

  const deletePoolMutation = useDeleteZpool();

  const { data, isLoading: isPoolsLoading, error: zpoolError } = useZpool({
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

    return Object.keys(summary).sort((a, b) => a.localeCompare(b, 'en'));
  }, [diskData?.summary.disk_io_summary]);

  const pools = useMemo(() => data?.pools ?? [], [data?.pools]);

  useEffect(() => {
    setSelectedPoolNames((prev) =>
      prev.filter((name) => pools.some((pool) => pool.name === name))
    );
  }, [pools]);

  const selectedPools = useMemo(
    () =>
      selectedPoolNames
        .map((name) => pools.find((pool) => pool.name === name))
        .filter((pool): pool is ZpoolCapacityEntry => Boolean(pool)),
    [pools, selectedPoolNames]
  );

  const isSelectionLimitReached = selectedPools.length >= 3;

  const handleEdit = useCallback((pool: ZpoolCapacityEntry) => {
    if (typeof window !== 'undefined') {
      window.alert(`ویرایش Pool ${pool.name}`);
    }
  }, []);

  const handleOpenCreate = useCallback(() => {
    handleFeedback(null);
    createPool.openCreateModal();
  }, [createPool, handleFeedback]);

  const handleDelete = useCallback(
    (pool: ZpoolCapacityEntry) => {
      handleFeedback(null);
      setDeleteErrorMessage(null);
      setPoolPendingDelete(pool);
    },
    [handleFeedback]
  );

  const handleCloseDeleteModal = useCallback(() => {
    setPoolPendingDelete(null);
    setDeleteErrorMessage(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!poolPendingDelete || deletePoolMutation.isPending) {
      return;
    }

    setDeleteErrorMessage(null);

    deletePoolMutation.mutate(
      { name: poolPendingDelete.name },
      {
        onSuccess: () => {
          handleFeedback(`Pool ${poolPendingDelete.name} با موفقیت حذف شد.`);
          handleCloseDeleteModal();
        },
        onError: (error) => {
          setDeleteErrorMessage(error.message);
          handleFeedback(
            `حذف Pool ${poolPendingDelete.name} با خطا مواجه شد: ${error.message}`
          );
        },
      }
    );
  }, [deletePoolMutation, handleCloseDeleteModal, handleFeedback, poolPendingDelete]);

  const handleTogglePoolSelection = useCallback(
    (pool: ZpoolCapacityEntry, shouldSelect: boolean) => {
      setSelectedPoolNames((prev) => {
        if (shouldSelect) {
          if (prev.includes(pool.name)) {
            return prev;
          }

          if (prev.length >= 3) {
            toast.error('حداکثر می‌توانید سه Pool را برای مقایسه انتخاب کنید.');
            return prev;
          }

          return [...prev, pool.name];
        }

        return prev.filter((name) => name !== pool.name);
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
          <Typography variant="h5" sx={{ color: 'var(--color-primary)', fontWeight: 700 }}>
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

        {feedbackMessage && (
          <Alert
            severity={feedbackMessage.includes('خطا') ? 'error' : 'success'}
            onClose={() => handleFeedback(null)}
            sx={{
              borderRadius: '10px',
              backgroundColor: 'var(--color-card-bg)',
              color: 'var(--color-text)',
              '& .MuiAlert-icon': {
                color: feedbackMessage.includes('خطا')
                  ? 'var(--color-error)'
                  : 'var(--color-primary)',
              },
            }}
          >
            {feedbackMessage}
          </Alert>
        )}
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
        isDeleteDisabled={deletePoolMutation.isPending}
        selectedPoolNames={selectedPoolNames}
        onTogglePoolSelection={handleTogglePoolSelection}
        isSelectionLimitReached={isSelectionLimitReached}
      />

      {selectedPools.length > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-input-border)',
            boxShadow: '0 18px 40px -24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text)' }}>
              مقایسه Pool های انتخاب‌شده
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-secondary)' }}>
              حداکثر سه Pool را می‌توانید به صورت هم‌زمان مشاهده کنید. برای حذف هر مورد، تیک آن را از جدول بردارید.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                md: `repeat(${Math.min(selectedPools.length, 3)}, 1fr)`,
              },
            }}
          >
            {selectedPools.map((pool) => {
              const status = resolveStatus(pool.health);
              const statusStyle = STATUS_STYLES[status.key];
              const utilization = clampPercent(pool.capacityPercent);

              return (
                <Box
                  key={pool.name}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid var(--color-input-border)',
                    backgroundColor: 'rgba(0, 198, 169, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.75,
                    minHeight: 280,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '1.05rem' }}>
                      {pool.name}
                    </Typography>
                    <Chip
                      label={status.label}
                      size="small"
                      sx={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gap: 1.25 }}>
                    <DetailRow label="ظرفیت کل" value={formatCapacity(pool.totalBytes)} />
                    <DetailRow label="حجم مصرف‌شده" value={formatCapacity(pool.usedBytes)} />
                    <DetailRow label="حجم آزاد" value={formatCapacity(pool.freeBytes)} />
                    <DetailRow
                      label="درصد مصرف"
                      value={utilization != null ? `${utilization.toFixed(1)}٪` : '-'}
                    />
                    <DetailRow label="Deduplication" value={pool.deduplication ?? '-'} />
                    <DetailRow
                      label="نسبت Dedup"
                      value={
                        pool.deduplicationRatio != null
                          ? pool.deduplicationRatio.toFixed(2)
                          : '-'
                      }
                    />
                    <DetailRow
                      label="درصد Fragmentation"
                      value={
                        pool.fragmentationPercent != null
                          ? `${pool.fragmentationPercent}٪`
                          : '-'
                      }
                    />
                  </Box>

                  <Box
                    component="pre"
                    sx={{
                      mt: 'auto',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      borderRadius: 2,
                      p: 1.5,
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      maxHeight: 200,
                      overflow: 'auto',
                      direction: 'ltr',
                      textAlign: 'left',
                    }}
                  >
                    {JSON.stringify(pool.raw, null, 2)}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      <ConfirmDeletePoolModal
        isOpen={Boolean(poolPendingDelete)}
        targetPool={poolPendingDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={deletePoolMutation.isPending}
        errorMessage={deleteErrorMessage}
      />
    </Box>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow = ({ label, value }: DetailRowProps) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
    <Typography variant="body2" sx={{ color: 'var(--color-secondary)' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: 'var(--color-text)', fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export default IntegratedStorage;
