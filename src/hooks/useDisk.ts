import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';
import type { DiskResponse } from '../types/disk';

const fetchDisk = async (): Promise<DiskResponse> => {
  const { data } = await axiosInstance.get<DiskResponse>('/disk');
  return data;
};

export const useDisk = () => {
  return useQuery<DiskResponse, Error>({
    queryKey: ['disk'],
    queryFn: fetchDisk,
  });
};
