import { useQuery } from '@tanstack/react-query';
import type { SambaUsersResponse } from '../@types/samba';
import axiosInstance from '../lib/axiosInstance';

export const sambaUsersQueryKey = ['samba-users'] as const;

const fetchSambaUsers = async ({
  signal,
}: {
  signal?: AbortSignal;
}): Promise<SambaUsersResponse> => {
  const { data } = await axiosInstance.get<SambaUsersResponse>(
    '/api/samba/user/list/',
    {
      signal,
    }
  );

  return data;
};

export const useSambaUsers = ({ enabled = true } = {}) =>
  useQuery<SambaUsersResponse, Error>({
    queryKey: sambaUsersQueryKey,
    queryFn: ({ signal }) => fetchSambaUsers({ signal }),
    enabled,
    staleTime: 15000,
  });

export type UseSambaUsersReturn = ReturnType<typeof useSambaUsers>;
