import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import fetchDiskPartitionCount from '../lib/diskPartitions';

export interface DiskPartitionCountState {
  diskName: string;
  partitionCount: number | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const normalizeDiskNames = (diskNames: string[]) => {
  const uniqueNames = new Set<string>();

  diskNames.forEach((diskName) => {
    const normalized = diskName.trim();

    if (normalized.length > 0) {
      uniqueNames.add(normalized);
    }
  });

  return Array.from(uniqueNames);
};

export const useDiskPartitionCounts = (
  diskNames: string[]
): DiskPartitionCountState[] => {
  const normalizedNames = useMemo(() => normalizeDiskNames(diskNames), [diskNames]);

  const queries = useQueries({
    queries: normalizedNames.map((diskName) => ({
      queryKey: ['disk', 'partition-count', diskName],
      queryFn: () => fetchDiskPartitionCount(diskName),
      enabled: diskName.length > 0,
      staleTime: 30000,
    })),
  });

  return useMemo(
    () =>
      queries.map((query, index) => ({
        diskName: normalizedNames[index],
        partitionCount: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error ?? null,
      })),
    [normalizedNames, queries]
  );
};

export default useDiskPartitionCounts;