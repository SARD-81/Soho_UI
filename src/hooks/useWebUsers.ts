import { useQuery } from '@tanstack/react-query';
import type { WebUser, WebUsersResponse } from '../@types/users';
import axiosInstance from '../lib/axiosInstance';

export const webUsersQueryKey = ['web-users'] as const;

const fetchWebUsers = async () => {
  const { data } = await axiosInstance.get<WebUsersResponse>(
    '/api/system/ui-user/'
  );
  return data.data ?? [];
};

export const useWebUsers = () => {
  return useQuery<WebUser[], Error>({
    queryKey: webUsersQueryKey,
    queryFn: fetchWebUsers,
  });
};