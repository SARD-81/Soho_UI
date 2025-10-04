import { useQuery } from '@tanstack/react-query';
import type { FileSystemApiResponse } from '../@types/filesystem';
import axiosInstance from '../lib/axiosInstance';

const FILESYSTEM_LIST_ENDPOINT = '/api/filesystem/';

const normalizeMountpoints = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const mountpoints = raw.reduce<string[]>((acc, entry) => {
    if (entry && typeof entry === 'object') {
      const mountpoint = (entry as { mountpoint?: unknown }).mountpoint;

      if (typeof mountpoint === 'string') {
        const trimmed = mountpoint.trim();

        if (trimmed.length > 0 && !acc.includes(trimmed)) {
          acc.push(trimmed);
        }
      }
    }

    return acc;
  }, []);

  return mountpoints.sort((a, b) => a.localeCompare(b, 'fa'));
};

const fetchFilesystemMountpoints = async (): Promise<string[]> => {
  const response = await axiosInstance.get<FileSystemApiResponse>(
    FILESYSTEM_LIST_ENDPOINT
  );

  const payload = response.data;
  return normalizeMountpoints(payload?.data);
};

interface UseFilesystemMountpointsOptions {
  enabled?: boolean;
}

export const useFilesystemMountpoints = ({
  enabled = true,
}: UseFilesystemMountpointsOptions = {}) =>
  useQuery<string[], Error>({
    queryKey: ['filesystem-mountpoints'],
    queryFn: fetchFilesystemMountpoints,
    staleTime: 15000,
    enabled,
  });

export type UseFilesystemMountpointsReturn = ReturnType<
  typeof useFilesystemMountpoints
>;
