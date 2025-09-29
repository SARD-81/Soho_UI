import { useQuery } from '@tanstack/react-query';
import type { UsersResponse } from '../@types/user';
import axiosInstance from '../lib/axiosInstance';

export const usersQueryKey = ['users'] as const;

const fetchUsers = async () => {
  const { data } = await axiosInstance.get<UsersResponse>('/api/os/user');
  return data;
};

export const useUsers = () =>
  useQuery<UsersResponse, Error>({
    queryKey: usersQueryKey,
    queryFn: fetchUsers,
    refetchInterval: 5000,
  });

export type UseUsersReturn = ReturnType<typeof useUsers>;
