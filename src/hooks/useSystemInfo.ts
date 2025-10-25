import { useQuery } from '@tanstack/react-query';
import type { SystemInfoResponse } from '../@types/systemInfo';
import axiosInstance from '../lib/axiosInstance';

const SYSTEM_INFO_ENDPOINT = '/api/system/info';

const fetchSystemInfo = async () => {
  const { data } = await axiosInstance.get<SystemInfoResponse>(SYSTEM_INFO_ENDPOINT);
  return data;
};

export const useSystemInfo = () => {
  return useQuery<SystemInfoResponse, Error>({
    queryKey: ['system-info'],
    queryFn: fetchSystemInfo,
    refetchInterval: 30_000,
  });
};

export type UseSystemInfoReturn = ReturnType<typeof useSystemInfo>;