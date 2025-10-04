import { useQuery } from '@tanstack/react-query';
import type {
  DiskResponse,
  DiskWwnMapResponse,
  FreeDiskResponse,
} from '../@types/disk';
import axiosInstance from '../lib/axiosInstance';

const fetchDisk = async (): Promise<DiskResponse> => {
  const { data } = await axiosInstance.get<DiskResponse>('/api/disk');
  return data;
};

const fetchDiskWwnMap = async (): Promise<DiskWwnMapResponse> => {
  const { data } =
    await axiosInstance.get<DiskWwnMapResponse>('/api/disk/wwn/map/');
  return data;
};

const fetchFreeDisks = async (): Promise<FreeDiskResponse> => {
  const { data } = await axiosInstance.get<FreeDiskResponse>('/api/disk/free');
  return data;
};

interface UseDiskOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

export const useDisk = (options?: UseDiskOptions) => {
  return useQuery<DiskResponse, Error>({
    queryKey: ['disk'],
    queryFn: fetchDisk,
    refetchInterval: options?.refetchInterval ?? 1000,
    refetchIntervalInBackground: true,
    enabled: options?.enabled ?? true,
  });
};

export const useDiskWwnMap = (options?: UseDiskOptions) => {
  return useQuery<DiskWwnMapResponse, Error>({
    queryKey: ['disk', 'wwn', 'map'],
    queryFn: fetchDiskWwnMap,
    refetchInterval: options?.refetchInterval ?? 1000,
    refetchIntervalInBackground: true,
    enabled: options?.enabled ?? true,
  });
};

export const useFreeDisks = (options?: UseDiskOptions) => {
  return useQuery<FreeDiskResponse, Error>({
    queryKey: ['disk', 'free'],
    queryFn: fetchFreeDisks,
    refetchInterval: options?.refetchInterval ?? 1000,
    refetchIntervalInBackground: true,
    enabled: options?.enabled ?? true,
  });
};
