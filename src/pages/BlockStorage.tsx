import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { VolumeEntry } from '../@types/volume';
import PageContainer from '../components/PageContainer';
import ConfirmDeleteVolumeModal from '../components/block-storage/ConfirmDeleteVolumeModal';
import CreateVolumeModal from '../components/block-storage/CreateVolumeModal';
import VolumesTable from '../components/block-storage/VolumesTable';
import TablePageHeader from '../components/common/TablePageHeader';
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

  const {
    data: volumeData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useVolumes();
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
    <PageContainer>
      <TablePageHeader
        title="فضای بلاکی"
        subtitle="مدیریت Volumeها و فضای بلاکی روی Poolهای ذخیره‌سازی"
        refreshAction={{
          onClick: () => void refetch(),
          disabled: isFetching,
          isLoading: isFetching,
          loadingLabel: 'در حال بروزرسانی...',
        }}
        primaryAction={{
          label: 'ایجاد Volume',
          onClick: handleOpenCreate,
        }}
      />

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
    </PageContainer>
  );
};

export default BlockStorage;
