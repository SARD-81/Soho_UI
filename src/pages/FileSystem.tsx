import { Box, Button, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { FileSystemEntry } from '../@types/filesystem';
import ConfirmDeleteFileSystemModal from '../components/file-system/ConfirmDeleteFileSystemModal';
import CreateFileSystemModal from '../components/file-system/CreateFileSystemModal';
import FileSystemsTable from '../components/file-system/FileSystemsTable';
import { useCreateFileSystem } from '../hooks/useCreateFileSystem';
import { useDeleteFileSystem } from '../hooks/useDeleteFileSystem';
import { useFileSystems } from '../hooks/useFileSystems';
import { useZpool } from '../hooks/useZpool';

const FileSystem = () => {
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
        .sort((a, b) => a.localeCompare(b, 'fa')),
    [poolData?.pools]
  );

  const filesystems = useMemo(
    () => data?.filesystems ?? [],
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

    return Array.from(keys).sort((a, b) => a.localeCompare(b, 'fa'));
  }, [filesystems]);

  const handleOpenCreate = useCallback(() => {
    createFileSystem.openCreateModal();
  }, [createFileSystem]);

  const handleDelete = useCallback(
    (filesystem: FileSystemEntry) => {
      deleteFileSystem.requestDelete(filesystem);
    },
    [deleteFileSystem]
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
            فضای فایلی
          </Typography>

          <Button
            onClick={handleOpenCreate}
            variant="contained"
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: '5px',
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
            ایجاد فضای فایلی
          </Button>
        </Box>
      </Box>

      <CreateFileSystemModal
        controller={createFileSystem}
        poolOptions={poolOptions}
      />

      <FileSystemsTable
        filesystems={filesystems}
        attributeKeys={attributeKeys}
        isLoading={isLoading}
        error={error ?? null}
        onDeleteFilesystem={handleDelete}
        isDeleteDisabled={deleteFileSystem.isDeleting}
      />

      <ConfirmDeleteFileSystemModal controller={deleteFileSystem} />
    </Box>
  );
};

export default FileSystem;
