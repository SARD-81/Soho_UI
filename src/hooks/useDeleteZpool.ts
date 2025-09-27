import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ZpoolQueryResult } from '../@types/zpool';
import axiosInstance from '../lib/axiosInstance';

interface DeleteZpoolPayload {
  name: string;
}

interface DeleteZpoolResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

const deleteZpool = async ({ name }: DeleteZpoolPayload) => {
  const response = await axiosInstance.delete<DeleteZpoolResponse>(
    '/api/zpool/delete',
    {
      params: { name },
      data: { name },
    }
  );

  return response.data;
};

export const useDeleteZpool = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteZpoolResponse, Error, DeleteZpoolPayload>({
    mutationFn: deleteZpool,
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<ZpoolQueryResult | undefined>(
        ['zpool'],
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pools: current.pools.filter((pool) => pool.name !== variables.name),
            failedPools: current.failedPools.filter(
              (poolName) => poolName !== variables.name
            ),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ['zpool'] });
    },
  });
};
