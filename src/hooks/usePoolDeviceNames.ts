import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useZpool } from './useZpool';
import fetchPoolDeviceNames from '../lib/poolDevices';

export const usePoolDeviceNames = () => {
  const { data: zpoolData } = useZpool();

  const poolNames = useMemo(() => {
    return (zpoolData?.pools ?? [])
      .map((pool) => pool.name?.trim())
      .filter((name): name is string => Boolean(name));
  }, [zpoolData?.pools]);

  return useQuery<string[], Error>({
    queryKey: ['zpool', 'devices', ...poolNames],
    queryFn: async () => {
      const diskNames = new Set<string>();

      for (const poolName of poolNames) {
        const devices = await fetchPoolDeviceNames(poolName);
        devices.forEach((name) => diskNames.add(name));
      }

      return Array.from(diskNames);
    },
    enabled: poolNames.length > 0,
    staleTime: 30000,
  });
};

export default usePoolDeviceNames;