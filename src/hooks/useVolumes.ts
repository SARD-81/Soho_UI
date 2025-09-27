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

const extractNames = (fullName: string) => {
  const trimmedFullName = fullName.trim();
  const spacedSeparator = ' / ';

  if (trimmedFullName.includes(spacedSeparator)) {
    const separatorIndex = trimmedFullName.indexOf(spacedSeparator);
    const poolName = trimmedFullName.slice(0, separatorIndex).trim();
    const remaining = trimmedFullName
      .slice(separatorIndex + spacedSeparator.length)
      .trim();

    return {
      poolName: poolName.length > 0 ? poolName : 'نامشخص',
      volumeName: remaining.length > 0 ? remaining : trimmedFullName,
    };
  }

  const slashIndex = trimmedFullName.indexOf('/');

  if (slashIndex !== -1) {
    const poolName = trimmedFullName.slice(0, slashIndex).trim();
    const remaining = trimmedFullName.slice(slashIndex + 1).trim();

    return {
      poolName: poolName.length > 0 ? poolName : 'نامشخص',
      volumeName: remaining.length > 0 ? remaining : trimmedFullName,
    };
  }

  const fallbackName = trimmedFullName.length > 0 ? trimmedFullName : 'نامشخص';

  return {
    poolName: 'نامشخص',
    volumeName: fallbackName,
  };
};

const normalizeVolumeEntry = (
  fullName: string,
  raw: unknown
): VolumeEntry => {
  const normalizedRaw = normalizeRawEntry(raw);
  const { poolName, volumeName } = extractNames(fullName);
  const safeVolumeName = volumeName.length > 0 ? volumeName : 'نامشخص';

  return {
    id: fullName,
    fullName: fullName.trim(),
    poolName,
    volumeName: safeVolumeName,
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
