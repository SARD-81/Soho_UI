import { useQuery } from '@tanstack/react-query';
import type {
  DiskNamesResponse,
  DiskPartitionStatusResponse,
  DiskResponse,
  DiskWwnMapResponse,
} from '../@types/disk';
import axiosInstance from '../lib/axiosInstance';

const DEFAULT_DISK_NAME_ERROR_MESSAGE =
  'امکان دریافت فهرست نام دیسک‌ها وجود ندارد.';
const DEFAULT_PARTITION_STATUS_ERROR_MESSAGE =
  'امکان بررسی وضعیت پارتیشن‌های دیسک وجود ندارد.';

const fetchDisk = async (): Promise<DiskResponse> => {
  const { data } = await axiosInstance.get<DiskResponse>('/api/disk');
  return data;
};

const fetchDiskWwnMap = async (): Promise<DiskWwnMapResponse> => {
  const { data } =
    await axiosInstance.get<DiskWwnMapResponse>('/api/disk/wwn/map/');
  return data;
};

const normalizeDiskNames = (diskNames: unknown): string[] => {
  if (!Array.isArray(diskNames)) {
    return [];
  }

  return diskNames
    .map((disk) => (typeof disk === 'string' ? disk.trim() : ''))
    .filter((disk): disk is string => disk.length > 0);
};

const fetchDiskNames = async (): Promise<string[]> => {
  const { data } = await axiosInstance.get<DiskNamesResponse>(
    '/api/disk/names/'
  );

  if (data.ok === false) {
    const message =
      typeof data.error === 'string' && data.error.trim().length > 0
        ? data.error
        : DEFAULT_DISK_NAME_ERROR_MESSAGE;
    throw new Error(message);
  }

  return normalizeDiskNames(data.data?.disk_names);
};

const fetchDiskPartitionStatus = async (diskName: string): Promise<boolean> => {
  const endpoint = `/api/disk/${encodeURIComponent(diskName)}/has-partitions/`;
  const { data } = await axiosInstance.get<DiskPartitionStatusResponse>(
    endpoint
  );

  if (data.ok === false) {
    const message =
      typeof data.error === 'string' && data.error.trim().length > 0
        ? data.error
        : DEFAULT_PARTITION_STATUS_ERROR_MESSAGE;
    throw new Error(message);
  }

  return Boolean(data.data?.has_partitions);
};

const fetchPartitionedDisks = async (): Promise<string[]> => {
  const diskNames = await fetchDiskNames();

  if (diskNames.length === 0) {
    return [];
  }

  const disksWithPartitions = await Promise.all(
    diskNames.map(async (diskName) => {
      const hasPartitions = await fetchDiskPartitionStatus(diskName);
      return hasPartitions ? diskName : null;
    })
  );

  return Array.from(
    new Set(disksWithPartitions.filter((diskName): diskName is string => !!diskName))
  );
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

export const usePartitionedDisks = (options?: UseDiskOptions) => {
  return useQuery<string[], Error>({
    queryKey: ['disk', 'partitioned'],
    queryFn: fetchPartitionedDisks,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: Boolean(options?.refetchInterval),
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
  });
};