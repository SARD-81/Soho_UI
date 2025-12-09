import { useQuery } from '@tanstack/react-query';
import type { SambaUsersResponse } from '../@types/samba';
import { fetchSambaUsers as fetchSambaUsersRequest } from '../lib/sambaUserService';

export const sambaUsersQueryKey = ['samba-users'] as const;

const fetchSambaUsersQuery = async ({
  signal,
}: {
  signal?: AbortSignal;
}): Promise<SambaUsersResponse> => {
  return fetchSambaUsersRequest({ signal });
};

export const useSambaUsers = ({ enabled = true } = {}) =>
  useQuery<SambaUsersResponse, Error>({
    queryKey: sambaUsersQueryKey,
    queryFn: ({ signal }) => fetchSambaUsersQuery({ signal }),
    enabled,
    staleTime: 15000,
  });

export type UseSambaUsersReturn = ReturnType<typeof useSambaUsers>;