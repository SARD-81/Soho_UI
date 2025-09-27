import { useQuery } from '@tanstack/react-query';
import type { ZpoolDetailEntry, ZpoolDetailResponse } from '../@types/zpool';
import axiosInstance from '../lib/axiosInstance';

export const zpoolDetailQueryKey = (poolName: string) => [
  'zpool',
  poolName,
  'details',
];

export const fetchZpoolDetails = async (
  poolName: string
): Promise<ZpoolDetailEntry | null> => {
  const endpoint = `/api/zpool/${encodeURIComponent(poolName)}/`;
  const { data } = await axiosInstance.get<ZpoolDetailResponse>(endpoint);

  if (!data || !Array.isArray(data.data)) {
    return null;
  }

  const firstValidEntry = data.data.find(
    (entry): entry is ZpoolDetailEntry => entry != null && typeof entry === 'object'
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
    queryFn: () => fetchZpoolDetails(poolName),
    enabled: options?.enabled ?? true,
    staleTime: 15000,
    refetchInterval: options?.enabled ? 15000 : undefined,
  });
};

