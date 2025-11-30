import type { FileSystemEntry } from '../@types/filesystem';

const addDetailIfMissing = (
  details: Record<string, unknown>,
  key: string,
  value: unknown
) => {
  if (details[key] !== undefined) {
    return;
  }

  details[key] = value;
};

export const buildFilesystemDetailValues = (filesystem: FileSystemEntry) => {
  const details: Record<string, unknown> = {};

  addDetailIfMissing(details, 'نام فضا', filesystem.filesystemName);
  addDetailIfMissing(details, 'Pool', filesystem.poolName);
  addDetailIfMissing(details, 'mountpoint', filesystem.mountpoint);

  filesystem.attributes.forEach(({ key, value }) => {
    const normalizedKey = key.trim();

    if (!normalizedKey || normalizedKey.toLowerCase() === 'name') {
      return;
    }

    addDetailIfMissing(details, normalizedKey, value);
  });

  return details;
};

export default buildFilesystemDetailValues;