import { Box, Button, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { VolumeEntry } from '../@types/volume';
import ConfirmDeleteVolumeModal from '../components/block-storage/ConfirmDeleteVolumeModal';
import CreateVolumeModal from '../components/block-storage/CreateVolumeModal';
import VolumesTable from '../components/block-storage/VolumesTable';
import { useCreateVolume } from '../hooks/useCreateVolume';
import { useDeleteVolume } from '../hooks/useDeleteVolume';
import { useVolumes } from '../hooks/useVolumes';
import { useZpool } from '../hooks/useZpool';

const BlockStorage = () => {
  const createVolume = useCreateVolume({
    onSuccess: (volumeName) => {
      toast.success(`Volume ${volumeName} با موفقیت ایجاد شد.`);
    },
    onError: (errorMessage) => {
      toast.error(`ایجاد Volume با خطا مواجه شد: ${errorMessage}`);
    },
  });

  const volumeDeletion = useDeleteVolume({
    onSuccess: (volumeName) => {
      toast.success(`Volume ${volumeName} با موفقیت حذف شد.`);
    },
    onError: (error, volumeName) => {
      toast.error(`حذف Volume ${volumeName} با خطا مواجه شد: ${error.message}`);
    },
  });

  const { data: volumeData, isLoading, error } = useVolumes();
  const { data: poolData } = useZpool();

  const poolOptions = useMemo(
    () =>
      (poolData?.pools ?? [])
        .map((pool) => pool.name)
        .sort((a, b) => a.localeCompare(b, 'fa')),
    [poolData?.pools]
  );

  const volumes = useMemo(
    () => volumeData?.volumes ?? [],
    [volumeData?.volumes]
  );

  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();

    volumes.forEach((volume) => {
      volume.attributes.forEach((attribute) => {
        if (attribute.key !== 'name') {
          keys.add(attribute.key);
        }
      });
    });

    return Array.from(keys).sort((a, b) => a.localeCompare(b, 'fa'));
  }, [volumes]);

  const handleOpenCreate = useCallback(() => {
    createVolume.openCreateModal();
  }, [createVolume]);

  const handleDeleteRequest = useCallback(
    (volume: VolumeEntry) => {
      volumeDeletion.requestDelete(volume);
    },
    [volumeDeletion]
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
            فضای بلاکی
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
              '&:hover': {
                background:
                  'linear-gradient(135deg, rgba(0, 198, 169, 0.95) 0%, rgba(18, 140, 200, 0.95) 100%)',
                boxShadow: '0 18px 36px -18px rgba(0, 198, 169, 0.75)',
              },
            }}
          >
            ایجاد Volume
          </Button>
        </Box>
      </Box>

      <CreateVolumeModal controller={createVolume} poolOptions={poolOptions} />

      <VolumesTable
        volumes={volumes}
        attributeKeys={attributeKeys}
        isLoading={isLoading}
        error={error ?? null}
        onDeleteVolume={handleDeleteRequest}
        isDeleteDisabled={volumeDeletion.isDeleting}
      />

      <ConfirmDeleteVolumeModal controller={volumeDeletion} />
    </Box>
  );
};

export default BlockStorage;
