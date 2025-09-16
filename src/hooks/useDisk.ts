import { useQuery } from '@tanstack/react-query';
import type { DiskResponse } from '../@types/disk';
import axiosInstance from '../lib/axiosInstance';

const fetchDisk = async (): Promise<DiskResponse> => {
  const { data } = await axiosInstance.get<DiskResponse>('/disk');
  return data;
};

interface UseDiskOptions {
  refetchInterval?: number;
}

export const useDisk = (options?: UseDiskOptions) => {
  return useQuery<DiskResponse, Error>({
    queryKey: ['disk'],
    queryFn: fetchDisk,
    refetchInterval: options?.refetchInterval ?? 1000,
    refetchIntervalInBackground: true,
  });
};
