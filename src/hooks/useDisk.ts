import { isAxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import type {
  DiskResponse,
  DiskWwnMapResponse,
  FreeDiskResponse,
} from '../@types/disk';
import axiosInstance from '../lib/axiosInstance';

const FREE_DISK_ENDPOINTS = ['/api/disk/free', '/api/disk/free/'] as const;
const DEFAULT_FREE_DISK_ERROR_MESSAGE =
  'امکان دریافت فهرست دیسک‌های آزاد وجود ندارد.';

const fetchDisk = async (): Promise<DiskResponse> => {
  const { data } = await axiosInstance.get<DiskResponse>('/api/disk');
  return data;
};

const fetchDiskWwnMap = async (): Promise<DiskWwnMapResponse> => {
  const { data } =
    await axiosInstance.get<DiskWwnMapResponse>('/api/disk/wwn/map/');
  return data;
};

const fetchFreeDisks = async (): Promise<string[]> => {
  let lastError: unknown;

  for (const endpoint of FREE_DISK_ENDPOINTS) {
    try {
      const { data } = await axiosInstance.get<FreeDiskResponse>(endpoint);

      if (data.ok === false) {
        const message =
          typeof data.error === 'string' && data.error.trim().length > 0
            ? data.error
            : DEFAULT_FREE_DISK_ERROR_MESSAGE;
        throw new Error(message);
      }

      if (!Array.isArray(data.data)) {
        return [];
      }

      return data.data;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        lastError = error;
        continue;
      }

      lastError = error;
      break;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error(DEFAULT_FREE_DISK_ERROR_MESSAGE);
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
  return useQuery<string[], Error>({
    queryKey: ['disk', 'free'],
    queryFn: fetchFreeDisks,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: Boolean(options?.refetchInterval),
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
  });
};