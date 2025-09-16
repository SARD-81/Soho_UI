import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';
import type { DiskResponse } from '../types/disk';

const fetchDisk = async (): Promise<DiskResponse> => {
  const { data } = await axiosInstance.get<DiskResponse>('/disk');
  return data;
};

interface UseDiskOptions {
  /**
   * Interval in milliseconds for background refetches.
   * Defaults to 5000 (5 seconds).
   */
  refetchInterval?: number;
}

export const useDisk = (options?: UseDiskOptions) => {

  return useQuery<DiskResponse, Error>({
    queryKey: ['disk'],
    queryFn: fetchDisk,
    refetchInterval: options?.refetchInterval ?? 5000,
    refetchIntervalInBackground: true,
  });
};
