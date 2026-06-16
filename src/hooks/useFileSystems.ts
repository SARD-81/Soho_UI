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
  if (value == null) return '—';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(formatAttributeValue).join('، ');
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch { return '[object]'; }
  }
  return String(value);
};

const ensureObject = (raw: unknown): FileSystemRawEntry => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as FileSystemRawEntry;
  return {};
};

const deriveNameParts = (fullName: string, index: number) => {
  const fallbackName = `filesystem-${index + 1}`;
  const fullNameSource = fullName.trim().length > 0 ? fullName.trim() : fallbackName;
  const [poolPart, ...rest] = fullNameSource.split('/');
  const poolName = poolPart?.trim() ? poolPart.trim() : 'نامشخص';
  const filesystemNameSource = rest.length > 0 ? rest.join('/') : poolPart;
  const filesystemName = filesystemNameSource && filesystemNameSource.trim().length > 0 ? filesystemNameSource.trim() : fallbackName;
  return { fullName: `${poolName}/${filesystemName}`, poolName, filesystemName };
};

const normalizeAttributes = (raw: FileSystemRawEntry, fullName: string) => {
  const normalized = { ...raw };
  if (typeof normalized.name !== 'string' || normalized.name.trim().length === 0) {
    normalized.name = fullName;
  }
  const entries = Object.entries(normalized).map(([key, value]) => ({
    key,
    value: formatAttributeValue(value),
  }));
  const attributeMap = entries.reduce<Record<string, string>>((acc, attribute) => {
    const k = attribute.key.trim();
    acc[k] = attribute.value;
    acc[k.toLowerCase()] = attribute.value;
    return acc;
  }, {});
  return { entries, attributeMap };
};

const extractMountpoint = (raw: FileSystemRawEntry, attributeMap: Record<string, string>) => {
  const rawMountpoint = raw.mountpoint;
  if (typeof rawMountpoint === 'string' && rawMountpoint.trim().length > 0) return rawMountpoint.trim();
  const attr = attributeMap.mountpoint;
  if (typeof attr === 'string' && attr.trim().length > 0) return attr.trim();
  return '—';
};

// New real backend list endpoint
const fetchFileSystems = async (): Promise<FileSystemQueryResult> => {
  // Try to get full details in one call if backend supports detail=true
  const listResponse = await axiosInstance.get<FileSystemApiResponse>(FILESYSTEM_LIST_ENDPOINT, {
    params: { detail: true, save_to_db: false },
  });

  const payload = listResponse.data;
  let rawList: any[] = [];

  if (Array.isArray(payload?.data)) {
    rawList = payload.data;
  } else if (payload?.data && typeof payload.data === 'object') {
    // fallback if data is object
    rawList = Object.values(payload.data);
  }

  const filesystems: FileSystemEntry[] = rawList
    .map((item: any, index: number) => {
      if (typeof item === 'string') {
        // If only names returned, we still need detail call (rare now)
        return null;
      }
      const fullName = item.fullName || item.name || `${item.pool_name || item.pool || 'unknown'}/${item.fs_name || item.name || index}`;
      const { poolName, filesystemName } = deriveNameParts(fullName, index);

      const rawDetail = ensureObject(item);
      const { entries, attributeMap } = normalizeAttributes(rawDetail, fullName);
      const mountpoint = extractMountpoint(rawDetail, attributeMap);

      return {
        id: fullName,
        fullName,
        poolName,
        filesystemName,
        mountpoint,
        attributes: entries,
        attributeMap,
        raw: rawDetail,
      };
    })
    .filter(Boolean) as FileSystemEntry[];

  // If list only returned names (old behavior), fallback to detail calls
  if (filesystems.length === 0 && Array.isArray(payload?.data) && typeof payload.data[0] === 'string') {
    const names: string[] = payload.data.filter((x: any) => typeof x === 'string');
    const detailResults = await Promise.all(
      names.map(async (name, idx) => {
        try {
          const detailRes = await axiosInstance.get<FileSystemApiResponse>(FILESYSTEM_DETAIL_ENDPOINT, {
            params: { name, save_to_db: false },
          });
          const raw = ensureObject(detailRes.data?.data);
          const { entries, attributeMap } = normalizeAttributes(raw, name);
          const mountpoint = extractMountpoint(raw, attributeMap);
          const { poolName, filesystemName } = deriveNameParts(name, idx);
          return { id: name, fullName: name, poolName, filesystemName, mountpoint, attributes: entries, attributeMap, raw };
        } catch {
          return null;
        }
      })
    );
    return { filesystems: detailResults.filter(Boolean) as FileSystemEntry[] };
  }

  return { filesystems };
};

export const useFileSystems = () =>
  useQuery<FileSystemQueryResult, Error>({
    queryKey: ['filesystems'],
    queryFn: fetchFileSystems,
    staleTime: 15000,
  });

export type UseFileSystemsReturn = ReturnType<typeof useFileSystems>;
