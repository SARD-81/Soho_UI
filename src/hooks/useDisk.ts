import axios from 'axios';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  DiskDetailResponse,
  DiskNamesResponse,
  DiskPartitionStatusResponse,
  DiskResponse,
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

const normalizeDiskNames = (diskNames: unknown): string[] => {
  if (!Array.isArray(diskNames)) {
    return [];
  }

  return diskNames
    .map((disk) => (typeof disk === 'string' ? disk.trim() : ''))
    .filter((disk): disk is string => disk.length > 0);
};

const fetchWithTrailingSlashFallback = async <T>(url: string) => {
  try {
    const { data } = await axiosInstance.get<T>(url);
    return data;
  } catch (error) {
    const isTrailingSlashRequest = url.endsWith('/');
    if (
      isTrailingSlashRequest &&
      axios.isAxiosError(error) &&
      error.response?.status === 404
    ) {
      const fallbackUrl = url.replace(/\/+$/, '');
      const { data } = await axiosInstance.get<T>(fallbackUrl);
      return data;
    }

    throw error;
  }
};

const fetchDiskNames = async (): Promise<string[]> => {
  const data = await fetchWithTrailingSlashFallback<DiskNamesResponse>(
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

  try {
    const data = await fetchWithTrailingSlashFallback<DiskPartitionStatusResponse>(
      endpoint
    );

    if (data.ok === false) {
      const message =
        typeof data.error === 'string' && data.error.trim().length > 0
          ? data.error
          : DEFAULT_PARTITION_STATUS_ERROR_MESSAGE;
      throw new Error(message);
    }

    return Boolean(!data.data?.has_partitions);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }

    throw error;
  }
};

const DEFAULT_DISK_DETAIL_ERROR_MESSAGE =
  'امکان دریافت جزئیات دیسک وجود ندارد.';

const fetchDiskWwn = async (diskName: string): Promise<string | null> => {
  const endpoint = `/api/disk/${encodeURIComponent(diskName)}/`;

  try {
    const data = await fetchWithTrailingSlashFallback<DiskDetailResponse>(
      endpoint
    );

    if (data.ok === false) {
      const message =
        typeof data.error === 'string' && data.error.trim().length > 0
          ? data.error
          : DEFAULT_DISK_DETAIL_ERROR_MESSAGE;
      throw new Error(message);
    }

    const wwn = data.data?.wwn ?? data.data?.wwid ?? null;

    if (typeof wwn !== 'string') {
      return null;
    }

    const trimmed = wwn.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export interface PartitionedDiskInfo {
  name: string;
  path: string;
  wwn: string | null;
}

const normalizeDiskPath = (diskName: string) => {
  const trimmedName = diskName.trim();
  if (!trimmedName) {
    return '';
  }

  return trimmedName.startsWith('/dev/') ? trimmedName : `/dev/${trimmedName}`;
};

const fetchPartitionedDisks = async (): Promise<PartitionedDiskInfo[]> => {
  const diskNames = await fetchDiskNames();

  if (diskNames.length === 0) {
    return [];
  }

  const disksWithPartitions = await Promise.all(
    diskNames.map(async (diskName) => {
      try {
        const hasPartitions = await fetchDiskPartitionStatus(diskName);
        return hasPartitions ? diskName : null;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null;
        }

        throw error;
      }
    })
  );

  const filteredNames = disksWithPartitions.filter(
    (diskName): diskName is string => !!diskName
  );

  if (filteredNames.length === 0) {
    return [];
  }

  const uniquePaths = new Map<string, PartitionedDiskInfo>();

  await Promise.all(
    filteredNames.map(async (diskName) => {
      const normalizedPath = normalizeDiskPath(diskName);
      if (!normalizedPath || uniquePaths.has(normalizedPath)) {
        return;
      }

      const wwn = await fetchDiskWwn(diskName);

      uniquePaths.set(normalizedPath, {
        name: diskName.trim(),
        path: normalizedPath,
        wwn,
      });
    })
  );

  return Array.from(uniquePaths.values());
};

interface UseDiskOptions {
  refetchInterval?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

export const useDisk = (options?: UseDiskOptions) => {
  const isEnabled = options?.enabled ?? true;

  const query = useQuery<DiskResponse, Error>({
    queryKey: ['disk'],
    queryFn: fetchDisk,
    refetchInterval: options?.refetchInterval ?? 1000,
    refetchIntervalInBackground: true,
    enabled: isEnabled,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  });

  useEffect(() => {
    if (isEnabled) {
      query.refetch();
    }
  }, [isEnabled, query]);

  return query;
};

export const usePartitionedDisks = (options?: UseDiskOptions) => {
  return useQuery<PartitionedDiskInfo[], Error>({
    queryKey: ['disk', 'partitioned'],
    queryFn: fetchPartitionedDisks,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: Boolean(options?.refetchInterval),
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: false,
  });
};