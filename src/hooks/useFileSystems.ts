import { useQuery } from '@tanstack/react-query';
import type {
  FileSystemApiResponse,
  FileSystemEntry,
  FileSystemQueryResult,
  FileSystemRawEntry,
} from '../@types/filesystem';
import axiosInstance from '../lib/axiosInstance';

const FILESYSTEM_LIST_ENDPOINT = '/api/filesystem/filesystems/';
const FILESYSTEM_DETAIL_BASE_ENDPOINT = '/api/filesystem/filesystems';

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
    return value.map((item) => formatAttributeValue(item)).join('، ');
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

const deriveNameParts = (
  fullNameHint: string | undefined,
  raw: FileSystemRawEntry,
  index: number
) => {
  const rawName = raw.name;
  const fallbackName = `filesystem-${index + 1}`;
  const fullNameSource = (() => {
    if (typeof fullNameHint === 'string' && fullNameHint.trim().length > 0) {
      return fullNameHint.trim();
    }

    if (typeof rawName === 'string' && rawName.trim().length > 0) {
      return rawName.trim();
    }

    return fallbackName;
  })();

  const [poolPart, ...rest] = fullNameSource.split('/');
  const poolName = poolPart?.trim() ? poolPart.trim() : 'نامشخص';
  const filesystemNameSource =
    rest.length > 0 ? rest.join('/') : fullNameSource;
  const filesystemName =
    filesystemNameSource.trim().length > 0
      ? filesystemNameSource.trim()
      : fullNameSource;

  return {
    fullName: fullNameSource,
    poolName,
    filesystemName,
  };
};

const enrichAttributes = (raw: FileSystemRawEntry, fullName: string) => {
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
      acc[attribute.key] = attribute.value;
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

  if (typeof rawMountpoint === 'string') {
    const trimmed = rawMountpoint.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  const attributeValue = attributeMap.mountpoint;
  if (typeof attributeValue === 'string') {
    const trimmed = attributeValue.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return '—';
};

const normalizeFileSystemEntry = (
  fullNameHint: string | undefined,
  raw: unknown,
  index: number
): FileSystemEntry => {
  const normalizedRaw = ensureObject(raw);
  const { fullName, poolName, filesystemName } = deriveNameParts(
    fullNameHint,
    normalizedRaw,
    index
  );
  const { entries, attributeMap } = enrichAttributes(normalizedRaw, fullName);
  const mountpoint = extractMountpoint(normalizedRaw, attributeMap);

  return {
    id: fullName,
    fullName,
    poolName,
    filesystemName,
    mountpoint,
    attributes: entries,
    attributeMap,
    raw: normalizedRaw,
  };
};

const fetchFileSystemNames = async (): Promise<string[]> => {
  const response = await axiosInstance.get<FileSystemApiResponse>(
    FILESYSTEM_LIST_ENDPOINT
  );

  const names = response.data?.data;
  if (!Array.isArray(names)) {
    return [];
  }

  return names
    .filter((name): name is string => typeof name === 'string')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
};

const buildDetailEndpoint = (poolName: string, filesystemName: string) =>
  `${FILESYSTEM_DETAIL_BASE_ENDPOINT}/${encodeURIComponent(
    poolName
  )}/${encodeURIComponent(filesystemName)}/`;

const fetchFileSystemDetail = async (
  fullName: string,
  index: number
): Promise<FileSystemEntry> => {
  const [poolNamePart, ...filesystemParts] = fullName.split('/');
  const poolName = poolNamePart?.trim() ?? '';
  const filesystemName = filesystemParts.join('/').trim();

  const endpoint = buildDetailEndpoint(poolName, filesystemName || fullName);
  const response = await axiosInstance.get<FileSystemApiResponse>(endpoint);
  const rawEntry = response.data?.data;

  return normalizeFileSystemEntry(fullName, rawEntry, index);
};

const fetchFileSystems = async (): Promise<FileSystemQueryResult> => {
  const filesystemNames = await fetchFileSystemNames();

  const filesystems = (
    await Promise.all(
      filesystemNames.map((fullName, index) =>
        fetchFileSystemDetail(fullName, index)
      )
    )
  )
    .filter((filesystem) => {
      const poolName = filesystem.poolName.trim().toLowerCase();
      const fullName = filesystem.fullName.trim().toLowerCase();

      return poolName.length === 0 || fullName !== poolName;
    })
    .sort((a, b) => {
      const poolCompare = a.poolName.localeCompare(b.poolName, 'fa');
      if (poolCompare !== 0) {
        return poolCompare;
      }

      return a.filesystemName.localeCompare(b.filesystemName, 'fa');
    });

  return { filesystems };
};

export const useFileSystems = () =>
  useQuery<FileSystemQueryResult, Error>({
    queryKey: ['filesystems'],
    queryFn: fetchFileSystems,
    staleTime: 15000,
  });

export type UseFileSystemsReturn = ReturnType<typeof useFileSystems>;
