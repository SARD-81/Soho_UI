import { useQuery } from '@tanstack/react-query';
import type { SambaShareEntry, SambaSharesResponse } from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';

export const sambaSharesQueryKey = ['samba', 'shares'] as const;

const fetchSambaShares = async () => {
  const { data } = await axiosInstance.get<SambaSharesResponse>('/api/samba/');
  return data;
};

const mapShares = (
  response: SambaSharesResponse | undefined
): SambaShareEntry[] => {
  if (!response?.data) {
    return [];
  }

  return Object.entries(response.data)
    .map(([name, details]) => ({
      name,
      details: details ?? {},
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fa-IR'));
};

export const useSambaShares = () =>
  useQuery<SambaSharesResponse, Error, SambaShareEntry[]>({
    queryKey: sambaSharesQueryKey,
    queryFn: fetchSambaShares,
    refetchInterval: 10000,
    select: mapShares,
  });

export type UseSambaSharesReturn = ReturnType<typeof useSambaShares>;
