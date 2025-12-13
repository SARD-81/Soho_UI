import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../lib/axiosInstance';

const FILESYSTEM_LIST_ENDPOINT = '/api/filesystem/filesystems/';

const normalizeMountpoints = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const mountpoints = raw
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);

  return Array.from(new Set(mountpoints)).sort((a, b) =>
    a.localeCompare(b, 'fa')
  );
};

const fetchFilesystemMountpoints = async (): Promise<string[]> => {
  const response = await axiosInstance.get(FILESYSTEM_LIST_ENDPOINT, {
    params: { contain_poolname: false, detail: false },
  });

  const payload = response.data as { data?: unknown };
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