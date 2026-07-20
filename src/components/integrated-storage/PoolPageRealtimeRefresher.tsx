import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const POOL_PAGE_REFRESH_INTERVAL_MS = 10_000;

const PoolPageRealtimeRefresher = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refetchActivePoolQueries = () => {
      void queryClient.refetchQueries({
        queryKey: ['zpool'],
        type: 'active',
      });
    };

    const intervalId = window.setInterval(
      refetchActivePoolQueries,
      POOL_PAGE_REFRESH_INTERVAL_MS
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [queryClient]);

  return null;
};

export default PoolPageRealtimeRefresher;
