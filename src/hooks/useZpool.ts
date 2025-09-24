import { useQuery } from '@tanstack/react-query';
import type {
  ZpoolCapacityEntry,
  ZpoolCapacityPayload,
  ZpoolCapacityResponse,
  ZpoolListResponse,
  ZpoolQueryResult,
} from '../@types/zpool';
import axiosInstance from '../lib/axiosInstance';

const ZPOOL_LIST_ENDPOINT = '/api/zpool/';

const createZpoolCapacityEndpoint = (poolName: string) =>
  `/api/zpool/${encodeURIComponent(poolName)}/capacity/`;

const BYTE_UNITS: Record<string, number> = {
  b: 1,
  byte: 1,
  bytes: 1,
  k: 1024,
  kb: 1024,
  kib: 1024,
  m: 1024 ** 2,
  mb: 1024 ** 2,
  mib: 1024 ** 2,
  g: 1024 ** 3,
  gb: 1024 ** 3,
  gib: 1024 ** 3,
  t: 1024 ** 4,
  tb: 1024 ** 4,
  tib: 1024 ** 4,
  p: 1024 ** 5,
  pb: 1024 ** 5,
  pib: 1024 ** 5,
};

const parseByteValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const numericValue = Number(trimmed);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    const unitMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);
    if (unitMatch) {
      const baseValue = Number(unitMatch[1]);
      const unit = unitMatch[2]?.toLowerCase();

      if (Number.isFinite(baseValue)) {
        if (!unit) {
          return baseValue;
        }

        const normalizedUnit = unit.replace(/s$/, '');
        const multiplier =
          BYTE_UNITS[normalizedUnit] ??
          BYTE_UNITS[normalizedUnit.replace(/b$/, '')];

        if (multiplier != null) {
          return baseValue * multiplier;
        }
      }
    }
  }

  return null;
};

const parsePercentValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/%/g, '').replace(/,/g, '.').trim();
    if (!cleaned) {
      return null;
    }

    const numericValue = Number(cleaned);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return null;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const parseDedup = (
  value: unknown
): { ratio: number | null; display: string | null } => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return {
      ratio: value,
      display: `${value.toFixed(2)}x`,
    };
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return { ratio: null, display: null };
    }

    const cleaned = trimmed.replace(/x$/i, '').replace(/,/g, '.');
    const numericValue = Number(cleaned);

    return {
      ratio: Number.isFinite(numericValue) ? numericValue : null,
      display: trimmed,
    };
  }

  return { ratio: null, display: null };
};

const normalizeZpoolCapacity = (
  poolName: string,
  raw: ZpoolCapacityPayload
): ZpoolCapacityEntry => {
  const totalCandidate =
    parseByteValue(raw.total) ??
    parseByteValue(raw.size) ??
    parseByteValue((raw as Record<string, unknown>).capacity_total) ??
    parseByteValue((raw as Record<string, unknown>).capacityTotal) ??
    parseByteValue((raw as Record<string, unknown>).total_capacity);

  const usedCandidate =
    parseByteValue(raw.used) ??
    parseByteValue((raw as Record<string, unknown>).alloc) ??
    parseByteValue((raw as Record<string, unknown>).allocated) ??
    parseByteValue((raw as Record<string, unknown>).capacity_used) ??
    parseByteValue((raw as Record<string, unknown>).used_capacity);

  const freeCandidate =
    parseByteValue(raw.free) ??
    parseByteValue((raw as Record<string, unknown>).available) ??
    parseByteValue((raw as Record<string, unknown>).capacity_free) ??
    parseByteValue((raw as Record<string, unknown>).free_capacity);

  const percentCandidate =
    parsePercentValue(raw.capacity) ??
    parsePercentValue((raw as Record<string, unknown>).cap) ??
    parsePercentValue((raw as Record<string, unknown>).utilization) ??
    parsePercentValue((raw as Record<string, unknown>).percent) ??
    parsePercentValue((raw as Record<string, unknown>).capacity_percent);

  let totalBytes = totalCandidate;
  let usedBytes = usedCandidate;
  let freeBytes = freeCandidate;
  let capacityPercent = percentCandidate;

  if (totalBytes == null && usedBytes != null && freeBytes != null) {
    totalBytes = usedBytes + freeBytes;
  }

  if (usedBytes == null && capacityPercent != null && totalBytes != null) {
    usedBytes = (capacityPercent / 100) * totalBytes;
  }

  if (freeBytes == null && totalBytes != null && usedBytes != null) {
    freeBytes = totalBytes - usedBytes;
  }

  if (
    capacityPercent == null &&
    totalBytes != null &&
    usedBytes != null &&
    totalBytes > 0
  ) {
    capacityPercent = (usedBytes / totalBytes) * 100;
  }

  const dedupSource =
    raw.dedup ??
    (raw as Record<string, unknown>).deduplication ??
    (raw as Record<string, unknown>).dedup_ratio ??
    (raw as Record<string, unknown>).dedupratio;
  const { ratio: dedupRatio, display: dedupDisplay } = parseDedup(dedupSource);

  const fragmentationSource =
    raw.fragmentation ??
    (raw as Record<string, unknown>).frag ??
    (raw as Record<string, unknown>).fragmentation_percent ??
    (raw as Record<string, unknown>).fragmentationPercent;
  const fragmentationPercent =
    fragmentationSource != null ? parsePercentValue(fragmentationSource) : null;

  const healthSource =
    raw.health ??
    (raw as Record<string, unknown>).status ??
    (raw as Record<string, unknown>).state;

  return {
    name:
      typeof raw.name === 'string' && raw.name.trim()
        ? (raw.name as string)
        : poolName,
    totalBytes: totalBytes ?? null,
    usedBytes: usedBytes ?? null,
    freeBytes: freeBytes ?? null,
    capacityPercent:
      capacityPercent != null && Number.isFinite(capacityPercent)
        ? clampPercent(capacityPercent)
        : null,
    deduplication: dedupDisplay,
    deduplicationRatio: dedupRatio,
    fragmentationPercent:
      fragmentationPercent != null && Number.isFinite(fragmentationPercent)
        ? clampPercent(fragmentationPercent)
        : null,
    health:
      typeof healthSource === 'string'
        ? healthSource
        : Array.isArray(healthSource)
          ? healthSource.join(', ')
          : undefined,
    raw,
  };
};

const fetchZpools = async (): Promise<ZpoolQueryResult> => {
  const { data: listResponse } =
    await axiosInstance.get<ZpoolListResponse>(ZPOOL_LIST_ENDPOINT);

  const poolNames = Array.isArray(listResponse?.data)
    ? listResponse.data.filter(
        (poolName): poolName is string =>
          typeof poolName === 'string' && poolName.trim().length > 0
      )
    : [];

  if (poolNames.length === 0) {
    return { pools: [], failedPools: [] };
  }

  const requests = poolNames.map((poolName) =>
    axiosInstance
      .get<ZpoolCapacityResponse>(createZpoolCapacityEndpoint(poolName))
      .then((response) =>
        normalizeZpoolCapacity(poolName, response.data?.data ?? {})
      )
      .catch((error) => {
        throw { poolName, error };
      })
  );

  const settledResults = await Promise.allSettled(requests);

  const pools: ZpoolCapacityEntry[] = [];
  const failedPools: string[] = [];

  settledResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      pools.push(result.value);
      return;
    }

    const failure = result.reason as { poolName?: string } | undefined;
    if (failure?.poolName) {
      failedPools.push(failure.poolName);
    }
  });

  pools.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
  failedPools.sort((a, b) => a.localeCompare(b, 'fa'));

  return { pools, failedPools };
};

interface UseZpoolOptions {
  refetchInterval?: number;
}

export const useZpool = (options?: UseZpoolOptions) => {
  return useQuery<ZpoolQueryResult, Error>({
    queryKey: ['zpool'],
    queryFn: fetchZpools,
    refetchInterval: options?.refetchInterval ?? 10000,
    refetchIntervalInBackground: true,
  });
};
