import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import type {
  FileSystemAttributeEntry,
  FileSystemEntry,
} from '../@types/filesystem';
import PageContainer from '../components/PageContainer';
import TablePageHeader from '../components/common/TablePageHeader';
import ConfirmDeleteFileSystemModal from '../components/file-system/ConfirmDeleteFileSystemModal';
import CreateFileSystemModal from '../components/file-system/CreateFileSystemModal';
import FileSystemPassphraseModal from '../components/file-system/FileSystemPassphraseModal';
import FileSystemsTable from '../components/file-system/FileSystemsTable';
import SelectedFileSystemsDetailsPanel from '../components/file-system/SelectedFileSystemsDetailsPanel';
import { useChangeFileSystemPassphrase } from '../hooks/useChangeFileSystemPassphrase';
import { useCreateFileSystem } from '../hooks/useCreateFileSystem';
import { useDeleteFileSystem } from '../hooks/useDeleteFileSystem';
import { useFileSystems } from '../hooks/useFileSystems';
import { useLoadKey } from '../hooks/useLoadKey';
import { useMountFileSystem } from '../hooks/useMountFileSystem';
import { useSetCanmount } from '../hooks/useSetCanmount';
import { useUnmountFileSystem } from '../hooks/useUnmountFileSystem';
import { useUnloadKey } from '../hooks/useUnloadKey';
import { useZpool } from '../hooks/useZpool';
import {
  selectDetailViewState,
  useDetailSplitViewStore,
} from '../stores/detailSplitViewStore';

const FILESYSTEM_DETAIL_VIEW_ID = 'filesystems';

const FileSystem = () => {
  const [loadKeyTarget, setLoadKeyTarget] = useState<FileSystemEntry | null>(
    null
  );
  const [changePassphraseTarget, setChangePassphraseTarget] =
    useState<FileSystemEntry | null>(null);

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
        toast.error(`حذف فضای فایلی ${filesystemName} امکان‌پذیر نیست؛ ابتدا تمام اشتراک‌های مرتبط را حذف کنید.`);
        return;
      }
      toast.error(`حذف فضای فایلی ${filesystemName} با خطا مواجه شد: ${error.message}`);
    },
  });

  const mountFileSystem = useMountFileSystem({
    onSuccess: (name) => toast.success(`فضای فایلی ${name} با موفقیت مانت شد.`),
    onError: (error, name) => toast.error(`مانت ${name} با خطا مواجه شد: ${error.message}`),
  });

  const unmountFileSystem = useUnmountFileSystem({
    onSuccess: (name) => toast.success(`فضای فایلی ${name} با موفقیت آنمانت شد.`),
    onError: (error, name) => toast.error(`آنمانت ${name} با خطا مواجه شد: ${error.message}`),
  });

  const loadKey = useLoadKey({
    onSuccess: (name) => {
      setLoadKeyTarget(null);
      toast.success(`کلید رمزنگاری ${name} با موفقیت لود شد.`);
    },
    onError: (error, name) => toast.error(`لود کلید ${name} با خطا مواجه شد: ${error.message}`),
  });

  const unloadKey = useUnloadKey({
    onSuccess: (name) => toast.success(`کلید رمزنگاری ${name} با موفقیت آنلود شد.`),
    onError: (error, name) => toast.error(`آنلود کلید ${name} با خطا مواجه شد: ${error.message}`),
  });

  const changePassphrase = useChangeFileSystemPassphrase({
    onSuccess: (name) => {
      setChangePassphraseTarget(null);
      toast.success(`رمز فایل سیستم ${name} با موفقیت تغییر کرد.`);
    },
    onError: (error, name) => toast.error(`تغییر رمز فایل سیستم ${name} با خطا مواجه شد: ${error.message}`),
  });

  const setCanmountHook = useSetCanmount({
    onSuccess: (name) => toast.success(`وضعیت مانت خودکار برای ${name} با موفقیت تغییر کرد.`),
    onError: (error, name) => toast.error(`تغییر مانت خودکار برای ${name} با خطا مواجه شد: ${error.message}`),
  });

  const {
    data,
    isLoading,
    error: fetchError,
  } = useFileSystems();
  const { data: poolData } = useZpool();
  const poolOptions = useMemo(
    () => (poolData?.pools ?? []).map((pool) => pool.name).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })),
    [poolData?.pools]
  );

  const filesystemEntries = data?.filesystems ?? [];

  const filesystems = useMemo(
    () => [...filesystemEntries].sort((a, b) => a.filesystemName.localeCompare(b.filesystemName, 'en', { sensitivity: 'base' })),
    [filesystemEntries]
  );

  const attributeKeys = useMemo(() => {
    const keys = new Set<string>();
    filesystems.forEach((filesystem) => {
      filesystem.attributes.forEach((attribute: FileSystemAttributeEntry) => {
        if (attribute.key !== 'name') keys.add(attribute.key);
      });
    });
    return Array.from(keys).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  }, [filesystems]);

  const { activeItemId, pinnedItemIds } = useDetailSplitViewStore(selectDetailViewState(FILESYSTEM_DETAIL_VIEW_ID));
  const setActiveItemId = useDetailSplitViewStore((state) => state.setActiveItemId);
  const unpinItem = useDetailSplitViewStore((state) => state.unpinItem);
  const clearView = useDetailSplitViewStore((state) => state.clearView);

  useEffect(() => {
    clearView(FILESYSTEM_DETAIL_VIEW_ID);
    return () => clearView(FILESYSTEM_DETAIL_VIEW_ID);
  }, [clearView]);

  useEffect(() => {
    const validIds = new Set(filesystems.map((f) => f.id));
    pinnedItemIds.forEach((id) => { if (!validIds.has(id)) unpinItem(FILESYSTEM_DETAIL_VIEW_ID, id); });
    if (activeItemId && !validIds.has(activeItemId)) {
      setActiveItemId(FILESYSTEM_DETAIL_VIEW_ID, null);
    }
  }, [activeItemId, filesystems, pinnedItemIds, setActiveItemId, unpinItem]);

  const handleOpenCreate = useCallback(() => createFileSystem.openCreateModal(), [createFileSystem]);
  const handleDelete = useCallback((fs: FileSystemEntry) => deleteFileSystem.requestDelete(fs), [deleteFileSystem]);

  const handleMount = useCallback((fs: FileSystemEntry) => mountFileSystem.mount(fs.poolName, fs.filesystemName), [mountFileSystem]);
  const handleUnmount = useCallback((fs: FileSystemEntry) => unmountFileSystem.unmount(fs.poolName, fs.filesystemName), [unmountFileSystem]);
  const handleLoadKey = useCallback((fs: FileSystemEntry) => setLoadKeyTarget(fs), []);
  const handleUnloadKey = useCallback((fs: FileSystemEntry) => unloadKey.unloadKey(fs.poolName, fs.filesystemName), [unloadKey]);
  const handleChangePassphrase = useCallback((fs: FileSystemEntry) => setChangePassphraseTarget(fs), []);

  const handleConfirmLoadKey = useCallback(
    (passphrase: string) => {
      if (!loadKeyTarget) {
        return;
      }
      loadKey.loadKey(
        loadKeyTarget.poolName,
        loadKeyTarget.filesystemName,
        passphrase
      );
    },
    [loadKey, loadKeyTarget]
  );

  const handleConfirmChangePassphrase = useCallback(
    (newPassphrase: string) => {
      if (!changePassphraseTarget) {
        return;
      }
      changePassphrase.changePassphrase(
        changePassphraseTarget.poolName,
        changePassphraseTarget.filesystemName,
        newPassphrase
      );
    },
    [changePassphrase, changePassphraseTarget]
  );

  const handleSetCanmount = useCallback((fs: FileSystemEntry, state: 'on' | 'off') => {
    setCanmountHook.setCanmount(fs.poolName, fs.filesystemName, state);
  }, [setCanmountHook]);

  return (
    <PageContainer>
      <TablePageHeader
        title="فضای فایلی"
        // subtitle="مدیریت فایل‌سیستم‌ها، وضعیت مانت و عملیات رمزنگاری"
        primaryAction={{
          label: 'ایجاد فضای فایلی',
          onClick: handleOpenCreate,
        }}
      />

      <CreateFileSystemModal controller={createFileSystem} poolOptions={poolOptions} existingFilesystems={filesystems} />
      <FileSystemPassphraseModal
        mode="load-key"
        open={Boolean(loadKeyTarget)}
        targetFileSystem={loadKeyTarget}
        isLoading={loadKey.isLoadingKey}
        onClose={() => setLoadKeyTarget(null)}
        onConfirm={handleConfirmLoadKey}
      />
      <FileSystemPassphraseModal
        mode="change-passphrase"
        open={Boolean(changePassphraseTarget)}
        targetFileSystem={changePassphraseTarget}
        isLoading={changePassphrase.isChangingPassphrase}
        onClose={() => setChangePassphraseTarget(null)}
        onConfirm={handleConfirmChangePassphrase}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FileSystemsTable
          detailViewId={FILESYSTEM_DETAIL_VIEW_ID}
          filesystems={filesystems}
          attributeKeys={attributeKeys}
          isLoading={isLoading}
          error={fetchError ?? null}
          onDeleteFilesystem={handleDelete}
          isDeleteDisabled={deleteFileSystem.isDeleting}
          onMount={handleMount}
          onUnmount={handleUnmount}
          onLoadKey={handleLoadKey}
          onUnloadKey={handleUnloadKey}
          onChangePassphrase={handleChangePassphrase}
          onSetCanmount={handleSetCanmount}
          isMounting={mountFileSystem.isMounting}
          isUnmounting={unmountFileSystem.isUnmounting}
          isKeyLoading={loadKey.isLoadingKey}
          isKeyUnloading={unloadKey.isUnloadingKey}
          isChangingPassphrase={changePassphrase.isChangingPassphrase}
          isSettingCanmount={setCanmountHook.isSetting}
        />

        {(activeItemId || pinnedItemIds.length > 0) && (
          <SelectedFileSystemsDetailsPanel items={filesystems} viewId={FILESYSTEM_DETAIL_VIEW_ID} />
        )}
      </Box>

      <ConfirmDeleteFileSystemModal controller={deleteFileSystem} />
    </PageContainer>
  );
};

export default FileSystem;
