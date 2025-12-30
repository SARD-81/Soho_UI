import { useMemo } from 'react';
import { useQueries, type UseQueryOptions } from '@tanstack/react-query';
import type { ZpoolDetailEntry } from '../@types/zpool';
import { fetchZpoolDetails, zpoolDetailQueryKey } from './useZpoolDetails';

export const usePoolDetailQueries = (poolNames: string[]) => {
  const hasPoolsToLoad = poolNames.length > 0;

  const queries = useMemo<UseQueryOptions<ZpoolDetailEntry, Error>[]>(
    () =>
      poolNames.map((poolName) => ({
        queryKey: zpoolDetailQueryKey(poolName),
        queryFn: () => fetchZpoolDetails(poolName),
        enabled: hasPoolsToLoad,
        refetchInterval: hasPoolsToLoad ? 10000 : false,
      })),
    [hasPoolsToLoad, poolNames]
  );

  return useQueries({ queries });
};
