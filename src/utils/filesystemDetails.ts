import type { FileSystemEntry } from '../@types/filesystem';
import { omitNullishEntries } from './detailValues';

export const buildFileSystemDetailValues = (
  filesystem: FileSystemEntry
): Record<string, unknown> => {
  const baseValues: Record<string, unknown> = {
    Pool: filesystem.poolName,
    Filesystem: filesystem.filesystemName,
    Mountpoint: filesystem.mountpoint,
    'Full Name': filesystem.fullName,
  };

  return {
    ...baseValues,
    ...omitNullishEntries(filesystem.attributeMap),
  };
};
