import { useQuery } from '@tanstack/react-query';
import type { NfsShareEntry, NfsSharesResponse } from '../@types/nfs';
import axiosInstance from '../lib/axiosInstance';
import { mapNfsShares } from '../utils/nfsShares';

export const nfsSharesQueryKey = ['nfs', 'shares'] as const;

const fetchNfsShares = async () => {
  const { data } = await axiosInstance.get<NfsSharesResponse>('/api/nfs/shares/');
  return data;
};

export const useNfsShares = () =>
  useQuery<NfsSharesResponse, Error, NfsShareEntry[]>({
    queryKey: nfsSharesQueryKey,
    queryFn: fetchNfsShares,
    select: mapNfsShares,
  });
