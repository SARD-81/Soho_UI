import { Box, Button, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { FileSystemEntry } from '../@types/filesystem';
import PageContainer from '../components/PageContainer';
import ConfirmDeleteFileSystemModal from '../components/file-system/ConfirmDeleteFileSystemModal';
import CreateFileSystemModal from '../components/file-system/CreateFileSystemModal';
import FileSystemsTable from '../components/file-system/FileSystemsTable';
import SelectedFileSystemsDetailsPanel from '../components/file-system/SelectedFileSystemsDetailsPanel';
import { useCreateFileSystem } from '../hooks/useCreateFileSystem';
import { useDeleteFileSystem } from '../hooks/useDeleteFileSystem';
import { useFileSystems } from '../hooks/useFileSystems';
import { useZpool } from '../hooks/useZpool';

const MAX_COMPARISON_ITEMS = 4;

const FileSystem = () => {
  const [selectedFilesystems, setSelectedFilesystems] = useState<string[]>([]);
  const createFileSystem = useCreateFileSystem({
    onSuccess: (filesystemName) => {
      toast.success(`فضای فایلی ${filesystemName} با موفقیت ایجاد شد.`);
    },
    onError: (errorMessage) => {
      toast.error(`ایجاد فضای فایلی با خطا مواجه شد: ${errorMessage}`);
    },
  });

  const deleteFileSystem = useDeleteFileSystem({
    onSuccess: (filesystemName) => {
      toast.success(`فضای فایلی ${filesystemName} با موفقیت حذف شد.`);
    },
    onError: (error, filesystemName) => {
      if (error.message.includes('shareConfiguration')) {
        toast.error(
          `حذف فضای فایلی ${filesystemName} امکان‌پذیر نیست؛ ابتدا تمام اشتراک‌های مرتبط با این فضا را حذف کنید.`
        );
        return;
      }

      toast.error(
        `حذف فضای فایلی ${filesystemName} با خطا مواجه شد: ${error.message}`
      );
    },
  });

  const { data, isLoading, error } = useFileSystems();
  const { data: poolData } = useZpool();

  const poolOptions = useMemo(
    () =>
      (poolData?.pools ?? [])
        .map((pool) => pool.name)
        .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })),
    [poolData?.pools]
  );

  const filesystems = useMemo(
    () =>
      [...(data?.filesystems ?? [])].sort((a, b) =>
        a.filesystemName.localeCompare(b.filesystemName, 'en', {
          sensitivity: 'base',
        })
      ),
    [data?.filesystems]
  );

  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();

    filesystems.forEach((filesystem) => {
      filesystem.attributes.forEach((attribute) => {
        if (attribute.key !== 'name') {
          keys.add(attribute.key);
        }
      });
    });

    return Array.from(keys).sort((a, b) =>
      a.localeCompare(b, 'en', { sensitivity: 'base' })
    );
  }, [filesystems]);

  const handleOpenCreate = useCallback(() => {
    createFileSystem.openCreateModal();
  }, [createFileSystem]);

  const handleToggleSelect = useCallback(
    (filesystem: FileSystemEntry, checked: boolean) => {
      setSelectedFilesystems((prev) => {
        if (checked) {
          if (prev.includes(filesystem.id)) {
            return prev;
          }

          const next = [...prev, filesystem.id];
          return next.slice(-MAX_COMPARISON_ITEMS);
        }

        return prev.filter((id) => id !== filesystem.id);
      });
    },
    []
  );

  const handleRemoveSelected = useCallback((filesystemId: string) => {
    setSelectedFilesystems((prev) => prev.filter((id) => id !== filesystemId));
  }, []);

  const handleDelete = useCallback(
    (filesystem: FileSystemEntry) => {
      deleteFileSystem.requestDelete(filesystem);
    },
    [deleteFileSystem]
  );

  useEffect(() => {
    setSelectedFilesystems((prev) =>
      prev.filter((id) => filesystems.some((filesystem) => filesystem.id === id))
    );
  }, [filesystems]);

  const comparisonItems = useMemo(
    () =>
      selectedFilesystems
        .map((filesystemId) =>
          filesystems.find((filesystem) => filesystem.id === filesystemId)
        )
        .filter((filesystem): filesystem is FileSystemEntry => Boolean(filesystem)),
    [filesystems, selectedFilesystems]
  );

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: -5 }}>
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
            فضای فایلی
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
            ایجاد فضای فایلی
          </Button>
        </Box>
      </Box>

      <CreateFileSystemModal
        controller={createFileSystem}
        poolOptions={poolOptions}
        existingFilesystems={filesystems}
      />

      <FileSystemsTable
        filesystems={filesystems}
        attributeKeys={attributeKeys}
        isLoading={isLoading}
        error={error ?? null}
        selectedFileSystems={selectedFilesystems}
        onToggleSelect={handleToggleSelect}
        onDeleteFilesystem={handleDelete}
        isDeleteDisabled={deleteFileSystem.isDeleting}
      />

      <SelectedFileSystemsDetailsPanel
        items={comparisonItems}
        onRemove={handleRemoveSelected}
      />

      <ConfirmDeleteFileSystemModal controller={deleteFileSystem} />
    </PageContainer>
  );
};

export default FileSystem;