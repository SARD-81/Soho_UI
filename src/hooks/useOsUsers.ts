import type { QueryKey } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { OsUsersResponse } from '../@types/users';
import axiosInstance from '../lib/axiosInstance';

export const osUsersBaseQueryKey = ['os-users'] as const;

export const osUsersQueryKey = (includeSystem: boolean): QueryKey => [
  ...osUsersBaseQueryKey,
  { includeSystem },
];

interface FetchOsUsersParams {
  includeSystem: boolean;
  signal?: AbortSignal;
}

const fetchOsUsers = async ({
  includeSystem,
  signal,
}: FetchOsUsersParams): Promise<OsUsersResponse> => {
  const { data } = await axiosInstance.get<OsUsersResponse>('/api/os/user', {
    params: { include_system: includeSystem },
    signal,
  });

  return data;
};

interface UseOsUsersOptions {
  includeSystem: boolean;
  enabled?: boolean;
}

export const useOsUsers = ({
  includeSystem,
  enabled = true,
}: UseOsUsersOptions) =>
  useQuery<OsUsersResponse, Error>({
    queryKey: osUsersQueryKey(includeSystem),
    queryFn: ({ signal }) => fetchOsUsers({ includeSystem, signal }),
    enabled,
    staleTime: 15000,
  });

export type UseOsUsersReturn = ReturnType<typeof useOsUsers>;
