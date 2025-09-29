import { Box, Button, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import CreateShareModal from '../components/share/CreateShareModal';
import SelectedSharesDetailsPanel from '../components/share/SelectedSharesDetailsPanel';
import SharesTable from '../components/share/SharesTable';
import type { SambaShareEntry } from '../@types/samba';
import { useCreateShare } from '../hooks/useCreateShare';
import { useDeleteShare } from '../hooks/useDeleteShare';
import { useSambaShares } from '../hooks/useSambaShares';

const Share = () => {
  const { data: shares = [], isLoading, error } = useSambaShares();

  const createShare = useCreateShare({
    onSuccess: (shareName) => {
      toast.success(`اشتراک ${shareName} با موفقیت ایجاد شد.`);
    },
    onError: (message) => {
      toast.error(`ایجاد اشتراک با خطا مواجه شد: ${message}`);
    },
  });

  const deleteShare = useDeleteShare({
    onSuccess: (shareName) => {
      toast.success(`اشتراک ${shareName} با موفقیت حذف شد.`);
    },
    onError: (deleteError, shareName) => {
      toast.error(`حذف اشتراک ${shareName} با خطا مواجه شد: ${deleteError.message}`);
    },
  });

  const [selectedShares, setSelectedShares] = useState<string[]>([]);

  useEffect(() => {
    setSelectedShares((prev) =>
      prev.filter((shareName) => shares.some((share) => share.name === shareName))
    );
  }, [shares]);

  const handleToggleSelect = useCallback(
    (share: SambaShareEntry, checked: boolean) => {
      setSelectedShares((prev) => {
        if (checked) {
          if (prev.includes(share.name)) {
            return prev;
          }

          return [...prev, share.name];
        }

        return prev.filter((name) => name !== share.name);
      });
    },
    []
  );

  const handleRemoveSelected = useCallback((shareName: string) => {
    setSelectedShares((prev) => prev.filter((name) => name !== shareName));
  }, []);

  const handleDeleteShare = useCallback(
    (share: SambaShareEntry) => {
      deleteShare.deleteShare(share.name);
    },
    [deleteShare]
  );

  const comparisonItems = useMemo(
    () =>
      selectedShares
        .map((shareName) => {
          const targetShare = shares.find((share) => share.name === shareName);

          if (!targetShare) {
            return null;
          }

          return {
            shareName: targetShare.name,
            detail: targetShare.details,
          };
        })
        .filter((item): item is { shareName: string; detail: SambaShareEntry['details'] } =>
          item !== null
        ),
    [selectedShares, shares]
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
            اشتراک‌گذاری فایل
          </Typography>

          <Button
            onClick={createShare.openCreateModal}
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
              '&:hover': {
                background:
                  'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
              },
            }}
          >
            ایجاد اشتراک جدید
          </Button>
        </Box>

        <Typography variant="body2" sx={{ color: 'var(--color-secondary)' }}>
          از جدول زیر می‌توانید اشتراک‌های موجود را مشاهده، حذف و برای مقایسه انتخاب کنید.
        </Typography>

        <SharesTable
          shares={shares}
          isLoading={isLoading}
          error={error}
          selectedShares={selectedShares}
          onToggleSelect={handleToggleSelect}
          onDelete={handleDeleteShare}
          pendingShareName={deleteShare.pendingShareName}
          isDeleting={deleteShare.isDeleting}
        />

        <SelectedSharesDetailsPanel items={comparisonItems} onRemove={handleRemoveSelected} />
      </Box>

      <CreateShareModal controller={createShare} />
    </Box>
  );
};

export default Share;
