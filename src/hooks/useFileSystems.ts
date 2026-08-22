import { useQuery } from '@tanstack/react-query';
import type {
  FileSystemApiResponse,
  FileSystemEntry,
  FileSystemQueryResult,
  FileSystemRawEntry,
} from '../@types/filesystem';
import axiosInstance from '../lib/axiosInstance';

const FILESYSTEM_LIST_ENDPOINT = '/api/filesystem/';
const FILESYSTEM_DETAIL_ENDPOINT = '/api/filesystem/detail/';

const formatAttributeValue = (value: unknown): string => {
  if (value == null) {
    return '—';
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatAttributeValue).join('، ');
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[object]';
    }
  }

  return String(value);
};

const ensureObject = (raw: unknown): FileSystemRawEntry => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as FileSystemRawEntry;
  }

  return {};
};

const deriveNameParts = (fullName: string, index: number) => {
  const fallbackName = `filesystem-${index + 1}`;
  const fullNameSource =
    fullName.trim().length > 0 ? fullName.trim() : fallbackName;
  const [poolPart, ...rest] = fullNameSource.split('/');
  const poolName = poolPart?.trim() ? poolPart.trim() : 'نامشخص';
  const filesystemNameSource = rest.length > 0 ? rest.join('/') : poolPart;
  const filesystemName =
    filesystemNameSource && filesystemNameSource.trim().length > 0
      ? filesystemNameSource.trim()
      : fallbackName;

  return {
    fullName: `${poolName}/${filesystemName}`,
    poolName,
    filesystemName,
  };
};

const normalizeAttributes = (raw: FileSystemRawEntry, fullName: string) => {
  const normalized = { ...raw };
  if (
    typeof normalized.name !== 'string' ||
    normalized.name.trim().length === 0
  ) {
    normalized.name = fullName;
  }

  const entries = Object.entries(normalized).map(([key, value]) => ({
    key,
    value: formatAttributeValue(value),
  }));
  const attributeMap = entries.reduce<Record<string, string>>(
    (acc, attribute) => {
      const key = attribute.key.trim();
      acc[key] = attribute.value;
      acc[key.toLowerCase()] = attribute.value;
      return acc;
    },
    {}
  );

  return { entries, attributeMap };
};

const extractMountpoint = (
  raw: FileSystemRawEntry,
  attributeMap: Record<string, string>
) => {
  const rawMountpoint = raw.mountpoint;
  if (
    typeof rawMountpoint === 'string' &&
    rawMountpoint.trim().length > 0
  ) {
    return rawMountpoint.trim();
  }

  const attributeMountpoint = attributeMap.mountpoint;
  if (
    typeof attributeMountpoint === 'string' &&
    attributeMountpoint.trim().length > 0
  ) {
    return attributeMountpoint.trim();
  }

  return '—';
};

export const fetchFileSystems = async (
  signal?: AbortSignal
): Promise<FileSystemQueryResult> => {
  const listResponse = await axiosInstance.get<FileSystemApiResponse>(
    FILESYSTEM_LIST_ENDPOINT,
    {
      params: { detail: true },
      signal,
    }
  );

  const payload = listResponse.data;
  let rawList: unknown[] = [];

  if (Array.isArray(payload?.data)) {
    rawList = payload.data;
  } else if (payload?.data && typeof payload.data === 'object') {
    rawList = Object.values(payload.data);
  }

  const filesystems = rawList
    .map((item, index): FileSystemEntry | null => {
      if (typeof item === 'string') {
        return null;
      }

      const rawItem = ensureObject(item);
      const itemFullName = rawItem.fullName;
      const itemName = rawItem.name;
      const itemPoolName = rawItem.pool_name;
      const itemPool = rawItem.pool;
      const itemFileSystemName = rawItem.fs_name;
      const fullName =
        (typeof itemFullName === 'string' &&
          itemFullName.trim().length > 0 &&
          itemFullName) ||
        (typeof itemName === 'string' &&
          itemName.trim().length > 0 &&
          itemName) ||
        `${
          typeof itemPoolName === 'string'
            ? itemPoolName
            : typeof itemPool === 'string'
              ? itemPool
              : 'unknown'
        }/${
          typeof itemFileSystemName === 'string'
            ? itemFileSystemName
            : typeof itemName === 'string'
              ? itemName
              : index
        }`;
      const { poolName, filesystemName } = deriveNameParts(fullName, index);
      const { entries, attributeMap } = normalizeAttributes(rawItem, fullName);

      return {
        id: fullName,
        fullName,
        poolName,
        filesystemName,
        mountpoint: extractMountpoint(rawItem, attributeMap),
        attributes: entries,
        attributeMap,
        raw: rawItem,
      };
    })
    .filter((item): item is FileSystemEntry => item !== null);

  // Compatibility path for older backends that return only filesystem names.
  if (
    filesystems.length === 0 &&
    Array.isArray(payload?.data) &&
    typeof payload.data[0] === 'string'
  ) {
    const names = payload.data.filter(
      (item): item is string => typeof item === 'string'
    );
    const detailResults = await Promise.all(
      names.map(async (name, index) => {
        try {
          const detailResponse =
            await axiosInstance.get<FileSystemApiResponse>(
              FILESYSTEM_DETAIL_ENDPOINT,
              {
                params: { name },
                signal,
              }
            );
          const raw = ensureObject(detailResponse.data?.data);
          const { entries, attributeMap } = normalizeAttributes(raw, name);
          const { poolName, filesystemName } = deriveNameParts(name, index);

          return {
            id: name,
            fullName: name,
            poolName,
            filesystemName,
            mountpoint: extractMountpoint(raw, attributeMap),
            attributes: entries,
            attributeMap,
            raw,
          } satisfies FileSystemEntry;
        } catch {
          // One legacy detail failure must not discard successfully loaded filesystems.
          return null;
        }
      })
    );

    return {
      filesystems: detailResults.filter(
        (item): item is FileSystemEntry => item !== null
      ),
    };
  }

  return { filesystems };
};

export const useFileSystems = () =>
  useQuery<FileSystemQueryResult, Error>({
    queryKey: ['filesystems'],
    queryFn: ({ signal }) => fetchFileSystems(signal),
    staleTime: 15_000,
  });

export type UseFileSystemsReturn = ReturnType<typeof useFileSystems>;
