import { useMemo } from 'react';
import { useQueries, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { DiskInventoryItem } from '../@types/disk';
import { fetchDiskDetail, fetchDiskInventory, fetchDiskPartitionStatus } from '../lib/diskApi';

export const useDiskInventory = () =>
  useQuery<DiskInventoryItem[], Error>({
    queryKey: ['disk', 'inventory'],
    queryFn: fetchDiskInventory,
    select: (items) =>
      [...items].sort((a, b) => a.disk.localeCompare(b.disk, 'fa-IR', { sensitivity: 'base' })),
    // refetchInterval: 30000,
    refetchOnWindowFocus: true,
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
      staleTime: 10000,
      refetchOnWindowFocus: true,
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

export const useDiskPartitionStatuses = (
  diskNames: string[]
): {
  partitionedDiskNames: string[];
  checkingDiskNames: string[];
  error: Error | null;
} => {
  const queries = useQueries({
    queries: diskNames.map((diskName): UseQueryOptions<boolean, Error> => ({
      queryKey: ['disk', 'partition-status', diskName],
      queryFn: () => fetchDiskPartitionStatus(diskName),
      enabled: diskName.trim().length > 0,
      staleTime: 10000,
      refetchOnWindowFocus: true,
    })),
  });

  return useMemo(() => {
    const partitionedDiskNames = new Set<string>();
    const checkingDiskNames = new Set<string>();
    let firstError: Error | null = null;

    queries.forEach((query, index) => {
      const diskName = diskNames[index];

      if (!diskName) {
        return;
      }

      if (query?.data) {
        partitionedDiskNames.add(diskName);
      }

      if (query?.isLoading || query?.isFetching) {
        checkingDiskNames.add(diskName);
      }

      if (!firstError && query?.error) {
        firstError = query.error as Error;
      }
    });

    return {
      partitionedDiskNames: Array.from(partitionedDiskNames),
      checkingDiskNames: Array.from(checkingDiskNames),
      error: firstError,
    };
  }, [diskNames, queries]);
};