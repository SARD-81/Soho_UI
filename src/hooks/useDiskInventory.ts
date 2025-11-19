import { useQueries, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type {
  DiskDetailResponse,
  DiskInventoryItem,
  DiskInventoryResponse,
} from '../@types/disk';
import axiosInstance from '../lib/axiosInstance';

const DEFAULT_INVENTORY_ERROR_MESSAGE = 'امکان دریافت اطلاعات دیسک‌ها وجود ندارد.';
const DEFAULT_DETAIL_ERROR_MESSAGE = 'امکان دریافت جزئیات دیسک وجود ندارد.';

const normalizeErrorMessage = (message: string | null | undefined, fallback: string) => {
  const normalized = String(message ?? '').trim();
  return normalized.length > 0 ? normalized : fallback;
};

const fetchDiskInventory = async (): Promise<DiskInventoryItem[]> => {
  const { data } = await axiosInstance.get<DiskInventoryResponse>('/api/disk/');

  if (data.ok === false) {
    throw new Error(normalizeErrorMessage(data.error, DEFAULT_INVENTORY_ERROR_MESSAGE));
  }

  return Array.isArray(data.data) ? data.data : [];
};

const fetchDiskDetail = async (diskName: string): Promise<DiskInventoryItem | null> => {
  const normalizedDiskName = diskName.trim();

  if (!normalizedDiskName) {
    return null;
  }

  const { data } = await axiosInstance.get<DiskDetailResponse>(
    `/api/disk/${encodeURIComponent(normalizedDiskName)}/`
  );

  if (data.ok === false) {
    throw new Error(normalizeErrorMessage(data.error, DEFAULT_DETAIL_ERROR_MESSAGE));
  }

  return data.data ?? null;
};

export const useDiskInventory = () =>
  useQuery<DiskInventoryItem[], Error>({
    queryKey: ['disk', 'inventory'],
    queryFn: fetchDiskInventory,
    select: (items) =>
      [...items].sort((a, b) => a.disk.localeCompare(b.disk, 'fa-IR', { sensitivity: 'base' })),
    refetchInterval: 30000,
    refetchOnWindowFocus: false,
  });

export interface DiskDetailItemState {
  diskName: string;
  detail: DiskInventoryItem | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
}

export const useDiskDetails = (diskNames: string[]): DiskDetailItemState[] => {
  const queries = useQueries({
    queries: diskNames.map((diskName): UseQueryOptions<DiskInventoryItem | null, Error> => ({
      queryKey: ['disk', 'detail', diskName],
      queryFn: () => fetchDiskDetail(diskName),
      enabled: diskName.trim().length > 0,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    })),
  });

  return diskNames.map((diskName, index) => {
    const query = queries[index];

    return {
      diskName,
      detail: query?.data ?? null,
      isLoading: query?.isLoading ?? false,
      isFetching: query?.isFetching ?? false,
      error: (query?.error as Error) ?? null,
    };
  });
};