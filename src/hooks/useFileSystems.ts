import { useQuery } from '@tanstack/react-query';
import type {
  FileSystemApiResponse,
  FileSystemEntry,
  FileSystemQueryResult,
  FileSystemRawEntry,
} from '../@types/filesystem';
import axiosInstance from '../lib/axiosInstance';

const FILESYSTEM_LIST_ENDPOINT = '/api/filesystem/filesystems/';
const FILESYSTEM_DETAIL_ENDPOINT = '/api/filesystem/filesystems';

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

const deriveNameParts = (fullName: string, index: number) => {
  const fallbackName = `filesystem-${index + 1}`;
  const fullNameSource = fullName.trim().length > 0 ? fullName.trim() : fallbackName;
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
      const normalizedKey = attribute.key.trim();
      const normalizedValue = attribute.value;

      acc[normalizedKey] = normalizedValue;
      acc[normalizedKey.toLowerCase()] = normalizedValue;

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

const fetchFileSystemNames = async (): Promise<string[]> => {
  const response = await axiosInstance.get<FileSystemApiResponse>(
    FILESYSTEM_LIST_ENDPOINT
  );
  const payload = response.data;
  const data = payload?.data;

  if (Array.isArray(data)) {
    return data.filter((item): item is string => typeof item === 'string');
  }

  return [];
};

const fetchFileSystemDetail = async (
  fullName: string,
  index: number
): Promise<FileSystemEntry> => {
  const { poolName, filesystemName, fullName: normalizedName } =
    deriveNameParts(fullName, index);
  const detailResponse = await axiosInstance.get<FileSystemApiResponse>(
    `${FILESYSTEM_DETAIL_ENDPOINT}/${encodeURIComponent(poolName)}/${encodeURIComponent(
      filesystemName
    )}/`
  );

  const detailPayload = detailResponse.data;
  const rawDetail = ensureObject(detailPayload?.data);
  const { entries, attributeMap } = normalizeAttributes(rawDetail, normalizedName);
  const mountpoint = extractMountpoint(rawDetail, attributeMap);

  return {
    id: normalizedName,
    fullName: normalizedName,
    poolName,
    filesystemName,
    mountpoint,
    attributes: entries,
    attributeMap,
    raw: rawDetail,
  };
};

const fetchFileSystems = async (): Promise<FileSystemQueryResult> => {
  const filesystemNames = await fetchFileSystemNames();
  const filesystems = await Promise.all(
    filesystemNames.map((fullName, index) =>
      fetchFileSystemDetail(fullName, index).catch(() =>
        fetchFileSystemDetail(`نامشخص/${fullName}`, index)
      )
    )
  );

  const uniqueFilesystems = filesystems.filter((filesystem) => {
    const poolName = filesystem.poolName.trim().toLowerCase();
    const fullName = filesystem.fullName.trim().toLowerCase();

    return poolName.length === 0 || fullName !== poolName;
  });

  uniqueFilesystems.sort((a, b) => {
    const poolCompare = a.poolName.localeCompare(b.poolName, 'fa');
    if (poolCompare !== 0) {
      return poolCompare;
    }

    return a.filesystemName.localeCompare(b.filesystemName, 'fa');
  });

  return { filesystems: uniqueFilesystems };
};

export const useFileSystems = () =>
  useQuery<FileSystemQueryResult, Error, FileSystemQueryResult>({
    queryKey: ['filesystems'],
    queryFn: fetchFileSystems,
    staleTime: 15000,
    gcTime: 10 * 60 * 1000,
  });

export type UseFileSystemsReturn = ReturnType<typeof useFileSystems>;