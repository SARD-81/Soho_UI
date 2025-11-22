import { useQueries, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { DiskInventoryItem } from '../@types/disk';
import { fetchDiskDetail, fetchDiskInventory } from '../lib/diskApi';

export const useDiskInventory = () =>
  useQuery<DiskInventoryItem[], Error>({
    queryKey: ['disk', 'inventory'],
    queryFn: fetchDiskInventory,
    select: (items) =>
      [...items].sort((a, b) => a.disk.localeCompare(b.disk, 'fa-IR', { sensitivity: 'base' })),
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });

export interface DiskDetailItemState {
  diskName: string;
  detail: DiskInventoryItem | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
}

export const useDiskDetails = (diskNames: string[]): DiskDetailItemState[] => {
  const queries = useQueries({
    queries: diskNames.map((diskName): UseQueryOptions<DiskInventoryItem | null, Error> => ({
      queryKey: ['disk', 'detail', diskName],
      queryFn: () => fetchDiskDetail(diskName),
      enabled: diskName.trim().length > 0,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    })),
  });

  return diskNames.map((diskName, index) => {
    const query = queries[index];

    return {
      diskName,
      detail: query?.data ?? null,
      isLoading: query?.isLoading ?? false,
      isFetching: query?.isFetching ?? false,
      error: (query?.error as Error) ?? null,
    };
  });
};