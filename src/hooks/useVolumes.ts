import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';
import type {
  VolumeApiResponse,
  VolumeAttribute,
  VolumeEntry,
  VolumeQueryResult,
  VolumeRawEntry,
} from '../@types/volume';

const VOLUME_LIST_ENDPOINT = '/api/volume/';

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

const normalizeRawEntry = (raw: unknown): VolumeRawEntry => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as VolumeRawEntry;
  }

  return {};
};

const createAttributes = (raw: VolumeRawEntry): VolumeAttribute[] =>
  Object.entries(raw).map(([key, value]) => ({
    key,
    value: formatAttributeValue(value),
  }));

const normalizeVolumeEntry = (
  fullName: string,
  raw: unknown
): VolumeEntry => {
  const normalizedRaw = normalizeRawEntry(raw);
  const [poolName, ...rest] = fullName.split('/');
  const volumeName = rest.length > 0 ? rest.join('/') : fullName;

  return {
    id: fullName,
    fullName,
    poolName: poolName || 'نامشخص',
    volumeName,
    attributes: createAttributes(normalizedRaw),
    raw: normalizedRaw,
  };
};

const fetchVolumes = async (): Promise<VolumeQueryResult> => {
  const response = await axiosInstance.get<VolumeApiResponse>(
    VOLUME_LIST_ENDPOINT
  );

  const payload = response.data;
  const rawVolumes = payload?.data ?? {};

  const volumes = Object.entries(rawVolumes)
    .map(([fullName, raw]) => normalizeVolumeEntry(fullName, raw))
    .sort((a, b) => {
      const poolCompare = a.poolName.localeCompare(b.poolName, 'fa');
      if (poolCompare !== 0) {
        return poolCompare;
      }

      return a.volumeName.localeCompare(b.volumeName, 'fa');
    });

  return { volumes };
};

export const useVolumes = () =>
  useQuery<VolumeQueryResult, Error>({
    queryKey: ['volumes'],
    queryFn: fetchVolumes,
    refetchInterval: 15000,
  });

export type UseVolumesReturn = ReturnType<typeof useVolumes>;
