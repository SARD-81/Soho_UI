import { useQuery } from '@tanstack/react-query';
import type {
  VolumeApiResponse,
  VolumeEntry,
  VolumeQueryResult,
  VolumeRawEntry,
} from '../@types/volume';
import axiosInstance from '../lib/axiosInstance';
import { createVisibilityAwareInterval } from '../utils/refetchInterval';

const VOLUME_LIST_ENDPOINT = '/api/volume/';
const defaultVolumesRefetchInterval = createVisibilityAwareInterval(20000);

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

const createAttributeEntries = (raw: VolumeRawEntry) => {
  const entries = Object.entries(raw).map(([key, value]) => ({
    key,
    value: formatAttributeValue(value),
  }));

  const map = entries.reduce<Record<string, string>>(
    (accumulator, attribute) => {
      accumulator[attribute.key] = attribute.value;
      return accumulator;
    },
    {}
  );

  return { entries, map };
};

const ensureNameInRaw = (
  raw: VolumeRawEntry,
  fallbackName: string
): VolumeRawEntry => {
  const rawName = raw['name'];

  if (typeof rawName === 'string' && rawName.trim().length > 0) {
    return raw;
  }

  return { ...raw, name: fallbackName };
};

const extractVolumeNames = (
  fullNameHint: string | undefined,
  raw: VolumeRawEntry,
  index: number
) => {
  const rawName = raw['name'];
  const fallbackName = `volume-${index + 1}`;
  const sourceName =
    typeof fullNameHint === 'string' && fullNameHint.trim().length > 0
      ? fullNameHint.trim()
      : typeof rawName === 'string' && rawName.trim().length > 0
        ? rawName.trim()
        : fallbackName;

  const [poolPart, ...volumeParts] = sourceName.split('/');
  const poolName =
    poolPart && poolPart.trim().length > 0 ? poolPart.trim() : 'نامشخص';
  const volumeNameSource =
    volumeParts.length > 0 ? volumeParts.join('/') : sourceName;
  const volumeName =
    volumeNameSource.trim().length > 0 ? volumeNameSource.trim() : sourceName;

  return {
    fullName: sourceName,
    poolName,
    volumeName,
  };
};

const normalizeVolumeEntry = (
  fullNameHint: string | undefined,
  raw: unknown,
  index: number
): VolumeEntry => {
  const normalizedRaw = normalizeRawEntry(raw);
  const { fullName, poolName, volumeName } = extractVolumeNames(
    fullNameHint,
    normalizedRaw,
    index
  );
  const enrichedRaw = ensureNameInRaw(normalizedRaw, fullName);
  const { entries, map } = createAttributeEntries(enrichedRaw);

  return {
    id: fullName,
    fullName,
    poolName,
    volumeName,
    attributes: entries,
    attributeMap: map,
    raw: enrichedRaw,
  };
};

const fetchVolumes = async (): Promise<VolumeQueryResult> => {
  const response =
    await axiosInstance.get<VolumeApiResponse>(VOLUME_LIST_ENDPOINT);

  const payload = response.data;
  const rawVolumes = payload?.data;

  const volumes = (() => {
    if (Array.isArray(rawVolumes)) {
      return rawVolumes.map((raw, index) =>
        normalizeVolumeEntry(undefined, raw, index)
      );
    }

    if (rawVolumes && typeof rawVolumes === 'object') {
      return Object.entries(rawVolumes).map(([fullName, raw], index) =>
        normalizeVolumeEntry(fullName, raw, index)
      );
    }

    return [] as VolumeEntry[];
  })().sort((a, b) => {
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
    refetchInterval: defaultVolumesRefetchInterval,
  });

export type UseVolumesReturn = ReturnType<typeof useVolumes>;
