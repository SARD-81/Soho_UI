import { useQuery } from '@tanstack/react-query';
import type {
  FileSystemApiResponse,
  FileSystemEntry,
  FileSystemQueryResult,
  FileSystemRawEntry,
} from '../@types/filesystem';
import axiosInstance from '../lib/axiosInstance';

const FILESYSTEM_LIST_ENDPOINT = '/api/filesystem/';

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

  return {
    id: fullName,
    fullName,
    poolName,
    filesystemName,
    attributes: entries,
    attributeMap,
    raw: normalizedRaw,
  };
};

const fetchFileSystems = async (): Promise<FileSystemQueryResult> => {
  const response = await axiosInstance.get<FileSystemApiResponse>(
    FILESYSTEM_LIST_ENDPOINT
  );

  const payload = response.data;
  const data = payload?.data;

  const filesystems = (() => {
    if (Array.isArray(data)) {
      return data.map((raw, index) =>
        normalizeFileSystemEntry(undefined, raw, index)
      );
    }

    if (data && typeof data === 'object') {
      return Object.entries(data).map(([fullName, raw], index) =>
        normalizeFileSystemEntry(fullName, raw, index)
      );
    }

    return [] as FileSystemEntry[];
  })().sort((a, b) => {
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
