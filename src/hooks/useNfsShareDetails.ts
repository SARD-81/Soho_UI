import { useQuery } from '@tanstack/react-query';
import type { NfsShareEntry, NfsSharesResponse } from '../@types/nfs';
import axiosInstance from '../lib/axiosInstance';
import { mapNfsShares } from '../utils/nfsShares';

interface UseNfsShareDetailsOptions {
  path: string;
  enabled?: boolean;
}

const fetchNfsShareDetails = async (path: string) => {
  const { data } = await axiosInstance.get<NfsSharesResponse>('/api/nfs/shares/', {
    params: { path },
  });
  return data;
};

export const useNfsShareDetails = ({ path, enabled }: UseNfsShareDetailsOptions) =>
  useQuery<NfsSharesResponse, Error, NfsShareEntry | null>({
    queryKey: ['nfs', 'share', path],
    queryFn: () => fetchNfsShareDetails(path),
    enabled: Boolean(path) && enabled,
    select: (response) => {
      const normalized = mapNfsShares(response);
      return normalized.find((share) => share.path === path) ?? null;
    },
  });