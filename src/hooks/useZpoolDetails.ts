import { useQuery } from '@tanstack/react-query';
import type { ZpoolDetailEntry, ZpoolDetailResponse } from '../@types/zpool.ts';
import axiosInstance from '../lib/axiosInstance';

export const zpoolDetailQueryKey = (poolName: string) => [
  'zpool',
  poolName,
  'details',
];

export const fetchZpoolDetails = async (
  poolName: string,
  signal?: AbortSignal
): Promise<ZpoolDetailEntry | null> => {
  const endpoint = `/api/zpool/${encodeURIComponent(poolName)}/`;
  const { data } = await axiosInstance.get<ZpoolDetailResponse>(endpoint, {
    params: { save_to_db: true },
    signal,
  });

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  const firstValidEntry = data.data.find(
    (entry): entry is ZpoolDetailEntry =>
      entry != null && typeof entry === 'object'
  );

  if (!firstValidEntry) {
    return null;
  }

  const normalizedEntry: ZpoolDetailEntry = {
    ...firstValidEntry,
  };

  const entryName = normalizedEntry.name;

  if (typeof entryName !== 'string' || entryName.trim().length === 0) {
    normalizedEntry.name = poolName;
  }

  return normalizedEntry;
};

interface UseZpoolDetailsOptions {
  enabled?: boolean;
}

export const useZpoolDetails = (
  poolName: string,
  options?: UseZpoolDetailsOptions
) => {
  return useQuery<ZpoolDetailEntry | null, Error>({
    queryKey: zpoolDetailQueryKey(poolName),
    queryFn: ({ signal }) => fetchZpoolDetails(poolName, signal),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.enabled ? 30000 : undefined,
    staleTime: 25000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    meta: {
      skipGlobalLoader: true,
    },
  });
};
